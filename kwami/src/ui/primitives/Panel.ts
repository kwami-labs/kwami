import { getThemeEngine } from '../theme/ThemeEngine';

/**
 * Panel Component (New Theme System)
 * 
 * Generic surface container using CSS variables from global theme.
 */

export type PanelContent = string | Node | Node[] | (() => Node | Node[]);

export interface PanelOptions {
  content?: PanelContent;
  interactive?: boolean;
  className?: string;
}

function renderContent(content: PanelContent, target: HTMLElement): void {
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

export function createPanel(options: PanelOptions = {}): HTMLDivElement {
  if (typeof document === 'undefined') {
    throw new Error('createPanel can only be used in a browser environment');
  }

  // Ensure theme is initialized
  const engine = getThemeEngine();
  if (!engine.getCurrent()) {
    console.warn('Theme not initialized. Call initializeTheme() first.');
  }

  const { content, interactive = true, className } = options;

  // Create panel with semantic classes
  const panel = document.createElement('div');
  panel.className = ['kwami-surface', 'kwami-panel', className]
    .filter(Boolean)
    .join(' ');
  
  Object.assign(panel.style, {
    padding: 'var(--kwami-padding)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--kwami-gap)',
  });

  if (!interactive) {
    panel.style.pointerEvents = 'none';
  }

  if (content) {
    renderContent(content, panel);
  }

  return panel;
}

/**
 * Backward compatibility alias
 * @deprecated Use createPanel instead
 */
export const createGlassPanel = createPanel;
