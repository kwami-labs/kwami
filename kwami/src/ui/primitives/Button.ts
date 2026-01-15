import { Component, ComponentProps } from '../core/Component';
import { injectComponentStyles } from '../utils/StyleUtils';

/**
 * Button Styles
 */
const BUTTON_STYLES = `
  /* Button styles */
  .kwami-button {
    font-family: var(--kwami-font-family);
    font-size: var(--kwami-font-size);
    font-weight: var(--kwami-font-weight-semibold);
    letter-spacing: var(--kwami-letter-spacing-wide);
    text-transform: uppercase;
    border: none;
    outline: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--kwami-gap-sm);
    padding: var(--kwami-padding-sm) var(--kwami-padding-md);
    cursor: pointer;
    border-radius: var(--kwami-radius);
    transition: transform var(--kwami-duration) var(--kwami-easing),
                background var(--kwami-duration) var(--kwami-easing),
                border var(--kwami-duration) var(--kwami-easing),
                color var(--kwami-duration) var(--kwami-easing),
                box-shadow var(--kwami-duration) var(--kwami-easing);
  }
  
  .kwami-button:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  
  .kwami-button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
  }
  
  .kwami-button--primary {
    background: var(--kwami-color-primary);
    color: var(--kwami-color-text-inverse);
  }
  
  .kwami-button--primary:hover:not(:disabled) {
    background: var(--kwami-color-primary-hover);
  }
  
  .kwami-button--secondary {
    background: var(--kwami-color-secondary);
    color: var(--kwami-color-text-inverse);
  }
  
  .kwami-button--secondary:hover:not(:disabled) {
    background: var(--kwami-color-secondary-hover);
  }
  
  .kwami-button--ghost {
    background: transparent;
    border: var(--kwami-border-width) dashed var(--kwami-color-border);
    color: var(--kwami-color-text-muted);
  }
  
  .kwami-button--ghost:hover:not(:disabled) {
    border-style: solid;
    color: var(--kwami-color-text);
  }
  
  .kwami-button--sm {
    padding: var(--kwami-padding-xs) var(--kwami-padding-sm);
    font-size: var(--kwami-font-size-sm);
    gap: var(--kwami-gap-xs);
  }
  
  .kwami-button--md {
    padding: var(--kwami-padding-sm) var(--kwami-padding-md);
    font-size: var(--kwami-font-size);
    gap: var(--kwami-gap-sm);
  }
  
  .kwami-button--lg {
    padding: var(--kwami-padding) var(--kwami-padding-lg);
    font-size: var(--kwami-font-size-md);
    gap: var(--kwami-gap);
  }
`;

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonContent = string | Node | Node[] | (() => Node | Node[]);

export interface ButtonProps extends ComponentProps {
  label: ButtonContent;
  icon?: ButtonContent;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
}

export class Button extends Component<ButtonProps> {
  private labelSpan!: HTMLElement;
  private iconSpan!: HTMLElement;

  constructor(props: ButtonProps) {
    super('button', props);
    injectComponentStyles('Button', BUTTON_STYLES);
    this.init();
  }

  private init(): void {
    // Set type
    this.element.setAttribute('type', 'button');

    // Add event listener
    this.element.addEventListener('click', (e) => {
      if (!this.props.disabled && this.props.onClick) {
        this.props.onClick(e as MouseEvent);
      }
    });

    // Create children
    this.iconSpan = document.createElement('span');
    Object.assign(this.iconSpan.style, {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    });
    this.element.appendChild(this.iconSpan);

    this.labelSpan = document.createElement('span');
    this.element.appendChild(this.labelSpan);

    // Initial render
    this.render();
  }

  protected onUpdate(): void {
    this.render();
  }

  private render(): void {
    const {
      label,
      icon,
      variant = 'primary',
      size = 'md',
      disabled = false,
      className
    } = this.props;

    // Update classes
    this.element.className = [
      'kwami-button',
      `kwami-button--${variant}`,
      `kwami-button--${size}`,
      className,
    ].filter(Boolean).join(' ');

    // Update disabled state
    (this.element as HTMLButtonElement).disabled = disabled;

    // Update Label
    this.renderContent(label, this.labelSpan);

    // Update Icon
    if (icon) {
      this.iconSpan.style.display = 'inline-flex';
      this.renderContent(icon, this.iconSpan);
    } else {
      this.iconSpan.style.display = 'none';
      this.iconSpan.innerHTML = '';
    }
  }

  private renderContent(slot: ButtonContent, target: HTMLElement): void {
    if (typeof slot === 'string') {
      if (target.textContent !== slot) {
        target.innerHTML = ''; // Clear potentially complex content
        target.textContent = slot;
      }
      return;
    }

    target.innerHTML = ''; // Always clear for nodes (simplified for now)

    if (slot instanceof Node) {
      target.appendChild(slot);
      return;
    }

    if (Array.isArray(slot)) {
      slot.forEach((node) => node && target.appendChild(node));
      return;
    }

    if (typeof slot === 'function') {
      this.renderContent(slot(), target);
    }
  }

  // Public API methods matching legacy Handle
  public setDisabled(state: boolean): void {
    this.update({ disabled: state });
  }

  public setLabel(content: ButtonContent): void {
    this.update({ label: content });
  }

  public setIcon(content?: ButtonContent): void {
    this.update({ icon: content });
  }
}

// Legacy Interface
export interface ButtonOptions extends ButtonProps { }

export interface ButtonHandle {
  element: HTMLButtonElement;
  setDisabled: (state: boolean) => void;
  setLabel: (content: ButtonContent) => void;
  setIcon: (content?: ButtonContent) => void;
  destroy: () => void;
}

/**
 * Create a button component (Factory)
 */
export function createButton(options: ButtonOptions): ButtonHandle {
  const button = new Button(options);

  // Return handle compatible with old API
  return {
    element: button.getElement() as HTMLButtonElement,
    setDisabled: (state) => button.setDisabled(state),
    setLabel: (content) => button.setLabel(content),
    setIcon: (content) => button.setIcon(content),
    destroy: () => button.destroy()
  };
}

/**
 * Backward compatibility alias
 * @deprecated Use createButton instead
 */
export const createGlassButton = createButton;
