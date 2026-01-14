# Window Component

A fully-featured, OS-like window component for the Kwami UI library. The Window component is draggable, resizable, and includes standard window controls (minimize, maximize, close).

## Features

- ✓ **Draggable**: Move windows around by dragging the title bar
- ✓ **Resizable**: Resize from any edge or corner with 8 resize handles
- ✓ **Maximize/Restore**: Full-screen mode with restore functionality
- ✓ **Boundary Constraints**: Windows stay within viewport boundaries
- ✓ **Size Constraints**: Minimum and maximum size limits
- ✓ **Z-Index Management**: Clicking a window brings it to front automatically
- ✓ **Themeable**: Uses Kwami theme system CSS variables
- ✓ **Configurable**: Enable/disable any feature
- ✓ **Multiple Windows**: Support for multiple independent windows

## Installation

The Window component is part of the Kwami UI library. Import it from the main package:

```typescript
import { createWindow } from 'kwami/ui';
```

## Basic Usage

```typescript
import { createWindow } from 'kwami/ui';

const myWindow = createWindow({
  title: 'My Window',
  content: 'Hello, World!',
  x: 100,
  y: 100,
  width: 600,
  height: 400,
});
```

## Options

### `WindowOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | `string` | `'Window'` | Window title displayed in the title bar |
| `content` | `WindowContent` | `undefined` | Window content (string, Node, Node[], or function) |
| `x` | `number` | `100` | Initial X position (pixels from left) |
| `y` | `number` | `100` | Initial Y position (pixels from top) |
| `width` | `number` | `600` | Initial width in pixels |
| `height` | `number` | `400` | Initial height in pixels |
| `minWidth` | `number` | `200` | Minimum width in pixels |
| `minHeight` | `number` | `150` | Minimum height in pixels |
| `maxWidth` | `number` | `undefined` | Maximum width in pixels |
| `maxHeight` | `number` | `undefined` | Maximum height in pixels |
| `resizable` | `boolean` | `true` | Enable/disable window resizing |
| `draggable` | `boolean` | `true` | Enable/disable window dragging |
| `closable` | `boolean` | `true` | Show/hide close button |
| `maximizable` | `boolean` | `true` | Show/hide maximize button |
| `className` | `string` | `undefined` | Additional CSS class name |
| `onClose` | `() => void` | `undefined` | Callback when window is closed |
| `onMaximize` | `() => void` | `undefined` | Callback when window is maximized |
| `onRestore` | `() => void` | `undefined` | Callback when window is restored |
| `onMove` | `(pos: WindowPosition) => void` | `undefined` | Callback when window is moved |
| `onResize` | `(size: WindowSize) => void` | `undefined` | Callback when window is resized |

## API Methods

The `createWindow` function returns a `WindowHandle` object with the following methods:

### `setTitle(title: string): void`
Change the window title.

```typescript
myWindow.setTitle('New Title');
```

### `setContent(content: WindowContent): void`
Update the window content.

```typescript
const newContent = document.createElement('div');
newContent.textContent = 'New content!';
myWindow.setContent(newContent);
```

### `setPosition(x: number, y: number): void`
Move the window to a new position (ignored if maximized).

```typescript
myWindow.setPosition(200, 200);
```

### `setSize(width: number, height: number): void`
Resize the window (ignored if maximized).

```typescript
myWindow.setSize(800, 600);
```

### `maximize(): void`
Maximize the window to fill the viewport.

```typescript
myWindow.maximize();
```

### `restore(): void`
Restore the window to its previous size and position.

```typescript
myWindow.restore();
```

### `close(): void`
Close the window with animation and trigger `onClose` callback.

```typescript
myWindow.close();
```

### `destroy(): void`
Immediately destroy the window without animation.

```typescript
myWindow.destroy();
```

### `isMaximized(): boolean`
Check if the window is currently maximized.

```typescript
if (myWindow.isMaximized()) {
  console.log('Window is maximized');
}
```

## Advanced Examples

### Custom Content with DOM Elements

```typescript
const contentDiv = document.createElement('div');
contentDiv.innerHTML = `
  <h2>Custom Content</h2>
  <p>This is a custom window with HTML content.</p>
`;

const myWindow = createWindow({
  title: 'Custom Window',
  content: contentDiv,
  width: 500,
  height: 300,
});
```

### Fixed-Size Window

```typescript
const fixedWindow = createWindow({
  title: 'Fixed Size',
  content: 'This window cannot be resized.',
  width: 400,
  height: 300,
  resizable: false,
});
```

### Non-Draggable Window

```typescript
const staticWindow = createWindow({
  title: 'Static Position',
  content: 'This window cannot be moved.',
  x: 100,
  y: 100,
  draggable: false,
});
```

### Minimal Window (No Controls)

```typescript
const minimalWindow = createWindow({
  title: 'Minimal',
  content: 'No window controls.',
  closable: false,
  maximizable: false,
});
```

### With Event Callbacks

```typescript
const myWindow = createWindow({
  title: 'Event Demo',
  content: 'Window with event callbacks',
  onMove: (pos) => {
    console.log(`Moved to: ${pos.x}, ${pos.y}`);
  },
  onResize: (size) => {
    console.log(`Resized to: ${size.width} x ${size.height}`);
  },
  onMaximize: () => {
    console.log('Window maximized');
  },
  onRestore: () => {
    console.log('Window restored');
  },
  onClose: () => {
    console.log('Window closed');
  },
});
```

## Z-Index Management

The Window component automatically manages z-index ordering for multiple windows. When you click on any part of a window, it is automatically brought to the front.

This is handled by a global `WindowManager` singleton that:
- Tracks all active windows
- Assigns z-index values starting from 9000
- Reorders windows when clicked
- Cleans up when windows are destroyed

No manual z-index management is required - it just works!

## Architecture

The Window component is split into multiple files for maintainability:

- **`Window.ts`**: Main component factory function
- **`types.ts`**: TypeScript type definitions
- **`drag.ts`**: Drag functionality with boundary constraints
- **`resize.ts`**: Resize functionality with size constraints
- **`controls.ts`**: Window control buttons (close, maximize)
- **`utils.ts`**: Utility functions for content rendering
- **`manager.ts`**: Global window manager for z-index orchestration
- **`index.ts`**: Public exports

## Styling

The Window component uses CSS variables from the Kwami theme system. It automatically applies the `kwami-surface` class and uses the following variables:

- `--kwami-padding`, `--kwami-padding-sm`, `--kwami-padding-lg`
- `--kwami-gap`, `--kwami-gap-sm`, `--kwami-gap-md`
- `--kwami-color-border`, `--kwami-color-text`, `--kwami-color-text-muted`
- `--kwami-color-surface-hover`
- `--kwami-border-width`
- `--kwami-font-size`, `--kwami-font-size-sm`, `--kwami-font-size-lg`
- `--kwami-font-weight-medium`, `--kwami-font-weight-bold`
- `--kwami-duration`, `--kwami-easing`

## Browser Support

The Window component requires a modern browser with support for:
- ES6+
- CSS custom properties (CSS variables)
- requestAnimationFrame
- DOM APIs (createElement, appendChild, etc.)

## Testing

See `app/src/windowTest.ts` for comprehensive test examples demonstrating all features of the Window component.
