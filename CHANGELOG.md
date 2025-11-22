# KWAMI Ecosystem Changelog

All notable changes to the KWAMI ecosystem will be documented in this file.

For detailed core library changes, see [kwami/CHANGELOG.md](./kwami/CHANGELOG.md).

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
