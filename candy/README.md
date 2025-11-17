# Kwami.io - KWAMI NFT Candy Machine

**Version 1.4.0** - Solana NFT Minting Platform

## 🌟 Overview

Kwami.io is a Nuxt4-based candy machine for minting unique KWAMI NFTs on the Solana blockchain. Each KWAMI has a unique DNA derived from its body configuration, with a maximum supply of **1 trillion** KWAMIs.

## 🏗️ Platform Architecture

### The Quami Ecosystem

- **kwami.io** (THIS APP): Candy machine for minting KWAMI NFTs on Solana

  - Visual blob editor with real-time preview
  - DNA generation and validation
  - Wallet integration (Phantom, Solflare, etc.)
  - NFT gallery and management

- **qwami.io** (Planned v1.5.x): QWAMI energy token minting and management

  - SPL token for AI service payments
  - Token staking and rewards

- **quami.io** (Planned v1.6.x): Web3/Web2 OS platform
  - Requires KWAMI NFT in wallet for access
  - MCP connectors for digital life management
  - Encrypted data storage accessible only with KWAMI NFT

## 🚀 Tech Stack

- **Frontend**: Nuxt 4.2.1 (SSR disabled for Web3)
- **Runtime**: Bun 1.2.21+
- **UI Framework**: @nuxt/ui 4.1.0
- **Real-time**: Socket.IO 4.8.1
- **Blockchain**: Solana (devnet/mainnet)
- **Smart Contracts**: Anchor Framework 0.29.0
- **NFT Standard**: Metaplex Token Metadata Program
- **Storage**: Arweave (decentralized)
- **3D Rendering**: Three.js 0.169.0
- **State Management**: Pinia
- **Wallet**: Solana Wallet Adapter

## 📁 Project Structure

```
kwami.io/
├── app/                          # Nuxt4 app directory
│   ├── app.vue                   # Root app component
│   ├── pages/                    # Application pages
│   │   └── index.vue            # Main candy machine page
│   ├── components/               # Vue components
│   │   ├── WalletConnect.vue    # Wallet connection UI
│   │   ├── BlobPreview.vue      # 3D blob preview with Three.js
│   │   ├── MintPanel.vue        # Minting interface
│   │   └── NFTGallery.vue       # User's NFT collection
│   ├── composables/              # Composable functions
│   │   └── useSolanaWallet.ts   # Wallet integration logic
│   ├── stores/                   # Pinia stores
│   │   ├── wallet.ts            # Wallet state management
│   │   └── nft.ts               # NFT state and minting logic
│   └── utils/                    # Utility functions
├── solana/                       # Solana blockchain programs
│   ├── anchor/                   # Anchor projects
│   │   ├── kwami-nft/           # KWAMI NFT program (1T limit)
│   │   └── qwami-token/         # QWAMI token program
│   ├── metaplex/                # Metaplex collection setup
│   ├── scripts/                 # Deployment scripts
│   ├── README.md                # Solana integration docs
│   ├── SETUP.md                 # Development setup guide
│   └── IMPLEMENTATION_STATUS.md # Implementation progress
├── public/                       # Static assets
├── nuxt.config.ts               # Nuxt configuration
├── package.json                 # Dependencies
└── tsconfig.json                # TypeScript configuration
```

## 🛠️ Development Setup

### Prerequisites

- **Bun** 1.0.0+ (for runtime and package management)
- **Node.js** 18.0.0+ (optional, Bun is preferred)
- **Rust & Cargo** (for Anchor programs)
- **Solana CLI** (for blockchain interaction)
- **Anchor CLI** 0.29.0+ (for smart contract development)

### Installation

```bash
# Install dependencies with Bun
cd kwami.io
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
bun run dev
```

The app will be available at `http://localhost:3000`

### Solana Development

For working with the Solana smart contracts:

```bash
# Navigate to Solana directory
cd solana

# Follow the SETUP.md guide for installing:
# - Rust & Cargo
# - Solana CLI
# - Anchor Framework

# Build and deploy contracts (see solana/README.md)
cd anchor/kwami-nft
anchor build
anchor test
anchor deploy
```

## 🧬 DNA System

Each KWAMI has a unique DNA hash calculated from its body configuration:

### DNA Components (Body Only)

- **Geometry**: resolution
- **Deformation**: spikes (x,y,z), time (x,y,z), rotation (x,y,z)
- **Visual**: colors (x,y,z), shininess, wireframe
- **Skin**: tricolor, tricolor2, zebra
- **Scale**: baseScale, opacity

### Excluded from DNA

- Background configuration
- Audio effects
- Mind configuration (AI/TTS settings) - updatable
- Soul configuration (personality) - updatable

### Supply Limit

- **Maximum**: 1,000,000,000,000 (1 trillion) KWAMIs
- **Enforcement**: On-chain validation in smart contract
- **Uniqueness**: DNA hash must be unique per NFT

## 🎮 Features

### Current (v1.4.0)

✅ **Nuxt4 App Structure** - Modern SPA with SSR disabled
✅ **Real-time WebSocket** - Live user count and activity tracking
✅ **Wallet Integration** - Connect with Phantom and other Solana wallets
✅ **Solana Smart Contracts** - Anchor programs with 1T supply limit
✅ **DNA Generation** - Unique hash from blob configuration
✅ **NFT Gallery** - View your minted KWAMIs
✅ **Candy Machine UI** - Beautiful minting interface

### In Progress (v1.4.x)

🚧 DNA calculation utility implementation
🚧 Three.js blob preview integration
🚧 Arweave upload utilities
🚧 Metaplex collection initialization
🚧 Backend API for minting
🚧 On-chain DNA validation
🚧 Comprehensive testing

### Planned (v1.5.x+)

📋 QWAMI token integration
📋 AI service payment system
📋 NFT marketplace
📋 Cross-platform authentication
📋 DAO governance

## 🔐 Security

- **Private Keys**: Never commit keypairs or seed phrases
- **Environment Variables**: Use `.env` for sensitive data
- **Devnet First**: Test thoroughly before mainnet
- **Audits**: Smart contracts will be audited before mainnet deployment

## 📚 Documentation

- [Solana Programs Overview](./solana/README.md)
- [Development Setup Guide](./solana/SETUP.md)
- [Implementation Status](./solana/IMPLEMENTATION_STATUS.md)
- [Anchor Development](./solana/anchor/README.md)
- [Main Project Changelog](../CHANGELOG.md)

## 🤝 Contributing

This is currently a private project. For questions or issues, please refer to the documentation.

## 📞 Support

Part of the **Quami Ecosystem**:

- **@kwami/core**: AI companion library
- **kwami.io**: NFT candy machine (this project)
- **qwami.io**: Token platform (coming soon)
- **quami.io**: Web3/Web2 OS (coming soon)

---

**Current Version**: 1.4.0  
**Network**: Solana Devnet  
**Status**: Active Development  
**License**: See [LICENSE](../LICENSE)

**LFG** 🚀
