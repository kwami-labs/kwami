# 🚀 KWAMI Marketplace - Quick Start Guide

Get the KWAMI NFT marketplace running in 5 minutes!

## Prerequisites

- Node.js 18+ or Bun installed
- Phantom Wallet browser extension
- Git

## Step 1: Install Dependencies

```bash
cd /home/kali/labs/kwami/market

# Using Bun (recommended)
bun install

# Or using npm
npm install
```

## Step 2: Configure Environment

Create `.env` file:

```bash
# Copy example
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Solana Network
NUXT_PUBLIC_SOLANA_NETWORK=devnet
NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# KWAMI Program (update after deployment)
NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=11111111111111111111111111111111
NUXT_PUBLIC_KWAMI_COLLECTION_MINT=
NUXT_PUBLIC_KWAMI_COLLECTION_AUTHORITY=
NUXT_PUBLIC_KWAMI_DNA_REGISTRY=
```

## Step 3: Start Development Server

```bash
# Using Bun
bun run dev

# Or using npm
npm run dev
```

Open http://localhost:3000 🎉

## Step 4: Connect Wallet

1. Click "Connect Wallet" in the top right
2. Select Phantom wallet
3. Approve the connection

## Step 5: Get Devnet SOL (Testing)

If on devnet, you can airdrop SOL:

```bash
# Using Solana CLI
solana airdrop 2

# Or use a faucet
# https://solfaucet.com
```

## 🎨 Features Ready to Use

### ✅ Browse Marketplace
- Navigate to homepage
- View all listed NFTs
- Use filters to search

### ✅ View NFT Details
- Click any NFT card
- See full details, properties, DNA
- Check owner and price

### ✅ My Collection
- Click "My KWAMIs" in nav
- View your owned NFTs
- List NFTs for sale

### ✅ List NFT for Sale
- Go to "My KWAMIs"
- Click "List" on any NFT
- Set price and confirm

### ✅ Buy NFT
- Find an NFT on marketplace
- Click "Buy Now"
- Confirm transaction

## 📝 Development Notes

### Project Structure

```
market/
├── app/
│   ├── components/      # Reusable components
│   ├── composables/     # Business logic
│   ├── layouts/         # Page layouts
│   ├── pages/           # Routes
│   └── stores/          # State management
├── assets/
│   └── styles/          # Global styles
└── nuxt.config.ts       # Configuration
```

### Key Files

- `app/app.vue` - Root component
- `app/pages/index.vue` - Marketplace home
- `app/composables/useWallet.ts` - Wallet connection
- `app/composables/useMetaplex.ts` - NFT operations
- `app/stores/marketplace.ts` - Marketplace state

### State Management

Using Pinia stores:
- `wallet` - Wallet connection state
- `marketplace` - NFT listings and filters
- `nft` - Current NFT and user collection

### Styling

Tailwind CSS with custom KWAMI theme:
- Purple, Blue, Pink gradients
- Dark mode by default
- Glassmorphism effects

## 🔧 Common Tasks

### Add New Page

```bash
# Create new page
touch app/pages/new-page.vue
```

### Add New Component

```bash
# Create new component
touch app/components/NewComponent.vue
```

### Update Styles

Edit `assets/styles/main.scss` or use Tailwind classes.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 🐛 Troubleshooting

### Wallet Not Connecting
1. Install Phantom wallet extension
2. Refresh the page
3. Check browser console for errors

### NFTs Not Loading
1. Verify RPC URL in `.env`
2. Check network (devnet vs mainnet)
3. Ensure program IDs are correct

### Build Errors
1. Clear node_modules: `rm -rf node_modules`
2. Reinstall: `bun install`
3. Clear cache: `rm -rf .nuxt`

## 📚 Next Steps

1. **Deploy Solana Program**
   ```bash
   cd ../solana/anchor/kwami-nft
   anchor build
   anchor deploy
   ```

2. **Initialize Collection**
   ```bash
   cd ../solana/scripts
   ./initialize-collection.sh
   ```

3. **Update Environment**
   - Copy program IDs to `.env`
   - Restart dev server

4. **Test Marketplace**
   - Create test NFTs
   - List for sale
   - Buy/sell transactions

5. **Deploy to Production**
   - Change network to mainnet
   - Deploy to Vercel/Netlify
   - Update DNS

## 🔗 Resources

- [Nuxt 4 Docs](https://nuxt.com)
- [Solana Docs](https://docs.solana.com)
- [Metaplex Docs](https://docs.metaplex.com)
- [Tailwind CSS](https://tailwindcss.com)

## 💡 Tips

- Use devnet for testing
- Test all transactions before mainnet
- Keep private keys secure
- Monitor gas fees
- Backup your wallet

---

**Happy Building! 🎨👻**

