# 🔷 Quami Solana Programs

This directory contains the Solana blockchain programs for the Quami ecosystem, implementing the QWAMI token and Kwami NFT contracts.

## 📂 Project Structure

```
solana/
├── anchor/                    # Anchor Framework programs
│   ├── qwami-token/          # QWAMI SPL token program
│   └── kwami-nft/            # Kwami NFT program with DNA registry
├── metaplex/                  # Metaplex configuration and scripts
│   ├── collection/           # Kwami NFT collection setup
│   └── utils/                # Arweave upload utilities
├── scripts/                   # Deployment and management scripts
└── SETUP.md                  # Development environment setup

```

## 🎯 Overview

### QWAMI Token

**SPL Token** - The utility token powering the Quami ecosystem

- **Symbol:** QWAMI (or QWA)
- **Total Supply:** 1,000,000,000,000 (1 trillion tokens)
- **Decimals:** 9
- **Base Price:** $0.01 USD per token
- **Features:**
  - Mint/burn functionality up to max supply
  - Authority-controlled minting
  - Used to pay for AI services (ElevenLabs, etc.)
  - Consumed based on Kwami Mind usage

### Kwami NFT Program

**Unique AI Companion NFTs** - Each Kwami is a unique NFT with DNA-based validation

- **Standard:** Metaplex NFT
- **Symbol:** KWAMI
- **Storage:** Arweave (decentralized)
- **Features:**
  - Unique DNA hash from body configuration
  - On-chain DNA registry preventing duplicates
  - Burn-and-remint for DNA changes
  - Metadata updates for Mind/Soul changes
  - Full configuration stored in metadata

## 🧬 DNA System

Each Kwami has a unique DNA hash calculated from its body configuration:

### DNA Components (Body Only)

- **Geometry:** resolution
- **Deformation:** spikes (x,y,z), time (x,y,z), rotation (x,y,z)
- **Visual:** colors (x,y,z), shininess, wireframe
- **Skin:** tricolor, tricolor2, zebra
- **Scale:** baseScale, opacity

### Excluded from DNA

- Background configuration
- Audio effects
- Mind configuration (AI/TTS settings)
- Soul configuration (personality)

### DNA Calculation

```typescript
DNA = SHA256(
  normalized_and_sorted_body_config
)
// Results in 64-character hex string
```

## 🔐 Access Control

### QWAMI Token Authority

- Mint new tokens (up to max supply)
- Burn tokens
- Transfer authority

### Kwami NFT Authority

- Update collection metadata
- Verify NFTs in collection
- Update program parameters

### User Permissions

- Mint Kwami NFTs (with QWAMI payment)
- Update own NFT metadata (Mind/Soul only)
- Burn and remint for DNA changes
- Transfer NFTs

## 💰 Token Economics

### QWAMI Token

- **Initial Distribution:** TBD
- **Burn Mechanism:** Consumed when using AI services
- **Mint Mechanism:** Controlled by authority
- **Price Oracle:** Off-chain USD price feed

### Kwami NFT

- **Minting Cost:** TBD (paid in QWAMI)
- **Update Cost:** Minimal (for metadata only, ~0.01 SOL)
- **Burn-Remint Cost:** Full minting cost
- **Royalties:** TBD

## 🚀 Quick Start

### Prerequisites

1. Install development tools (see [SETUP.md](./SETUP.md)):
   - Rust & Cargo
   - Solana CLI
   - Anchor Framework
   - Node.js dependencies

2. Configure Solana CLI for devnet:
   ```bash
   solana config set --url https://api.devnet.solana.com
   ```

3. Fund your wallet:
   ```bash
   solana airdrop 2
   ```

### Deploy QWAMI Token

```bash
cd solana/anchor/qwami-token
anchor build
anchor deploy
```

See [anchor/qwami-token/README.md](./anchor/qwami-token/README.md) for details.

### Deploy Kwami NFT Program

```bash
cd solana/anchor/kwami-nft
anchor build
anchor deploy
```

See [anchor/kwami-nft/README.md](./anchor/kwami-nft/README.md) for details.

### Initialize Collection

```bash
cd solana/metaplex
./scripts/init-collection.sh
```

See [metaplex/README.md](./metaplex/README.md) for details.

## 📡 Integration

### Frontend (Nuxt.js/Vue)

The Quami web application integrates with these programs via:

- **Wallet Connection:** Phantom wallet adapter
- **Token Operations:** `@solana/spl-token`
- **NFT Operations:** `@metaplex-foundation/js`
- **Program Interaction:** `@coral-xyz/anchor`

Key files:
- `app/stores/wallet.ts` - Wallet state and connection
- `app/stores/kwami-nft.ts` - NFT state management
- `server/api/kwami/mint.ts` - NFT minting API
- `server/api/qwami/` - Token operations API

### Backend API

Server-side operations:
- Verify DNA uniqueness before minting
- Upload assets to Arweave
- Create and sign transactions
- Monitor blockchain events

## 🧪 Testing

### Unit Tests

```bash
# Test QWAMI token
cd solana/anchor/qwami-token
anchor test

# Test Kwami NFT
cd solana/anchor/kwami-nft
anchor test
```

### Integration Tests

```bash
# From project root
bun test solana
```

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Development environment setup
- **[anchor/README.md](./anchor/README.md)** - Anchor programs guide
- **[metaplex/README.md](./metaplex/README.md)** - Metaplex configuration
- **[../docs/DNA_SYSTEM.md](../docs/DNA_SYSTEM.md)** - DNA system documentation
- **[../docs/QWAMI_TOKEN.md](../docs/QWAMI_TOKEN.md)** - Token economics
- **[../docs/KWAMI_NFT_MINTING.md](../docs/KWAMI_NFT_MINTING.md)** - NFT minting guide

## 🔒 Security

### Best Practices

- **Private Keys:** Never commit private keys or seed phrases
- **Environment Variables:** Use `.env` for sensitive data
- **Authority Keys:** Use separate wallets for different authorities
- **Audits:** Conduct thorough audits before mainnet deployment

### Devnet vs Mainnet

- **Devnet:** For development and testing only
- **Mainnet:** Production deployment (requires audits)

Current programs are configured for **devnet**.

## 🛠️ Deployment Checklist

Before deploying to mainnet:

- [ ] Complete security audit of all programs
- [ ] Test extensively on devnet
- [ ] Set up multisig for program authorities
- [ ] Configure price oracles
- [ ] Set up monitoring and alerting
- [ ] Prepare incident response plan
- [ ] Back up all keypairs securely
- [ ] Document deployment process
- [ ] Test recovery procedures
- [ ] Set up program upgrade authority

## 📞 Support

For questions and issues:

- Open an issue on GitHub
- Check existing documentation
- Review Anchor/Solana documentation

## 📖 Resources

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Book](https://www.anchor-lang.com/)
- [Metaplex Docs](https://docs.metaplex.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [SPL Token Program](https://spl.solana.com/token)

---

**Version:** 0.1.0  
**Last Updated:** 2025-11-04  
**Network:** Devnet  
**Status:** In Development
