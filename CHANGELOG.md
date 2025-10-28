# Changelog

All notable changes to the @kwami/core library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### ✨ Added

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
- **Enhanced Body Controls** - Updated scale ranges (3-8) and spike parameters (0-20)
- **Real-time Camera Tracking** - UI reflects both manual slider changes and OrbitControls interactions

#### Documentation

- Updated **playground README** with comprehensive rotating sidebar documentation
- Added **Playground Architecture** section to main ARCHITECTURE.md
- Enhanced main **README** with playground features showcase
- Updated tips section with new UI interaction guidance

### 🔄 Changed

#### Playground Layout

- **Before**: Static dual-sidebar layout (Left: AI Agent, Right: Body)
- **After**: Dynamic rotating system (Mind, Body, Soul across two sidebars)
- Reorganized controls to align with Kwami's core concepts (Mind/Body/Soul)
- Improved visual hierarchy with section-specific icons and colors

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
