# Migration Guide - Glass Components → Theme System

This guide helps you migrate from the old Glass components to the new theme system.

## Overview

**Old System:**
- Per-component styling via `theme` and `appearance` props
- Inline `style.setProperty()` calls
- Hardcoded --glass-* CSS variables
- Limited customization

**New System:**
- Global theme configured once
- CSS variables (--kwami-*) from theme engine
- Runtime user customization
- Full control over all visual properties

## Quick Migration

### 1. Initialize Theme (Once)

```typescript
// Old: No initialization needed
// New: Add at app startup
import { initializeTheme } from '@kwami/ui';

initializeTheme({ autoLoad: true });
```

### 2. Update Component Imports

```typescript
// Old imports
import { createGlassButton, createGlassCard, createGlassModal } from '@kwami/ui';

// New imports (both work, but prefer new names)
import { createButton, createCard, createModal } from '@kwami/ui';

// Or use backward-compatible aliases (same function)
import { createGlassButton, createGlassCard, createGlassModal } from '@kwami/ui';
```

### 3. Remove Per-Component Styling

```typescript
// OLD: Styling on every component
const button = createGlassButton({
  label: 'Click',
  theme: {
    palette: {
      primary: '#ff0000',
      surface: 'rgba(255, 255, 255, 0.9)',
    }
  },
  appearance: {
    borderRadius: '12px',
    padding: '16px',
  }
});

// NEW: Style globally, components just work
import { updateTheme, createButton } from '@kwami/ui';

// Configure once
updateTheme({
  colors: { primary: '#ff0000', surface: 'rgba(255, 255, 255, 0.9)' },
  effects: { borderRadius: 12 },
  spacing: { padding: 16 }
});

// Components automatically inherit
const button = createButton({ label: 'Click' });
```

## Component-by-Component Migration

### Button

```typescript
// OLD
import { createGlassButton } from '@kwami/ui';

const button = createGlassButton({
  label: 'Submit',
  icon: '✓',
  mode: 'primary',
  theme: { palette: { primary: '#007bff' } },
  appearance: { borderRadius: '8px' }
});

// NEW
import { createButton, updateTheme } from '@kwami/ui';

updateTheme({ 
  colors: { primary: '#007bff' },
  effects: { borderRadius: 8 }
});

const button = createButton({
  label: 'Submit',
  icon: '✓',
  variant: 'primary'  // 'mode' renamed to 'variant'
});
```

### Card

```typescript
// OLD
import { createGlassCard } from '@kwami/ui';

const card = createGlassCard({
  title: 'My Card',
  content: 'Content here',
  theme: { palette: { surface: '#ffffff' } },
  appearance: { padding: '24px' }
});

// NEW
import { createCard, updateTheme } from '@kwami/ui';

updateTheme({ 
  colors: { surface: '#ffffff' },
  spacing: { padding: 24 }
});

const card = createCard({
  title: 'My Card',
  content: 'Content here'
});
```

### Modal

```typescript
// OLD
import { createGlassModal } from '@kwami/ui';

const modal = createGlassModal({
  header: 'Confirm Action',
  content: 'Are you sure?',
  width: 400,
  theme: { /* ... */ }
});

// NEW
import { createModal } from '@kwami/ui';

const modal = createModal({
  header: 'Confirm Action',
  content: 'Are you sure?',
  width: 400
});
// Styling comes from global theme
```

### Popover

```typescript
// OLD
import { createGlassPopover } from '@kwami/ui';

const popover = createGlassPopover({
  header: 'Options',
  content: menuContent,
  appearance: { borderRadius: '16px' }
});

// NEW
import { createPopover, updateTheme } from '@kwami/ui';

updateTheme({ effects: { borderRadius: 16 } });

const popover = createPopover({
  header: 'Options',
  content: menuContent
});
```

### Panel

```typescript
// OLD
import { createGlassPanel } from '@kwami/ui';

const panel = createGlassPanel({
  content: myContent,
  theme: { /* ... */ }
});

// NEW
import { createPanel } from '@kwami/ui';

const panel = createPanel({
  content: myContent
});
```

## API Changes

### Removed Props

These props are **removed** from new components:
- `theme` - Use `initializeTheme()` or `updateTheme()` instead
- `appearance` - Use `updateTheme({ effects, spacing })` instead

### Renamed Props

- `mode` (Button) → `variant` (for consistency)

### New APIs

```typescript
// Theme management
initializeTheme(options)      // Initialize theme at startup
updateTheme(partial)           // Update theme properties
setTheme(config)               // Set complete theme
getCurrentTheme()              // Get current theme config
onThemeChange(listener)        // Subscribe to changes

// Presets
getPreset(name)                // Get a preset theme
listPresets()                  // List all presets

// Provider
getThemeProvider()             // Access provider directly
```

## Benefits of Migration

### Before (Old System)
```typescript
// Define styling on EVERY component
const button1 = createGlassButton({ 
  label: 'A', 
  theme: { palette: { primary: '#007bff' } } 
});
const button2 = createGlassButton({ 
  label: 'B', 
  theme: { palette: { primary: '#007bff' } } 
});
const button3 = createGlassButton({ 
  label: 'C', 
  theme: { palette: { primary: '#007bff' } } 
});
```

### After (New System)
```typescript
// Define ONCE, applies to ALL components
updateTheme({ colors: { primary: '#007bff' } });

const button1 = createButton({ label: 'A' });
const button2 = createButton({ label: 'B' });
const button3 = createButton({ label: 'C' });
```

### User Customization
```typescript
// Users can change themes live!
updateTheme({
  colors: { primary: userPreferences.brandColor },
  effects: { 
    blur: userPreferences.wantsGlass ? 20 : 0,
    borderRadius: userPreferences.roundness 
  }
});

// ALL components update instantly ✨
```

## Backward Compatibility

**Good news:** The old `createGlass*` functions still exist and work!

They're now **aliases** to the new functions:
```typescript
// These are THE SAME function:
createGlassButton === createButton  // true
createGlassCard === createCard      // true
createGlassModal === createModal    // true
// etc.
```

**However:** Old components still use `--glass-*` variables internally, so they won't benefit from theme customization.

**Recommendation:** Update to new component names and remove `theme`/`appearance` props.

## Common Issues

### Issue: "Theme not initialized" warning

```typescript
// Problem: Using components before theme is ready
const button = createButton({ label: 'Click' });
initializeTheme();  // Too late!

// Solution: Initialize theme first
initializeTheme({ autoLoad: true });
const button = createButton({ label: 'Click' });
```

### Issue: Colors don't match

```typescript
// Problem: Still using old component that doesn't read theme
import { createGlassButton } from './components/GlassButton';  // Old file

// Solution: Import from main index (gets new version)
import { createButton } from '@kwami/ui';
```

### Issue: Need per-component customization

```typescript
// Problem: Want different color on ONE button
updateTheme({ colors: { primary: '#ff0000' } });  // Affects ALL buttons

// Solution: Use className and custom CSS
const button = createButton({ 
  label: 'Special',
  className: 'my-special-button'
});

// In your CSS:
.my-special-button {
  background: #00ff00 !important;
}
```

## Migration Checklist

- [ ] Add `initializeTheme()` at app startup
- [ ] Update imports to use new component names
- [ ] Remove `theme` props from components
- [ ] Remove `appearance` props from components
- [ ] Move styling to `updateTheme()` calls
- [ ] Rename `mode` → `variant` for buttons
- [ ] Test that components inherit theme correctly
- [ ] (Optional) Build theme customization UI for users

## Need Help?

See:
- `core/theme/README.md` - Full theme API documentation
- `EXAMPLE.md` - Complete usage examples
- Type definitions in `core/theme/types.ts`

## Future Deprecation

**Timeline:**
- **Now:** Both systems work (old and new)
- **Next major version:** Old `theme`/`appearance` props deprecated with warnings
- **Version after:** Old props removed entirely

**Recommendation:** Migrate now to avoid breaking changes later.
