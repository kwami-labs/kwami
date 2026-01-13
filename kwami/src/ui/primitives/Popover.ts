import { getThemeEngine } from '../theme/ThemeEngine';

/**
 * Popover Component (New Theme System)
 * 
 * Floating panel positioned at coordinates using CSS variables from global theme.
 */

export type PopoverContent = string | Node | Node[] | (() => Node | Node[]);

export interface PopoverOptions {
  header?: PopoverContent;
  content?: PopoverContent;
  width?: number;
  closeOnBlur?: boolean;
  className?: string;
  onClose?: () => void;
}

export interface PopoverHandle {
  element: HTMLDivElement;
  setHeader: (content?: PopoverContent) => void;
  setContent: (content: PopoverContent) => void;
  show: (x: number, y: number) => void;
  hide: () => void;
  destroy: () => void;
}

function renderContent(content: PopoverContent, target: HTMLElement): void {
  if (typeof content === 'string') {
    target.textContent = content;
    return;
  }
  if (content instanceof Node) {
    target.innerHTML = '';
    target.appendChild(content);
    return;
  }
  if (Array.isArray(content)) {
    target.innerHTML = '';
    content.forEach((node) => node && target.appendChild(node));
    return;
  }
  if (typeof content === 'function') {
    const result = content();
    renderContent(result, target);
  }
}

function positionPopover(popover: HTMLElement, x: number, y: number, width: number): void {
  const padding = 24;
  const height = popover.offsetHeight || 320;
  const clampedX = Math.min(
    Math.max(padding, x - width / 2),
    window.innerWidth - width - padding,
  );
  const clampedY = Math.min(
    Math.max(padding, y - height / 2),
    window.innerHeight - height - padding,
  );

  popover.style.left = `${clampedX}px`;
  popover.style.top = `${clampedY}px`;
}

export function createPopover(options: PopoverOptions = {}): PopoverHandle {
  if (typeof document === 'undefined') {
    throw new Error('createPopover can only run in the browser');
  }

  // Ensure theme is initialized
  const engine = getThemeEngine();
  if (!engine.getCurrent()) {
    console.warn('Theme not initialized. Call initializeTheme() first.');
  }

  const {
    header,
    content,
    width = 360,
    closeOnBlur = true,
    className,
    onClose,
  } = options;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'kwami-popover-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '10000',
    pointerEvents: 'none',
    opacity: '0',
    transition: 'opacity var(--kwami-duration-fast) var(--kwami-easing)',
  });

  // Create popover
  const popover = document.createElement('div');
  popover.className = ['kwami-surface', 'kwami-popover', className]
    .filter(Boolean)
    .join(' ');
  
  Object.assign(popover.style, {
    position: 'absolute',
    width: `${width}px`,
    opacity: '0',
    transform: 'translateY(16px)',
    transition: 'transform var(--kwami-duration) var(--kwami-easing), opacity var(--kwami-duration) var(--kwami-easing)',
    padding: 'var(--kwami-padding-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--kwami-gap-md)',
  });

  // Create header
  const headerSlot = document.createElement('div');
  Object.assign(headerSlot.style, {
    fontSize: 'var(--kwami-font-size-lg)',
    fontWeight: 'var(--kwami-font-weight-semibold)',
    letterSpacing: 'var(--kwami-letter-spacing)',
    color: 'var(--kwami-color-text-muted)',
  });

  // Create content slot
  const contentSlot = document.createElement('div');
  Object.assign(contentSlot.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--kwami-gap)',
  });

  if (header) {
    renderContent(header, headerSlot);
  } else {
    headerSlot.style.display = 'none';
  }

  if (content) {
    renderContent(content, contentSlot);
  }

  popover.appendChild(headerSlot);
  popover.appendChild(contentSlot);
  overlay.appendChild(popover);

  let isVisible = false;

  const show = (x: number, y: number) => {
    document.body.appendChild(overlay);
    positionPopover(popover, x, y, width);
    requestAnimationFrame(() => {
      overlay.style.pointerEvents = 'auto';
      overlay.style.opacity = '1';
      popover.style.opacity = '1';
      popover.style.transform = 'translateY(0)';
    });
    isVisible = true;
  };

  const hide = () => {
    if (!isVisible) return;
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    popover.style.opacity = '0';
    popover.style.transform = 'translateY(16px)';
    isVisible = false;
    setTimeout(() => {
      if (overlay.parentElement) {
        overlay.parentElement.removeChild(overlay);
      }
      onClose?.();
    }, 220);
  };

  const destroy = () => {
    if (overlay.parentElement) {
      overlay.parentElement.removeChild(overlay);
    }
  };

  if (closeOnBlur) {
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) hide();
    });
  }

  return {
    element: popover,
    setHeader(content?: PopoverContent) {
      if (!content) {
        headerSlot.style.display = 'none';
        headerSlot.innerHTML = '';
      } else {
        headerSlot.style.display = '';
        renderContent(content, headerSlot);
      }
    },
    setContent(content: PopoverContent) {
      renderContent(content, contentSlot);
    },
    show,
    hide,
    destroy,
  };
}

/**
 * Backward compatibility alias
 * @deprecated Use createPopover instead
 */
export const createGlassPopover = createPopover;
