import type { KwamiNftLoginOptions, KwamiNftLoginHandle, KwamiNftLoginResult, NftLoginState } from './types';
import type { KwamiOwnedNft } from '../../../apps/wallet/kwamiNfts';
import { fetchOwnedKwamiNfts } from '../../../apps/wallet/kwamiNfts';
import { createModal as createGlassModal } from '../../primitives/Modal';
import { createButton as createGlassButton } from '../../primitives/Button';
import { createKwamiNftGrid } from './KwamiNftGrid';
import { createKwamiAvatar } from './KwamiAvatar';
import { animateToCorner, fadeOut } from './animations';
import { createIcon } from '../../primitives/Icon';

export function createKwamiNftLoginPanel(options: KwamiNftLoginOptions): KwamiNftLoginHandle {
  const batchSize = options.batchSize ?? 20;
  const avatarPosition = options.avatarPosition ?? 'top-left';
  const storageKey = options.storageKey ?? 'kwami-nft-login';
  const autoRestore = options.autoRestore ?? true;

  let state: NftLoginState = 'disconnected';
  let nfts: KwamiOwnedNft[] = [];
  let selectedNft: KwamiOwnedNft | null = null;
  let loginResult: KwamiNftLoginResult | null = null;
  let loadedCount = 0;
  let isLoadingMore = false;
  let avatarHandle: ReturnType<typeof createKwamiAvatar> | null = null;

  const root = document.createElement('div');
  root.style.position = 'relative';
  root.style.display = 'inline-block';

  // Connect button (shown when disconnected)
  const connectBtn = createGlassButton({
    label: 'Connect with KWAMI',
    icon: createIcon({ name: 'heroicons:sparkles', size: 'sm' }).element,
    variant: 'primary',
    size: 'lg',
    onClick: () => void handleConnect(),
  });

  root.appendChild(connectBtn.element);

  // Modal for NFT selection
  const modal = createGlassModal({
    header: 'Select your KWAMI',
    content: document.createElement('div'),
    width: 700,
  });

  async function handleConnect() {
    try {
      state = 'connecting';
      updateUI();

      // Connect wallet
      const connected = await options.wallet.connect();
      if (!connected) {
        state = 'disconnected';
        updateUI();
        return;
      }

      // Load NFTs
      state = 'loading-nfts';
      updateUI();
      modal.show();

      await loadNfts();

      state = 'selecting';
      updateUI();
    } catch (error) {
      state = 'disconnected';
      updateUI();
      options.onError?.(error);
    }
  }

  async function loadNfts(offset = 0) {
    if (isLoadingMore) return;

    isLoadingMore = true;
    updateUI();

    try {
      const owner = options.wallet.getPublicKey();
      if (!owner) {
        throw new Error('No wallet connected');
      }

      const batch = await fetchOwnedKwamiNfts({
        connection: options.wallet.getConnection(),
        owner,
        collectionMint: options.collectionMint,
        symbol: options.symbol,
        limit: batchSize,
        offset,
      });

      nfts = [...nfts, ...batch];
      loadedCount = nfts.length;
      isLoadingMore = false;
      updateUI();
    } catch (error) {
      isLoadingMore = false;
      options.onError?.(error);
    }
  }

  function handleNftSelect(nft: KwamiOwnedNft) {
    selectedNft = nft;
    updateUI();
  }

  async function handleLogin() {
    if (!selectedNft) return;

    const walletAddress = options.wallet.getPublicKey()?.toBase58();
    if (!walletAddress) return;

    state = 'confirming';
    updateUI();

    // Save to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify({
        walletAddress,
        nftMint: selectedNft.mint,
        timestamp: Date.now(),
      }));
    }

    loginResult = {
      walletAddress,
      nftMint: selectedNft.mint,
      nft: selectedNft,
    };

    // Animate: Get the selected card element
    const cards = document.querySelectorAll('.kwami-nft-card');
    let selectedCard: HTMLElement | null = null;

    cards.forEach((card) => {
      const img = card.querySelector('img');
      if (img && selectedNft && img.alt === selectedNft.name) {
        selectedCard = card as HTMLElement;
      }
    });

    if (selectedCard) {
      // Clone the card for animation
      const clone = (selectedCard as HTMLElement).cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      const rect = (selectedCard as HTMLElement).getBoundingClientRect();
      clone.style.left = `${rect.left}px`;
      clone.style.top = `${rect.top}px`;
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.zIndex = '10000';
      document.body.appendChild(clone);

      // Fade out modal
      await fadeOut(modal.element);
      modal.hide();

      // Animate clone to corner
      await animateToCorner(clone, avatarPosition, 48);

      // Remove clone
      clone.remove();
    } else {
      modal.hide();
    }

    // Show avatar
    state = 'logged-in';
    connectBtn.element.style.display = 'none';

    avatarHandle = createKwamiAvatar({
      nft: selectedNft,
      walletAddress,
      position: avatarPosition,
      onLogout: handleLogout,
    });

    document.body.appendChild(avatarHandle.element);
    updateUI();

    // Call callback
    options.onLogin?.(loginResult);
  }

  function handleLogout() {
    // Clean up
    if (avatarHandle) {
      avatarHandle.destroy();
      avatarHandle = null;
    }

    // Clear storage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(storageKey);
    }

    // Disconnect wallet
    void options.wallet.disconnect();

    // Reset state
    state = 'disconnected';
    nfts = [];
    selectedNft = null;
    loginResult = null;
    loadedCount = 0;

    connectBtn.element.style.display = '';
    updateUI();

    options.onLogout?.();
  }

  function updateUI() {
    // Update modal content based on state
    const content = document.createElement('div');
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.gap = '1rem';

    if (state === 'connecting') {
      content.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(148,163,184,0.9);">Connecting wallet...</div>';
    } else if (state === 'loading-nfts') {
      content.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(148,163,184,0.9);">Loading your KWAMI NFTs...</div>';
    } else if (state === 'selecting' || state === 'confirming') {
      if (nfts.length === 0) {
        content.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(148,163,184,0.9);">No KWAMI NFTs found in this wallet.</div>';
      } else {
        const grid = createKwamiNftGrid({
          nfts,
          selectedNft,
          isLoading: isLoadingMore,
          showLoginButton: state === 'selecting',
          onSelect: handleNftSelect,
          onLogin: handleLogin,
          onScrollBottom: () => {
            if (!isLoadingMore && nfts.length === loadedCount) {
              void loadNfts(loadedCount);
            }
          },
        });
        content.appendChild(grid);
      }
    }

    modal.setContent(content);
  }

  // Auto-restore previous login
  if (autoRestore && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        // TODO: Restore login if still valid
        // For now, just clear if expired (>7 days)
        if (Date.now() - data.timestamp > 7 * 24 * 60 * 60 * 1000) {
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      // Ignore restore errors
    }
  }

  function destroy() {
    modal.hide();
    if (avatarHandle) {
      avatarHandle.destroy();
    }
    root.remove();
  }

  return {
    element: root,
    logout: handleLogout,
    getState: () => ({ state, loginResult }),
    destroy,
  };
}
