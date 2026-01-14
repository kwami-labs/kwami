# Playground Changelog

All notable changes to the KWAMI Playground will be documented in this file.

## [1.5.8] - 2025-11-22

### 🐳 Docker Support

#### Added
- **docker/** directory with 3 Dockerfile variants:
  - `Dockerfile` - Vite build + nginx 1.27 Alpine (default)
  - `Dockerfile.bun` - Bun build + nginx serving
  - `Dockerfile.deno` - Deno build + nginx serving
- Multi-stage builds (build → nginx serve)
- Static file optimization for production
- Support for custom nginx configurations
- Production-ready deployment on port 80

#### Fixed
- Root `Dockerfile` build path: `/app/playground/dist` → `/app/pg/dist`
- Aligns with monorepo structure after playground → pg rename

## [Unreleased]

### Added
- Interactive 3D blob visualization with audio reactivity
- ElevenLabs TTS integration for voice synthesis
- Rotating sidebar system (Mind/Body/Soul)
- Custom audio file upload support
- Multiple background types (gradient, solid, transparent)
- Preset personalities (Kaya, Nexus, Spark)
- Camera and lighting controls
- Export to GLB functionality
- Touch interaction effects
- Real-time state management (IDLE, SPEAKING, etc.)

### Features
- Audio-reactive blob animation
- Customizable appearance (colors, spikes, scale)
- Personality configuration system
- Audio effects control (FFT, smoothing, frequency modulation)
- Background image support (15+ included images)
- Wireframe mode toggle
- Tricolor skin subtypes (Poles, Donut, Vintage)

## Version History

For the complete KWAMI project version history, see the [main CHANGELOG](../CHANGELOG.md).

