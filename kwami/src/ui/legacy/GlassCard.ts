import type { BaseGlassProps, GlassContent } from './types';
import { ensureGlassBaseStyles } from './styleRegistry';
import { resolveGlassTheme } from './theme';

export interface GlassCardOptions extends BaseGlassProps {
  title?: GlassContent;
  headerRight?: GlassContent;
  content?: GlassContent;
  footer?: GlassContent;
  /**
   * If true, the content area scrolls (overflow:auto). Useful for side panels.
   * Default true.
   */
  scrollContent?: boolean;

  /**
   * If true, the hover glow follows the cursor.
   * Default true for GlassCard.
   */
  cursorGlow?: boolean;
}

export interface GlassCardHandle {
  element: HTMLDivElement;
  header: HTMLDivElement;
  body: HTMLDivElement;
  footer: HTMLDivElement;

  setTitle: (content?: GlassContent) => void;
  setHeaderRight: (content?: GlassContent) => void;
  setContent: (content?: GlassContent) => void;
  setFooter: (content?: GlassContent) => void;
}

export function createGlassCard(options: GlassCardOptions = {}): GlassCardHandle {
  if (typeof document === 'undefined') {
    throw new Error('createGlassCard can only be used in a browser environment');
  }

  ensureGlassBaseStyles();

  const {
    title,
    headerRight,
    content,
    footer,
    scrollContent = true,
    cursorGlow = true,
    theme,
    appearance,
    className,
  } = options;

  const resolvedTheme = resolveGlassTheme(theme?.mode ?? 'auto', theme);

  const card = document.createElement('div');
  card.className = [
    'kwami-glass-surface',
    'kwami-glass-card',
    cursorGlow ? 'kwami-glass-card--cursorGlow' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Theme tokens (GlassCard specific tuning)
  // Use neutral glass backgrounds:
  // - light: white / very light gray
  // - dark: near-black / dark gray
  // More glassy (more transparent) while staying neutral.
  // Keep light mode white (not gray), and dark mode near-black.
  const cardSurface =
    resolvedTheme.mode === 'dark'
      ? 'rgba(0, 0, 0, 0.20)'
      : 'rgba(255, 255, 255, 0.40)';

  card.style.setProperty('--glass-surface', cardSurface);
  card.style.setProperty('--glass-outline', resolvedTheme.palette.outline);
  card.style.setProperty('--glass-text', resolvedTheme.palette.text);

  // Slightly stronger glow on cards (but still subtle)
  const cardGlow =
    resolvedTheme.mode === 'dark'
      ? 'rgba(56, 189, 248, 0.22)'
      : 'rgba(124, 58, 237, 0.18)';
  card.style.setProperty('--glass-glow', cardGlow);

  // A bit more depth for cards
  card.style.setProperty('--glass-shadow', resolvedTheme.shadows.soft);
  card.style.setProperty('--glass-border-width', appearance?.borderWidth ?? '1px');
  card.style.setProperty('--glass-radius', appearance?.borderRadius ?? '22px');

  // Make it more glassy by default
  // Reduce blur so more of the background (rings) reads through.
  // Less blur -> more background detail visible (rings stay crisp).
  card.style.setProperty(
    '--glass-blur',
    appearance?.blur ?? 'blur(10px) saturate(180%)',
  );

  const headerEl = document.createElement('div');
  headerEl.className = 'kwami-glass-card__header';

  const titleEl = document.createElement('div');
  titleEl.className = 'kwami-glass-card__title';

  const headerRightEl = document.createElement('div');
  headerRightEl.className = 'kwami-glass-card__headerRight';

  headerEl.appendChild(titleEl);
  headerEl.appendChild(headerRightEl);

  const bodyEl = document.createElement('div');
  bodyEl.className = 'kwami-glass-card__body';
  if (scrollContent) {
    bodyEl.style.overflow = 'auto';
  }

  const footerEl = document.createElement('div');
  footerEl.className = 'kwami-glass-card__footer';

  // Initial content
  setContentInto(title, titleEl);
  setContentInto(headerRight, headerRightEl);
  setContentInto(content, bodyEl);
  setContentInto(footer, footerEl);

  // Hide empty regions
  headerEl.style.display = title || headerRight ? '' : 'none';
  footerEl.style.display = footer ? '' : 'none';

  card.appendChild(headerEl);
  card.appendChild(bodyEl);
  card.appendChild(footerEl);

  return {
    element: card,
    header: headerEl,
    body: bodyEl,
    footer: footerEl,

    setTitle(next?: GlassContent) {
      setContentInto(next, titleEl);
      headerEl.style.display = next || headerRightEl.childNodes.length ? '' : 'none';
    },
    setHeaderRight(next?: GlassContent) {
      setContentInto(next, headerRightEl);
      headerEl.style.display = titleEl.childNodes.length || next ? '' : 'none';
    },
    setContent(next?: GlassContent) {
      setContentInto(next, bodyEl);
    },
    setFooter(next?: GlassContent) {
      setContentInto(next, footerEl);
      footerEl.style.display = next ? '' : 'none';
    },
  };
}

function setContentInto(content: GlassContent | undefined, target: HTMLElement): void {
  target.innerHTML = '';

  if (!content) return;

  if (typeof content === 'string') {
    target.textContent = content;
    return;
  }

  if (content instanceof Node) {
    target.appendChild(content);
    return;
  }

  if (Array.isArray(content)) {
    content.forEach((node) => node && target.appendChild(node));
    return;
  }

  if (typeof content === 'function') {
    const result = content();
    setContentInto(result as any, target);
  }
}
