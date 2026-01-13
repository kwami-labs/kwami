import type { BaseGlassProps, GlassContent } from '../types';
import { resolveGlassTheme } from '../theme';
import { ensureGlassBaseStyles } from '../styleRegistry';

export interface GlassPopoverOptions extends BaseGlassProps {
  header?: GlassContent;
  content?: GlassContent;
  width?: number;
  closeOnBlur?: boolean;
  onClose?: () => void;
}

export interface GlassPopoverHandle {
  element: HTMLDivElement;
  setHeader: (content?: GlassContent) => void;
  setContent: (content: GlassContent) => void;
  show: (x: number, y: number) => void;
  hide: () => void;
}

export function createGlassPopover(options: GlassPopoverOptions = {}): GlassPopoverHandle {
  if (typeof document === 'undefined') {
    throw new Error('createGlassPopover can only run in the browser');
  }

  ensureGlassBaseStyles();

  const {
    header,
    content,
    width = 360,
    closeOnBlur = true,
    onClose,
    appearance,
    className,
    theme,
  } = options;

  const resolvedTheme = resolveGlassTheme(theme?.mode ?? 'auto', theme);
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '10000',
    pointerEvents: 'none',
    opacity: '0',
    transition: 'opacity 0.2s ease',
  });

  const popover = document.createElement('div');
  popover.className = ['kwami-glass-surface', 'kwami-glass-popover', className]
    .filter(Boolean)
    .join(' ');
  popover.style.position = 'absolute';
  popover.style.width = `${width}px`;
  popover.style.opacity = '0';
  popover.style.transform = 'translateY(16px)';
  popover.style.transition = 'transform 0.25s ease, opacity 0.25s ease';

  applySurfaceTheme(popover, resolvedTheme, appearance);

  const headerSlot = document.createElement('div');
  headerSlot.style.fontSize = '1.05rem';
  headerSlot.style.fontWeight = '650';
  headerSlot.style.letterSpacing = '0.01em';
  headerSlot.style.textTransform = 'none';
  headerSlot.style.color = resolvedTheme.palette.muted;

  const contentSlot = document.createElement('div');
  contentSlot.style.display = 'flex';
  contentSlot.style.flexDirection = 'column';
  contentSlot.style.gap = '0.75rem';

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
    positionPopover(popover, x, y, width);
    document.body.appendChild(overlay);
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

  if (closeOnBlur) {
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) hide();
    });
  }

  return {
    element: popover,
    setHeader(content?: GlassContent) {
      if (!content) {
        headerSlot.style.display = 'none';
        headerSlot.innerHTML = '';
      } else {
        headerSlot.style.display = '';
        renderContent(content, headerSlot);
      }
    },
    setContent(content: GlassContent) {
      renderContent(content, contentSlot);
    },
    show,
    hide,
  };
}

function applySurfaceTheme(
  element: HTMLElement,
  theme: ReturnType<typeof resolveGlassTheme>,
  appearance?: GlassPopoverOptions['appearance'],
): void {
  element.style.setProperty('--glass-surface', theme.palette.surfaceSecondary);
  element.style.setProperty('--glass-outline', theme.palette.outline);
  element.style.setProperty('--glass-text', theme.palette.text);
  element.style.setProperty('--glass-glow', theme.palette.glow);
  element.style.setProperty('--glass-shadow', theme.shadows.soft);
  element.style.setProperty('--glass-border-width', appearance?.borderWidth ?? '1px');
  element.style.setProperty('--glass-radius', appearance?.borderRadius ?? '22px');
  element.style.setProperty('--glass-padding', appearance?.padding ?? '1.5rem');
  if (appearance?.blur) {
    element.style.setProperty('--glass-blur', appearance.blur);
  }
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

