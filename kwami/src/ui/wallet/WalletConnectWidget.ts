import type { ConnectedWallet } from '../../apps/wallet/WalletConnector';
import { getWalletConnector } from '../../apps/wallet/WalletConnector';
import { createGlassButton } from '../components/GlassButton';
import { createGlassPopover } from '../components/GlassPopover';
import type { GlassContent } from '../types';
import type {
  WalletConnectWidgetConnector,
  WalletConnectWidgetHandle,
  WalletConnectWidgetOptions,
  WalletConnectWidgetState,
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

export function createWalletConnectWidget(options: WalletConnectWidgetOptions = {}): WalletConnectWidgetHandle {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('createWalletConnectWidget can only be used in a browser environment');
  }

  const wallet: WalletConnectWidgetConnector = options.wallet ?? getWalletConnector();

  const state: WalletConnectWidgetState = {
    status: 'disconnected',
    connectedWallet: null,
    solBalance: null,
    availableWallets: [],
    errorMessage: undefined,
  };

  let refreshTimer: ReturnType<typeof setInterval> | null = null;

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

  content.appendChild(errorBox);
  content.appendChild(createDivider());
  content.appendChild(walletsSection);
  content.appendChild(actionsSection);

  const popover = createGlassPopover({
    header: 'Select your favorite Solana wallet',
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
      walletsSection.appendChild(createText('Connected wallet', { muted: true }));
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

      const pill = document.createElement('div');
      pill.className = ['kwami-wallet-option-pill', installed ? 'kwami-wallet-option-pill--primary' : '']
        .filter(Boolean)
        .join(' ');
      pill.textContent = installed ? 'Connect' : url ? 'Install' : 'Not installed';

      button.appendChild(left);
      button.appendChild(pill);

      if (!installed && !url) {
        button.disabled = true;
      }

      button.addEventListener('click', () => {
        if (installed) {
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

  function rebuildActions(): void {
    actionsSection.innerHTML = '';

    if (state.status === 'connected') {
      const pubkey = state.connectedWallet?.publicKey?.toString() ?? wallet.getPublicKey()?.toString() ?? '';
      const addressNode = createText(truncateAddress(pubkey, 6, 6), { mono: true });
      actionsSection.appendChild(createRow('Address', addressNode));

      const solNode = createText(
        typeof state.solBalance === 'number' ? `${formatSol(state.solBalance, 4)} SOL` : '—',
        { mono: true },
      );
      actionsSection.appendChild(createRow('SOL', solNode));

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

  async function refreshBalance(): Promise<void> {
    if (!wallet.isWalletConnected()) {
      state.solBalance = null;
      return;
    }
    const sol = await wallet.getSolBalance();
    state.solBalance = sol;
  }

  async function refreshConnectionState(): Promise<void> {
    if (wallet.isWalletConnected() && wallet.getPublicKey()) {
      state.status = 'connected';
      state.connectedWallet = {
        publicKey: wallet.getPublicKey()!,
      };
    } else {
      state.status = 'disconnected';
      state.connectedWallet = null;
      state.solBalance = null;
    }
  }

  async function refresh(): Promise<void> {
    try {
      setError(undefined);
      await refreshConnectionState();
      await refreshAvailableWallets();
      if (state.status === 'connected') {
        await refreshBalance();
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

      const connected = await wallet.connect(walletName);
      if (!connected) {
        state.status = 'disconnected';
        applyStateToUi();
        return null;
      }

      state.connectedWallet = connected;
      state.status = 'connected';
      await refreshBalance();
      applyStateToUi();
      options.onConnected?.(connected);

      if (options.autoRefreshBalanceMs && options.autoRefreshBalanceMs > 0) {
        if (refreshTimer) clearInterval(refreshTimer);
        refreshTimer = setInterval(() => {
          void refreshBalance()
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
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
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
