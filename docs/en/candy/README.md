# KWAMI Candy Machine Documentation

Welcome to the KWAMI Candy Machine documentation. This is the NFT minting interface for KWAMI NFTs.

## 📚 Documentation Structure

### Getting Started
- [Quick Start](./QUICKSTART.md) - Quick setup and usage guide
- [Environment Setup](./ENV_SETUP.md) - Environment configuration
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - How to deploy the candy machine
- [Deployment](./DEPLOYMENT.md) - Deployment instructions

### Implementation
- [Minting Implementation](./MINTING_IMPLEMENTATION.md) - NFT minting process
- [Implementation Complete](./IMPLEMENTATION_COMPLETE.md) - Implementation summary
- [Complete](./COMPLETE.md) - Completion details

### Status & Updates
- [Status](./STATUS.md) - Current status
- [Final Status](./FINAL_STATUS.md) - Final implementation status
- [What's New](./WHATS_NEW.md) - Latest updates and features
- [Update Summary](./UPDATE_SUMMARY.md) - Summary of updates

### Summaries
- [Final Summary](./FINAL_SUMMARY.md) - Overall project summary
- [Completion Summary](./COMPLETION_SUMMARY.md) - Completion details

### API
- [Server API](./server-api.md) - Backend API documentation

## 🎯 Overview

The KWAMI Candy Machine is a web application for minting KWAMI NFTs on Solana. It provides:

- **Interactive NFT Preview** - Real-time 3D blob visualization
- **DNA-based Minting** - Unique DNA hash for each KWAMI
- **Arweave Storage** - Decentralized metadata storage
- **Solana Integration** - Direct blockchain interaction
- **Generational Supply** - Respects the 10B supply schedule
- **Metaplex Standard** - Full Metaplex NFT compliance

## 🔗 Related Documentation

- Main README: [/candy/README.md](https://github.com/alexcolls/kwami/blob/main/candy/README.md.md)
- CHANGELOG: [/candy/CHANGELOG.md](https://github.com/alexcolls/kwami/blob/main/candy/CHANGELOG.md.md)
- Solana Programs: [../solana/](../solana/)

## 🏗️ Tech Stack

- **Framework**: Nuxt 3
- **Blockchain**: Solana + Anchor
- **Storage**: Arweave
- **3D Rendering**: Three.js
- **NFT Standard**: Metaplex

## 🚀 Quick Start

```bash
cd candy
npm install
npm run dev
```

For detailed setup, see [QUICKSTART.md](./QUICKSTART.md) and [ENV_SETUP.md](./ENV_SETUP.md).

## 🧬 DNA System

Each KWAMI has a unique DNA hash calculated from its body configuration:
- Geometry parameters (resolution, spikes, time, rotation)
- Visual properties (colors, shininess, wireframe)
- Skin selection (Tricolor + subtype: poles, donut, vintage)
- Scale and opacity

The DNA hash ensures no two KWAMIs are identical on-chain.

## 📦 Features

### Minting Process
1. Configure KWAMI appearance
2. Generate unique DNA hash
3. Upload to Arweave
4. Mint NFT on Solana
5. Verify in collection

### Preview System
- Real-time 3D visualization
- Audio-reactive animations
- Customizable parameters
- Export capabilities

### Blockchain Integration
- Wallet connection (Phantom)
- Transaction signing
- NFT verification
- Metadata management

## 🔐 Environment Variables

Required environment variables (see [ENV_SETUP.md](./ENV_SETUP.md)):

```bash
ARWEAVE_KEY=your_arweave_key
SOLANA_RPC_URL=your_rpc_url
SOLANA_PRIVATE_KEY=your_private_key
```

## 📊 Supply Schedule

The candy machine respects the generational supply schedule:
- Launch: January 1, 2026 (Generation #0)
- Annual release: 133.33M NFTs
- Total: 10 billion by 2100

See [../solana/KWAMI_SUPPLY_SCHEDULE.md](../solana/KWAMI_SUPPLY_SCHEDULE.md) for complete details.

