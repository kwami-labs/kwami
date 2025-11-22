# 👻 kwami

An **independent, reusable** 3D Interactive AI Companion Library for creating engaging AI companions with visual (blob), audio, and AI capabilities.

> **Version 1.5.6** - Core library for the KWAMI ecosystem

[![npm version](https://img.shields.io/npm/v/kwami.svg)](https://www.npmjs.com/package/kwami)
[![License](https://img.shields.io/badge/license-AGPL--3.0%20%7C%20Commercial-blue.svg)](../LICENSE)

## ✨ Features

### Mind-Body-Soul Architecture

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
- ✅ **TypeScript First** - Fully typed for excellent DX
- ✅ **Framework Agnostic** - Use with React, Vue, Svelte, or vanilla JS

## 📦 Installation

```bash
npm install kwami
# or
bun add kwami
# or
deno add npm:kwami
```

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

For complete documentation, see the [main repository documentation](../docs/1_kwami/README.md).

### Quick Links

- [API Reference](../docs/1_kwami/api/kwami.md)
- [Getting Started Guide](../docs/1_kwami/getting-started/quickstart.md)
- [Architecture Overview](../docs/1_kwami/ARCHITECTURE.md)
- [Mind System](../docs/1_kwami/core/mind.md)
- [Body System](../docs/1_kwami/core/body.md)
- [Soul System](../docs/1_kwami/core/soul.md)

## 🔗 Links

- 🌐 **Live Demo:** [kwami.io](https://kwami.io)
- 📦 **npm Package:** [npmjs.com/package/kwami](https://www.npmjs.com/package/kwami)
- 💻 **GitHub:** [github.com/alexcolls/kwami](https://github.com/alexcolls/kwami)
- 📚 **Full Docs:** [Main Repository](https://github.com/alexcolls/kwami)

## 📄 License

MIT License - See [LICENSE](../LICENSE) for details.

## 🙏 Credits

Built with THREE.js, simplex-noise, ElevenLabs, and TypeScript.

---

**Made with ❤️ by the KWAMI team**

Part of the KWAMI ecosystem - see [main repository](https://github.com/alexcolls/kwami) for all projects.

