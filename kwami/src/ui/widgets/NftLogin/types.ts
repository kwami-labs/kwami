import type { KwamiOwnedNft } from '../../../apps/wallet/kwamiNfts';
import type { WalletConnectWidgetConnector } from '../Wallet/types';
import type { BaseGlassProps } from '../../legacy/types';

export type NftLoginState = 'disconnected' | 'connecting' | 'loading-nfts' | 'selecting' | 'confirming' | 'logged-in';

export type AvatarPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface KwamiNftLoginResult {
  walletAddress: string;
  nftMint: string;
  nft: KwamiOwnedNft;
}

export interface KwamiNftLoginOptions extends BaseGlassProps {
  /**
   * Wallet connector instance.
   */
  wallet: WalletConnectWidgetConnector;

  /**
   * Collection mint address to filter NFTs.
   */
  collectionMint?: string;

  /**
   * NFT symbol to filter by.
   */
  symbol?: string;

  /**
   * Number of NFTs to load per batch.
   * @default 20
   */
  batchSize?: number;

  /**
   * Position where avatar appears after login.
   * @default 'top-left'
   */
  avatarPosition?: AvatarPosition;

  /**
   * localStorage key for persisting login.
   * @default 'kwami-nft-login'
   */
  storageKey?: string;

  /**
   * Auto-restore previous login on mount.
   * @default true
   */
  autoRestore?: boolean;

  /**
   * Called when login is confirmed.
   */
  onLogin?: (result: KwamiNftLoginResult) => void;

  /**
   * Called when user logs out.
   */
  onLogout?: () => void;

  /**
   * Called on error.
   */
  onError?: (error: unknown) => void;
}

export interface KwamiNftLoginHandle {
  /**
   * Root element to mount in DOM.
   */
  element: HTMLDivElement;

  /**
   * Programmatically trigger logout.
   */
  logout: () => void;

  /**
   * Get current login state.
   */
  getState: () => {
    state: NftLoginState;
    loginResult: KwamiNftLoginResult | null;
  };

  /**
   * Clean up and remove.
   */
  destroy: () => void;
}

export interface KwamiAvatarOptions extends BaseGlassProps {
  /**
   * Selected NFT data.
   */
  nft: KwamiOwnedNft;

  /**
   * Wallet address to display.
   */
  walletAddress: string;

  /**
   * Position of the avatar.
   * @default 'top-left'
   */
  position?: AvatarPosition;

  /**
   * Avatar size in pixels.
   * @default 48
   */
  size?: number;

  /**
   * Called when logout is clicked.
   */
  onLogout?: () => void;
}

export interface KwamiNftGridOptions extends BaseGlassProps {
  /**
   * NFTs to display.
   */
  nfts: KwamiOwnedNft[];

  /**
   * Currently selected NFT.
   */
  selectedNft: KwamiOwnedNft | null;

  /**
   * Loading more NFTs.
   */
  isLoading?: boolean;

  /**
   * Show login button.
   */
  showLoginButton?: boolean;

  /**
   * Called when an NFT is selected.
   */
  onSelect: (nft: KwamiOwnedNft) => void;

  /**
   * Called when login button is clicked.
   */
  onLogin?: () => void;

  /**
   * Called when scrolled to bottom (for lazy loading).
   */
  onScrollBottom?: () => void;
}
