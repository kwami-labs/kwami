import type { GlassContent } from '../../legacy/types';
import type { GlassButtonHandle } from '../../legacy/GlassButton';
import { createGlassButton } from '../../legacy/GlassButton';
import type { WalletConnectWidgetOptions, WalletTrackedToken } from './types';
import type { ExtendedWidgetState } from './state-manager';
import { createDivider, createRow, createText, formatSol, truncateAddress } from './utils';
import { getWalletKindFallback, getWalletLogoSvg, initials } from './logos';
import { renderContent, createInlineSpinner, asClickableValue } from './dom-helpers';

export function setButtonLabelDisconnected(
  buttonHandle: GlassButtonHandle,
  connectLabel: GlassContent
): void {
  if (typeof connectLabel === 'string') {
    buttonHandle.setLabel(connectLabel);
  } else {
    const slot = document.createElement('span');
    renderContent(connectLabel, slot);
    buttonHandle.setLabel(slot);
  }
}

export function setButtonLabelConnected(
  buttonHandle: GlassButtonHandle,
  state: ExtendedWidgetState,
  wallet: any,
  showBalanceInButton?: boolean
): void {
  const key = state.connectedWallet?.publicKey?.toString() ?? wallet.getPublicKey()?.toString() ?? '';
  const short = truncateAddress(key);

  if (showBalanceInButton && typeof state.solBalance === 'number') {
    buttonHandle.setLabel(`${short} • ${formatSol(state.solBalance, 3)} SOL`);
  } else {
    buttonHandle.setLabel(short);
  }
}

export function clearWalletButtons(walletButtons: HTMLElement): void {
  walletButtons.innerHTML = '';
}

export function rebuildWalletButtons(
  state: ExtendedWidgetState,
  walletsSection: HTMLElement,
  walletButtons: HTMLElement,
  onConnect: (walletName: string) => void
): void {
  clearWalletButtons(walletButtons);

  if (state.status === 'connected') {
    walletsSection.innerHTML = '';
    return;
  }

  walletsSection.innerHTML = '';

  if (state.availableWallets.length === 0) {
    const msg = createText('No Solana wallets detected. Install Phantom, Solflare, Backpack, Glow, or Slope.', {
      muted: true,
    });
    msg.style.fontSize = '0.9rem';
    msg.style.padding = '0.5rem';
    msg.style.textAlign = 'center';
    walletsSection.appendChild(msg);
    return;
  }

  walletsSection.appendChild(walletButtons);

  const buildWalletOption = ({ name, installed, url, kind, icon: walletIcon }: (typeof state.availableWallets)[number]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'kwami-wallet-option-btn';

    const icon = document.createElement('div');
    icon.className = 'kwami-wallet-option-icon';

    if (walletIcon && walletIcon.startsWith('data:image/')) {
      const img = document.createElement('img');
      img.src = walletIcon;
      img.alt = `${name} logo`;
      img.loading = 'lazy';
      img.decoding = 'async';
      icon.appendChild(img);
    } else {
      const svg = getWalletLogoSvg(name);
      if (svg) {
        icon.innerHTML = svg;
      } else {
        icon.textContent = initials(name);
        icon.style.fontWeight = '800';
        icon.style.fontSize = '0.78rem';
        icon.style.letterSpacing = '0.08em';
      }
    }

    const meta = document.createElement('div');
    meta.className = 'kwami-wallet-option-meta';

    const nameLine = document.createElement('div');
    nameLine.className = 'kwami-wallet-option-name';
    nameLine.textContent = name;

    const subtitle = document.createElement('div');
    subtitle.className = 'kwami-wallet-option-subtitle';

    const recommended = name.toLowerCase().includes('phantom');
    if (recommended) {
      subtitle.textContent = 'Recommended';
    } else {
      subtitle.style.display = 'none';
    }

    meta.appendChild(nameLine);
    meta.appendChild(subtitle);

    const left = document.createElement('div');
    left.className = 'kwami-wallet-option-left';

    left.appendChild(icon);
    left.appendChild(meta);

    const right = document.createElement('div');
    right.className = 'kwami-wallet-option-right';

    const isConnectingThis = state.status === 'connecting' && state.connectingWalletName?.toLowerCase() === name.toLowerCase();

    const pill = document.createElement('div');
    pill.className = ['kwami-wallet-option-pill', installed ? 'kwami-wallet-option-pill--primary' : '']
      .filter(Boolean)
      .join(' ');

    if (isConnectingThis) {
      pill.textContent = 'Connecting';
      pill.style.opacity = '0.9';
      right.appendChild(createInlineSpinner(14));
      right.appendChild(pill);
    } else {
      pill.textContent = installed ? 'Connect' : url ? 'Install' : 'Not installed';
      right.appendChild(pill);
    }

    button.appendChild(left);
    button.appendChild(right);

    if (!installed && !url) {
      button.disabled = true;
    }

    if (state.status === 'connecting' && !isConnectingThis) {
      button.disabled = true;
      button.style.opacity = '0.6';
      button.style.cursor = 'not-allowed';
    }

    button.addEventListener('click', () => {
      if (installed) {
        state.connectingWalletName = name;
        onConnect(name);
        return;
      }
      if (url) {
        window.open(url, '_blank');
      }
    });

    return button;
  };

  const hotWallets: (typeof state.availableWallets) = [];
  const coldWallets: (typeof state.availableWallets) = [];

  state.availableWallets.forEach((w) => {
    const normalizedKind = w.kind ?? getWalletKindFallback(w.name);
    if (normalizedKind === 'hardware') {
      coldWallets.push(w);
    } else {
      hotWallets.push(w);
    }
  });

  const renderSection = (title: string, wallets: (typeof state.availableWallets)) => {
    if (wallets.length === 0) return;
    const titleNode = createText(title, { muted: true });
    titleNode.className = 'kwami-wallet-list-section-title';
    walletButtons.appendChild(titleNode);
    wallets.forEach((w) => walletButtons.appendChild(buildWalletOption(w)));
  };

  // Hot first (most common for connection), then Cold.
  renderSection('Hot wallets', hotWallets);
  renderSection('Cold wallets', coldWallets);
}

export function rebuildActions(
  state: ExtendedWidgetState,
  actionsSection: HTMLElement,
  wallet: any,
  currentNetwork: string,
  trackedTokens: WalletTrackedToken[],
  options: WalletConnectWidgetOptions,
  onNetworkClick: (anchor: HTMLElement) => void,
  onAddressClick: (anchor: HTMLElement) => void,
  onRefresh: () => void,
  onDisconnect: () => void
): void {
  actionsSection.innerHTML = '';
  actionsSection.style.display = '';

  // If NFT is logged in, show KWAMI info instead of wallet info
  if (options.nftLoginOptions?.enabled && state.status === 'connected' && state.isNftLoggedIn && state.selectedNft) {
    const walletAddress = wallet.getPublicKey()?.toBase58();
    if (!walletAddress) return;

    const info = document.createElement('div');
    info.className = 'kwami-info-container';

    const nameRow = createRow('KWAMI', createText(state.selectedNft.name || 'Unnamed', {}));
    const addressRow = createRow('WALLET', createText(truncateAddress(walletAddress, 6, 4), { mono: true }));

    info.appendChild(nameRow);
    info.appendChild(addressRow);
    info.appendChild(createDivider());

    // Logout button
    const logoutBtn = createGlassButton({
      label: 'Logout',
      icon: '⏻',
      mode: 'outline',
      size: 'md',
      theme: options.theme,
      appearance: { borderRadius: '16px' },
      onClick: onDisconnect,
    });
    logoutBtn.element.style.width = '100%';
    info.appendChild(logoutBtn.element);

    actionsSection.appendChild(info);
    return;
  }

  // If NFT login is enabled but not logged in yet, hide actions (show NFT grid instead)
  if (options.nftLoginOptions?.enabled && state.status === 'connected' && !state.isNftLoggedIn) {
    actionsSection.style.display = 'none';
    return;
  }

  if (state.status === 'connected') {
    const walletName =
      state.connectedWalletName ??
      state.connectedWallet?.name ??
      (typeof wallet.getConnectedWalletName === 'function' ? wallet.getConnectedWalletName() : null) ??
      'Wallet';

    actionsSection.appendChild(createRow('WALLET', createText(walletName, { mono: false })));

    const networkValue = createText(currentNetwork, { mono: true });
    const networkButton = asClickableValue(networkValue, onNetworkClick);
    actionsSection.appendChild(createRow('NETWORK', networkButton));

    const selectedPk = state.selectedPublicKey ?? wallet.getPublicKey();
    const addressStr = selectedPk?.toBase58() ?? '';
    const addrValue = createText(addressStr ? truncateAddress(addressStr, 6, 6) : '—', { mono: true });
    const addrButton = asClickableValue(addrValue, onAddressClick);
    actionsSection.appendChild(createRow('ADDRESS', addrButton));

    const solNode = createText(
      typeof state.solBalance === 'number' ? `${formatSol(state.solBalance, 4)} SOL` : '—',
      { mono: true },
    );
    actionsSection.appendChild(createRow('SOL', solNode));

    // Tracked token balances
    trackedTokens.forEach((t) => {
      const mint = t.mint;
      const v = state.tokenBalancesByMint?.[mint];
      const tokenNode = createText(typeof v === 'number' ? `${v}` : '—', { mono: true });
      actionsSection.appendChild(createRow(t.symbol, tokenNode));
    });

    actionsSection.appendChild(createDivider());

    const row = document.createElement('div');
    row.className = 'kwami-row-actions';

    const refreshBtn = createGlassButton({
      label: 'Refresh',
      icon: '⟳',
      mode: 'ghost',
      size: 'md',
      theme: options.theme,
      appearance: { ...options.appearance, borderRadius: '16px' },
      onClick: onRefresh,
    });
    refreshBtn.element.style.flex = '1';

    const disconnectBtn = createGlassButton({
      label: 'Disconnect',
      icon: '⏻',
      mode: 'outline',
      size: 'md',
      theme: options.theme,
      appearance: { ...options.appearance, borderRadius: '16px' },
      onClick: onDisconnect,
    });
    disconnectBtn.element.style.flex = '1';

    row.appendChild(refreshBtn.element);
    row.appendChild(disconnectBtn.element);
    actionsSection.appendChild(row);

    return;
  }
}
