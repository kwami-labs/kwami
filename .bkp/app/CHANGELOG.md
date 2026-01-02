# KWAMI App Changelog

All notable changes to the KWAMI App will be documented in this file.

## [1.5.8] - 2025-11-22

### 🐳 Docker Support

#### Added
- **docker/** directory with 3 Dockerfile variants:
  - `Dockerfile` - Node.js 20 Alpine (default, production-ready)
  - `Dockerfile.bun` - Bun runtime (v1.0+ Alpine)
  - `Dockerfile.deno` - Deno runtime (v2.1.4 Alpine)
- Multi-stage builds for optimized production images
- Native module support (sharp, cairo, jpeg, pango)
- Runtime compatibility layers for Bun/Deno
- Environment configuration (NODE_ENV, HOST, PORT)
- Production-ready deployment on port 3000

## [Unreleased]

### Added
- Nuxt 3 application structure
- Vue 3 components for KWAMI visualization
- Pinia stores for state management
- i18n support with multiple locales
- Authentication middleware
- Canvas rendering components
- Common UI components
- Quami-specific components

### Features
- Real-time KWAMI visualization
- Multi-language support
- User authentication
- Responsive design with Tailwind CSS
- TypeScript support throughout

## Version History

For the complete KWAMI project version history, see the [main CHANGELOG](../CHANGELOG.md).

