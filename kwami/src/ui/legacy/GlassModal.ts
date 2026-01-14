import type { BaseGlassProps, GlassContent } from './types';
import { resolveGlassTheme } from './theme';
import { ensureGlassBaseStyles } from './styleRegistry';

export interface GlassModalOptions extends BaseGlassProps {
  header?: GlassContent;
  content?: GlassContent;
  width?: number;
  maxWidth?: number | string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  onClose?: () => void;
}

export interface GlassModalHandle {
  element: HTMLDivElement;
  setHeader: (content?: GlassContent) => void;
  setContent: (content: GlassContent) => void;
  show: () => void;
  hide: () => void;
  destroy: () => void;
}

function renderContent(content: GlassContent, target: HTMLElement): void {
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

export function createGlassModal(options: GlassModalOptions = {}): GlassModalHandle {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('createGlassModal can only run in the browser');
  }

  ensureGlassBaseStyles();

  const {
    header,
    content,
    width = 520,
    maxWidth = 'calc(100vw - 40px)',
    closeOnBackdrop = true,
    closeOnEscape = true,
    onClose,
    appearance,
    className,
    theme,
  } = options;

  const resolvedTheme = resolveGlassTheme(theme?.mode ?? 'auto', theme);

  const overlay = document.createElement('div');
  overlay.className = 'kwami-glass-modal-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '10000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: resolvedTheme.mode === 'dark' ? 'rgba(2, 6, 23, 0.68)' : 'rgba(15, 23, 42, 0.35)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    opacity: '0',
    pointerEvents: 'none',
    transition: 'opacity 0.25s ease',
  });

  const modal = document.createElement('div');
  modal.className = ['kwami-glass-surface', 'kwami-glass-modal', className].filter(Boolean).join(' ');
  modal.style.width = `${width}px`;
  modal.style.maxWidth = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
  modal.style.maxHeight = 'calc(100vh - 60px)';
  modal.style.overflow = 'auto';
  modal.style.opacity = '0';
  modal.style.transform = 'translateY(22px) scale(0.98)';
  modal.style.transition = 'transform 0.28s ease, opacity 0.28s ease';
  modal.style.padding = appearance?.padding ?? '1.35rem';
  modal.style.display = 'flex';
  modal.style.flexDirection = 'column';
  modal.style.gap = appearance?.gap ?? '0.9rem';

  applySurfaceTheme(modal, resolvedTheme, appearance);

  const headerSlot = document.createElement('div');
  headerSlot.style.display = 'flex';
  headerSlot.style.alignItems = 'center';
  headerSlot.style.justifyContent = 'space-between';
  headerSlot.style.gap = '0.75rem';

  const headerText = document.createElement('div');
  headerText.style.fontSize = '1.05rem';
  headerText.style.fontWeight = '700';
  headerText.style.letterSpacing = '0.08em';
  headerText.style.textTransform = 'uppercase';
  headerText.style.color = resolvedTheme.palette.muted;

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.textContent = '✕';
  closeButton.setAttribute('aria-label', 'Close');
  Object.assign(closeButton.style, {
    border: `1px solid ${resolvedTheme.palette.outline}`,
    background: 'transparent',
    color: resolvedTheme.palette.text,
    borderRadius: '999px',
    width: '36px',
    height: '36px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  if (header) {
    renderContent(header, headerText);
  } else {
    headerText.textContent = ' '; // preserve layout
    headerText.style.opacity = '0';
  }

  headerSlot.appendChild(headerText);
  headerSlot.appendChild(closeButton);

  const contentSlot = document.createElement('div');
  contentSlot.style.display = 'flex';
  contentSlot.style.flexDirection = 'column';
  contentSlot.style.gap = '0.75rem';

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
    }, 260);
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
      if (event.target === overlay) hide();
    });
  }

  return {
    element: modal,
    setHeader(content?: GlassContent) {
      if (!content) {
        headerText.textContent = ' ';
        headerText.style.opacity = '0';
        return;
      }
      headerText.style.opacity = '1';
      renderContent(content, headerText);
    },
    setContent(content: GlassContent) {
      renderContent(content, contentSlot);
    },
    show,
    hide,
    destroy,
  };
}

function applySurfaceTheme(
  element: HTMLElement,
  theme: ReturnType<typeof resolveGlassTheme>,
  appearance?: GlassModalOptions['appearance'],
): void {
  element.style.setProperty('--glass-surface', theme.palette.surfaceSecondary);
  element.style.setProperty('--glass-outline', theme.palette.outline);
  element.style.setProperty('--glass-text', theme.palette.text);
  element.style.setProperty('--glass-glow', theme.palette.glow);
  element.style.setProperty('--glass-shadow', theme.shadows.soft);
  element.style.setProperty('--glass-border-width', appearance?.borderWidth ?? '1px');
  element.style.setProperty('--glass-radius', appearance?.borderRadius ?? '22px');
  if (appearance?.blur) {
    element.style.setProperty('--glass-blur', appearance.blur);
  }
}
