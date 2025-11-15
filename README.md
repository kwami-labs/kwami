# 👻 kwami

An **independent, reusable** 3D Interactive AI Companion Library for creating engaging AI companions with visual (blob), audio, and AI capabilities.

> **Version 1.3.0** - [See what's new](#whats-new-in-v130)

[![npm version](https://img.shields.io/npm/v/kwami.svg)](https://www.npmjs.com/package/kwami)
[![License](https://img.shields.io/badge/license-Dual%20License-blue.svg)](./LICENSE)
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

- **[Quick Start Guide](./docs/getting-started/quickstart.md)** - Get running in 5 minutes
- **[Installation Guide](./docs/getting-started/installation.md)** - Detailed setup for all environments
- **[Core Concepts](./docs/getting-started/concepts.md)** - Understand the architecture

### Core Components

- **[Body](./docs/core/body.md)** - Visual 3D blob and scene management
- **[Mind](./docs/core/mind.md)** - AI capabilities and provider system
- **[Soul](./docs/core/soul.md)** - Personality and emotional intelligence

### Guides

- **[Configuration](./docs/guides/configuration.md)** - Complete configuration reference
- **[Animations](./docs/guides/animations.md)** - Animation states and effects

### Architecture

- **[Mind Architecture](./docs/architecture/mind-architecture.md)** - Provider system internals
- **[Body Architecture](./docs/architecture/body-architecture.md)** - Rendering pipeline
- **[Soul Architecture](./docs/architecture/soul-architecture.md)** - Personality system

### Advanced

- **[Advanced Topics](./docs/advanced/overview.md)** - Performance, custom development, testing

### API Reference

- **[Kwami API](./docs/api/kwami.md)** - Complete API documentation
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

See [Playground README](./playground/README.md) for details.

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

## What's New in v1.3.0

### 🧠 Mind Provider Architecture

- Multi-vendor AI provider support (ElevenLabs, OpenAI)
- Hot-swappable providers at runtime
- Unified provider interface for extensibility

### 🌈 Enhanced Background System

- Three.js gradient overlays
- Multi-layer background management
- Glass mode with gradient planes

### 🎭 Emotional Personality System

- 10-dimensional emotional spectrum (-100 to +100)
- Rich emotional trait system
- Personality blending and adaptation

### 📚 Complete Documentation

- Comprehensive guides for all components
- Architecture documentation
- Advanced development guides

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

See [Architecture Overview](./ARCHITECTURE.md) for diagrams and details.

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

**Made with ❤️ by the Quami team**

Current version: **1.3.0**
