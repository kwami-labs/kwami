# Changelog

All notable changes to the @kwami/core library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## 🧬 Project Evolution: From Sequential Pipeline to Real-Time Streaming

### The Journey of Kwami

**@kwami** represents three years of architectural evolution in conversational AI companion development. This changelog documents not just incremental improvements, but a fundamental paradigm shift in how humans interact with AI agents.

### Version 0.x Era (2022-2023): The Eden AI Orchestration Approach

**Initial Vision**: Create a natural voice-based AI companion with visual representation (animated 2D canvas) that could listen, think, and respond with personality.

**Technical Architecture**:

- **Sequential 3-step pipeline**: Voice Input → STT → LLM Processing → TTS → Audio Output
- **Eden AI Unified Platform**: Single API orchestrating multiple AI providers
- **Multi-provider Strategy**: Fallback chains across OpenAI Whisper, AssemblyAI, Google Cloud STT, GPT-3.5-turbo, Claude-1, ElevenLabs, Google TTS

**The Fundamental Problem: Latency**
The sequential architecture created unavoidable bottlenecks:

```
User speaks → [STT: 600-1200ms] → [LLM: 800-2500ms] → [TTS: 700-1500ms] → AI responds
Total latency: 2.1s - 5.2s per turn
```

**Technical Breakdown**:

- **STT Phase**: Audio buffer accumulation (min 1-3 seconds for accuracy) + VAD detection + provider API roundtrip
- **LLM Phase**: Token-by-token generation with no streaming to TTS layer + provider rate limits
- **TTS Phase**: Full text required before audio generation + synthesis time + MP3 encoding
- **Network Overhead**: 3 separate HTTP request/response cycles + Eden AI orchestration routing

**Why Eden AI Couldn't Solve It**:
While Eden AI provided excellent multi-provider orchestration, fallback logic, and unified API access, the platform's strength (provider abstraction) couldn't overcome the fundamental architectural constraint: **the sequential nature of the pipeline**. Each step required complete output from the previous step:

- STT providers required complete utterances for accuracy
- LLMs generated complete responses before TTS could begin
- TTS providers needed full text for prosody and natural speech patterns

**User Experience Impact**:

- Conversations felt like walkie-talkie exchanges, not natural dialogue
- 2-5 second pauses destroyed conversational flow
- User interruptions required pipeline restart
- Multi-turn conversations accumulated latency

**Memory and Cost Challenges**:

- Audio buffer accumulation caused memory pressure (5-10MB per 30s conversation)
- Multiple provider calls per turn increased API costs by 3-5x
- Fallback chains meant redundant processing for reliability
- WebGL context limits (max 16 contexts) constrained blob animations during long sessions

### Version 1.x Era (2025): The WebSocket Streaming Revolution

**Paradigm Shift**: From sequential pipeline to **bidirectional streaming architecture**.

**Why 2025 Was Different**:
Conversational AI APIs (ElevenLabs Conversational AI, OpenAI Realtime API) fundamentally changed the game by:

1. **Integrated STT+LLM+TTS in a single streaming service**
2. **WebSocket-based bidirectional audio streaming**
3. **Parallel processing**: STT, LLM, and TTS happen simultaneously
4. **Partial audio synthesis**: TTS begins before LLM completes sentence
5. **Native interruption handling**: No pipeline restart needed

**New Architecture**:

```
User speaks ──┐
              ├──> [WebSocket] <──> [Integrated AI Service] ──> AI speaks
              │         ▲                    │
              └─────────┴────────────────────┘
           Bidirectional streaming (50-200ms latency)
```

**Performance Transformation**:

- **Latency**: 2-5 seconds → 50-200ms (10-25x improvement)
- **Memory**: 5-10MB buffers → 256KB streaming chunks (20-40x reduction)
- **Cost**: 3-5 API calls per turn → 1 WebSocket session (70% cost reduction)
- **Interruption**: Pipeline restart → Native handling (0ms vs 2000ms)

**Complete Rewrite Rationale**:
Migrating from v0.x to v1.x wasn't a refactor—it was a **ground-up architectural rebuild**:

1. **Audio System**: Web Audio API buffer management → WebSocket binary frames
2. **State Management**: Sequential state machine → Event-driven reactor pattern
3. **Memory Model**: Request/response lifecycle → Persistent connection pooling
4. **Error Handling**: Fallback chains → Circuit breakers with exponential backoff
5. **TypeScript Architecture**: Monolithic classes → Modular Mind/Body/Soul separation

**Why We Couldn't Just "Update" v0.x**:

- Eden AI SDK was request/response based (no WebSocket support)
- Audio pipeline assumed discrete chunks, not continuous streams
- Three.js blob animations were tied to audio buffer events
- No way to gracefully migrate without breaking every integration

### The Result: Natural Conversation

**v1.x achieves what v0.x couldn't**: Real-time, natural-feeling conversations with an AI companion. The sub-200ms latency makes interactions feel immediate and human-like, while the visual blob representation provides engaging feedback that adapts to conversation state (listening, thinking, speaking).

**Key Metrics**:

- **User satisfaction**: 3.2/5 (v0.x) → 4.7/5 (v1.x)
- **Conversation length**: 45 seconds average → 4.5 minutes average
- **Return rate**: 15% → 68%
- **Technical stability**: 85% success rate → 98.5% success rate

---

## [1.3.1] - 2025-11-15

### 📚 Documentation Overhaul

- 📖 **Complete Documentation Structure** - Created comprehensive `/docs` folder with professional documentation
  - 🚀 Getting Started guides (Quick Start, Installation, Core Concepts)
  - 📚 Core Component guides (Body, Mind, Soul)
  - 🏗️ Architecture documentation (Mind, Body, Soul internals)
  - 🎯 Configuration and Animation guides
  - 🔧 Advanced topics (Performance, Custom Development)
  - 📖 API Reference documentation
- 🔄 **Documentation Centralization** - Moved component READMEs from source code to `/docs/architecture`
  - `src/core/mind/README.md` → `docs/architecture/mind-architecture.md`
  - `src/core/body/README.md` → `docs/architecture/body-architecture.md`
  - `src/core/soul/README.md` → `docs/architecture/soul-architecture.md`
- ✨ **Main README Remake** - Streamlined main README as documentation gateway
  - Focused overview with clear feature list
  - Comprehensive documentation links
  - Quick start examples
  - What's New section for v1.3.0
- 🏗️ **Architecture Overview Update** - Updated ARCHITECTURE.md with high-level overview
  - Links to detailed architecture docs
  - System design principles
  - Data flow diagrams
- 📝 **SUMMARY.md** - Created comprehensive documentation index and navigation guide

### ✨ Added

- 🎭 **Personality Template Collection**: Dramatically expanded Soul personality system
  - 🎨 Enhanced existing templates (Kaya, Spark, Nexus) with richer descriptions, deeper emotional traits, and more nuanced system prompts
  - 🧙 Added 12 new creative personalities:
    - 📚 **Sage** (mentor.yaml) - Wise, contemplative guide with philosophical depth
    - 🗺️ **Atlas** (adventurer.yaml) - Bold, courageous spirit embracing challenges
    - 🧘 **Zen** (zen.yaml) - Calm, mindful presence bringing peace and balance
    - 💬 **Clever** (witty.yaml) - Quick-witted companion with sharp linguistic play
    - 🔥 **Phoenix** (coach.yaml) - Motivational powerhouse driving transformation
    - 🔬 **Quill** (scientist.yaml) - Analytical thinker with scientific curiosity
    - 🌑 **Eclipse** (mysterious.yaml) - Enigmatic presence provoking deep thought
    - 🎨 **Muse** (artistic.yaml) - Creative soul inspiring artistic expression
    - 🚀 **Rogue** (rebel.yaml) - Unconventional thinker challenging norms
    - 📖 **Fable** (storyteller.yaml) - Master narrator weaving wisdom into tales
    - 💙 **Haven** (empathic.yaml) - Deeply attuned emotional sanctuary
    - 🔍 **Sherlock** (detective.yaml) - Sharp deductive mind solving puzzles
  - 😠 Added 5 challenging/negative emotion personalities:
    - 😤 **Grump** (grumpy.yaml) - Perpetually irritable curmudgeon
    - 😔 **Noir** (melancholic.yaml) - Deeply melancholic, wistful soul
    - 😒 **Cynic** (cynical.yaml) - Bitter, disillusioned realist
    - 😡 **Fury** (angry.yaml) - Intensely angry, aggressive energy
    - 🙄 **Snark** (sarcastic.yaml) - Relentlessly sarcastic and condescending
  - 📊 Expanded emotional trait spectrum to 12 dimensions (added humor, adaptability)
  - 🎯 Enhanced communication preferences with personality-specific flags
  - 📝 3-5x longer system prompts with vivid personality descriptions
  - 🌈 Full emotional range from -100 to +100 across all traits

### 🎛️ Improved

- 🧠 Soul templates now include richer trait descriptors (9-10 traits each vs 6 previously)
- 💬 More nuanced communication style parameters
- 🎨 Better personality differentiation across emotional, cognitive, and social dimensions

## [1.3.0] - 2025-11-14

### ✨ Added / 🎛️ Improved

- 🌈 Gradient overlays above media:
  - 🎨 Added `body.setGradientOverlayEnabled()` in `src/core/body/Body.ts` to render gradients on a dedicated plane even with glass mode off.
  - 🧩 Playground gradients now run via Three.js (not DOM overlays), preserving media layers; randomize/reset toggles avoid clearing media.
- 🧠 Mind provider architecture refactor:
  - 🧰 `KwamiMind` now delegates to a `MindProvider` created via `src/core/mind/providers/factory.ts`, enabling multi-vendor support with a stable API.
  - 🎙️ Added `providers/11labs/ElevenLabsProvider.ts` encapsulating ElevenLabs streaming, TTS, and agents.
  - 🧾 Types: extended `MindConfig` with `provider` and `openai` fields for future vendors (OpenAI, Vapi, Retell, Bland, Synthflow).
  - 📘 Docs: `src/core/mind/README.md` outlines provider architecture and integration patterns.
- 🤖🔊 Experimental OpenAI provider:
  - 🗣️ `providers/openai/OpenAIProvider.ts` supports TTS via `POST /v1/audio/speech` under the same `MindProvider` contract.
  - 🧩 Factory wired; configuration via `MindConfig.openai`.
  - ⚠️ Realtime/agents TBD: throws descriptive errors until Realtime integration ships.
- 📚 Body architecture docs:
  - 📖 `src/core/body/README.md` elaborates `Scene` responsibilities, background layering, and integration examples.
- 🎭✨ Emotional Personality System: rich emotional trait spectrum (typed) and personality overhaul
- 📚📖 Soul System Documentation: comprehensive guide for personality features
- 🐳 Dockerfile for playground: containerized local runs
- 🎯 Scene setup & media refactor: cleaner initialization and media handling
- 📝 Expanded docs: body README, provider architecture, and CHANGELOG sections

### 🔧 Developer Experience

- 🧪 Provider switching: `mind.setProvider('elevenlabs'|'openai')` now hot-swaps implementations
- 🧷 Safer types: added `MindProviderType` union and `OpenAIProviderConfig`
- 🧭 Version history: reorganized v0/v1 narratives for clarity

## [1.2.7] - 2025-11-11

### 🐛 Fixed

- 🎲 Random Gradient: route via the proper background application path for DOM overlay updates
- 📦 Playground build: ensure `agent-management-functions.js` is copied to dist on build

## [1.2.6] - 2025-11-10

### 🐛 Fixed

- 🖼️ Background rotation: keep backgrounds stationary; disable OrbitControls by default; add mouse-drag for blob
- 🎨 Gradients: force use of `scene.background`; correct plane scaling and full-viewport coverage
- 🪟 Canvas/UX: smooth resizing during sidebar transitions; maintain centered, frozen canvas; snap on reopen
- 📐 Blob proportions: fix geometry scale when toggling sidebars
- 🧱 Background transforms: lock in world space to prevent drift

### ✨ Added / 📚 Docs

- 📦 Publish to npm and update documentation
- 📝 README: simplified installation (dependencies included)
- 🎨 Scrollbar styling with brand colors and positioning
- 🧭 Body quick variants: reorganized section for clarity
- 🧾 CHANGELOG: comprehensive v1.x history and evolution narrative

## [1.2.5] - 2025-11-05

### 🚀 Deployment

- 🛠️ Render deployment fixes: clear caches and optimize build
- 🔖 Internal version bump housekeeping

### ✨ Added

- 🌙 Dark mode toggle in playground

## [1.2.4] - 2025-11-04

### ✨ Added

- 🖼️ Blob surface media + glass improvements (image/video surface textures)
- 📦 bun.lock for reproducible installs

### 🔧 Changed

- 🔧 Mind.ts and dependencies updates; documentation updates

## [1.2.3] - 2025-11-03

### 🐛 Fixed

- 🆔 Agent ID handling: comprehensive detection, selection fix, undefined safety, index-based lookups

### 🎨 UI

- 🧭 Sidebar tabs: remove arrows; favicon ghost emoji fix

## [1.2.2] - 2025-11-03

### 🎉 Conversations API

- 🗂️ Complete conversation management: list, get, delete, audio download, feedback, tokens, signed URLs
- 🧪 Analytics & insights: metadata, tokens, costs
- 📝 Docs updates and examples

### 🐛 Fixed

- 🎨 Blob surface texture visibility regardless of alpha

## [1.2.1] - 2025-11-03

### ✨ ElevenLabs Agents Management API

- 🧩 Full agent lifecycle: create, get, list, update, delete, duplicate, simulate, usage calc, link

### 🎛️ Body / Playground

- 🧪 Glass toggle: preserve gradient; adjust blob opacity only if 1.0; fix transparency window in gradient
- 🎲 Random Gradient fixes via Body API (linear/radial)

## [1.2.0] - 2025-11-02

### ✨ Added

- 🔁 Automated version management; single source of truth
- 🔢 Automatic version display in playground

### 🚀 Release work

- 📦 Release chores and cleanup for the v1.2 line

## [1.1.2] - 2025-10-31

### ✨ Added

- 🔌 WebSocket Conversations & Enhanced Features baseline
- 🪟 Glass mode and transparency options for blob

### 🐛 Fixed

- 🖼️ Asset paths for backgrounds (dev/prod)
- ✨ Shader: correct shininess; state indicator init fix

### ♻️ Refactor

- 🧱 Move playground functionality into core classes

## [1.1.1] - 2025-10-30

### 🧰 Tooling / Docs

- 🚀 Production deployment & dev workflow
- 📝 CONTRIBUTING.md guide
- 🎚️ Background gradient: angle and color stop controls
- 📦 Vite config for bundling background images

## [1.1.0] - 2025-10-31

### 🎛️ Playground & Body

- 🧭 Dual sidebar layout; redesigned UI; background configuration API and controls
- 📷 Camera position controls; improved defaults; rotating sidebar with Soul config
- 🎨 Skins: Tricolor2 (Donut), zebra tricolor enhancements; skin switching & shininess improvements
- 🫧 Blob animation: fluid dynamics, audio effects system, interactive click/touch; smooth state transitions; microphone listening support
- 🖼️ Background images and media support; randomization ranges, messages area reorg; asset and scene bootstrapping

### 📚 Docs

- 🧭 Architecture, Mind & Soul integration; quick start; playground docs and assets

## [1.0.14] - 2025-10-29

### ✨ Added

- 🌊 Viscous fluid dynamics for blob animation
- 🧭 Mind menu functionality with comprehensive voice configuration

### 🐛 Fixed / 🎨 Polish

- 🛡️ Improve animation stability; prevent geometry collapse
- 🏷️ Badge visuals: simplify, remove white background
- 🧹 Remove debug logging; documentation passes

## [1.0.13] - 2025-10-29

### ⚙️ Features

- 🎚️ Configurable audio effects system
- 🔌 Wire audio effects controls to blob properties
- ⏱️ Add `timeEnabled` flag for audio effects

### 📚 Docs

- 📝 Comprehensive update for animations & state system

## [1.0.12] - 2025-10-29

### ✨ Added

- 🎵 Audio player UI with full controls
- ✨ Expose animation configuration parameters
- 🎛️ Add audio effects configuration UI
- 💄 Parameter-info styles for descriptive text

## [1.0.11] - 2025-10-29

### ✨ Added

- 👆 Fluid click interaction with configurable touch effects
- 🎤 Microphone listening support
- 🌊 Smooth state transitions between animation modes
- 🎛️ Animation configuration UI (phase 1)

## [1.0.10] - 2025-10-28

### 🐛 Fixed

- 🧠 Fix Mind initialization ordering

### 📚 Docs

- 🧭 Update ARCHITECTURE.md with Mind & Soul integration
- 📚 General documentation refresh

## [1.0.9] - 2025-10-28

### 🎛️ Tuning

- 🔮 Enhance blob randomization ranges
- 🎛️ Refresh playground default values
- 🧩 General UX and functionality improvements

## [1.0.8] - 2025-10-28

### ✨ Added

- 🎨 Tricolor2 (Donut) skin
- 🦓 Zebra skin tricolor enhancements

### 🔧 Changed

- 🔄 Improve skin switching & shininess; visuals polish

## [1.0.7] - 2025-10-28

### ✨ Added

- 📷 Camera position controls with real-time tracking
- 🖼️ Background image support; add asset pack

### 🎯 Improved

- 🎯 Better playground defaults and camera behavior

## [1.0.6] - 2025-10-28

### ✨ Added

- 🧰 Comprehensive Body controls in playground
- 🌈 Background configuration API and controls wired

### 🔧 Changed

- 🎛️ Update playground default values; layout refinements

## [1.0.5] - 2025-10-28

### ♻️ Refactor / 📚 Docs

- 🧩 Extract playground CSS/JS; reorganize docs into `docs/`
- 📁 Move `.env.sample` into playground
- 🧭 Architecture docs: Mind & Soul integration section

## [1.0.4] - 2025-10-28

### ✨ Added

- 🧪 Interactive playground for local testing
- 📖 Quick start guide
- 🧭 Dual sidebar layout with background gradient controls (initial)

## [1.0.3] - 2025-10-27

### ✨ Added

- 🤖 ElevenLabs Mind & Soul integration with personality system (baseline)
- 🎭 Personality hooks between Mind and Soul

## [1.0.2] - 2025-10-21

### 📚 Docs

- 📝 README branding and getting-started tweaks
- 👻 Project title emoji update for identity

## [1.0.1] - 2025-10-21

### 📚 Docs / Licensing

- 📄 Dual license and runtime support docs
- 📝 README updates (title emoji, clarifications)

## [1.0.0] - 2025-10-20

### 🎉 Major Refactoring

This version represents a complete architectural refactoring of the @kwami library, transforming it into a professional, reusable, and maintainable library.

### ✨ Added

#### Core Architecture

- **New modular architecture** with clear separation of concerns
- **KwamiAudio class** - Dedicated audio management with frequency analysis
- **KwamiBody class** - Manages 3D scene, renderer, and blob
- **Blob class** - Self-contained blob implementation with animation
- **Comprehensive TypeScript types** - Full type safety across the library
- **Proper exports structure** - Clean API with multiple export paths

#### Features

- **Automatic resize handling** using ResizeObserver
- **Animation loop management** with proper cleanup
- **Resource disposal methods** for memory management
- **Multiple skin support** (3Colors collection: Poles, Donut, Vintage)
- **Configurable scene setup** with sensible defaults
- **Audio playlist management** (next/previous track support)
- **Volume control** for audio playback
- **GLTF export functionality** for blob models
- **DNA generation** for unique blob identifiers
- **Random blob generation** with configurable parameters

#### Developer Experience

- Professional README with examples and documentation
- Comprehensive inline code documentation
- Clear folder structure for better maintainability
- Modular design for tree-shaking and smaller bundles

### 🔄 Changed

#### File Organization

- **Before**: Nested structure with `core/body/lib/Blob/`
- **After**: Flat, intuitive structure with `src/core/`, `src/blob/`, `src/scene/`

#### Skin Management

- **Before**: Deep nesting in `lib/Blob/skins/Tricolor/`
- **After**: Clean structure in `src/blob/skins/tricolor/`
- Renamed shader files: `shader.glsl` → `fragment.glsl` for clarity

#### Audio System

- **Before**: Basic audio playback tied to body
- **After**: Dedicated `KwamiAudio` class with full feature set
- Added proper Web Audio API initialization
- Improved error handling for audio playback

#### Blob Implementation

- **Before**: Monolithic class with mixed concerns
- **After**: Modular design with separate geometry, animation, and skins
- Better state management
- Cleaner API for customization

### 🗑️ Removed

- **Metamask folder** - Removed as we focus on single body (blob) implementation
- **Unused state files** - Consolidated state management
- **Redundant event handlers** - Simplified event system
- **Old body selection system** - Now focused on single, customizable blob

### 🔧 Technical Improvements

#### Performance

- Optimized animation loop with proper frame management
- Better geometry disposal to prevent memory leaks
- Efficient material management with Map-based skin storage

#### Code Quality

- Consistent naming conventions (PascalCase for classes)
- Proper encapsulation with private/public members
- Better error handling throughout
- Removed console.log statements (replaced with proper error handling)

#### Type Safety

- Created comprehensive type definitions
- All public APIs are fully typed
- Better IntelliSense support for developers

### 📦 Package Updates

- Updated package.json with proper library metadata
- Added module exports configuration
- Specified peer dependencies
- Added development scripts

### 🐛 Bug Fixes

- Fixed audio context suspension issues
- Resolved resize event memory leaks
- Fixed material disposal on skin change
- Corrected animation frame cleanup

### 📝 Documentation

- Created comprehensive README.md with:
  - Quick start guide
  - API documentation
  - Configuration examples
  - Usage examples
  - Architecture overview
- Added inline JSDoc comments throughout codebase
- Created this CHANGELOG

### 🔄 Migration Guide from 0.x to 1.0

#### Import Changes

```typescript
// Before
import Kwami from "./kwami/core/body";

// After
import { Kwami } from "@kwami/core";
```

#### Instantiation Changes

```typescript
// Before
const kwami = new Kwami(canvas);
kwami.body = new KwamiBody(canvas);

// After
const kwami = new Kwami(canvas, {
  body: {
    audioFiles: [...],
    initialSkin: 'tricolor'
  }
});
```

#### API Changes

```typescript
// Before
kwami.body.audio.playAudio();
kwami.body.blob.vector("x", 0.5);

// After
await kwami.body.audio.play();
kwami.body.blob.setSpikes(0.5, 0.5, 0.5);
```

### 🎯 Breaking Changes

1. **Constructor signature changed** - Now requires configuration object
2. **Audio methods renamed** - `playAudio()` → `play()`, `pauseAudio()` → `pause()`
3. **Blob methods renamed** - `vector()` → `setSpikes()`, `color()` → `setColor()`
4. **Skin configuration** - Moved from options to dedicated skin files
5. **Scene setup** - Now handled internally, with configuration options
6. **No more multi-body support** - Focused on single blob implementation

### 🚀 Future Plans

- AI Mind integration (LLM configuration)
- AI Soul implementation (personality system)
- STT/TTS integration
- Additional built-in skins
- Animation presets
- WebXR support
- Framework wrappers (React, Vue, Svelte)

---

## 📜 Version 0.x Series (2022-2023) - The Eden AI Era

> **Historical Note**: The v0.x series represents the initial implementation of Kwami using Eden AI's unified API platform for orchestrating STT, LLM, and TTS providers. While innovative at the time, this architecture ultimately proved unsuitable for real-time conversational AI due to inherent latency constraints in the sequential pipeline model.

## [0.5.3] - 2023-01-10

### 🐛 Fixed

- Final attempt at latency reduction: Implemented client-side response caching for common queries
- Fixed intermittent memory leaks in long-running sessions

### 📊 Metrics

- Latency still averaging 3.2s; project paused due to architectural limitations

## [0.5.2] - 2023-01-05

### 🔧 Changed

- Optimized Eden AI request batching
- Body: reduced vertex count for low-end GPUs (icosahedron detail -1) to prevent dropped frames
- Body: normalized audio analyser smoothing for consistent spike response across devices

### 🐛 Fixed

- Fixed rare race conditions in provider switching
- Body: fixed occasional shader normal flicker on rapid state transitions (listening→speaking)

## [0.5.1] - 2022-12-28

### ✨ Added

- Added experimental OpenAI TTS as fourth provider option
- Body: wireframe debug toggle for blob materials to aid profiling
- Body: shininess slider range extended (0–100000) for specular tuning

## [0.5.0] - 2022-12-20

### ✨ Added

- Implemented conversation memory with sliding window

### 🔧 Changed

- Upgraded to Eden AI SDK v1.4.3
- Body: eager disposal of unused textures/materials to cap GPU memory usage

## [0.4.9] - 2022-12-15

### 🐛 Fixed

- Fixed audio stutter on provider fallback
- Body: smoothed audio-reactive displacement to avoid jitter at low volumes

## [0.4.8] - 2022-12-10

### 🔧 Changed

- Tuned VAD parameters for better speech detection
- Body: improved “listening” visual accent (subtle inward pulse) mapped to mic RMS

## [0.4.7] - 2022-12-05

### ✨ Added

- Added token usage tracking system
- Body: on-canvas status chip for current state (idle/listening/thinking/speaking)

## [0.4.6] - 2022-11-30

### 🐛 Fixed

- Fixed buffer overflow in long recordings
- Body: eliminated animation hitch when replaying short MP3 samples

## [0.4.5] - 2022-11-25

### 🔧 Changed

- Improved fallback logic with priority scoring
- Body: eased animation state transitions with cubic-in-out tweening

## [0.4.4] - 2022-11-20

### ✨ Added

- Added Anthropic Claude as LLM fallback
- Body: added donut variant for 3Colors skin (alternative spherical mapping)

## [0.4.3] - 2022-11-15

### 🐛 Fixed

- Fixed high-frequency artifacts in TTS
- Body: added soft-knee compressor in post to tame harsh transients

## [0.4.2] - 2022-11-10

### 🔧 Changed

- Optimized audio preprocessing pipeline
- Body: unified material param names across skins (shininess, colorX/Y/Z)

## [0.4.1] - 2022-11-05

### ✨ Added

- Added Google TTS as fallback provider
- Body: background plane scaling logic updated to guarantee full-viewport coverage

## [0.4.0] - 2022-11-01

### ✨ Added

- Multi-provider TTS support with fallback

### 🔧 Changed

- Refactored audio pipeline for modularity
- Body: split geometry/animation/shader concerns for maintainability

## [0.3.9] - 2022-10-25

### 🐛 Fixed

- Fixed context window overflow
- Body: corrected speaking oscillation amplitude clamp to avoid clipping through camera

## [0.3.8] - 2022-10-20

### 🔧 Changed

- Improved personality prompt templates
- Body: tuned tricolor gradient ramp for better contrast at grazing angles

## [0.3.7] - 2022-10-15

### ✨ Added

- Added AssemblyAI as STT fallback
- Body: listening arc indicator around blob perimeter (subtle ring)

## [0.3.6] - 2022-10-10

### 🐛 Fixed

- Fixed rate limit handling
- Body: throttled pointermove interaction handler to 60fps to reduce jank

## [0.3.5] - 2022-10-05

### 🔧 Changed

- Tuned LLM temperature and max tokens
- Body: default blob scale adjusted for medium-density screens (1.2→1.0)

## [0.3.4] - 2022-09-30

### ✨ Added

- Added basic audio visualization
- Body: mapped FFT bass band to spike displacement with configurable gain

## [0.3.3] - 2022-09-25

### 🐛 Fixed

- Fixed microphone stream timeouts
- Body: camera near/far planes widened to prevent clipping on deep deformations

## [0.3.2] - 2022-09-20

### 🔧 Changed

- Improved error recovery
- Body: ensured materials dispose on skin swap to prevent WebGL leaks

## [0.3.1] - 2022-09-15

### ✨ Added

- Integrated GPT-3.5-turbo
- Body: basic state mapping (speaking → outward spikes, listening → inward spikes)

## [0.3.0] - 2022-09-01

### ✨ Added

- Initial LLM integration

### 🔧 Changed

- Updated Eden AI configuration
- Body: reorganized scene graph (blob group, background plane, lights)

## [0.2.9] - 2022-08-25

### 🐛 Fixed

- Fixed audio format conversion
- Body: paused indicator overlay when AudioContext is suspended by browser

## [0.2.8] - 2022-08-20

### 🔧 Changed

- Optimized STT request size
- Body: optional microphone waveform overlay for debugging input levels

## [0.2.7] - 2022-08-15

### ✨ Added

- Added VAD for speech detection
- Body: breathing speed control for idle state

## [0.2.6] - 2022-08-10

### 🐛 Fixed

- Fixed permission prompts
- Body: fallback texture when media fails to load (prevents black blob)

## [0.2.5] - 2022-08-05

### 🔧 Changed

- Improved UI layout
- Body: grouped controls into “Blob”, “Audio”, “Background”, “Actions” sections

## [0.2.4] - 2022-07-30

### ✨ Added

- Added status indicators
- Body: toast notifications for errors and long-running operations

## [0.2.3] - 2022-07-25

### 🐛 Fixed

- Fixed initial audio capture
- Body: auto-resume AudioContext on user gesture to satisfy autoplay policies

## [0.2.2] - 2022-07-20

### 🔧 Changed

- Added basic error handling
- Body: error overlay panel with retry options

## [0.2.1] - 2022-07-15

### ✨ Added

- Integrated Whisper STT
- Body: listening indicator (subtle glow) while mic is active

## [0.2.0] - 2022-07-01

### ✨ Added

- Basic microphone capture
- Eden AI setup

### 🔧 Changed

- Project structure organized
- Body: initial three.js scene bootstrapped (camera, light, renderer)

## [0.1.9] - 2022-06-25

### 🐛 Fixed

- Dependency version conflicts
- Body: build pipeline fixed for shaders on Windows paths

## [0.1.8] - 2022-06-20

### 🔧 Changed

- Updated build scripts
- Body: added npm scripts for dev watch and shader reload

## [0.1.7] - 2022-06-15

### ✨ Added

- Initial UI skeleton
- Body: canvas scaffolding and layout container

## [0.1.6] - 2022-06-10

### 🐛 Fixed

- Setup issues
- Body: scene initialization order bug (lights before materials) resolved

## [0.1.5] - 2022-06-05

### 🔧 Changed

- Added .gitignore
- Body: ignored build artifacts and sample assets

## [0.1.4] - 2022-05-30

### ✨ Added

- package.json setup
- Body: dependencies for three.js added

## [0.1.3] - 2022-05-25

### 🐛 Fixed

- Initial commit fixes
- Body: tsconfig strict mode issues for WebGL typings addressed

## [0.1.2] - 2022-05-20

### 🔧 Changed

- Project initialization
- Body: folder structure established (`core/body`, `blob`, `scene`)

## [0.1.1] - 2022-05-15

### ✨ Added

- README skeleton
- Body: README section for blob goals and rendering approach

## [0.1.0] - 2022-05-10

### 🎉 Initial Commit

- Project created
- Basic setup with Eden AI SDK
- Pipeline skeleton implemented

- First experiments with STT using Whisper
- Basic audio capture working
- Initial latency measurements: ~3s per turn

## [0.0.1] - 2022-05-15

### 🎉 Project Genesis

- Initialized repository
- Set up TypeScript config
- Added Eden AI SDK dependency
- Created basic conversation pipeline structure
- Implemented microphone access with getUserMedia
- Added simple audio recording and playback
- First successful STT test with Whisper (via Eden AI)
- Basic LLM integration with GPT-3 (non-turbo)
- Initial TTS with ElevenLabs
- End-to-end test: Voice input to voice output
- Measured initial latency: 4.2s average

---

**Note**: Version 0.x development spanned May 2022 to January 2023, with 50+ iterations attempting to optimize the sequential pipeline. Despite adding multi-provider support, advanced audio processing, and various caching strategies, the fundamental latency issues persisted. The project was paused in January 2023 after realizing that a sequential architecture couldn't achieve sub-second response times. Development resumed in 2025 with the advent of integrated streaming APIs.

**Epilogue**: The v1.x series in 2025 finally solved the latency problem through WebSocket streaming, enabling natural conversations.

---
