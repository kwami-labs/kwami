/**
 * Window Component (New Theme System)
 * 
 * A draggable, resizable window component like a regular OS window.
 * Can be enlarged, reduced, closed, maximized, and moved around the screen
 * without leaving the screen borders.
 */

import { getThemeEngine } from '../../theme/ThemeEngine';
import { createDragHandler } from './drag';
import { createResizeHandler } from './resize';
import { createControls, updateMaximizeButton } from './controls';
import { renderContent } from './utils';
import { getWindowManager } from './manager';
import type {
  WindowOptions,
  WindowHandle,
  WindowState,
  WindowBounds,
  WindowContent,
} from './types';

export function createWindow(options: WindowOptions = {}): WindowHandle {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('createWindow can only run in the browser');
  }

  // Ensure theme is initialized
  const engine = getThemeEngine();
  if (!engine.getCurrent()) {
    console.warn('Theme not initialized. Call initializeTheme() first.');
  }

  const {
    title = 'Window',
    content,
    x = 100,
    y = 100,
    width = 600,
    height = 400,
    minWidth = 200,
    minHeight = 150,
    maxWidth,
    maxHeight,
    resizable = true,
    draggable = true,
    closable = true,
    maximizable = true,
    enableSnapToSidebar = true,
    className,
    onClose,
    onMaximize,
    onRestore,
    onMove,
    onResize,
    onSnapToSidebar,
    onUnsnapFromSidebar,
  } = options;

  // Initialize window state
  const state: WindowState = {
    position: { x, y },
    size: { width, height },
    isMaximized: false,
    isSnapped: false,
  };

  const bounds: WindowBounds = {
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
  };

  // Create window container
  const windowElement = document.createElement('div');
  windowElement.className = ['kwami-surface', 'kwami-window', className]
    .filter(Boolean)
    .join(' ');

  Object.assign(windowElement.style, {
    position: 'fixed',
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    zIndex: '9000',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'all 0.2s var(--kwami-easing)',
  });

  // Create title bar
  const titleBar = document.createElement('div');
  titleBar.className = 'kwami-window-titlebar';
  Object.assign(titleBar.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--kwami-padding-sm) var(--kwami-padding)',
    borderBottom: 'var(--kwami-border-width) solid var(--kwami-color-border)',
    gap: 'var(--kwami-gap)',
    flexShrink: '0',
    userSelect: 'none',
  });

  // Create title text
  const titleText = document.createElement('div');
  titleText.className = 'kwami-window-title';
  titleText.textContent = title;
  Object.assign(titleText.style, {
    fontSize: 'var(--kwami-font-size)',
    fontWeight: 'var(--kwami-font-weight-medium)',
    color: 'var(--kwami-color-text)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: '1',
  });

  titleBar.appendChild(titleText);

  // Create controls
  const controls = createControls({
    closable,
    maximizable,
    onClose: () => {
      close();
    },
    onMaximize: () => {
      if (state.isSnapped) {
        unsnapFromSidebar();
      } else if (state.isMaximized) {
        restore();
      } else {
        maximize();
      }
    },
  });

  titleBar.appendChild(controls.container);

  // Create content area
  const contentArea = document.createElement('div');
  contentArea.className = 'kwami-window-content';
  Object.assign(contentArea.style, {
    flex: '1',
    overflow: 'auto',
    padding: 'var(--kwami-padding)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--kwami-gap)',
  });

  if (content) {
    renderContent(content, contentArea);
  }

  windowElement.appendChild(titleBar);
  windowElement.appendChild(contentArea);

  // Register with window manager for z-index control
  const windowManager = getWindowManager();
  const windowId = windowManager.register(windowElement);

  // Attach handlers
  let dragHandler: ReturnType<typeof createDragHandler> | null = null;
  let resizeHandler: ReturnType<typeof createResizeHandler> | null = null;

  // Forward declare unsnapFromSidebar for controls
  let unsnapFromSidebar: () => void;

  // Snap to sidebar handler
  const snapToSidebar = (side: 'left' | 'right') => {
    if (state.isSnapped) return;

    // Save current state
    state.beforeSnap = {
      position: { ...state.position },
      size: { ...state.size },
    };

    state.isSnapped = true;
    state.snappedSide = side;

    // Disable drag when snapped
    if (dragHandler) {
      dragHandler.destroy();
      dragHandler = null;
    }

    // Position as sidebar
    const sidebarWidth = 300;
    state.position.x = side === 'left' ? 0 : window.innerWidth - sidebarWidth;
    state.position.y = 0;
    state.size.width = sidebarWidth;
    state.size.height = window.innerHeight;

    Object.assign(windowElement.style, {
      left: `${state.position.x}px`,
      top: '0',
      width: `${sidebarWidth}px`,
      height: '100vh',
      transition: 'all 0.3s var(--kwami-easing)',
    });

    // Enable resize only on the free edge (opposite to snapped side)
    if (resizable) {
      resizeHandler = createResizeHandler(windowElement, state, bounds, onResize);
    }

    // Update maximize button to show minimize icon
    if (controls.maximizeButton) {
      controls.maximizeButton.element.textContent = '−';
      controls.maximizeButton.element.setAttribute('aria-label', 'Minimize');
    }

    onSnapToSidebar?.(side);
  };

  if (draggable) {
    dragHandler = createDragHandler(
      windowElement,
      titleBar,
      state,
      onMove,
      snapToSidebar,
      enableSnapToSidebar
    );
  }

  if (resizable) {
    resizeHandler = createResizeHandler(windowElement, state, bounds, onResize);
  }

  // API Methods
  const setTitle = (newTitle: string) => {
    titleText.textContent = newTitle;
  };

  const setContent = (newContent: WindowContent) => {
    renderContent(newContent, contentArea);
  };

  const setPosition = (newX: number, newY: number) => {
    if (state.isMaximized || state.isSnapped) return;
    state.position.x = newX;
    state.position.y = newY;
    windowElement.style.left = `${newX}px`;
    windowElement.style.top = `${newY}px`;
    onMove?.(state.position);
  };

  const setSize = (newWidth: number, newHeight: number) => {
    if (state.isMaximized || state.isSnapped) return;
    state.size.width = Math.max(bounds.minWidth, newWidth);
    state.size.height = Math.max(bounds.minHeight, newHeight);
    windowElement.style.width = `${state.size.width}px`;
    windowElement.style.height = `${state.size.height}px`;
    onResize?.(state.size);
  };

  const maximize = () => {
    if (state.isMaximized || state.isSnapped) return;

    // Save current state
    state.beforeMaximize = {
      position: { ...state.position },
      size: { ...state.size },
    };

    state.isMaximized = true;
    state.position.x = 0;
    state.position.y = 0;
    state.size.width = window.innerWidth;
    state.size.height = window.innerHeight;

    Object.assign(windowElement.style, {
      left: '0',
      top: '0',
      width: '100vw',
      height: '100vh',
    });

    if (controls.maximizeButton) {
      updateMaximizeButton(controls.maximizeButton.element, true);
    }

    onMaximize?.();
  };

  const restore = () => {
    if (!state.isMaximized || !state.beforeMaximize) return;

    state.isMaximized = false;
    state.position = { ...state.beforeMaximize.position };
    state.size = { ...state.beforeMaximize.size };

    Object.assign(windowElement.style, {
      left: `${state.position.x}px`,
      top: `${state.position.y}px`,
      width: `${state.size.width}px`,
      height: `${state.size.height}px`,
    });

    if (controls.maximizeButton) {
      updateMaximizeButton(controls.maximizeButton.element, false);
    }

    onRestore?.();
    delete state.beforeMaximize;
  };

  const close = () => {
    windowElement.style.opacity = '0';
    windowElement.style.transform = 'scale(0.95)';
    setTimeout(() => {
      destroy();
      onClose?.();
    }, 200);
  };

  const destroy = () => {
    dragHandler?.destroy();
    resizeHandler?.destroy();
    controls.destroy();
    windowManager.unregister(windowId);
    if (windowElement.parentElement) {
      windowElement.parentElement.removeChild(windowElement);
    }
  };

  const isMaximized = () => state.isMaximized;

  const isSnappedToSidebar = () => state.isSnapped;

  unsnapFromSidebar = () => {
    if (!state.isSnapped || !state.beforeSnap) return;

    state.isSnapped = false;
    state.position = { ...state.beforeSnap.position };
    state.size = { ...state.beforeSnap.size };

    Object.assign(windowElement.style, {
      left: `${state.position.x}px`,
      top: `${state.position.y}px`,
      width: `${state.size.width}px`,
      height: `${state.size.height}px`,
      transition: 'all 0.3s var(--kwami-easing)',
    });

    // Re-enable drag and resize
    if (draggable) {
      dragHandler = createDragHandler(
        windowElement,
        titleBar,
        state,
        onMove,
        snapToSidebar,
        enableSnapToSidebar
      );
    }

    if (resizable) {
      resizeHandler = createResizeHandler(windowElement, state, bounds, onResize);
    }

    // Restore maximize button icon
    if (controls.maximizeButton) {
      controls.maximizeButton.element.textContent = '□';
      controls.maximizeButton.element.setAttribute('aria-label', 'Maximize');
    }

    onUnsnapFromSidebar?.();
    delete state.beforeSnap;
    delete state.snappedSide;
  };

  // Add window to the document
  document.body.appendChild(windowElement);

  // Animate in
  requestAnimationFrame(() => {
    windowElement.style.opacity = '1';
    windowElement.style.transform = 'scale(1)';
  });

  return {
    element: windowElement,
    setTitle,
    setContent,
    setPosition,
    setSize,
    maximize,
    restore,
    close,
    destroy,
    isMaximized,
    isSnappedToSidebar,
    unsnapFromSidebar,
  };
}
