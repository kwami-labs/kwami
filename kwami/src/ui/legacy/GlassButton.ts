import type { BaseGlassProps, GlassContent } from './types';
import { ensureGlassBaseStyles } from './styleRegistry';
import { resolveGlassTheme } from './theme';

export interface GlassButtonOptions extends BaseGlassProps {
  label: GlassContent;
  icon?: GlassContent;
  mode?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
}

export interface GlassButtonHandle {
  element: HTMLButtonElement;
  setDisabled: (state: boolean) => void;
  setLabel: (content: GlassContent) => void;
  setIcon: (content?: GlassContent) => void;
}

const sizePresets = {
  sm: { padding: '0.45rem 1.1rem', fontSize: '0.7rem', gap: '0.35rem' },
  md: { padding: '0.65rem 1.4rem', fontSize: '0.8rem', gap: '0.55rem' },
  lg: { padding: '0.85rem 1.8rem', fontSize: '0.9rem', gap: '0.75rem' },
};

function renderContent(slot: GlassContent, target: HTMLElement): void {
  if (typeof slot === 'string') {
    target.textContent = slot;
    return;
  }
  if (slot instanceof Node) {
    target.innerHTML = '';
    target.appendChild(slot);
    return;
  }
  if (Array.isArray(slot)) {
    target.innerHTML = '';
    slot.forEach((node) => node && target.appendChild(node));
    return;
  }
  if (typeof slot === 'function') {
    const result = slot();
    renderContent(result, target);
  }
}

export function createGlassButton(options: GlassButtonOptions): GlassButtonHandle {
  if (typeof document === 'undefined') {
    throw new Error('createGlassButton can only be used in a browser environment');
  }

  ensureGlassBaseStyles();

  const {
    label,
    icon,
    mode = 'primary',
    size = 'md',
    disabled = false,
    onClick,
    theme,
    appearance,
    className,
  } = options;

  const resolvedTheme = resolveGlassTheme(theme?.mode ?? 'auto', theme);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = ['kwami-glass-button', className].filter(Boolean).join(' ');

  const labelSpan = document.createElement('span');
  renderContent(label, labelSpan);

  const iconSpan = document.createElement('span');
  iconSpan.style.display = 'inline-flex';
  iconSpan.style.alignItems = 'center';
  iconSpan.style.justifyContent = 'center';
  if (icon) {
    renderContent(icon, iconSpan);
  } else {
    iconSpan.style.display = 'none';
  }

  button.appendChild(iconSpan);
  button.appendChild(labelSpan);

  applyButtonStyles(button, resolvedTheme, mode, size, appearance);

  if (disabled) {
    button.disabled = true;
    button.style.opacity = '0.45';
    button.style.cursor = 'not-allowed';
  }

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return {
    element: button,
    setDisabled(state: boolean) {
      button.disabled = state;
      button.style.opacity = state ? '0.45' : '1';
      button.style.cursor = state ? 'not-allowed' : 'pointer';
    },
    setLabel(content: GlassContent) {
      renderContent(content, labelSpan);
    },
    setIcon(content?: GlassContent) {
      if (!content) {
        iconSpan.style.display = 'none';
        iconSpan.innerHTML = '';
        return;
      }
      iconSpan.style.display = 'inline-flex';
      renderContent(content, iconSpan);
    },
  };
}

function applyButtonStyles(
  button: HTMLButtonElement,
  theme: ReturnType<typeof resolveGlassTheme>,
  mode: 'primary' | 'ghost' | 'outline',
  size: 'sm' | 'md' | 'lg',
  appearance?: GlassButtonOptions['appearance'],
): void {
  const palette = theme.palette;
  const sizePreset = sizePresets[size];

  button.style.setProperty('--glass-surface', palette.surface);
  button.style.setProperty('--glass-outline', palette.outline);
  button.style.setProperty('--glass-radius', appearance?.borderRadius ?? '999px');
  button.style.setProperty('--glass-border-width', appearance?.borderWidth ?? '1px');
  button.style.setProperty('--glass-text', palette.text);
  button.style.setProperty('--glass-accent', palette.accent);
  button.style.setProperty('--glass-glow', palette.glow);
  button.style.setProperty('--glass-shadow', theme.shadows.soft);
  button.style.padding = appearance?.padding ?? sizePreset.padding;
  button.style.fontSize = sizePreset.fontSize;
  button.style.gap = sizePreset.gap;

  if (appearance?.blur) {
    button.style.setProperty('--glass-blur', appearance.blur);
  }

  switch (mode) {
    case 'ghost':
      button.style.background = 'transparent';
      button.style.border = `1px dashed ${palette.outline}`;
      button.style.color = palette.muted;
      button.style.boxShadow = 'none';
      break;
    case 'outline':
      button.style.background = 'transparent';
      button.style.border = `1px solid ${palette.outline}`;
      button.style.color = palette.text;
      break;
    case 'primary':
    default:
      button.style.background = palette.surface;
      button.style.border = `1px solid ${palette.outline}`;
      button.style.color = palette.text;
      break;
  }
}

