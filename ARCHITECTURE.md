# @kwami Architecture

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────┐
│                         KWAMI                           │
│  (Main orchestration class)                             │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │    BODY      │  │    MIND      │  │    SOUL      │   │
│  │  (Visual)    │  │  (AI/Voice)  │  │ (Personality)│   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│         │                  │                  │         │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          ▼                  ▼                  ▼
    [IMPLEMENTED]      [IMPLEMENTED]      [IMPLEMENTED]
```

## 📦 Component Structure

### 1. Core Layer (`src/core/`)

```
┌─────────────────────────────────────────────┐
│              Core Classes                   │
├─────────────────────────────────────────────┤
│                                             │
│  ┌────────────────────────────────────┐     │
│  │          Kwami.ts                  │     │
│  │  Main orchestration class          │     │
│  │  - Manages Body, Mind, Soul        │     │
│  │  - State management                │     │
│  │  - High-level API                  │     │
│  └────────┬───────────────────────────┘     │
│           │                                 │
│     ┌─────┴──────┬──────────┐               │
│     │            │          │               │
│  ┌──▼──────┐  ┌──▼────┐  ┌──▼────┐          │
│  │Body.ts  │  │Mind.ts│  │Soul.ts│          │
│  │-3D Scene│  │-TTS   │  │-Person│          │
│  │-Renderer│  │-Voice │  │-Traits│          │
│  │-Camera  │  │-Model │  │-Prompt│          │
│  │-Blob    │  │-Config│  │-Style │          │
│  └──┬──────┘  └───────┘  └───────┘          │
│     │                                       │
│  ┌──▼────────┐                              │
│  │ Audio.ts  │                              │
│  │ -Playback │                              │
│  │ -Analysis │                              │
│  │ -Freq Data│                              │
│  │ -Volume   │                              │
│  │ -Stream   │                              │
│  └───────────┘                              │
│                                             │
└─────────────────────────────────────────────┘
```

### 2. Blob Layer (`src/blob/`)

```
┌───────────────────────────────────────────┐
│              Blob System                  │
├───────────────────────────────────────────┤
│                                           │
│  ┌────────────────────────────────────┐   │
│  │          Blob.ts                   │   │
│  │  Main blob implementation          │   │
│  │  - Mesh management                 │   │
│  │  - Animation control               │   │
│  │  - Skin switching                  │   │
│  │  - Customization API               │   │
│  └───────┬──────────────┬─────────────┘   │
│          │              │                 │
│     ┌────▼────┐    ┌────▼────┐            │
│     │geometry │    │animation│            │
│     │.ts      │    │.ts      │            │
│     └─────────┘    └─────────┘            │
│          │              │                 │
│     ┌────▼──────────────▼─────┐           │
│     │      skins/             │           │
│     │  ┌──────────┐           │           │
│     │  │tricolor/ │           │           │
│     │  │- vertex  │           │           │
│     │  │- fragment│           │           │
│     │  │- index   │           │           │
│     │  └──────────┘           │           │
│     │  ┌──────────┐           │           │
│     │  │ zebra/   │           │           │
│     │  │- vertex  │           │           │
│     │  │- fragment│           │           │
│     │  │- index   │           │           │
│     │  └──────────┘           │           │
│     └─────────────────────────┘           │
│                                           │
└───────────────────────────────────────────┘
```

### 3. Scene Layer (`src/scene/`)

```
┌───────────────────────────────────────────┐
│           Scene Management                │
├───────────────────────────────────────────┤
│                                           │
│  ┌────────────────────────────────────┐   │
│  │        setup.ts                    │   │
│  │  - Renderer creation               │   │
│  │  - Camera setup                    │   │
│  │  - Lighting configuration          │   │
│  │  - OrbitControls (optional)        │   │
│  └────────────────────────────────────┘   │
│                                           │
└───────────────────────────────────────────┘
```

### 4. Mind & Soul Layer (`src/core/`)

```
┌───────────────────────────────────────────┐
│           AI Components                   │
├───────────────────────────────────────────┤
│                                           │
│  ┌────────────────────────────────────┐   │
│  │          Mind.ts                   │   │
│  │  ElevenLabs voice synthesis        │   │
│  │  - Text-to-Speech                  │   │
│  │  - Voice configuration             │   │
│  │  - Model selection                 │   │
│  │  - Audio streaming                 │   │
│  │  - Microphone access               │   │
│  └────────────────────────────────────┘   │
│                                           │
│  ┌────────────────────────────────────┐   │
│  │          Soul.ts                   │   │
│  │  Personality management            │   │
│  │  - Traits definition               │   │
│  │  - System prompt generation        │   │
│  │  - Personality templates           │   │
│  │  - Emotional tone control          │   │
│  │  - Conversation style              │   │
│  └────────────────────────────────────┘   │
│                                           │
└───────────────────────────────────────────┘
```

### 5. Types Layer (`src/types/`)

```
┌──────────────────────────────────────────────┐
│         TypeScript Definitions               │
├──────────────────────────────────────────────┤
│                                              │
│  - KwamiConfig                               │
│  - KwamiState                                │
│  - BodyConfig                                │
│  - MindConfig                                │
│  - SoulConfig                                │
│  - VoiceSettings                             │
│  - AudioConfig                               │
│  - SceneConfig                               │
│  - BlobConfig                                │
│  - BlobSkinType                              │
│  - SkinConfigs (Tricolor, Zebra)             │
│  - Event types                               │
│                                              │
└──────────────────────────────────────────────┘
```

### 6. Utils Layer (`src/utils/`)

```
┌──────────────────────────────────────────────┐
│           Utility Functions                  │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────┐  ┌────────────┐              │
│  │ randoms.ts │  │recorder.ts │              │
│  │- UUID      │  │- Speech    │              │
│  │- Numbers   │  │  synthesis │              │
│  │- Colors    │  │- Recording │              │
│  │- Boolean   │  │            │              │
│  │- DNA       │  │            │              │
│  └────────────┘  └────────────┘              │
│                                              │
└──────────────────────────────────────────────┘
```

## 🔄 Data Flow

### Audio Visualization Flow

```
┌─────────────┐
│ Audio File  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  HTMLAudio      │
│  Element        │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Web Audio      │
│  Context        │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  AnalyserNode   │
│  (Freq Data)    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Animation      │
│  Function       │
│  - Vertex       │
│    modification │
│  - Simplex      │
│    noise        │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Blob Mesh      │
│  (Visual Output)│
└─────────────────┘
```

### Initialization Flow

```
1. User creates Kwami instance
   └── new Kwami(canvas, config)
       │
       ├── 2. Initialize KwamiBody
       │   ├── Create scene, renderer, camera
       │   ├── Initialize KwamiAudio
       │   └── Create Blob
       │       ├── Create geometry
       │       ├── Create materials (skins)
       │       └── Start animation loop
       │
       ├── 3. Initialize KwamiMind
       │   ├── Set ElevenLabs API key
       │   ├── Configure voice settings
       │   └── Setup audio streaming
       │
       └── 4. Initialize KwamiSoul
           ├── Load personality config
           ├── Set traits and tone
           └── Generate system prompt
```

### Animation Loop

```
┌─────────────────────────────────────────┐
│      requestAnimationFrame              │
└────────────┬────────────────────────────┘
             │
     ┌───────▼───────┐
     │ Get frequency │
     │ data from     │
     │ audio analyser│
     └───────┬───────┘
             │
     ┌───────▼────────┐
     │ Calculate noise│
     │ for each vertex│
     └───────┬────────┘
             │
     ┌───────▼────────┐
     │ Apply scale    │
     │ based on audio │
     └───────┬────────┘
             │
     ┌───────▼────────┐
     │ Update mesh    │
     │ geometry       │
     └───────┬────────┘
             │
     ┌───────▼────────┐
     │ Apply rotation │
     └───────┬────────┘
             │
     ┌───────▼────────┐
     │ Render scene   │
     └───────┬────────┘
             │
             └──► Loop back
```

## 🎯 Design Principles

### 1. Single Responsibility

Each class has one clear purpose:

- `Kwami`: Orchestration and state management
- `KwamiBody`: Visual management and 3D rendering
- `KwamiMind`: AI voice synthesis and interaction
- `KwamiSoul`: Personality and behavior definition
- `KwamiAudio`: Audio playback, analysis, and streaming
- `Blob`: 3D mesh representation and animation

### 2. Separation of Concerns

```
Presentation Layer  → Kwami (API)
Business Logic      → Body, Audio, Blob
Data/Configuration  → Types, Config
Utilities           → Utils
```

### 3. Dependency Injection

```typescript
// Dependencies injected through constructor
const blob = new Blob({
  scene,
  camera,
  renderer,
  audio,
  // ...config
});
```

### 4. Composition over Inheritance

```
Kwami
 ├─ has-a Body
 │   ├─ has-a Audio
 │   └─ has-a Blob
 ├─ has-a Mind
 └─ has-a Soul
```

## 🔌 Extension Points

### Adding New Skins

1. Create shader files in `src/blob/skins/newskin/`
2. Create index.ts with material factory
3. Update `src/blob/skins/index.ts`
4. Add type to `BlobSkinType`

### Extending AI Capabilities

1. Add new methods to `src/core/Mind.ts`
2. Extend personality templates in `assets/personalities/`
3. Add new voice models or settings
4. Create custom conversation flows

### Adding New Animations

1. Create animation function in `src/blob/`
2. Add to Blob class
3. Expose through API

## 📊 Module Dependencies

```
index.ts
  ├─→ core/Kwami.ts
  │     ├─→ core/Body.ts
  │     │     ├─→ core/Audio.ts
  │     │     ├─→ blob/Blob.ts
  │     │     │     ├─→ blob/geometry.ts
  │     │     │     ├─→ blob/animation.ts
  │     │     │     └─→ blob/skins/
  │     │     └─→ scene/setup.ts
  │     ├─→ core/Mind.ts
  │     │     └─→ @elevenlabs/elevenlabs-js
  │     ├─→ core/Soul.ts
  │     └─→ types/
  ├─→ utils/randoms.ts
  └─→ utils/recorder.ts
```

## 🎨 Visual Hierarchy

```
┌──────────────────────────────────────┐
│           User Code                  │
└───────────────┬──────────────────────┘
                │
┌───────────────▼──────────────────────┐
│         @kwami/core API              │
│  (Kwami, KwamiBody, KwamiAudio)      │
└───────────────┬──────────────────────┘
                │
┌───────────────▼──────────────────────┐
│      Internal Components             │
│  (Blob, Scene Setup, Skins)          │
└───────────────┬──────────────────────┘
                │
┌───────────────▼──────────────────────┐
│      THREE.js & Web APIs             │
│  (WebGL, Web Audio API)              │
└──────────────────────────────────────┘
```

## 🎮 Playground Architecture

The interactive playground (`/playground`) demonstrates Kwami's capabilities with a sophisticated UI system:

### Rotating Sidebar System

The playground implements a **3-section, 2-sidebar rotating interface** that allows access to all configuration areas without cluttering the UI:

```
┌─────────────────────────────────────────────┐
│  Sidebar State Management                   │
├─────────────────────────────────────────────┤
│  • Three Sections: Mind, Body, Soul         │
│  • Two Visible Sidebars: Left & Right       │
│  • One Hidden Section (rotates)             │
│  • Swap Buttons: Toggle sections            │
└─────────────────────────────────────────────┘
```

**Component Structure:**

```
playground/
├── index.html
│   ├── <template id="mind-template">    # Mind configuration UI
│   ├── <template id="body-template">    # Body configuration UI
│   └── <template id="soul-template">    # Soul configuration UI
│
├── main.js
│   ├── sidebarState                     # Tracks current layout
│   ├── initializeSidebars()            # Initial render
│   ├── renderSidebar(side, section)    # Dynamic content injection
│   ├── swapLeftSidebar()               # Rotate left sidebar
│   ├── swapRightSidebar()              # Rotate right sidebar
│   └── updateSwapButtons()             # Update button labels
│
└── styles.css
    ├── .swap-button                     # Button styling
    └── .sidebar-content                 # Fade-in animations
```

**State Flow:**

```
Initial:  Mind (L) | Body (R) | Soul (H)
          ↓ Click Left Swap Button
Step 1:   Soul (L) | Body (R) | Mind (H)
          ↓ Click Right Swap Button
Step 2:   Soul (L) | Mind (R) | Body (H)
          ↓ Click Left Swap Button
Step 3:   Body (L) | Mind (R) | Soul (H)
```

### Section Responsibilities

#### 🤖 Mind Section

- **Purpose**: AI Agent configuration
- **Components**:
  - ElevenLabs API integration
  - Voice settings and initialization
  - Test speech interface
  - State indicator (IDLE, SPEAKING, etc.)
- **Data Flow**: `Mind.ts` ← → ElevenLabs API

#### 🎨 Body Section

- **Purpose**: Visual configuration
- **Components**:
  - Background controls (gradient/solid/transparent)
  - Blob parameters (spikes, time, rotation)
  - Camera position controls
  - Appearance settings (scale, colors, skins)
  - Quick actions (randomize, reset)
- **Data Flow**: UI Controls → `Body.ts` → `Blob.ts` → Three.js Scene

#### ✨ Soul Section

- **Purpose**: Personality configuration
- **Components**:
  - Name and identity settings
  - Personality description
  - System prompt customization
  - Response preferences (length, tone)
  - Preset personality loader
- **Data Flow**: UI Inputs → `Soul.ts` Config → AI Behavior

### Dynamic Content Management

The playground uses HTML `<template>` elements for efficient section management:

1. **Templates**: Each section is defined once in a `<template>` tag
2. **Cloning**: When needed, template content is cloned (not moved)
3. **Injection**: Cloned content is injected into sidebar containers
4. **Re-initialization**: Event listeners are re-bound after injection
5. **State Preservation**: Kwami state persists across sidebar swaps

**Benefits:**

- **Memory Efficient**: Content is cloned, not duplicated
- **No State Loss**: Kwami instance remains intact during swaps
- **Smooth UX**: Animated transitions between sections
- **Maintainable**: Each section's HTML is defined once
- **Extensible**: Easy to add new sections

---
