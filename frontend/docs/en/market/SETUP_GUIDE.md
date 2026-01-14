# 🎯 KWAMI Marketplace - Complete Setup Guide

This is your one-stop guide to getting the KWAMI Marketplace up and running.

## 📚 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Configuration](#configuration)
5. [Development](#development)
6. [Troubleshooting](#troubleshooting)
7. [Next Steps](#next-steps)

## 🔧 Prerequisites

### Required Software
- **Node.js** 18+ or **Bun** 1.0+
- **Git**
- **Phantom Wallet** browser extension
- **Solana CLI** (for contract deployment)

### Required Knowledge
- Basic understanding of Solana blockchain
- Familiarity with NFTs and Metaplex
- Basic TypeScript/Vue.js knowledge

### Accounts Needed
- Solana wallet with SOL (devnet or mainnet)
- GitHub account (for deployment)

## ⚡ Quick Start

```bash
# 1. Navigate to marketplace directory
cd market

# 2. Install dependencies
bun install
# or
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Start development server
bun run dev
# or
npm run dev

# 5. Open browser
open `http://localhost:3000`
```

The marketplace will run with default settings. You'll need to configure your Solana program IDs for full functionality.

## 📋 Detailed Setup

### Step 1: Install Dependencies

```bash
cd /home/kali/labs/kwami/market

# Using Bun (recommended)
bun install

# Or using npm
npm install

# Or using yarn
yarn install
```

### Step 2: Deploy Solana Programs

Before configuring the marketplace, deploy your Anchor programs:

```bash
# Navigate to Anchor program
cd ../solana/anchor/kwami-nft

# Build the program
anchor build

# Deploy to devnet
anchor deploy

# Note the Program ID from the output
# Example: Program Id: 9x4ZqXMVbWPvKFgZhY4RnGhKp9wVvXdWEKKPmCQR3Lpw
```

### Step 3: Initialize Collection

```bash
# Navigate to scripts directory
cd ../../scripts

# Make script executable
chmod +x initialize-collection.sh

# Run initialization
./initialize-collection.sh

# Save the output:
# - Collection Mint Address
# - Collection Authority PDA
# - DNA Registry PDA
```

### Step 4: Configure Environment

Create a `.env` file in the `market/` directory:

```env
# Solana Configuration
NUXT_PUBLIC_SOLANA_NETWORK=devnet
NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Program IDs (from Step 2 & 3)
NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=<your_program_id>
NUXT_PUBLIC_KWAMI_COLLECTION_MINT=<collection_mint>
NUXT_PUBLIC_KWAMI_COLLECTION_AUTHORITY=<authority_pda>
NUXT_PUBLIC_KWAMI_DNA_REGISTRY=<dna_registry_pda>
```

### Step 5: Fund Your Wallet

For devnet testing:

```bash
# Get devnet SOL
solana airdrop 2

# Verify balance
solana balance
```

For mainnet:
- Purchase SOL from an exchange
- Transfer to your wallet

### Step 6: Start Development

```bash
# Start dev server with hot reload
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## ⚙️ Configuration

### Solana Network Options

**Devnet (Development)**
```env
NUXT_PUBLIC_SOLANA_NETWORK=devnet
NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

**Mainnet (Production)**
```env
NUXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NUXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

**Custom RPC (Recommended for Production)**
```env
NUXT_PUBLIC_SOLANA_RPC_URL=https://your-quicknode-url.com
# or
NUXT_PUBLIC_SOLANA_RPC_URL=https://your-helius-url.com
```

### Marketplace Features

Edit `nuxt.config.ts` to customize:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      solanaNetwork: 'devnet',
      marketplaceFee: 250, // 2.5% in basis points
      // ... more config
    }
  }
})
```

### Styling Customization

Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // Customize your brand colors
        },
        kwami: {
          purple: '#9333ea',
          blue: '#3b82f6',
          pink: '#ec4899',
        }
      }
    }
  }
}
```

## 🎨 Development

### Project Structure

```
market/
├── app/
│   ├── components/      # Vue components
│   ├── composables/     # Reusable logic
│   ├── layouts/         # Page layouts
│   ├── pages/           # Routes
│   └── stores/          # Pinia stores
├── assets/
│   └── styles/          # Global styles
├── public/              # Static files
└── nuxt.config.ts       # Configuration
```

### Creating New Components

```vue
<!-- app/components/MyComponent.vue -->
<template>
  <div class="card">
    <!-- Your component -->
  </div>
</template>

<script setup lang="ts">
// Component logic
</script>
```

### Adding New Routes

Create a file in `app/pages/`:

```
app/pages/my-route.vue → /my-route
app/pages/user/[id].vue → /user/:id
```

### Using Composables

```typescript
// In your component
const { connect, disconnect, publicKey } = useWallet()
const { fetchWalletNfts } = useMetaplex()
const { buyNft, listNft } = useMarketplace()
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "Wallet not found"
**Solution:** Install Phantom wallet extension
```bash
# Visit https://phantom.app and install
```

#### 2. "Program not found"
**Solution:** Check your program ID is correct
```bash
# Verify program deployment
solana program show <PROGRAM_ID>
```

#### 3. "Insufficient SOL for transaction"
**Solution:** Add more SOL to your wallet
```bash
# Devnet
solana airdrop 2

# Mainnet
# Transfer SOL from exchange
```

#### 4. "NFTs not loading"
**Solution:** 
- Check RPC URL is correct
- Verify network selection (devnet/mainnet)
- Check console for errors

#### 5. "Transaction failed"
**Solution:**
- Ensure enough SOL for fees (~0.01 SOL)
- Check wallet is connected
- Verify network connection
- Try again after a moment

### Debug Mode

Enable detailed logging:

```typescript
// In composables
console.log('Debug:', { data, error })
```

Check browser console (F12) for errors.

### Reset Everything

```bash
# Clear all caches and reinstall
rm -rf .nuxt .output node_modules
bun install
bun run dev
```

## 📚 Next Steps

### For Development
1. ✅ Explore the codebase
2. ✅ Read `FEATURES.md` for feature list
3. ✅ Check `MARKETPLACE_INTEGRATION.md` for Auction House
4. ✅ Customize styling and branding
5. ✅ Add your own features

### For Testing
1. ✅ Test wallet connection
2. ✅ Try browsing NFTs
3. ✅ Test listing an NFT
4. ✅ Test buying an NFT
5. ✅ Check all pages work

### For Production
1. ✅ Read `DEPLOYMENT.md`
2. ✅ Deploy contracts to mainnet
3. ✅ Use production RPC endpoint
4. ✅ Set up monitoring
5. ✅ Deploy marketplace

### Learning Resources
- 📖 [Solana Documentation](https://docs.solana.com)
- 📖 [Metaplex Documentation](https://docs.metaplex.com)
- 📖 [Nuxt Documentation](https://nuxt.com/docs)
- 📖 [Anchor Documentation](https://www.anchor-lang.com/)

## 🎓 Tutorials

### How to List Your First NFT

1. **Connect Wallet**: Click "Connect Wallet" button
2. **Approve Connection**: Approve in Phantom popup
3. **Go to My KWAMIs**: Navigate to "My KWAMIs" page
4. **Select NFT**: Click on an NFT you own
5. **Click List**: Click "List for Sale" button
6. **Set Price**: Enter price in SOL
7. **Confirm**: Approve transaction in wallet

### How to Buy an NFT

1. **Browse Marketplace**: Go to main page
2. **Find NFT**: Use filters to find NFT you like
3. **View Details**: Click on NFT card
4. **Click Buy Now**: Review price and click "Buy Now"
5. **Confirm Purchase**: Review modal and confirm
6. **Approve Transaction**: Approve in Phantom wallet
7. **Wait for Confirmation**: Transaction processes
8. **NFT in Your Wallet**: Check "My KWAMIs"

## 🆘 Getting Help

### Resources
- **Documentation**: Check the `/market/*.md` files
- **Code Examples**: Look in `/app/composables/`
- **Component Library**: Check `/app/components/`

### Community
- **GitHub Issues**: Report bugs
- **Discord**: Join community
- **Twitter**: Follow for updates

### Support
- **Email**: support@example.com
- **Documentation**: Read all .md files
- **FAQ**: Check TROUBLESHOOTING section

## ✅ Checklist

Before launching:
- [ ] All environment variables set
- [ ] Anchor program deployed
- [ ] Collection initialized
- [ ] Wallet funded with SOL
- [ ] Development server runs
- [ ] Can connect wallet
- [ ] Can browse NFTs
- [ ] Styling looks good
- [ ] Mobile responsive
- [ ] All pages work
- [ ] No console errors
- [ ] Ready for production

## 🎉 Congratulations!

You now have a fully functional KWAMI NFT marketplace! 

**What's Next?**
- Customize the design
- Add new features
- Deploy to production
- Build your community
- Launch your NFTs

Happy building! 🚀

