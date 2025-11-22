# Installation Guide

Complete installation instructions for Kwami across different environments and runtimes.

## Runtime Support

Kwami supports multiple JavaScript runtimes:

- **Bun** (recommended) - Fast all-in-one JavaScript runtime
- **Node.js** - Traditional JavaScript runtime  
- **Deno** - Secure TypeScript/JavaScript runtime

## Package Managers

### npm (Node.js)

```bash
npm install kwami
```

### Bun (Recommended)

```bash
bun add kwami
```

### Deno

```bash
deno add npm:kwami
```

## Dependencies

All dependencies are automatically included:

- `three` (>= 0.150.0) - 3D graphics library
- `simplex-noise` (^4.0.1) - Smooth noise generation
- `@elevenlabs/elevenlabs-js` (^2.20.1) - ElevenLabs SDK
- `js-yaml` (^4.1.1) - YAML parser for personality files

## Project Setup

### Basic Setup

Create a new project:

```bash
# Using npm
mkdir my-kwami-app
cd my-kwami-app
npm init -y
npm install kwami
```

```bash
# Using bun
mkdir my-kwami-app
cd my-kwami-app
bun init
bun add kwami
```

### TypeScript Setup

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Project Structure

Recommended project structure:

```
my-kwami-app/
├── src/
│   ├── main.ts          # Main entry point
│   ├── styles.css       # Styles
│   └── assets/
│       ├── audio/       # Audio files
│       └── personalities/  # Custom personalities
├── public/
│   └── index.html       # HTML entry
├── package.json
└── tsconfig.json
```

## Build Tools

### Vite (Recommended)

```bash
npm install -D vite
```

`vite.config.js`:

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0, // Don't inline assets
  },
  server: {
    port: 3000,
  },
});
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Webpack

```bash
npm install -D webpack webpack-cli webpack-dev-server
npm install -D ts-loader html-webpack-plugin
```

`webpack.config.js`:

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(mp3|wav|ogg)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    static: './dist',
    port: 3000,
  },
};
```

### Parcel

```bash
npm install -D parcel
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "parcel public/index.html",
    "build": "parcel build public/index.html"
  }
}
```

## Framework Integration

### React

```bash
npm install kwami react react-dom
npm install -D @types/react @types/react-dom
```

`KwamiComponent.tsx`:

```typescript
import { useEffect, useRef } from 'react';
import { Kwami } from 'kwami';
import type { KwamiConfig } from 'kwami';

interface KwamiComponentProps {
  config?: KwamiConfig;
}

export function KwamiComponent({ config }: KwamiComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const kwamiRef = useRef<Kwami | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Kwami
    kwamiRef.current = new Kwami(canvasRef.current, config);

    // Cleanup on unmount
    return () => {
      kwamiRef.current?.body.dispose();
    };
  }, [config]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100vh' }} />;
}
```

### Vue

```bash
npm install kwami vue
```

`KwamiComponent.vue`:

```vue
<template>
  <canvas ref="canvas" class="kwami-canvas"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Kwami } from 'kwami';
import type { KwamiConfig } from 'kwami';

const props = defineProps<{
  config?: KwamiConfig;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
let kwami: Kwami | null = null;

onMounted(() => {
  if (canvas.value) {
    kwami = new Kwami(canvas.value, props.config);
  }
});

onUnmounted(() => {
  kwami?.body.dispose();
});
</script>

<style scoped>
.kwami-canvas {
  width: 100%;
  height: 100vh;
  display: block;
}
</style>
```

### Svelte

```bash
npm install kwami svelte
```

`KwamiComponent.svelte`:

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Kwami } from 'kwami';
  import type { KwamiConfig } from 'kwami';

  export let config: KwamiConfig | undefined = undefined;

  let canvas: HTMLCanvasElement;
  let kwami: Kwami | null = null;

  onMount(() => {
    kwami = new Kwami(canvas, config);
  });

  onDestroy(() => {
    kwami?.body.dispose();
  });
</script>

<canvas bind:this={canvas} class="kwami-canvas"></canvas>

<style>
  .kwami-canvas {
    width: 100%;
    height: 100vh;
    display: block;
  }
</style>
```

## Environment Variables

For AI features, create `.env`:

```bash
# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here

# OpenAI Configuration (experimental)
OPENAI_API_KEY=your_openai_api_key
```

Load in your application:

```typescript
import { Kwami } from 'kwami';

const kwami = new Kwami(canvas, {
  mind: {
    provider: 'elevenlabs',
    apiKey: import.meta.env.ELEVENLABS_API_KEY,
    voiceId: import.meta.env.ELEVENLABS_VOICE_ID,
  },
});
```

## CDN Usage

For quick prototyping without a build step:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; }
    canvas { width: 100vw; height: 100vh; display: block; }
  </style>
</head>
<body>
  <canvas id="kwami"></canvas>
  
  <script type="importmap">
    {
      "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
        "kwami": "https://cdn.jsdelivr.net/npm/kwami/+esm"
      }
    }
  </script>
  
  <script type="module">
    import { Kwami } from 'kwami';
    
    const canvas = document.getElementById('kwami');
    const kwami = new Kwami(canvas);
    
    await kwami.body.audio.play();
  </script>
</body>
</html>
```

## Verification

Verify installation:

```typescript
import { Kwami } from 'kwami';

console.log('Kwami version:', Kwami.getVersion());
```

## Troubleshooting

### Module Not Found

Ensure `three` is installed:

```bash
npm install three
```

### TypeScript Errors

Install type definitions:

```bash
npm install -D @types/three
```

### Build Issues

Clear cache and reinstall:

```bash
# npm
rm -rf node_modules package-lock.json
npm install

# bun
rm -rf node_modules bun.lockb
bun install
```

### WebGL Context Issues

Check browser WebGL support:

```typescript
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

if (!gl) {
  console.error('WebGL not supported');
}
```

## Next Steps

- **[Quick Start](./quickstart.md)** - Build your first app
- **[Configuration](../guides/configuration.md)** - Configuration options
- **[Examples](./quickstart.md#common-patterns)** - Common usage patterns

---

Need help? Open an issue on [GitHub](https://github.com/alexcolls/kwami/issues).

