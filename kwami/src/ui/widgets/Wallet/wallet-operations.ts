import type { ConnectedWallet } from '../../../apps/wallet/WalletConnector';
import type { ButtonHandle as GlassButtonHandle } from '../../primitives/Button';
import type { WalletConnectWidgetConnector, WalletTrackedToken } from './types';
import type { ExtendedWidgetState } from './state-manager';
import { getWalletKindFallback } from './logos';

export interface WalletOperationsContext {
  state: ExtendedWidgetState;
  wallet: WalletConnectWidgetConnector;
  trackedTokens: WalletTrackedToken[];
  setError: (message?: string) => void;
  applyStateToUi: () => void;
  onConnected?: (wallet: ConnectedWallet) => void;
  onDisconnected?: () => void;
  onError?: (error: unknown) => void;
}

export async function refreshAvailableWallets(
  ctx: WalletOperationsContext
): Promise<void> {
  const detected = await ctx.wallet.detectWallets();

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

  ctx.state.availableWallets = combined.map((w) => ({
    name: w.name,
    installed: w.installed,
    url: w.url,
    kind: w.kind ?? getWalletKindFallback(w.name),
    icon: w.icon,
    readyState: w.readyState,
  }));
}

export async function refreshBalances(
  ctx: WalletOperationsContext
): Promise<void> {
  if (!ctx.wallet.isWalletConnected()) {
    ctx.state.solBalance = null;
    ctx.state.tokenBalancesByMint = {};
    return;
  }

  const pk = ctx.state.selectedPublicKey ?? ctx.wallet.getPublicKey() ?? undefined;

  const [sol, tokens] = await Promise.all([
    ctx.wallet.getSolBalance(pk),
    typeof ctx.wallet.getTokenBalances === 'function'
      ? ctx.wallet.getTokenBalances(pk)
      : Promise.resolve([] as Array<{ mint: string; uiAmount: number; decimals: number }>),
  ]);

  ctx.state.solBalance = sol;

  const byMint: Record<string, number | null> = {};
  for (const t of ctx.trackedTokens) {
    const hit = tokens.find(
      (x: { mint: string; uiAmount: number; decimals: number }) => x.mint?.toLowerCase() === t.mint.toLowerCase(),
    );
    byMint[t.mint] = typeof hit?.uiAmount === 'number' ? hit.uiAmount : null;
  }
  ctx.state.tokenBalancesByMint = byMint;
}

export async function refreshConnectionState(
  ctx: WalletOperationsContext
): Promise<void> {
  if (ctx.wallet.isWalletConnected() && ctx.wallet.getPublicKey()) {
    ctx.state.status = 'connected';
    ctx.state.connectedWallet = {
      publicKey: ctx.wallet.getPublicKey()!,
      name: ctx.state.connectedWalletName ?? (typeof ctx.wallet.getConnectedWalletName === 'function' ? ctx.wallet.getConnectedWalletName() ?? undefined : undefined),
    };

    // Maintain selected address
    if (!ctx.state.selectedPublicKey) {
      ctx.state.selectedPublicKey = ctx.wallet.getPublicKey()!;
    }

    if (typeof ctx.wallet.getAvailablePublicKeys === 'function') {
      ctx.state.availablePublicKeys = ctx.wallet.getAvailablePublicKeys();
    } else {
      ctx.state.availablePublicKeys = [ctx.wallet.getPublicKey()!];
    }
  } else {
    ctx.state.status = 'disconnected';
    ctx.state.connectedWallet = null;
    ctx.state.solBalance = null;
    ctx.state.tokenBalancesByMint = {};
    ctx.state.selectedPublicKey = null;
    ctx.state.availablePublicKeys = [];
    ctx.state.connectedWalletName = null;
    ctx.state.connectingWalletName = undefined;
    ctx.state.kwamiNfts = [];
    ctx.state.selectedNft = null;
    ctx.state.isNftLoggedIn = false;
  }
}

export async function refresh(
  ctx: WalletOperationsContext,
  refreshKwamiNfts?: () => Promise<void>
): Promise<void> {
  try {
    ctx.setError(undefined);
    await refreshConnectionState(ctx);
    await refreshAvailableWallets(ctx);
    if (ctx.state.status === 'connected') {
      await refreshBalances(ctx);
      if (refreshKwamiNfts) {
        await refreshKwamiNfts();
      }
    }
    ctx.applyStateToUi();
  } catch (error) {
    ctx.state.status = 'error';
    const message = error instanceof Error ? error.message : 'Unknown error';
    ctx.setError(message);
    ctx.onError?.(error);
    ctx.applyStateToUi();
  }
}

export async function connect(
  ctx: WalletOperationsContext,
  walletName: string | undefined,
  buttonHandle: GlassButtonHandle,
  refreshBalancesFn: () => Promise<void>,
  refreshKwamiNftsFn: () => Promise<void>,
  setupRefreshTimer: () => void
): Promise<ConnectedWallet | null> {
  try {
    ctx.setError(undefined);
    ctx.state.status = 'connecting';
    ctx.applyStateToUi();

    // Show connecting indicator if not already connected
    if (buttonHandle.element.isConnected) {
      const originalLabel = buttonHandle.element.textContent;
      buttonHandle.setLabel('Connecting...');

      // Restore label after connection attempt completes
      setTimeout(() => {
        if (ctx.state.status !== 'connecting') {
          ctx.applyStateToUi();
        }
      }, 100);
    }

    const connected = await ctx.wallet.connect(walletName);
    if (!connected) {
      ctx.state.status = 'disconnected';
      ctx.applyStateToUi();
      return null;
    }

    ctx.state.connectedWallet = connected;
    ctx.state.connectedWalletName = connected.name ?? null;
    ctx.state.selectedPublicKey = connected.publicKey;
    ctx.state.status = 'connected';

    // Force loading state immediately to show skeleton
    ctx.state.isLoadingNfts = true;
    ctx.applyStateToUi();

    await refreshBalancesFn();
    await refreshKwamiNftsFn();
    ctx.state.connectingWalletName = undefined;
    ctx.applyStateToUi();
    ctx.onConnected?.(connected);

    setupRefreshTimer();

    return connected;
  } catch (error) {
    ctx.state.status = 'error';
    ctx.state.connectingWalletName = undefined;
    const message = error instanceof Error ? error.message : 'Failed to connect wallet';
    ctx.setError(message);
    ctx.onError?.(error);
    ctx.applyStateToUi();
    return null;
  }
}

export async function disconnect(
  ctx: WalletOperationsContext,
  clearRefreshTimer: () => void,
  revertFromAvatarFn: () => void,
  onClose: () => void
): Promise<boolean> {
  try {
    ctx.setError(undefined);
    const ok = await ctx.wallet.disconnect();
    ctx.state.status = ok ? 'disconnected' : 'error';
    ctx.state.connectedWallet = null;
    ctx.state.solBalance = null;
    ctx.state.tokenBalancesByMint = {};
    ctx.state.selectedPublicKey = null;
    ctx.state.availablePublicKeys = [];
    ctx.state.connectedWalletName = null;
    ctx.state.connectingWalletName = undefined;
    ctx.state.kwamiNfts = [];
    ctx.state.selectedNft = null;
    ctx.state.isNftLoggedIn = false;
    clearRefreshTimer();
    revertFromAvatarFn();
    ctx.applyStateToUi();
    if (ok) {
      ctx.onDisconnected?.();
      onClose();
    }
    return ok;
  } catch (error) {
    ctx.state.status = 'error';
    const message = error instanceof Error ? error.message : 'Failed to disconnect';
    ctx.setError(message);
    ctx.onError?.(error);
    ctx.applyStateToUi();
    return false;
  }
}
