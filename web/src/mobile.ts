/**
 * Mobile UX Module
 * 
 * Provides touch interactions, gestures, and mobile-specific enhancements
 */

import { trackEvent } from './analytics';

export class MobileUX {
  private isMobile: boolean = false;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchEndX: number = 0;
  private touchEndY: number = 0;
  private minSwipeDistance: number = 50;
  private isInteracted: boolean = false;

  constructor() {
    this.detectMobile();
    if (this.isMobile) {
      this.init();
    }
  }

  /**
   * Detect if device is mobile
   */
  private detectMobile(): void {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;
  }

  /**
   * Initialize mobile interactions
   */
  private init(): void {
    console.log('📱 Initializing mobile UX...');

    // Add mobile class to body
    document.body.classList.add('mobile-device');

    // Setup touch interactions
    this.setupTouchFeedback();
    this.setupSwipeGestures();
    this.setupHapticFeedback();
    this.setupPullToRefresh();
    this.setupDoubleTap();
    this.setupLongPress();
    this.setupPinchZoom();
    
    // Show swipe indicator
    this.showSwipeIndicator();

    // Optimize for mobile performance
    this.optimizePerformance();

    // Handle orientation changes
    this.handleOrientationChange();

    console.log('✅ Mobile UX initialized');
  }

  /**
   * Setup touch feedback for all interactive elements
   */
  private setupTouchFeedback(): void {
    const interactiveElements = document.querySelectorAll(
      'button, .action-button, .tab-btn, .sphere, .header-btn, a'
    );

    interactiveElements.forEach((element) => {
      element.classList.add('touch-feedback');

      element.addEventListener('touchstart', () => {
        element.classList.add('touch-active');
      });

      element.addEventListener('touchend', () => {
        element.classList.remove('touch-active');
        this.markInteracted();
      });

      element.addEventListener('touchcancel', () => {
        element.classList.remove('touch-active');
      });
    });
  }

  /**
   * Setup swipe gestures for navigation
   */
  private setupSwipeGestures(): void {
    const contentLeft = document.querySelector('.content-left') as HTMLElement;
    if (!contentLeft) return;

    contentLeft.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    });

    contentLeft.addEventListener('touchmove', (e) => {
      this.touchEndX = e.touches[0].clientX;
      this.touchEndY = e.touches[0].clientY;
    });

    contentLeft.addEventListener('touchend', () => {
      this.handleSwipe();
    });
  }

  /**
   * Handle swipe gesture
   */
  private handleSwipe(): void {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Vertical swipe (up/down) for section navigation
    if (absDeltaY > this.minSwipeDistance && absDeltaY > absDeltaX) {
      if (deltaY > 0) {
        // Swipe down - previous section
        this.navigateSection('prev');
        trackEvent('swipe', 'navigation', 'down');
      } else {
        // Swipe up - next section
        this.navigateSection('next');
        trackEvent('swipe', 'navigation', 'up');
      }
    }

    // Horizontal swipe (left/right) for tab navigation
    if (absDeltaX > this.minSwipeDistance && absDeltaX > absDeltaY) {
      if (deltaX > 0) {
        // Swipe right - previous tab
        this.navigateTab('prev');
        trackEvent('swipe', 'tab', 'right');
      } else {
        // Swipe left - next tab
        this.navigateTab('next');
        trackEvent('swipe', 'tab', 'left');
      }
    }
  }

  /**
   * Navigate to previous/next section
   */
  private navigateSection(direction: 'prev' | 'next'): void {
    const scrollManager = (window as any).scrollManager;
    if (!scrollManager) return;

    const current = scrollManager.currentSection || 0;
    const target = direction === 'prev' ? current - 1 : current + 1;

    if (target >= 0 && target < 22) {
      scrollManager.scrollToSection(target);
      this.triggerHaptic('light');
    }
  }

  /**
   * Navigate to previous/next tab
   */
  private navigateTab(direction: 'prev' | 'next'): void {
    const tabs = ['voice', 'music', 'video'];
    const activeTab = document.querySelector('.tab-btn.active');
    if (!activeTab) return;

    const currentIndex = tabs.indexOf(activeTab.getAttribute('data-tab')!);
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + tabs.length) % tabs.length
      : (currentIndex + 1) % tabs.length;

    const newTab = document.querySelector(`.tab-btn[data-tab="${tabs[newIndex]}"]`) as HTMLButtonElement;
    if (newTab) {
      newTab.click();
      this.triggerHaptic('medium');
    }
  }

  /**
   * Setup haptic feedback
   */
  private setupHapticFeedback(): void {
    // Check if Vibration API is supported
    if (!('vibrate' in navigator)) {
      console.log('⚠️ Haptic feedback not supported');
      return;
    }

    // Add haptic to buttons
    const buttons = document.querySelectorAll('button, .action-button, .tab-btn');
    buttons.forEach((button) => {
      button.setAttribute('data-haptic', 'light');
      button.addEventListener('click', () => {
        this.triggerHaptic('light');
      });
    });

    // Add haptic to important actions
    const actionButtons = document.querySelectorAll('.action-button');
    actionButtons.forEach((button) => {
      button.setAttribute('data-haptic', 'medium');
    });
  }

  /**
   * Trigger haptic feedback
   */
  private triggerHaptic(intensity: 'light' | 'medium' | 'heavy' = 'light'): void {
    if (!('vibrate' in navigator)) return;

    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30,
    };

    navigator.vibrate(patterns[intensity]);
  }

  /**
   * Setup pull to refresh
   */
  private setupPullToRefresh(): void {
    let pullStartY = 0;
    let pulling = false;
    const pullDistance = 80;

    const contentLeft = document.querySelector('.content-left') as HTMLElement;
    if (!contentLeft) return;

    // Only enable at top of scroll
    contentLeft.addEventListener('touchstart', (e) => {
      if (contentLeft.scrollTop === 0) {
        pullStartY = e.touches[0].clientY;
        pulling = true;
      }
    });

    contentLeft.addEventListener('touchmove', (e) => {
      if (!pulling) return;

      const currentY = e.touches[0].clientY;
      const pullY = currentY - pullStartY;

      if (pullY > 0 && pullY < pullDistance) {
        // Show pull indicator
        this.showPullIndicator(pullY / pullDistance);
      } else if (pullY >= pullDistance) {
        // Ready to refresh
        this.showPullIndicator(1, true);
      }
    });

    contentLeft.addEventListener('touchend', () => {
      if (!pulling) return;

      const pullY = this.touchEndY - pullStartY;
      
      if (pullY >= pullDistance) {
        // Trigger refresh
        this.triggerRefresh();
      }

      pulling = false;
      this.hidePullIndicator();
    });
  }

  /**
   * Show pull to refresh indicator
   */
  private showPullIndicator(progress: number, ready: boolean = false): void {
    let indicator = document.querySelector('.pull-indicator') as HTMLElement;
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'pull-indicator';
      indicator.innerHTML = ready ? '⬇️' : '↓';
      document.body.appendChild(indicator);
    }

    indicator.classList.toggle('active', progress > 0);
    indicator.innerHTML = ready ? '⬇️' : '↓';
  }

  /**
   * Hide pull indicator
   */
  private hidePullIndicator(): void {
    const indicator = document.querySelector('.pull-indicator');
    if (indicator) {
      indicator.classList.remove('active');
      setTimeout(() => indicator.remove(), 300);
    }
  }

  /**
   * Trigger refresh action
   */
  private triggerRefresh(): void {
    this.triggerHaptic('medium');
    trackEvent('pull_to_refresh', 'interaction', 'refresh');
    
    // Show refresh feedback
    const indicator = document.querySelector('.pull-indicator');
    if (indicator) {
      indicator.innerHTML = '🔄';
    }

    // Simulate refresh (in real app, this would reload data)
    setTimeout(() => {
      this.hidePullIndicator();
    }, 1000);
  }

  /**
   * Setup double tap gesture
   */
  private setupDoubleTap(): void {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    let lastTap = 0;
    const doubleTapDelay = 300;

    canvas.addEventListener('touchend', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;

      if (tapLength < doubleTapDelay && tapLength > 0) {
        // Double tap detected
        this.handleDoubleTap(e);
        lastTap = 0;
      } else {
        lastTap = currentTime;
      }
    });
  }

  /**
   * Handle double tap
   */
  private handleDoubleTap(e: TouchEvent): void {
    e.preventDefault();
    this.triggerHaptic('medium');
    trackEvent('double_tap', 'blob', 'randomize');

    // Trigger blob randomization
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const event = new MouseEvent('dblclick', { bubbles: true });
      canvas.dispatchEvent(event);
    }
  }

  /**
   * Setup long press gesture
   */
  private setupLongPress(): void {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    let pressTimer: number;
    const longPressDuration = 500;

    canvas.addEventListener('touchstart', () => {
      pressTimer = window.setTimeout(() => {
        this.handleLongPress();
      }, longPressDuration);
    });

    canvas.addEventListener('touchend', () => {
      clearTimeout(pressTimer);
    });

    canvas.addEventListener('touchmove', () => {
      clearTimeout(pressTimer);
    });
  }

  /**
   * Handle long press
   */
  private handleLongPress(): void {
    this.triggerHaptic('heavy');
    trackEvent('long_press', 'blob', 'action');
    
    // Could trigger a special action, like showing blob info
    console.log('Long press detected');
  }

  /**
   * Setup pinch zoom gesture (for blob)
   */
  private setupPinchZoom(): void {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    let initialDistance = 0;
    let currentScale = 1;

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialDistance = this.getDistance(e.touches[0], e.touches[1]);
      }
    });

    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialDistance;
        currentScale = scale;

        // Apply scale to canvas (would need to integrate with Kwami)
        trackEvent('pinch', 'blob', `scale_${scale.toFixed(2)}`);
      }
    });
  }

  /**
   * Get distance between two touch points
   */
  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Show swipe indicator
   */
  private showSwipeIndicator(): void {
    if (this.isInteracted) return;

    const indicator = document.createElement('div');
    indicator.className = 'swipe-indicator';
    indicator.innerHTML = `
      <div class="swipe-indicator-arrow">↕️</div>
      <div>Swipe to navigate</div>
    `;
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-live', 'polite');

    document.body.appendChild(indicator);

    // Hide after first interaction
    setTimeout(() => {
      indicator.style.opacity = '0';
      setTimeout(() => indicator.remove(), 500);
    }, 5000);
  }

  /**
   * Mark as interacted
   */
  private markInteracted(): void {
    if (!this.isInteracted) {
      this.isInteracted = true;
      document.body.classList.add('interacted');
      
      // Hide swipe indicator
      const indicator = document.querySelector('.swipe-indicator');
      if (indicator) {
        indicator.remove();
      }
    }
  }

  /**
   * Optimize for mobile performance
   */
  private optimizePerformance(): void {
    // Enable GPU acceleration for animations
    const animatedElements = document.querySelectorAll(
      '.sphere, .tab-btn, .action-button, canvas, .text-section'
    );

    animatedElements.forEach((element) => {
      (element as HTMLElement).style.willChange = 'transform';
      (element as HTMLElement).style.transform = 'translateZ(0)';
    });

    // Debounce scroll events
    let scrollTimeout: number;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        // Handle scroll end
      }, 150);
    }, { passive: true });
  }

  /**
   * Handle orientation change
   */
  private handleOrientationChange(): void {
    window.addEventListener('orientationchange', () => {
      const orientation = window.orientation === 0 || window.orientation === 180 
        ? 'portrait' 
        : 'landscape';

      document.body.classList.remove('portrait', 'landscape');
      document.body.classList.add(orientation);

      trackEvent('orientation_change', 'device', orientation);

      // Re-layout after orientation change
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    });
  }

  /**
   * Check if device is mobile
   */
  public isMobileDevice(): boolean {
    return this.isMobile;
  }
}

/**
 * Initialize mobile UX
 */
export function initMobileUX(): MobileUX {
  return new MobileUX();
}

