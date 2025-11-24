/**
 * Performance optimization utilities
 * Provides throttling, debouncing, and RAF optimization
 */

/**
 * Throttles a function to run at most once per specified time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime: number | null = null;

  const later = () => {
    timeout = null;
    if (lastArgs) {
      func(...lastArgs);
      lastCallTime = Date.now();
      lastArgs = null;
    }
  };

  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (!lastCallTime || now - lastCallTime >= wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      func(...args);
      lastCallTime = now;
    } else {
      lastArgs = args;
      if (!timeout) {
        timeout = window.setTimeout(later, wait - (now - lastCallTime));
      }
    }
  };
}

/**
 * Debounces a function to run only after it hasn't been called for specified time
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Optimizes scroll/resize handlers using requestAnimationFrame
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    lastArgs = args;
    
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          func(...lastArgs);
        }
        rafId = null;
        lastArgs = null;
      });
    }
  };
}

/**
 * Checks if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Creates a passive event listener options object
 */
export function getPassiveEventOptions(): AddEventListenerOptions {
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get() {
        supportsPassive = true;
        return true;
      }
    });
    window.addEventListener('testPassive', null as any, opts);
    window.removeEventListener('testPassive', null as any, opts);
  } catch (e) {}

  return supportsPassive ? { passive: true } : false as any;
}

/**
 * Lazy loads an image with IntersectionObserver
 */
export function lazyLoadImage(img: HTMLImageElement, threshold: number = 0.1): void {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const image = entry.target as HTMLImageElement;
            const src = image.dataset.src;
            if (src) {
              image.src = src;
              image.removeAttribute('data-src');
            }
            observer.unobserve(image);
          }
        });
      },
      { threshold }
    );
    observer.observe(img);
  } else {
    // Fallback for browsers without IntersectionObserver
    const src = img.dataset.src;
    if (src) {
      img.src = src;
    }
  }
}

/**
 * Prefetches a resource
 */
export function prefetchResource(url: string, type: 'script' | 'style' | 'image' = 'script'): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = type;
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Checks if device has low memory
 */
export function isLowEndDevice(): boolean {
  // @ts-ignore - navigator.deviceMemory is experimental
  const memory = navigator.deviceMemory;
  // @ts-ignore - navigator.hardwareConcurrency
  const cores = navigator.hardwareConcurrency;
  
  // Consider low-end if < 4GB RAM or < 4 cores
  return (memory && memory < 4) || (cores && cores < 4);
}


