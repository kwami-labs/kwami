/**
 * Component Library
 * 
 * Reusable UI components for Kwami Playground
 * Modern, accessible, and type-safe components
 */

// ============================================================================
// BASE COMPONENT
// ============================================================================

export abstract class Component<Props = any, State = any> {
  protected props: Props;
  protected state: State;
  protected element: HTMLElement | null;
  protected listeners: Map<string, EventListener[]>;

  constructor(props: Props, initialState: State) {
    this.props = props;
    this.state = initialState;
    this.element = null;
    this.listeners = new Map();
  }

  /**
   * Render the component
   */
  abstract render(): HTMLElement;

  /**
   * Mount component to target
   */
  mount(target: HTMLElement | string): void {
    const container = typeof target === 'string' 
      ? document.querySelector(target) as HTMLElement
      : target;

    if (!container) {
      throw new Error('Mount target not found');
    }

    this.element = this.render();
    container.appendChild(this.element);
    this.onMount();
  }

  /**
   * Unmount component
   */
  unmount(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    this.removeAllListeners();
    this.onUnmount();
    this.element = null;
  }

  /**
   * Update props
   */
  setProps(newProps: Partial<Props>): void {
    this.props = { ...this.props, ...newProps };
    this.update();
  }

  /**
   * Update state
   */
  setState(newState: Partial<State>): void {
    this.state = { ...this.state, ...newState };
    this.update();
  }

  /**
   * Update (re-render) component
   */
  protected update(): void {
    if (!this.element || !this.element.parentNode) return;

    const newElement = this.render();
    this.element.parentNode.replaceChild(newElement, this.element);
    this.element = newElement;
  }

  /**
   * Add event listener
   */
  protected addEventListener(type: string, listener: EventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);

    if (this.element) {
      this.element.addEventListener(type, listener);
    }
  }

  /**
   * Remove all event listeners
   */
  protected removeAllListeners(): void {
    if (this.element) {
      this.listeners.forEach((listeners, type) => {
        listeners.forEach(listener => {
          this.element!.removeEventListener(type, listener);
        });
      });
    }
    this.listeners.clear();
  }

  /**
   * Lifecycle: on mount
   */
  protected onMount(): void {}

  /**
   * Lifecycle: on unmount
   */
  protected onUnmount(): void {}

  /**
   * Get element
   */
  getElement(): HTMLElement | null {
    return this.element;
  }
}

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

export interface ButtonProps {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: string;
  className?: string;
}

export class Button extends Component<ButtonProps, {}> {
  constructor(props: ButtonProps) {
    super(props, {});
  }

  render(): HTMLElement {
    const button = document.createElement('button');
    button.className = `btn btn-${this.props.variant || 'primary'} ${this.props.className || ''}`;
    button.disabled = this.props.disabled || false;
    
    if (this.props.icon) {
      button.innerHTML = `${this.props.icon} ${this.props.text}`;
    } else {
      button.textContent = this.props.text;
    }

    if (this.props.onClick) {
      button.addEventListener('click', this.props.onClick);
    }

    return button;
  }
}

// ============================================================================
// SLIDER COMPONENT
// ============================================================================

export interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange?: (value: number) => void;
  unit?: string;
  showValue?: boolean;
}

export class Slider extends Component<SliderProps, { value: number }> {
  constructor(props: SliderProps) {
    super(props, { value: props.value });
  }

  render(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'slider-control';

    const label = document.createElement('label');
    label.innerHTML = `
      ${this.props.label}
      ${this.props.showValue !== false ? `<span class="value-display">${this.state.value}${this.props.unit || ''}</span>` : ''}
    `;

    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(this.props.min);
    input.max = String(this.props.max);
    input.step = String(this.props.step);
    input.value = String(this.state.value);

    input.addEventListener('input', (e) => {
      const value = parseFloat((e.target as HTMLInputElement).value);
      this.setState({ value });
      
      if (this.props.onChange) {
        this.props.onChange(value);
      }
    });

    container.appendChild(label);
    container.appendChild(input);

    return container;
  }
}

// ============================================================================
// SELECT COMPONENT
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange?: (value: string) => void;
  className?: string;
}

export class Select extends Component<SelectProps, { value: string }> {
  constructor(props: SelectProps) {
    super(props, { value: props.value });
  }

  render(): HTMLElement {
    const container = document.createElement('div');
    container.className = `input-group ${this.props.className || ''}`;

    const label = document.createElement('label');
    label.textContent = this.props.label;

    const select = document.createElement('select');
    select.value = this.state.value;

    this.props.options.forEach(option => {
      const optionEl = document.createElement('option');
      optionEl.value = option.value;
      optionEl.textContent = option.label;
      optionEl.disabled = option.disabled || false;
      select.appendChild(optionEl);
    });

    select.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value;
      this.setState({ value });
      
      if (this.props.onChange) {
        this.props.onChange(value);
      }
    });

    container.appendChild(label);
    container.appendChild(select);

    return container;
  }
}

// ============================================================================
// MODAL COMPONENT
// ============================================================================

export interface ModalProps {
  title: string;
  content: string | HTMLElement;
  onClose?: () => void;
  actions?: Array<{
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  closeOnOverlayClick?: boolean;
}

export class Modal extends Component<ModalProps, { visible: boolean }> {
  constructor(props: ModalProps) {
    super(props, { visible: false });
  }

  render(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = this.state.visible ? 'flex' : 'none';

    if (this.props.closeOnOverlayClick !== false) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.close();
        }
      });
    }

    const modal = document.createElement('div');
    modal.className = 'modal';

    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `
      <h3>${this.props.title}</h3>
      <button class="modal-close" aria-label="Close">&times;</button>
    `;

    header.querySelector('.modal-close')?.addEventListener('click', () => {
      this.close();
    });

    const body = document.createElement('div');
    body.className = 'modal-body';
    
    if (typeof this.props.content === 'string') {
      body.innerHTML = this.props.content;
    } else {
      body.appendChild(this.props.content);
    }

    modal.appendChild(header);
    modal.appendChild(body);

    if (this.props.actions && this.props.actions.length > 0) {
      const footer = document.createElement('div');
      footer.className = 'modal-footer';

      this.props.actions.forEach(action => {
        const btn = new Button({
          text: action.text,
          variant: action.variant || 'secondary',
          onClick: action.onClick
        });
        footer.appendChild(btn.render());
      });

      modal.appendChild(footer);
    }

    overlay.appendChild(modal);

    return overlay;
  }

  show(): void {
    this.setState({ visible: true });
  }

  close(): void {
    this.setState({ visible: false });
    
    if (this.props.onClose) {
      this.props.onClose();
    }
  }
}

// ============================================================================
// TABS COMPONENT
// ============================================================================

export interface TabItem {
  id: string;
  label: string;
  content: HTMLElement | string;
  icon?: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange?: (tabId: string) => void;
}

export class Tabs extends Component<TabsProps, { activeTab: string }> {
  constructor(props: TabsProps) {
    super(props, { activeTab: props.activeTab });
  }

  render(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'tabs-container';

    const tabList = document.createElement('div');
    tabList.className = 'tabs-list';

    this.props.tabs.forEach(tab => {
      const tabButton = document.createElement('button');
      tabButton.className = `tab ${this.state.activeTab === tab.id ? 'active' : ''}`;
      tabButton.textContent = tab.icon ? `${tab.icon} ${tab.label}` : tab.label;
      
      tabButton.addEventListener('click', () => {
        this.setState({ activeTab: tab.id });
        
        if (this.props.onChange) {
          this.props.onChange(tab.id);
        }
      });

      tabList.appendChild(tabButton);
    });

    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content';

    const activeTab = this.props.tabs.find(t => t.id === this.state.activeTab);
    if (activeTab) {
      if (typeof activeTab.content === 'string') {
        tabContent.innerHTML = activeTab.content;
      } else {
        tabContent.appendChild(activeTab.content);
      }
    }

    container.appendChild(tabList);
    container.appendChild(tabContent);

    return container;
  }
}

// ============================================================================
// CARD COMPONENT
// ============================================================================

export interface CardProps {
  title?: string;
  content: string | HTMLElement;
  actions?: HTMLElement[];
  className?: string;
  onClick?: () => void;
}

export class Card extends Component<CardProps, {}> {
  constructor(props: CardProps) {
    super(props, {});
  }

  render(): HTMLElement {
    const card = document.createElement('div');
    card.className = `card ${this.props.className || ''}`;

    if (this.props.onClick) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', this.props.onClick);
    }

    if (this.props.title) {
      const header = document.createElement('div');
      header.className = 'card-header';
      header.textContent = this.props.title;
      card.appendChild(header);
    }

    const body = document.createElement('div');
    body.className = 'card-body';
    
    if (typeof this.props.content === 'string') {
      body.innerHTML = this.props.content;
    } else {
      body.appendChild(this.props.content);
    }

    card.appendChild(body);

    if (this.props.actions && this.props.actions.length > 0) {
      const footer = document.createElement('div');
      footer.className = 'card-footer';
      
      this.props.actions.forEach(action => {
        footer.appendChild(action);
      });

      card.appendChild(footer);
    }

    return card;
  }
}

// ============================================================================
// TOGGLE COMPONENT
// ============================================================================

export interface ToggleProps {
  label: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export class Toggle extends Component<ToggleProps, { checked: boolean }> {
  constructor(props: ToggleProps) {
    super(props, { checked: props.checked });
  }

  render(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'toggle-control';

    const label = document.createElement('label');
    label.className = 'toggle-label';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = this.state.checked;
    input.disabled = this.props.disabled || false;

    input.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      this.setState({ checked });
      
      if (this.props.onChange) {
        this.props.onChange(checked);
      }
    });

    const slider = document.createElement('span');
    slider.className = 'toggle-slider';

    const text = document.createElement('span');
    text.className = 'toggle-text';
    text.textContent = this.props.label;

    label.appendChild(input);
    label.appendChild(slider);
    label.appendChild(text);
    container.appendChild(label);

    return container;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const Components = {
  Button,
  Slider,
  Select,
  Modal,
  Tabs,
  Card,
  Toggle
};

export default Components;


