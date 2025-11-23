/**
 * Media Error Handler
 * Provides error boundaries and user feedback for media loading failures
 */

export interface MediaErrorOptions {
  onError?: (error: Error) => void;
  showUserFeedback?: boolean;
  retryAttempts?: number;
  fallbackMessage?: string;
}

export class MediaLoadError extends Error {
  constructor(
    message: string,
    public readonly mediaType: 'audio' | 'video' | 'voice',
    public readonly url: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'MediaLoadError';
  }
}

/**
 * Show error notification to user
 */
export function showMediaError(message: string, duration: number = 3000): void {
  // Remove any existing error messages
  const existingError = document.getElementById('media-error-notification');
  if (existingError) {
    existingError.remove();
  }

  const notification = document.createElement('div');
  notification.id = 'media-error-notification';
  notification.style.cssText = `
    position: fixed;
    bottom: 150px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(239, 68, 68, 0.9);
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-size: 0.875rem;
    z-index: 10001;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease-out;
    max-width: 90%;
    text-align: center;
  `;
  notification.textContent = message;

  // Add animation keyframes if not already present
  if (!document.getElementById('media-error-styles')) {
    const style = document.createElement('style');
    style.id = 'media-error-styles';
    style.textContent = `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
      @keyframes slideDown {
        from {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        to {
          opacity: 0;
          transform: translateX(-50%) translateY(20px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Auto-remove after duration
  setTimeout(() => {
    notification.style.animation = 'slideDown 0.3s ease-in';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

/**
 * Safely load media with error handling and retries
 */
export async function safeLoadMedia<T>(
  loadFn: () => Promise<T>,
  options: MediaErrorOptions = {}
): Promise<T | null> {
  const {
    onError,
    showUserFeedback = true,
    retryAttempts = 1,
    fallbackMessage = 'Failed to load media. Please try again.'
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retryAttempts; attempt++) {
    try {
      return await loadFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Media load attempt ${attempt + 1}/${retryAttempts} failed:`, error);

      // Wait before retry (exponential backoff)
      if (attempt < retryAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
      }
    }
  }

  // All attempts failed
  if (showUserFeedback) {
    showMediaError(fallbackMessage);
  }

  if (onError && lastError) {
    onError(lastError);
  }

  return null;
}

/**
 * Validate media URL before loading
 */
export function isValidMediaUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    // Check if it's a valid URL or path
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Check if media file exists (for local files)
 */
export async function checkMediaExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get user-friendly error message
 */
export function getMediaErrorMessage(error: Error, mediaType: 'audio' | 'video' | 'voice'): string {
  if (error.message.includes('404') || error.message.includes('not found')) {
    return `${mediaType} file not found. Please check if the file exists.`;
  }
  if (error.message.includes('network')) {
    return `Network error loading ${mediaType}. Check your connection.`;
  }
  if (error.message.includes('decode') || error.message.includes('format')) {
    return `${mediaType} format not supported or file is corrupted.`;
  }
  if (error.message.includes('permission') || error.message.includes('autoplay')) {
    return `Browser blocked ${mediaType} playback. Please interact with the page first.`;
  }
  return `Failed to load ${mediaType}. Please try again.`;
}

/**
 * Wrap async media operations with error boundary
 */
export function withMediaErrorBoundary<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  mediaType: 'audio' | 'video' | 'voice',
  options: MediaErrorOptions = {}
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | null> {
  return async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      const message = getMediaErrorMessage(err, mediaType);

      if (options.showUserFeedback !== false) {
        showMediaError(message);
      }

      if (options.onError) {
        options.onError(err);
      }

      console.error(`[${mediaType.toUpperCase()}] Error:`, err);
      return null;
    }
  };
}

/**
 * Create a loading state manager for media
 */
export class MediaLoadingState {
  private loadingElement: HTMLElement | null = null;
  private isShowing = false;

  show(message: string = 'Loading media...'): void {
    if (this.isShowing) return;

    const existing = document.getElementById('media-loading-indicator');
    if (existing) existing.remove();

    this.loadingElement = document.createElement('div');
    this.loadingElement.id = 'media-loading-indicator';
    this.loadingElement.style.cssText = `
      position: fixed;
      bottom: 150px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(99, 102, 241, 0.9);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 20px;
      font-size: 0.875rem;
      z-index: 10000;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: pulse 1.5s ease-in-out infinite;
    `;
    this.loadingElement.textContent = message;

    // Add pulse animation if not present
    if (!document.getElementById('loading-pulse-styles')) {
      const style = document.createElement('style');
      style.id = 'loading-pulse-styles';
      style.textContent = `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(this.loadingElement);
    this.isShowing = true;
  }

  hide(): void {
    if (this.loadingElement) {
      this.loadingElement.remove();
      this.loadingElement = null;
    }
    this.isShowing = false;
  }
}

// Global loading state instance
export const mediaLoadingState = new MediaLoadingState();

