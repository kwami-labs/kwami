## Kwami UI Library

Reusable glassmorphic primitives that match Kwami’s futuristic aesthetic. The components are lightweight, framework-agnostic DOM utilities built with plain TypeScript so they work anywhere the core library runs.

### Available Components

| Component | Description |
| --- | --- |
| `createGlassButton` | Neon-inspired CTA button with optional icons and variants (primary, ghost, outline). |
| `createGlassPopover` | Floating glass panel that can be positioned anywhere (used for dashboards / inspectors). |
| `createGlassPanel` | Generic surface for grouping controls or stats. |
| `createBackgroundRings` | SVG background rings effect (framework-agnostic), with manual or auto resize handling. |

### Usage

```ts
import { createGlassButton } from '@kwami/ui';

const button = createGlassButton({
  label: 'Engage',
  icon: '⚡',
  mode: 'primary',
  onClick: () => console.log('Kwami engaged'),
});

document.body.appendChild(button.element);
```

### Theming

All components accept `theme` and `appearance` overrides so you can match your product palette:

```ts
const button = createGlassButton({
  label: 'Pulse',
  theme: {
    mode: 'dark',
    palette: {
      accent: '#f472b6',
      accentHover: '#fb7185',
    },
  },
  appearance: {
    borderRadius: '18px',
    blur: 'blur(30px)',
  },
});
```

### SSR Guard

Because the components touch DOM APIs directly, they guard against server-side usage. Create instances inside browser-only code paths.

