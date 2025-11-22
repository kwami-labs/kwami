# 🔷 KWAMI & QWAMI Solana Programs

This directory contains the Solana blockchain programs for the KWAMI ecosystem, implementing the QWAMI utility token and KWAMI NFT contracts.

## 📂 Project Structure

```
solana/
├── anchor/                    # Anchor Framework programs
│   ├── qwami/                # QWAMI SPL token program
│   └── kwami/                # KWAMI NFT program with DNA registry
├── metaplex/                  # Metaplex configuration and scripts
└── scripts/                   # Deployment and management scripts
```

## 🚀 Quick Start

### Prerequisites

See [docs/4_solana/SETUP.md](../docs/4_solana/SETUP.md) for complete setup instructions.

### Deploy QWAMI Token

```bash
cd anchor/qwami
anchor build
anchor deploy
```

### Deploy KWAMI NFT Program

```bash
cd anchor/kwami
anchor build
anchor deploy
```

## 📚 Documentation

For complete documentation, see [docs/4_solana/README.md](../docs/4_solana/README.md)

### Key Documents
- [Token Economics](../docs/4_solana/KWAMI_TOKEN_ECONOMICS.md) - Complete economic model
- [Supply Schedule](../docs/4_solana/KWAMI_SUPPLY_SCHEDULE.md) - NFT supply distribution (2026-2100)
- [Comprehensive Overview](../docs/4_solana/COMPREHENSIVE_OVERVIEW.md) - Full technical overview
- [Testing Guide](../docs/4_solana/TESTING_GUIDE.md) - How to test the programs
- [Setup Guide](../docs/4_solana/SETUP.md) - Development environment setup

## 🔗 Related

- [Changelog](./CHANGELOG.md) - Version history and changes
- [Main README](../README.md) - KWAMI project overview

## 🎯 Programs Overview

### QWAMI Token
SPL token powering the KWAMI ecosystem
- Total Supply: 1 trillion tokens
- Used for AI services payment
- Authority-controlled minting

### KWAMI NFT Program
Unique AI companion NFTs with DNA-based validation
- Max Supply: 10 billion (by 2100)
- Generational release model
- DNA uniqueness enforcement
- Metaplex standard

## 📖 Resources

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Book](https://www.anchor-lang.com/)
- [Metaplex Docs](https://docs.metaplex.com/)

---

**Network:** Devnet  
**Status:** In Development
