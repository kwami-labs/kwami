# 🌈 KWAMI Ecosystem - Solana Programs

**A next-generation NFT ecosystem with integrated tokenomics on Solana**

[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?logo=solana)](https://explorer.solana.com/?cluster=devnet)
[![Anchor](https://img.shields.io/badge/Anchor-v0.32.1-5865F2?logo=anchor)](https://www.anchor-lang.com/)
[![Solana](https://img.shields.io/badge/Solana-v2.3.0-green?logo=solana)](https://docs.solana.com/)
[![Rust](https://img.shields.io/badge/Rust-1.77+-orange?logo=rust)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📍 Current Status: ✅ **FULLY DEPLOYED ON DEVNET**

Both programs are deployed, initialized, and operational:

| Program | Status | Address |
|---------|--------|------|
| **QWAMI Token** | ✅ Live | `6CAgdgpPq8Np78LsDwREJqFPh9rM5Jh6RSS8eZ37kZuv` |
| **KWAMI NFT** | ✅ Live | `DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD` |

**Last Deployment**: December 17, 2025  
**Network**: Solana Devnet  
**Wallet**: `3TYRKswBCUy8agGNBF3wpg4AoiahZWKBKJB3ZJhybscf`

---

## 🎯 What is KWAMI?

KWAMI is a revolutionary NFT ecosystem that combines:
- **QWAMI Token**: Ecosystem currency with fixed $0.01 USD price
- **KWAMI NFT**: 10 billion unique NFTs releasing over 75 years (2026-2100)
- **Treasury System**: Transparent, on-chain accounting with revenue distribution
- **Economic Layer**: Complete buy/sell/mint/burn mechanics with QWAMI integration

**Vision**: One KWAMI for every person on Earth by 2100 🌍

---

## ⚡ Quick Start

### Prerequisites

```bash
# Solana CLI 2.3.0+ (required for Anchor 0.32.1)
sh -c "$(curl -sSfL https://release.anza.xyz/v2.3.0/install)"

# Anchor 0.32.1
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.32.1
avm use 0.32.1

# Node.js 18+ and npm (for initialization scripts)
# Install from https://nodejs.org/
```

### Deploy to Any Network

```bash
# Navigate to anchor directory
cd solana/anchor

# Run unified deployment script (prompts for network)
./deploy-programs.sh
# Options:
#   1) Localnet (local development)
#   2) Devnet (testing)
#   3) Testnet (testing - alternative)
#   4) Mainnet-beta (production)

# Or deploy with automatic network selection
CLUSTER=devnet ./deploy-programs.sh
CLUSTER=testnet ./deploy-programs.sh
```

The script handles:
- ✅ Prerequisites check
- ✅ Network configuration (localnet/devnet/testnet/mainnet)
- ✅ SOL balance check (airdrops for devnet/testnet if needed)
- ✅ Build both programs
- ✅ Deploy with correct program IDs
- ✅ Upload IDLs
- ✅ Initialize both programs
- ✅ Save deployment addresses

### Initialize Programs

```bash
# Initialize both programs (runs after deployment)
./initialize-programs.sh

# Or initialize individually:
cd qwami && ANCHOR_PROVIDER_URL=https://api.devnet.solana.com \
  ANCHOR_WALLET=$HOME/.config/solana/id.json \
  npx ts-node scripts/initialize-qwami.ts

cd ../kwami && ANCHOR_PROVIDER_URL=https://api.devnet.solana.com \
  ANCHOR_WALLET=$HOME/.config/solana/id.json \
  npx ts-node scripts/initialize-kwami.ts
```

### IDL Files

After building/deploying, the Interface Definition Language (IDL) files are generated at:

```
qwami/target/idl/qwami_token.json   # QWAMI Token IDL
kwami/target/idl/kwami_nft.json     # KWAMI NFT IDL
```

These IDL files are:
- 📄 **Auto-generated** during `anchor build`
- ☁️ **Uploaded on-chain** during deployment (for client queries)
- 📚 **Used by TypeScript clients** (see `candy/src/types/`)
- 🔗 **Contains all program interfaces** (instructions, accounts, errors)

To copy IDLs to your frontend:
```bash
# Copy to candy app types
cp qwami/target/idl/qwami_token.json ../../../candy/src/types/
cp kwami/target/idl/kwami_nft.json ../../../candy/src/types/
```

---

## 📦 Deployment Artifacts

The deployment scripts generate several types of artifacts to track deployment state across networks.

### Directory Structure

```
solana/anchor/
├── logs/                                           # Deployment logs (gitignored)
│   ├── deployment-localnet-YYYYMMDD-HHMMSS.log
│   ├── deployment-devnet-YYYYMMDD-HHMMSS.log
│   ├── deployment-testnet-YYYYMMDD-HHMMSS.log
│   └── deployment-mainnet-YYYYMMDD-HHMMSS.log
├── deployments/                                    # Deployment summaries (gitignored)
│   ├── localnet-deployment-YYYYMMDD-HHMMSS.json
│   ├── localnet-latest.json
│   ├── devnet-deployment-YYYYMMDD-HHMMSS.json
│   ├── devnet-latest.json
│   ├── testnet-deployment-YYYYMMDD-HHMMSS.json
│   ├── testnet-latest.json
│   ├── mainnet-deployment-YYYYMMDD-HHMMSS.json
│   └── mainnet-latest.json
├── qwami/                                          # QWAMI addresses (committed)
│   ├── localnet-addresses.json
│   ├── devnet-addresses.json
│   ├── testnet-addresses.json
│   └── mainnet-addresses.json
└── kwami/                                          # KWAMI addresses (committed)
    ├── localnet-addresses.json
    ├── devnet-addresses.json
    ├── testnet-addresses.json
    └── mainnet-addresses.json
```

### Artifact Types

#### 1. Deployment Logs (`logs/`)

**Purpose**: Complete console output of each deployment  
**Format**: `deployment-{cluster}-YYYYMMDD-HHMMSS.log`  
**Content**: Full transcript including commands, output, errors, warnings, and timestamps

```bash
# View latest devnet log
tail -f logs/deployment-devnet-*.log

# Search for errors
grep -i error logs/deployment-devnet-*.log

# List all logs for a cluster
ls -lth logs/deployment-devnet-*.log
```

#### 2. Deployment Summaries (`deployments/`)

**Purpose**: Structured JSON summary of deployment state  
**Format**: `{cluster}-deployment-YYYYMMDD-HHMMSS.json`

**Example**:
```json
{
  "cluster": "devnet",
  "timestamp": "2025-12-17T19:36:40Z",
  "deployer": "3TYRKswBCUy8agGNBF3wpg4AoiahZWKBKJB3ZJhybscf",
  "balance": "4.84554944",
  "programs": {
    "qwami": {
      "programId": "6CAgdgpPq8Np78LsDwREJqFPh9rM5Jh6RSS8eZ37kZuv",
      "explorer": "https://explorer.solana.com/address/6CAgdgpPq8Np78LsDwREJqFPh9rM5Jh6RSS8eZ37kZuv?cluster=devnet",
      "initialized": true
    },
    "kwami": {
      "programId": "DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD",
      "explorer": "https://explorer.solana.com/address/DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD?cluster=devnet",
      "initialized": true
    }
  },
  "configuration": {
    "usdcMint": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    "clusterUrl": "https://api.devnet.solana.com"
  }
}
```

```bash
# View latest deployment
cat deployments/devnet-latest.json | jq

# Get program IDs
jq -r '.programs.qwami.programId' deployments/devnet-latest.json
jq -r '.programs.kwami.programId' deployments/devnet-latest.json

# Check initialization status
jq -r '.programs.qwami.initialized' deployments/devnet-latest.json
```

#### 3. Program Addresses (`{program}/{cluster}-addresses.json`)

**Purpose**: Detailed addresses for each program per cluster  
**Content**: All PDAs, mints, vaults, and transaction details  
**Status**: Committed to git (represents canonical deployment state)

**QWAMI Example**:
```json
{
  "programId": "6CAgdgpPq8Np78LsDwREJqFPh9rM5Jh6RSS8eZ37kZuv",
  "qwamiMint": "61rRyR9ey3AtZs9Z7r4t3JUnoWVDry7pfrWtWgiWpiK7",
  "tokenAuthority": "7FQ83JWrngSSY5U7TtM6Wf6LAiDmutJb67jjDj5kfX82",
  "treasury": "3odgxpVSjL5YFVM3YxPYqBz3stzZ4B1NKa1aYPqQuows",
  "usdcVault": "HV7TVgabJf2SLyLSMrQVAzPA7RegXJRARtCkryxDrKUR",
  "usdcMint": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
  "cluster": "devnet",
  "timestamp": "2025-12-17T19:08:00.018Z"
}
```

**KWAMI Example**:
```json
{
  "programId": "DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD",
  "collectionMint": "CzNuMseUFbpXNDLEKWEtrD3snXhNdZiGMn1rFFjjGvj6",
  "collectionAuthority": "BVcKkTjKZ6V9rEebDKaYLgArnvPPfBEmCCTWSZGEqxEX",
  "dnaRegistry": "6H4VUE7uLxosPBeu8GsTb2TgqnykbkWDkLcApGgpr4cL",
  "treasury": "7mfcbavtJ7u8xSv8xRAgTnCosrRiASH1dighXk529r3D",
  "qwamiVault": "7BQkRbZ9Htqhvn2Z2Zeh3bktuwYE8CrkCZSivB7sp4j3",
  "qwamiMint": "61rRyR9ey3AtZs9Z7r4t3JUnoWVDry7pfrWtWgiWpiK7",
  "cluster": "devnet",
  "timestamp": "2025-12-17T19:32:09.782Z"
}
```

```bash
# View addresses for specific cluster
cat qwami/devnet-addresses.json | jq
cat kwami/testnet-addresses.json | jq

# Get specific values
jq -r '.programId' qwami/devnet-addresses.json
jq -r '.collectionMint' kwami/devnet-addresses.json

# Compare across clusters
echo "Localnet: $(jq -r '.programId' qwami/localnet-addresses.json 2>/dev/null || echo 'Not deployed')"
echo "Devnet:   $(jq -r '.programId' qwami/devnet-addresses.json 2>/dev/null || echo 'Not deployed')"
echo "Testnet:  $(jq -r '.programId' qwami/testnet-addresses.json 2>/dev/null || echo 'Not deployed')"
echo "Mainnet:  $(jq -r '.programId' qwami/mainnet-addresses.json 2>/dev/null || echo 'Not deployed')"
```

### Git Strategy

**Committed Files** (✅ Tracked in git):
- `qwami/{cluster}-addresses.json` - Canonical deployment state
- `kwami/{cluster}-addresses.json` - Canonical deployment state

**Gitignored Files** (❌ Not tracked):
- `logs/` - Large, temporary, developer-specific
- `deployments/` - Can be regenerated from address files

**Rationale**: Address files are small, critical for scripts, and represent the source of truth for deployment state.

### Multi-Cluster Workflow

```bash
# Deploy to localnet (development)
./deploy-programs.sh  # Select: 1) Localnet

# Deploy to devnet (testing)
./deploy-programs.sh  # Select: 2) Devnet

# Deploy to testnet (testing alternative)
./deploy-programs.sh  # Select: 3) Testnet

# Deploy to mainnet (production)
./deploy-programs.sh  # Select: 4) Mainnet

# Check deployment status across all clusters
for cluster in localnet devnet testnet mainnet; do
  echo "=== $cluster ==="
  jq -r '.programId' qwami/${cluster}-addresses.json 2>/dev/null || echo "Not deployed"
done

# Switch Solana CLI between clusters
solana config set --url devnet
solana config set --url testnet
solana config set --url mainnet-beta
solana config set --url http://localhost:8899  # localnet
```

### Explorer Links

```bash
# Generate explorer link for any cluster
CLUSTER="devnet"
PROGRAM_ID=$(jq -r '.programId' qwami/${CLUSTER}-addresses.json)
echo "https://explorer.solana.com/address/${PROGRAM_ID}?cluster=${CLUSTER}"

# Open collection mint on explorer
COLLECTION=$(jq -r '.collectionMint' kwami/devnet-addresses.json)
echo "https://explorer.solana.com/address/${COLLECTION}?cluster=devnet"
```

### Cleanup Old Artifacts

```bash
# Keep only last 10 logs per cluster
cd logs && ls -t deployment-devnet-*.log | tail -n +11 | xargs rm -f
cd logs && ls -t deployment-testnet-*.log | tail -n +11 | xargs rm -f

# Keep only last 5 deployment summaries per cluster
cd deployments && ls -t devnet-deployment-*.json | tail -n +6 | xargs rm -f
cd deployments && ls -t testnet-deployment-*.json | tail -n +6 | xargs rm -f

# Clean all localnet artifacts (development only)
rm -f logs/deployment-localnet-*.log
rm -f deployments/localnet-deployment-*.json
```

---

## 🏭 Architecture

### Program Overview

```
┌─────────────────────────────────────────────────────────┐
│                    KWAMI Ecosystem                      │
├─────────────────────┬───────────────────────────────────┤
│   QWAMI Token       │         KWAMI NFT                 │
│   (Currency)        │         (Collection)              │
├─────────────────────┼───────────────────────────────────┤
│ • Mint/Burn         │ • Mint with DNA validation        │
│ • SOL Exchange      │ • Burn with 50% refund            │
│ • USDC Exchange     │ • Generational supply caps        │
│ • Treasury          │ • QWAMI payment required          │
│ • Fixed $0.01 price │ • 80/20 revenue distribution      │
└─────────────────────┴───────────────────────────────────┘
```

### 1. QWAMI Token Program

**Location**: `qwami/programs/qwami-token/`  
**Program ID**: `6CAgdgpPq8Np78LsDwREJqFPh9rM5Jh6RSS8eZ37kZuv`  
**Mint Address**: `61rRyR9ey3AtZs9Z7r4t3JUnoWVDry7pfrWtWgiWpiK7`

#### Features
- ✅ **Integer Token**: 0 decimals (no fractional tokens)
- ✅ **Fixed Supply**: 1 trillion maximum
- ✅ **Dual Exchange**: Mint/burn with SOL or USDC
- ✅ **Fixed Price**: $0.01 USD per token
- ✅ **Treasury Tracking**: All SOL/USDC flows tracked on-chain
- ✅ **Authority Control**: PDA-based mint authority

#### Key Instructions
```rust
// Initialize the token and treasury
initialize()

// Mint QWAMI by paying SOL
mint_with_sol(sol_lamports: u64)

// Mint QWAMI by paying USDC
mint_with_usdc(usdc_amount: u64)

// Burn QWAMI to receive SOL
burn_for_sol(qwami_amount: u64)

// Burn QWAMI to receive USDC
burn_for_usdc(qwami_amount: u64)

// Admin functions
mint_tokens(amount: u64)          // Authority only
burn_tokens(amount: u64)          // Any holder
update_base_price(new_price: u64) // Authority only
transfer_authority(new_auth: Pubkey) // Authority only
```

#### Accounts
- **TokenAuthority PDA**: `["token-authority", mint.key()]`
  - Holds mint authority
  - Tracks total minted/burned
  - Stores base price
  
- **QWAMI Treasury PDA**: `["qwami-treasury"]`
  - Tracks all SOL/USDC received and distributed
  - Tracks QWAMI mints from SOL vs USDC
  - Stores USDC vault reference

#### Deployed Addresses
```json
{
  "programId": "6CAgdgpPq8Np78LsDwREJqFPh9rM5Jh6RSS8eZ37kZuv",
  "qwamiMint": "61rRyR9ey3AtZs9Z7r4t3JUnoWVDry7pfrWtWgiWpiK7",
  "tokenAuthority": "7FQ83JWrngSSY5U7TtM6Wf6LAiDmutJb67jjDj5kfX82",
  "treasury": "3odgxpVSjL5YFVM3YxPYqBz3stzZ4B1NKa1aYPqQuows",
  "usdcVault": "HV7TVgabJf2SLyLSMrQVAzPA7RegXJRARtCkryxDrKUR",
  "usdcMint": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
}
```

### 2. KWAMI NFT Program

**Location**: `kwami/programs/kwami-nft/`  
**Program ID**: `DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD`  
**Collection Mint**: `CzNuMseUFbpXNDLEKWEtrD3snXhNdZiGMn1rFFjjGvj6`

#### Features
- ✅ **10 Billion Supply**: Released over 75 years (2026-2100)
- ✅ **Generational Release**: 133.33M NFTs per year
- ✅ **DNA Validation**: Unique SHA-256 hash per NFT (on-chain registry)
- ✅ **QWAMI Payment**: All mints require QWAMI tokens
- ✅ **Burn Refund**: 50% of base minting cost returned
- ✅ **Revenue Split**: 80% dividends, 20% operations
- ✅ **Dynamic Pricing**: Decreases over generations

#### Generation Pricing

| Generation | Years | Max Supply (Cumulative) | Base Cost | + 10% Fee | + 50 QWAMI Tx Fee | Total |
|------------|-------|-------------------------|-----------|-----------|-------------------|--------|
| Gen #0 | 2026 | 133M | 10,000 | 1,000 | 50 | **11,050 QWAMI** |
| Gen #1-5 | 2027-2031 | 800M | 5,000 | 500 | 50 | **5,550 QWAMI** |
| Gen #6-20 | 2032-2046 | 2.8B | 2,500 | 250 | 50 | **2,800 QWAMI** |
| Gen #21-50 | 2047-2076 | 6.8B | 1,000 | 100 | 50 | **1,150 QWAMI** |
| Gen #51-74 | 2077-2100 | 10B | 500 | 50 | 50 | **600 QWAMI** |

**Launch Date**: January 1, 2026 00:00:00 UTC

#### Key Instructions
```rust
// Initialize NFT program, collection, and treasury
initialize()

// Mint a unique KWAMI NFT (requires QWAMI payment)
mint_kwami(
    dna_hash: [u8; 32],
    name: String,      // Max 32 chars
    symbol: String,    // Max 10 chars  
    uri: String        // Max 200 chars (Arweave)
)

// Burn NFT and receive 50% QWAMI refund
burn_kwami()

// Update NFT metadata URI
update_metadata(new_uri: String)

// Transfer NFT ownership
transfer_kwami(new_owner: Pubkey)

// Check if DNA exists
check_dna_exists(dna_hash: [u8; 32]) -> bool
```

#### Accounts
- **CollectionAuthority PDA**: `["collection-authority", collection_mint.key()]`
  - Controls collection mint authority
  - Tracks total minted count
  
- **DnaRegistry PDA**: `["dna-registry", collection_mint.key()]`
  - Stores all minted DNA hashes (starts at 76 bytes)
  - Grows dynamically: +32 bytes per NFT (via `realloc`)
  - Max capacity: 1,000 DNA hashes per registry
  
- **KwamiNft PDA**: `["kwami-nft", nft_mint.key()]`
  - Stores NFT metadata
  - Tracks original mint cost (for refunds)
  - Stores DNA hash, timestamps, URI
  
- **KwamiTreasury PDA**: `["kwami-treasury"]`
  - Tracks all QWAMI received/refunded
  - Maintains dividend pool (80%) and operations (20%)
  - Stores QWAMI vault reference

#### Deployed Addresses
```json
{
  "programId": "DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD",
  "collectionMint": "CzNuMseUFbpXNDLEKWEtrD3snXhNdZiGMn1rFFjjGvj6",
  "collectionAuthority": "BVcKkTjKZ6V9rEebDKaYLgArnvPPfBEmCCTWSZGEqxEX",
  "dnaRegistry": "6H4VUE7uLxosPBeu8GsTb2TgqnykbkWDkLcApGgpr4cL",
  "treasury": "7mfcbavtJ7u8xSv8xRAgTnCosrRiASH1dighXk529r3D",
  "qwamiVault": "7BQkRbZ9Htqhvn2Z2Zeh3bktuwYE8CrkCZSivB7sp4j3",
  "qwamiMint": "61rRyR9ey3AtZs9Z7r4t3JUnoWVDry7pfrWtWgiWpiK7"
}
```

---

## 💰 Economic Model

### QWAMI Token Economics

```
Max Supply:    1,000,000,000,000 (1 Trillion)
Decimals:      0 (integer token)
Price:         $0.01 USD (fixed)
Exchange:      Bidirectional SOL ↔ QWAMI ↔ USDC
```

**Use Cases**:
1. Mint KWAMI NFTs (primary utility)
2. Store of value (pegged to $0.01)
3. Cross-chain bridge currency (future)

### KWAMI NFT Economics

**Supply Schedule**:
- **Total Supply**: 10,000,000,000 NFTs
- **Duration**: 75 years (2026-2100)
- **Annual Release**: 133,333,333 NFTs
- **Launch**: January 1, 2026
- **Generations**: 75 (Gen #0 through Gen #74)

**Revenue Distribution**:
```
Each mint generates revenue → 100% goes to treasury

Treasury splits:
├─ 80% → Dividend Pool (for weekly holder distributions)
└─ 20% → Operations Fund (development, marketing, infrastructure)
```

**Refund Mechanism**:
- Burn any KWAMI NFT → Receive 50% of **base minting cost** in QWAMI
- Example: Gen #0 NFT cost 11,050 QWAMI → Refund = 5,000 QWAMI (50% of 10,000 base)
- Encourages turnover and DNA recycling

---

## 🔧 Technical Implementation

### DNA Registry Solution

**Problem**: Original design pre-allocated 32KB (1,000 × 32-byte hashes) which exceeded Solana's 10KB reallocation limit during initialization.

**Solution**: Dynamic allocation using Anchor's `realloc` feature:
```rust
impl DnaRegistry {
    // Start with minimal space
    pub const INITIAL_SIZE: usize = 76; // authority + collection + vec_len + count
    
    // Calculate space for N hashes
    pub fn space_for_hashes(count: usize) -> usize {
        Self::INITIAL_SIZE + (32 * count)
    }
}

// On mint: grow registry dynamically
#[account(
    mut,
    realloc = 8 + DnaRegistry::space_for_hashes(dna_registry.dna_count as usize + 1),
    realloc::payer = owner,
    realloc::zero = false,
)]
pub dna_registry: Box<Account<'info, DnaRegistry>>,
```

**Benefits**:
- ✅ Initialization succeeds (starts at 76 bytes)
- ✅ Grows incrementally (+32 bytes per mint)
- ✅ Efficient: only pays for space actually used
- ✅ Scalable: supports up to 1,000 unique DNAs per registry

### Program Upgrade Process

Both programs deployed with upgrade authority retained:
```bash
# Check upgrade authority
solana program show <PROGRAM_ID>

# Upgrade program
anchor upgrade target/deploy/program.so \
  --program-id <PROGRAM_ID> \
  --provider.cluster devnet
```

**Upgrade Authority**: `3TYRKswBCUy8agGNBF3wpg4AoiahZWKBKJB3ZJhybscf`

---

## 📁 Project Structure

```
solana/anchor/
├── qwami/                              # QWAMI Token Program
│   ├── programs/qwami-token/
│   │   ├── src/lib.rs                 # ~850 lines - Token logic
│   │   └── Cargo.toml
│   ├── scripts/
│   │   └── initialize-qwami.ts        # Initialization script
│   ├── tests/
│   │   ├── qwami-token.ts             # Basic tests
│   │   └── qwami-token-economic.ts    # Economic tests
│   ├── target/
│   │   ├── deploy/qwami_token.so      # Compiled program
│   │   ├── idl/qwami_token.json       # Interface definition
│   │   └── types/qwami_token.ts       # TypeScript types
│   ├── devnet-addresses.json          # Deployed addresses
│   ├── Anchor.toml
│   ├── Cargo.toml
│   ├── package.json
│   └── tsconfig.json
│
├── kwami/                              # KWAMI NFT Program
│   ├── programs/kwami-nft/
│   │   ├── src/lib.rs                 # ~750 lines - NFT logic
│   │   └── Cargo.toml
│   ├── scripts/
│   │   └── initialize-kwami.ts        # Initialization script
│   ├── tests/
│   │   └── kwami-nft-economic.ts      # Economic tests
│   ├── target/
│   │   ├── deploy/kwami_nft.so        # Compiled program
│   │   ├── idl/kwami_nft.json         # Interface definition
│   │   └── types/kwami_nft.ts         # TypeScript types
│   ├── devnet-addresses.json          # Deployed addresses
│   ├── Anchor.toml
│   ├── Cargo.toml
│   ├── package.json
│   └── tsconfig.json
│
├── tests/                              # Integration tests
│   ├── advanced-economic-scenarios.ts
│   ├── integration-full-journey.ts
│   ├── multi-user-scenarios.ts
│   └── security-and-edge-cases.ts
│
├── deploy-programs.sh                  # Unified deployment script
├── initialize-programs.sh              # Initialization script
├── install-dependencies.sh             # Installs Solana/Anchor/Rust
├── rust-toolchain.toml                # Rust 1.77.0 (required)
├── Anchor.toml                        # Workspace config
├── Cargo.toml                         # Workspace dependencies
└── README.md                          # This file
```

---

## 🧪 Testing

### Test Suites

1. **Unit Tests** (Run with `anchor test`)
   - `qwami/tests/qwami-token.ts` - Token operations
   - `qwami/tests/qwami-token-economic.ts` - Economic features
   - `kwami/tests/kwami-nft-economic.ts` - NFT economic features

2. **Integration Tests**
   - `tests/advanced-economic-scenarios.ts` - Complex scenarios
   - `tests/integration-full-journey.ts` - End-to-end user flows
   - `tests/multi-user-scenarios.ts` - Concurrent operations
   - `tests/security-and-edge-cases.ts` - Security testing

### Running Tests

```bash
# Install dependencies
cd qwami && npm install
cd ../kwami && npm install

# Run unit tests
cd qwami && anchor test
cd ../kwami && anchor test

# Run integration tests
cd .. && anchor test

# Test on devnet (after deployment)
cd qwami && ANCHOR_PROVIDER_URL=https://api.devnet.solana.com \
  ANCHOR_WALLET=$HOME/.config/solana/id.json \
  anchor test --skip-local-validator
```

---

## 🚀 Deployment Guide

### Complete Deployment Process

```bash
# 1. Install dependencies (one-time setup)
./install-dependencies.sh

# 2. Configure for devnet
solana config set --url devnet
solana airdrop 2  # Get test SOL

# 3. Deploy programs
./deploy-programs.sh
# Select: 2) Devnet

# 4. Verify deployment
solana program show 6CAgdgpPq8Np78LsDwREJqFPh9rM5Jh6RSS8eZ37kZuv  # QWAMI
solana program show DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD  # KWAMI

# 5. View on explorer
# QWAMI: https://explorer.solana.com/address/6CAgdgpPq8Np78LsDwREJqFPh9rM5Jh6RSS8eZ37kZuv?cluster=devnet
# KWAMI: https://explorer.solana.com/address/DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD?cluster=devnet
```

### Network Selection

The deployment script supports three networks:
1. **Localnet** - Local validator (testing)
2. **Devnet** - Solana devnet (current)
3. **Mainnet** - Production (requires double confirmation)

```bash
./deploy-programs.sh
# Select network when prompted
```

### Manual Build & Deploy

```bash
# Build programs
cd qwami && anchor build
cd ../kwami && anchor build

# Deploy to devnet
cd qwami && anchor deploy --provider.cluster devnet
cd ../kwami && anchor deploy --provider.cluster devnet

# Upload IDLs
cd qwami && anchor idl init --filepath target/idl/qwami_token.json \
  6CAgdgpPq8Np78LsDwREJqFPh9rM5Jh6RSS8eZ37kZuv --provider.cluster devnet

cd ../kwami && anchor idl init --filepath target/idl/kwami_nft.json \
  DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD --provider.cluster devnet

# Initialize
./initialize-programs.sh
```

---

## 🔐 Security

### Implemented Security Features

- ✅ **PDA-based authorities**: No private keys for program authorities
- ✅ **Account validation**: All accounts validated with constraints
- ✅ **Overflow protection**: Safe math operations throughout
- ✅ **Supply caps**: Generation-based and absolute supply limits
- ✅ **DNA uniqueness**: On-chain registry prevents duplicates
- ✅ **Authority checks**: All admin functions require authority signature
- ✅ **Balance tracking**: Complete treasury accounting

### Known Limitations

- ⚠️ DNA Registry: Limited to 1,000 unique NFTs per registry (design decision for MVP)
- ⚠️ No rate limiting: Relies on Solana's built-in rate limiting
- ⚠️ No pausability: Programs cannot be paused (requires upgrade)

### Pre-Mainnet Requirements

- [ ] Professional security audit
- [ ] Penetration testing
- [ ] Economic attack simulation
- [ ] Stress testing at scale
- [ ] Multi-sig upgrade authority
- [ ] Bug bounty program

---

## 📊 Performance

### Benchmarks (Devnet)

| Operation | Avg Time | Gas Cost |
|-----------|----------|----------|
| QWAMI mint (SOL) | ~400ms | ~0.00005 SOL |
| QWAMI burn (SOL) | ~350ms | ~0.00005 SOL |
| KWAMI mint | ~500ms | ~0.0001 SOL + QWAMI cost |
| KWAMI burn | ~450ms | ~0.00008 SOL |
| DNA check | ~50ms | ~0.00001 SOL |
| Treasury query | ~20ms | Free (read-only) |

### Scalability

- **Max TPS**: Limited by Solana (65,000 TPS theoretical)
- **Account growth**: DNA Registry grows linearly (+32 bytes/NFT)
- **Storage costs**: ~0.001 SOL per NFT for account rent

---

## 📝 Scripts Reference

### Deployment Scripts

- **`deploy-programs.sh`**: Unified deployment script
  - Network selection (localnet/devnet/mainnet)
  - Builds both programs
  - Deploys with correct IDs
  - Uploads IDLs
  - Safety confirmations for mainnet

- **`initialize-programs.sh`**: Initialize both programs
  - Runs after deployment
  - Creates mints and token accounts
  - Initializes all PDAs
  - Saves addresses to JSON files

- **`install-dependencies.sh`**: One-time setup
  - Installs Solana CLI
  - Installs Anchor
  - Installs Rust toolchain

### Initialization Scripts

- **`qwami/scripts/initialize-qwami.ts`**:
  - Creates QWAMI mint
  - Creates USDC vault
  - Initializes token authority PDA
  - Initializes treasury PDA

- **`kwami/scripts/initialize-kwami.ts`**:
  - Creates collection mint
  - Creates QWAMI vault
  - Initializes collection authority PDA
  - Initializes DNA registry PDA (minimal size)
  - Initializes treasury PDA

---

## 🌐 Network Information

### Devnet (Current)

```bash
RPC: https://api.devnet.solana.com
Explorer: https://explorer.solana.com/?cluster=devnet
USDC Mint: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

QWAMI Program: 6CAgdgpPq8Np78LsDwREJqFPh9rM5Jh6RSS8eZ37kZuv
KWAMI Program: DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD
```

### Mainnet (Future)

```bash
RPC: https://api.mainnet-beta.solana.com
Explorer: https://explorer.solana.com/
USDC Mint: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Mainnet deployment pending security audit
```

---

## 🛠️ Development

### Prerequisites

```bash
# Rust 1.77+ (exact version in rust-toolchain.toml)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Solana CLI 2.3.0 (required for Anchor 0.32.1)
sh -c "$(curl -sSfL https://release.anza.xyz/v2.3.0/install)"

# Anchor 0.32.1
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.32.1
avm use 0.32.1

# Node.js 18+ and npm
# Download from https://nodejs.org/
```

### Environment Setup

```bash
# Configure Solana CLI
solana config set --url devnet
solana-keygen new  # Create keypair if you don't have one

# Get devnet SOL
solana airdrop 2

# Verify setup
solana --version   # Should be 2.3.0+
anchor --version   # Should be 0.32.1
rustc --version    # Should be 1.77+
```

### Building

```bash
# Build everything
anchor build

# Build specific program
cd qwami && anchor build
cd kwami && anchor build

# Clean build
anchor clean && anchor build
```

### Local Testing

```bash
# Start local validator (separate terminal)
solana-test-validator

# Run tests against local validator
anchor test

# Run specific test file
anchor test tests/qwami-token.ts
```

---

## 📞 Support & Resources

### Documentation

- **Solana**: https://docs.solana.com/
- **Anchor**: https://www.anchor-lang.com/
- **SPL Token**: https://spl.solana.com/token

### Explorer Links

- **QWAMI Token**: https://explorer.solana.com/address/6CAgdgpPq8Np78LsDwREJqFPh9rM5Jh6RSS8eZ37kZuv?cluster=devnet
- **KWAMI NFT**: https://explorer.solana.com/address/DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD?cluster=devnet
- **QWAMI Mint**: https://explorer.solana.com/address/61rRyR9ey3AtZs9Z7r4t3JUnoWVDry7pfrWtWgiWpiK7?cluster=devnet
- **KWAMI Collection**: https://explorer.solana.com/address/CzNuMseUFbpXNDLEKWEtrD3snXhNdZiGMn1rFFjjGvj6?cluster=devnet

### Troubleshooting

**Build Errors**:
```bash
# Clean and rebuild
anchor clean && anchor build

# Check Rust version
rustc --version  # Must be 1.77+

# Check Solana version
solana --version  # Must be 2.3.0+

# Check Anchor version
anchor --version  # Must be 0.32.1
```

**Deployment Errors**:
```bash
# Check balance
solana balance

# Request airdrop (devnet only)
solana airdrop 2

# Check network
solana config get

# View program info
solana program show <PROGRAM_ID>
```

---

## 📜 License

MIT License - See LICENSE file for details

---

## 🎉 Status

✅ **Programs**: Deployed and initialized on devnet  
✅ **Testing**: Integration tests passing  
✅ **Documentation**: Complete and up-to-date  
✅ **Security**: Basic security features implemented  

**Next Steps**:
1. Extended testing on devnet
2. Community feedback
3. Security audit preparation
4. Mainnet deployment planning

---

**Built with ❤️ using Rust, Anchor, and Solana**

**Last Updated**: December 17, 2025  
**Version**: 0.1.0  
**Network**: Devnet

