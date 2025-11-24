# Advanced Documentation

Advanced topics for Kwami development including architecture, performance optimization, and custom integrations.

## Architecture

For detailed architectural documentation, see:

- **[Mind Architecture](../architecture/mind-architecture.md)** - Provider system, WebSocket handling, agent management
- **[Body Architecture](../architecture/body-architecture.md)** - Rendering pipeline, scene management, audio integration  
- **[Soul Architecture](../architecture/soul-architecture.md)** - Personality system, emotional traits, configuration

### System Design

Kwami follows a modular Mind-Body-Soul architecture:

```
┌───────────────────────────────────────┐
│            Kwami (Orchestrator)       │
├────────┬─────────────┬────────────────┤
│  Body  │    Mind     │     Soul       │
│        │             │                │
│ Scene  │  Providers  │  Personality   │
│ Blob   │  - 11Labs   │  - Emotional   │
│ Audio  │  - OpenAI   │  - Behavioral  │
└────────┴─────────────┴────────────────┘
```

### Data Flow

#### Audio Visualization
```
Audio File → Web Audio API → AnalyserNode → FFT Data → 
Vertex Displacement → Blob Animation → Render
```

#### AI Conversation
```
User Input → Mind Provider → Soul Context → 
LLM Response → TTS → Audio Output → Blob Animation
```

### Module Organization

```
src/
├── core/
│   ├── Kwami.ts              # Main orchestrator
│   ├── body/
│   │   ├── Body.ts           # Body management
│   │   ├── Audio.ts          # Audio system
│   │   ├── blob/
│   │   │   ├── Blob.ts       # Animated mesh
│   │   │   ├── animation.ts  # Animation logic
│   │   │   ├── geometry.ts   # Mesh generation
│   │   │   └── skins/        # Shader materials
│   │   └── scene/
│   │       ├── Scene.ts      # Three.js setup
│   │       └── Background.ts # Background system
│   ├── mind/
│   │   ├── Mind.ts           # Mind orchestrator
│   │   └── providers/
│   │       ├── factory.ts    # Provider creation
│   │       ├── types.ts      # Provider interface
│   │       ├── elevenlabs/   # ElevenLabs provider
│   │       └── openai/       # OpenAI provider
│   └── soul/
│       ├── Soul.ts           # Personality manager
│       └── personalities/    # YAML personalities
├── types/
│   └── index.ts              # TypeScript types
└── utils/
    ├── randoms.ts            # Random generators
    └── recorder.ts           # Audio recording
```

## Performance Optimization

### Rendering Performance

#### Reduce Blob Resolution

```typescript
// Lower resolution = better FPS
kwami.body.blob.setResolution(120);  // vs 200

// Mobile optimization
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (isMobile) {
  kwami.body.blob.setResolution(100);
}
```

#### Disable Shadows

```typescript
// Shadows are expensive
const config = {
  body: {
    scene: {
      enableShadows: false
    }
  }
};
```

#### Optimize FFT Size

```typescript
// Smaller FFT = less computation
const analyser = kwami.body.audio.getAnalyser();
analyser.fftSize = 1024;  // vs 2048

// Adjust smoothing for performance
analyser.smoothingTimeConstant = 0.6;  // vs 0.8
```

#### Limit Touch Points

```typescript
// Reduce simultaneous touch calculations
kwami.body.blob.maxTouchPoints = 3;  // vs 5
```

### Memory Management

#### Dispose Resources

```typescript
// Always dispose when done
window.addEventListener('beforeunload', () => {
  kwami.body.dispose();
});

// Or in framework cleanup
useEffect(() => {
  const kwami = new Kwami(canvas, config);
  
  return () => {
    kwami.body.dispose();  // React cleanup
  };
}, []);
```

#### Texture Management

```typescript
// Keep textures small
// Prefer 512x512 over 2048x2048

// Dispose unused textures
const texture = new THREE.TextureLoader().load('/image.jpg');
// ... use texture ...
texture.dispose();
```

#### Audio Context Limits

```typescript
// Browsers limit audio contexts (usually 6)
// Reuse contexts or dispose when done

kwami.body.audio.dispose();  // Closes audio context
```

### Network Performance

#### Lazy Load Audio

```typescript
const config = {
  body: {
    audio: {
      preload: 'none'  // Don't load until needed
    }
  }
};

// Load on demand
await kwami.body.audio.loadAudio('/audio/track.mp3');
```

#### Optimize TTS Latency

```typescript
// ElevenLabs latency optimization
const config = {
  mind: {
    provider: 'elevenlabs',
    modelId: 'eleven_turbo_v2_5',  // Fastest model
    optimizeStreamingLatency: 4,   // Maximum speed
    outputFormat: 'pcm_16000'      // Lower quality, faster
  }
};
```

#### Stream TTS Audio

```typescript
// Stream audio as it's generated
await kwami.mind.speak("Long text...", {
  streaming: true,
  onChunk: (chunk) => {
    // Play chunks as they arrive
  }
});
```

### Bundle Size Optimization

#### Tree Shaking

```typescript
// Import only what you need
import { Kwami } from 'kwami';

// Not this
import * as Kwami from 'kwami';
```

#### Dynamic Imports

```typescript
// Load heavy features on demand
const loadConversation = async () => {
  await import('kwami/conversation');
};

// Conditionally import providers
if (useElevenLabs) {
  await import('kwami/providers/elevenlabs');
}
```

## TypeScript Integration

### Type Definitions

```typescript
import type {
  // Main types
  Kwami,
  KwamiConfig,
  KwamiState,
  
  // Component types
  BodyConfig,
  MindConfig,
  SoulConfig,
  
  // Sub-component types
  BlobConfig,
  AudioConfig,
  SceneConfig,
  
  // Skin types
  BlobSkinType,
  
  // Emotional types
  EmotionalTraits,
  
  // Utility types
  Vector3,
  ColorConfig
} from 'kwami';
```

### Type-Safe Configuration

```typescript
import type { KwamiConfig } from 'kwami';

const config: KwamiConfig = {
  body: {
    audioFiles: ['/audio/track.mp3'],
    initialSkin: 'Poles',  // Type-checked
    blob: {
      resolution: 180,  // Type-checked range
      spikes: { x: 0.2, y: 0.2, z: 0.2 }
    }
  }
};
```

### Custom Type Guards

```typescript
import type { KwamiState } from 'kwami';

function isValidState(state: string): state is KwamiState {
  return ['idle', 'listening', 'thinking', 'speaking'].includes(state);
}

const state = getUserInput();
if (isValidState(state)) {
  kwami.setState(state);
}
```

### Generic Wrappers

```typescript
class KwamiManager<T extends Record<string, any>> {
  private kwami: Kwami;
  private metadata: T;
  
  constructor(canvas: HTMLCanvasElement, config: KwamiConfig, metadata: T) {
    this.kwami = new Kwami(canvas, config);
    this.metadata = metadata;
  }
  
  getMetadata(): T {
    return this.metadata;
  }
  
  getKwami(): Kwami {
    return this.kwami;
  }
}

// Usage
const manager = new KwamiManager(canvas, config, {
  userId: '123',
  sessionId: 'abc'
});
```

## Custom Provider Development

### Provider Interface

```typescript
interface MindProvider {
  initialize(config: any): Promise<void>;
  speak(text: string, options?: any): Promise<void>;
  startConversation(callbacks: ConversationCallbacks): Promise<void>;
  stopConversation(): void;
  dispose(): void;
}
```

### Creating a Custom Provider

```typescript
// kwami/src/core/mind/providers/custom/CustomProvider.ts

import type { MindProvider, ConversationCallbacks } from '../types';

export class CustomProvider implements MindProvider {
  private config: any;
  private isInitialized = false;
  
  async initialize(config: any): Promise<void> {
    this.config = config;
    // Initialize your SDK
    this.isInitialized = true;
  }
  
  async speak(text: string, options?: any): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Provider not initialized');
    }
    
    // Implement TTS
    // Generate audio and pass to audio system
  }
  
  async startConversation(callbacks: ConversationCallbacks): Promise<void> {
    // Implement conversation handling
    // Setup WebSocket/WebRTC
    // Handle callbacks
  }
  
  stopConversation(): void {
    // Stop conversation
    // Close connections
  }
  
  dispose(): void {
    // Clean up resources
    this.isInitialized = false;
  }
}
```

### Registering Custom Provider

```typescript
// kwami/src/core/mind/providers/factory.ts

import { CustomProvider } from './custom/CustomProvider';

export function createMindProvider(config: MindConfig): MindProvider {
  switch (config.provider) {
    case 'elevenlabs':
      return new ElevenLabsProvider(audio, config);
    case 'openai':
      return new OpenAIProvider(audio, config);
    case 'custom':
      return new CustomProvider(audio, config);
    default:
      return new ElevenLabsProvider(audio, config);
  }
}
```

## Custom Shaders

### Creating Custom Skins

```glsl
// vertex.glsl
uniform float time;
uniform vec3 spikes;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normal;
  vPosition = position;
  
  // Custom vertex displacement
  vec3 newPosition = position + normal * spikes.x * sin(time);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
```

```glsl
// fragment.glsl
uniform vec3 colorX;
uniform vec3 colorY;
uniform vec3 colorZ;
varying vec3 vNormal;

void main() {
  // Custom color mixing
  vec3 color = colorX * abs(vNormal.x) +
               colorY * abs(vNormal.y) +
               colorZ * abs(vNormal.z);
  
  gl_FragColor = vec4(color, 1.0);
}
```

```typescript
// index.ts
import { ShaderMaterial } from 'three';
import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export function createCustomSkin(colors: ColorConfig): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: 0 },
      spikes: { value: [0.2, 0.2, 0.2] },
      colorX: { value: colors.x },
      colorY: { value: colors.y },
      colorZ: { value: colors.z }
    }
  });
}
```

## Testing Strategies

### Unit Testing

```typescript
import { KwamiSoul } from 'kwami';

describe('KwamiSoul', () => {
  let soul: KwamiSoul;
  
  beforeEach(() => {
    soul = new KwamiSoul();
  });
  
  test('should clamp emotional traits', () => {
    soul.setEmotionalTrait('happiness', 150);
    expect(soul.getEmotionalTrait('happiness')).toBe(100);
    
    soul.setEmotionalTrait('happiness', -150);
    expect(soul.getEmotionalTrait('happiness')).toBe(-100);
  });
  
  test('should load preset personalities', () => {
    soul.loadPresetPersonality('friendly');
    expect(soul.getName()).toBe('Kaya');
  });
});
```

### Integration Testing

```typescript
import { Kwami } from 'kwami';

describe('Kwami Integration', () => {
  let canvas: HTMLCanvasElement;
  let kwami: Kwami;
  
  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    kwami = new Kwami(canvas);
  });
  
  afterEach(() => {
    kwami.body.dispose();
  });
  
  test('should initialize all components', () => {
    expect(kwami.body).toBeDefined();
    expect(kwami.mind).toBeDefined();
    expect(kwami.soul).toBeDefined();
  });
  
  test('should handle state transitions', () => {
    kwami.setState('listening');
    expect(kwami.getState()).toBe('listening');
    
    kwami.setState('speaking');
    expect(kwami.getState()).toBe('speaking');
  });
});
```

### E2E Testing

```typescript
import { test, expect } from '@playwright/test';

test('Kwami loads and renders', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Check canvas is present
  const canvas = await page.locator('canvas');
  await expect(canvas).toBeVisible();
  
  // Check WebGL context
  const hasWebGL = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl2');
    return !!gl;
  });
  expect(hasWebGL).toBe(true);
  
  // Interact with blob
  await canvas.click();
  
  // Check animation is running
  await page.waitForTimeout(1000);
  // Verify frame updates...
});
```

## Debugging

### Enable Debug Mode

```typescript
// Access internal state
console.log('Kwami version:', Kwami.getVersion());
console.log('Current state:', kwami.getState());

// Body debug
console.log('Camera:', kwami.body.getCamera());
console.log('Renderer:', kwami.body.renderer);
console.log('Blob mesh:', kwami.body.blob.getMesh());

// Audio debug
const analyser = kwami.body.audio.getAnalyser();
console.log('FFT Size:', analyser.fftSize);
console.log('Frequency data:', kwami.body.audio.getFrequencyData());

// Mind debug
console.log('Mind provider:', kwami.mind.getProvider());
console.log('Mind state:', kwami.mind.getState());

// Soul debug
console.log('Personality:', kwami.soul.getConfig());
console.log('Emotional traits:', kwami.soul.getEmotionalTraits());
```

### Performance Monitoring

```typescript
// FPS counter
let lastTime = performance.now();
let frames = 0;

function measureFPS() {
  frames++;
  const now = performance.now();
  if (now >= lastTime + 1000) {
    console.log(`FPS: ${frames}`);
    frames = 0;
    lastTime = now;
  }
  requestAnimationFrame(measureFPS);
}
measureFPS();

// Memory monitoring
setInterval(() => {
  if (performance.memory) {
    console.log('Memory:', {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1048576) + 'MB'
    });
  }
}, 5000);
```

### WebGL Debug

```typescript
// Enable WebGL debugging
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2', {
  preserveDrawingBuffer: true,
  antialias: true
});

// Check WebGL extensions
console.log('WebGL Extensions:', gl.getSupportedExtensions());

// Monitor WebGL context loss
canvas.addEventListener('webglcontextlost', (event) => {
  console.error('WebGL context lost!', event);
  event.preventDefault();
});

canvas.addEventListener('webglcontextrestored', () => {
  console.log('WebGL context restored');
  // Reinitialize Kwami
});
```

## Production Deployment

### Build Optimization

```javascript
// vite.config.js
export default {
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true  // Remove console.log
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'elevenlabs': ['@elevenlabs/elevenlabs-js']
        }
      }
    }
  }
};
```

### Error Handling

```typescript
// Global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Report to error tracking service
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Report to error tracking service
});

// Kwami-specific error handling
try {
  const kwami = new Kwami(canvas, config);
} catch (error) {
  console.error('Failed to initialize Kwami:', error);
  // Show user-friendly error message
  // Fallback UI
}
```

### Monitoring

```typescript
// Analytics integration
kwami.body.audio.addEventListener('play', () => {
  analytics.track('audio_play');
});

kwami.mind.on('conversationStart', () => {
  analytics.track('conversation_start');
});

// Performance tracking
const initStart = performance.now();
const kwami = new Kwami(canvas, config);
const initTime = performance.now() - initStart;
analytics.track('kwami_init', { duration: initTime });
```

## Related

- **[Configuration Guide](../guides/configuration.md)** - Complete configuration
- **[Core Components](../core/body.md)** - Component details
- **[API Reference](../api/kwami.md)** - Complete API

---

Advanced documentation for power users and contributors.

