# 🚀 Candy Machine Deployment Guide

Complete guide for deploying the KWAMI Candy Machine to Solana blockchain.

## 📋 Prerequisites

### Required Tools

1. **Bun** (v1.0.0+)
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Rust & Cargo**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

3. **Solana CLI**
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   ```

4. **Anchor CLI** (v0.29.0+)
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli
   ```

## 🐳 Docker Deployment

The candy machine includes Docker support for containerized deployment.

### Available Dockerfiles

- `candy/docker/Dockerfile` - Standard Node.js deployment
- `candy/docker/Dockerfile.bun` - Bun runtime deployment (faster)
- `candy/docker/Dockerfile.deno` - Deno runtime deployment

### Build Docker Image

```bash
# Using Node.js (default)
docker build -t kwami-candy -f candy/docker/Dockerfile candy/

# Using Bun (recommended for faster builds)
docker build -t kwami-candy -f candy/docker/Dockerfile.bun candy/

# Using Deno
docker build -t kwami-candy -f candy/docker/Dockerfile.deno candy/
```

### Run Docker Container

```bash
docker run -p 3000:3000 \
  -e NUXT_PUBLIC_SOLANA_NETWORK=devnet \
  -e NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com \
  -e NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=your_program_id \
  -e NUXT_PUBLIC_QWAMI_TOKEN_PROGRAM_ID=your_token_program \
  kwami-candy
```

### Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  candy:
    build:
      context: ./candy
      dockerfile: docker/Dockerfile.bun
    ports:
      - "3000:3000"
    environment:
      - NUXT_PUBLIC_SOLANA_NETWORK=devnet
      - NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
      - NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=${KWAMI_NFT_PROGRAM_ID}
      - NUXT_PUBLIC_QWAMI_TOKEN_PROGRAM_ID=${QWAMI_TOKEN_PROGRAM_ID}
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

### Verify Installation

```bash
bun --version
cargo --version
solana --version
anchor --version
```

## 🔧 Setup

### 1. Install Dependencies

```bash
cd candy
bun install
```

### 2. Configure Solana Wallet

```bash
# Generate new wallet (or use existing)
solana-keygen new -o ~/.config/solana/id.json

# Set to devnet
solana config set --url devnet

# Check wallet address
solana address

# Fund wallet on devnet
solana airdrop 2
solana balance
```

## 🏗️ Build Anchor Programs

### Build Both Programs

```bash
bun run anchor:build
```

This will:
- Clean previous builds
- Build QWAMI Token program
- Build KWAMI NFT program
- Display program IDs

**Expected Output:**
```
✅ QWAMI Token Program built successfully
Program ID: <qwami-program-id>

✅ KWAMI NFT Program built successfully
Program ID: <kwami-program-id>
```

### Update Program IDs

After building, you'll get program IDs. Update them in the Rust code:

1. Edit `solana/anchor/qwami/programs/qwami-token/src/lib.rs`:
   ```rust
   declare_id!("<your-qwami-program-id>");
   ```

2. Edit `solana/anchor/kwami/programs/kwami-nft/src/lib.rs`:
   ```rust
   declare_id!("<your-kwami-program-id>");
   ```

3. Rebuild after updating IDs:
   ```bash
   bun run anchor:build
   ```

## 🧪 Test Programs

```bash
bun run anchor:test
```

This will:
- Spin up local test validator
- Run all Anchor tests
- Verify program functionality

## 🚀 Deploy to Devnet

### Deploy Programs

```bash
bun run anchor:deploy
```

This will:
- Deploy QWAMI Token program
- Deploy KWAMI NFT program
- Copy IDL files to `public/idl/`
- Display program IDs

**Important:** Save the program IDs from the output!

### Update Environment Variables

Create `candy/.env` file:

```bash
# Solana Configuration
NUXT_PUBLIC_SOLANA_NETWORK=devnet
NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Program IDs (from deployment output)
NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=<your-kwami-program-id>
NUXT_PUBLIC_QWAMI_TOKEN_PROGRAM_ID=<your-qwami-program-id>

# Arweave Configuration
NUXT_PUBLIC_ARWEAVE_GATEWAY=https://arweave.net
```

## 🔄 Initialize Programs

After deployment, you need to initialize the programs:

### Initialize QWAMI Token

```bash
# Navigate to qwami directory
cd ../solana/anchor/qwami

# Run initialization (adjust for your setup)
anchor run initialize
```

### Initialize KWAMI NFT

```bash
# Navigate to kwami directory
cd ../kwami

# Run initialization
anchor run initialize
```

**Note:** You may need to create initialization scripts in each Anchor project's `migrations/` directory.

## 🌐 Start Development Server

```bash
cd candy
bun run dev
```

Visit `http://localhost:3000` to test the candy machine!

## ✅ Testing Checklist

- [ ] Programs build successfully
- [ ] Tests pass
- [ ] Programs deployed to devnet
- [ ] Program IDs updated in .env
- [ ] IDL files copied to public/idl/
- [ ] Development server starts
- [ ] Wallet connects (Phantom)
- [ ] 3D blob renders
- [ ] DNA generates correctly
- [ ] Mock minting works (before real deployment)
- [ ] Real minting works (after real deployment)

## 🔍 Troubleshooting

### Build Errors

**Problem:** Anchor build fails with dependency errors

**Solution:**
```bash
cd solana/anchor/kwami  # or qwami
cargo clean
anchor clean
anchor build
```

### Deployment Fails

**Problem:** "Insufficient funds" error

**Solution:**
```bash
# Check balance
solana balance

# Request more SOL on devnet
solana airdrop 2
```

**Problem:** "Program already deployed"

**Solution:**
```bash
# Use upgrade instead of deploy
anchor upgrade target/deploy/kwami_nft.so --program-id <program-id>
```

### RPC Connection Issues

**Problem:** Devnet RPC is slow or timing out

**Solution:** Use a custom RPC endpoint

1. Get free API key from:
   - [Helius](https://helius.dev)
   - [QuickNode](https://quicknode.com)
   - [Alchemy](https://alchemy.com)

2. Update `.env`:
   ```bash
   NUXT_PUBLIC_SOLANA_RPC_URL=https://your-rpc-endpoint
   ```

### Program Not Found

**Problem:** "Program not found" error in frontend

**Solution:**
1. Verify program IDs in `.env` match deployed programs
2. Check IDL files are in `public/idl/`
3. Restart development server

## 🎯 Deploy to Mainnet

**⚠️ WARNING: Mainnet deployment requires real SOL and is permanent!**

### Preparation

1. **Audit Smart Contracts**
   - Get professional security audit
   - Review all code thoroughly
   - Test extensively on devnet

2. **Fund Mainnet Wallet**
   ```bash
   # Switch to mainnet
   solana config set --url mainnet-beta
   
   # Check address
   solana address
   
   # Transfer SOL to this address
   ```

3. **Update Configuration**
   ```bash
   # In candy/.env
   NUXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
   NUXT_PUBLIC_SOLANA_RPC_URL=<mainnet-rpc-url>
   ```

### Deploy

```bash
# Deploy to mainnet
bun run anchor:deploy:mainnet
```

### Post-Deployment

1. Update program IDs in `.env`
2. Initialize programs on mainnet
3. Test thoroughly with small amounts
4. Monitor transactions and logs
5. Have emergency shutdown plan

## 📊 Monitoring

### Check Program Status

```bash
# Get program info
solana program show <program-id>

# Get account info
solana account <account-address>
```

### View Transactions

- **Devnet:** https://explorer.solana.com/?cluster=devnet
- **Mainnet:** https://explorer.solana.com/

## 🆘 Support

### Resources

- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Documentation](https://docs.solana.com/)
- [Metaplex Documentation](https://docs.metaplex.com/)

### Common Issues

See [ENV_SETUP.md](./ENV_SETUP.md) for environment setup troubleshooting.

## 📝 Notes

- Always test on devnet first
- Keep private keys secure
- Never commit `.env` files
- Monitor wallet balance during deployment
- Save all program IDs and transaction signatures

## 🎉 Success!

Once deployed and tested, your candy machine is ready for minting KWAMIs!

**Next Steps:**
- Test full minting flow
- Monitor for errors
- Gather user feedback
- Iterate and improve

---

**Built with ❤️ using Solana, Anchor, and Nuxt**

**LFG! 🚀**

