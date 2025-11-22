# 🏛️ KWAMI DAO

Decentralized Autonomous Organization governance platform for KWAMI NFT holders. Built with Nuxt 4 and Solana.

## 📋 Overview

KWAMI DAO enables KWAMI NFT holders to participate in decentralized governance through:
- Proposal creation and voting
- Treasury management
- Protocol governance
- Community decision-making

## 🚀 Quick Start

```bash
cd dao
npm install
npm run dev
```

Visit `http://localhost:3000`

## 📚 Documentation

For complete documentation, see [docs/7_dao/README.md](../docs/7_dao/README.md)

### Key Documents
- [Quick Start](../docs/7_dao/QUICKSTART.md) - Quick setup guide
- [Deploy Guide](../docs/7_dao/DEPLOY.md) - Deployment instructions
- [Render Deploy](../docs/7_dao/RENDER_DEPLOY_INSTRUCTIONS.md) - Deploy to Render
- [Test Checklist](../docs/7_dao/TEST_CHECKLIST.md) - Testing checklist
- [Status](../docs/7_dao/STATUS.md) - Development status

## 🔗 Related

- [Changelog](./CHANGELOG.md) - Version history and changes
- [Main README](../README.md) - KWAMI project overview
- [Solana Programs](../docs/4_solana/) - Blockchain documentation

## 🎯 Features

- **Wallet Integration** - Multi-wallet support (Phantom, Solflare, etc.)
- **NFT Verification** - Automatic KWAMI NFT detection
- **QWAMI Token** - Token-weighted voting
- **Governance** - Create and vote on proposals
- **Treasury** - Community fund management

## 🏗️ Tech Stack

- Nuxt 4
- Solana + SPL Token
- Metaplex NFTs
- Pinia
- Nuxt UI

## 📦 Governance

### Eligibility
- **Membership**: 1+ KWAMI NFT
- **Voting**: 100+ QWAMI tokens
- **Proposals**: 100+ QWAMI stake

### Voting
- 1 QWAMI = 1 vote
- 3-14 day voting periods
- For/Against/Abstain options
- On-chain execution

## 🔐 Configuration

```env
NUXT_PUBLIC_SOLANA_NETWORK=devnet
NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=your_program_id
NUXT_PUBLIC_QWAMI_TOKEN_MINT=your_token_mint
```

---

**Status:** Production Ready  
**Powered by:** Solana • Governed by the Community
