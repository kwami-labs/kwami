# Changelog

All notable changes to the @kwami/core library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### ✨ Added

#### Interactive Animations & State Management

- **Click Interaction** - Natural liquid-like touch effects when clicking the blob:
  - Inward push simulation with smooth falloff
  - Ripple wave effects for realistic fluid dynamics
  - Configurable touch strength, duration, and max touch points
  - Natural ease-in and ease-out transitions
  - Multiple simultaneous touch points support
- **Thinking Animation** - Chaotic contemplative movement when processing:
  - Multi-layer noise for organic, fluid motion
  - Pulsing effect with smooth intensity transitions
  - Configurable thinking duration (default 10 seconds)
  - Automatic fade-in and fade-out transitions
- **Listening State** - Microphone-responsive animation with audio-reactive movements:
  - Double-click blob to start/stop listening
  - Inward spikes responsive to audio input
  - Opposite animation style from speaking state
- **Smooth State Transitions** - Fluid blending between animation states:
  - Seamless transitions between neutral, listening, thinking, and speaking
  - Configurable transition speed
  - Natural interpolation prevents abrupt visual changes
  - State-aware animation blending
- **State Indicators** - Visual feedback in UI for current blob state
- **Test Thinking Button** - Trigger thinking animation manually for testing

#### Playground UI Enhancement

- **Rotating Sidebar System** - Innovative 3-section, 2-sidebar interface for accessing Mind, Body, and Soul configurations
- **Swap Buttons** - Easily toggle between configuration sections without UI clutter
- **Soul Configuration UI** - Dedicated interface for personality customization:
  - Name and personality description
  - System prompt editor
  - Response length and emotional tone settings
  - Preset personality quick-access buttons
- **Template-based Architecture** - Efficient HTML template system for dynamic content management
- **Smooth Transitions** - Fade-in animations when switching between sections
- **State Preservation** - Kwami state persists correctly across sidebar swaps
- **Camera Position Controls** - X, Y, Z sliders for orbiting around the blob
- **Background Opacity** - Transparency control for canvas backgrounds
- **Background Image Support** - Load custom background images from assets (15+ included)
- **Enhanced Body Controls** - Updated scale ranges (3-8) and spike parameters (0-20)
- **Real-time Camera Tracking** - UI reflects both manual slider changes and OrbitControls interactions
- **Animation Configuration Controls** - Fine-tune all animation parameters:
  - Touch Strength (0-1)
  - Touch Duration (500-3000ms)
  - Max Touch Points (1-10)
  - Transition Speed (0.5-5)
  - Thinking Duration (5-30 seconds)
- **Audio Player UI** - Integrated audio player with full controls:
  - File upload support for custom audio tracks
  - Play/pause button with state indication
  - Volume slider with visual feedback (🔊/🔉/🔇)
  - Time display (current / total duration)
  - Audio metadata display (filename)
- **Audio Effects Configuration** - Comprehensive audio reactivity controls:
  - Frequency → Spike modulation (Bass, Mid, High)
  - Frequency → Time modulation (Mid, High, Ultra)
  - FFT size selector (512/1024/2048/4096)
  - Smoothing time constant slider
  - Audio reactivity toggle
  - Separate spike and time effect toggles
- **Unified Messages Area** - All status, error, and info messages below blob:
  - Modern glassmorphism design
  - Auto-dismiss functionality (5s status, 8s errors)
  - Color-coded message types (blue info, red error, green success, orange warning)
  - Smooth fade-in/slide-up animations
  - Non-intrusive positioning
- **GLB Export** - Download the blob as a 3D GLB file with animation and materials
- **Dynamic Lighting Controls** - Adjust light intensity in real-time
- **Tricolor2 Skin** - New donut-like appearance option
- **Test Buttons** - Quick testing for listening and thinking modes

#### Core Library Features

- **Blob Interaction API**:
  - `enableBlobInteraction()` - Enable click/touch interaction
  - `disableBlobInteraction()` - Disable interaction
  - `startListening()` - Start microphone listening with visual feedback
  - `stopListening()` - Stop listening mode
  - `isListening()` - Check listening state
  - `startThinking()` - Trigger thinking animation
  - `stopThinking()` - End thinking animation
  - `isThinking()` - Check thinking state
- **Background Management API**:
  - `setBackground(config)` - Set gradient, solid color, or transparent background
  - `setBackgroundColor(color)` - Quick solid color setter
  - `setBackgroundGradient(color1, color2)` - Quick gradient setter
  - `setBackgroundTransparent()` - Quick transparent setter
  - `getBackgroundType()` - Get current background type
- **Audio Effects API**:
  - `blob.audioEffects` - Configurable audio reactivity parameters
  - `bassSpike`, `midSpike`, `highSpike` - Frequency to spike modulation
  - `midTime`, `highTime`, `ultraTime` - Frequency to time modulation
  - `enabled` - Master toggle for audio reactivity
  - `timeEnabled` - Separate toggle for time modulation
- **Audio Management API**:
  - `loadAudio(arrayBuffer)` - Load audio from uploaded files
  - `getAudioElement()` - Access HTML audio element
  - `getAnalyser()` - Access Web Audio API analyser node
- **Scene Access** - `getScene()` method for direct Three.js scene manipulation
- **Dynamic Lighting** - `setLightIntensity()` method for runtime light control

#### Documentation

- Updated **playground README** with comprehensive rotating sidebar documentation
- Added **Playground Architecture** section to main ARCHITECTURE.md
- Enhanced main **README** with playground features showcase
- Updated tips section with new UI interaction guidance
- Documented all new interactive features and animation systems

### 🔄 Changed

#### Playground Layout

- **Before**: Static dual-sidebar layout (Left: AI Agent, Right: Body)
- **After**: Dynamic rotating system (Mind, Body, Soul across two sidebars)
- Reorganized controls to align with Kwami's core concepts (Mind/Body/Soul)
- Improved visual hierarchy with section-specific icons and colors
- Renamed "Export Scene" button to "Download GLB" for clarity
- **Messages relocated** from sidebars to below blob for better UX
- **Audio player** integrated at top of canvas for easy access
- Reorganized body template into logical sections:
  - 🫧 Blob Configuration
  - 🎵 Audio Effects
  - 👆 Interaction
  - ⚡ Actions

#### Animation System

- **Before**: Single animation state with speaking-only audio reactivity
- **After**: Multiple animation states with smooth transitions:
  - Neutral (idle breathing)
  - Listening (inward audio-reactive spikes)
  - Thinking (chaotic fluid movements)
  - Speaking (outward audio-reactive spikes)
  - Interactive (click/touch response)
- Improved animation easing curves for more natural motion
- Reduced breathing intensity for subtler idle state
- Enhanced noise layering for more organic movements

#### Blob Configuration

- Default shininess reduced to 50 for more matte appearance
- Click interaction enabled by default in playground
- Lights disabled in shader materials for consistent appearance
- Improved color management across all skin types

### 🐛 Bug Fixes

- Fixed GLTFExporter module resolution by switching to esm.sh CDN
- Fixed blob collapse issue from multiple rapid clicks by clamping total displacement
- Fixed spiky artifacts in click animation by ensuring inward-only displacement
- Fixed abrupt state transitions by implementing smooth blending system
- Fixed thinking animation being too spiky by reducing noise frequencies
- Fixed click animation recovery being too slow by adjusting duration and easing
- Fixed color updates not applying to all skins
- Fixed audio effects controls not updating blob properties (wiring issue)
- Fixed animation geometry collapse from audio by removing overall scale changes
- Fixed breathing effect causing blob size changes
- Improved material disposal and memory management

### 🔧 Technical Improvements

#### Animation Engine

- Multi-layer Perlin noise for natural fluid dynamics
- Configurable easing functions (quadratic, cubic, smoothstep)
- Touch point management with decay and influence radius
- State transition blending with configurable speed
- Clamped displacement to prevent visual artifacts
- Optimized animation loop with proper state tracking

#### Code Quality

- Exposed animation configuration parameters as public properties
- Improved type safety for animation states
- Better encapsulation of interaction logic
- Enhanced raycasting for click detection
- Proper cleanup of event listeners and resources

#### Audio System

- Configurable audio reactivity with separate spike and time modulation
- ArrayBuffer support for uploaded audio files
- Exposed analyser node for advanced control
- FFT size and smoothing configurable at runtime
- Audio effects apply immediately without reinitialization

#### UI/UX

- Unified message system with auto-dismiss
- Glassmorphism design language throughout
- Smooth animations for all state changes
- Non-blocking pointer-events for overlays
- Color-coded feedback for different message types

## [2.0.0] - 2025-10-20

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
- **Multiple skin support** (Tricolor and Zebra)
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

### 🔄 Migration Guide from 1.x to 2.0

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

## [1.0.0] - Previous Version

Initial release with basic functionality:

- Basic blob visualization
- Audio playback
- Multiple body types (Blob, Metamask)
- Basic skin support
- Scene rendering

---

**Note**: Version 2.0.0 is a complete rewrite focused on making @kwami a professional, reusable library. While there are breaking changes, the new architecture provides a much better foundation for future development and third-party integration.
