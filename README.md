# 👻 @kwami

An **independent, reusable** 3D Interactive AI Companion Library for creating engaging AI companions with visual (blob), audio, and AI capabilities.

> **Independent Module:** This library can be used standalone in any JavaScript/TypeScript project or integrated as a submodule.

## ✨ Features

### 💫 Core Features

- 🎨 **3D Blob Body** - Morphing sphere that reacts to audio in real-time
- 🎵 **Audio Integration** - Built-in audio playback and frequency analysis
- 🎭 **Multiple Skins** - 3Colors collection featuring Poles, Donut, and Vintage shader materials (formerly Tricolor, Tricolor2, and Zebra) with easy extensibility
- 🔊 **Audio Visualization** - Real-time audio-reactive animations
- 🤚 **Interactive Touch** - Click the blob for natural liquid-like touch effects
- 🎤 **Listening Mode** - Double-click to start/stop microphone listening with inward audio-reactive spikes
- 🧠 **Thinking Animation** - Chaotic contemplative movements during processing
- 🔄 **Smooth State Transitions** - Seamless blending between neutral, listening, thinking, and speaking states
- 🎮 **Event System** - Rich interaction API for user events
- 💬 **AI Ready** - Integrated ElevenLabs TTS and personality system
- 🎯 **TypeScript** - Fully typed for better DX
- 🚀 **Performant** - Optimized WebGL rendering
- 📦 **Modular** - Use only what you need

### ✨ Latest Enhancements

#### Playground UI (Last 48 hours)

- 📐 **Scale Control** - Adjust blob size (0.1-3.0) while preserving audio-reactive breathing
- 🌈 **Advanced Background Controls** - Full tricolor gradient system:
  - 3 color pickers for gradient creation
  - Angle control (0-360°) for gradient direction
  - Color stop positioning (0-100%)
  - Randomize & Reset functionality
  - Smooth 0.8s CSS transitions
- 🎨 **Dual Sidebar Layout** - Organized left/right sidebars:
  - **Left**: Configuration (Voice, Personality, Background)
  - **Right**: Speech & Body controls
  - **Center**: Large canvas area
- 🔧 **Comprehensive Body Controls** - All blob parameters now fully controllable:
  - Spikes (X/Y/Z noise frequency)
  - Time (X/Y/Z animation speed)
  - Rotation (X/Y/Z spin effects)
  - Colors (X/Y/Z 3Colors palette)
  - Resolution, Shininess, Wireframe
  - Real-time value displays
- 💾 **Real-time Updates** - Immediate visual feedback with bidirectional sync
- 📝 **Enhanced Documentation** - Complete documentation suite in `/docs` folder with 8 comprehensive guides

## 📦 Installation

### Runtime Support

This library supports multiple JavaScript runtimes:

- **Bun** (recommended - default used by alexcolls) - Fast all-in-one JavaScript runtime
- **Deno** - Secure TypeScript/JavaScript runtime
- **Node.js** - Traditional JavaScript runtime

Choose your preferred package manager:

```bash
# Using Bun (recommended)
bun add @kwami/core three simplex-noise
# or
bun i @kwami/core three simplex-noise

# Using Deno
deno add npm:@kwami/core npm:three npm:simplex-noise

# Using npm (Node.js)
npm install @kwami/core three simplex-noise
# or
npm i @kwami/core three simplex-noise
```

## 🚀 Quick Start

```typescript
import { Kwami } from "@kwami/core";

// Get your canvas element
const canvas = document.querySelector("canvas") as HTMLCanvasElement;

// Create a Kwami instance
const kwami = new Kwami(canvas, {
  body: {
    audioFiles: ["/audio/track1.mp3", "/audio/track2.mp3"],
    initialSkin: "Poles",
    blob: {
      resolution: 180,
      colors: {
        x: "#ff0066",
        y: "#00ff66",
        z: "#6600ff",
      },
    },
  },
});

// Play audio
await kwami.body.audio.play();

// Randomize appearance
kwami.body.blob.setRandomBlob();
```

## 📚 Documentation

### 📖 Documentation Guides

Comprehensive guides for different aspects of Kwami:

- **[QUICKSTART.md](./docs/QUICKSTART.md)** - Quick start guide for getting up and running
- **[CONVERSATIONAL_QUICKSTART.md](./docs/CONVERSATIONAL_QUICKSTART.md)** - Quick start for conversational AI features
- **[ELEVENLABS_INTEGRATION.md](./docs/ELEVENLABS_INTEGRATION.md)** - Complete ElevenLabs integration guide
- **[AGENTS_API.md](./docs/AGENTS_API.md)** - Agent management API for creating and managing conversational AI agents
- **[CONVERSATIONS_API.md](./docs/CONVERSATIONS_API.md)** - Track, analyze, and manage all agent conversations with full analytics
- **[CONVERSATIONAL_AI.md](./docs/CONVERSATIONAL_AI.md)** - Detailed conversational AI documentation
- **[CONVERSATION_BETA_GUIDE.md](./docs/CONVERSATION_BETA_GUIDE.md)** - Beta guide for voice conversation features
- **[MIND_CLASS_IMPLEMENTATION.md](./docs/MIND_CLASS_IMPLEMENTATION.md)** - Technical implementation details for the Mind class
- **[MIGRATION.md](./docs/MIGRATION.md)** - Migration guide for upgrading from previous versions
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete architecture overview

### Core Concepts

Kwami is composed of three main parts:

1. **Body** - The visual 3D blob representation
2. **Mind** - The AI configuration and capabilities (LLM, TTS, STT)
3. **Soul** - The AI personality and behavior

### Body Configuration

The body manages the 3D scene, renderer, camera, and the blob mesh.

```typescript
const kwami = new Kwami(canvas, {
  body: {
    // Audio files for the playlist
    audioFiles: ["/audio/track1.mp3"],

    // Initial skin type (3Colors collection variants: Poles, Donut, Vintage)
    initialSkin: "Poles",

    // Audio configuration
    audio: {
      preload: "auto",
      autoInitialize: true,
      volume: 0.8,
    },

    // Scene configuration
    scene: {
      fov: 100,
      near: 0.1,
      far: 1000,
      cameraPosition: { x: 0, y: 6, z: 0 },
      enableShadows: true,
      enableControls: true,
    },

    // Blob configuration
    blob: {
      resolution: 180,
      spikes: { x: 0.2, y: 0.2, z: 0.2 },
      time: { x: 1, y: 1, z: 1 },
      rotation: { x: 0.01, y: 0.01, z: 0 },
      colors: {
        x: "#ff0066",
        y: "#00ff66",
        z: "#6600ff",
      },
      shininess: 100,
      wireframe: false,
    },
  },
});
```

### Audio Management

```typescript
// Play audio
await kwami.body.audio.play();

// Pause audio
kwami.body.audio.pause();

// Next track
kwami.body.audio.next();

// Previous track
kwami.body.audio.previous();

// Set volume (0-1)
kwami.body.audio.setVolume(0.5);

// Get frequency data for visualization
const frequencyData = kwami.body.audio.getFrequencyData();
```

### Blob Customization

```typescript
// Change skin
kwami.body.blob.setSkin("Vintage");
kwami.body.blob.setSkin("Donut");

// Set custom colors (Poles skin)
kwami.body.blob.setColors("#ff0000", "#00ff00", "#0000ff");

// Set single color
kwami.body.blob.setColor("x", "#ff00ff");

// Randomize appearance
kwami.body.blob.setRandomBlob();

// Set spike intensity
kwami.body.blob.setSpikes(0.3, 0.3, 0.3);

// Set rotation speed
kwami.body.blob.setRotation(0.01, 0.01, 0);

// Set resolution (segments)
kwami.body.blob.setResolution(200);

// Enable wireframe
kwami.body.blob.setWireframe(true);

// Export as GLB
kwami.body.blob.exportGLTF();
```

### Interactive Animations

```typescript
// Enable click interaction (natural liquid touch effects)
kwami.body.enableBlobInteraction();
kwami.body.blob.touchStrength = 0.6; // Adjust intensity
kwami.body.blob.touchDuration = 1200; // Duration in ms
kwami.body.blob.maxTouchPoints = 5; // Max simultaneous touches

// Listening mode (microphone with inward spikes)
kwami.body.startListening();
const listening = kwami.body.isListening(); // Check state
kwami.body.stopListening();

// Thinking animation (chaotic contemplative movement)
kwami.body.startThinking();
kwami.body.blob.thinkingDuration = 10000; // Duration in ms
kwami.body.stopThinking();

// Smooth state transitions
kwami.body.blob.transitionSpeed = 2.0; // Adjust transition speed
```

### Background Management

```typescript
// Set gradient background
kwami.body.setBackgroundGradient("#1a1a2e", "#16213e");

// Set solid color
kwami.body.setBackgroundColor("#000000");

// Set transparent
kwami.body.setBackgroundTransparent();

// Advanced configuration
kwami.body.setBackground({
  type: "gradient",
  color1: "#ff0066",
  color2: "#00ff66",
  opacity: 0.8,
});

// Get current type
const bgType = kwami.body.getBackgroundType(); // 'gradient' | 'solid' | 'transparent'
```

### Audio Effects Configuration

```typescript
// Configure how audio affects the blob
kwami.body.blob.audioEffects = {
  // Frequency to spike modulation (0-1)
  bassSpike: 0.3, // Low frequencies affect spike intensity
  midSpike: 0.4, // Mid frequencies affect spike intensity
  highSpike: 0.2, // High frequencies affect spike intensity

  // Frequency to time modulation (0-2)
  midTime: 0.5, // Mid frequencies affect animation speed
  highTime: 0.8, // High frequencies affect animation speed
  ultraTime: 0.3, // Ultra high frequencies affect animation speed

  // Toggles
  enabled: true, // Master audio reactivity toggle
  timeEnabled: true, // Separate toggle for time modulation
};

// Upload and play custom audio
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  const arrayBuffer = await file.arrayBuffer();
  await kwami.body.audio.loadAudio(arrayBuffer);
  await kwami.body.audio.play();
});

// Access analyser for advanced control
const analyser = kwami.body.audio.getAnalyser();
analyser.fftSize = 2048;
analyser.smoothingTimeConstant = 0.7;
```

### States

Kwami supports multiple states with unique visual behaviors and smooth transitions:

```typescript
// Get current state
const state = kwami.getState(); // 'idle' | 'listening' | 'thinking' | 'speaking'

// Set state
kwami.setState("listening");

// State-specific methods
await kwami.listen(); // Start listening (STT)
kwami.think(); // Thinking state
await kwami.speak("Hello!"); // Speak (TTS)
```

**State Behaviors:**

- **Neutral/Idle**: Gentle breathing animation
- **Listening**: Inward audio-reactive spikes responding to microphone input
- **Thinking**: Chaotic fluid movements simulating contemplation
- **Speaking**: Outward audio-reactive spikes responding to TTS output
- **Interactive**: Liquid-like touch effects on click

All state transitions blend smoothly for natural visual flow.

### Creating Custom Skins

You can create custom shader materials for the blob:

```typescript
import { ShaderMaterial, Color } from "three";

const customSkin = new ShaderMaterial({
  vertexShader: yourVertexShader,
  fragmentShader: yourFragmentShader,
  uniforms: {
    // Your custom uniforms
  },
});

// Apply to blob
kwami.body.blob.getMesh().material = customSkin;
```

## 🎲 Playground Features Overview

The interactive playground includes a comprehensive dual-sidebar interface:

### 💫 Left Sidebar Controls

**About Kwami** - Learn about the project

**Voice Settings**
- ElevenLabs API Key configuration
- Voice ID selection
- Initialize Mind button

**Personality Selection**
- 😊 **Kaya** - Warm, empathetic companion
- 💼 **Nexus** - Professional, knowledgeable assistant
- ✨ **Spark** - Playful, energetic companion

**Background Gradient Controls**
- 🌈 **Color System** - 3 color pickers for tricolor gradients
- 🔎 **Angle Control** - 0-360° gradient direction
- 🔍 **Color Stops** - Position sliders (0-100%) for each color
- 🎲 **Randomize** - Generate random gradient combinations
- 🔄 **Reset** - Restore default gradient

### 💪 Right Sidebar Controls

**Speech Synthesis**
- Text input area for custom speech
- Speak button with blob animation sync

**Body Controls** - Complete blob customization:

**Spikes (Noise Frequency)**
- X, Y, Z sliders (0-20, step 0.1)
- Controls deformation intensity

**Time (Animation Speed)**
- X, Y, Z sliders (0-5, step 0.1)
- Controls animation responsiveness

**Rotation Speed**
- X, Y, Z sliders (0-0.01, step 0.001)
- Creates spinning effects on different axes

**Colors (Poles Skin)**
- X, Y, Z color pickers
- Real-time color updates

**Appearance Settings**
- 📐 **Scale** - Blob size (0.1-3.0)
- 🔍 **Resolution** - Mesh detail (120-220)
- ✨ **Shininess** - Specular intensity (0-100000)
- 📋 **Wireframe** - Toggle wireframe mode
- 🎭 **Skin** - Choose Poles or Vintage skin

**Action Buttons**
- 🎲 **Randomize Blob** - Generate random appearance
- 🔄 **Reset to Defaults** - Restore all settings

## 🎨 Examples

### Basic Setup with HTML

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        margin: 0;
        overflow: hidden;
      }
      canvas {
        width: 100vw;
        height: 100vh;
        display: block;
      }
    </style>
  </head>
  <body>
    <canvas id="kwami-canvas"></canvas>
    <script type="module">
      import { Kwami } from "@kwami/core";

      const canvas = document.getElementById("kwami-canvas");
      const kwami = new Kwami(canvas, {
        body: {
          audioFiles: ["/audio/music.mp3"],
          initialSkin: "Poles", // 3Colors collection (Poles, Donut, Vintage)
        },
      });

      // Play on user interaction
      canvas.addEventListener("click", () => {
        kwami.body.audio.play();
      });

      // Randomize on double click
      canvas.addEventListener("dblclick", () => {
        kwami.body.blob.setRandomBlob();
      });
    </script>
  </body>
</html>
```

### Interactive Controls

```typescript
// Change skin with buttons
document.getElementById("poles-btn")?.addEventListener("click", () => {
  kwami.body.blob.setSkin("Poles");
});

document.getElementById("vintage-btn")?.addEventListener("click", () => {
  kwami.body.blob.setSkin("Vintage");
});

// Random blob button
document.getElementById("random-btn")?.addEventListener("click", () => {
  kwami.body.blob.setRandomBlob();
});

// Color picker
document.getElementById("color-x")?.addEventListener("change", (e) => {
  kwami.body.blob.setColor("x", e.target.value);
});
```

### Audio Reactive Visualization

```typescript
import { Kwami } from "@kwami/core";

const kwami = new Kwami(canvas, {
  body: {
    audioFiles: ["/audio/music.mp3"],
    blob: {
      // Higher spike values = more reactive
      spikes: { x: 0.5, y: 0.5, z: 0.5 },
    },
  },
});

// The blob automatically reacts to audio!
await kwami.body.audio.play();
```

## 🏗️ Architecture

```
@kwami/
├── src/
│   ├── core/           # Core classes
│   │   ├── Kwami.ts    # Main class
│   │   ├── Body.ts     # Body management
│   │   └── Audio.ts    # Audio management
│   ├── blob/           # Blob implementation
│   │   ├── Blob.ts     # Main blob class
│   │   ├── geometry.ts # Geometry creation
│   │   ├── animation.ts# Animation logic
│   │   ├── config.ts   # Default config
│   │   └── skins/      # Shader materials
│   ├── scene/          # THREE.js scene setup
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── assets/             # Audio and textures
└── index.ts            # Main exports
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📄 License

**Dual License** - This library is available under two licenses:

### Non-Commercial / Personal Use

For personal, educational, and non-commercial use, this software is licensed under the **Apache License 2.0**.

You are free to:

- Use, copy, and modify the software
- Distribute the software
- Use it for personal projects and learning

### Commercial / Business Use

For commercial use, including:

- Use in commercial products or services
- Use by for-profit organizations
- Use that generates revenue or commercial advantage

You **MUST obtain a separate commercial license**.

**To obtain a commercial license, contact:**

- Alex Colls: [github.com/alexcolls](https://github.com/alexcolls)

### Disclaimer

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. See the [LICENSE](./LICENSE) file for full terms.

---

**Copyright (c) 2025 Alex Colls**

## 🙏 Credits

Built with:

- [THREE.js](https://threejs.org/) - 3D graphics
- [simplex-noise](https://github.com/jwagner/simplex-noise.js/) - Smooth noise generation
- TypeScript - Type safety

## 🚀 Deployment & Branch Strategy

### Live Deployment

**Kwami Playground is live at [kwami.io](https://kwami.io)** 🌐

The playground is deployed from the `main` branch, which represents production-ready code.

### Git Workflow

We follow a professional branching strategy:

```
feature/*  →  [PR]  →  dev  →  [Review]  →  main  →  Deploy to kwami.io
```

**Branch Protection:**
- 🔒 **main** - Protected production branch
  - Requires PR review before merging
  - Directly deployed to kwami.io
  - Only receives merge commits from `dev`
  - Tagged with version numbers (v2.0.0, etc.)

- 🔧 **dev** - Development integration branch
  - Main branch for feature development
  - **All PRs should target `dev`, not `main`**
  - Testing and review happens here
  - Merged to `main` for releases

- 🌿 **feature/** - Feature branches
  - Create from `dev`
  - PR to `dev` for review
  - Deleted after merge

### Contribution Workflow

1. **Fork and branch** from `dev`
   ```bash
   git checkout -b feature/your-feature origin/dev
   ```

2. **Make changes** and commit with emojis
   ```bash
   git commit -m "✨ feat(blob): add new skin"
   ```

3. **Push to your fork** and create PR to `dev`
   ```bash
   git push origin feature/your-feature
   ```
   - PR title: Clear description
   - PR body: Reference issues, describe changes
   - Target: `dev` branch (not `main`)

4. **Review and merge**
   - Maintainers review your PR
   - Address feedback
   - PR merged to `dev` after approval

5. **Release process**
   - When ready for release, `dev` is merged to `main`
   - Version bumped in package.json
   - CHANGELOG updated
   - Tag created (v2.1.0, etc.)
   - Deployed to kwami.io

**For detailed contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md)**

## 🎮 Interactive Playground

Kwami includes a fully-featured interactive playground deployed at [kwami.io](https://kwami.io):

**To run locally:**

```bash
npm run playground
```

The playground features:

- **🎨 Rotating Sidebar System**: Seamlessly switch between Mind, Body, and Soul configurations
- **🎙️ Natural Voice Conversations (Beta)**: WebSocket-based voice interaction structure
  - **Demo mode available** - test the conversation interface
  - **Full features pending** ElevenLabs Conversational AI beta access
  - **Visual state sync** - blob animation reflects conversation states
- **🤖 Complete Mind Menu**: Most comprehensive ElevenLabs configuration interface available:
  - **50+ configuration options** for AI audio agents
  - **20+ professional voices** plus custom voice support
  - **Voice fine-tuning** with 4 parameters (stability, similarity, style, speaker boost)
  - **7 output formats** (MP3/PCM) with latency optimization
  - **Conversational AI** setup with agent configuration
  - **Speech-to-Text** with 4 model options
  - **Pronunciation dictionary** with IPA phonemes support
  - **4 voice presets** (Natural, Expressive, Stable, Clear)
  - **Import/Export** complete configuration as JSON
  - **Real-time testing** and voice preview
  - **Usage tracking** and API limits display
- **✨ Personality Editor**: Create and customize AI personalities in real-time
- **🎨 Visual Controls**: Fine-tune every aspect of the 3D blob appearance
- **📹 Camera Controls**: Orbit and position camera for perfect viewing angles
- **🌈 Background Manager**: Gradients, solid colors, images (15+ included), or transparent with opacity control
- **🤚 Interactive Touch**: Click the blob for liquid-like touch effects
- **🎤 Listening Mode**: Double-click to toggle microphone listening
- **🧠 Thinking Animation**: Test contemplative movements with configurable duration
- **⚙️ Animation Configuration**: Fine-tune touch strength, duration, transition speed, and more
- **🎵 Audio Player**: Upload and play custom audio files with volume control and time tracking
- **🎛️ Audio Effects**: Configure how audio affects blob animation (frequency bands, time modulation, FFT settings)
- **📥 GLB Export**: Download your blob as a 3D model with materials and animation
- **💡 Dynamic Lighting**: Adjust scene lighting intensity in real-time
- **💬 Unified Messages**: Status and error messages appear below the blob in modern glassmorphism style
- **🎲 Randomization**: Generate creative variations instantly

See the [Playground README](./playground/README.md) for detailed documentation.

## 🔮 Roadmap

- [x] AI Mind integration (ElevenLabs TTS)
- [x] **Complete Mind menu** with comprehensive ElevenLabs configuration (50+ options)
- [x] **Agent Management API** - Create, manage, and test conversational AI agents programmatically
- [x] AI Soul (personality system)
- [x] Text-to-Speech integration
- [x] Voice selection (20+ voices) and custom voice support
- [x] Voice fine-tuning (stability, similarity, style, speaker boost)
- [x] Advanced TTS options (output formats, latency optimization)
- [x] Voice presets and configuration import/export
- [x] MediaStream audio support
- [x] Interactive playground with UI controls
- [x] Background management system (gradients, colors, images)
- [x] Interactive touch animations with liquid physics
- [x] Multiple animation states (listening, thinking, speaking)
- [x] Smooth state transitions
- [x] GLB export functionality
- [x] Dynamic lighting controls
- [x] Configurable animation parameters
- [ ] Speech-to-Text integration
- [ ] Conversational AI (full voice agent)
- [ ] More built-in skins and texture support
- [ ] Animation presets and sequences
- [ ] WebXR/VR support
- [ ] Mobile touch optimizations
- [ ] React/Vue/Svelte wrappers
- [ ] Emotion-based animation mapping

## 📧 Support

For questions and support, please open an issue on GitHub.

---

Made with ❤️ by the Quami team
