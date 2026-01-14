/**
 * Global Error Handler
 * 
 * Provides centralized error handling and monitoring for the Kwami website.
 * Catches unhandled errors and promise rejections.
 */

import { trackError } from './analytics';

export interface ErrorInfo {
  message: string;
  stack?: string;
  url?: string;
  line?: number;
  column?: number;
  timestamp: number;
  userAgent: string;
}

// Store recent errors to prevent duplicates
const recentErrors = new Set<string>();
const ERROR_THROTTLE_TIME = 5000; // 5 seconds

/**
 * Initialize global error handling
 */
export function initErrorHandler(): void {
  // Handle uncaught errors
  window.addEventListener('error', (event: ErrorEvent) => {
    const errorInfo: ErrorInfo = {
      message: event.message,
      stack: event.error?.stack,
      url: event.filename,
      line: event.lineno,
      column: event.colno,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    };

    handleError(errorInfo, event.error);
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const error = event.reason;
    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error?.message || 'Unhandled Promise Rejection',
      stack: error?.stack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    };

    handleError(errorInfo, error, true);
  });

  console.log('✅ Error handler initialized');
}

/**
 * Handle an error
 * @param errorInfo - Error information
 * @param error - Original error object
 * @param isPromiseRejection - Whether this is a promise rejection
 */
function handleError(errorInfo: ErrorInfo, error: any, isPromiseRejection: boolean = false): void {
  // Create unique error key
  const errorKey = `${errorInfo.message}:${errorInfo.url}:${errorInfo.line}`;

  // Check if we've seen this error recently (throttle)
  if (recentErrors.has(errorKey)) {
    return;
  }

  // Add to recent errors
  recentErrors.add(errorKey);
  setTimeout(() => recentErrors.delete(errorKey), ERROR_THROTTLE_TIME);

  // Log to console
  console.error('❌ Error caught:', errorInfo);
  if (error) {
    console.error('Error details:', error);
  }

  // Track in analytics
  trackError(error || errorInfo.message, isFatalError(errorInfo));

  // Show user-friendly error message (optional)
  if (isFatalError(errorInfo)) {
    showErrorNotification(errorInfo);
  }

  // Send to error monitoring service (if configured)
  sendToErrorMonitoring(errorInfo);
}

/**
 * Determine if an error is fatal
 * @param errorInfo - Error information
 * @returns Whether the error is fatal
 */
function isFatalError(errorInfo: ErrorInfo): boolean {
  const fatalPatterns = [
    'chunk',
    'module',
    'network',
    'failed to fetch',
    'load failed',
  ];

  const message = errorInfo.message.toLowerCase();
  return fatalPatterns.some(pattern => message.includes(pattern));
}

/**
 * Show error notification to user
 * @param errorInfo - Error information
 */
function showErrorNotification(errorInfo: ErrorInfo): void {
  // Only show notification for fatal errors
  if (!isFatalError(errorInfo)) return;

  // Check if we should show notifications
  const lastNotification = localStorage.getItem('last_error_notification');
  const now = Date.now();
  
  if (lastNotification && now - parseInt(lastNotification) < 60000) {
    // Don't show more than one notification per minute
    return;
  }

  localStorage.setItem('last_error_notification', now.toString());

  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'error-notification';
  notification.innerHTML = `
    <div class="error-notification-content">
      <span class="error-icon">⚠️</span>
      <div class="error-text">
        <strong>Oops! Something went wrong</strong>
        <p>We're working on fixing this. Try refreshing the page.</p>
      </div>
      <button class="error-close" onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
  `;

  // Add styles if not already added
  if (!document.getElementById('error-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'error-notification-styles';
    style.textContent = `
      .error-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        background: rgba(239, 68, 68, 0.95);
        color: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease-out;
      }

      .error-notification-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .error-icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .error-text {
        flex: 1;
      }

      .error-text strong {
        display: block;
        margin-bottom: 4px;
        font-size: 16px;
      }

      .error-text p {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
      }

      .error-close {
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 20px;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        flex-shrink: 0;
      }

      .error-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @media (max-width: 768px) {
        .error-notification {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Auto-remove after 10 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => notification.remove(), 300);
  }, 10000);
}

/**
 * Send error to monitoring service
 * @param errorInfo - Error information
 */
function sendToErrorMonitoring(errorInfo: ErrorInfo): void {
  // TODO: Integrate with error monitoring service (e.g., Sentry)
  // For now, just log to console
  
  // Example Sentry integration:
  // if (window.Sentry) {
  //   window.Sentry.captureException(new Error(errorInfo.message), {
  //     extra: errorInfo,
  //   });
  // }
  
  console.log('📤 Error would be sent to monitoring service:', errorInfo);
}

/**
 * Manually report an error
 * @param error - Error object or message
 * @param context - Additional context
 */
export function reportError(error: Error | string, context?: Record<string, any>): void {
  const errorInfo: ErrorInfo = {
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'string' ? undefined : error.stack,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
  };

  console.error('❌ Manual error report:', errorInfo, context);
  
  // Track in analytics
  trackError(error, false);
  
  // Send to monitoring
  sendToErrorMonitoring(errorInfo);
}

/**
 * Create error boundary for sections
 * @param element - Element to wrap with error boundary
 * @param fallback - Fallback content
 */
export function createErrorBoundary(
  element: HTMLElement,
  fallback?: string
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'error-boundary';
  
  try {
    wrapper.appendChild(element);
  } catch (error) {
    console.error('Error in error boundary:', error);
    wrapper.innerHTML = fallback || `
      <div class="error-fallback">
        <span class="error-emoji">😅</span>
        <p>Something went wrong here. Try refreshing the page!</p>
      </div>
    `;
    
    reportError(error as Error, { boundary: true });
  }
  
  return wrapper;
}

// Add CSS for error fallback
const fallbackStyles = `
  .error-fallback {
    padding: 40px 20px;
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .error-fallback .error-emoji {
    font-size: 48px;
    display: block;
    margin-bottom: 16px;
  }
  
  .error-fallback p {
    font-size: 16px;
    margin: 0;
  }
`;

// Add styles on initialization
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = fallbackStyles;
  document.head.appendChild(style);
}

