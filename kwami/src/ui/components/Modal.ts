import { getThemeEngine } from '../core/theme/ThemeEngine';

/**
 * Modal Component (New Theme System)
 * 
 * Centered modal dialog using CSS variables from global theme.
 */

export type ModalContent = string | Node | Node[] | (() => Node | Node[]);

export interface ModalOptions {
  header?: ModalContent;
  content?: ModalContent;
  width?: number;
  maxWidth?: number | string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  onClose?: () => void;
}

export interface ModalHandle {
  element: HTMLDivElement;
  setHeader: (content?: ModalContent) => void;
  setContent: (content: ModalContent) => void;
  show: () => void;
  hide: () => void;
  destroy: () => void;
}

function renderContent(content: ModalContent, target: HTMLElement): void {
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

export function createModal(options: ModalOptions = {}): ModalHandle {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('createModal can only run in the browser');
  }

  // Ensure theme is initialized
  const engine = getThemeEngine();
  if (!engine.getCurrent()) {
    console.warn('Theme not initialized. Call initializeTheme() first.');
  }

  const {
    header,
    content,
    width = 520,
    maxWidth = 'calc(100vw - 40px)',
    closeOnBackdrop = true,
    closeOnEscape = true,
    className,
    onClose,
  } = options;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'kwami-modal-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '10000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    opacity: '0',
    pointerEvents: 'none',
    transition: 'opacity var(--kwami-duration) var(--kwami-easing)',
  });

  // Create modal
  const modal = document.createElement('div');
  modal.className = ['kwami-surface', 'kwami-modal', className]
    .filter(Boolean)
    .join(' ');
  
  Object.assign(modal.style, {
    width: `${width}px`,
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    maxHeight: 'calc(100vh - 60px)',
    overflow: 'auto',
    opacity: '0',
    transform: 'translateY(22px) scale(0.98)',
    transition: 'transform 0.28s var(--kwami-easing), opacity 0.28s var(--kwami-easing)',
    padding: 'var(--kwami-padding-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--kwami-gap-md)',
  });

  // Create header
  const headerSlot = document.createElement('div');
  Object.assign(headerSlot.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--kwami-gap)',
  });

  const headerText = document.createElement('div');
  Object.assign(headerText.style, {
    fontSize: 'var(--kwami-font-size-lg)',
    fontWeight: 'var(--kwami-font-weight-bold)',
    letterSpacing: 'var(--kwami-letter-spacing-wide)',
    textTransform: 'uppercase',
    color: 'var(--kwami-color-text-muted)',
  });

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.textContent = '✕';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.className = 'kwami-modal-close';
  Object.assign(closeButton.style, {
    border: 'var(--kwami-border-width) solid var(--kwami-color-border)',
    background: 'transparent',
    color: 'var(--kwami-color-text)',
    borderRadius: '999px',
    width: '36px',
    height: '36px',
    cursor: 'pointer',
    fontSize: 'var(--kwami-font-size)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--kwami-duration) var(--kwami-easing)',
  });

  closeButton.addEventListener('mouseenter', () => {
    closeButton.style.background = 'var(--kwami-color-surface-hover)';
  });
  closeButton.addEventListener('mouseleave', () => {
    closeButton.style.background = 'transparent';
  });

  if (header) {
    renderContent(header, headerText);
  } else {
    headerText.textContent = ' '; // preserve layout
    headerText.style.opacity = '0';
  }

  headerSlot.appendChild(headerText);
  headerSlot.appendChild(closeButton);

  // Create content slot
  const contentSlot = document.createElement('div');
  Object.assign(contentSlot.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--kwami-gap)',
  });

  if (content) {
    renderContent(content, contentSlot);
  }

  modal.appendChild(headerSlot);
  modal.appendChild(contentSlot);
  overlay.appendChild(modal);

  let isVisible = false;

  const onKeyDown = (event: KeyboardEvent) => {
    if (!closeOnEscape) return;
    if (event.key === 'Escape') {
      hide();
    }
  };

  const show = () => {
    if (isVisible) return;
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKeyDown);
    requestAnimationFrame(() => {
      overlay.style.pointerEvents = 'auto';
      overlay.style.opacity = '1';
      modal.style.opacity = '1';
      modal.style.transform = 'translateY(0) scale(1)';
    });
    isVisible = true;
  };

  const hide = () => {
    if (!isVisible) return;
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    modal.style.opacity = '0';
    modal.style.transform = 'translateY(22px) scale(0.98)';
    isVisible = false;
    document.removeEventListener('keydown', onKeyDown);
    setTimeout(() => {
      if (overlay.parentElement) {
        overlay.parentElement.removeChild(overlay);
      }
      onClose?.();
    }, 280);
  };

  const destroy = () => {
    document.removeEventListener('keydown', onKeyDown);
    if (overlay.parentElement) {
      overlay.parentElement.removeChild(overlay);
    }
  };

  closeButton.addEventListener('click', () => hide());

  if (closeOnBackdrop) {
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        hide();
      }
    });
  }

  return {
    element: modal,
    setHeader(content?: ModalContent) {
      if (!content) {
        headerText.textContent = ' ';
        headerText.style.opacity = '0';
      } else {
        headerText.style.opacity = '1';
        renderContent(content, headerText);
      }
    },
    setContent(content: ModalContent) {
      renderContent(content, contentSlot);
    },
    show,
    hide,
    destroy,
  };
}

/**
 * Backward compatibility alias
 * @deprecated Use createModal instead
 */
export const createGlassModal = createModal;
