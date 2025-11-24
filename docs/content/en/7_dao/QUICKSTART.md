# 🚀 KWAMI DAO Quick Start Guide

Get the KWAMI DAO up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Solana wallet extension (Phantom recommended)
- [ ] KWAMI NFT in your wallet (for testing)
- [ ] Some SOL for transaction fees
- [ ] QWAMI tokens (optional for testing)

## Step 1: Installation

```bash
# Navigate to the DAO directory
cd dao

# Install dependencies (choose one)
npm install
# or
bun install
```

## Step 2: Environment Setup

Create a `.env` file in the `dao/` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# For Devnet Testing (Recommended)
NUXT_PUBLIC_SOLANA_NETWORK=devnet
NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Program IDs (get these from your deployed programs)
NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=
NUXT_PUBLIC_QWAMI_TOKEN_MINT=
NUXT_PUBLIC_KWAMI_COLLECTION_ADDRESS=
```

> **Note**: If you don't have program IDs yet, the app will still run but NFT/token verification will use mock data.

## Step 3: Start Development Server

```bash
npm run dev
# or
bun run dev
```

The app will start at `http://localhost:3000`

## Step 4: Connect Your Wallet

1. Open `http://localhost:3000` in your browser
2. Click **"Select Wallet"** button in the top right
3. Choose your wallet (e.g., Phantom)
4. Approve the connection in your wallet extension
5. The app will automatically detect your KWAMI NFTs and QWAMI balance

## Step 5: Explore the DAO

### Dashboard (`/`)
- View your KWAMI NFT verification status
- Check your QWAMI balance
- See active proposals
- View your DAO participation stats

### Proposals (`/proposals`)
- Browse all proposals
- Filter by Active/Past/All
- View detailed voting results

### Create Proposal (`/create`)
- Submit new proposals (requires 100+ QWAMI)
- Preview your proposal
- Set voting parameters

### Vote on Proposals (`/proposals/:id`)
- View proposal details
- Cast your vote with QWAMI tokens
- See real-time voting results

## Common Workflows

### Workflow 1: View Active Proposals

```
1. Connect wallet
2. Navigate to "Proposals"
3. Click on any proposal to view details
4. Review voting statistics
```

### Workflow 2: Create a Proposal

```
1. Connect wallet (must have KWAMI NFT + 100 QWAMI)
2. Navigate to "Create"
3. Fill in:
   - Title (10-100 chars)
   - Description (50-2000 chars)
   - QWAMI stake (min 100)
   - Voting period (3-14 days)
4. Preview and submit
5. Approve transaction in wallet
```

### Workflow 3: Vote on a Proposal

```
1. Connect wallet (must have KWAMI NFT + QWAMI)
2. Open a proposal
3. Enter QWAMI amount to vote with
4. Choose: For / Against / Abstain
5. Click vote button
6. Approve transaction in wallet
```

## Testing with Devnet

### Get Devnet SOL

```bash
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet
```

Or use the [Solana Faucet](https://faucet.solana.com/)

### Deploy Test Programs

If you want to test with real on-chain data:

1. Deploy KWAMI NFT program:
   ```bash
   cd ../solana/anchor/kwami-nft
   anchor build
   anchor deploy --provider.cluster devnet
   ```

2. Deploy QWAMI token:
   ```bash
   cd ../solana/anchor/qwami-token
   anchor build
   anchor deploy --provider.cluster devnet
   ```

3. Update `.env` with deployed program IDs

### Mint Test KWAMI NFT

```bash
# Navigate to candy machine
cd ../candy

# Start the minting app
npm run dev

# Open http://localhost:3000 and mint a KWAMI
```

## Troubleshooting

### Issue: Wallet won't connect

**Solution**:
1. Ensure wallet extension is installed
2. Refresh the page
3. Check browser console for errors
4. Try a different wallet

### Issue: NFT not detected

**Solution**:
1. Verify NFT is in connected wallet
2. Check `NUXT_PUBLIC_KWAMI_COLLECTION_ADDRESS` is correct
3. Wait a moment for blockchain sync
4. Click refresh button on NFT verification card

### Issue: QWAMI balance shows 0

**Solution**:
1. Verify `NUXT_PUBLIC_QWAMI_TOKEN_MINT` is correct
2. Check you have QWAMI tokens in your wallet
3. Click refresh button on balance card
4. Check network (devnet vs mainnet)

### Issue: Can't create proposal

**Solution**:
1. Ensure you have at least 100 QWAMI
2. Verify you own a KWAMI NFT
3. Check your wallet is connected
4. Ensure you have SOL for transaction fees

### Issue: Vote transaction fails

**Solution**:
1. Ensure sufficient SOL for fees (~0.001 SOL)
2. Check QWAMI amount is within your balance
3. Verify network connection
4. Try reducing vote amount

### Issue: Page is blank or white screen

**Solution**:
1. Check browser console for errors
2. Ensure all dependencies are installed
3. Clear browser cache
4. Restart dev server
5. Check `nuxt.config.ts` is correct

## Development Tips

### Hot Reload

The dev server supports hot module replacement. Changes to:
- Components auto-reload
- Pages auto-reload
- Stores auto-reload
- Styles auto-reload

### Browser Console

Open browser DevTools (F12) to see:
- Wallet connection logs
- Transaction confirmations
- Error messages
- Store state changes

### Network Tab

Monitor blockchain requests:
1. Open DevTools Network tab
2. Filter by "devnet.solana.com" or your RPC
3. See all blockchain calls in real-time

### Vue DevTools

Install Vue DevTools browser extension to:
- Inspect component tree
- Debug Pinia stores
- Track reactivity
- Profile performance

## Next Steps

1. **Customize**: Modify components, styles, and layouts
2. **Integrate**: Connect to real on-chain governance programs
3. **Extend**: Add new features like delegation, analytics
4. **Deploy**: Build for production and deploy to hosting

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run typecheck        # Type checking

# Cleanup
rm -rf .nuxt node_modules  # Clean install
npm install              # Reinstall dependencies
```

## Resources

- **Nuxt Docs**: https://nuxt.com/docs
- **Solana Docs**: https://docs.solana.com/
- **Solana Wallets Vue**: https://github.com/lorisleiva/solana-wallets-vue
- **Metaplex Docs**: https://docs.metaplex.com/

## Getting Help

If you encounter issues:

1. Check the [README.md](./README.md) for detailed docs
2. Review [Troubleshooting](#troubleshooting) section
3. Check browser console for errors
4. Open an issue on GitHub
5. Join KWAMI community for support

---

**Happy Governing! 🏛️**

*Remember: This is a DAO - decisions are made by the community!*

