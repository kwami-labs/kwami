# KWAMI Ecosystem Changelog

All notable changes to the KWAMI ecosystem will be documented in this file.

For detailed core library changes, see [kwami/CHANGELOG.md](./kwami/CHANGELOG.md).

## [1.5.10] - 2025-12-09

### 🔒 Security

#### Fixed
- **Malware Flag**: Bumped version to resolve npm audit malware warning for `kwami` package
- **Dependencies**: Updated internal dependencies to use new version

## [1.5.9] - 2025-11-22

### 🎯 Action System - Major Feature Addition

#### Added
- **Professional Action System**: Comprehensive action management system integrated into Soul component
  - **ActionManager**: Core action registration, execution, and management
  - **MCP-Compatible**: Model Context Protocol support for AI agent integration
  - **Multiple Trigger Types**: Context menu, keyboard shortcuts, voice commands, API calls, time-based, event-driven
  - **Configuration Support**: Load actions from JSON/YAML files, URLs, or inline strings
  - **Hot-Reload**: Dynamic action updates without restart
  - **Type-Safe**: Full TypeScript support with comprehensive type definitions
  - **Action Categories**: body, mind, soul, integration, system
  - **Execution History**: Track and query action execution history
  - **Statistics**: Action usage statistics and analytics

- **Context Menu UI**: Beautiful glassmorphic right-click context menu
  - Grouped actions by category
  - Icon support for visual identification
  - Smart positioning (avoids screen edges)
  - Smooth animations and hover effects
  - Branded footer with "✨ Kwami Actions"
  - Enable/disable via API

- **Built-in Actions**: Pre-configured actions out-of-the-box
  - `change-blob-opacity` - Adjust blob transparency
  - `randomize-blob` - Randomize blob appearance
  - `randomize-background` - Randomize background gradient
  - `change-blob-scale` - Adjust blob size

- **Action Examples**: Example configurations for future integrations
  - Instagram post action (YAML)
  - WhatsApp reply action (YAML)
  - Basic actions collection (JSON)

- **Documentation**: Comprehensive action system documentation
  - `ACTION_SYSTEM_IMPLEMENTATION.md` - Complete implementation guide
  - `ARCHITECTURE.md` - System architecture documentation
  - `QUICK_START.md` - Quick start guide
  - `README.md` - Action system overview

### 🎥 YouTube Integration

#### Added
- **YouTube Connector**: Secure YouTube integration for Kwami
  - OAuth 2.0 authentication with Google
  - Access authenticated user's videos and playlists
  - Public video search (no authentication required)
  - Video embedding with customizable options
  - Full TypeScript support
  - Located in `kwami/src/apps/youtube/`

- **YouTube Helper Utilities**: Core utilities for YouTube URL handling
  - Extract video ID from various YouTube URL formats
  - Convert URLs to embed URLs with options (autoplay, loop, controls, etc.)
  - YouTube URL detection and validation
  - Create YouTube iframe elements programmatically
  - Located in `kwami/src/core/utils/YouTubeHelper.ts`

- **Body Component YouTube Support**: Native YouTube video background support
  - Set YouTube videos as background using iframe
  - Automatic URL detection and conversion
  - Proper cleanup and disposal
  - Integration with existing media state management

### 🛠️ Core Library Enhancements

#### Added
- **Logger Utility**: Configurable logging system
  - Log levels: NOLOGS, ERROR, WARNING, INFO
  - Singleton pattern for global access
  - Exported from core library: `logger`, `LogLevel`
  - Located in `kwami/src/utils/logger.ts`

- **App Connectors Module**: New module for external service integrations
  - YouTube connector exported from main index
  - Extensible architecture for future connectors
  - Located in `kwami/src/apps/`

#### Enhanced
- **Body Component**: Major enhancements
  - Context menu integration for action system
  - YouTube iframe background support
  - Improved media state management
  - Better error handling with logger

- **Soul Component**: Action system integration
  - ActionManager instance available via `kwami.soul.actions`
  - Connects Mind (AI) and Body (visual) through actions
  - Action execution context and validation

- **Mind Component**: API improvements
  - Enhanced KnowledgeBaseAPI
  - Improved ToolsAPI
  - Better provider integration (ElevenLabs, OpenAI)

- **Skills System**: Integration with action system
  - Skills and actions work together seamlessly
  - Clear separation of concerns

### 🌐 Web App Improvements

#### Added
- **Theme Mode Manager**: Centralized theme management
  - Dark/light mode toggle
  - Persistent theme preference (localStorage)
  - System preference detection
  - Theme toggle button component
  - Singleton pattern for global state
  - Located in `web/src/managers/ThemeModeManager.ts`

- **Background Rings Component**: New visual component
  - Located in `web/src/components/BackgroundRings.ts`

- **Page Audio Manager**: Enhanced audio management
  - Located in `web/src/media/PageAudioManager.ts`

#### Enhanced
- **WelcomeLayer**: Improved user experience
  - Theme toggle integration
  - Better hard reload detection
  - Improved preference management
  - Enhanced styling and animations

- **Configuration Organization**: Better file structure
  - Moved `kwamis.json` to `web/src/config/`
  - Moved `media-links.json` to `web/src/config/`
  - Cleaner project organization

- **Video Player**: Enhanced functionality
  - Better YouTube integration
  - Improved error handling

- **Scroll Manager**: Enhanced navigation
  - Better scroll behavior
  - Improved performance

- **Styling**: Major CSS improvements
  - Enhanced welcome layer styles
  - Better theme support
  - Improved responsive design
  - Glassmorphic effects

#### Changed
- **Service Worker**: Updated for better caching
- **i18n**: Added new translations
- **Constants**: Updated configuration values

#### Removed
- Old test audio file: `web/public/voices/test.mp3`
- Moved configuration files to proper locations

### 📚 Documentation & Build

#### Added
- **YouTube Connector Documentation**: Complete README with examples
- **Action System Documentation**: Comprehensive guides and examples
- **Architecture Documentation**: System design and patterns

#### Enhanced
- **Package Scripts**: Improved docs workspace commands
  - Updated docs scripts to use workspace flag
  - Better build and preview commands

### 🔧 Technical Improvements

#### Enhanced
- **Type Exports**: Better TypeScript support
  - Action types exported from main index
  - Logger types exported
  - App connector types exported

- **Error Handling**: Improved error management
  - Logger integration throughout core
  - Better error messages
  - Graceful degradation

- **Code Organization**: Better structure
  - Separated concerns (actions, connectors, utilities)
  - Clear module boundaries
  - Improved maintainability

### 📊 Statistics

- **35 files changed**: 2,267 insertions(+), 1,309 deletions(-)
- **New files**: 15+ new files across core and web
- **Major features**: Action system, YouTube integration, Theme manager
- **Documentation**: 4+ new documentation files

## [1.5.8] - 2025-11-22

### 🐳 Docker Infrastructure

#### Added
- **Multi-Runtime Docker Support**: Comprehensive Docker infrastructure for entire ecosystem
  - Created `docker/` directory in all 6 projects (app, dao, web, market, candy, pg)
  - **Dockerfile** - Default Node.js 20 Alpine builds (production-ready)
  - **Dockerfile.bun** - Bun runtime builds (v1.0+ Alpine)
  - **Dockerfile.deno** - Deno runtime builds (v2.1.4 Alpine)
  - Total: 18 optimized Dockerfiles across ecosystem

#### Enhanced
- **Nuxt Applications** (app, dao, market, candy):
  - Multi-stage builds with optimized production images
  - Native module support (python3, make, g++)
  - Special handling for sharp image processing library
  - Runtime compatibility layers for Bun/Deno
  - Builds to `.output/server/index.mjs`
  - Production port: 3000

- **Vite Applications** (web, pg):
  - Static builds with nginx 1.27 Alpine serving
  - Optimized for high-performance delivery
  - Support for custom nginx configurations
  - Builds to `dist/` directory
  - Production port: 80

#### Fixed
- **Playground Dockerfile**: Corrected build output path
  - Changed: `/app/playground/dist` → `/app/pg/dist`
  - Aligns with monorepo structure after playground → pg rename

#### Benefits
- 🚀 Choose optimal runtime for your deployment (Node/Bun/Deno)
- 📦 Minimal Alpine Linux images for smaller footprints
- 🔒 Multi-stage builds for secure production deployments
- ⚡ Faster builds with cached dependency layers
- 🌐 Production-ready nginx configuration for static sites
- 🎯 Consistent deployment across all ecosystem projects

## [1.5.7] - 2025-11-22

### 🔧 Version Management

#### Enhanced
- **sync-version script**: Major improvements for complete ecosystem synchronization
  - Now scans all `.md`, `.ts`, `.js` files recursively
  - Automatically syncs all workspace `package.json` files to match root version
  - Replaces old versions (1.4.0-1.5.6) with current version across entire codebase
  - Added version field to market/package.json where missing
  - Fixed ECOSYSTEM.md version references
  - All ecosystem apps now maintain synchronized versioning
  - Better reporting with file-by-file status updates

#### Changed
- **Documentation**: Updated all CHANGELOG entries for versions 1.5.3-1.5.6
- **Paths**: Fixed core library paths in documentation (src/core → kwami/src/core)
- **Consistency**: Updated PROJECT_SUMMARY.md and ECOSYSTEM.md paths
- **Monorepo**: Ensured consistency after monorepo restructure

## [1.5.6] - 2025-11-22

### 🚀 Publishing & CI/CD

#### Changed
- **GitHub Actions**: Fixed npm publish with OIDC Trusted Publishers
  - Removed NODE_AUTH_TOKEN (now using OIDC authentication)
  - More secure authentication method
  - Automated npm publishing from GitHub Actions

### 🔧 Version Management

#### Added
- **Enhanced sync-version script**: Comprehensive version synchronization
  - Updates ALL version references across project
  - Syncs package.json, README.md, docs, and source code
  - Updated 21 files automatically
  - Ensures version consistency across monorepo

#### Changed
- **AGPL-3.0 License**: Now included in npm package
- **Documentation**: Updated all version references to 1.5.6
- **Paths**: Fixed core library paths (src/core → kwami/src/core)

## [1.5.5] - 2025-11-22

### 📄 License Change

#### Changed
- **License**: Changed from Apache 2.0 to AGPL-3.0 + Commercial dual license
  - AGPL-3.0 for personal, educational, and open-source projects (free)
  - Commercial license required for proprietary/closed-source use
  - Provides stronger copyleft protection
  - Follows successful model used by MongoDB, GitLab, Sentry
  - LICENSE file now included in npm package
  - Updated package.json license field

### 🔧 Version Management

#### Added
- **sync-version script**: Automated version synchronization across project
  - Updates version in Kwami.ts, WelcomeLayer.ts, README.md
  - Fixes: src/core/Kwami.ts → kwami/src/core/Kwami.ts path
  - Added npm script: `npm run sync-version`

## [1.5.4] - 2025-11-22

### 🔧 Publishing Fixes

#### Changed
- **npm publish**: Fixed to use `cd` command instead of `-w` flag
  - More reliable publishing process
  - Ensures correct working directory

### 📝 Documentation

#### Changed
- Updated documentation paths for kwami/ folder structure
- Version bump for npm publish

## [1.5.3] - 2025-11-22

### 🔖 Version Bump

#### Changed
- Version bump to trigger npm publish workflow
- CI/CD improvements

## [1.5.2] - 2025-11-22

### ⚙️ Project Structure Finalization

#### Changed
- **Configuration Files**: Moved root config files to appropriate modules
  - Moved `.npmrc` to `kwami/` module
  - Moved `render.yaml` to `web/` module
  - Moved `MAINTAINERS.md` and `NPM_SETUP.md` to `docs/1_kwami/`
- **Root Files**: Added `CONTRIBUTING.md` and `ECOSYSTEM.md` to root
- **Package Management**: Added `package-lock.json` for dependency locking
- **Build Configuration**: Updated `vitest.config.ts` in kwami module
- **Cleanup**: Removed old root config files (`.npmignore`, `tsconfig.json`)

### 🌐 Web Enhancements

#### Added
- **Onboarding Flow**: New user onboarding experience
- **Minimap Navigation**: Site navigation minimap component
- **Render Configuration**: Production deployment ready

### ⛓️ Solana Infrastructure

#### Added
- **Deployment Scripts**: Comprehensive devnet deployment automation
- **Quick Start Guide**: Fast setup for Solana programs
- **Testing Scripts**: Program-specific test scripts for kwami and qwami
- **Deployment Status**: Tracking and documentation for deployments
- **README**: Comprehensive anchor setup documentation

### 📚 Documentation

#### Changed
- Reorganized GitHub-specific docs to `docs/1_kwami/`
- Added solana documentation to `docs/4_solana/`
- Added web documentation to `docs/8_web/`

## [1.5.1] - 2025-11-22

### 🔮 Major Addition: Kwami App

**NEW**: Production-ready Nuxt 4 web application with complete Kwami integration

#### Features
- Full Nuxt 4 framework with Vue 3 Composition API
- Glassmorphic UI with beautiful responsive design
- Multi-language support (English, French, Spanish) via @nuxtjs/i18n
- Supabase authentication and backend integration
- ElevenLabs voice integration for TTS
- 3D Kwami companion with interactive canvas
- Pinia state management (auth, ui, app state)
- Dark mode support with system preference detection
- 67+ reusable UI components from @alexcolls/nuxt-ux

#### Tech Stack
- Nuxt 4.1.2 with SSR disabled (client-side only)
- Kwami library v1.4.1 integration via @kwami alias
- @nuxt/ui v4.0.0 for UI components
- Three.js v0.180.0 for 3D graphics
- Tailwind CSS for styling
- TypeScript with full type safety

### 📚 Documentation Overhaul

#### Changed
- **Restructured Documentation**: Organized into numbered sections (1-8)
  - `docs/1_kwami/` - Core library
  - `docs/2_pg/` - Playground
  - `docs/3_app/` - Kwami App
  - `docs/4_solana/` - Solana programs
  - `docs/5_candy/` - Candy machine
  - `docs/6_market/` - Marketplace
  - `docs/7_dao/` - DAO
  - `docs/8_web/` - Website
- **Module CHANGELOGs**: Added CHANGELOG.md for each module
- **Ecosystem Documentation**: Updated README, ECOSYSTEM, PROJECT_SUMMARY

### 🎨 Candy Machine Updates

#### Changed
- Updated components: BlobPreview, MintPanel
- Improved Arweave upload and Solana helpers
- Added new types and canvas capture utility
- Added automation scripts
- Updated package.json dependencies

### ⛓️ Solana Programs Enhancement

#### Changed
- Updated KWAMI NFT and QWAMI token program implementations
- Added comprehensive testing suite
- Added economic integration tests
- Updated program documentation

### 🌐 Web App Phase 3

#### Added
- PWA support with service worker and manifest
- Accessibility features and keyboard navigation
- Analytics integration
- Error handling utilities
- Loading states and animations
- SEO files: robots.txt, sitemap.xml

### 🏛️ DAO & Marketplace

#### Changed
- Added CHANGELOG.md files
- Updated README files with current status
- Consolidated documentation

### 🎮 Playground Reorganization

#### Changed
- **Renamed**: `playground/` → `pg/` for consistency
- Added comprehensive playground infrastructure
- Moved all assets to pg/ directory

### ♻️ Project Structure

#### Changed
- **Core Library**: Moved kwami library source to `kwami/` directory
- **Configuration**: Updated package.json files across all modules
- **Workflows**: Updated GitHub workflows for new structure
- **Cleanup**: Removed old source files and tests from root

## [1.4.2] - 2025-11-22

### 🏗️ Project Restructuring

#### Changed
- **Monorepo Reorganization**: Moved core library to `kwami/` folder
- **Documentation**: Reorganized all docs into `docs/` with project-specific folders:
  - `docs/1_kwami/` - Core library documentation
  - `docs/2_pg/` - Playground documentation
  - `docs/3_app/` - App documentation
  - `docs/4_solana/` - Solana programs documentation
  - `docs/5_candy/` - Candy machine documentation
  - `docs/6_market/` - Marketplace documentation
  - `docs/7_dao/` - DAO documentation
  - `docs/8_web/` - Website documentation
- **Renamed**: `playground/` → `pg/` for consistency
- **Workspaces**: Configured npm workspaces for all projects
- **Build Process**: Updated CI/CD to build and publish from `kwami/` folder

### 📦 Projects

#### Core Library (`kwami/`)
- Now properly isolated in its own package
- Independent versioning and publishing
- See [kwami/CHANGELOG.md](./kwami/CHANGELOG.md) for detailed changes

#### Playground (`pg/`)
- Renamed from `playground/` to `pg/`
- Interactive testing environment for KWAMI features

#### App (`app/`)
- Nuxt 4 application
- Full KWAMI integration

#### Solana Programs (`solana/`)
- KWAMI NFT program (10B supply by 2100)
- QWAMI token program
- Complete blockchain integration

#### Candy Machine (`candy/`)
- NFT minting interface
- DNA-based uniqueness
- Arweave integration

#### Marketplace (`market/`)
- NFT trading platform
- Buy/sell KWAMI NFTs

#### DAO (`dao/`)
- Governance platform
- Token-weighted voting
- Proposal system

#### Website (`web/`)
- Public-facing website
- Interactive demo
- PWA support

## [1.4.1] - 2025-11-22

### 🤖 Core Library
- Complete ElevenLabs Conversational AI Agents Integration
- AgentConfigBuilder with fluent API
- Tools API and Knowledge Base support
- Multi-Agent Workflows

## [1.4.0] - 2025-11-20

### 🧬 NFT System
- KWAMI NFT System with Solana integration
- DNA-based uniqueness validation
- Real-time WebSocket updates

## Previous Versions

For complete version history of all projects:
- Core Library: See [kwami/CHANGELOG.md](./kwami/CHANGELOG.md)
- Individual projects: See each project's CHANGELOG.md

---

**Made with ❤️ by the KWAMI team**
