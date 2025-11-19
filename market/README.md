# 🎨 KWAMI Marketplace

A fully functional Metaplex NFT marketplace for KWAMI NFTs built with Nuxt 4 and Solana.

## 🌟 Features

### Core Functionality
- ✅ **Browse NFTs** - Explore all listed KWAMI NFTs
- ✅ **Search & Filter** - Find NFTs by price, rarity, and attributes
- ✅ **Buy NFTs** - Purchase KWAMIs using SOL
- ✅ **List NFTs** - List your KWAMIs for sale
- ✅ **User Profiles** - View collections and stats
- ✅ **Wallet Integration** - Phantom wallet support
- ✅ **NFT Details** - Comprehensive NFT information pages

### Technical Features
- 🔐 **Solana Integration** - Built on Solana blockchain
- 📦 **Metaplex Standard** - Uses Metaplex NFT standard
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- ⚡ **Fast Performance** - Optimized with Nuxt 4
- 🔄 **Real-time Updates** - Live marketplace data
- 📱 **Mobile Responsive** - Works on all devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Solana CLI (for deployment)
- Phantom Wallet browser extension

### Installation

```bash
# Navigate to market directory
cd market

# Install dependencies
bun install
# or
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
# Edit .env and add your Solana program IDs
```

### Environment Setup

Create a `.env` file with the following variables:

```env
# Solana Network
NUXT_PUBLIC_SOLANA_NETWORK=devnet
NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# KWAMI NFT Program (from solana/anchor/kwami-nft deployment)
NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=your_program_id_here
NUXT_PUBLIC_KWAMI_COLLECTION_MINT=your_collection_mint_here
NUXT_PUBLIC_KWAMI_COLLECTION_AUTHORITY=your_authority_pda_here
NUXT_PUBLIC_KWAMI_DNA_REGISTRY=your_dna_registry_pda_here
```

**Getting Your Program IDs:**
1. Deploy the Anchor program: `cd ../solana/anchor/kwami-nft && anchor deploy`
2. Run the collection initialization script: `cd ../solana/scripts && ./initialize-collection.sh`
3. Copy the output addresses to your `.env` file

### Environment Configuration

Edit `.env` file:

```env
# Solana Network Configuration
NUXT_PUBLIC_SOLANA_NETWORK=devnet
NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# KWAMI NFT Program Configuration
NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=your_program_id_here
NUXT_PUBLIC_KWAMI_COLLECTION_MINT=your_collection_mint_here
NUXT_PUBLIC_KWAMI_COLLECTION_AUTHORITY=your_authority_pda_here
NUXT_PUBLIC_KWAMI_DNA_REGISTRY=your_dna_registry_pda_here
```

### Development

```bash
# Start development server
bun run dev
# or
npm run dev

# Open http://localhost:3000
```

### Production

```bash
# Build for production
bun run build
# or
npm run build

# Preview production build
bun run preview
# or
npm run preview
```

## 📂 Project Structure

```
market/
├── app/
│   ├── components/          # Vue components
│   │   ├── AppHeader.vue   # Navigation header
│   │   ├── AppFooter.vue   # Footer
│   │   ├── WalletButton.vue # Wallet connection
│   │   ├── NftCard.vue     # NFT display card
│   │   ├── BuyModal.vue    # Buy NFT modal
│   │   ├── ListModal.vue   # List NFT modal
│   │   ├── MarketplaceFilters.vue
│   │   ├── MarketplaceStats.vue
│   │   └── LoadingSpinner.vue
│   ├── composables/         # Composable functions
│   │   ├── useSolana.ts    # Solana connection
│   │   ├── useWallet.ts    # Wallet management
│   │   ├── useMetaplex.ts  # Metaplex operations
│   │   └── useMarketplace.ts # Marketplace logic
│   ├── layouts/            # Layout templates
│   │   └── default.vue
│   ├── pages/              # Route pages
│   │   ├── index.vue       # Marketplace home
│   │   ├── my-kwamis.vue   # User's collection
│   │   ├── create.vue      # Create KWAMI
│   │   ├── activity.vue    # Activity feed
│   │   ├── nft/
│   │   │   └── [mint].vue  # NFT detail page
│   │   └── profile/
│   │       └── [address].vue # User profile
│   ├── stores/             # Pinia stores
│   │   ├── wallet.ts       # Wallet state
│   │   ├── marketplace.ts  # Marketplace state
│   │   └── nft.ts          # NFT state
│   └── app.vue             # Root component
├── assets/
│   └── styles/
│       └── main.scss       # Global styles
├── nuxt.config.ts          # Nuxt configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json
```

## 🔧 Configuration

### Nuxt Configuration

The `nuxt.config.ts` includes:
- Tailwind CSS module
- Pinia state management
- Solana & Metaplex dependencies
- Runtime configuration
- Build optimizations

### Wallet Support

Currently supports:
- **Phantom Wallet** - Primary wallet

To add more wallets, update `composables/useWallet.ts`.

## 🎨 Customization

### Styling

The marketplace uses Tailwind CSS with custom configuration:

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      kwami: {
        purple: '#9333ea',
        blue: '#3b82f6',
        pink: '#ec4899',
      }
    }
  }
}
```

### Components

All components are customizable. Key components:
- `NftCard.vue` - NFT display card
- `MarketplaceFilters.vue` - Search and filter UI
- `BuyModal.vue` / `ListModal.vue` - Transaction modals

## 🔌 API Integration

### Composables

#### useSolana

```typescript
const { 
  getConnection, 
  getBalance, 
  airdrop 
} = useSolana()
```

#### useWallet

```typescript
const { 
  connect, 
  disconnect, 
  publicKey, 
  connected 
} = useWallet()
```

#### useMetaplex

```typescript
const { 
  fetchWalletNfts, 
  fetchNftByMint, 
  fetchListedNfts 
} = useMetaplex()
```

#### useMarketplace

```typescript
const { 
  buyNft, 
  listNft, 
  unlistNft, 
  getStats 
} = useMarketplace()
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

The marketplace can be deployed to:
- Netlify
- Cloudflare Pages
- AWS Amplify
- Any Node.js hosting

Build command: `npm run build`
Output directory: `.output/public`

## 🔒 Security

### Best Practices

1. **Never commit private keys**
2. **Use environment variables** for sensitive data
3. **Validate all transactions** before signing
4. **Verify NFT metadata** before purchases
5. **Test on devnet first**

### Wallet Security

- Users sign their own transactions
- No private keys are stored
- All transactions require user approval

## 📊 Marketplace Statistics

The marketplace tracks:
- Total listings
- Total volume
- Average price
- Floor price
- Recent activity

## 🛠️ Troubleshooting

### Common Issues

**Wallet won't connect**
- Ensure Phantom is installed
- Check browser console for errors
- Try refreshing the page

**NFTs not loading**
- Verify RPC URL is correct
- Check network status (devnet/mainnet)
- Ensure wallet has SOL for transactions

**Transaction failed**
- Check wallet balance
- Verify network connection
- Ensure sufficient SOL for fees

### Debug Mode

Enable debug logging:

```typescript
// In composables
console.log('Debug:', data)
```

## 🤝 Contributing

This marketplace is part of the KWAMI project. See main project README for contribution guidelines.

## 📝 License

See main project LICENSE file.

## 🔗 Links

- [KWAMI Main Project](../)
- [Solana Documentation](https://docs.solana.com)
- [Metaplex Documentation](https://docs.metaplex.com)
- [Nuxt 4 Documentation](https://nuxt.com)

## 🙏 Acknowledgments

- Solana Foundation
- Metaplex Foundation
- Nuxt Team
- Vue.js Team

---

**Status:** Production Ready
**Version:** 1.0.0
**Network:** Devnet (configurable for mainnet)
