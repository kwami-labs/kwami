# 🏛️ KWAMI DAO

Decentralized Autonomous Organization governance platform for KWAMI NFT holders. Built with Nuxt 4 and Solana.

## 📋 Overview

KWAMI DAO enables KWAMI NFT holders to participate in decentralized governance by:

- **Connecting** Solana wallets with multiple wallet adapter support
- **Verifying** KWAMI NFT ownership for DAO membership
- **Using** QWAMI tokens to vote on proposals and exercise holder rights
- **Creating** and managing governance proposals
- **Participating** in community decision-making

## 🎯 Features

### Wallet Integration
- Multi-wallet support (Phantom, Solflare, Backpack, and more)
- Auto-connect functionality
- Real-time wallet state management
- Network configuration (Devnet/Mainnet)

### NFT Verification
- Automatic KWAMI NFT detection
- Multi-NFT holder support
- NFT selection for governance
- Collection verification

### QWAMI Token Integration
- Real-time balance tracking
- Governance eligibility checking
- Token-weighted voting
- Staking for proposal creation

### Governance Features
- Create proposals with QWAMI staking
- Vote on active proposals (For/Against/Abstain)
- View voting results and statistics
- Filter proposals by status
- Detailed proposal pages

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or bun
- Solana wallet (Phantom, Solflare, etc.)
- KWAMI NFT (for DAO participation)
- QWAMI tokens (for voting, minimum 100 QWAMI)

### Installation

```bash
# Navigate to DAO directory
cd dao

# Install dependencies
npm install
# or
bun install

# Create environment file
cp .env.example .env
```

### Configuration

Edit `.env` with your configuration:

```env
# Solana Network
NUXT_PUBLIC_SOLANA_NETWORK=devnet
NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Program IDs
NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=your_nft_program_id
NUXT_PUBLIC_QWAMI_TOKEN_MINT=your_qwami_token_mint

# Collection Address
NUXT_PUBLIC_KWAMI_COLLECTION_ADDRESS=your_collection_address
```

### Development

```bash
# Start development server
npm run dev
# or
bun run dev
```

Visit `http://localhost:3000`

### Build for Production

```bash
# Build the application
npm run build
# or
bun run build

# Preview production build
npm run preview
```

## 🏗️ Architecture

### Directory Structure

```
dao/
├── app/
│   ├── components/        # Vue components
│   │   ├── WalletButton.vue
│   │   ├── NFTVerification.vue
│   │   ├── QwamiBalance.vue
│   │   └── ProposalCard.vue
│   ├── composables/       # Composable functions
│   │   └── useAuth.ts
│   ├── layouts/           # Layout components
│   │   └── default.vue
│   ├── pages/             # Page routes
│   │   ├── index.vue
│   │   ├── create.vue
│   │   └── proposals/
│   │       ├── index.vue
│   │       └── [id].vue
│   ├── stores/            # Pinia stores
│   │   ├── wallet.ts
│   │   ├── nft.ts
│   │   ├── qwami.ts
│   │   └── governance.ts
│   └── app.vue
├── plugins/
│   └── solana.ts          # Solana wallet plugin
├── public/
├── nuxt.config.ts
├── package.json
└── README.md
```

### Tech Stack

- **Framework**: Nuxt 4
- **Blockchain**: Solana
- **Wallet Adapter**: solana-wallets-vue
- **State Management**: Pinia
- **UI Library**: Nuxt UI
- **NFT Standard**: Metaplex
- **Token Standard**: SPL Token

### Core Stores

#### Wallet Store
Manages Solana connection and wallet state:
```typescript
- connection: Connection
- isConnected: boolean
- initializeConnection()
- getBalance(publicKey)
```

#### NFT Store
Handles KWAMI NFT verification:
```typescript
- kwamiNFTs: KwamiNFT[]
- hasVerifiedNFT: boolean
- selectedNFT: KwamiNFT | null
- fetchKwamiNFTs(publicKey)
- selectNFT(nft)
```

#### QWAMI Store
Manages QWAMI token balance:
```typescript
- balance: number
- hasEnoughForGovernance: boolean
- fetchBalance(publicKey)
```

#### Governance Store
Handles proposal management:
```typescript
- proposals: Proposal[]
- userVotes: Vote[]
- fetchProposals()
- createProposal(title, description, qwamiAmount)
- vote(proposalId, voteType, qwamiAmount, publicKey)
```

## 🎮 Usage

### Connecting Wallet

1. Click "Select Wallet" button
2. Choose your wallet (Phantom, Solflare, etc.)
3. Approve connection in wallet
4. Wait for NFT and QWAMI verification

### Viewing Proposals

1. Navigate to "Proposals" page
2. Filter by Active/Past/All
3. View proposal details and voting statistics
4. Click on a proposal for detailed view

### Creating a Proposal

1. Ensure you have:
   - Connected wallet with KWAMI NFT
   - At least 100 QWAMI tokens
2. Navigate to "Create" page
3. Fill in proposal details:
   - Title (10-100 characters)
   - Description (50-2000 characters)
   - QWAMI stake (minimum 100)
   - Voting period (3-14 days)
4. Preview and submit

### Voting on Proposals

1. Open a proposal detail page
2. Enter QWAMI amount to vote with
3. Choose: For / Against / Abstain
4. Confirm transaction in wallet
5. Vote is recorded on-chain

## 🔐 Security

### Best Practices

- Never share your private keys
- Always verify transaction details
- Use hardware wallets for large holdings
- Test on devnet before mainnet

### Wallet Safety

- Only connect to trusted sites
- Review wallet permissions
- Disconnect when not in use
- Keep wallet software updated

## 📊 Governance Rules

### Eligibility

- **Membership**: Must own at least 1 KWAMI NFT
- **Voting**: Must have at least 100 QWAMI tokens
- **Proposal Creation**: Must stake at least 100 QWAMI

### Voting

- **Weight**: 1 QWAMI = 1 vote
- **Options**: For, Against, Abstain
- **Period**: Set by proposal creator (3-14 days)
- **Quorum**: Varies by proposal type

### Proposal Types

- Treasury allocation
- Protocol changes
- Feature requests
- Community initiatives
- Governance parameter updates

## 🛠️ Development

### Adding New Features

1. Create feature branch
2. Implement changes
3. Test thoroughly on devnet
4. Submit pull request

### Testing

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run typecheck
```

### Customization

The DAO can be customized by:

- Modifying governance rules in stores
- Adjusting UI styling in components
- Adding new proposal types
- Implementing on-chain voting (currently mock)

## 📚 Resources

### Documentation

- [Solana Documentation](https://docs.solana.com/)
- [Metaplex Docs](https://docs.metaplex.com/)
- [Solana Wallets Vue](https://github.com/lorisleiva/solana-wallets-vue)
- [Nuxt Documentation](https://nuxt.com/docs)

### KWAMI Ecosystem

- [KWAMI Documentation](../docs/README.md)
- [Solana Programs](../solana/README.md)
- [QWAMI Token Info](../solana/anchor/qwami-token/README.md)
- [KWAMI NFT Info](../solana/anchor/kwami-nft/README.md)

## 🐛 Troubleshooting

### Common Issues

**Wallet won't connect**
- Ensure wallet extension is installed
- Check network matches (devnet/mainnet)
- Try refreshing the page

**NFT not detected**
- Verify NFT is in connected wallet
- Check collection address is correct
- Wait a moment for blockchain sync

**QWAMI balance is 0**
- Verify token mint address
- Check you have QWAMI in wallet
- Try refreshing balance

**Transaction fails**
- Ensure sufficient SOL for fees
- Check network congestion
- Verify program IDs are correct

## 🚧 Roadmap

- [ ] On-chain voting implementation
- [ ] Multi-sig treasury integration
- [ ] Proposal execution automation
- [ ] Delegation system
- [ ] Governance analytics dashboard
- [ ] Mobile responsive improvements
- [ ] Notification system

## 📝 License

This project is part of the KWAMI ecosystem. See main repository for license information.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 💬 Support

For questions and support:

- Open an issue on GitHub
- Join the KWAMI community
- Check existing documentation

---

**Built with ❤️ by the KWAMI team**

*Powered by Solana • Governed by the Community*

