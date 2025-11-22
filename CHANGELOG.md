# KWAMI Ecosystem Changelog

All notable changes to the KWAMI ecosystem will be documented in this file.

For detailed core library changes, see [kwami/CHANGELOG.md](./kwami/CHANGELOG.md).

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
