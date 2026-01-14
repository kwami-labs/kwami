/**
 * Media Utilities
 */

/**
 * Get display name from media path
 */
export function getMediaDisplayName(path: string): string {
  const fileName = path.split('/').pop() ?? path;
  return fileName.replace(/\.[^/.]+$/, '');
}

/**
 * Check if device is mobile based on window width
 */
export function isMobileDevice(): boolean {
  return window.innerWidth <= 1024;
}

/**
 * Pick random item from array excluding specific items
 */
export function pickRandom<T>(
  items: T[],
  exclude: Set<T> = new Set()
): T | null {
  if (items.length === 0) return null;

  const candidates = items.filter(item => !exclude.has(item));
  if (candidates.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function(this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

