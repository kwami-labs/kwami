import type { ConnectedWallet } from '../../apps/wallet/WalletConnector';
import { getWalletConnector } from '../../apps/wallet/WalletConnector';
import { fetchOwnedKwamiNfts, type KwamiOwnedNft } from '../../apps/wallet/kwamiNfts';
import { createGlassButton } from '../components/GlassButton';
import { createGlassPopover } from '../components/GlassPopover';
import type { GlassContent } from '../types';
import type { PublicKey } from '@solana/web3.js';
import type {
  WalletConnectWidgetConnector,
  WalletConnectWidgetHandle,
  WalletConnectWidgetOptions,
  WalletConnectWidgetState,
  WalletTrackedToken,
} from './types';
import { createDivider, createRow, createText, formatSol, truncateAddress } from './utils';
import { getWalletKindFallback, getWalletLogoSvg, initials } from './logos';

function renderContent(slot: GlassContent, target: HTMLElement): void {
  if (typeof slot === 'string') {
    target.textContent = slot;
    return;
  }
  if (slot instanceof Node) {
    target.innerHTML = '';
    target.appendChild(slot);
    return;
  }
  if (Array.isArray(slot)) {
    target.innerHTML = '';
    slot.forEach((node) => node && target.appendChild(node));
    return;
  }
  if (typeof slot === 'function') {
    const result = slot();
    renderContent(result, target);
  }
}

const MAINNET_USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const DEVNET_USDC_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'; // spl-usdc devnet
const TESTNET_USDC_MINT = MAINNET_USDC_MINT; // fallback (testnet often mirrors)

function createInlineSpinner(sizePx = 14): HTMLSpanElement {
  const spinner = document.createElement('span');
  spinner.style.width = `${sizePx}px`;
  spinner.style.height = `${sizePx}px`;
  spinner.style.borderRadius = '999px';
  spinner.style.display = 'inline-block';
  spinner.style.border = '2px solid rgba(148,163,184,0.35)';
  spinner.style.borderTopColor = 'rgba(148,163,184,0.95)';
  spinner.style.animation = 'kwami-spin 0.85s linear infinite';

  // Ensure keyframes exist once.
  const id = 'kwami-wallet-spinner-style';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `@keyframes kwami-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }

  return spinner;
}

function asClickableValue(node: Node, onClick: (anchor: HTMLElement) => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'kwami-wallet-value-button';
  btn.style.background = 'transparent';
  btn.style.border = 'none';
  btn.style.padding = '0';
  btn.style.margin = '0';
  btn.style.cursor = 'pointer';
  btn.style.color = 'inherit';
  btn.style.font = 'inherit';
  btn.style.display = 'inline-flex';
  btn.style.alignItems = 'center';
  btn.style.gap = '0.35rem';
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(btn);
  });
  btn.appendChild(node);
  return btn;
}

export function createWalletConnectWidget(options: WalletConnectWidgetOptions = {}): WalletConnectWidgetHandle {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('createWalletConnectWidget can only be used in a browser environment');
  }

  const wallet: WalletConnectWidgetConnector = options.wallet ?? getWalletConnector();

  // State for current network
  let currentNetwork = wallet.getNetwork();

  const resolveDefaultTrackedTokens = (network: string): WalletTrackedToken[] => {
    if (options.trackedTokens) return options.trackedTokens;
    switch (network) {
      case 'devnet':
        return [{ symbol: 'USDC', mint: DEVNET_USDC_MINT }];
      case 'testnet':
        return [{ symbol: 'USDC', mint: TESTNET_USDC_MINT }];
      case 'mainnet-beta':
      default:
        return [{ symbol: 'USDC', mint: MAINNET_USDC_MINT }];
    }
  };

  let trackedTokens = resolveDefaultTrackedTokens(currentNetwork);

  // Set up wallet event listeners for account changes and other events
  const setupWalletEventListeners = () => {
    // Using duck typing to check if the wallet supports event listening
    const walletWithEvents = wallet as any;
    if (typeof walletWithEvents.on === 'function') {
      walletWithEvents.on('accountChange', (data: any) => {
        void refreshConnectionState().then(() => refreshBalances()).then(() => refreshKwamiNfts()).then(() => applyStateToUi());
        options.onAccountChange?.(data);
      });
      
      walletWithEvents.on('connect', (data: any) => {
        void refreshConnectionState().then(() => refreshBalances()).then(() => refreshKwamiNfts()).then(() => applyStateToUi());
      });
      
      walletWithEvents.on('disconnect', () => {
        refreshConnectionState();
        applyStateToUi();
        options.onDisconnected?.();
      });
      
      walletWithEvents.on('networkChange', (data: any) => {
        currentNetwork = data.network;
        void refreshConnectionState().then(() => refreshBalances()).then(() => refreshKwamiNfts()).then(() => applyStateToUi());
        options.onNetworkChange?.(data);
      });
      
      walletWithEvents.on('error', (error: any) => {
        state.status = 'error';
        const message = error instanceof Error ? error.message : 'Unknown error';
        setError(message);
        options.onError?.(error);
        applyStateToUi();
      });
    }
  };

  const state: WalletConnectWidgetState & {
    connectingWalletName?: string;
    selectedPublicKey?: PublicKey | null;
    availablePublicKeys?: PublicKey[];
    tokenBalancesByMint?: Record<string, number | null>;
    connectedWalletName?: string | null;
    kwamiNfts: KwamiOwnedNft[];
    selectedNft: KwamiOwnedNft | null;
  } = {
    status: 'disconnected',
    connectedWallet: null,
    solBalance: null,
    availableWallets: [],
    errorMessage: undefined,
    connectingWalletName: undefined,
    selectedPublicKey: null,
    availablePublicKeys: [],
    tokenBalancesByMint: {},
    connectedWalletName: null,
    kwamiNfts: [],
    selectedNft: null,
  };

  let refreshTimer: ReturnType<typeof setInterval> | null = null;
  let nftLoadOffset = 0;
  let isLoadingMoreNfts = false;
  let allNftsLoaded = false;

  const root = document.createElement('div');
  root.style.display = 'inline-flex';
  root.style.alignItems = 'center';

  const connectLabel: GlassContent = options.connectLabel ?? 'Connect Wallet';

  const buttonHandle = createGlassButton({
    label: connectLabel,
    icon: '👛',
    mode: 'primary',
    size: 'md',
    theme: options.theme,
    appearance: options.appearance,
    className: options.className,
    onClick: () => {
      void open();
    },
  });

  root.appendChild(buttonHandle.element);

  const content = document.createElement('div');
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.gap = '0.75rem';
  // Extra bottom breathing room (some sections end with tight button rows)
  content.style.paddingBottom = '0.5rem';


  const walletsSection = document.createElement('div');
  walletsSection.style.display = 'flex';
  walletsSection.style.flexDirection = 'column';
  walletsSection.style.gap = '0.5rem';

  const walletButtons = document.createElement('div');
  walletButtons.className = 'kwami-wallet-list';
  walletButtons.style.display = 'flex';
  walletButtons.style.flexDirection = 'column';
  walletButtons.style.gap = '0.55rem';

  const actionsSection = document.createElement('div');
  actionsSection.style.display = 'flex';
  actionsSection.style.flexDirection = 'column';
  actionsSection.style.gap = '0.5rem';

  const errorBox = document.createElement('div');
  errorBox.style.display = 'none';
  errorBox.style.padding = '0.75rem 0.9rem';
  errorBox.style.borderRadius = '14px';
  errorBox.style.border = '1px solid rgba(248,113,113,0.35)';
  errorBox.style.background = 'rgba(248,113,113,0.08)';
  errorBox.style.color = 'rgba(248,113,113,0.95)';
  errorBox.style.fontSize = '0.85rem';

  const nftsSection = document.createElement('div');
  nftsSection.id = 'kwami-nfts-section';
  nftsSection.style.display = 'none';

  content.appendChild(errorBox);
  content.appendChild(createDivider());
  content.appendChild(walletsSection);
  content.appendChild(actionsSection);
  content.appendChild(nftsSection);

  const popover = createGlassPopover({
    header: 'Select your favorite wallet',
    content,
    width: 420,
    closeOnBlur: true,
    className: 'kwami-wallet-popover',
    theme: options.theme,
    appearance: {
      borderRadius: options.appearance?.borderRadius ?? '22px',
      borderWidth: options.appearance?.borderWidth,
      padding: options.appearance?.padding ?? '1.25rem',
      blur: options.appearance?.blur,
    },
  });

  // Secondary popovers for in-place selection
  const networkPopover = createGlassPopover({
    header: 'Network',
    content: '',
    width: 260,
    closeOnBlur: true,
    className: 'kwami-wallet-network-popover',
    theme: options.theme,
    appearance: {
      borderRadius: '18px',
      padding: '1rem',
      blur: options.appearance?.blur,
    },
  });

  const addressPopover = createGlassPopover({
    header: 'Address',
    content: '',
    width: 360,
    closeOnBlur: true,
    className: 'kwami-wallet-address-popover',
    theme: options.theme,
    appearance: {
      borderRadius: '18px',
      padding: '1rem',
      blur: options.appearance?.blur,
    },
  });

  function setError(message?: string): void {
    state.errorMessage = message;
    if (!message) {
      errorBox.style.display = 'none';
      errorBox.textContent = '';
    } else {
      errorBox.style.display = '';
      errorBox.textContent = message;
    }
  }


  function setButtonLabelDisconnected(): void {
    if (typeof connectLabel === 'string') {
      buttonHandle.setLabel(connectLabel);
    } else {
      const slot = document.createElement('span');
      renderContent(connectLabel, slot);
      buttonHandle.setLabel(slot);
    }
  }

  function setButtonLabelConnected(): void {
    const key = state.connectedWallet?.publicKey?.toString() ?? wallet.getPublicKey()?.toString() ?? '';
    const short = truncateAddress(key);

    if (options.showBalanceInButton && typeof state.solBalance === 'number') {
      buttonHandle.setLabel(`${short} • ${formatSol(state.solBalance, 3)} SOL`);
    } else {
      buttonHandle.setLabel(short);
    }
  }


  function clearWalletButtons(): void {
    walletButtons.innerHTML = '';
  }

  function rebuildWalletButtons(): void {
    clearWalletButtons();

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
      walletsSection.appendChild(msg);
      return;
    }

    walletsSection.appendChild(walletButtons);

    const buildWalletOption = ({ name, installed, url, kind, icon: walletIcon }: (typeof state.availableWallets)[number]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = ['kwami-glass-surface', 'kwami-glass-wallet-option'].join(' ');

      const icon = document.createElement('div');
      icon.className = 'kwami-wallet-option-icon';

      if (walletIcon && walletIcon.startsWith('data:image/')) {
        const img = document.createElement('img');
        img.src = walletIcon;
        img.alt = `${name} logo`;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.style.width = '20px';
        img.style.height = '20px';
        img.style.display = 'block';
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
      meta.style.display = 'flex';
      meta.style.flexDirection = 'column';
      meta.style.gap = '0.15rem';
      meta.style.minWidth = '0';

      const nameLine = document.createElement('div');
      nameLine.className = 'kwami-wallet-option-name';
      nameLine.textContent = name;

      const subtitle = document.createElement('div');
      subtitle.className = 'kwami-wallet-option-subtitle';

      const recommended = name.toLowerCase().includes('phantom');
      if (recommended) {
        subtitle.textContent = 'Recommended';
      } else {
        subtitle.textContent = '';
        subtitle.style.display = 'none';
      }

      meta.appendChild(nameLine);
      meta.appendChild(subtitle);

      const left = document.createElement('div');
      left.style.display = 'flex';
      left.style.alignItems = 'center';
      left.style.gap = '0.85rem';
      left.style.minWidth = '0';

      left.appendChild(icon);
      left.appendChild(meta);

      const right = document.createElement('div');
      right.style.display = 'inline-flex';
      right.style.alignItems = 'center';
      right.style.justifyContent = 'flex-end';
      right.style.gap = '0.5rem';

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
          void connect(name);
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

  function showNetworkChooser(anchorEl: HTMLElement): void {
    const networks = ['mainnet-beta', 'devnet', 'testnet'] as const;
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '0.5rem';

    networks.forEach((network) => {
      const isActive = network === currentNetwork;
      const btn = createGlassButton({
        label: network === 'mainnet-beta' ? 'Mainnet' : network.charAt(0).toUpperCase() + network.slice(1),
        mode: isActive ? 'primary' : 'ghost',
        size: 'sm',
        theme: options.theme,
        onClick: async () => {
          try {
            const w: any = wallet as any;
            const fallback = getWalletConnector();
            const switchFn =
              (typeof w.switchNetwork === 'function' && w.switchNetwork.bind(w)) ||
              (typeof (fallback as any).switchNetwork === 'function' && (fallback as any).switchNetwork.bind(fallback));

            if (!switchFn) {
              setError('Network switching is not supported by this connector.');
              return;
            }

            const success = await switchFn(network);
            if (!success) {
              setError('Network switching is not supported by this connector.');
              return;
            }

            currentNetwork = network;
            trackedTokens = resolveDefaultTrackedTokens(currentNetwork);
            await refresh(); // full refresh to re-detect wallets + balances
            options.onNetworkChange?.({ network });
            networkPopover.hide();
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to switch network';
            setError(message);
            options.onError?.(error);
            applyStateToUi();
          }
        },
      });
      btn.element.style.width = '100%';
      container.appendChild(btn.element);
    });

    networkPopover.setContent(container);
    const r = anchorEl.getBoundingClientRect();
    networkPopover.show(r.left + r.width / 2, r.bottom + 10);
  }

  function showAddressChooser(anchorEl: HTMLElement): void {
    const currentPk = state.selectedPublicKey ?? wallet.getPublicKey();
    if (!currentPk) return;

    const msg = document.createElement('div');
    msg.style.fontSize = '0.78rem';
    msg.style.padding = '0.2rem 0.45rem';
    msg.style.textAlign = 'center';
    msg.style.whiteSpace = 'nowrap';
    msg.textContent = 'Copied!';

    void navigator.clipboard.writeText(currentPk.toBase58()).catch(() => {
      msg.textContent = 'Copy failed, copy manually';
    });

    addressPopover.setContent(msg);
    const r = anchorEl.getBoundingClientRect();
    addressPopover.show(r.left + r.width / 2, r.bottom + 6);
    setTimeout(() => addressPopover.hide(), 900);
  }

  function rebuildActions(): void {
    actionsSection.innerHTML = '';
    actionsSection.style.display = '';

    // If NFT is logged in, show KWAMI info instead of wallet info
    if (options.nftLoginOptions?.enabled && state.status === 'connected' && state.selectedNft) {
      const walletAddress = wallet.getPublicKey()?.toBase58();
      if (!walletAddress) return;

      const info = document.createElement('div');
      info.style.display = 'flex';
      info.style.flexDirection = 'column';
      info.style.gap = '0.75rem';
      info.style.padding = '0.5rem 0';

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
        onClick: () => {
          popover.hide();
          void disconnect();
        },
      });
      logoutBtn.element.style.width = '100%';
      info.appendChild(logoutBtn.element);

      actionsSection.appendChild(info);
      return;
    }

    // If NFT login is enabled but not logged in yet, hide actions (show NFT grid instead)
    if (options.nftLoginOptions?.enabled && state.status === 'connected' && !state.selectedNft) {
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
      const networkButton = asClickableValue(networkValue, (anchor) => showNetworkChooser(anchor));
      actionsSection.appendChild(createRow('NETWORK', networkButton));

      const selectedPk = state.selectedPublicKey ?? wallet.getPublicKey();
      const addressStr = selectedPk?.toBase58() ?? '';
      const addrValue = createText(addressStr ? truncateAddress(addressStr, 6, 6) : '—', { mono: true });
      const addrButton = asClickableValue(addrValue, (anchor) => showAddressChooser(anchor));
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
      row.style.display = 'flex';
      row.style.gap = '0.5rem';

      const refreshBtn = createGlassButton({
        label: 'Refresh',
        icon: '⟳',
        mode: 'ghost',
        size: 'md',
        theme: options.theme,
        appearance: { ...options.appearance, borderRadius: '16px' },
        onClick: () => {
          void refresh();
        },
      });
      refreshBtn.element.style.flex = '1';

      const disconnectBtn = createGlassButton({
        label: 'Disconnect',
        icon: '⏻',
        mode: 'outline',
        size: 'md',
        theme: options.theme,
        appearance: { ...options.appearance, borderRadius: '16px' },
        onClick: () => {
          void disconnect();
        },
      });
      disconnectBtn.element.style.flex = '1';

      row.appendChild(refreshBtn.element);
      row.appendChild(disconnectBtn.element);
      actionsSection.appendChild(row);

      return;
    }
  }

  function applyStateToUi(): void {
    // Header changes
    if (state.status === 'connected') {
      // When NFT is logged in, show "Your KWAMI" header
      // Otherwise if NFT login enabled but not logged in, show "Your KWAMIs"
      // Otherwise show "Your Wallet"
      if (options.nftLoginOptions?.enabled && state.selectedNft) {
        popover.setHeader('Your KWAMI');
      } else if (options.nftLoginOptions?.enabled) {
        popover.setHeader('Your KWAMIs');
      } else {
        popover.setHeader('Your Wallet');
      }
    } else {
      popover.setHeader('Select your favorite wallet');
    }

    switch (state.status) {
      case 'connecting':
        buttonHandle.setDisabled(true);
        break;
      case 'connected':
        buttonHandle.setDisabled(false);
        setButtonLabelConnected();
        break;
      case 'error':
        buttonHandle.setDisabled(false);
        setButtonLabelDisconnected();
        break;
      case 'disconnected':
      default:
        buttonHandle.setDisabled(false);
        setButtonLabelDisconnected();
        break;
    }

    rebuildWalletButtons();
    rebuildActions();
    renderNftsSection();
  }

  async function refreshAvailableWallets(): Promise<void> {
    const detected = await wallet.detectWallets();

    // Normalize: if installed is omitted, treat entries as installed (backward compatible)
    const normalizedDetected = detected.map((w) => ({
      name: w.name,
      installed: w.installed ?? true,
      url: w.url,
      kind: w.kind,
      icon: w.icon,
      readyState: w.readyState,
    }));

    // Ranked wallets (most common first)
    const rank = [
      'Phantom',
      'Solflare',
      'Backpack',
      'Glow',
      'Coinbase Wallet',
      'Trust Wallet',
      'Coin98',
      'TokenPocket',
      'MathWallet',
      'SafePal',
      'Coinhub',
      'Slope',
      'Ledger',
      'Trezor',
    ];

    const byName = new Map(normalizedDetected.map((w) => [w.name.toLowerCase(), w] as const));

    const combined = [
      ...rank.map((name) => {
        const existing = byName.get(name.toLowerCase());
        return (
          existing ?? {
            name,
            installed: false,
            url: undefined,
            kind: getWalletKindFallback(name),
            icon: undefined,
            readyState: 'not detected',
          }
        );
      }),
      ...normalizedDetected.filter((w) => !rank.some((k) => k.toLowerCase() === w.name.toLowerCase())),
    ];

    const rankIndex = (name: string) => {
      const idx = rank.findIndex((r) => r.toLowerCase() === name.toLowerCase());
      return idx === -1 ? 999 : idx;
    };

    // Sort: detected/installed wallets first, then by popularity ranking, then alphabetically
    combined.sort((a, b) => {
      const ai = a.installed ? 0 : 1;
      const bi = b.installed ? 0 : 1;
      if (ai !== bi) return ai - bi;

      const ra = rankIndex(a.name);
      const rb = rankIndex(b.name);
      if (ra !== rb) return ra - rb;

      return a.name.localeCompare(b.name);
    });

    state.availableWallets = combined.map((w) => ({
      name: w.name,
      installed: w.installed,
      url: w.url,
      kind: w.kind ?? getWalletKindFallback(w.name),
      icon: w.icon,
      readyState: w.readyState,
    }));
  }

  async function refreshBalances(): Promise<void> {
    if (!wallet.isWalletConnected()) {
      state.solBalance = null;
      state.tokenBalancesByMint = {};
      return;
    }

    const pk = state.selectedPublicKey ?? wallet.getPublicKey() ?? undefined;
    const w: any = wallet as any;

    const [sol, tokens] = await Promise.all([
      wallet.getSolBalance(pk),
      typeof w.getTokenBalances === 'function'
        ? (w.getTokenBalances(pk) as Promise<Array<{ mint: string; uiAmount: number; decimals: number }>>)
        : Promise.resolve([] as Array<{ mint: string; uiAmount: number; decimals: number }>),
    ]);

    state.solBalance = sol;

    const byMint: Record<string, number | null> = {};
    for (const t of trackedTokens) {
      const hit = tokens.find(
        (x: { mint: string; uiAmount: number; decimals: number }) => x.mint?.toLowerCase() === t.mint.toLowerCase(),
      );
      byMint[t.mint] = typeof hit?.uiAmount === 'number' ? hit.uiAmount : null;
    }
    state.tokenBalancesByMint = byMint;
  }

  async function refreshKwamiNfts(reset = true): Promise<void> {
    if (!options.nftLoginOptions?.enabled) {
      state.kwamiNfts = [];
      state.selectedNft = null;
      return;
    }

    if (!wallet.isWalletConnected()) {
      state.kwamiNfts = [];
      return;
    }

    const owner = wallet.getPublicKey();
    if (!owner) {
      state.kwamiNfts = [];
      return;
    }

    if (reset) {
      nftLoadOffset = 0;
      state.kwamiNfts = [];
      allNftsLoaded = false;
    }

    if (isLoadingMoreNfts) return;
    isLoadingMoreNfts = true;
    
    // Trigger UI update to show loading state immediately
    applyStateToUi();

    try {
      const batchSize = options.nftLoginOptions.batchSize ?? 20;
      const initialCount = state.kwamiNfts?.length || 0;
      
      const nfts = await fetchOwnedKwamiNfts({
        connection: wallet.getConnection(),
        owner,
        collectionMint: options.nftLoginOptions.collectionMint,
        symbol: options.nftLoginOptions.symbol,
        limit: batchSize,
        offset: nftLoadOffset,
        onProgress: (nft) => {
          // Add NFT incrementally as it loads (if not already added)
          if (!state.kwamiNfts?.some(n => n.mint === nft.mint)) {
            state.kwamiNfts = [...(state.kwamiNfts || []), nft];
            applyStateToUi();
          }
        },
      });

      if (nfts.length < batchSize) {
        allNftsLoaded = true;
      }

      // Ensure all NFTs are added (in case onProgress didn't fire for some)
      const finalNfts = [...(state.kwamiNfts || [])];
      nfts.forEach(nft => {
        if (!finalNfts.some(n => n.mint === nft.mint)) {
          finalNfts.push(nft);
        }
      });
      state.kwamiNfts = finalNfts;
      nftLoadOffset += nfts.length;

      // Note: We don't auto-restore selectedNft from localStorage here.
      // User must manually select and login each time.
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load NFTs';
      setError(message);
      options.onError?.(error);
    } finally {
      isLoadingMoreNfts = false;
    }
  }

  function selectNft(nft: KwamiOwnedNft): void {
    state.selectedNft = nft;
    const storageKey = options.nftLoginOptions?.storageKey ?? 'kwami-selected-nft';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, nft.mint);
    }
    options.onNftSelected?.(nft);
    applyStateToUi();
  }

  function renderNftsSection(): void {
    const nftsSection = document.getElementById('kwami-nfts-section');
    if (!nftsSection) return;

    if (!options.nftLoginOptions?.enabled || state.status !== 'connected') {
      nftsSection.style.display = 'none';
      return;
    }

    // If NFT is already logged in, don't show the NFT grid (show KWAMI info in actions instead)
    if (state.selectedNft) {
      nftsSection.style.display = 'none';
      return;
    }

    nftsSection.style.display = '';
    nftsSection.innerHTML = '';

    // Show loading state (check loading BEFORE checking if array is empty)
    if (isLoadingMoreNfts && state.kwamiNfts.length === 0) {
      const loading = document.createElement('div');
      loading.style.textAlign = 'center';
      loading.style.padding = '2rem';
      loading.style.color = 'rgba(148,163,184,0.7)';
      loading.style.fontSize = '0.9rem';
      loading.innerHTML = '🔍 Loading your KWAMIs...';
      nftsSection.appendChild(loading);
      return;
    }

    // Show empty state only when NOT loading and no NFTs found
    if (!isLoadingMoreNfts && state.kwamiNfts.length === 0) {
      const empty = createText('No KWAMI NFTs found in this wallet.', { muted: true });
      empty.style.fontSize = '0.85rem';
      empty.style.padding = '1.5rem 0';
      empty.style.textAlign = 'center';
      nftsSection.appendChild(empty);
      return;
    }

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    grid.style.gap = '0.75rem';
    grid.style.maxHeight = '400px';
    grid.style.overflowY = 'auto';
    grid.style.overflowX = 'hidden';
    grid.style.padding = '4px';

    for (const nft of state.kwamiNfts) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'kwami-glass-surface';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = '0.4rem';
      card.style.padding = '0.6rem';
      card.style.cursor = 'pointer';
      card.style.transition = 'all 0.2s';
      const selectedMint = (state.selectedNft as KwamiOwnedNft | null)?.mint;
      card.style.border = selectedMint === nft.mint ? '2px solid rgba(99, 102, 241, 0.6)' : '';

      const img = document.createElement('div');
      img.style.width = '100%';
      img.style.aspectRatio = '1';
      img.style.borderRadius = '8px';
      img.style.overflow = 'hidden';
      img.style.background = 'rgba(148,163,184,0.1)';

      if (nft.image) {
        const imgEl = document.createElement('img');
        imgEl.src = nft.image;
        imgEl.alt = nft.name;
        imgEl.loading = 'lazy';
        imgEl.style.width = '100%';
        imgEl.style.height = '100%';
        imgEl.style.objectFit = 'cover';
        img.appendChild(imgEl);
      }

      const name = createText(nft.name || 'Unnamed', {});
      name.style.fontSize = '0.8rem';
      name.style.fontWeight = '600';
      name.style.textAlign = 'center';
      name.style.overflow = 'hidden';
      name.style.textOverflow = 'ellipsis';
      name.style.whiteSpace = 'nowrap';

      card.appendChild(img);
      card.appendChild(name);

      card.addEventListener('click', () => selectNft(nft));
      grid.appendChild(card);
    }

    // Scroll handler for lazy loading
    grid.addEventListener('scroll', () => {
      if (allNftsLoaded || isLoadingMoreNfts) return;
      
      const { scrollTop, scrollHeight, clientHeight } = grid;
      if (scrollHeight - scrollTop - clientHeight < 100) {
        void refreshKwamiNfts(false).then(() => applyStateToUi());
      }
    });

    nftsSection.appendChild(grid);

    // Loading indicator
    if (isLoadingMoreNfts) {
      const loader = document.createElement('div');
      loader.style.textAlign = 'center';
      loader.style.padding = '1rem';
      loader.style.color = 'rgba(148,163,184,0.7)';
      loader.style.fontSize = '0.85rem';
      loader.textContent = 'Loading more...';
      nftsSection.appendChild(loader);
    }

    // Login button (shown when NFT is selected)
    const selectedNft = state.selectedNft as KwamiOwnedNft | null;
    if (selectedNft) {
      nftsSection.appendChild(createDivider());
      
      const loginBtn = createGlassButton({
        label: `Login with ${selectedNft.name || 'KWAMI'}`,
        icon: '🔐',
        mode: 'primary',
        size: 'md',
        theme: options.theme,
        onClick: () => handleNftLogin(),
      });
      loginBtn.element.style.width = '100%';
      loginBtn.element.style.marginTop = '0.5rem';
      nftsSection.appendChild(loginBtn.element);
    }
  }

  function handleNftLogin(): void {
    if (!state.selectedNft) return;

    const walletAddress = wallet.getPublicKey()?.toBase58();
    if (!walletAddress) return;

    // Close popover
    popover.hide();

    // Transform button to avatar
    transformToAvatar(state.selectedNft, walletAddress);

    // Call callback
    options.onNftLogin?.({
      walletAddress,
      nftMint: state.selectedNft.mint,
      nft: state.selectedNft,
    });
  }

  function transformToAvatar(nft: KwamiOwnedNft, walletAddress: string): void {
    // Add smooth transition
    buttonHandle.element.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Change button to circular avatar style
    buttonHandle.element.style.width = '48px';
    buttonHandle.element.style.height = '48px';
    buttonHandle.element.style.borderRadius = '50%';
    buttonHandle.element.style.padding = '0';
    buttonHandle.element.style.overflow = 'hidden';
    buttonHandle.element.style.minWidth = '48px';

    // Find the button content wrapper
    const btn = buttonHandle.element;
    btn.innerHTML = '';
    
    if (nft.image) {
      const img = document.createElement('img');
      img.src = nft.image;
      img.alt = nft.name;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.display = 'block';
      btn.appendChild(img);
    } else {
      // Fallback: show initials
      const initials = document.createElement('div');
      initials.textContent = (nft.name || 'K').substring(0, 2).toUpperCase();
      initials.style.width = '100%';
      initials.style.height = '100%';
      initials.style.display = 'flex';
      initials.style.alignItems = 'center';
      initials.style.justifyContent = 'center';
      initials.style.fontSize = '18px';
      initials.style.fontWeight = '700';
      initials.style.color = '#fff';
      btn.appendChild(initials);
    }

    // Trigger UI update to show KWAMI info in popover
    applyStateToUi();
  }

  function revertFromAvatar(): void {
    // Add smooth transition
    buttonHandle.element.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Revert button to normal wallet button style
    buttonHandle.element.style.width = '';
    buttonHandle.element.style.height = '';
    buttonHandle.element.style.borderRadius = '';
    buttonHandle.element.style.padding = '';
    buttonHandle.element.style.overflow = '';
    setButtonLabelDisconnected();
  }

  async function refreshConnectionState(): Promise<void> {
    if (wallet.isWalletConnected() && wallet.getPublicKey()) {
      state.status = 'connected';
      state.connectedWallet = {
        publicKey: wallet.getPublicKey()!,
        name: state.connectedWalletName ?? (typeof wallet.getConnectedWalletName === 'function' ? wallet.getConnectedWalletName() ?? undefined : undefined),
      };

      // Maintain selected address
      if (!state.selectedPublicKey) {
        state.selectedPublicKey = wallet.getPublicKey()!;
      }

    const w: any = wallet as any;
    if (typeof w.getAvailablePublicKeys === 'function') {
      state.availablePublicKeys = w.getAvailablePublicKeys();
    } else {
      state.availablePublicKeys = [wallet.getPublicKey()!];
    }
    } else {
      state.status = 'disconnected';
      state.connectedWallet = null;
      state.solBalance = null;
      state.tokenBalancesByMint = {};
      state.selectedPublicKey = null;
      state.availablePublicKeys = [];
      state.connectedWalletName = null;
      state.connectingWalletName = undefined;
      state.kwamiNfts = [];
      state.selectedNft = null;
    }
  }

  async function refresh(): Promise<void> {
    try {
      setError(undefined);
      await refreshConnectionState();
      await refreshAvailableWallets();
      if (state.status === 'connected') {
        await refreshBalances();
        await refreshKwamiNfts();
      }
      applyStateToUi();
    } catch (error) {
      state.status = 'error';
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(message);
      options.onError?.(error);
      applyStateToUi();
    }
  }

  async function connect(walletName?: string): Promise<ConnectedWallet | null> {
    try {
      setError(undefined);
      state.status = 'connecting';
      applyStateToUi();
      
      // Show connecting indicator if not already connected
      if (buttonHandle.element.isConnected) {
        const originalLabel = buttonHandle.element.textContent;
        buttonHandle.setLabel('Connecting...');
        
        // Restore label after connection attempt completes
        setTimeout(() => {
          if (state.status !== 'connecting') {
            applyStateToUi();
          }
        }, 100);
      }

      const connected = await wallet.connect(walletName);
      if (!connected) {
        state.status = 'disconnected';
        applyStateToUi();
        return null;
      }

      state.connectedWallet = connected;
      state.connectedWalletName = connected.name ?? null;
      state.selectedPublicKey = connected.publicKey;
      state.status = 'connected';
      await refreshBalances();
      await refreshKwamiNfts();
      state.connectingWalletName = undefined;
      applyStateToUi();
      options.onConnected?.(connected);

      if (options.autoRefreshBalanceMs && options.autoRefreshBalanceMs > 0) {
        if (refreshTimer) clearInterval(refreshTimer);
        refreshTimer = setInterval(() => {
          void refreshBalances()
            .then(() => applyStateToUi())
            .catch((error) => {
              state.status = 'error';
              const message = error instanceof Error ? error.message : 'Failed to refresh balance';
              setError(message);
              options.onError?.(error);
              applyStateToUi();
            });
        }, options.autoRefreshBalanceMs);
      }

      return connected;
    } catch (error) {
      state.status = 'error';
      state.connectingWalletName = undefined;
      const message = error instanceof Error ? error.message : 'Failed to connect wallet';
      setError(message);
      options.onError?.(error);
      applyStateToUi();
      return null;
    }
  }

  async function disconnect(): Promise<boolean> {
    try {
      setError(undefined);
      const ok = await wallet.disconnect();
      state.status = ok ? 'disconnected' : 'error';
      state.connectedWallet = null;
      state.solBalance = null;
      state.tokenBalancesByMint = {};
      state.selectedPublicKey = null;
      state.availablePublicKeys = [];
      state.connectedWalletName = null;
      state.connectingWalletName = undefined;
      state.kwamiNfts = [];
      state.selectedNft = null;
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
      revertFromAvatar();
      applyStateToUi();
      if (ok) {
        options.onDisconnected?.();
        close();
      }
      return ok;
    } catch (error) {
      state.status = 'error';
      const message = error instanceof Error ? error.message : 'Failed to disconnect';
      setError(message);
      options.onError?.(error);
      applyStateToUi();
      return false;
    }
  }

  function positionAndShowPopover(): void {
    const rect = buttonHandle.element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.bottom + 14;
    popover.show(x, y);
  }

  async function open(): Promise<void> {
    await refresh();
    positionAndShowPopover();
  }

  function close(): void {
    popover.hide();
  }

  function destroy(): void {
    close();
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
    root.remove();
  }

  // Set up event listeners
  setupWalletEventListeners();
  
  // initial state
  void refresh();

  return {
    element: root,
    open,
    close,
    connect,
    disconnect,
    refresh,
    getState: () => ({ ...state, availableWallets: [...state.availableWallets] }),
    destroy,
  };
}
