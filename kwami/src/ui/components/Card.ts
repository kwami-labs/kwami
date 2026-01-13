import { getThemeEngine } from '../core/theme/ThemeEngine';

/**
 * Card Component (New Theme System)
 * 
 * Uses CSS variables from the global theme.
 * Supports header, body, and footer sections.
 */

export type CardContent = string | Node | Node[] | (() => Node | Node[]);

export interface CardOptions {
  title?: CardContent;
  headerRight?: CardContent;
  content?: CardContent;
  footer?: CardContent;
  scrollContent?: boolean;
  className?: string;
}

export interface CardHandle {
  element: HTMLDivElement;
  header: HTMLDivElement;
  body: HTMLDivElement;
  footer: HTMLDivElement;
  setTitle: (content?: CardContent) => void;
  setHeaderRight: (content?: CardContent) => void;
  setContent: (content?: CardContent) => void;
  setFooter: (content?: CardContent) => void;
  destroy: () => void;
}

function setContentInto(content: CardContent | undefined, target: HTMLElement): void {
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

/**
 * Create a card component
 * 
 * The card automatically uses theme CSS variables.
 */
export function createCard(options: CardOptions = {}): CardHandle {
  if (typeof document === 'undefined') {
    throw new Error('createCard can only be used in a browser environment');
  }

  // Ensure theme is initialized
  const engine = getThemeEngine();
  if (!engine.getCurrent()) {
    console.warn('Theme not initialized. Call initializeTheme() first.');
  }

  const {
    title,
    headerRight,
    content,
    footer,
    scrollContent = true,
    className,
  } = options;

  // Create card with semantic classes
  const card = document.createElement('div');
  card.className = ['kwami-surface', 'kwami-card', className]
    .filter(Boolean)
    .join(' ');

  // Create header
  const headerEl = document.createElement('div');
  headerEl.className = 'kwami-card__header';

  const titleEl = document.createElement('div');
  titleEl.className = 'kwami-card__title';

  const headerRightEl = document.createElement('div');
  headerRightEl.className = 'kwami-card__header-right';

  headerEl.appendChild(titleEl);
  headerEl.appendChild(headerRightEl);

  // Create body
  const bodyEl = document.createElement('div');
  bodyEl.className = 'kwami-card__body';
  if (scrollContent) {
    bodyEl.style.overflow = 'auto';
  }

  // Create footer
  const footerEl = document.createElement('div');
  footerEl.className = 'kwami-card__footer';

  // Set initial content
  setContentInto(title, titleEl);
  setContentInto(headerRight, headerRightEl);
  setContentInto(content, bodyEl);
  setContentInto(footer, footerEl);

  // Show/hide sections based on content
  headerEl.style.display = title || headerRight ? '' : 'none';
  footerEl.style.display = footer ? '' : 'none';

  // Append sections
  card.appendChild(headerEl);
  card.appendChild(bodyEl);
  card.appendChild(footerEl);

  return {
    element: card,
    header: headerEl,
    body: bodyEl,
    footer: footerEl,

    setTitle(next?: CardContent) {
      setContentInto(next, titleEl);
      headerEl.style.display = next || headerRightEl.childNodes.length ? '' : 'none';
    },

    setHeaderRight(next?: CardContent) {
      setContentInto(next, headerRightEl);
      headerEl.style.display = titleEl.childNodes.length || next ? '' : 'none';
    },

    setContent(next?: CardContent) {
      setContentInto(next, bodyEl);
    },

    setFooter(next?: CardContent) {
      setContentInto(next, footerEl);
      footerEl.style.display = next ? '' : 'none';
    },

    destroy() {
      if (card.parentElement) {
        card.parentElement.removeChild(card);
      }
    },
  };
}

/**
 * Backward compatibility alias
 * @deprecated Use createCard instead
 */
export const createGlassCard = createCard;
