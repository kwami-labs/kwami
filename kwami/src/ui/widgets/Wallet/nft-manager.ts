import type { KwamiOwnedNft } from '../../../apps/wallet/kwamiNfts';
import { findNftCandidates, hydrateNftBatch } from '../../../apps/wallet/kwamiNfts';
import { createGlassButton } from '../../legacy/GlassButton';
import type { WalletConnectWidgetOptions } from './types';
import type { ExtendedWidgetState } from './state-manager';
import { createDivider, createText } from './utils';

export interface NftManagerContext {
  state: ExtendedWidgetState;
  wallet: any;
  options: WalletConnectWidgetOptions;
  nftLoadOffset: number;
  isLoadingMoreNfts: boolean;
  allNftsLoaded: boolean;
  setError: (message?: string) => void;
  applyStateToUi: () => void;
}

export async function refreshKwamiNfts(
  ctx: NftManagerContext,
  reset = true
): Promise<void> {
  if (!ctx.options.nftLoginOptions?.enabled) {
    ctx.state.kwamiNfts = [];
    ctx.state.selectedNft = null;
    return;
  }

  if (!ctx.wallet.isWalletConnected()) {
    ctx.state.kwamiNfts = [];
    return;
  }

  const owner = ctx.wallet.getPublicKey();
  if (!owner) {
    ctx.state.kwamiNfts = [];
    return;
  }

  if (reset) {
    ctx.nftLoadOffset = 0;
    ctx.state.kwamiNfts = [];
    ctx.allNftsLoaded = false;
  }

  if (ctx.isLoadingMoreNfts) return;
  ctx.isLoadingMoreNfts = true;
  ctx.state.isLoadingNfts = true;
  
  // Trigger UI update to show loading state immediately
  ctx.applyStateToUi();

  try {
    // Add a small delay to ensure the loading spinner is visible
    if (reset) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Step 1: Discover all owned NFTs (lightweight) if not already cached
    if (reset || !ctx.state.candidateNfts) {
      ctx.state.candidateNfts = await findNftCandidates({
        connection: ctx.wallet.getConnection(),
        owner,
        collectionMint: ctx.options.nftLoginOptions.collectionMint,
        symbol: ctx.options.nftLoginOptions.symbol,
      });
      ctx.nftLoadOffset = 0;
    }

    const batchSize = ctx.options.nftLoginOptions.batchSize ?? 8;
    const candidates = ctx.state.candidateNfts || [];
    
    // Step 2: Slice the next batch
    const slice = candidates.slice(ctx.nftLoadOffset, ctx.nftLoadOffset + batchSize);
    
    // Step 3: Hydrate metadata (JSON fetch) for the batch
    // We add a small delay between fetches to be gentle
    const newNfts = await hydrateNftBatch(slice, 200);

    if (slice.length < batchSize) {
      ctx.allNftsLoaded = true;
    }

    // Step 4: Update state
    if (reset) {
      ctx.state.kwamiNfts = newNfts;
    } else {
      // Append new NFTs
      const existingMints = new Set(ctx.state.kwamiNfts.map(n => n.mint));
      const filteredNew = newNfts.filter(n => !existingMints.has(n.mint));
      ctx.state.kwamiNfts = [...ctx.state.kwamiNfts, ...filteredNew];
    }
    
    ctx.nftLoadOffset += slice.length;

    // If we have processed all candidates, mark as loaded
    if (ctx.nftLoadOffset >= candidates.length) {
      ctx.allNftsLoaded = true;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load NFTs';
    ctx.setError(message);
    ctx.options.onError?.(error);
  } finally {
    ctx.isLoadingMoreNfts = false;
    ctx.state.isLoadingNfts = false;
    ctx.applyStateToUi();
  }
}

export function selectNft(
  ctx: NftManagerContext,
  nft: KwamiOwnedNft
): void {
  ctx.state.selectedNft = nft;
  const storageKey = ctx.options.nftLoginOptions?.storageKey ?? 'kwami-selected-nft';
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(storageKey, nft.mint);
  }
  ctx.options.onNftSelected?.(nft);
  ctx.applyStateToUi();
}

export function renderNftsSection(
  ctx: NftManagerContext,
  nftsSection: HTMLElement,
  onNftLogin: () => void
): void {
  if (!ctx.options.nftLoginOptions?.enabled || ctx.state.status !== 'connected') {
    nftsSection.style.display = 'none';
    return;
  }

  // If NFT is logged in, hide the grid
  if (ctx.state.isNftLoggedIn) {
    nftsSection.style.display = 'none';
    return;
  }

  nftsSection.style.display = '';

  // Show full-size skeleton loader only when NO NFTs are loaded yet
  if (ctx.state.isLoadingNfts && ctx.state.kwamiNfts.length === 0) {
    nftsSection.innerHTML = ''; // Clear previous content (e.g. empty state)
    const loading = document.createElement('div');
    loading.className = 'kwami-nft-grid'; // Reuse grid layout

    // Create 8 skeleton cards
    for (let i = 0; i < 8; i++) {
      loading.appendChild(createSkeletonCard());
    }
    // injectSkeletonStyles(); // Handled by global CSS now
    nftsSection.appendChild(loading);
    return;
  }

  // Show empty state only when NOT loading and no NFTs found
  if (!ctx.state.isLoadingNfts && ctx.state.kwamiNfts.length === 0) {
    nftsSection.innerHTML = ''; // Clear previous content
    const empty = createText('No KWAMI NFTs found in this wallet.', { muted: true });
    empty.style.fontSize = '0.85rem';
    empty.style.padding = '1.5rem 0';
    empty.style.textAlign = 'center';
    nftsSection.appendChild(empty);
    return;
  }

  // Try to find existing grid to preserve scroll
  let grid = nftsSection.querySelector('.kwami-nft-grid') as HTMLDivElement;

  if (!grid) {
    nftsSection.innerHTML = ''; // Clear only if creating fresh (e.g. transitioning from loading/empty)
    grid = document.createElement('div');
    grid.className = 'kwami-nft-grid';
    nftsSection.appendChild(grid);
  }

  // Cleanup: Remove skeletons and sentinel from previous render
  grid.querySelectorAll('.kwami-skeleton-card').forEach(el => el.remove());
  grid.querySelector('.kwami-loading-sentinel')?.remove();

  // Map existing cards by mint to reuse elements
  const existingCards = new Map<string, HTMLButtonElement>();
  grid.querySelectorAll('.kwami-nft-card').forEach(el => {
    const mint = (el as HTMLElement).dataset.mint;
    if (mint) existingCards.set(mint, el as HTMLButtonElement);
  });

  // Sync cards: Update existing or create new, and ensure order
  for (const nft of ctx.state.kwamiNfts) {
    let card = existingCards.get(nft.mint) as HTMLButtonElement | undefined;
    
    const selectedMint = (ctx.state.selectedNft as KwamiOwnedNft | null)?.mint;
    const isSelected = selectedMint === nft.mint;

    if (!card) {
      card = document.createElement('button');
      card.type = 'button';
      card.className = 'kwami-glass-surface kwami-nft-card';
      card.dataset.mint = nft.mint;

      const img = document.createElement('div');
      img.className = 'kwami-nft-image-container';

      if (nft.image) {
        const imgEl = document.createElement('img');
        imgEl.src = nft.image;
        imgEl.alt = nft.name;
        imgEl.loading = 'lazy';
        imgEl.className = 'kwami-nft-image';
        img.appendChild(imgEl);
      }

      const name = createText(nft.name || 'Unnamed', {});
      name.className = 'kwami-nft-name';

      card.appendChild(img);
      card.appendChild(name);

      card.addEventListener('click', () => selectNft(ctx, nft));
    }

    // Update selection state on every render
    if (isSelected) {
      card.dataset.selected = 'true';
      // Add checkmark if not present
      const imgContainer = card.querySelector('.kwami-nft-image-container') as HTMLElement;
      if (imgContainer && !imgContainer.querySelector('.kwami-nft-checkmark')) {
        const checkmark = document.createElement('div');
        checkmark.className = 'kwami-nft-checkmark';
        checkmark.textContent = '✓';
        imgContainer.appendChild(checkmark);
      }
    } else {
      card.dataset.selected = 'false';
      // Remove checkmark
      const checkmark = card.querySelector('.kwami-nft-checkmark');
      if (checkmark) checkmark.remove();
    }

    // appendChild moves the element to the end if it exists, ensuring correct order
    grid.appendChild(card);
  }

  // Append skeletons at the end if loading more
  if (ctx.state.isLoadingNfts && ctx.state.kwamiNfts.length > 0) {
    // injectSkeletonStyles(); // Handled by global CSS
    for (let i = 0; i < 4; i++) {
      grid.appendChild(createSkeletonCard());
    }
  }

  // Observer sentinel for lazy loading
  const sentinel = document.createElement('div');
  sentinel.className = 'kwami-loading-sentinel';
  sentinel.style.gridColumn = '1 / -1';
  sentinel.style.height = '20px';
  grid.appendChild(sentinel);

  // Intersection Observer for lazy loading
  if (!ctx.allNftsLoaded && !ctx.state.isLoadingNfts) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !ctx.state.isLoadingNfts) {
        observer.disconnect();
        void refreshKwamiNfts(ctx, false).then(() => ctx.applyStateToUi());
      }
    }, { root: grid, threshold: 0.1 });
    
    observer.observe(sentinel);
  }

  // nftsSection.appendChild(grid); // Removed to prevent scroll reset on re-render

  // Login button (shown when NFT is selected)
  // Ensure we don't duplicate the button container
  let buttonContainer = nftsSection.querySelector('.kwami-login-container') as HTMLElement;
  const selectedNft = ctx.state.selectedNft as KwamiOwnedNft | null;
  
  if (selectedNft) {
    if (!buttonContainer) {
      buttonContainer = document.createElement('div');
      buttonContainer.className = 'kwami-login-container';
      buttonContainer.appendChild(createDivider());
      
      const loginBtn = createGlassButton({
        label: `Login with ${selectedNft.name || 'KWAMI'}`,
        icon: '🔐',
        mode: 'primary',
        size: 'md',
        theme: ctx.options.theme,
        onClick: onNftLogin,
      });
      loginBtn.element.style.width = '100%';
      loginBtn.element.style.marginTop = '0.5rem';
      loginBtn.element.id = 'kwami-login-btn'; // ID for easier updates
      buttonContainer.appendChild(loginBtn.element);
      nftsSection.appendChild(buttonContainer);
    } else {
        // Update existing button label by replacing it
        const oldBtn = buttonContainer.querySelector('#kwami-login-btn');
        if (oldBtn) oldBtn.remove();
        
        const loginBtn = createGlassButton({
            label: `Login with ${selectedNft.name || 'KWAMI'}`,
            icon: '🔐',
            mode: 'primary',
            size: 'md',
            theme: ctx.options.theme,
            onClick: onNftLogin,
        });
        loginBtn.element.style.width = '100%';
        loginBtn.element.style.marginTop = '0.5rem';
        loginBtn.element.id = 'kwami-login-btn';
        buttonContainer.appendChild(loginBtn.element);
    }
  } else {
    if (buttonContainer) buttonContainer.remove();
  }
}

function createSkeletonCard(): HTMLElement {
  const card = document.createElement('div');
  card.className = 'kwami-skeleton-card';

  const img = document.createElement('div');
  img.className = 'kwami-skeleton-pulse';
  img.style.width = '100%';
  img.style.aspectRatio = '1';
  img.style.borderRadius = '8px';
  img.style.background = 'rgba(148,163,184,0.1)';

  const text = document.createElement('div');
  text.className = 'kwami-skeleton-pulse';
  text.style.height = '12px';
  text.style.width = '70%';
  text.style.borderRadius = '4px';
  text.style.alignSelf = 'center';
  text.style.background = 'rgba(148,163,184,0.1)';

  card.appendChild(img);
  card.appendChild(text);
  return card;
}

// Removed injectSkeletonStyles as it's now in styles.ts

export function handleNftLogin(
  ctx: NftManagerContext,
  onPopoverHide: () => void,
  transformToAvatar: (nft: KwamiOwnedNft, walletAddress: string) => void
): void {
  if (!ctx.state.selectedNft) return;

  const walletAddress = ctx.wallet.getPublicKey()?.toBase58();
  if (!walletAddress) return;

  // Close popover
  onPopoverHide();

  // Set logged in state
  ctx.state.isNftLoggedIn = true;

  // Transform button to avatar
  transformToAvatar(ctx.state.selectedNft, walletAddress);

  // Call callback
  ctx.options.onNftLogin?.({
    walletAddress,
    nftMint: ctx.state.selectedNft.mint,
    nft: ctx.state.selectedNft,
  });
}

export function transformToAvatar(
  buttonElement: HTMLElement,
  nft: KwamiOwnedNft
): (() => void) | undefined {
  let cancelled = false;
  let cloneElement: HTMLElement | null = null;
  const cleanup = () => {
      cancelled = true;
      if (cloneElement) {
          cloneElement.remove();
          cloneElement = null;
      }
  };

  // Find the selected NFT card in the DOM
  const selectedCard = document.querySelector('[data-selected="true"]') as HTMLElement;
  
  if (selectedCard && nft.image) {
    // Get positions for animation
    const cardRect = selectedCard.getBoundingClientRect();
    const buttonRect = buttonElement.getBoundingClientRect();
    
    // Create a clone of the NFT image for the flying animation
    const clone = document.createElement('div');
    cloneElement = clone;

    clone.style.position = 'fixed';
    clone.style.left = `${cardRect.left}px`;
    clone.style.top = `${cardRect.top}px`;
    clone.style.width = `${cardRect.width}px`;
    clone.style.height = `${cardRect.width}px`;
    clone.style.borderRadius = '8px';
    clone.style.overflow = 'hidden';
    clone.style.zIndex = '99999';
    clone.style.pointerEvents = 'none';
    clone.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    clone.style.boxShadow = '0 20px 60px rgba(99, 102, 241, 0.5)';
    
    const cloneImg = document.createElement('img');
    cloneImg.src = nft.image;
    cloneImg.alt = nft.name;
    cloneImg.style.width = '100%';
    cloneImg.style.height = '100%';
    cloneImg.style.objectFit = 'cover';
    clone.appendChild(cloneImg);
    
    document.body.appendChild(clone);
    
    // Trigger animation on next frame
    requestAnimationFrame(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        // Animate to button position
        clone.style.left = `${buttonRect.left}px`;
        clone.style.top = `${buttonRect.top}px`;
        clone.style.width = '48px';
        clone.style.height = '48px';
        clone.style.borderRadius = '50%';
        clone.style.transform = 'rotate(360deg)';
        clone.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.4)';
      });
    });
    
    // After animation completes, update the actual button
    setTimeout(() => {
      if (cancelled) return;

      // Remove clone
      if (cloneElement) {
        cloneElement.remove();
        cloneElement = null;
      }
      
      // Update button style via class
      buttonElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      buttonElement.classList.add('kwami-avatar-mode');
      
      // Check if image already exists
      let img = buttonElement.querySelector('img.kwami-avatar-img') as HTMLImageElement;
      if (!img) {
        img = document.createElement('img');
        img.className = 'kwami-avatar-img';
        buttonElement.appendChild(img);
      }
      
      img.src = nft.image || '';
      img.alt = nft.name;
    }, 600);

    return cleanup;
  } else {
    // Fallback: Direct transformation without animation
    buttonElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    buttonElement.classList.add('kwami-avatar-mode');
    
    let img = buttonElement.querySelector('img.kwami-avatar-img') as HTMLImageElement;
    if (!img) {
        img = document.createElement('img');
        img.className = 'kwami-avatar-img';
        buttonElement.appendChild(img);
    }
    
    if (nft.image) {
      img.src = nft.image;
      img.alt = nft.name;
    } else {
       // Fallback for no image? We reuse the img element but maybe hide it if src is empty? 
       // For now assume image exists or handle initials differently.
       // The style assumes img.kwami-avatar-img.
       // If no image, we might need a fallback div.
       // But existing code logic prioritized image.
       img.src = '';
    }
  }
}

export function revertFromAvatar(
  buttonElement: HTMLElement,
  setButtonLabelDisconnected: () => void
): void {
  // Add smooth transition
  buttonElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  
  // Revert button to normal wallet button style
  buttonElement.classList.remove('kwami-avatar-mode');
  
  // Remove the avatar image
  const avatarImg = buttonElement.querySelector('img.kwami-avatar-img');
  if (avatarImg) {
      avatarImg.remove();
  }

  setButtonLabelDisconnected();
}
