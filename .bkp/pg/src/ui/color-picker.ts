/**
 * Color Picker
 *
 * Manages the app accent color and optional glass UI mode.
 */

import { themeState } from '../core/state-manager.js';

const STORAGE_KEYS = {
  light: 'kwami-app-color-light',
  dark: 'kwami-app-color-dark',
  glass: 'kwami-ui-glass-effect',
  glassOpacity: 'kwami-ui-glass-opacity',
} as const;

type Theme = 'light' | 'dark';

type ColorPickerState = {
  initialized: boolean;
  currentColor: string;
  lightModeColor: string;
  darkModeColor: string;
};

const colorPickerState: ColorPickerState = {
  initialized: false,
  currentColor: '#667eea',
  lightModeColor: '#667eea',
  darkModeColor: '#667eea',
};

function getOppositeColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance to determine if color is dark or light
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  if (luminance < 0.15) {
    return '#ffffff';
  }
  if (luminance > 0.85) {
    return '#000000';
  }

  const invertedR = (255 - r).toString(16).padStart(2, '0');
  const invertedG = (255 - g).toString(16).padStart(2, '0');
  const invertedB = (255 - b).toString(16).padStart(2, '0');
  return `#${invertedR}${invertedG}${invertedB}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function applyAppColor(color: string): void {
  const root = document.documentElement;

  const rgb = hexToRgb(color);
  if (!rgb) return;

  const darkerShade = `#${Math.floor(rgb.r * 0.7)
    .toString(16)
    .padStart(2, '0')}${Math.floor(rgb.g * 0.7)
    .toString(16)
    .padStart(2, '0')}${Math.floor(rgb.b * 0.7)
    .toString(16)
    .padStart(2, '0')}`;

  const lighterShade = `#${Math.min(255, Math.floor(rgb.r * 1.2))
    .toString(16)
    .padStart(2, '0')}${Math.min(255, Math.floor(rgb.g * 1.2))
    .toString(16)
    .padStart(2, '0')}${Math.min(255, Math.floor(rgb.b * 1.2))
    .toString(16)
    .padStart(2, '0')}`;

  root.style.setProperty('--scrollbar-thumb', color);
  root.style.setProperty('--scrollbar-thumb-hover', darkerShade);
  root.style.setProperty('--app-primary-color', color);
  root.style.setProperty('--app-primary-dark', darkerShade);
  root.style.setProperty('--app-primary-light', lighterShade);
  
  const gradient = `linear-gradient(135deg, ${color} 0%, ${darkerShade} 100%)`;
  root.style.setProperty('--app-primary-gradient', gradient);

  // Update color preview display background
  const colorPreviewDisplay = document.getElementById('color-preview-display');
  if (colorPreviewDisplay) {
    colorPreviewDisplay.style.background = gradient;
  }

  // Firefox
  (document.documentElement.style as any).scrollbarColor = `${color} var(--scrollbar-track)`;

  // Replace old dynamic style
  const oldStyle = document.getElementById('dynamic-app-color-styles');
  if (oldStyle) oldStyle.remove();

  const style = document.createElement('style');
  style.id = 'dynamic-app-color-styles';
  style.textContent = `
    input[type="text"]:focus,
    input[type="password"]:focus,
    input[type="number"]:focus,
    textarea:focus,
    select:focus {
      border-color: ${color} !important;
      box-shadow: 0 0 0 3px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) !important;
    }
    button:not(.button-secondary):not(.color-preset):not(.menu-toggle-btn):not(.theme-toggle-btn):not(.color-picker-btn):not(.audio-toggle-btn):not(.player-btn):not(.audio-close-btn):not(.audio-loader-close):not(.media-tab):not(.provider-tab):not(.randomize-colors-btn):hover {
      box-shadow: 0 5px 15px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4) !important;
    }
    .swap-button:hover {
      box-shadow: 0 4px 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4) !important;
    }
    .provider-tab.active {
      background: linear-gradient(135deg, ${color} 0%, ${darkerShade} 100%) !important;
      color: white !important;
    }
    .media-tab.active {
      background: ${color} !important;
      color: white !important;
    }
    input[type="range"]::-webkit-slider-thumb { background: ${color} !important; }
    input[type="range"]::-moz-range-thumb { background: ${color} !important; }
    .agent-card.selected {
      border-color: ${color} !important;
      background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) !important;
    }
    a:not(.github-star-btn) { color: ${color} !important; }
    input[type="checkbox"]:checked,
    input[type="radio"]:checked { accent-color: ${color} !important; }
    .randomize-colors-btn { background: ${color} !important; color: white !important; }
    .randomize-colors-btn:hover {
      background: ${darkerShade} !important;
      box-shadow: 0 2px 8px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3) !important;
    }
    .button-secondary:hover {
      background: ${darkerShade} !important;
      box-shadow: 0 5px 15px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3) !important;
    }
    .media-loader-url-btn:hover {
      box-shadow: 0 6px 16px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4) !important;
    }
    .parameter-group-title { color: ${color} !important; }
    .value-display { color: ${color} !important; }
    .media-loader-tab.active {
      background: ${color} !important;
      border-bottom-color: ${color} !important;
      color: white !important;
    }
    h2 { color: ${color} !important; }
    input[type="color"]:hover,
    .provider-tab:hover:not(:disabled),
    .provider-tab.active,
    .media-loader-url-input:focus,
    .media-loader-upload-btn:hover,
    .media-loader-dropzone:hover,
    .media-loader-dropzone.dragover,
    .media-loader-preset-select:focus,
    .audio-controls-row .player-btn:hover:not(:disabled) {
      border-color: ${color} !important;
    }
    ::-webkit-scrollbar-thumb { background: ${color} !important; }
    ::-webkit-scrollbar-thumb:hover { background: ${darkerShade} !important; }
    * { scrollbar-color: ${color} var(--scrollbar-track) !important; }
  `;

  document.head.appendChild(style);

  // Persist per-theme
  colorPickerState.currentColor = color;
  const currentTheme: Theme = (themeState.current as Theme) || 'light';

  if (currentTheme === 'dark') {
    colorPickerState.darkModeColor = color;
  } else {
    colorPickerState.lightModeColor = color;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.light, colorPickerState.lightModeColor);
    localStorage.setItem(STORAGE_KEYS.dark, colorPickerState.darkModeColor);
  } catch {
    // ignore
  }
}

function toggleColorPicker(): void {
  const dropdown = document.getElementById('color-picker-dropdown');
  if (!dropdown) return;
  dropdown.classList.toggle('hidden');
}

function closeColorPickerOnClickOutside(event: MouseEvent): void {
  const dropdown = document.getElementById('color-picker-dropdown');
  const button = document.getElementById('color-picker-btn');

  if (!dropdown || !button) return;
  const target = event.target as Node | null;
  if (!target) return;

  if (!dropdown.contains(target) && !button.contains(target)) {
    dropdown.classList.add('hidden');
  }
}

function applyThemeSideEffects(theme: Theme): void {
  // Preserve existing behavior: choose opposite color when toggling theme.
  if (!colorPickerState.initialized) return;

  const oppositeColor = getOppositeColor(colorPickerState.currentColor);

  if (theme === 'dark') {
    colorPickerState.darkModeColor = oppositeColor;
  } else {
    colorPickerState.lightModeColor = oppositeColor;
  }

  const colorInput = document.getElementById('app-color-input') as HTMLInputElement | null;
  if (colorInput) {
    colorInput.value = oppositeColor;
  }

  applyAppColor(oppositeColor);
}

export function initializeColorPicker(): void {
  if (colorPickerState.initialized) {
    return;
  }

  const colorPickerButton = document.getElementById('color-picker-btn');
  const colorInput = document.getElementById('app-color-input') as HTMLInputElement | null;
  const dropdown = document.getElementById('color-picker-dropdown');

  if (!colorPickerButton || !colorInput || !dropdown) {
    console.warn('Color picker elements not found; skipping initialization');
    return;
  }

  const glassEffectCheckbox = document.getElementById('glass-effect-checkbox') as HTMLInputElement | null;
  const glassOpacitySlider = document.getElementById('glass-opacity-slider') as HTMLInputElement | null;
  const glassOpacityContainer = document.getElementById('glass-opacity-container') as HTMLElement | null;

  // Load saved colors
  try {
    colorPickerState.lightModeColor = localStorage.getItem(STORAGE_KEYS.light) || '#667eea';
    colorPickerState.darkModeColor = localStorage.getItem(STORAGE_KEYS.dark) || '#667eea';
  } catch {
    // ignore
  }

  const currentTheme: Theme = (themeState.current as Theme) || 'light';
  const savedColor = currentTheme === 'dark' ? colorPickerState.darkModeColor : colorPickerState.lightModeColor;

  colorInput.value = savedColor;
  applyAppColor(savedColor);

  const applyGlassOpacity = (value: number) => {
    const alpha = Math.max(0.1, Math.min(0.95, value));
    document.documentElement.style.setProperty('--glass-ui-alpha', alpha.toString());
    try {
      localStorage.setItem(STORAGE_KEYS.glassOpacity, alpha.toString());
    } catch {
      // ignore
    }
  };

  colorPickerButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleColorPicker();
  });

  colorInput.addEventListener('input', () => {
    applyAppColor(colorInput.value);
  });

  // Preset buttons
  document.querySelectorAll('.color-preset').forEach((button) => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const color = (button as HTMLElement).getAttribute('data-color');
      if (color) {
        colorInput.value = color;
        applyAppColor(color);
      }
    });
  });

  // Random color button
  const randomColorBtn = document.getElementById('random-color-btn');
  if (randomColorBtn) {
    randomColorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const randomColor = `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')}`;
      colorInput.value = randomColor;
      applyAppColor(randomColor);
    });
  }

  // Glass effect toggle + opacity
  if (glassEffectCheckbox) {
    let savedGlassEnabled = false;

    try {
      const savedGlassEffect = localStorage.getItem(STORAGE_KEYS.glass);
      if (savedGlassEffect === 'true') {
        savedGlassEnabled = true;
        glassEffectCheckbox.checked = true;
        document.body.classList.add('glass-ui');
      }
    } catch {
      // ignore
    }

    // Load / apply saved opacity (works even if glass is currently disabled).
    if (glassOpacitySlider) {
      try {
        const savedOpacity = localStorage.getItem(STORAGE_KEYS.glassOpacity);
        if (savedOpacity) {
          const parsed = parseFloat(savedOpacity);
          if (Number.isFinite(parsed)) {
            glassOpacitySlider.value = parsed.toString();
            applyGlassOpacity(parsed);
          }
        } else {
          applyGlassOpacity(parseFloat(glassOpacitySlider.value));
        }
      } catch {
        // ignore
      }

      glassOpacitySlider.addEventListener('input', (e) => {
        e.stopPropagation();
        const value = parseFloat((e.target as HTMLInputElement).value);
        if (Number.isFinite(value)) {
          applyGlassOpacity(value);
        }
      });
    }

    if (glassOpacityContainer) {
      glassOpacityContainer.style.display = savedGlassEnabled ? 'flex' : 'none';
    }

    glassEffectCheckbox.addEventListener('change', (e) => {
      e.stopPropagation();
      const enabled = (e.target as HTMLInputElement).checked;
      document.body.classList.toggle('glass-ui', enabled);
      if (glassOpacityContainer) {
        glassOpacityContainer.style.display = enabled ? 'flex' : 'none';
      }
      try {
        localStorage.setItem(STORAGE_KEYS.glass, enabled ? 'true' : 'false');
      } catch {
        // ignore
      }
    });
  }

  document.addEventListener('click', closeColorPickerOnClickOutside);
  dropdown.addEventListener('click', (e) => e.stopPropagation());

  // React to theme changes
  document.addEventListener('kwami:theme-changed', (e: Event) => {
    const detail = (e as CustomEvent).detail as { theme?: Theme } | undefined;
    const theme = detail?.theme;
    if (theme) {
      applyThemeSideEffects(theme);
    }
  });

  colorPickerState.initialized = true;
}
