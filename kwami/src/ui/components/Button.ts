import { getThemeEngine } from '../core/theme/ThemeEngine';

/**
 * Button Component (New Theme System)
 * 
 * Uses CSS variables from the global theme.
 * All styling is controlled by the theme engine.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonContent = string | Node | Node[] | (() => Node | Node[]);

export interface ButtonOptions {
  label: ButtonContent;
  icon?: ButtonContent;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
  onClick?: (event: MouseEvent) => void;
}

export interface ButtonHandle {
  element: HTMLButtonElement;
  setDisabled: (state: boolean) => void;
  setLabel: (content: ButtonContent) => void;
  setIcon: (content?: ButtonContent) => void;
  destroy: () => void;
}

function renderContent(slot: ButtonContent, target: HTMLElement): void {
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

/**
 * Create a button component
 * 
 * The button automatically uses theme CSS variables.
 * No manual styling needed.
 */
export function createButton(options: ButtonOptions): ButtonHandle {
  if (typeof document === 'undefined') {
    throw new Error('createButton can only be used in a browser environment');
  }

  // Ensure theme is initialized
  const engine = getThemeEngine();
  if (!engine.getCurrent()) {
    console.warn('Theme not initialized. Call initializeTheme() first.');
  }

  const {
    label,
    icon,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className,
    onClick,
  } = options;

  // Create button with semantic classes
  const button = document.createElement('button');
  button.type = 'button';
  button.className = [
    'kwami-button',
    `kwami-button--${variant}`,
    `kwami-button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Create label span
  const labelSpan = document.createElement('span');
  renderContent(label, labelSpan);

  // Create icon span
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

  // Set disabled state
  if (disabled) {
    button.disabled = true;
  }

  // Add click handler
  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return {
    element: button,
    
    setDisabled(state: boolean) {
      button.disabled = state;
    },
    
    setLabel(content: ButtonContent) {
      renderContent(content, labelSpan);
    },
    
    setIcon(content?: ButtonContent) {
      if (!content) {
        iconSpan.style.display = 'none';
        iconSpan.innerHTML = '';
        return;
      }
      iconSpan.style.display = 'inline-flex';
      renderContent(content, iconSpan);
    },
    
    destroy() {
      if (button.parentElement) {
        button.parentElement.removeChild(button);
      }
    },
  };
}

/**
 * Backward compatibility alias
 * @deprecated Use createButton instead
 */
export const createGlassButton = createButton;
