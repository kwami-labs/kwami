# Kwami API Reference

Complete API reference for the main `Kwami` orchestrator class.

## Class: Kwami

The main class that orchestrates Body, Mind, and Soul components.

### Constructor

```typescript
constructor(canvas: HTMLCanvasElement, config?: KwamiConfig)
```

**Parameters:**
- `canvas` - The HTML canvas element for rendering
- `config` - Optional configuration object

**Example:**
```typescript
const canvas = document.querySelector('canvas');
const kwami = new Kwami(canvas, {
  body: { /* body config */ },
  mind: { /* mind config */ },
  soul: { /* soul config */ }
});
```

## Properties

### body

```typescript
readonly body: KwamiBody
```

Access to the Body component (visual representation).

**Example:**
```typescript
kwami.body.blob.setSkin('Poles');
await kwami.body.audio.play();
```

### mind

```typescript
readonly mind: KwamiMind
```

Access to the Mind component (AI capabilities).

**Example:**
```typescript
await kwami.mind.initialize();
await kwami.mind.speak('Hello!');
```

### soul

```typescript
readonly soul: KwamiSoul
```

Access to the Soul component (personality).

**Example:**
```typescript
kwami.soul.loadPresetPersonality('friendly');
const systemPrompt = kwami.soul.getSystemPrompt();
```

## Static Methods

### getVersion()

```typescript
static getVersion(): string
```

Get the current version of Kwami.

**Returns:** Version string (e.g., "1.5.8")

**Example:**
```typescript
console.log('Kwami version:', Kwami.getVersion());
```

## Instance Methods

### getState()

```typescript
getState(): KwamiState
```

Get the current state of Kwami.

**Returns:** `'idle' | 'listening' | 'thinking' | 'speaking'`

**Example:**
```typescript
const state = kwami.getState();
if (state === 'listening') {
  console.log('Kwami is listening');
}
```

### setState()

```typescript
setState(state: KwamiState): void
```

Set the state of Kwami. Automatically adjusts blob animation.

**Parameters:**
- `state` - The state to set: `'idle' | 'listening' | 'thinking' | 'speaking'`

**State Behaviors:**

| State | Blob Animation | Use Case |
|-------|----------------|----------|
| `idle` | Gentle breathing | Default resting state |
| `listening` | Inward spikes, responsive | User speaking |
| `thinking` | Chaotic, contemplative | Processing input |
| `speaking` | Outward spikes, expressive | AI responding |

**Example:**
```typescript
kwami.setState('listening');
kwami.setState('thinking');
kwami.setState('speaking');
kwami.setState('idle');
```

### listen()

```typescript
async listen(): Promise<void>
```

Start listening mode (activates microphone and listening animation).

**Returns:** Promise that resolves when microphone is active

**Example:**
```typescript
await kwami.listen();
// Blob shows listening animation
// Microphone is active
```

### think()

```typescript
think(): void
```

Activate thinking animation (chaotic fluid movement).

**Example:**
```typescript
kwami.think();
// Blob enters contemplative state
```

### speak()

```typescript
async speak(text: string): Promise<void>
```

Speak text using TTS and animate the blob.

**Parameters:**
- `text` - The text to speak

**Returns:** Promise that resolves when speech completes

**Example:**
```typescript
await kwami.speak('Hello, I am Kwami!');
// Blob animates while speaking
```

## Configuration Interface

### KwamiConfig

```typescript
interface KwamiConfig {
  body?: BodyConfig;
  mind?: MindConfig;
  soul?: SoulConfig;
}
```

Complete configuration for Kwami instance.

**Example:**
```typescript
const config: KwamiConfig = {
  body: {
    audioFiles: ['/audio/track.mp3'],
    initialSkin: 'Poles',
    scene: {
      fov: 100,
      cameraPosition: { x: 0, y: 6, z: 0 }
    },
    blob: {
      resolution: 180,
      colors: {
        x: '#ff0066',
        y: '#00ff66',
        z: '#6600ff'
      }
    }
  },
  mind: {
    provider: 'elevenlabs',
    apiKey: 'your-key',
    voiceId: 'voice-id'
  },
  soul: {
    name: 'Kaya',
    personality: 'Friendly companion',
    emotionalTraits: {
      happiness: 75,
      empathy: 95,
      // ... other traits
    }
  }
};

const kwami = new Kwami(canvas, config);
```

## Type Definitions

### KwamiState

```typescript
type KwamiState = 'idle' | 'listening' | 'thinking' | 'speaking';
```

Possible states for Kwami.

## Usage Examples

### Basic Setup

```typescript
import { Kwami } from 'kwami';

const canvas = document.querySelector('canvas');
const kwami = new Kwami(canvas);

// Play audio
await kwami.body.audio.play();

// Randomize appearance
kwami.body.blob.setRandomBlob();
```

### Full Configuration

```typescript
import { Kwami } from 'kwami';
import type { KwamiConfig } from 'kwami';

const canvas = document.querySelector('canvas');

const config: KwamiConfig = {
  body: {
    audioFiles: ['/audio/music.mp3'],
    initialSkin: 'Poles',
    blob: {
      resolution: 180,
      spikes: { x: 0.3, y: 0.3, z: 0.3 }
    }
  },
  mind: {
    provider: 'elevenlabs',
    apiKey: process.env.ELEVENLABS_API_KEY,
    voiceId: process.env.ELEVENLABS_VOICE_ID
  },
  soul: {
    name: 'Kaya',
    personality: 'Friendly AI companion'
  }
};

const kwami = new Kwami(canvas, config);
```

### Interactive Application

```typescript
const kwami = new Kwami(canvas);

// Load personality
kwami.soul.loadPresetPersonality('friendly');

// Initialize AI
await kwami.mind.initialize();

// Enable interaction
kwami.body.enableBlobInteraction();

// Handle user click
document.getElementById('speak-btn')?.addEventListener('click', async () => {
  kwami.setState('thinking');
  const text = "Hello! How can I help you today?";
  await kwami.speak(text);
  kwami.setState('idle');
});

// Start conversation
document.getElementById('talk-btn')?.addEventListener('click', async () => {
  await kwami.mind.startConversation({
    systemPrompt: kwami.soul.getSystemPrompt(),
    onUserSpeaking: () => kwami.setState('listening'),
    onAISpeaking: () => kwami.setState('speaking'),
    onEnd: () => kwami.setState('idle')
  });
});
```

### State Management

```typescript
// Manual state control
kwami.setState('idle');
await kwami.body.audio.play();

// User interaction
kwami.body.enableBlobInteraction(() => {
  kwami.think();
  setTimeout(() => kwami.setState('idle'), 2000);
});

// Voice interaction
await kwami.listen();  // User speaks
kwami.think();         // Process input
await kwami.speak(response);  // AI responds
kwami.setState('idle');
```

### Cleanup

```typescript
// When done with Kwami
kwami.body.dispose();

// Cleans up:
// - Animation loops
// - Audio context
// - WebGL resources
// - Event listeners
// - Video elements
```

## Component Access

### Body Methods

Quick access to Body component methods:

```typescript
// Blob
kwami.body.blob.setSkin('Poles');
kwami.body.blob.setRandomBlob();
kwami.body.blob.setScale(1.5);

// Audio
await kwami.body.audio.play();
kwami.body.audio.pause();
kwami.body.audio.setVolume(0.7);

// Background
kwami.body.setBackgroundGradient('#1a1a2e', '#16213e');
kwami.body.setBackgroundImage('/path/to/image.jpg');

// Animation
kwami.body.startListening();
kwami.body.startThinking();
kwami.body.stopListening();
kwami.body.stopThinking();
```

### Mind Methods

Quick access to Mind component methods:

```typescript
// Initialization
await kwami.mind.initialize();

// TTS
await kwami.mind.speak('Hello!');

// Voice settings
kwami.mind.setStability(0.5);
kwami.mind.setSimilarityBoost(0.75);
kwami.mind.setOptimizeStreamingLatency(3);

// Conversation
await kwami.mind.startConversation({ /* callbacks */ });
kwami.mind.stopConversation();

// Provider switching
await kwami.mind.setProvider('elevenlabs');
await kwami.mind.setProvider('openai');
```

### Soul Methods

Quick access to Soul component methods:

```typescript
// Load personality
kwami.soul.loadPresetPersonality('friendly');
await kwami.soul.loadPersonality('./custom.yaml');

// Emotional traits
kwami.soul.setEmotionalTrait('happiness', 80);
const traits = kwami.soul.getEmotionalTraits();

// Configuration
kwami.soul.setConversationStyle('friendly');
kwami.soul.setLanguage('en');

// System prompt
const systemPrompt = kwami.soul.getSystemPrompt();
```

## Error Handling

```typescript
try {
  const kwami = new Kwami(canvas, config);
  await kwami.body.audio.play();
} catch (error) {
  console.error('Failed to initialize Kwami:', error);
}

// State-specific errors
try {
  await kwami.listen();
} catch (error) {
  console.error('Microphone access denied:', error);
}

try {
  await kwami.speak('Hello!');
} catch (error) {
  console.error('TTS failed:', error);
}
```

## Best Practices

### 1. Always Handle Async Operations

```typescript
// Good
await kwami.listen();
await kwami.speak('Hello!');

// Bad - missing await
kwami.listen();  // Won't wait for completion
kwami.speak('Hello!');
```

### 2. Check State Before Transitions

```typescript
// Good
if (kwami.getState() !== 'speaking') {
  kwami.setState('listening');
}

// Bad - abrupt state change
kwami.setState('listening');  // Might interrupt speaking
```

### 3. Clean Up Resources

```typescript
// Always dispose when done
window.addEventListener('beforeunload', () => {
  kwami.body.dispose();
});
```

### 4. Use TypeScript

```typescript
import type { Kwami, KwamiConfig, KwamiState } from 'kwami';

const config: KwamiConfig = { /* ... */ };
const kwami: Kwami = new Kwami(canvas, config);
const state: KwamiState = kwami.getState();
```

## Related

- **[Body API](./body.md)** - Visual component API
- **[Mind API](./mind.md)** - AI component API
- **[Soul API](./soul.md)** - Personality component API
- **[Configuration Guide](../guides/configuration.md)** - Complete configuration reference

---

The Kwami class provides a unified interface for creating AI companions.

