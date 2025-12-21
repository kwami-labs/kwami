import type { BaseGlassProps, GlassContent } from '../types';
import type { ConnectedWallet } from '../../apps/wallet/WalletConnector';
import type { PublicKey } from '@solana/web3.js';

export type WalletUiStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type WalletDetectedWallet = {
  name: string;
  /**
   * True when the wallet is detected/installed/ready.
   * If omitted, the widget treats presence in the list as installed.
   */
  installed?: boolean;
  /**
   * Optional install URL to open when not installed.
   */
  url?: string;
  /**
   * Optional category label.
   */
  kind?: 'browser' | 'hardware';
  /**
   * Optional icon (usually a data URI from Wallet Standard).
   */
  icon?: string;
  /**
   * Optional freeform ready state label (e.g. "installed", "loadable", "not detected").
   */
  readyState?: string;
};

export interface WalletConnectWidgetConnector {
  detectWallets: () => Promise<WalletDetectedWallet[]>;
  connect: (walletName?: string) => Promise<ConnectedWallet | null>;
  disconnect: () => Promise<boolean>;
  isWalletConnected: () => boolean;
  getPublicKey: () => PublicKey | null;
  getSolBalance: (publicKey?: PublicKey) => Promise<number>;
  getNetwork: () => string;

  // Optional/extended APIs (supported by Kwami's WalletConnector)
  getTokenBalances?: (publicKey?: PublicKey) => Promise<Array<{ mint: string; uiAmount: number; decimals: number }>>;
  switchNetwork?: (network: 'mainnet-beta' | 'devnet' | 'testnet') => Promise<boolean>;
  getAvailablePublicKeys?: () => PublicKey[];
  getConnectedWalletName?: () => string | null;
}

export type WalletTrackedToken = {
  symbol: string;
  /**
   * Mint address for the token. (If you need per-network mints, pass a different widget per network
   * or resolve the mint yourself before passing it here.)
   */
  mint: string;
};

export interface WalletConnectWidgetOptions extends BaseGlassProps {
  /**
   * Additional SPL tokens to show balances for.
   * Defaults to USDC only. (SOL is always shown.)
   */
  trackedTokens?: WalletTrackedToken[];
  /**
   * Wallet connector instance. If omitted, the widget will use Kwami's default getWalletConnector().
   */
  wallet?: WalletConnectWidgetConnector;

  /**
   * Label shown while disconnected.
   */
  connectLabel?: GlassContent;

  /**
   * Whether to show SOL balance in the button label (when connected).
   */
  showBalanceInButton?: boolean;

  /**
   * Auto-refresh SOL balance interval in ms. Set to 0/undefined to disable.
   */
  autoRefreshBalanceMs?: number;

  /**
   * Called after a wallet connects successfully.
   */
  onConnected?: (wallet: ConnectedWallet) => void;

  /**
   * Called after a wallet disconnects.
   */
  onDisconnected?: () => void;

  /**
   * Called when wallet account changes.
   */
  onAccountChange?: (data?: { publicKey: PublicKey }) => void;

  /**
   * Called when network changes.
   */
  onNetworkChange?: (data?: { network: string }) => void;

  /**
   * Called when an error happens (connect / balance / disconnect).
   */
  onError?: (error: unknown) => void;
}

export interface WalletConnectWidgetState {
  status: WalletUiStatus;
  connectedWallet: ConnectedWallet | null;
  solBalance: number | null;
  availableWallets: Array<{
    name: string;
    installed: boolean;
    url?: string;
    kind?: 'browser' | 'hardware';
    icon?: string;
    readyState?: string;
  }>;
  errorMessage?: string;
}

export interface WalletConnectWidgetHandle {
  element: HTMLDivElement;

  /**
   * Programmatically open the wallet popover.
   */
  open: () => Promise<void>;

  /**
   * Close the wallet popover.
   */
  close: () => void;

  /**
   * Attempt to connect. If walletName is omitted, uses the connector default selection.
   */
  connect: (walletName?: string) => Promise<ConnectedWallet | null>;

  /**
   * Disconnect the current wallet.
   */
  disconnect: () => Promise<boolean>;

  /**
   * Refresh available wallets + connection state + balance (if connected).
   */
  refresh: () => Promise<void>;

  /**
   * Current internal state snapshot.
   */
  getState: () => WalletConnectWidgetState;

  /**
   * Clean up listeners/intervals and remove popover if open.
   */
  destroy: () => void;
}
