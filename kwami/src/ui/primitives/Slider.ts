/**
 * Slider Primitive Component
 * 
 * A customizable range slider for numeric inputs
 */

export interface SliderOptions {
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Current value */
  value: number;
  /** Step increment */
  step?: number;
  /** Label text */
  label?: string;
  /** Show current value */
  showValue?: boolean;
  /** Unit suffix (e.g., 'px', '%', 'ms') */
  unit?: string;
  /** Value formatter function */
  formatValue?: (value: number) => string;
  /** Change callback */
  onChange?: (value: number) => void;
  /** CSS class name */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export interface SliderHandle {
  element: HTMLDivElement;
  setValue: (value: number) => void;
  getValue: () => number;
  setDisabled: (disabled: boolean) => void;
  destroy: () => void;
}

export function createSlider(options: SliderOptions): SliderHandle {
  if (typeof document === 'undefined') {
    throw new Error('createSlider can only be used in a browser environment');
  }

  const {
    min,
    max,
    value,
    step = 1,
    label,
    showValue = true,
    unit = '',
    formatValue,
    onChange,
    className = '',
    disabled = false,
  } = options;

  let currentValue = Math.max(min, Math.min(max, value));

  // Container
  const container = document.createElement('div');
  container.className = `kwami-slider ${className}`;
  Object.assign(container.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  });

  // Header (label + value)
  if (label || showValue) {
    const header = document.createElement('div');
    Object.assign(header.style, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '12px',
      fontWeight: '500',
      color: 'var(--kwami-color-text, #f8fafc)',
    });

    if (label) {
      const labelEl = document.createElement('span');
      labelEl.textContent = label;
      labelEl.style.color = 'var(--kwami-color-text-muted, rgba(248, 250, 252, 0.7))';
      header.appendChild(labelEl);
    }

    if (showValue) {
      const valueEl = document.createElement('span');
      valueEl.className = 'kwami-slider-value';
      valueEl.style.fontWeight = '600';
      valueEl.style.color = 'var(--kwami-color-accent, #38bdf8)';
      const displayValue = formatValue ? formatValue(currentValue) : `${currentValue}${unit}`;
      valueEl.textContent = displayValue;
      header.appendChild(valueEl);
    }

    container.appendChild(header);
  }

  // Input element
  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(currentValue);
  input.disabled = disabled;
  input.className = 'kwami-slider-input';

  // Slider styles
  Object.assign(input.style, {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    outline: 'none',
    opacity: disabled ? '0.5' : '1',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: `linear-gradient(to right, 
      var(--kwami-color-accent, #38bdf8) 0%, 
      var(--kwami-color-accent, #38bdf8) ${((currentValue - min) / (max - min)) * 100}%, 
      rgba(255, 255, 255, 0.1) ${((currentValue - min) / (max - min)) * 100}%, 
      rgba(255, 255, 255, 0.1) 100%)`,
    WebkitAppearance: 'none',
    appearance: 'none',
  });

  // Input event handlers
  const updateValue = () => {
    currentValue = Number(input.value);
    
    // Update gradient
    input.style.background = `linear-gradient(to right, 
      var(--kwami-color-accent, #38bdf8) 0%, 
      var(--kwami-color-accent, #38bdf8) ${((currentValue - min) / (max - min)) * 100}%, 
      rgba(255, 255, 255, 0.1) ${((currentValue - min) / (max - min)) * 100}%, 
      rgba(255, 255, 255, 0.1) 100%)`;

    // Update value display
    if (showValue) {
      const valueEl = container.querySelector('.kwami-slider-value');
      if (valueEl) {
        const displayValue = formatValue ? formatValue(currentValue) : `${currentValue}${unit}`;
        valueEl.textContent = displayValue;
      }
    }

    onChange?.(currentValue);
  };

  input.addEventListener('input', updateValue);
  input.addEventListener('change', updateValue);

  container.appendChild(input);

  return {
    element: container,
    
    setValue(newValue: number) {
      currentValue = Math.max(min, Math.min(max, newValue));
      input.value = String(currentValue);
      updateValue();
    },
    
    getValue() {
      return currentValue;
    },
    
    setDisabled(state: boolean) {
      input.disabled = state;
      input.style.opacity = state ? '0.5' : '1';
      input.style.cursor = state ? 'not-allowed' : 'pointer';
    },
    
    destroy() {
      container.remove();
    },
  };
}
