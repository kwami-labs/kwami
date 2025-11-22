/**
 * Loading States Module
 * 
 * Provides utilities for managing loading states, skeletons, and progress indicators
 */

export interface LoadingOptions {
  text?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'spinner' | 'dots' | 'progress';
  overlay?: boolean;
}

/**
 * Show loading state on an element
 */
export function showLoading(element: HTMLElement, options: LoadingOptions = {}): void {
  const {
    text = 'Loading',
    size = 'medium',
    type = 'spinner',
    overlay = true,
  } = options;

  // Add loading class
  element.classList.add('loading-container');

  // Create overlay if needed
  if (overlay) {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.setAttribute('role', 'status');
    loadingOverlay.setAttribute('aria-live', 'polite');
    loadingOverlay.setAttribute('aria-label', text);

    // Create loader based on type
    let loader: HTMLElement;
    if (type === 'spinner') {
      loader = createSpinner(size);
    } else if (type === 'dots') {
      loader = createDots();
    } else {
      loader = createProgressBar();
    }

    loadingOverlay.appendChild(loader);

    // Add loading text
    if (text) {
      const loadingText = document.createElement('div');
      loadingText.className = 'loading-text';
      loadingText.textContent = text;
      loadingOverlay.appendChild(loadingText);
    }

    element.appendChild(loadingOverlay);
  } else {
    element.classList.add('media-loading');
  }
}

/**
 * Hide loading state
 */
export function hideLoading(element: HTMLElement): void {
  element.classList.remove('loading-container', 'media-loading');
  
  const overlay = element.querySelector('.loading-overlay');
  if (overlay) {
    overlay.classList.add('loading-hidden');
    setTimeout(() => overlay.remove(), 300);
  }
}

/**
 * Create spinner loader
 */
function createSpinner(size: string): HTMLElement {
  const spinner = document.createElement('div');
  spinner.className = `loading-spinner loading-spinner-${size}`;
  return spinner;
}

/**
 * Create dots loader
 */
function createDots(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'loading-dots';
  
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'loading-dot';
    container.appendChild(dot);
  }
  
  return container;
}

/**
 * Create progress bar
 */
function createProgressBar(progress: number = 0): HTMLElement {
  const container = document.createElement('div');
  container.className = 'progress-container';
  
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  bar.style.width = `${progress}%`;
  
  container.appendChild(bar);
  return container;
}

/**
 * Update progress bar
 */
export function updateProgress(element: HTMLElement, progress: number): void {
  const bar = element.querySelector('.progress-bar') as HTMLElement;
  if (bar) {
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }
}

/**
 * Show button loading state
 */
export function setButtonLoading(button: HTMLButtonElement, loading: boolean): void {
  if (loading) {
    button.classList.add('button-loading');
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
  } else {
    button.classList.remove('button-loading');
    button.disabled = false;
    button.removeAttribute('aria-busy');
  }
}

/**
 * Create skeleton loader
 */
export function createSkeleton(type: 'text' | 'title' | 'button' | 'image' | 'circle' = 'text'): HTMLElement {
  const skeleton = document.createElement('div');
  skeleton.className = `skeleton skeleton-${type}`;
  skeleton.setAttribute('aria-hidden', 'true');
  return skeleton;
}

/**
 * Create skeleton section
 */
export function createSkeletonSection(): HTMLElement {
  const section = document.createElement('div');
  section.className = 'skeleton-section';
  
  // Header
  const header = document.createElement('div');
  header.className = 'skeleton-section-header';
  header.appendChild(createSkeleton('circle'));
  header.appendChild(createSkeleton('title'));
  section.appendChild(header);
  
  // Content
  const content = document.createElement('div');
  content.className = 'skeleton-section-content';
  for (let i = 0; i < 5; i++) {
    content.appendChild(createSkeleton('text'));
  }
  section.appendChild(content);
  
  return section;
}

/**
 * Lazy load image with loading state
 */
export function lazyLoadImage(img: HTMLImageElement, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Add loading class to parent
    const parent = img.parentElement;
    if (parent) {
      parent.classList.add('lazy-image');
    }

    // Set up image
    img.style.opacity = '0';
    
    const loadImage = () => {
      img.src = src;
      img.onload = () => {
        img.style.opacity = '1';
        if (parent) {
          parent.classList.add('loaded');
        }
        resolve();
      };
      img.onerror = () => {
        console.error('Failed to load image:', src);
        reject(new Error(`Failed to load image: ${src}`));
      };
    };

    // Use Intersection Observer if available
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            observer.disconnect();
          }
        });
      });
      observer.observe(img);
    } else {
      // Fallback: load immediately
      loadImage();
    }
  });
}

/**
 * Lazy load media (video/audio)
 */
export function lazyLoadMedia(media: HTMLVideoElement | HTMLAudioElement, src: string): void {
  media.classList.add('media-loading');
  
  const loadMedia = () => {
    media.src = src;
    media.addEventListener('loadeddata', () => {
      media.classList.remove('media-loading');
      media.classList.add('media-loaded');
    }, { once: true });
  };

  // Use Intersection Observer if available
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadMedia();
          observer.disconnect();
        }
      });
    });
    observer.observe(media);
  } else {
    // Fallback: load immediately
    loadMedia();
  }
}

/**
 * Show blob loading state
 */
export function showBlobLoading(container: HTMLElement, text: string = 'Initializing Kwami'): void {
  const loading = document.createElement('div');
  loading.className = 'blob-loading';
  loading.setAttribute('role', 'status');
  loading.setAttribute('aria-label', text);
  
  const spinner = document.createElement('div');
  spinner.className = 'blob-loading-spinner';
  loading.appendChild(spinner);
  
  const loadingText = document.createElement('div');
  loadingText.className = 'blob-loading-text';
  loadingText.textContent = text;
  loading.appendChild(loadingText);
  
  container.appendChild(loading);
}

/**
 * Hide blob loading state
 */
export function hideBlobLoading(container: HTMLElement): void {
  const loading = container.querySelector('.blob-loading');
  if (loading) {
    loading.classList.add('fade-out');
    setTimeout(() => loading.remove(), 300);
  }
}

/**
 * Add fade-in animation to element
 */
export function fadeIn(element: HTMLElement, speed: 'fast' | 'normal' | 'slow' = 'normal'): void {
  const className = speed === 'fast' ? 'fade-in-fast' : speed === 'slow' ? 'fade-in-slow' : 'fade-in';
  element.classList.add(className);
}

/**
 * Stagger children animations
 */
export function staggerChildren(container: HTMLElement): void {
  container.classList.add('stagger-children');
}

/**
 * Preload image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload: ${src}`));
    img.src = src;
  });
}

/**
 * Preload multiple images
 */
export async function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(src => preloadImage(src)));
}

/**
 * Show loading message
 */
export function showLoadingMessage(message: string, duration: number = 3000): HTMLElement {
  const toast = document.createElement('div');
  toast.className = 'loading-text fade-in';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    background: rgba(99, 102, 241, 0.9);
    color: white;
    border-radius: 8px;
    z-index: 1000;
    font-size: 14px;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
  
  return toast;
}

/**
 * Initialize loading states for the app
 */
export function initLoadingStates(): void {
  // Add loading class to canvas on init
  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.classList.add('loading');
    
    // Remove loading class when canvas is ready
    setTimeout(() => {
      canvas.classList.remove('loading');
      canvas.classList.add('loaded', 'fade-in');
    }, 1000);
  }

  // Add fade-in to sections as they load
  const sections = document.querySelectorAll('.text-section');
  sections.forEach((section, index) => {
    section.classList.add('loading');
    setTimeout(() => {
      section.classList.remove('loading');
      section.classList.add('loaded');
    }, 100 + index * 50);
  });

  console.log('✅ Loading states initialized');
}

