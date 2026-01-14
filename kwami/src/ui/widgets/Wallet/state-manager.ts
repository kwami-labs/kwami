import type { PublicKey } from '@solana/web3.js';
import type { KwamiOwnedNft } from '../../../apps/wallet/kwamiNfts';
import type { WalletConnectWidgetState } from './types';

export interface ExtendedWidgetState extends WalletConnectWidgetState {
  connectingWalletName?: string;
  selectedPublicKey?: PublicKey | null;
  availablePublicKeys?: PublicKey[];
  tokenBalancesByMint?: Record<string, number | null>;
  connectedWalletName?: string | null;
  kwamiNfts: KwamiOwnedNft[];
  candidateNfts?: any[]; // Cached list of all owned NFT candidates (lightweight)
  selectedNft: KwamiOwnedNft | null;
  isLoadingNfts?: boolean;
  isNftLoggedIn?: boolean;
}

export function createReactiveState(
  onChange: () => void
): ExtendedWidgetState {
  const initialState = createInitialState();
  
  return new Proxy(initialState, {
    set(target, prop, value) {
      const result = Reflect.set(target, prop, value);
      if (result) {
        // Debounce or immediate?
        // Immediate is safer for now to match current behavior, but might be chatty.
        // However, usually we want to see the update.
        // There is a risk of "update while rendering" loops if onChange modifies state.
        // But applyStateToUi mostly reads.
        onChange();
      }
      return result;
    }
  });
}

export function createInitialState(): ExtendedWidgetState {
  return {
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
    candidateNfts: undefined,
    selectedNft: null,
    isLoadingNfts: false,
    isNftLoggedIn: false,
  };
}

export function setError(
  state: ExtendedWidgetState,
  errorBox: HTMLElement,
  message?: string
): void {
  state.errorMessage = message;
  if (!message) {
    errorBox.style.display = 'none';
    errorBox.textContent = '';
  } else {
    errorBox.style.display = '';
    errorBox.textContent = message;
  }
}
