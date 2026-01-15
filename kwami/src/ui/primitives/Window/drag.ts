/**
 * Window Drag Functionality
 * 
 * Handles dragging windows with screen boundary constraints
 */

import type { WindowState, WindowPosition } from './types';
import { createSnapHandler, type SnapHandler } from './snap';

export interface DragHandler {
  destroy: () => void;
}

export function createDragHandler(
  windowElement: HTMLDivElement,
  titleBar: HTMLElement,
  state: WindowState,
  onMove?: (position: WindowPosition) => void,
  onSnap?: (side: 'left' | 'right') => void,
  enableSnap: boolean = true
): DragHandler {
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let windowStartX = 0;
  let windowStartY = 0;
  let snapHandler: SnapHandler | null = null;
  let currentSnapZone: 'left' | 'right' | null = null;

  // Create snap handler if enabled
  if (enableSnap && onSnap) {
    snapHandler = createSnapHandler(onSnap);
  }

  const onMouseDown = (e: MouseEvent) => {
    // Only drag from title bar and not from buttons
    if (e.target !== titleBar && !titleBar.contains(e.target as Node)) {
      return;
    }

    // Don't drag if clicking on a button
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }

    // Don't drag if window is maximized or snapped
    if (state.isMaximized || state.isSnapped) {
      return;
    }

    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    windowStartX = state.position.x;
    windowStartY = state.position.y;

    titleBar.style.cursor = 'grabbing';
    e.preventDefault();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;

    let newX = windowStartX + deltaX;
    let newY = windowStartY + deltaY;

    // Get window dimensions
    const rect = windowElement.getBoundingClientRect();
    const windowWidth = rect.width;
    const windowHeight = rect.height;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Constrain to viewport boundaries - keep entire window on screen
    newX = Math.max(0, newX); // Don't go past left edge
    newX = Math.min(viewportWidth - windowWidth, newX); // Don't go past right edge
    newY = Math.max(0, newY); // Don't go past top edge
    newY = Math.min(viewportHeight - windowHeight, newY); // Don't go past bottom edge

    // Update position
    state.position.x = newX;
    state.position.y = newY;
    windowElement.style.left = `${newX}px`;
    windowElement.style.top = `${newY}px`;

    onMove?.(state.position);

    // Check snap zones if enabled
    if (snapHandler) {
      const snapZone = snapHandler.checkSnapZone(e.clientX, e.clientY);
      
      if (snapZone !== currentSnapZone) {
        if (snapZone) {
          snapHandler.showPreview(snapZone);
        } else {
          snapHandler.hidePreview();
        }
        currentSnapZone = snapZone;
      }
    }
  };

  const onMouseUp = () => {
    if (isDragging) {
      isDragging = false;
      titleBar.style.cursor = 'grab';
      
      // Try to snap if in snap zone
      if (snapHandler) {
        snapHandler.triggerSnap();
        currentSnapZone = null;
      }
    }
  };

  // Attach event listeners
  titleBar.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  // Set initial cursor
  titleBar.style.cursor = 'grab';

  return {
    destroy() {
      titleBar.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      titleBar.style.cursor = '';
      snapHandler?.destroy();
    },
  };
}
