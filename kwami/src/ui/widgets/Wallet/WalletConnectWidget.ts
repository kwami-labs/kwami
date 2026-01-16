import type { ConnectedWallet } from '../../../apps/wallet/WalletConnector';
import { getWalletConnector } from '../../../apps/wallet/WalletConnector';
import { createButton as createGlassButton, type ButtonContent } from '../../primitives/Button';
import { createPopover as createGlassPopover } from '../../primitives/Popover';
import { createIcon } from '../../primitives/Icon';
// import type { GlassContent } from '../../legacy/types'; // Removed
type GlassContent = ButtonContent; // Alias for compatibility with internal code
import type {
  WalletConnectWidgetConnector,
  WalletConnectWidgetHandle,
  WalletConnectWidgetOptions,
  WalletTrackedToken,
} from './types';
import { createDivider } from './utils';
import { MAINNET_USDC_MINT, DEVNET_USDC_MINT, TESTNET_USDC_MINT } from './constants';
import { WIDGET_STYLES } from './styles';
import { createReactiveState, setError as setErrorState, type ExtendedWidgetState } from './state-manager';
import { setButtonLabelDisconnected, setButtonLabelConnected, rebuildWalletButtons, rebuildActions } from './ui-builders';
import {
  refreshKwamiNfts as refreshKwamiNftsFn,
  renderNftsSection as renderNftsSectionFn,
  handleNftLogin as handleNftLoginFn,
  transformToAvatar as transformToAvatarFn,
  revertFromAvatar as revertFromAvatarFn,
  type NftManagerContext,
} from './nft-manager';
import {
  refresh as refreshFn,
  connect as connectFn,
  disconnect as disconnectFn,
  refreshBalances as refreshBalancesFn,
  type WalletOperationsContext,
} from './wallet-operations';
import {
  showNetworkChooser as showNetworkChooserFn,
  showAddressChooser as showAddressChooserFn,
  positionAndShowPopover,
} from './popover-helpers';

export function createWalletConnectWidget(options: WalletConnectWidgetOptions = {}): WalletConnectWidgetHandle {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('createWalletConnectWidget can only be used in a browser environment');
  }

  const wallet: WalletConnectWidgetConnector = options.wallet ?? (getWalletConnector() as unknown as WalletConnectWidgetConnector);
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

  // Inject Styles
  if (!document.getElementById('kwami-widget-styles')) {
    const style = document.createElement('style');
    style.id = 'kwami-widget-styles';
    style.textContent = WIDGET_STYLES;
    document.head.appendChild(style);
  }

  let applyStateToUi: () => void;
  let renderPending = false;
  const triggerRender = () => {
    if (renderPending) return;
    renderPending = true;
    requestAnimationFrame(() => {
      renderPending = false;
      if (applyStateToUi) applyStateToUi();
    });
  };

  const state: ExtendedWidgetState = createReactiveState(triggerRender);
  let refreshTimer: ReturnType<typeof setInterval> | null = null;
  let nftLoadOffset = 0;
  let isLoadingMoreNfts = false;
  let allNftsLoaded = false;
  let lastNftFetchTime = 0;
  const NFT_CACHE_TTL = 60 * 1000; // 1 minute cache
  let animationCleanup: (() => void) | null = null;

  // DOM Elements
  const root = document.createElement('div');
  root.className = 'kwami-widget-root';

  const connectLabel: GlassContent = options.connectLabel ?? 'Connect Wallet';

  const buttonHandle = createGlassButton({
    label: connectLabel,
    icon: createIcon({ name: 'heroicons:wallet', size: 'sm' }).element,
    variant: 'primary',
    size: 'md',
    className: options.className,
    onClick: () => {
      void open();
    },
  });

  root.appendChild(buttonHandle.element);

  const content = document.createElement('div');
  content.className = 'kwami-popover-content';

  const walletsSection = document.createElement('div');
  walletsSection.className = 'kwami-section-col';

  const walletButtons = document.createElement('div');
  walletButtons.className = 'kwami-wallet-list';

  const actionsSection = document.createElement('div');
  actionsSection.className = 'kwami-section-col';

  const errorBox = document.createElement('div');
  errorBox.className = 'kwami-error-box';

  const nftsSection = document.createElement('div');
  nftsSection.id = 'kwami-nfts-section';
  nftsSection.className = 'kwami-nft-section';
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
  });

  const networkPopover = createGlassPopover({
    header: 'Network',
    content: '',
    width: 260,
    closeOnBlur: true,
    className: 'kwami-wallet-network-popover',
  });

  const addressPopover = createGlassPopover({
    header: 'Address',
    content: '',
    width: 360,
    closeOnBlur: true,
    className: 'kwami-wallet-address-popover',
  });

  // Helper functions
  const setError = (message?: string): void => {
    setErrorState(state, errorBox, message);
  };

  applyStateToUi = (): void => {
    // Update popover header
    if (state.status === 'connected') {
      if (options.nftLoginOptions?.enabled && state.isNftLoggedIn && state.selectedNft) {
        popover.setHeader('Your KWAMI');
      } else if (options.nftLoginOptions?.enabled) {
        popover.setHeader('Your KWAMIs');
      } else {
        popover.setHeader('Your Wallet');
      }
    } else {
      popover.setHeader('Select your favorite wallet');
    }

    // Update button state
    switch (state.status) {
      case 'connecting':
        buttonHandle.setDisabled(true);
        break;
      case 'connected':
        buttonHandle.setDisabled(false);
        if (!state.isNftLoggedIn) {
          setButtonLabelConnected(buttonHandle, state, wallet, options.showBalanceInButton);
        }
        break;
      case 'error':
        buttonHandle.setDisabled(false);
        setButtonLabelDisconnected(buttonHandle, connectLabel);
        break;
      case 'disconnected':
      default:
        buttonHandle.setDisabled(false);
        setButtonLabelDisconnected(buttonHandle, connectLabel);
        break;
    }

    rebuildWalletButtons(state, walletsSection, walletButtons, (walletName) => void connect(walletName));
    rebuildActions(
      state,
      actionsSection,
      wallet,
      currentNetwork,
      trackedTokens,
      options,
      (anchor) => showNetworkChooser(anchor),
      (anchor) => showAddressChooser(anchor),
      () => void refresh(),
      () => void disconnect()
    );
    renderNftsSection();
  };

  // Context objects for extracted modules
  const nftManagerContext: NftManagerContext = {
    state,
    wallet,
    options,
    nftLoadOffset,
    isLoadingMoreNfts,
    allNftsLoaded,
    setError,
    applyStateToUi,
  };

  const walletOperationsContext: WalletOperationsContext = {
    state,
    wallet,
    trackedTokens,
    setError,
    applyStateToUi,
    onConnected: options.onConnected,
    onDisconnected: options.onDisconnected,
    onError: options.onError,
  };

  // Wrapper functions
  const refreshKwamiNfts = async (reset = true): Promise<void> => {
    // If not resetting and we have fresh data, skip fetch
    if (!reset && Date.now() - lastNftFetchTime < NFT_CACHE_TTL && state.kwamiNfts.length > 0) {
      return;
    }

    // Sync state before calling
    nftManagerContext.nftLoadOffset = nftLoadOffset;
    nftManagerContext.isLoadingMoreNfts = isLoadingMoreNfts;
    nftManagerContext.allNftsLoaded = allNftsLoaded;

    // The function will set isLoadingMoreNfts internally and call applyStateToUi
    await refreshKwamiNftsFn(nftManagerContext, reset);

    // Sync state back after calling
    nftLoadOffset = nftManagerContext.nftLoadOffset;
    isLoadingMoreNfts = nftManagerContext.isLoadingMoreNfts;
    allNftsLoaded = nftManagerContext.allNftsLoaded;
    lastNftFetchTime = Date.now();
  };

  const renderNftsSection = (): void => {
    nftManagerContext.nftLoadOffset = nftLoadOffset;
    nftManagerContext.isLoadingMoreNfts = isLoadingMoreNfts;
    nftManagerContext.allNftsLoaded = allNftsLoaded;
    renderNftsSectionFn(nftManagerContext, nftsSection, handleNftLogin);
  };

  const handleNftLogin = (): void => {
    handleNftLoginFn(
      nftManagerContext,
      () => popover.hide(),
      (nft, walletAddress) => {
        const cleanup = transformToAvatarFn(buttonHandle.element, nft);
        animationCleanup = cleanup || null;
        triggerRender();
      }
    );
  };

  const showNetworkChooser = (anchorEl: HTMLElement): void => {
    showNetworkChooserFn(
      anchorEl,
      currentNetwork,
      networkPopover,
      wallet,
      options,
      async (network: string) => {
        currentNetwork = network;
        trackedTokens = resolveDefaultTrackedTokens(currentNetwork);
        await refresh();
      },
      setError
    );
  };

  const showAddressChooser = (anchorEl: HTMLElement): void => {
    showAddressChooserFn(anchorEl, state, wallet, addressPopover);
  };

  const refreshBalances = async (): Promise<void> => {
    await refreshBalancesFn(walletOperationsContext);
  };

  const refresh = async (): Promise<void> => {
    await refreshFn(walletOperationsContext, refreshKwamiNfts);
  };

  const setupRefreshTimer = (): void => {
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
  };

  const clearRefreshTimer = (): void => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  };

  const revertFromAvatar = (): void => {
    revertFromAvatarFn(buttonHandle.element, () => setButtonLabelDisconnected(buttonHandle, connectLabel));
  };

  const connect = async (walletName?: string): Promise<ConnectedWallet | null> => {
    return await connectFn(
      walletOperationsContext,
      walletName,
      buttonHandle,
      refreshBalances,
      refreshKwamiNfts,
      setupRefreshTimer
    );
  };

  const disconnect = async (): Promise<boolean> => {
    return await disconnectFn(walletOperationsContext, clearRefreshTimer, revertFromAvatar, () => {
      // Cleanup animation if any
      if (animationCleanup) {
        animationCleanup();
        animationCleanup = null;
      }
      close();
    });
  };

  const open = async (): Promise<void> => {
    // Show UI immediately
    positionAndShowPopover(buttonHandle.element, popover);

    // Perform soft refresh in background (don't clear existing data)
    void refreshFn(walletOperationsContext, () => refreshKwamiNfts(false));
  };

  const close = (): void => {
    popover.hide();
  };

  const destroy = (): void => {
    close();
    clearRefreshTimer();
    removeWalletEventListeners();
    if (animationCleanup) {
      animationCleanup();
      animationCleanup = null;
    }
    root.remove();
  };

  // Set up wallet event listeners
  const eventListeners: Array<{ event: string; handler: (data?: any) => void }> = [];
  const setupWalletEventListeners = (): void => {
    const walletWithEvents = wallet;
    if (typeof walletWithEvents.on === 'function') {
      const onAccountChange = (data: any) => {
        void refresh().then(() => options.onAccountChange?.(data));
      };
      const onConnect = (data: any) => {
        void refresh();
      };
      const onDisconnect = () => {
        void refresh();
        options.onDisconnected?.();
      };
      const onNetworkChange = (data: any) => {
        currentNetwork = data.network;
        trackedTokens = resolveDefaultTrackedTokens(currentNetwork);
        void refresh().then(() => options.onNetworkChange?.(data));
      };
      const onError = (error: any) => {
        state.status = 'error';
        const message = error instanceof Error ? error.message : 'Unknown error';
        setError(message);
        options.onError?.(error);
      };

      walletWithEvents.on('accountChange', onAccountChange);
      walletWithEvents.on('connect', onConnect);
      walletWithEvents.on('disconnect', onDisconnect);
      walletWithEvents.on('networkChange', onNetworkChange);
      walletWithEvents.on('error', onError);

      eventListeners.push({ event: 'accountChange', handler: onAccountChange });
      eventListeners.push({ event: 'connect', handler: onConnect });
      eventListeners.push({ event: 'disconnect', handler: onDisconnect });
      eventListeners.push({ event: 'networkChange', handler: onNetworkChange });
      eventListeners.push({ event: 'error', handler: onError });
    }
  };

  const removeWalletEventListeners = (): void => {
    const walletWithEvents = wallet;
    if (typeof walletWithEvents.off === 'function') {
      eventListeners.forEach(({ event, handler }) => {
        walletWithEvents.off(event, handler);
      });
    }
    eventListeners.length = 0;
  };

  // Initialize
  setupWalletEventListeners();
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
