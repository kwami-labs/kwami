# Kwami Theme System

Runtime theme customization system that allows end users to control every visual aspect of the UI.

## Features

✅ **Fully customizable** - Colors, borders, spacing, typography, effects  
✅ **Runtime switching** - Change themes instantly without page reload  
✅ **CSS Variables** - Native performance, no runtime overhead  
✅ **Persistence** - Auto-save to localStorage  
✅ **Presets** - Built-in themes (glass, opaque, solid, minimal)  
✅ **Type-safe** - Full TypeScript support  
✅ **Reactive** - Subscribe to theme changes  

## Quick Start

```typescript
import { initializeTheme, glassPreset } from '@kwami/ui/core/theme';

// Initialize with glass preset
initializeTheme({ 
  initial: glassPreset,
  autoLoad: true  // Load from localStorage if available
});
```

## Usage Examples

### 1. Using Presets

```typescript
import { setTheme, getPreset } from '@kwami/ui/core/theme';

// Apply a preset
setTheme(getPreset('glass'));    // Glassmorphism
setTheme(getPreset('opaque'));   // Solid surfaces
setTheme(getPreset('solid'));    // Flat design
setTheme(getPreset('minimal'));  // Borderless
setTheme(getPreset('dark-glass')); // Dark mode glass
```

### 2. Customizing Colors

```typescript
import { updateTheme } from '@kwami/ui/core/theme';

// Update specific colors
updateTheme({
  colors: {
    primary: '#ff6b9d',
    accent: '#00d4ff',
    surface: 'rgba(255, 255, 255, 0.85)',
  }
});
```

### 3. Adjusting Effects

```typescript
import { updateTheme } from '@kwami/ui/core/theme';

// Make it fully opaque (no glass effect)
updateTheme({
  effects: {
    blur: 0,
    opacity: 1,
    surfaceOpacity: 1,
    glow: false,
  }
});

// Increase blur for stronger glass effect
updateTheme({
  effects: {
    blur: 30,
    borderRadius: 24,
  }
});
```

### 4. Changing Spacing

```typescript
import { updateTheme } from '@kwami/ui/core/theme';

// Compact layout
updateTheme({
  spacing: {
    padding: 12,
    gap: 8,
  }
});

// Spacious layout
updateTheme({
  spacing: {
    padding: 24,
    gap: 16,
  }
});
```

### 5. Custom Typography

```typescript
import { updateTheme } from '@kwami/ui/core/theme';

// Custom fonts
updateTheme({
  typography: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 16,
    fontWeightSemibold: 600,
  }
});
```

### 6. Complete Custom Theme

```typescript
import { setTheme } from '@kwami/ui/core/theme';

const myTheme = {
  variant: 'glass' as const,
  mode: 'dark' as const,
  
  colors: {
    primary: '#ff6b9d',
    primaryHover: '#ff8ab5',
    secondary: '#00d4ff',
    secondaryHover: '#33ddff',
    
    surface: 'rgba(20, 20, 30, 0.8)',
    surfaceAlt: 'rgba(30, 30, 40, 0.7)',
    surfaceHover: 'rgba(20, 20, 30, 0.9)',
    
    border: 'rgba(255, 255, 255, 0.1)',
    borderHover: 'rgba(255, 255, 255, 0.2)',
    borderFocus: 'rgba(255, 107, 157, 0.5)',
    
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    textInverse: '#000000',
    
    accent: '#ff6b9d',
    accentHover: '#ff8ab5',
    
    success: '#10b981',
    successHover: '#34d399',
    warning: '#f59e0b',
    warningHover: '#fbbf24',
    error: '#ef4444',
    errorHover: '#f87171',
    info: '#3b82f6',
    infoHover: '#60a5fa',
    
    background: 'rgba(10, 10, 15, 0.98)',
    backgroundAlt: 'rgba(15, 15, 20, 0.95)',
  },
  
  effects: {
    blur: 20,
    blurSaturation: 180,
    opacity: 0.8,
    surfaceOpacity: 0.8,
    borderRadius: 16,
    borderRadiusSmall: 10,
    borderRadiusLarge: 24,
    borderWidth: 1,
    shadow: 'lg' as const,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    glow: true,
    glowColor: 'rgba(255, 107, 157, 0.3)',
    glowIntensity: 0.4,
    glowSpread: 60,
  },
  
  spacing: {
    paddingXs: 6,
    paddingSm: 10,
    padding: 16,
    paddingMd: 20,
    paddingLg: 24,
    paddingXl: 32,
    gapXs: 4,
    gapSm: 8,
    gap: 12,
    gapMd: 16,
    gapLg: 20,
    gapXl: 28,
    inputPadding: 12,
    inputPaddingVertical: 10,
    inputPaddingHorizontal: 14,
  },
  
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontFamilyMono: 'JetBrains Mono, monospace',
    fontSizeXs: 11,
    fontSizeSm: 13,
    fontSize: 14,
    fontSizeMd: 16,
    fontSizeLg: 18,
    fontSizeXl: 22,
    fontSize2xl: 28,
    fontWeightNormal: 400,
    fontWeightMedium: 500,
    fontWeightSemibold: 600,
    fontWeightBold: 700,
    lineHeightTight: 1.2,
    lineHeight: 1.5,
    lineHeightRelaxed: 1.75,
    letterSpacingTight: -0.01,
    letterSpacing: 0.01,
    letterSpacingWide: 0.08,
  },
  
  animation: {
    duration: 250,
    durationFast: 150,
    durationSlow: 400,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easingEnter: 'cubic-bezier(0, 0, 0.2, 1)',
    easingExit: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};

setTheme(myTheme);
```

### 7. Reactive Updates

```typescript
import { onThemeChange } from '@kwami/ui/core/theme';

// Subscribe to theme changes
const unsubscribe = onThemeChange((event) => {
  console.log('Theme changed from', event.previous.variant, 'to', event.current.variant);
  console.log('New primary color:', event.current.colors.primary);
});

// Unsubscribe when done
unsubscribe();
```

### 8. Import/Export Themes

```typescript
import { getThemeProvider } from '@kwami/ui/core/theme';

const provider = getThemeProvider();

// Export current theme to JSON
const json = provider.exportTheme();
localStorage.setItem('my-custom-theme', json);

// Import theme from JSON
const savedJson = localStorage.getItem('my-custom-theme');
if (savedJson) {
  provider.importTheme(savedJson);
}
```

### 9. Theme Editor UI

```typescript
// Example: Build a theme customization panel
import { getCurrentTheme, updateTheme } from '@kwami/ui/core/theme';

function ThemeEditor() {
  const theme = getCurrentTheme();
  
  return `
    <div>
      <h3>Customize Theme</h3>
      
      <label>
        Primary Color:
        <input 
          type="color" 
          value="${theme.colors.primary}"
          onchange="updateTheme({ colors: { primary: this.value } })"
        />
      </label>
      
      <label>
        Border Radius: ${theme.effects.borderRadius}px
        <input 
          type="range" 
          min="0" 
          max="32"
          value="${theme.effects.borderRadius}"
          oninput="updateTheme({ effects: { borderRadius: parseInt(this.value) } })"
        />
      </label>
      
      <label>
        Blur: ${theme.effects.blur}px
        <input 
          type="range" 
          min="0" 
          max="40"
          value="${theme.effects.blur}"
          oninput="updateTheme({ effects: { blur: parseInt(this.value) } })"
        />
      </label>
      
      <label>
        Glow Effect:
        <input 
          type="checkbox" 
          checked="${theme.effects.glow}"
          onchange="updateTheme({ effects: { glow: this.checked } })"
        />
      </label>
    </div>
  `;
}
```

## How It Works

### CSS Variables
The theme system generates CSS custom properties that components use:

```css
.kwami-button {
  background: var(--kwami-color-primary);
  color: var(--kwami-color-text-inverse);
  border-radius: var(--kwami-radius);
  padding: var(--kwami-padding-sm) var(--kwami-padding-md);
  transition: all var(--kwami-duration) var(--kwami-easing);
}
```

### Variants
Different visual styles controlled by the `variant` property:
- **glass** - Glassmorphism with blur and glow
- **opaque** - Solid surfaces, no transparency
- **solid** - Flat design, no shadows
- **minimal** - Borderless, ultra-clean

### Components
All Kwami components automatically use the theme:

```typescript
import { createButton } from '@kwami/ui';

// Button automatically uses theme colors, spacing, typography
const button = createButton({ 
  label: 'Click Me',
  variant: 'primary'  // Uses --kwami-color-primary
});
```

## Migration from Old System

Old code:
```typescript
createGlassButton({
  label: 'Click',
  theme: { palette: { primary: '#ff0000' } },
  appearance: { borderRadius: '12px' }
});
```

New code:
```typescript
// Set theme once globally
updateTheme({ 
  colors: { primary: '#ff0000' },
  effects: { borderRadius: 12 }
});

// Components just work
createButton({ label: 'Click', variant: 'primary' });
```

## Best Practices

1. **Initialize early** - Call `initializeTheme()` at app startup
2. **Use presets as base** - Start with a preset, then customize
3. **Persist user choices** - Enable `autoLoad: true` for localStorage
4. **Provide UI controls** - Let users customize their experience
5. **Listen to changes** - Update your app when theme changes

## API Reference

See type definitions in `types.ts` for complete API documentation.
