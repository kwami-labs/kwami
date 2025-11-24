# 🛠️ Solana Development Environment Setup

This guide walks you through setting up the Solana development environment for building and deploying the Quami Kwami NFT and QWAMI token programs.

## Prerequisites

- Ubuntu/Linux OS
- Basic terminal knowledge
- Internet connection

## 📦 Installation Steps

### 1. Install Rust and Cargo

Rust is required for building Solana programs using Anchor Framework.

```bash
# Install Rust using rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Follow the prompts and select default installation (option 1)
# Then source your environment
source $HOME/.cargo/env

# Verify installation
rustc --version
cargo --version
```

Expected output:
```
rustc 1.75.0 (or newer)
cargo 1.75.0 (or newer)
```

### 2. Install Solana CLI

The Solana command-line tool is essential for deploying and managing Solana programs.

```bash
# Download and install Solana CLI (v1.18.x or newer)
sh -c "$(curl -sSfL https://release.solana.com/v1.18.8/install)"

# Add Solana to PATH (add this to ~/.bashrc or ~/.zshrc)
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Reload shell configuration
source ~/.bashrc  # or source ~/.zshrc

# Verify installation
solana --version
```

Expected output:
```
solana-cli 1.18.8 (or newer)
```

### 3. Install Anchor Framework

Anchor is a framework for Solana smart contract development that simplifies the process.

```bash
# Install Anchor version manager (avm)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install latest Anchor version (0.29.0+)
avm install latest
avm use latest

# Verify installation
anchor --version
```

Expected output:
```
anchor-cli 0.29.0 (or newer)
```

### 4. Install Node.js Dependencies

Additional required packages for working with Solana from Node.js:

```bash
# Navigate to project root
cd /home/quantium/labs/quami

# Install required packages (using your preferred package manager)
bun add @coral-xyz/anchor @metaplex-foundation/js @metaplex-foundation/mpl-token-metadata @solana/spl-token bs58 crypto-js

# Or using npm
# npm install @coral-xyz/anchor @metaplex-foundation/js @metaplex-foundation/mpl-token-metadata @solana/spl-token bs58 crypto-js
```

## ⚙️ Solana CLI Configuration

### Configure for Devnet

For development and testing, we'll use Solana's devnet:

```bash
# Set cluster to devnet
solana config set --url https://api.devnet.solana.com

# Verify configuration
solana config get
```

Expected output should show:
```
Config File: ~/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/
Keypair Path: ~/.config/solana/id.json
Commitment: confirmed
```

### Create Development Wallets

#### Create Main Deployment Wallet

```bash
# Generate new keypair for deployment
solana-keygen new --outfile ~/.config/solana/id.json

# IMPORTANT: Save the seed phrase in a secure location!

# Get your wallet address
solana address
```

#### Fund Devnet Wallet

```bash
# Request airdrop (2 SOL at a time, max ~5 SOL per request)
solana airdrop 2

# Check balance
solana balance

# You can request multiple airdrops
solana airdrop 2
solana airdrop 2
```

**Note:** Devnet has rate limits. If airdrops fail, wait a few minutes or use the [Solana Devnet Faucet](https://faucet.solana.com/).

#### Create Program Authority Wallet (Optional)

For production, you may want separate wallets:

```bash
# Create authority wallet
solana-keygen new --outfile ~/.config/solana/authority.json

# Fund it
solana airdrop 2 $(solana-keygen pubkey ~/.config/solana/authority.json)
```

## 🔐 Environment Configuration

Update your `.env` file with Solana-specific variables:

```bash
# Copy the sample file if not already done
cp .env.sample .env
```

Add these variables to `.env`:

```env
# Solana Configuration
NUXT_PUBLIC_SOLANA_NETWORK=devnet
NUXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NUXT_SOLANA_WALLET_PRIVATE_KEY=your_base58_private_key_here

# QWAMI Token (will be set after deployment)
NUXT_PUBLIC_QWAMI_TOKEN_MINT=
NUXT_PUBLIC_QWAMI_TOKEN_AUTHORITY=

# Kwami NFT Program (will be set after deployment)
NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=
NUXT_PUBLIC_KWAMI_COLLECTION_MINT=

# Metaplex/Arweave
NUXT_ARWEAVE_WALLET=
```

## 🚀 Quick Start Verification

Test that everything is set up correctly:

```bash
# Check all installations
echo "=== Rust ==="
rustc --version
cargo --version

echo "=== Solana CLI ==="
solana --version
solana config get

echo "=== Anchor ==="
anchor --version

echo "=== Wallet Balance ==="
solana balance

echo "=== Node Packages ==="
cd /home/quantium/labs/quami
bun list | grep -E "@coral-xyz|@metaplex|@solana/spl-token"
```

## 📚 Next Steps

Once your environment is set up:

1. **Initialize Anchor Projects:**
   ```bash
   cd /home/quantium/labs/quami/solana/anchor
   # Projects will be created as part of development
   ```

2. **Deploy Programs:**
   - Follow `solana/anchor/qwami-token/README.md` for token deployment
   - Follow `solana/anchor/kwami-nft/README.md` for NFT program deployment

3. **Configure Metaplex:**
   - Follow `solana/metaplex/README.md` for collection setup

## 🐛 Troubleshooting

### Airdrop Failures

If you encounter rate limits:
- Wait 5-10 minutes between requests
- Use the web faucet: https://faucet.solana.com/
- Try alternative RPC endpoints

### Anchor Build Errors

```bash
# Clear Anchor cache
rm -rf target/
anchor clean

# Rebuild
anchor build
```

### Solana CLI Connection Issues

```bash
# Try alternative devnet RPC
solana config set --url https://devnet.helius-rpc.com
```

## 📖 Resources

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Book](https://www.anchor-lang.com/)
- [Metaplex Docs](https://docs.metaplex.com/)
- [Solana Cookbook](https://solanacookbook.com/)

## ⚠️ Important Notes

- **Never commit private keys** to version control
- Use `.env` files for sensitive data (already in `.gitignore`)
- Keep your seed phrases secure and backed up
- Devnet tokens have no value - use for testing only
- Before mainnet deployment, conduct thorough audits

---

**Ready to build!** Proceed to the individual program READMEs for deployment instructions.
