/**
 * Window Snap-to-Sidebar Functionality
 * 
 * Handles snapping windows to left/right sidebars with visual preview
 */

import type { WindowState } from './types';

export interface SnapHandler {
  checkSnapZone: (x: number, y: number) => 'left' | 'right' | null;
  showPreview: (side: 'left' | 'right') => void;
  hidePreview: () => void;
  triggerSnap: () => void;
  destroy: () => void;
}

const SNAP_ZONE_WIDTH = 50; // pixels from edge to trigger snap zone
const HOLD_DURATION = 2000; // milliseconds to wait before showing preview

export function createSnapHandler(
  onSnap: (side: 'left' | 'right') => void
): SnapHandler {
  let previewElement: HTMLDivElement | null = null;
  let holdTimer: ReturnType<typeof setTimeout> | null = null;
  let currentSide: 'left' | 'right' | null = null;
  let isPreviewVisible = false;

  const createPreview = (): HTMLDivElement => {
    const preview = document.createElement('div');
    preview.className = 'kwami-window-snap-preview';
    
    Object.assign(preview.style, {
      position: 'fixed',
      top: '0',
      height: '100vh',
      width: '300px',
      background: 'var(--kwami-color-primary, rgba(100, 150, 255, 0.15))',
      border: '2px dashed var(--kwami-color-primary, rgba(100, 150, 255, 0.5))',
      pointerEvents: 'none',
      zIndex: '8999',
      opacity: '0',
      transition: 'opacity 0.2s ease, width 0.3s ease',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    });

    // Add expanding animation indicator
    const indicator = document.createElement('div');
    indicator.className = 'kwami-window-snap-indicator';
    Object.assign(indicator.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      border: '3px solid var(--kwami-color-primary, rgba(100, 150, 255, 0.8))',
      opacity: '0',
      transition: 'opacity 0.2s ease',
    });

    // Animated ring for hold timer
    const ring = document.createElement('div');
    ring.className = 'kwami-window-snap-ring';
    Object.assign(ring.style, {
      position: 'absolute',
      inset: '-4px',
      borderRadius: '50%',
      border: '4px solid transparent',
      borderTopColor: 'var(--kwami-color-primary, rgba(100, 150, 255, 1))',
      animation: 'none',
    });

    indicator.appendChild(ring);
    preview.appendChild(indicator);
    
    return preview;
  };

  const showPreview = (side: 'left' | 'right') => {
    if (!previewElement) {
      previewElement = createPreview();
      document.body.appendChild(previewElement);
    }

    currentSide = side;
    
    // Position preview
    if (side === 'left') {
      previewElement.style.left = '0';
      previewElement.style.right = 'auto';
    } else {
      previewElement.style.right = '0';
      previewElement.style.left = 'auto';
    }

    // Show preview with 30% opacity
    requestAnimationFrame(() => {
      if (previewElement) {
        previewElement.style.opacity = '0.3';
        
        const indicator = previewElement.querySelector('.kwami-window-snap-indicator') as HTMLDivElement;
        if (indicator) {
          indicator.style.opacity = '1';
        }
      }
    });

    isPreviewVisible = true;
  };

  const startHoldTimer = (side: 'left' | 'right') => {
    if (holdTimer) {
      clearTimeout(holdTimer);
    }

    currentSide = side;
    isPreviewVisible = false;

    // Wait 2 seconds before showing preview
    holdTimer = setTimeout(() => {
      if (currentSide === side) {
        showPreview(side);
      }
    }, HOLD_DURATION);
  };

  const triggerSnap = () => {
    // Only snap if preview is visible
    if (isPreviewVisible && currentSide) {
      const side = currentSide;
      onSnap(side);
      hidePreview();
    } else {
      // Cancel if preview wasn't shown yet
      hidePreview();
    }
  };

  const hidePreview = () => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }

    isPreviewVisible = false;
    currentSide = null;

    if (previewElement) {
      previewElement.style.opacity = '0';
      
      const indicator = previewElement.querySelector('.kwami-window-snap-indicator') as HTMLDivElement;
      if (indicator) {
        indicator.style.opacity = '0';
      }

      setTimeout(() => {
        if (previewElement && previewElement.parentElement) {
          previewElement.parentElement.removeChild(previewElement);
          previewElement = null;
        }
      }, 200);
    }
  };

  const checkSnapZone = (x: number, y: number): 'left' | 'right' | null => {
    const viewportWidth = window.innerWidth;
    
    if (x <= SNAP_ZONE_WIDTH) {
      return 'left';
    }
    
    if (x >= viewportWidth - SNAP_ZONE_WIDTH) {
      return 'right';
    }
    
    return null;
  };

  return {
    checkSnapZone,
    showPreview: startHoldTimer,
    hidePreview,
    triggerSnap,
    destroy() {
      hidePreview();
    },
  };
}
