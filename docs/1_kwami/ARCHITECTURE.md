# Kwami Architecture Overview

High-level architecture overview for Kwami v1.5.7. For detailed component architecture, see the [architecture documentation](./architecture/).

## System Overview

Kwami follows a **Mind-Body-Soul** architecture pattern:

```
┌────────────────────────────────────────────────────────┐
│                         KWAMI                          │
│                  (Main Orchestrator)                   │
│                                                        │
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

**See:** [Body Architecture](./architecture/body-arch.md)

### Mind - AI Capabilities

The Mind handles AI features through a provider architecture supporting multiple vendors.

**Key Responsibilities:**
- Text-to-Speech (TTS)
- Speech-to-Text (STT) - coming soon
- Conversational AI (beta)
- Provider management (ElevenLabs, OpenAI, etc.)
- Agent configuration

**See:** [Mind Architecture](./architecture/mind-arch.md)

### Soul - Personality System

The Soul defines personality, emotional traits, and behavioral characteristics.

**Key Responsibilities:**
- Personality management
- 10-dimensional emotional spectrum
- System prompt generation
- Behavior configuration
- Preset personalities

**See:** [Soul Architecture](./architecture/soul-arch.md)

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

### Monorepo Organization

```
kwami-monorepo/
├── kwami/                        # Core library (npm package)
│   ├── src/
│   │   ├── core/
│   │   │   ├── Kwami.ts          # Main orchestrator
│   │   │   ├── body/
│   │   │   │   ├── Body.ts       # Visual management
│   │   │   │   ├── Audio.ts      # Audio system
│   │   │   │   ├── blob/         # 3D mesh & animation
│   │   │   │   └── scene/        # Three.js setup
│   │   │   ├── mind/
│   │   │   │   ├── Mind.ts       # AI orchestrator
│   │   │   │   ├── providers/    # Multi-provider support
│   │   │   │   ├── apis/         # Knowledge Base & Tools APIs
│   │   │   │   ├── skills/       # Skill system
│   │   │   │   └── AgentConfigBuilder.ts
│   │   │   └── soul/
│   │   │       ├── Soul.ts       # Personality manager
│   │   │       └── templates/    # Preset personalities (20+)
│   │   ├── types/                # TypeScript definitions
│   │   └── utils/                # Utility functions
│   ├── tests/                    # Test suite (238 tests)
│   └── package.json              # Published to npm
├── pg/                           # Playground (interactive demo)
├── app/                          # Nuxt 4 web application
├── candy/                        # NFT minting platform
├── market/                       # NFT marketplace
├── dao/                          # Governance platform
├── web/                          # Public website
├── solana/                       # Smart contracts
└── docs/                         # Documentation
    ├── 1_kwami/                  # Core library docs
    ├── 2_pg/                     # Playground docs
    ├── 3_app/                    # App docs
    ├── 4_solana/                 # Solana docs
    ├── 5_candy/                  # Candy machine docs
    ├── 6_market/                 # Marketplace docs
    ├── 7_dao/                    # DAO docs
    └── 8_web/                    # Website docs
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

**See:** [Mind Architecture](./architecture/mind-arch.md#provider-architecture)

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

**See:** [Advanced Topics](./advanced/overview.md#performance-optimization)

## Extension Points

### Adding New Features

1. **Custom Skins**
   - Create shader materials in `kwami/src/core/body/blob/skins/`
   - Register in skin factory
   - Available skins: Zebra, TriColor, TriColor2

2. **New Providers**
   - Implement `MindProvider` interface
   - Register in provider factory
   - Current providers: ElevenLabs (full), OpenAI (TTS only)

3. **Custom Personalities**
   - Create YAML files in `kwami/src/core/soul/templates/`
   - Define emotional traits
   - 20+ preset personalities included

4. **Skills & Actions**
   - Create YAML/JSON skill templates in `kwami/src/core/mind/skills/templates/`
   - Define behaviors and conditions
   - Full skill management system

**See:** [Advanced Topics](./advanced/overview.md)

## Deployment Architecture

### NPM Package Deployment

```
GitHub Repository (main branch)
    ↓
GitHub Actions (version change detected)
    ↓
Build & Test (kwami/ folder)
    ↓
Publish to npm (automated with OIDC)
    ↓
npm package (kwami)
```

### Application Deployments

```
┌─────────────────┬──────────────────┬──────────────────┐
│   Playground    │       Web        │       DAO        │
│   (kwami.io)    │  (Public Site)   │   (Governance)   │
│   Netlify       │   Render.com     │   Render.com     │
└─────────────────┴──────────────────┴──────────────────┘
```

### Development Workflow

```
feature/* → dev → main → production
   ↓         ↓      ↓
  PR      Testing  Deploy
                    ├─ npm publish (core library)
                    ├─ Deploy playground
                    ├─ Deploy web
                    └─ Deploy applications
```

### Monorepo Workspaces

- **Root**: Orchestrates all workspaces
- **kwami/**: Core library, independent versioning
- **pg/**: Playground app
- **app/**: Full web application
- **candy/**: NFT minting
- **market/**: NFT trading
- **dao/**: Governance
- **web/**: Public website
- **solana/**: Smart contracts

**See:** [Contributing Guide](../../CONTRIBUTING.md)

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

Complete documentation is available in the `/docs` folder, organized by project:

```
docs/
├── 1_kwami/                     # Core library documentation
│   ├── getting-started/         # Quick start, installation, concepts
│   ├── core/                    # Body, Mind, Soul guides
│   ├── api/                     # API reference
│   ├── guides/                  # Configuration, animations
│   ├── architecture/            # Detailed architecture docs
│   ├── advanced/                # Performance, custom development
│   └── ARCHITECTURE.md          # This file
├── 2_pg/                        # Playground documentation
├── 3_app/                       # Web application documentation
├── 4_solana/                    # Solana programs documentation
├── 5_candy/                     # Candy machine documentation
├── 6_market/                    # Marketplace documentation
├── 7_dao/                       # DAO documentation
├── 8_web/                       # Website documentation
└── README.md                    # Documentation index
```

## Related Documentation

### Component Architecture
- **[Mind Architecture](./architecture/mind-arch.md)** - Provider system, WebSocket handling, Agents API
- **[Body Architecture](./architecture/body-arch.md)** - Rendering pipeline, scene management
- **[Soul Architecture](./architecture/soul-arch.md)** - Personality system, emotional traits

### Development Guides
- **[Quick Start](./getting-started/quickstart.md)** - Get started in 5 minutes
- **[Core Concepts](./getting-started/concepts.md)** - Understand the architecture
- **[Advanced Topics](./advanced/overview.md)** - Performance, custom development, testing

### API Reference
- **[Kwami API](./api/kwami.md)** - Main orchestrator class
- **[Configuration Guide](./guides/configuration.md)** - Complete configuration reference
- **[Mind Examples](./mind-examples.md)** - ElevenLabs Agents API examples
- **[Mind Skills](./mind-skills.md)** - Skills system documentation
- **[Full Documentation](../README.md)** - Browse all documentation

### Ecosystem Documentation
- **[Playground](../2_pg/README.md)** - Interactive demo documentation
- **[Kwami App](../3_app/README.md)** - Full application documentation
- **[Solana Programs](../4_solana/README.md)** - Smart contracts documentation
- **[Candy Machine](../5_candy/README.md)** - NFT minting documentation
- **[Marketplace](../6_market/README.md)** - NFT trading documentation
- **[DAO](../7_dao/README.md)** - Governance documentation
- **[Website](../8_web/README.md)** - Public website documentation

## Version History

- **v1.5.7** (2025-11-22) - Version management improvements, sync-version script
- **v1.5.6** (2025-11-22) - GitHub Actions npm publish with OIDC, AGPL-3.0 license
- **v1.5.5** (2025-11-22) - License change to AGPL-3.0 + Commercial
- **v1.5.2** (2025-11-22) - Monorepo restructuring, workspaces setup
- **v1.5.1** (2025-11-22) - Kwami App added, documentation overhaul
- **v1.4.2** (2025-11-22) - Monorepo organization, core library moved to kwami/
- **v1.4.1** (2025-11-22) - Complete ElevenLabs Agents API integration
- **v1.4.0** (2025-11-20) - NFT system, DAO governance, DNA validation
- **v1.3.x** - Provider architecture, emotional system, skills
- **v1.2.x** - Background system, glass mode
- **v1.1.x** - Playground, personalities
- **v1.0.x** - Initial release

See [CHANGELOG](../../CHANGELOG.md) and [kwami/CHANGELOG.md](../../kwami/CHANGELOG.md) for complete version history.

## Ecosystem Integration

### KWAMI Ecosystem Components

The core library (kwami) is the foundation for a complete ecosystem:

1. **Core Library (kwami/)** - Published npm package, framework-agnostic
2. **Playground (pg/)** - Interactive demo with full UI configuration
3. **Kwami App (app/)** - Production Nuxt 4 application with auth & voice
4. **Solana Programs (solana/)** - QWAMI token (1T supply) & KWAMI NFT (10B by 2100)
5. **Candy Machine (candy/)** - NFT minting with DNA validation & Arweave
6. **Marketplace (market/)** - NFT trading platform
7. **DAO (dao/)** - Token-weighted governance for NFT holders
8. **Website (web/)** - Public landing page with multi-language support

### Technology Stack

- **Core**: TypeScript, Three.js, simplex-noise
- **AI/Voice**: ElevenLabs (full), OpenAI (TTS)
- **Frontend**: Nuxt 4, Vue 3, Tailwind CSS
- **Blockchain**: Solana, Metaplex, Anchor
- **Storage**: Arweave (NFT metadata)
- **Testing**: Vitest (238 tests, full coverage)
- **Build**: Vite, npm workspaces
- **Deployment**: GitHub Actions, Render.com, Netlify

### License

**Dual License (AGPL-3.0 + Commercial):**
- **AGPL-3.0**: Free for personal, educational, and open-source projects
- **Commercial**: Separate license required for proprietary/closed-source use

See [LICENSE](../../LICENSE) for full terms.

---

For detailed implementation details, see the component-specific architecture documentation:
- [Mind Architecture](./architecture/mind-arch.md)
- [Body Architecture](./architecture/body-arch.md)
- [Soul Architecture](./architecture/soul-arch.md)
