# Configuration Guide

Complete configuration reference for Kwami.

## Overview

Kwami follows a "sensible defaults with full control" philosophy. You can start with minimal configuration and progressively add options as needed.

## Minimal Configuration

```typescript
const kwami = new Kwami(canvas);
```

This creates a Kwami instance with all defaults:
- Default blob appearance
- No audio files
- No AI provider
- Default personality

## Complete Configuration Structure

```typescript
interface KwamiConfig {
  body?: BodyConfig;
  mind?: MindConfig;
  soul?: SoulConfig;
}
```

## Body Configuration

### BodyConfig Interface

```typescript
interface BodyConfig {
  // Audio files for playlist
  audioFiles?: string[];
  
  // Initial skin type
  initialSkin?: BlobSkinType;
  
  // Audio settings
  audio?: AudioConfig;
  
  // Scene settings
  scene?: SceneConfig;
  
  // Blob settings
  blob?: BlobConfig;
}
```

### Audio Configuration

```typescript
interface AudioConfig {
  preload?: 'none' | 'metadata' | 'auto';
  autoInitialize?: boolean;
  volume?: number;  // 0-1
}
```

**Example:**
```typescript
const config = {
  body: {
    audioFiles: [
      '/audio/track1.mp3',
      '/audio/track2.mp3'
    ],
    audio: {
      preload: 'auto',
      autoInitialize: true,
      volume: 0.8
    }
  }
};
```

### Scene Configuration

```typescript
interface SceneConfig {
  fov?: number;              // Field of view (default: 100)
  near?: number;             // Near clipping plane (default: 0.1)
  far?: number;              // Far clipping plane (default: 1000)
  cameraPosition?: Vector3;  // Camera position
  enableShadows?: boolean;   // Enable soft shadows
  enableControls?: boolean;  // Enable orbit controls (debug)
  background?: SceneBackgroundConfig;
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
}
```

**Example:**
```typescript
const config = {
  body: {
    scene: {
      fov: 100,
      near: 0.1,
      far: 1000,
      cameraPosition: { x: 0, y: 6, z: 0 },
      enableShadows: true,
      enableControls: false
    }
  }
};
```

### Background Configuration

```typescript
interface SceneBackgroundConfig {
  type: 'gradient' | 'solid' | 'transparent' | 'image' | 'video';
  color1?: string;
  color2?: string;
  color3?: string;
  opacity?: number;
  gradient?: GradientConfig;
  image?: MediaConfig;
  video?: VideoConfig;
}

interface GradientConfig {
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  angle?: number;      // 0-360 degrees
  stops?: number[];    // [0, 0.5, 1]
}

interface MediaConfig {
  url?: string;
  opacity?: number;
  fit?: 'cover' | 'contain' | 'stretch';
}

interface VideoConfig extends MediaConfig {
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}
```

**Examples:**

```typescript
// Gradient background
const config = {
  body: {
    scene: {
      background: {
        type: 'gradient',
        color1: '#1a1a2e',
        color2: '#16213e',
        color3: '#ef4fd1',
        opacity: 1,
        gradient: {
          direction: 'diagonal',
          angle: 315,
          stops: [0, 0.45, 1]
        }
      }
    }
  }
};

// Image background
const config = {
  body: {
    scene: {
      background: {
        type: 'image',
        image: {
          url: '/images/background.jpg',
          opacity: 0.8,
          fit: 'cover'
        }
      }
    }
  }
};

// Video background
const config = {
  body: {
    scene: {
      background: {
        type: 'video',
        video: {
          url: '/videos/ambient.mp4',
          opacity: 0.6,
          fit: 'cover',
          autoplay: true,
          loop: true,
          muted: true
        }
      }
    }
  }
};
```

### Blob Configuration

```typescript
interface BlobConfig {
  resolution?: number;        // 120-220 (mesh detail)
  spikes?: Vector3;          // 0-20 (noise frequency)
  time?: Vector3;            // 0-5 (animation speed)
  rotation?: Vector3;        // 0-0.01 (rotation speed)
  colors?: ColorConfig;      // RGB colors
  shininess?: number;        // 0-100000 (specular)
  wireframe?: boolean;       // Wireframe mode
  scale?: number;            // 0.1-3.0 (blob size)
  opacity?: number;          // 0-1 (transparency)
}

interface ColorConfig {
  x: string;  // Hex color for X axis
  y: string;  // Hex color for Y axis
  z: string;  // Hex color for Z axis
}
```

**Example:**
```typescript
const config = {
  body: {
    blob: {
      resolution: 180,
      spikes: { x: 0.2, y: 0.2, z: 0.2 },
      time: { x: 1, y: 1, z: 1 },
      rotation: { x: 0.01, y: 0.01, z: 0 },
      colors: {
        x: '#ff0066',
        y: '#00ff66',
        z: '#6600ff'
      },
      shininess: 100,
      wireframe: false,
      scale: 1.0,
      opacity: 1.0
    }
  }
};
```

### Skin Types

```typescript
type BlobSkinType = 'Poles' | 'Donut' | 'Vintage';
```

**Example:**
```typescript
const config = {
  body: {
    initialSkin: 'Poles'  // or 'Donut', 'Vintage'
  }
};
```

## Mind Configuration

### MindConfig Interface

```typescript
interface MindConfig {
  provider?: 'elevenlabs' | 'openai';
  apiKey?: string;
  
  // ElevenLabs specific
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
  outputFormat?: string;
  optimizeStreamingLatency?: number;
  pronunciationDictionary?: Record<string, string>;
  
  // OpenAI specific
  openai?: OpenAIProviderConfig;
}

interface OpenAIProviderConfig {
  voice?: string;
  model?: string;
  speed?: number;
  responseFormat?: string;
}
```

### ElevenLabs Configuration

```typescript
const config = {
  mind: {
    provider: 'elevenlabs',
    apiKey: 'your-api-key',
    voiceId: 'your-voice-id',
    modelId: 'eleven_turbo_v2_5',
    
    // Voice fine-tuning (0-1)
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.0,
    useSpeakerBoost: true,
    
    // Output format
    outputFormat: 'mp3_44100_128',
    
    // Latency optimization (0-4)
    optimizeStreamingLatency: 3,
    
    // Pronunciation dictionary
    pronunciationDictionary: {
      'Kwami': 'KWAH-mee',
      'API': 'ay-pee-eye'
    }
  }
};
```

### OpenAI Configuration

```typescript
const config = {
  mind: {
    provider: 'openai',
    apiKey: 'your-openai-api-key',
    openai: {
      voice: 'alloy',  // 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'
      model: 'tts-1-hd',
      speed: 1.0,
      responseFormat: 'mp3'
    }
  }
};
```

## Soul Configuration

### SoulConfig Interface

```typescript
interface SoulConfig {
  name?: string;
  personality?: string;
  systemPrompt?: string;
  traits?: string[];
  emotionalTraits?: EmotionalTraits;
  language?: string;
  conversationStyle?: string;
  responseLength?: string;
  emotionalTone?: string;
}

interface EmotionalTraits {
  happiness?: number;     // -100 to +100
  energy?: number;        // -100 to +100
  confidence?: number;    // -100 to +100
  calmness?: number;      // -100 to +100
  optimism?: number;      // -100 to +100
  socialness?: number;    // -100 to +100
  creativity?: number;    // -100 to +100
  patience?: number;      // -100 to +100
  empathy?: number;       // -100 to +100
  curiosity?: number;     // -100 to +100
}
```

**Example:**
```typescript
const config = {
  soul: {
    name: 'Kaya',
    personality: 'A warm, friendly AI companion',
    traits: ['empathetic', 'optimistic', 'supportive'],
    emotionalTraits: {
      happiness: 75,
      energy: 60,
      confidence: 70,
      calmness: 80,
      optimism: 85,
      socialness: 90,
      creativity: 65,
      patience: 85,
      empathy: 95,
      curiosity: 80
    },
    language: 'en',
    conversationStyle: 'friendly',
    responseLength: 'medium',
    emotionalTone: 'warm'
  }
};
```

## Complete Configuration Example

```typescript
import { Kwami } from 'kwami';
import type { KwamiConfig } from 'kwami';

const config: KwamiConfig = {
  // Body configuration
  body: {
    audioFiles: [
      '/audio/track1.mp3',
      '/audio/track2.mp3'
    ],
    initialSkin: 'Poles',
    
    audio: {
      preload: 'auto',
      autoInitialize: true,
      volume: 0.8
    },
    
    scene: {
      fov: 100,
      near: 0.1,
      far: 1000,
      cameraPosition: { x: 0, y: 6, z: 0 },
      enableShadows: true,
      enableControls: false,
      background: {
        type: 'gradient',
        color1: '#1a1a2e',
        color2: '#16213e',
        opacity: 1,
        gradient: {
          direction: 'diagonal',
          angle: 315,
          stops: [0, 1]
        }
      }
    },
    
    blob: {
      resolution: 180,
      spikes: { x: 0.2, y: 0.2, z: 0.2 },
      time: { x: 1, y: 1, z: 1 },
      rotation: { x: 0.01, y: 0.01, z: 0 },
      colors: {
        x: '#ff0066',
        y: '#00ff66',
        z: '#6600ff'
      },
      shininess: 100,
      wireframe: false,
      scale: 1.0,
      opacity: 1.0
    }
  },
  
  // Mind configuration
  mind: {
    provider: 'elevenlabs',
    apiKey: process.env.ELEVENLABS_API_KEY,
    voiceId: process.env.ELEVENLABS_VOICE_ID,
    modelId: 'eleven_turbo_v2_5',
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.0,
    useSpeakerBoost: true,
    outputFormat: 'mp3_44100_128',
    optimizeStreamingLatency: 3
  },
  
  // Soul configuration
  soul: {
    name: 'Kaya',
    personality: 'A warm, friendly AI companion',
    traits: ['empathetic', 'optimistic', 'supportive'],
    emotionalTraits: {
      happiness: 75,
      energy: 60,
      confidence: 70,
      calmness: 80,
      optimism: 85,
      socialness: 90,
      creativity: 65,
      patience: 85,
      empathy: 95,
      curiosity: 80
    },
    language: 'en',
    conversationStyle: 'friendly',
    responseLength: 'medium',
    emotionalTone: 'warm'
  }
};

const canvas = document.querySelector('canvas');
const kwami = new Kwami(canvas, config);
```

## Environment Variables

### Best Practices

Store sensitive data in environment variables:

```bash
# .env file
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here
OPENAI_API_KEY=your_openai_key_here
```

Load in your application:

```typescript
const config: KwamiConfig = {
  mind: {
    provider: 'elevenlabs',
    apiKey: import.meta.env.ELEVENLABS_API_KEY,
    voiceId: import.meta.env.ELEVENLABS_VOICE_ID
  }
};
```

## Configuration Presets

### Performance Preset

Optimized for low-end devices:

```typescript
const performanceConfig: KwamiConfig = {
  body: {
    scene: {
      enableShadows: false
    },
    blob: {
      resolution: 120,  // Lower resolution
      spikes: { x: 0.15, y: 0.15, z: 0.15 }
    }
  }
};
```

### Quality Preset

Maximum visual quality:

```typescript
const qualityConfig: KwamiConfig = {
  body: {
    scene: {
      enableShadows: true
    },
    blob: {
      resolution: 220,  // Higher resolution
      shininess: 50000
    }
  }
};
```

### Conversational Preset

Optimized for voice conversations:

```typescript
const conversationalConfig: KwamiConfig = {
  mind: {
    provider: 'elevenlabs',
    modelId: 'eleven_turbo_v2_5',
    optimizeStreamingLatency: 4  // Maximum speed
  }
};
```

## Dynamic Configuration

### Runtime Updates

Most configuration can be updated at runtime:

```typescript
// Create with initial config
const kwami = new Kwami(canvas, initialConfig);

// Update at runtime
kwami.body.blob.setResolution(200);
kwami.body.blob.setScale(1.5);
kwami.mind.setStability(0.6);
kwami.soul.setEmotionalTrait('happiness', 90);
```

### Configuration Validation

TypeScript provides type checking:

```typescript
import type { KwamiConfig } from 'kwami';

// Type-safe configuration
const config: KwamiConfig = {
  body: {
    blob: {
      resolution: 300  // Error: out of range
    }
  }
};
```

## Platform-Specific Configuration

### Mobile Configuration

```typescript
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const config: KwamiConfig = {
  body: {
    scene: {
      enableShadows: !isMobile
    },
    blob: {
      resolution: isMobile ? 120 : 180
    }
  }
};
```

### Desktop Configuration

```typescript
const isDesktop = !isMobile && window.innerWidth > 1024;

const config: KwamiConfig = {
  body: {
    blob: {
      resolution: isDesktop ? 220 : 180,
      shininess: isDesktop ? 50000 : 10000
    }
  }
};
```

## Troubleshooting

### Canvas Not Rendering

Ensure canvas has dimensions:

```css
canvas {
  width: 100vw;
  height: 100vh;
  display: block;
}
```

### Audio Not Playing

Check autoplay policies:

```typescript
canvas.addEventListener('click', async () => {
  await kwami.body.audio.play();
}, { once: true });
```

### AI Features Not Working

Verify API keys:

```typescript
if (!import.meta.env.ELEVENLABS_API_KEY) {
  console.error('API key missing!');
}
```

### Performance Issues

Lower resource usage:

```typescript
kwami.body.blob.setResolution(120);
const analyser = kwami.body.audio.getAnalyser();
analyser.fftSize = 1024;
```

## Related

- **[Quick Start](../getting-started/quickstart.md)** - Get started quickly
- **[API Reference](../api/kwami.md)** - Complete API docs
- **[Core Components](../core/body.md)** - Component details

---

This configuration guide covers all available options for customizing Kwami.

