import type { KwamiNftGridOptions } from './types';
import { createButton as createGlassButton } from '../../primitives/Button';
import { createIcon } from '../../primitives/Icon';

export function createKwamiNftGrid(options: KwamiNftGridOptions): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'kwami-nft-grid-container';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '1rem';
  container.style.width = '100%';
  container.style.maxHeight = '500px';
  container.style.overflowY = 'auto';
  container.style.overflowX = 'hidden';

  // Grid
  const grid = document.createElement('div');
  grid.className = 'kwami-nft-grid';
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))';
  grid.style.gap = '0.75rem';
  grid.style.padding = '4px'; // Small padding for focus rings

  // Render NFTs
  options.nfts.forEach((nft) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'kwami-glass-surface kwami-nft-card';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '0.5rem';
    card.style.padding = '0.65rem';
    card.style.cursor = 'pointer';
    card.style.transition = 'all 0.2s';
    card.style.border = options.selectedNft?.mint === nft.mint
      ? '2px solid rgba(99, 102, 241, 0.7)'
      : '1px solid rgba(148,163,184,0.15)';
    card.style.background = options.selectedNft?.mint === nft.mint
      ? 'rgba(99, 102, 241, 0.1)'
      : 'rgba(15, 23, 42, 0.6)';

    // Image container
    const imgContainer = document.createElement('div');
    imgContainer.style.width = '100%';
    imgContainer.style.aspectRatio = '1';
    imgContainer.style.borderRadius = '10px';
    imgContainer.style.overflow = 'hidden';
    imgContainer.style.background = 'rgba(148,163,184,0.1)';

    if (nft.image) {
      const img = document.createElement('img');
      img.src = nft.image;
      img.alt = nft.name;
      img.loading = 'lazy';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.display = 'block';
      imgContainer.appendChild(img);
    }

    // Name
    const name = document.createElement('div');
    name.textContent = nft.name || 'Unnamed';
    name.style.fontSize = '0.85rem';
    name.style.fontWeight = '600';
    name.style.textAlign = 'center';
    name.style.overflow = 'hidden';
    name.style.textOverflow = 'ellipsis';
    name.style.whiteSpace = 'nowrap';
    name.style.color = options.selectedNft?.mint === nft.mint ? '#818cf8' : '#fff';

    card.appendChild(imgContainer);
    card.appendChild(name);

    // Hover effects
    card.addEventListener('mouseenter', () => {
      if (options.selectedNft?.mint !== nft.mint) {
        card.style.transform = 'translateY(-2px)';
        card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });

    // Click handler
    card.addEventListener('click', () => {
      options.onSelect(nft);
    });

    grid.appendChild(card);
  });

  container.appendChild(grid);

  // Loading indicator
  if (options.isLoading) {
    const loader = document.createElement('div');
    loader.style.textAlign = 'center';
    loader.style.padding = '1rem';
    loader.style.color = 'rgba(148,163,184,0.7)';
    loader.style.fontSize = '0.85rem';
    loader.textContent = 'Loading more...';
    container.appendChild(loader);
  }

  // Login button (shown when NFT is selected)
  if (options.showLoginButton && options.selectedNft) {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'sticky';
    buttonContainer.style.bottom = '0';
    buttonContainer.style.paddingTop = '1rem';
    buttonContainer.style.background = 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 70%, transparent)';
    buttonContainer.style.backdropFilter = 'blur(8px)';

    const loginBtn = createGlassButton({
      label: `Login with ${options.selectedNft.name || 'KWAMI'}`,
      icon: createIcon({ name: 'heroicons:lock-closed', size: 'sm' }).element,
      variant: 'primary',
      size: 'lg',
      onClick: () => options.onLogin?.(),
    });

    loginBtn.element.style.width = '100%';
    buttonContainer.appendChild(loginBtn.element);
    container.appendChild(buttonContainer);
  }

  // Scroll handler for lazy loading
  let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  container.addEventListener('scroll', () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 100) {
        // Near bottom
        options.onScrollBottom?.();
      }
    }, 150);
  });

  return container;
}
