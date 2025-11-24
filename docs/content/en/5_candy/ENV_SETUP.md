# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the `candy/` directory with the following configuration:

```bash
# Solana Network Configuration
NUXT_PUBLIC_SOLANA_NETWORK=devnet
NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Solana Program IDs (Update after deployment)
NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=
NUXT_PUBLIC_QWAMI_TOKEN_PROGRAM_ID=

# Arweave Configuration
NUXT_PUBLIC_ARWEAVE_GATEWAY=https://arweave.net

# Optional: Custom RPC endpoint for better performance
# NUXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY

# Optional: Bundlr/Irys configuration
# NUXT_PUBLIC_BUNDLR_NODE=https://devnet.bundlr.network
# NUXT_PUBLIC_BUNDLR_CURRENCY=solana
```

## Setup Steps

### 1. Install Dependencies

```bash
cd candy
bun install
```

### 2. Deploy Anchor Programs

First, ensure you have a funded Solana wallet:

```bash
# Create a new wallet (if needed)
solana-keygen new -o ~/.config/solana/id.json

# Set to devnet
solana config set --url devnet

# Fund your wallet
solana airdrop 2

# Check balance
solana balance
```

Deploy the QWAMI token:

```bash
cd ../solana/anchor/qwami
anchor build
anchor deploy --provider.cluster devnet
# Copy the program ID from output
```

Deploy the KWAMI NFT program:

```bash
cd ../kwami
anchor build
anchor deploy --provider.cluster devnet
# Copy the program ID from output
```

### 3. Update .env File

Add the deployed program IDs to your `.env` file:

```bash
NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=<your-kwami-program-id>
NUXT_PUBLIC_QWAMI_TOKEN_PROGRAM_ID=<your-qwami-program-id>
```

### 4. Initialize Programs

Run the initialization scripts (to be created in deployment guide).

### 5. Start Development Server

```bash
cd candy
bun run dev
```

Visit `http://localhost:3000` to test the candy machine!

## Troubleshooting

### Program Build Errors

If you encounter build errors with Anchor:

```bash
# Clean and rebuild
anchor clean
anchor build

# Check Anchor version
anchor --version
# Should be 0.29.0 or higher
```

### RPC Connection Issues

If devnet RPC is slow or timing out:

1. Get a free RPC endpoint from:
   - Helius (https://helius.dev)
   - QuickNode (https://quicknode.com)
   - Alchemy (https://alchemy.com)

2. Update your `.env`:
   ```bash
   NUXT_PUBLIC_SOLANA_RPC_URL=https://your-rpc-endpoint
   ```

### Wallet Connection Issues

Make sure you have:
1. Phantom wallet installed
2. Wallet set to devnet
3. Some devnet SOL in your wallet

## Testing

```bash
# Run Anchor tests
cd solana/anchor/kwami
anchor test

cd ../qwami
anchor test
```

## Production Deployment

For mainnet deployment:

1. Change network to mainnet-beta
2. Use production RPC endpoint
3. Ensure programs are audited
4. Fund wallet with real SOL
5. Deploy with caution!

```bash
solana config set --url mainnet-beta
anchor deploy --provider.cluster mainnet
```

