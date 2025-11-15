# Kwami Architecture Overview

High-level architecture overview for Kwami v1.3.0. For detailed component architecture, see the [architecture documentation](./docs/architecture/).

## System Overview

Kwami follows a **Mind-Body-Soul** architecture pattern:

```
┌─────────────────────────────────────────────────────────┐
│                         KWAMI                           │
│                  (Main Orchestrator)                    │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    BODY      │  │    MIND      │  │    SOUL      │  │
│  │  (Visual)    │  │  (AI/Voice)  │  │ (Personality)│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │        │
└─────────┼──────────────────┼──────────────────┼────────┘
          │                  │                  │
          ▼                  ▼                  ▼
    [IMPLEMENTED]      [IMPLEMENTED]      [IMPLEMENTED]
```

## Core Components

### Body - Visual Representation

The Body manages all visual aspects: 3D rendering, audio playback, and user interaction.

**Key Responsibilities:**
- WebGL scene management (Three.js)
- Audio-reactive 3D blob animation
- Background system (gradients, images, videos)
- User interaction (touch, click, drag)
- State-based animations

**See:** [Body Architecture](./docs/architecture/body-architecture.md)

### Mind - AI Capabilities

The Mind handles AI features through a provider architecture supporting multiple vendors.

**Key Responsibilities:**
- Text-to-Speech (TTS)
- Speech-to-Text (STT) - coming soon
- Conversational AI (beta)
- Provider management (ElevenLabs, OpenAI, etc.)
- Agent configuration

**See:** [Mind Architecture](./docs/architecture/mind-architecture.md)

### Soul - Personality System

The Soul defines personality, emotional traits, and behavioral characteristics.

**Key Responsibilities:**
- Personality management
- 10-dimensional emotional spectrum
- System prompt generation
- Behavior configuration
- Preset personalities

**See:** [Soul Architecture](./docs/architecture/soul-architecture.md)

## Data Flow

### Audio Visualization Pipeline

```
Audio File → Web Audio API → AnalyserNode → FFT Data
    ↓
Frequency Bands (Bass/Mid/High/Ultra)
    ↓
Vertex Displacement (Simplex Noise)
    ↓
Blob Mesh Animation → Render to Canvas
```

### AI Interaction Pipeline

```
User Input → Mind Provider → Soul Context
    ↓
LLM Processing
    ↓
TTS Generation → Audio Output → Body Animation
```

### State Management

```
User Action → Kwami.setState()
    ↓
Body Animation Update
    ↓
Mind State Sync
    ↓
Smooth Transition (interpolated)
```

## Module Structure

```
kwami/
├── src/
│   ├── core/
│   │   ├── Kwami.ts              # Main orchestrator
│   │   ├── body/
│   │   │   ├── Body.ts           # Visual management
│   │   │   ├── Audio.ts          # Audio system
│   │   │   ├── blob/             # 3D mesh & animation
│   │   │   └── scene/            # Three.js setup
│   │   ├── mind/
│   │   │   ├── Mind.ts           # AI orchestrator
│   │   │   └── providers/        # Multi-provider support
│   │   └── soul/
│   │       ├── Soul.ts           # Personality manager
│   │       └── personalities/    # Preset personalities
│   ├── types/                    # TypeScript definitions
│   └── utils/                    # Utility functions
├── docs/                         # Documentation
└── playground/                   # Interactive demo
```

## Design Principles

### 1. Single Responsibility

Each component has a clear, focused purpose:
- **Kwami**: Orchestration and high-level API
- **Body**: Visual rendering and interaction
- **Mind**: AI capabilities
- **Soul**: Personality definition

### 2. Dependency Injection

Components receive dependencies via constructor:

```typescript
const body = new KwamiBody(canvas, config);
const mind = new KwamiMind(audio, config);
const soul = new KwamiSoul(config);
```

### 3. Provider Pattern

The Mind uses providers for AI services:

```typescript
interface MindProvider {
  initialize(config: any): Promise<void>;
  speak(text: string): Promise<void>;
  startConversation(callbacks: any): Promise<void>;
  dispose(): void;
}
```

### 4. Composition Over Inheritance

```
Kwami
 ├─ has-a Body
 │   ├─ has-a Audio
 │   └─ has-a Blob
 ├─ has-a Mind
 │   └─ has-a Provider
 └─ has-a Soul
```

## Animation System

### State Machine

```
┌──────────┐     ┌──────────┐
│  Idle    │◄───►│Listening │
│(Breathing)     │(Inward)  │
└────┬─────┘     └────┬─────┘
     │                │
     ▼                ▼
┌──────────┐     ┌──────────┐
│Speaking  │◄───►│Thinking  │
│(Outward) │     │(Chaotic) │
└──────────┘     └──────────┘
```

All transitions are smoothly blended using interpolation.

### Animation Layers

1. **Base Animation** - Breathing, rotation
2. **Audio Reactivity** - Frequency-based vertex displacement
3. **Touch Effects** - Raycasting-based ripples
4. **State Animations** - Listening, thinking, speaking

## Provider Architecture

### Multi-Provider System

```
KwamiMind
    ↓
MindProvider Interface
    ↓
┌─────────────┬──────────────┬──────────┐
│  ElevenLabs │    OpenAI    │  Future  │
│  (Complete) │(Experimental)│ (Vapi,   │
│             │              │  Retell) │
└─────────────┴──────────────┴──────────┘
```

**Current Providers:**
- **ElevenLabs** ✅ - Full TTS, Conversational AI, Agents
- **OpenAI** 🟡 - TTS only (Realtime API pending)

**See:** [Mind Architecture](./docs/architecture/mind-architecture.md#provider-architecture)

## Performance Considerations

### Optimization Strategies

1. **Rendering**
   - Lower blob resolution on mobile
   - Disable shadows on low-end devices
   - Use smaller FFT sizes

2. **Memory**
   - Dispose resources properly
   - Reuse audio contexts
   - Limit texture sizes

3. **Network**
   - Stream TTS audio
   - Lazy load personalities
   - Optimize latency settings

**See:** [Advanced Topics](./docs/advanced/overview.md#performance-optimization)

## Extension Points

### Adding New Features

1. **Custom Skins**
   - Create shader materials in `src/core/body/blob/skins/`
   - Register in skin factory

2. **New Providers**
   - Implement `MindProvider` interface
   - Register in provider factory

3. **Custom Personalities**
   - Create YAML files in `src/core/soul/personalities/`
   - Define emotional traits

**See:** [Advanced Topics](./docs/advanced/overview.md)

## Deployment Architecture

### Production Deployment

```
GitHub Repository (main branch)
    ↓
Render.com Build
    ↓
kwami.io (Production)
```

### Development Workflow

```
feature/* → dev → main → production
   ↓         ↓      ↓
  PR      Testing Deploy
```

**See:** [Contributing Guide](./CONTRIBUTING.md)

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Edge | ✅ Full | Recommended |
| Firefox | ✅ Full | Recommended |
| Safari | ✅ Full | WebGL 2.0 required |
| Mobile Safari | ✅ Full | iOS 15+ |
| Mobile Chrome | ✅ Full | Android 8+ |

## TypeScript Architecture

### Type System

```typescript
// Configuration types
KwamiConfig
├── BodyConfig
│   ├── AudioConfig
│   ├── SceneConfig
│   └── BlobConfig
├── MindConfig
│   ├── ElevenLabsConfig
│   └── OpenAIConfig
└── SoulConfig
    └── EmotionalTraits
```

### Type Safety

- All public APIs are fully typed
- Strict mode enabled
- Runtime validation where needed

## Documentation Structure

Complete documentation is available in the `/docs` folder:

```
docs/
├── getting-started/     # Quick start, installation, concepts
├── core/                # Body, Mind, Soul guides
├── api/                 # API reference
├── guides/              # Configuration, animations
├── architecture/        # Detailed architecture docs
└── advanced/            # Performance, custom development
```

## Related Documentation

### Component Architecture
- **[Mind Architecture](./docs/architecture/mind-architecture.md)** - Provider system, WebSocket handling
- **[Body Architecture](./docs/architecture/body-architecture.md)** - Rendering pipeline, scene management
- **[Soul Architecture](./docs/architecture/soul-architecture.md)** - Personality system, emotional traits

### Development Guides
- **[Quick Start](./docs/getting-started/quickstart.md)** - Get started in 5 minutes
- **[Core Concepts](./docs/getting-started/concepts.md)** - Understand the architecture
- **[Advanced Topics](./docs/advanced/overview.md)** - Performance, custom development

### API Reference
- **[Kwami API](./docs/api/kwami.md)** - Main orchestrator class
- **[Configuration Guide](./docs/guides/configuration.md)** - Complete configuration reference
- **[Full Documentation](./docs/README.md)** - Browse all documentation

## Version History

- **v1.3.0** (2025-11-14) - Provider architecture, emotional system
- **v1.2.x** - Background system, glass mode, agents API
- **v1.1.x** - Playground, personalities
- **v1.0.x** - Initial release, Mind & Soul integration

See [CHANGELOG](./CHANGELOG.md) for complete version history.

---

For detailed implementation details, see the component-specific architecture documentation:
- [Mind Architecture](./docs/architecture/mind-architecture.md)
- [Body Architecture](./docs/architecture/body-architecture.md)
- [Soul Architecture](./docs/architecture/soul-architecture.md)
