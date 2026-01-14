/**
 * ColorPicker Primitive Component
 * 
 * A simple color input for theme customization
 */

export interface ColorPickerOptions {
  /** Current color value (hex) */
  value: string;
  /** Label text */
  label?: string;
  /** Change callback */
  onChange?: (color: string) => void;
  /** CSS class name */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export interface ColorPickerHandle {
  element: HTMLDivElement;
  setValue: (color: string) => void;
  getValue: () => string;
  setDisabled: (disabled: boolean) => void;
  destroy: () => void;
}

export function createColorPicker(options: ColorPickerOptions): ColorPickerHandle {
  if (typeof document === 'undefined') {
    throw new Error('createColorPicker can only be used in a browser environment');
  }

  const {
    value,
    label,
    onChange,
    className = '',
    disabled = false,
  } = options;

  let currentValue = value;

  // Container
  const container = document.createElement('div');
  container.className = `kwami-color-picker ${className}`;
  Object.assign(container.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  });

  // Label
  if (label) {
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    Object.assign(labelEl.style, {
      fontSize: '12px',
      fontWeight: '500',
      color: 'var(--kwami-color-text-muted, rgba(248, 250, 252, 0.7))',
    });
    container.appendChild(labelEl);
  }

  // Input container (color swatch + input + hex value)
  const inputContainer = document.createElement('div');
  Object.assign(inputContainer.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  });

  // Color swatch
  const swatch = document.createElement('div');
  swatch.className = 'kwami-color-swatch';
  Object.assign(swatch.style, {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    background: currentValue,
    border: '2px solid rgba(255, 255, 255, 0.2)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    flexShrink: '0',
    transition: 'all 0.2s ease',
  });

  // Hidden color input (native picker)
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.value = currentValue;
  colorInput.disabled = disabled;
  Object.assign(colorInput.style, {
    position: 'absolute',
    opacity: '0',
    width: '0',
    height: '0',
    pointerEvents: 'none',
  });

  // Hex input
  const hexInput = document.createElement('input');
  hexInput.type = 'text';
  hexInput.value = currentValue;
  hexInput.disabled = disabled;
  hexInput.placeholder = '#000000';
  hexInput.className = 'kwami-color-hex-input';
  Object.assign(hexInput.style, {
    flex: '1',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--kwami-color-text, #f8fafc)',
    fontSize: '13px',
    fontFamily: 'monospace',
    fontWeight: '500',
  });

  // Event handlers
  const updateColor = (newColor: string) => {
    // Validate and normalize hex color
    let normalizedColor = newColor.trim();
    if (!normalizedColor.startsWith('#')) {
      normalizedColor = '#' + normalizedColor;
    }
    
    // Basic validation
    if (/^#[0-9A-Fa-f]{6}$/.test(normalizedColor)) {
      currentValue = normalizedColor;
      colorInput.value = currentValue;
      hexInput.value = currentValue;
      swatch.style.background = currentValue;
      onChange?.(currentValue);
    }
  };

  swatch.addEventListener('click', () => {
    if (!disabled) {
      colorInput.click();
    }
  });

  colorInput.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    updateColor(target.value);
  });

  hexInput.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    updateColor(target.value);
  });

  hexInput.addEventListener('blur', () => {
    // Restore current value if invalid
    hexInput.value = currentValue;
  });

  // Hover effects
  inputContainer.addEventListener('mouseenter', () => {
    if (!disabled) {
      inputContainer.style.borderColor = 'var(--kwami-color-accent, #38bdf8)';
      inputContainer.style.background = 'rgba(255, 255, 255, 0.08)';
    }
  });

  inputContainer.addEventListener('mouseleave', () => {
    inputContainer.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    inputContainer.style.background = 'rgba(255, 255, 255, 0.05)';
  });

  inputContainer.appendChild(colorInput);
  inputContainer.appendChild(swatch);
  inputContainer.appendChild(hexInput);
  container.appendChild(inputContainer);

  return {
    element: container,
    
    setValue(newColor: string) {
      updateColor(newColor);
    },
    
    getValue() {
      return currentValue;
    },
    
    setDisabled(state: boolean) {
      colorInput.disabled = state;
      hexInput.disabled = state;
      swatch.style.cursor = state ? 'not-allowed' : 'pointer';
      inputContainer.style.opacity = state ? '0.5' : '1';
    },
    
    destroy() {
      container.remove();
    },
  };
}
