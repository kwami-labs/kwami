# Kwami UI - Theme System Example

Complete example showing how end users can customize the entire UI.

## Basic Usage

```typescript
import { 
  initializeTheme,
  createButton,
  createCard,
  updateTheme,
} from '@kwami/ui';

// 1. Initialize theme (do this once at app startup)
initializeTheme({ autoLoad: true });

// 2. Create components - they automatically use the theme
const button = createButton({
  label: 'Click Me',
  variant: 'primary'
});

const card = createCard({
  title: 'My Card',
  content: 'Card content here'
});

document.body.appendChild(button.element);
document.body.appendChild(card.element);

// 3. Let users customize the theme at runtime
updateTheme({
  colors: {
    primary: '#ff6b9d',        // Pink buttons!
    surface: 'rgba(255, 255, 255, 0.9)',
  },
  effects: {
    blur: 30,                   // More glassmorphism
    borderRadius: 24,           // Rounder corners
  }
});

// Components automatically update! ✨
```

## User Customization UI

Here's a complete theme editor your users can interact with:

```typescript
import { 
  initializeTheme,
  getCurrentTheme,
  updateTheme,
  getPreset,
  setTheme,
} from '@kwami/ui';

class ThemeCustomizer {
  constructor() {
    initializeTheme({ autoLoad: true });
    this.render();
  }

  render() {
    const theme = getCurrentTheme();
    
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="theme-customizer">
        <h2>🎨 Customize Your UI</h2>
        
        <!-- Preset Selector -->
        <div class="section">
          <h3>Choose a Style</h3>
          <select id="preset-selector">
            <option value="glass">Glass (Modern)</option>
            <option value="opaque">Opaque (Classic)</option>
            <option value="solid">Solid (Flat)</option>
            <option value="minimal">Minimal (Clean)</option>
          </select>
        </div>
        
        <!-- Colors -->
        <div class="section">
          <h3>Colors</h3>
          
          <label>
            Primary Color
            <input type="color" id="primary-color" value="${theme.colors.primary}" />
          </label>
          
          <label>
            Accent Color
            <input type="color" id="accent-color" value="${theme.colors.accent}" />
          </label>
          
          <label>
            Surface Color
            <input type="color" id="surface-color" value="${this.rgbaToHex(theme.colors.surface)}" />
          </label>
        </div>
        
        <!-- Effects -->
        <div class="section">
          <h3>Effects</h3>
          
          <label>
            Blur: <span id="blur-value">${theme.effects.blur}px</span>
            <input 
              type="range" 
              id="blur-slider" 
              min="0" 
              max="40" 
              value="${theme.effects.blur}" 
            />
          </label>
          
          <label>
            Border Radius: <span id="radius-value">${theme.effects.borderRadius}px</span>
            <input 
              type="range" 
              id="radius-slider" 
              min="0" 
              max="32" 
              value="${theme.effects.borderRadius}" 
            />
          </label>
          
          <label>
            <input 
              type="checkbox" 
              id="glow-toggle" 
              ${theme.effects.glow ? 'checked' : ''}
            />
            Enable Glow Effect
          </label>
        </div>
        
        <!-- Spacing -->
        <div class="section">
          <h3>Spacing</h3>
          
          <label>
            Padding: <span id="padding-value">${theme.spacing.padding}px</span>
            <input 
              type="range" 
              id="padding-slider" 
              min="8" 
              max="32" 
              value="${theme.spacing.padding}" 
            />
          </label>
          
          <label>
            Gap: <span id="gap-value">${theme.spacing.gap}px</span>
            <input 
              type="range" 
              id="gap-slider" 
              min="4" 
              max="24" 
              value="${theme.spacing.gap}" 
            />
          </label>
        </div>
        
        <!-- Actions -->
        <div class="section actions">
          <button id="reset-btn" class="kwami-button kwami-button--secondary kwami-button--md">
            Reset to Default
          </button>
          <button id="export-btn" class="kwami-button kwami-button--ghost kwami-button--md">
            Export Theme
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(container);
    this.attachListeners();
  }

  attachListeners() {
    // Preset selector
    document.getElementById('preset-selector')?.addEventListener('change', (e) => {
      const preset = (e.target as HTMLSelectElement).value;
      setTheme(getPreset(preset as any));
      this.render(); // Refresh UI
    });

    // Primary color
    document.getElementById('primary-color')?.addEventListener('input', (e) => {
      updateTheme({ 
        colors: { primary: (e.target as HTMLInputElement).value } 
      });
    });

    // Accent color
    document.getElementById('accent-color')?.addEventListener('input', (e) => {
      updateTheme({ 
        colors: { accent: (e.target as HTMLInputElement).value } 
      });
    });

    // Blur
    document.getElementById('blur-slider')?.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      document.getElementById('blur-value')!.textContent = `${value}px`;
      updateTheme({ effects: { blur: value } });
    });

    // Border radius
    document.getElementById('radius-slider')?.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      document.getElementById('radius-value')!.textContent = `${value}px`;
      updateTheme({ effects: { borderRadius: value } });
    });

    // Glow toggle
    document.getElementById('glow-toggle')?.addEventListener('change', (e) => {
      updateTheme({ 
        effects: { glow: (e.target as HTMLInputElement).checked } 
      });
    });

    // Padding
    document.getElementById('padding-slider')?.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      document.getElementById('padding-value')!.textContent = `${value}px`;
      updateTheme({ spacing: { padding: value } });
    });

    // Gap
    document.getElementById('gap-slider')?.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      document.getElementById('gap-value')!.textContent = `${value}px`;
      updateTheme({ spacing: { gap: value } });
    });

    // Reset
    document.getElementById('reset-btn')?.addEventListener('click', () => {
      setTheme(getPreset('glass'));
      this.render();
    });

    // Export
    document.getElementById('export-btn')?.addEventListener('click', () => {
      const theme = getCurrentTheme();
      const json = JSON.stringify(theme, null, 2);
      
      // Download as file
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-theme.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  rgbaToHex(rgba: string): string {
    // Simple rgba to hex converter for color inputs
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#000000';
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
}

// Initialize the customizer
new ThemeCustomizer();
```

## Real-World Example: App with User Settings

```typescript
import {
  initializeTheme,
  updateTheme,
  onThemeChange,
  getCurrentTheme,
  type ThemeConfig,
} from '@kwami/ui';

class MyApp {
  constructor() {
    // Load user's saved theme from your backend
    this.loadUserTheme();
    
    // Listen for theme changes
    onThemeChange((event) => {
      console.log('Theme changed!', event.current);
      
      // Save to backend
      this.saveUserTheme(event.current);
    });
  }

  async loadUserTheme() {
    try {
      // Fetch from your API
      const response = await fetch('/api/user/theme');
      const theme = await response.json();
      
      // Apply the theme
      initializeTheme({ initial: theme, autoLoad: false });
    } catch (error) {
      // Fallback to default
      initializeTheme({ autoLoad: true });
    }
  }

  async saveUserTheme(theme: ThemeConfig) {
    try {
      await fetch('/api/user/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme),
      });
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  // Let user customize from settings page
  openThemeSettings() {
    const settingsPanel = document.createElement('div');
    settingsPanel.innerHTML = `
      <h2>Appearance Settings</h2>
      <p>Customize your experience</p>
      <!-- Add theme controls here -->
    `;
    
    // ... add customization controls
  }
}

// Start the app
const app = new MyApp();
```

## Component Migration

### Old Way (Glass Components)
```typescript
import { createGlassButton } from '@kwami/ui';

const button = createGlassButton({
  label: 'Click',
  theme: {
    palette: {
      primary: '#ff0000',  // Hardcoded per-component
    }
  },
  appearance: {
    borderRadius: '12px',  // Hardcoded per-component
  }
});
```

### New Way (Theme System)
```typescript
import { initializeTheme, updateTheme, createButton } from '@kwami/ui';

// Set theme once, globally
initializeTheme();
updateTheme({
  colors: { primary: '#ff0000' },     // Affects ALL components
  effects: { borderRadius: 12 },      // Affects ALL components
});

// Components just work
const button = createButton({ label: 'Click' });
```

## Benefits

✅ **One place to configure everything** - Set theme once, all components update  
✅ **User empowerment** - End users control their experience  
✅ **Persistent** - Themes saved to localStorage automatically  
✅ **Live updates** - Change takes effect immediately  
✅ **Type-safe** - Full TypeScript support  
✅ **Framework-agnostic** - Works anywhere  

## Next Steps

1. Initialize theme at app startup
2. Create your components
3. Build a theme customizer UI for your users
4. Let them make it their own!

See `core/theme/README.md` for full API documentation.
