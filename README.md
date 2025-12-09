# 👻 kwami

An **independent, reusable** 3D Interactive AI Companion Library for creating engaging AI companions with visual (blob), audio, and AI capabilities.

> **Version 1.5.11** - [See what's new](#whats-new)

[![npm version](https://img.shields.io/npm/v/kwami.svg)](https://www.npmjs.com/package/kwami)
[![License](https://img.shields.io/badge/license-AGPL--3.0%20%7C%20Commercial-blue.svg)](./LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-kwami.io-green.svg)](https://kwami.io)

## ✨ Features

### Mind-Body-Soul Architecture

Kwami is built around three core components:

- **🎨 Body** - 3D audio-reactive blob with real-time animations and touch interaction
- **🧠 Mind** - AI capabilities (TTS, STT, Conversations) with multi-provider support
- **🎭 Soul** - Personality system with 10-dimensional emotional intelligence

### Key Features

- ✅ **Audio-Reactive 3D Blob** - Real-time visualization with WebGL
- ✅ **Multiple Shader Skins** - 3Colors collection (Poles, Donut, Vintage)
- ✅ **Interactive Touch Effects** - Liquid-like ripples on click
- ✅ **Animation States** - Idle, listening, thinking, speaking
- ✅ **AI Voice Integration** - ElevenLabs & OpenAI TTS support
- ✅ **ElevenLabs Agents** - Full agent management with Tools & Knowledge Base APIs
- ✅ **Emotional Personalities** - Rich personality system with emotional traits
- ✅ **Background System** - Gradients, images, videos with glass effects
- ✅ **TypeScript First** - Fully typed for excellent DX
- ✅ **Framework Agnostic** - Use with React, Vue, Svelte, or vanilla JS

## 📦 Installation

```bash
# npm
npm install kwami

# bun (recommended)
bun add kwami

# deno
deno add npm:kwami
```

> All dependencies included: `three`, `simplex-noise`, `@elevenlabs/elevenlabs-js`

### 🐳 Docker Deployment

All ecosystem projects now include Docker support with 3 runtime options:

```bash
# Node.js (default)
docker build -f docker/Dockerfile -t kwami-app .

# Bun (fast builds)
docker build -f docker/Dockerfile.bun -t kwami-app:bun .

# Deno (secure runtime)
docker build -f docker/Dockerfile.deno -t kwami-app:deno .
```

👉 **[Complete Docker Deployment Guide](./docs/DOCKER_DEPLOYMENT.md)**

## 🚀 Quick Start

```typescript
import { Kwami } from "kwami";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;

const kwami = new Kwami(canvas, {
  body: {
    audioFiles: ["/audio/track.mp3"],
    initialSkin: "Poles",
    blob: {
      resolution: 180,
      colors: { x: "#ff0066", y: "#00ff66", z: "#6600ff" },
    },
  },
  mind: {
    provider: "elevenlabs",
    apiKey: "your-api-key",
    voiceId: "your-voice-id",
  },
  soul: {
    name: "Kaya",
    emotionalTraits: {
      happiness: 75,
      empathy: 95,
      energy: 60,
    },
  },
});

// Play audio and animate
await kwami.body.audio.play();

// Speak with AI voice
await kwami.speak("Hello! I am Kwami.");

// Randomize appearance
kwami.body.blob.setRandomBlob();
```

## 📚 Documentation

### Getting Started

- **[Quick Start Guide](./docs/1_kwami/getting-started/quickstart.md)** - Get running in 5 minutes
- **[Installation Guide](./docs/1_kwami/getting-started/installation.md)** - Detailed setup for all environments
- **[Core Concepts](./docs/1_kwami/getting-started/concepts.md)** - Understand the architecture

### Core Components

- **[Body](./docs/1_kwami/core/body.md)** - Visual 3D blob and scene management
- **[Mind](./docs/1_kwami/core/mind.md)** - AI capabilities and provider system
- **[Soul](./docs/1_kwami/core/soul.md)** - Personality and emotional intelligence

### Guides

- **[Configuration](./docs/1_kwami/guides/configuration.md)** - Complete configuration reference
- **[Animations](./docs/1_kwami/guides/animations.md)** - Animation states and effects

### Architecture

- **[Mind Architecture](./docs/1_kwami/architecture/mind-arch.md)** - Provider system internals
- **[Body Architecture](./docs/1_kwami/architecture/body-arch.md)** - Rendering pipeline
- **[Soul Architecture](./docs/1_kwami/architecture/soul-arch.md)** - Personality system

### Advanced

- **[Advanced Topics](./docs/1_kwami/advanced/overview.md)** - Performance, custom development, testing

### API Reference

- **[Kwami API](./docs/1_kwami/api/kwami.md)** - Complete API documentation
- **[Full Documentation Index](./docs/README.md)** - Browse all documentation

## 🎮 Interactive Playground

Try Kwami live at **[kwami.io](https://kwami.io)**

Run locally:

```bash
npm run playground
```

Features:

- 🎨 **Rotating Sidebar System** - Mind, Body, Soul configuration
- 🎙️ **Voice Conversations** (Beta) - WebSocket-based interactions
- 🤖 **Complete Mind Menu** - 50+ ElevenLabs configuration options
- ✨ **Personality Editor** - Real-time personality customization
- 🌈 **Background Manager** - Gradients, images, videos (15+ included)
- 🎛️ **Audio Effects** - Fine-tune frequency response
- 📥 **GLB Export** - Download blob as 3D model

See [Playground README](./pg/README.md) for details.

## 🌐 KWAMI Ecosystem

### 📦 Core Library (`/kwami`)
The core npm package (`kwami`) - a standalone, reusable 3D interactive AI companion library featuring a Mind-Body-Soul architecture. Published to npm for easy integration into any JavaScript/TypeScript project. This is the heart of the KWAMI ecosystem, providing the foundational 3D blob visualization, AI voice capabilities, and personality system that powers all other projects.
- **npm Package:** [@kwami](https://www.npmjs.com/package/kwami)
- **Source Code:** [kwami/](./kwami/)
- **Documentation:** [docs/1_kwami/](./docs/1_kwami/)

### 🎮 Playground (`/pg`)
Interactive demo with full configuration UI for testing all Kwami features.
- Documentation: [docs/2_pg/](./docs/2_pg/)

### 🔮 Kwami App (`/app`)
Full-featured Nuxt 4 web application providing a complete Kwami experience. Built with glassmorphic UI, multi-language support (en, fr, es), Supabase authentication, and ElevenLabs voice integration. A production-ready implementation of the Kwami 3D AI companion.
- Documentation: [docs/3_app/](./docs/3_app/)

### ⛓️ Solana Programs (`/solana`)
Smart contracts for QWAMI token and KWAMI NFT system with 10B supply by 2100.
- Documentation: [docs/4_solana/](./docs/4_solana/)

### 🎨 Candy Machine (`/candy`)
Mint your own KWAMI NFTs on Solana with unique DNA-based validation.
- Documentation: [docs/5_candy/](./docs/5_candy/)

### 🛒 Marketplace (`/market`)
Buy, sell, and trade KWAMI NFTs on the Solana blockchain.
- Documentation: [docs/6_market/](./docs/6_market/)

### 🏛️ DAO (`/dao`)
Decentralized governance platform for KWAMI NFT holders to participate in community decisions.
- Documentation: [docs/7_dao/](./docs/7_dao/)

### 🌐 Website (`/web`)
Public-facing website showcasing the KWAMI ecosystem.
- Documentation: [docs/8_web/](./docs/8_web/)

### 📚 Documentation (`/docs`)
Complete documentation for all components and APIs organized by project.

## 🎯 Core Concepts

### Body - Visual Representation

```typescript
// 3D blob with audio reactivity
kwami.body.blob.setSkin("Poles");
kwami.body.blob.setColors("#ff0000", "#00ff00", "#0000ff");
kwami.body.setBackgroundGradient("#1a1a2e", "#16213e");

// Interactive animations
kwami.body.enableBlobInteraction();
kwami.body.startListening(); // Microphone mode
kwami.body.startThinking(); // Contemplative animation
```

### Mind - AI Capabilities

```typescript
// Multi-provider AI system
await kwami.mind.initialize({
  provider: "elevenlabs", // or "openai"
  apiKey: "your-key",
  voiceId: "voice-id",
});

// Text-to-Speech
await kwami.mind.speak("Hello world!");

// Voice fine-tuning
kwami.mind.setStability(0.5);
kwami.mind.setSimilarityBoost(0.75);

// Advanced: Create agents with Tools & Knowledge Base
import { AgentConfigBuilder } from 'kwami';

const config = new AgentConfigBuilder()
  .withName('Support Agent')
  .withVoice('voice_id')
  .withLLM('gpt-4o')
  .withTools([{ name: 'create_ticket', url: 'https://api.example.com/tickets' }])
  .withKnowledgeBase([{ knowledge_base_id: 'kb_123' }])
  .build();

const agent = await kwami.mind.createAgent(config);
```

### Soul - Personality

```typescript
// Preset personalities
kwami.soul.loadPresetPersonality("friendly"); // Kaya
kwami.soul.loadPresetPersonality("professional"); // Nexus
kwami.soul.loadPresetPersonality("playful"); // Spark

// Custom emotional traits
kwami.soul.setEmotionalTrait("happiness", 80);
kwami.soul.setEmotionalTrait("energy", 90);

// Generate AI context
const systemPrompt = kwami.soul.getSystemPrompt();
```

## 🎨 Example Use Cases

### Audio Visualizer

```typescript
const kwami = new Kwami(canvas, {
  body: {
    audioFiles: ["/audio/music.mp3"],
    blob: { spikes: { x: 0.5, y: 0.5, z: 0.5 } },
  },
});
await kwami.body.audio.play();
```

### Voice Assistant

```typescript
const kwami = new Kwami(canvas, {
  mind: { provider: "elevenlabs", apiKey: "key" },
  soul: { name: "Assistant" },
});

await kwami.listen();
kwami.think();
await kwami.speak("How can I help you?");
```

### AI Companion

```typescript
const kwami = new Kwami(canvas, {
  body: { initialSkin: "Poles" },
  mind: { provider: "elevenlabs" },
  soul: {
    name: "Kaya",
    emotionalTraits: {
      happiness: 75,
      empathy: 95,
      socialness: 90,
    },
  },
});

kwami.soul.loadPresetPersonality("friendly");
await kwami.mind.startConversation({
  systemPrompt: kwami.soul.getSystemPrompt(),
  onUserSpeaking: () => kwami.setState("listening"),
  onAISpeaking: () => kwami.setState("speaking"),
});
```

## What's New

### v1.5.2 - Monorepo Restructuring

**🏗️ Major Project Restructuring:**
- **Core Library**: Moved to `kwami/` folder for npm publishing
- **Documentation**: Reorganized into `docs/` with project-specific folders (1_kwami through 8_web)
- **Workspace Setup**: Configured npm workspaces for all projects
- **Playground**: Renamed from `playground/` to `pg/`
- **Clean Separation**: Each project now has its own isolated structure
- **CI/CD**: Updated GitHub Actions to build and publish from `kwami/`

**📦 Improved Organization:**
- Root now contains only monorepo-level files
- Each project has its own README, CHANGELOG, and documentation
- Clear separation between core library and applications
- Proper workspace dependency management

### v1.4.1 - ElevenLabs Agents

**Complete ElevenLabs Conversational AI Agents Integration**

**Professional-grade agent management with Tools and Knowledge Base:**

```typescript
import { AgentConfigBuilder } from 'kwami';

// Create an advanced agent with tools and knowledge
const config = new AgentConfigBuilder()
  .withName('Support Agent')
  .withVoice('voice_id')
  .withLLM('gpt-4o')
  .withPrompt('You are a helpful support agent')
  .withTools([{
    name: 'create_ticket',
    description: 'Create support ticket',
    url: 'https://api.example.com/tickets'
  }])
  .withKnowledgeBase([{ knowledge_base_id: 'kb_123' }])
  .withMaxDuration(1800)
  .build();

const agent = await kwami.mind.createAgent(config);
```

**Key Features:**
- ✨ **AgentConfigBuilder** - Fluent API for agent configuration with validation
- 🔧 **Tools API** - Create custom tools with webhooks and parameters
- 📚 **Knowledge Base API** - RAG support with document management (URL, text, file)
- 🌊 **Multi-Agent Workflows** - Orchestrate complex conversations with conditional routing
- 🎯 **Complete Type Coverage** - Full TypeScript types for all ElevenLabs APIs
- ✅ **Validation System** - Built-in configuration validation with detailed errors
- 📖 **Comprehensive Examples** - Complete documentation and test suite

**APIs Implemented:**
- Agent CRUD operations (create, read, update, delete, duplicate, list)
- Tools management (create tools, manage webhooks, parameter schemas)
- Knowledge Base (create KBs, add documents, RAG indexing, semantic search)
- Workflow system (multi-agent orchestration, conditional routing, node types)
- Conversation management (list, get details, download audio, send feedback)

See [Mind Examples](./docs/1_kwami/mind-examples.md) for comprehensive usage guides.

---

## What's New in v1.4.0

### 🧬 KWAMI NFT System - Solana Blockchain Integration

- Unique DNA-based NFTs with 1 trillion limit
- Solana blockchain integration with Metaplex standard
- Candy machine for minting KWAMI NFTs
- DNA registry with on-chain validation
- Real-time WebSocket updates (Socket.IO 4.8.1)

### 🏛️ KWAMI DAO - Decentralized Governance

**NEW:** Governance platform for KWAMI NFT holders built with Nuxt 4 and Solana.

```bash
cd dao
npm install
npm run dev
```

**Features:**
- 🔌 Multi-wallet support (Phantom, Solflare, Backpack, etc.)
- ✅ Automatic KWAMI NFT holder verification
- 💰 QWAMI token balance tracking for governance
- 📝 Create and vote on proposals
- 🗳️ Token-weighted voting system
- 📊 Real-time voting statistics

**DAO Membership:**
- Own at least 1 KWAMI NFT
- Hold 100+ QWAMI tokens to participate in governance
- One QWAMI = One vote

See [dao/README.md](./dao/README.md) and [docs/7_dao/](./docs/7_dao/) for complete documentation.

---

## Previous Releases

### v1.3.0 – Mind Provider Architecture

- Multi-vendor AI provider support (ElevenLabs, OpenAI)
- Hot-swappable providers at runtime
- Unified provider interface for extensibility
- Enhanced background system with Three.js gradient overlays
- 10-dimensional emotional personality system
- Complete documentation

### v1.3.1-1.3.4 – Patches

- 🎭 **1.3.1** – Expanded Soul personality templates to 20+ presets
- 🧠 **1.3.2** – Introduced Kwami Skills System (JSON/YAML-driven behaviors)
- 🎨 **1.3.3** – Mind UI polish with provider logos and refined tabs
- 🧪 **1.3.4** – Full Vitest suite (238 tests), hardened KwamiAudio and Soul defaults

See [CHANGELOG](./CHANGELOG.md) for complete history.

## 🏗️ Architecture

```
┌──────────────────────────────────────┐
│             KWAMI                    │
│         (Orchestrator)               │
├──────────┬──────────────┬────────────┤
│   BODY   │     MIND     │    SOUL    │
│  Visual  │   AI/Voice   │ Personality│
│          │              │            │
│  Scene   │  Providers   │  Emotional │
│  Blob    │  - 11Labs    │  - Traits  │
│  Audio   │  - OpenAI    │  - Prompts │
└──────────┴──────────────┴────────────┘
```

**Data Flow:**

```
Audio → Web Audio API → FFT → Blob Vertices → Render
User → Mind Provider → Soul Context → LLM → TTS → Animation
```

See [Architecture Overview](./docs/1_kwami/ARCHITECTURE.md) for diagrams and details.

## 🚀 Deployment

### Live Site

- **Production:** [kwami.io](https://kwami.io)
- **Branch:** `main` (protected)
- **Auto-deploy:** On merge to main

### Git Workflow

```
feature/* → [PR] → dev → [Review] → main → Deploy
```

See [Contributing Guide](./CONTRIBUTING.md) for details.

## 🤝 Contributing

We welcome contributions! Please:

1. Read [CONTRIBUTING.md](./CONTRIBUTING.md)
2. Fork and create branch from `dev`
3. Make changes with tests
4. Submit PR to `dev` (not `main`)

### For Maintainers

- **Automated Publishing:** Package auto-publishes to npm when version changes on `main`
- **Setup Guide:** [.github/NPM_SETUP.md](.github/NPM_SETUP.md)
- **Release Process:** See [CONTRIBUTING.md](./CONTRIBUTING.md#release-process-automated)

## 📄 License

**Dual License:**

- **Personal/Non-Commercial:** Apache License 2.0
- **Commercial:** Requires separate license

Contact: [Alex Colls](https://github.com/alexcolls)

See [LICENSE](./LICENSE) for full terms.

## 🙏 Credits

Built with:

- [THREE.js](https://threejs.org/) - 3D graphics
- [simplex-noise](https://github.com/jwagner/simplex-noise.js/) - Smooth noise
- [ElevenLabs](https://elevenlabs.io/) - AI voice synthesis
- TypeScript - Type safety

## 📧 Support

- **Documentation:** [docs/README.md](./docs/README.md)
- **Issues:** [GitHub Issues](https://github.com/alexcolls/kwami/issues)
- **Discussions:** [GitHub Discussions](https://github.com/alexcolls/kwami/discussions)

## 🔗 Links

- 🌐 **Live Demo:** [kwami.io](https://kwami.io)
- 📦 **npm Package:** [npmjs.com/package/kwami](https://www.npmjs.com/package/kwami)
- 💻 **GitHub:** [github.com/alexcolls/kwami](https://github.com/alexcolls/kwami)
- 📚 **Full Docs:** [docs/README.md](./docs/README.md)
- 📝 **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

---

**Made with ❤️ by the KWAMI team**
