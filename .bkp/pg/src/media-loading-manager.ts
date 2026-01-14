/**
 * Media Loading Manager
 * 
 * Manages the loading overlay with random loader animations
 * Displays one of three available loaders while media is being loaded
 */

// Define loader GIF paths (served from public directory)
const LOADER_GIFS = [
  '/img/loader/ai-loader.gif',
  '/img/loader/loader-no-bg.gif',
  '/img/loader/loader.gif'
];

// Validate loaders were found
if (LOADER_GIFS.length === 0) {
  console.warn('[MediaLoadingManager] No loader GIFs found');
} else {
  console.log(`[MediaLoadingManager] Loaded ${LOADER_GIFS.length} loader(s):`, LOADER_GIFS);
}

class MediaLoadingManager {
  private overlay: HTMLElement | null = null;
  private loaderImage: HTMLImageElement | null = null;
  private currentLoader: string | null = null;
  private isVisible = false;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private initialized = false;

  constructor() {
    // fields initialized above
  }

  /**
   * Initialize the loading manager
   * Must be called after DOM is ready
   */
  init() {
    if (this.initialized) return;
    
    this.overlay = document.getElementById('media-loading-overlay');
    this.loaderImage = document.getElementById('media-loader-image') as HTMLImageElement | null;
    
    if (!this.overlay || !this.loaderImage) {
      console.warn('Media loading overlay elements not found in DOM');
      return;
    }
    
    this.initialized = true;
  }

  /**
   * Select a random loader from the available loaders
   * @returns {string} Path to a random loader GIF
   */
  getRandomLoader() {
    if (LOADER_GIFS.length === 0) {
      console.warn('[MediaLoadingManager] No loaders available');
      return '';
    }
    const randomIndex = Math.floor(Math.random() * LOADER_GIFS.length);
    return LOADER_GIFS[randomIndex];
  }

  /**
   * Show the loading overlay with a random loader
   * @param {string} message - Optional custom loading message
   */
  show(message = 'Loading media...') {
    if (!this.initialized) {
      this.init();
    }
    
    if (!this.overlay || !this.loaderImage) {
      console.warn('Cannot show loader: elements not initialized');
      return;
    }

    // Clear any pending hide timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    // Select and set a random loader
    this.currentLoader = this.getRandomLoader();
    if (this.currentLoader) {
      this.loaderImage.src = this.currentLoader;
      this.loaderImage.style.display = 'block';
    } else {
      // Hide image if no loader available
      this.loaderImage.style.display = 'none';
      console.warn('[MediaLoadingManager] No loader GIF available to display');
    }

    // Update message if provided
    const textElement = this.overlay.querySelector('.media-loader-text');
    if (textElement && message) {
      textElement.textContent = message;
    }

    // Show the overlay
    this.overlay.classList.remove('hidden', 'hiding');
    this.overlay.style.display = 'flex';
    
    // Trigger reflow for smooth animation
    void this.overlay.offsetWidth;
    
    this.overlay.classList.add('visible');
    this.isVisible = true;
  }

  /**
   * Hide the loading overlay
   * @param {number} delay - Optional delay in milliseconds before hiding
   */
  hide(delay = 0) {
    if (!this.initialized || !this.overlay) return;

    const performHide = () => {
      if (!this.overlay) return;
      
      this.overlay.classList.remove('visible');
      this.overlay.classList.add('hiding');
      
      // Wait for fade out animation to complete
      this.hideTimeout = setTimeout(() => {
        if (this.overlay) {
          this.overlay.classList.remove('hiding');
          this.overlay.classList.add('hidden');
          this.overlay.style.display = 'none';
        }
        this.isVisible = false;
        this.hideTimeout = null;
      }, 200); // Match CSS transition duration
    };

    if (delay > 0) {
      this.hideTimeout = setTimeout(performHide, delay);
    } else {
      performHide();
    }
  }

  /**
   * Check if loader is currently visible
   * @returns {boolean}
   */
  get visible() {
    return this.isVisible;
  }
}

// Create and export a singleton instance
const mediaLoadingManager = new MediaLoadingManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    mediaLoadingManager.init();
  });
} else {
  // DOM already loaded
  mediaLoadingManager.init();
}

// Export for ES modules
export default mediaLoadingManager;

// Also attach to window for non-module scripts
if (typeof window !== 'undefined') {
  window.mediaLoadingManager = mediaLoadingManager;
}

