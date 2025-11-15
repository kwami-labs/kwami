# Quick Start

Get started with Kwami in under 5 minutes.

## Installation

```bash
# Using npm
npm install kwami

# Using bun (recommended)
bun add kwami

# Using deno
deno add npm:kwami
```

## Basic Example

```typescript
import { Kwami } from "kwami";

// Get your canvas element
const canvas = document.querySelector("canvas") as HTMLCanvasElement;

// Create a Kwami instance
const kwami = new Kwami(canvas, {
  body: {
    audioFiles: ["/audio/track1.mp3"],
    initialSkin: "Poles",
    blob: {
      resolution: 180,
      colors: {
        x: "#ff0066",
        y: "#00ff66",
        z: "#6600ff",
      },
    },
  },
});

// Play audio
await kwami.body.audio.play();

// Randomize appearance
kwami.body.blob.setRandomBlob();
```

## HTML Setup

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        margin: 0;
        overflow: hidden;
      }
      canvas {
        width: 100vw;
        height: 100vh;
        display: block;
      }
    </style>
  </head>
  <body>
    <canvas id="kwami-canvas"></canvas>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

## Core Concepts

Kwami is composed of three main parts:

### 1. **Body** - Visual Representation
The 3D blob that users see and interact with.

```typescript
// Control the visual appearance
kwami.body.blob.setSkin("Poles");
kwami.body.blob.setColors("#ff0000", "#00ff00", "#0000ff");
kwami.body.setBackgroundGradient("#1a1a2e", "#16213e");
```

### 2. **Mind** - AI Capabilities
Text-to-Speech, Speech-to-Text, and conversation handling.

```typescript
// Configure AI provider
kwami.mind.initialize({
  provider: "elevenlabs",
  apiKey: "your-api-key",
  voiceId: "your-voice-id"
});

// Speak text
await kwami.mind.speak("Hello, I am Kwami!");
```

### 3. **Soul** - Personality
The personality and behavioral characteristics.

```typescript
// Load a preset personality
kwami.soul.loadPresetPersonality("friendly");

// Get personality context for AI
const systemPrompt = kwami.soul.getSystemPrompt();
```

## Interactive Features

### Audio Visualization

The blob automatically reacts to audio:

```typescript
const kwami = new Kwami(canvas, {
  body: {
    audioFiles: ["/audio/music.mp3"],
    blob: {
      spikes: { x: 0.5, y: 0.5, z: 0.5 }, // Higher = more reactive
    },
  },
});

await kwami.body.audio.play();
```

### Touch Interaction

Enable liquid-like touch effects:

```typescript
// Enable click interaction
kwami.body.enableBlobInteraction();

// Configure touch behavior
kwami.body.blob.touchStrength = 0.6;
kwami.body.blob.touchDuration = 1200;
kwami.body.blob.maxTouchPoints = 5;
```

### Animation States

Kwami supports multiple animation states:

```typescript
// Listening mode (inward spikes)
kwami.body.startListening();

// Thinking animation (chaotic movement)
kwami.body.startThinking();

// Speaking mode (outward spikes)
kwami.setState('speaking');

// Stop animations
kwami.body.stopListening();
kwami.body.stopThinking();
```

## Next Steps

- **[Core Components](../core/body.md)** - Deep dive into Body, Mind, and Soul
- **[API Reference](../api/kwami.md)** - Complete API documentation
- **[Configuration Guide](../guides/configuration.md)** - All configuration options
- **[Animation Guide](../guides/animations.md)** - Animation system details

## Common Patterns

### Audio Upload

```typescript
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  const arrayBuffer = await file.arrayBuffer();
  await kwami.body.audio.loadAudio(arrayBuffer);
  await kwami.body.audio.play();
});
```

### Skin Switching

```typescript
document.getElementById("poles-btn")?.addEventListener("click", () => {
  kwami.body.blob.setSkin("Poles");
});

document.getElementById("donut-btn")?.addEventListener("click", () => {
  kwami.body.blob.setSkin("Donut");
});

document.getElementById("vintage-btn")?.addEventListener("click", () => {
  kwami.body.blob.setSkin("Vintage");
});
```

### Background Management

```typescript
// Gradient background
kwami.body.setBackgroundGradient("#ff0066", "#00ff66");

// Solid color
kwami.body.setBackgroundColor("#000000");

// Transparent
kwami.body.setBackgroundTransparent();

// Advanced configuration
kwami.body.setBackground({
  type: "gradient",
  color1: "#ff0066",
  color2: "#00ff66",
  opacity: 0.8,
});
```

## Troubleshooting

### Audio Not Playing

Browsers require user interaction before playing audio:

```typescript
canvas.addEventListener("click", async () => {
  await kwami.body.audio.play();
}, { once: true });
```

### Blob Not Visible

Ensure canvas has dimensions:

```css
canvas {
  width: 100vw;
  height: 100vh;
  display: block;
}
```

### Performance Issues

Reduce blob resolution for better performance:

```typescript
kwami.body.blob.setResolution(120); // Lower = faster
```

---

Ready to build something amazing? Check out the [API Reference](../api/kwami.md) for more details.

