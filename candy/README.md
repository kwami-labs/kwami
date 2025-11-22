# Kwami.io - KWAMI NFT Candy Machine

**Version 1.5.6** - Production-Ready Solana NFT Minting Platform 🎉

## 🌟 Overview

Kwami.io is a fully-integrated Nuxt4-based candy machine for minting unique KWAMI NFTs on the Solana blockchain. Each KWAMI has a unique DNA derived from its body configuration, with **10 billion KWAMIs by 2100** - one for every human on Earth.

## 🚀 Quick Start

```bash
cd candy
bun install
bun run dev
```

The app will be available at `http://localhost:3000`

## 📚 Documentation

For complete documentation, see [docs/5_candy/README.md](../docs/5_candy/README.md)

### Key Documents
- [Deployment Guide](../docs/5_candy/DEPLOYMENT_GUIDE.md) - Complete deployment walkthrough
- [Quick Start](../docs/5_candy/QUICKSTART.md) - Quick setup guide
- [Environment Setup](../docs/5_candy/ENV_SETUP.md) - Environment configuration
- [Implementation Complete](../docs/5_candy/IMPLEMENTATION_COMPLETE.md) - Technical details
- [What's New](../docs/5_candy/WHATS_NEW.md) - Latest features in v1.5.0

## 🔗 Related

- [Changelog](./CHANGELOG.md) - Version history and changes
- [Main README](../README.md) - KWAMI project overview
- [Solana Programs](../docs/4_solana/) - Blockchain documentation

## ✨ Features

- **Interactive NFT Preview** - Real-time 3D blob visualization
- **DNA-based Minting** - Unique DNA hash for each KWAMI
- **Arweave Storage** - Decentralized metadata storage
- **Solana Integration** - Direct blockchain interaction
- **Metaplex Standard** - Full NFT compliance
- **Wallet Connection** - Phantom and other wallets

## 🏗️ Tech Stack

- Nuxt 4 + Bun
- Solana + Anchor
- Arweave (Irys)
- Three.js
- Metaplex

## 🧬 DNA System

Each KWAMI has a unique DNA hash from its body configuration:
- Geometry, deformation, visual properties
- 10B max supply by 2100
- 133.33M per generation starting 2026
- On-chain uniqueness validation

## 📦 Quick Deploy

```bash
bun run anchor:build     # Build programs
bun run anchor:test      # Test programs
bun run anchor:deploy    # Deploy to devnet
```

See [DEPLOYMENT_GUIDE](../docs/5_candy/DEPLOYMENT_GUIDE.md) for complete instructions.

---

**Current Version**: 1.5.0 🎉  
**Network**: Solana Devnet/Mainnet Ready  
**Status**: Production Ready
