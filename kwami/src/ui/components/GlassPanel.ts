import type { BaseGlassProps, GlassContent } from '../types';
import { ensureGlassBaseStyles } from '../styleRegistry';
import { resolveGlassTheme } from '../theme';

export interface GlassPanelOptions extends BaseGlassProps {
  content?: GlassContent;
  interactive?: boolean;
}

export function createGlassPanel(options: GlassPanelOptions = {}): HTMLDivElement {
  if (typeof document === 'undefined') {
    throw new Error('createGlassPanel can only be used in a browser environment');
  }

  ensureGlassBaseStyles();

  const { content, interactive = true, theme, appearance, className } = options;
  const panel = document.createElement('div');
  panel.className = ['kwami-glass-surface', className].filter(Boolean).join(' ');
  panel.style.padding = appearance?.padding ?? '1.25rem';
  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';
  panel.style.gap = appearance?.gap ?? '0.75rem';

  if (!interactive) {
    panel.style.pointerEvents = 'none';
  }

  const resolvedTheme = resolveGlassTheme(theme?.mode ?? 'auto', theme);
  applyPanelTheme(panel, resolvedTheme, appearance);

  if (content) {
    renderContent(content, panel);
  }

  return panel;
}

function applyPanelTheme(
  element: HTMLElement,
  theme: ReturnType<typeof resolveGlassTheme>,
  appearance?: GlassPanelOptions['appearance'],
): void {
  element.style.setProperty('--glass-surface', theme.palette.surface);
  element.style.setProperty('--glass-outline', theme.palette.outline);
  element.style.setProperty('--glass-text', theme.palette.text);
  element.style.setProperty('--glass-glow', theme.palette.glow);
  element.style.setProperty('--glass-shadow', theme.shadows.soft);
  element.style.setProperty('--glass-border-width', appearance?.borderWidth ?? '1px');
  element.style.setProperty('--glass-radius', appearance?.borderRadius ?? '20px');
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

