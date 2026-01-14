# Core Concepts

Understanding Kwami's fundamental architecture and design principles.

## Overview

Kwami is built around a **Mind-Body-Soul** architecture that mirrors human-like intelligence and expression:

```
┌──────────────────────────────────────┐
│             KWAMI                    │
│  The Orchestrator                    │
├────────┬─────────────┬───────────────┤
│  BODY  │    MIND     │     SOUL      │
│Visual  │  AI/Voice   │  Personality  │
└────────┴─────────────┴───────────────┘
```

## The Three Components

### 1. Body - Visual Representation

The **Body** is what users see and interact with - a 3D animated blob that reacts to audio and user input.

**Key Features:**
- 3D rendering with Three.js
- Audio-reactive animations
- Multiple shader skins
- Touch interaction
- Background management
- State-based animations (listening, thinking, speaking)

**What it manages:**
- WebGL renderer and scene
- Camera and lighting
- The animated blob mesh
- Audio playback and analysis
- User interactions (click, double-click, drag)

```typescript
// Body controls appearance and interaction
kwami.body.blob.setSkin("Poles");
kwami.body.blob.setColors("#ff0066", "#00ff66", "#6600ff");
kwami.body.setBackgroundGradient("#1a1a2e", "#16213e");
kwami.body.enableBlobInteraction();
```

### 2. Mind - AI Capabilities

The **Mind** handles all AI-powered features through a provider architecture that supports multiple AI vendors.

**Key Features:**
- Text-to-Speech (TTS)
- Speech-to-Text (STT) - coming soon
- Conversational AI - beta
- Provider abstraction (ElevenLabs, OpenAI, etc.)
- Voice configuration and management

**Current Providers:**
- **ElevenLabs** (fully implemented) - TTS, Conversational AI, Agents API
- **OpenAI** (experimental) - TTS support, Realtime API pending

```typescript
// Mind handles AI interactions
await kwami.mind.initialize({
  provider: 'elevenlabs',
  apiKey: 'your-key',
  voiceId: 'voice-id'
});

await kwami.mind.speak("Hello, I am Kwami!");
```

### 3. Soul - Personality System

The **Soul** defines personality, emotional traits, and behavioral characteristics.

**Key Features:**
- Emotional trait spectrum (-100 to +100)
- 10 emotional dimensions
- Preset personalities (Kaya, Nexus, Spark)
- Custom personality loading (YAML/JSON)
- System prompt generation

**Emotional Dimensions:**
- Happiness, Energy, Confidence, Calmness, Optimism
- Socialness, Creativity, Patience, Empathy, Curiosity

```typescript
// Soul defines personality
kwami.soul.loadPresetPersonality('friendly'); // Kaya
kwami.soul.setEmotionalTrait('happiness', 80);
const systemPrompt = kwami.soul.getSystemPrompt();
```

## Data Flow

### Audio Visualization Flow

```
Audio File
    ↓
HTMLAudioElement
    ↓
Web Audio Context
    ↓
AnalyserNode (Frequency Data)
    ↓
Animation Loop
    ↓
Vertex Displacement (Simplex Noise)
    ↓
Blob Mesh Updates
```

### AI Conversation Flow

```
User Input (Text/Voice)
    ↓
Mind Provider (ElevenLabs/OpenAI)
    ↓
Soul (Personality Context)
    ↓
TTS Generation
    ↓
Audio Output
    ↓
Body Animation (Speaking State)
```

## State System

Kwami operates in different states that affect both visual and AI behavior:

### State Types

```typescript
type KwamiState = 'idle' | 'listening' | 'thinking' | 'speaking';
```

### State Behaviors

| State | Visual | Audio | Usage |
|-------|--------|-------|-------|
| **Idle** | Gentle breathing | Optional background music | Default resting state |
| **Listening** | Inward spikes | Microphone input | User speaking/recording |
| **Thinking** | Chaotic fluid movement | Silent | Processing user input |
| **Speaking** | Outward spikes | TTS output | AI response playback |

### State Transitions

All state changes are smoothly blended:

```typescript
// Automatic smooth transitions
kwami.setState('listening');  // Blob smoothly transitions to listening animation

// State-specific methods
await kwami.listen();          // Start listening (STT)
kwami.think();                 // Thinking state
await kwami.speak("Hello!");   // Speak (TTS)
```

## Animation System

### Audio Reactivity

The blob reacts to audio through frequency analysis:

```typescript
// Configure audio effects
kwami.body.blob.audioEffects = {
  bassSpike: 0.3,    // Low freq → spike intensity
  midSpike: 0.4,     // Mid freq → spike intensity
  highSpike: 0.2,    // High freq → spike intensity
  midTime: 0.5,      // Mid freq → animation speed
  highTime: 0.8,     // High freq → animation speed
  ultraTime: 0.3,    // Ultra high → animation speed
};
```

### Touch Interaction

Physical interaction creates liquid-like ripples:

```typescript
kwami.body.blob.touchStrength = 0.6;     // Impact intensity (0-1)
kwami.body.blob.touchDuration = 1200;    // Effect duration (ms)
kwami.body.blob.maxTouchPoints = 5;      // Simultaneous touches
```

### State-Based Animation

Each state has unique animation characteristics:

```typescript
// Listening: Inward audio-reactive spikes
kwami.body.startListening();

// Thinking: Chaotic contemplative movement
kwami.body.startThinking();
kwami.body.blob.thinkingDuration = 10000; // 10 seconds

// Speaking: Outward audio-reactive spikes
kwami.setState('speaking');
```

## Shader Skins

Kwami supports multiple shader-based visual styles:

### Tricolor skin

- **Poles** - Classic tricolor gradient with polar mapping
- **Donut** - Toroidal color distribution
- **Vintage** - Retro-styled stripes

```typescript
kwami.body.blob.setSkin({ skin: "tricolor", subtype: "poles" });
kwami.body.blob.setSkin({ skin: "tricolor", subtype: "donut" });
kwami.body.blob.setSkin({ skin: "tricolor", subtype: "vintage" });
```

### Custom Skins

Create custom shader materials:

```typescript
import { ShaderMaterial } from "three";

const customSkin = new ShaderMaterial({
  vertexShader: yourVertexShader,
  fragmentShader: yourFragmentShader,
  uniforms: { /* your uniforms */ }
});

kwami.body.blob.getMesh().material = customSkin;
```

## Background System

Multi-layer background management:

### Background Types

```typescript
// Gradient (Three.js or DOM)
kwami.body.setBackgroundGradient("#1a1a2e", "#16213e");

// Solid color
kwami.body.setBackgroundColor("#000000");

// Transparent
kwami.body.setBackgroundTransparent();

// Media (image/video)
kwami.body.setBackgroundImage("/path/to/image.jpg");
kwami.body.setBackgroundVideo("/path/to/video.mp4");
```

### Layering System

```
Camera
  ↓
Blob Mesh (may write stencil)
  ↓
Gradient Plane (overlay/glass mode)
  ↓
Media Plane (image/video)
  ↓
Scene Background (solid/gradient)
```

## Provider Architecture

The Mind uses a provider pattern for AI services:

### Provider Interface

```typescript
interface MindProvider {
  initialize(config: any): Promise<void>;
  speak(text: string): Promise<void>;
  startConversation(callbacks: ConversationCallbacks): Promise<void>;
  stopConversation(): void;
  dispose(): void;
}
```

### Switching Providers

```typescript
// Use ElevenLabs (default, fully implemented)
kwami.mind.setProvider('elevenlabs');

// Use OpenAI (experimental, TTS only)
kwami.mind.setProvider('openai');
```

## Memory Management

Proper cleanup prevents memory leaks:

```typescript
// Dispose when done
kwami.body.dispose();

// What gets cleaned up:
// - ResizeObserver
// - Animation frames
// - Audio context
// - WebGL resources
// - Video elements
// - Textures and geometries
```

## Event System

Kwami emits events for integration:

```typescript
// Audio events
kwami.body.audio.addEventListener('play', () => {});
kwami.body.audio.addEventListener('pause', () => {});
kwami.body.audio.addEventListener('ended', () => {});

// Conversation events
kwami.mind.on('conversationStart', () => {});
kwami.mind.on('conversationEnd', () => {});
kwami.mind.on('userSpeaking', () => {});
kwami.mind.on('aiSpeaking', () => {});
```

## Configuration Philosophy

Kwami follows a "sensible defaults with full control" approach:

```typescript
// Minimal configuration
const kwami = new Kwami(canvas);

// Full configuration
const kwami = new Kwami(canvas, {
  body: {
    audioFiles: [/* ... */],
    initialSkin: "Poles",
    scene: { /* camera, lights, controls */ },
    blob: { /* resolution, spikes, colors */ },
    audio: { /* volume, preload */ }
  },
  mind: {
    provider: "elevenlabs",
    apiKey: "key",
    voiceId: "voice"
  },
  soul: {
    name: "Kaya",
    personality: "Friendly companion",
    emotionalTraits: { /* 10 dimensions */ }
  }
});
```

## Performance Considerations

### Optimization Strategies

1. **Blob Resolution**: Lower resolution = better performance
   ```typescript
   kwami.body.blob.setResolution(120); // vs 200
   ```

2. **Audio Analysis**: Adjust FFT size
   ```typescript
   const analyser = kwami.body.audio.getAnalyser();
   analyser.fftSize = 1024; // vs 2048
   ```

3. **Texture Sizes**: Keep background textures reasonable
   ```typescript
   // Prefer 512x512 over 2048x2048
   ```

4. **Animation Frame Rate**: Use `requestAnimationFrame` wisely
   - Kwami handles this internally
   - Only one RAF loop per instance

## TypeScript Support

Kwami is fully typed:

```typescript
import type {
  KwamiConfig,
  KwamiState,
  BodyConfig,
  MindConfig,
  SoulConfig,
  BlobConfig,
  EmotionalTraits,
  BlobSkinType
} from 'kwami';
```

## Next Steps

- **[Quick Start](./quickstart.md)** - Build your first app
- **[Body Component](../core/body.md)** - Visual system details
- **[Mind Component](../core/mind.md)** - AI integration
- **[Soul Component](../core/soul.md)** - Personality system
- **[API Reference](../api/kwami.md)** - Complete API docs

---

Understanding these concepts will help you build powerful AI companions with Kwami.

