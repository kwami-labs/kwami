# ⚓ Anchor Programs Development Guide

This directory contains the Anchor Framework programs for the Quami ecosystem.

## 📦 Programs Overview

### 1. QWAMI Token (`qwami-token/`)

SPL token implementation with:
- 1 trillion token supply cap
- Mint/burn functionality
- Authority-controlled operations
- Base price tracking

### 2. Kwami NFT (`kwami-nft/`)

NFT program with DNA-based uniqueness:
- On-chain DNA registry
- Unique DNA validation
- Metaplex NFT standard integration
- Metadata updates
- Burn-and-remint functionality

## 🚀 Getting Started

### Prerequisites

Ensure you have completed the setup in `../SETUP.md`:
- ✓ Rust & Cargo installed
- ✓ Solana CLI configured
- ✓ Anchor Framework installed
- ✓ Devnet wallet funded

### Initialize New Program

```bash
cd /home/quantium/labs/quami/solana/anchor

# Create new Anchor project
anchor init my-program

# Project structure will be created:
# my-program/
# ├── Anchor.toml          # Anchor configuration
# ├── Cargo.toml           # Rust workspace config
# ├── package.json         # Test dependencies
# ├── tsconfig.json        # TypeScript config
# ├── programs/
# │   └── my-program/
# │       ├── Cargo.toml   # Program dependencies
# │       ├── Xargo.toml   # Cross-compilation config
# │       └── src/
# │           └── lib.rs   # Program entry point
# ├── tests/
# │   └── my-program.ts    # Anchor tests
# └── migrations/
#     └── deploy.js        # Deployment script
```

## 🛠️ Development Workflow

### 1. Build Program

```bash
cd qwami-token  # or kwami-nft

# Clean previous builds
anchor clean

# Build program
anchor build

# Build output location:
# target/deploy/program_name.so
# target/idl/program_name.json
```

### 2. Test Program

```bash
# Run tests (spins up local validator)
anchor test

# Run tests with logs
anchor test -- --nocapture

# Run specific test
anchor test -- --test test_name
```

### 3. Deploy to Devnet

```bash
# Ensure you're on devnet
solana config get

# Should show: https://api.devnet.solana.com

# Deploy program
anchor deploy

# This will:
# 1. Build the program
# 2. Deploy to configured network
# 3. Output program ID
```

### 4. Get Program ID

```bash
# After first deployment, program ID is in:
cat target/deploy/program_name-keypair.json | solana-keygen pubkey

# Or from Anchor.toml after deployment
cat Anchor.toml
```

### 5. Update Environment Variables

After deployment, update your `.env`:

```bash
# For QWAMI Token
NUXT_PUBLIC_QWAMI_TOKEN_PROGRAM_ID=<program_id>

# For Kwami NFT
NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=<program_id>
```

## 📝 Program Structure

### Basic Program Template

```rust
use anchor_lang::prelude::*;

declare_id!("YourProgramIDHere"); // Updated after first deployment

#[program]
pub mod program_name {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        // Instruction logic here
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

### Account Structure

```rust
#[account]
pub struct MyAccount {
    pub authority: Pubkey,
    pub data: u64,
    pub bump: u8,
}

impl MyAccount {
    pub const LEN: usize = 8 + // discriminator
        32 +  // authority pubkey
        8 +   // data u64
        1;    // bump u8
}
```

### Error Handling

```rust
#[error_code]
pub enum MyError {
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Maximum supply exceeded")]
    MaxSupplyExceeded,
}
```

## 🧪 Testing

### Test Structure

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyProgram } from "../target/types/my_program";
import { expect } from "chai";

describe("my-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MyProgram as Program<MyProgram>;

  it("Initializes account", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Transaction signature:", tx);
  });
});
```

### Running Tests

```bash
# Run all tests
anchor test

# Skip local validator (use configured cluster)
anchor test --skip-local-validator

# Run with detailed logs
RUST_LOG=debug anchor test -- --nocapture
```

## 🔍 Debugging

### View Logs

```bash
# During local test
anchor test -- --nocapture

# View devnet logs
solana logs <program_id>

# View transaction logs
solana confirm -v <transaction_signature>
```

### Common Issues

**Issue: Program ID mismatch**
```bash
# Solution: Update program ID in lib.rs after first deployment
declare_id!("NewProgramIDFromDeploy");

# Rebuild
anchor build
```

**Issue: Insufficient funds**
```bash
# Solution: Fund wallet
solana airdrop 2
```

**Issue: Account already exists**
```bash
# Solution: Use different seed or close old account
# In program, use init_if_needed or close account first
```

## 📦 Dependencies

### Common Anchor Dependencies

In `programs/your-program/Cargo.toml`:

```toml
[dependencies]
anchor-lang = "0.29.0"
anchor-spl = "0.29.0"  # For SPL token operations

# For Metaplex NFTs
mpl-token-metadata = "1.13.1"
```

### Installing SPL Token

```bash
# Add to Cargo.toml
anchor-spl = "0.29.0"
```

## 🚢 Deployment

### Devnet Deployment

```bash
# 1. Set cluster to devnet
solana config set --url https://api.devnet.solana.com

# 2. Build program
anchor build

# 3. Deploy
anchor deploy

# 4. Note the program ID
# 5. Update declare_id!() in lib.rs
# 6. Rebuild and redeploy
anchor build
anchor deploy
```

### Upgrade Program

```bash
# Build new version
anchor build

# Upgrade (must be upgrade authority)
anchor upgrade target/deploy/program_name.so --program-id <program_id>
```

## 📚 Resources

### Official Documentation
- [Anchor Book](https://www.anchor-lang.com/)
- [Anchor GitHub](https://github.com/coral-xyz/anchor)
- [Solana Cookbook](https://solanacookbook.com/)

### Example Programs
- [Anchor Examples](https://github.com/coral-xyz/anchor/tree/master/tests)
- [Solana Program Library](https://github.com/solana-labs/solana-program-library)

### Learning Resources
- [Anchor Course](https://www.anchor-lang.com/docs/installation)
- [Solana Bootcamp](https://www.soldev.app/)

## 🔐 Security Best Practices

1. **Validate all inputs** - Check account ownership, signers, data
2. **Use constraints** - Leverage Anchor's account constraints
3. **Avoid arithmetic overflow** - Use checked math operations
4. **Close accounts properly** - Return rent to avoid locked funds
5. **Implement access control** - Use has_one, signer constraints
6. **Audit before mainnet** - Get professional security audit

## 💡 Tips

### Speed Up Builds

```bash
# Use release mode for faster execution
anchor build --release

# Cache dependencies
cargo build --release
```

### Generate TypeScript Types

```bash
# Types are auto-generated in target/types/
# Import in tests:
import { MyProgram } from "../target/types/my_program";
```

### IDL (Interface Definition Language)

```bash
# IDL is in target/idl/program_name.json
# Use for frontend integration
```

---

**Ready to build?** Check individual program READMEs:
- [QWAMI Token](./qwami-token/README.md)
- [Kwami NFT](./kwami-nft/README.md)
