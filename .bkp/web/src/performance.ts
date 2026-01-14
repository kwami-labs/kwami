/**
 * Performance Optimizations
 * 
 * Provides performance optimization utilities
 */

import { trackEvent } from './analytics';

export class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  /**
   * Initialize performance optimizations
   */
  private init(): void {
    console.log('⚡ Initializing performance optimizations...');

    // Preload critical resources
    this.preloadCriticalResources();

    // Lazy load non-critical resources
    this.setupLazyLoading();

    // Optimize images
    this.optimizeImages();

    // Debounce resize events
    this.debounceResize();

    // Monitor memory usage
    this.monitorMemory();

    console.log('✅ Performance optimizations initialized');
  }

  /**
   * Preload critical resources
   */
  private preloadCriticalResources(): void {
    const resources = [
      { href: '/vite.svg', as: 'image' },
      // Add more critical resources
    ];

    resources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      document.head.appendChild(link);
    });
  }

  /**
   * Setup lazy loading for images
   */
  private setupLazyLoading(): void {
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading
      document.querySelectorAll('img[data-src]').forEach((img) => {
        (img as HTMLImageElement).src = img.getAttribute('data-src')!;
        img.setAttribute('loading', 'lazy');
      });
    } else {
      // Intersection Observer fallback
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.getAttribute('data-src')!;
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach((img) => {
        observer.observe(img);
      });
    }
  }

  /**
   * Optimize images
   */
  private optimizeImages(): void {
    const images = document.querySelectorAll('img');
    
    images.forEach((img) => {
      // Add decoding hint
      img.decoding = 'async';
      
      // Add fetchpriority for important images
      if (img.classList.contains('important')) {
        img.fetchPriority = 'high';
      }
    });
  }

  /**
   * Debounce resize events
   */
  private debounceResize(): void {
    let resizeTimeout: number;

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('optimizedResize'));
      }, 250);
    });
  }

  /**
   * Monitor memory usage
   */
  private monitorMemory(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const used = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

        if (used > 0.9) {
          console.warn('⚠️ High memory usage:', (used * 100).toFixed(1) + '%');
          trackEvent('performance', 'memory', 'high');
        }
      }, 30000); // Check every 30 seconds
    }
  }
}

/**
 * Initialize performance optimizer
 */
export function initPerformanceOptimizer(): PerformanceOptimizer {
  return new PerformanceOptimizer();
}

