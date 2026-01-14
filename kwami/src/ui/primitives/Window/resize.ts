/**
 * Window Resize Functionality
 * 
 * Handles resizing windows with size constraints and screen boundaries
 */

import type { WindowState, WindowSize, WindowBounds } from './types';

export interface ResizeHandler {
  destroy: () => void;
}

type ResizeDirection = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

export function createResizeHandler(
  windowElement: HTMLDivElement,
  state: WindowState,
  bounds: WindowBounds,
  onResize?: (size: WindowSize) => void
): ResizeHandler {
  const handles: Map<HTMLDivElement, ResizeDirection> = new Map();
  let isResizing = false;
  let resizeDirection: ResizeDirection | null = null;
  let resizeStartX = 0;
  let resizeStartY = 0;
  let windowStartX = 0;
  let windowStartY = 0;
  let windowStartWidth = 0;
  let windowStartHeight = 0;

  // Create resize handles for all 8 directions
  const directions: { dir: ResizeDirection; cursor: string; style: Partial<CSSStyleDeclaration> }[] = [
    { dir: 'n', cursor: 'ns-resize', style: { top: '0', left: '8px', right: '8px', height: '8px' } },
    { dir: 'ne', cursor: 'nesw-resize', style: { top: '0', right: '0', width: '12px', height: '12px' } },
    { dir: 'e', cursor: 'ew-resize', style: { right: '0', top: '8px', bottom: '8px', width: '8px' } },
    { dir: 'se', cursor: 'nwse-resize', style: { bottom: '0', right: '0', width: '12px', height: '12px' } },
    { dir: 's', cursor: 'ns-resize', style: { bottom: '0', left: '8px', right: '8px', height: '8px' } },
    { dir: 'sw', cursor: 'nesw-resize', style: { bottom: '0', left: '0', width: '12px', height: '12px' } },
    { dir: 'w', cursor: 'ew-resize', style: { left: '0', top: '8px', bottom: '8px', width: '8px' } },
    { dir: 'nw', cursor: 'nwse-resize', style: { top: '0', left: '0', width: '12px', height: '12px' } },
  ];

  directions.forEach(({ dir, cursor, style }) => {
    const handle = document.createElement('div');
    handle.className = `kwami-window-resize-${dir}`;
    Object.assign(handle.style, {
      position: 'absolute',
      cursor,
      zIndex: '10',
      ...style,
    });
    handles.set(handle, dir);
    windowElement.appendChild(handle);
  });

  const onMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const direction = handles.get(target as HTMLDivElement);
    
    if (!direction || state.isMaximized) {
      return;
    }

    isResizing = true;
    resizeDirection = direction;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    windowStartX = state.position.x;
    windowStartY = state.position.y;
    windowStartWidth = state.size.width;
    windowStartHeight = state.size.height;

    e.preventDefault();
    e.stopPropagation();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isResizing || !resizeDirection) return;

    const deltaX = e.clientX - resizeStartX;
    const deltaY = e.clientY - resizeStartY;

    let newX = windowStartX;
    let newY = windowStartY;
    let newWidth = windowStartWidth;
    let newHeight = windowStartHeight;

    // Calculate new dimensions based on resize direction
    if (resizeDirection.includes('e')) {
      newWidth = windowStartWidth + deltaX;
    }
    if (resizeDirection.includes('w')) {
      newWidth = windowStartWidth - deltaX;
      newX = windowStartX + deltaX;
    }
    if (resizeDirection.includes('s')) {
      newHeight = windowStartHeight + deltaY;
    }
    if (resizeDirection.includes('n')) {
      newHeight = windowStartHeight - deltaY;
      newY = windowStartY + deltaY;
    }

    // Apply size constraints
    newWidth = Math.max(bounds.minWidth, newWidth);
    newHeight = Math.max(bounds.minHeight, newHeight);
    
    if (bounds.maxWidth) {
      newWidth = Math.min(bounds.maxWidth, newWidth);
    }
    if (bounds.maxHeight) {
      newHeight = Math.min(bounds.maxHeight, newHeight);
    }

    // Apply viewport constraints
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust position if we hit size constraints
    if (resizeDirection.includes('w')) {
      newX = windowStartX + (windowStartWidth - newWidth);
      newX = Math.max(0, newX);
    }
    if (resizeDirection.includes('n')) {
      newY = windowStartY + (windowStartHeight - newHeight);
      newY = Math.max(0, newY);
    }

    // Don't allow resizing beyond viewport
    if (newX + newWidth > viewportWidth) {
      newWidth = viewportWidth - newX;
    }
    if (newY + newHeight > viewportHeight) {
      newHeight = viewportHeight - newY;
    }

    // Update state and DOM
    state.position.x = newX;
    state.position.y = newY;
    state.size.width = newWidth;
    state.size.height = newHeight;

    windowElement.style.left = `${newX}px`;
    windowElement.style.top = `${newY}px`;
    windowElement.style.width = `${newWidth}px`;
    windowElement.style.height = `${newHeight}px`;

    onResize?.(state.size);
  };

  const onMouseUp = () => {
    if (isResizing) {
      isResizing = false;
      resizeDirection = null;
    }
  };

  // Attach event listeners to each handle
  handles.forEach((dir, handle) => {
    handle.addEventListener('mousedown', onMouseDown);
  });

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  return {
    destroy() {
      handles.forEach((dir, handle) => {
        handle.removeEventListener('mousedown', onMouseDown);
        handle.remove();
      });
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      handles.clear();
    },
  };
}
