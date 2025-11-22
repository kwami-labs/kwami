# 🌟 KWAMI Ecosystem - Solana Programs

**Complete implementation of KWAMI NFT + QWAMI Token with economic integration**

---

## 📦 Programs

### **1. QWAMI Token** (`qwami/`)
SPL Token with SOL/USDC exchange functionality

- **Max Supply:** 1 Trillion tokens
- **Decimals:** 0 (integer token)
- **Price:** $0.01 USD per token
- **Features:**
  - Mint QWAMI with SOL or USDC
  - Burn QWAMI for SOL or USDC
  - Public treasury accounting
  - Deflationary model

### **2. KWAMI NFT** (`kwami/`)
Metaplex-compliant NFT collection with unique DNA validation

- **Max Supply:** 10 Billion NFTs (by 2100)
- **Generations:** 75 (2026-2100)
- **Annual Increment:** 133.33 Million per year
- **Features:**
  - Requires QWAMI payment for minting
  - 50% QWAMI refund on burning
  - Unique DNA validation (SHA-256)
  - Generational supply caps
  - Dynamic pricing by generation

---

## 🏗️ Architecture

```
User
 │
 ├──► QWAMI Token Program
 │     ├─ mint_with_sol()
 │     ├─ mint_with_usdc()
 │     ├─ burn_for_sol()
 │     ├─ burn_for_usdc()
 │     └─ QWAMI Treasury
 │         ├─ SOL Vault (PDA)
 │         └─ USDC Vault (Token Account)
 │
 └──► KWAMI NFT Program
       ├─ mint_kwami() → Requires QWAMI
       ├─ burn_kwami() → Refunds 50% QWAMI
       ├─ update_metadata()
       ├─ transfer_kwami()
       └─ KWAMI Treasury
           └─ QWAMI Vault (Token Account)
```

---

## 💰 Economic Model

### **Complete User Flow:**

**Step 1: Buy QWAMI**
```
1 SOL → 1,000 QWAMI
OR
1 USDC → 100 QWAMI
```

**Step 2: Mint KWAMI NFT**
```
Cost by Generation:
- Gen #0 (2026):      10,000 QWAMI + 10% fee + 50 QWAMI = 11,050 QWAMI
- Gen #1-5:           5,000 QWAMI + 10% fee + 50 QWAMI = 5,550 QWAMI
- Gen #6-20:          2,500 QWAMI + 10% fee + 50 QWAMI = 2,800 QWAMI
- Gen #21-50:         1,000 QWAMI + 10% fee + 50 QWAMI = 1,150 QWAMI
- Gen #51-74:         500 QWAMI + 10% fee + 50 QWAMI = 600 QWAMI

Revenue Split:
- 80% → Dividend Pool (weekly distribution)
- 20% → Operations Fund
```

**Step 3: Burn KWAMI NFT (optional)**
```
Refund: 50% of original base cost
Example (Gen #0): 10,000 × 50% = 5,000 QWAMI back
```

**Step 4: Redeem QWAMI (optional)**
```
1,000 QWAMI → 1 SOL
OR
100 QWAMI → 1 USDC
```

---

## 📚 Documentation

- **[Economic Integration Complete](./ECONOMIC_INTEGRATION_COMPLETE.md)** - Full implementation details
- **[Instruction Reference](./INSTRUCTION_REFERENCE.md)** - All program instructions with examples
- **[Token Economics](../KWAMI_TOKEN_ECONOMICS.md)** - Comprehensive economic model
- **[Supply Schedule](../KWAMI_SUPPLY_SCHEDULE.md)** - Generational release plan

---

## 🚀 Getting Started

### **Prerequisites:**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### **Build Programs:**
```bash
# Build QWAMI Token
cd qwami
anchor build

# Build KWAMI NFT
cd ../kwami
anchor build
```

### **Test Programs:**
```bash
# Test QWAMI Token
cd qwami
anchor test

# Test KWAMI NFT
cd ../kwami
anchor test
```

### **Deploy to Devnet:**
```bash
# Set Solana to devnet
solana config set --url devnet

# Airdrop SOL for deployment
solana airdrop 2

# Deploy QWAMI Token
cd qwami
anchor deploy

# Deploy KWAMI NFT
cd ../kwami
anchor deploy
```

---

## 🧪 Testing

### **Unit Tests:**
See `qwami/tests/` and `kwami/tests/` for comprehensive test suites

**QWAMI Token Tests:**
- ✅ Initialize program
- ✅ Mint with SOL
- ✅ Mint with USDC
- ✅ Burn for SOL
- ✅ Burn for USDC
- ✅ Max supply enforcement
- ✅ Treasury accounting

**KWAMI NFT Tests:**
- ✅ Initialize program
- ✅ Mint with QWAMI payment
- ✅ Burn with QWAMI refund
- ✅ DNA uniqueness validation
- ✅ Generational pricing
- ✅ Supply cap enforcement
- ✅ Treasury accounting

### **Integration Tests:**
```bash
# Run all tests
anchor test

# Run with logs
anchor test -- --nocapture
```

---

## 📊 Program Accounts

### **QWAMI Token:**

**TokenAuthority PDA:**
```rust
seeds = [b"token-authority", mint]
```
Tracks: total minted, total burned, base price

**QwamiTreasury PDA:**
```rust
seeds = [b"qwami-treasury"]
```
Tracks: SOL/USDC flows, mint/burn counts

### **KWAMI NFT:**

**CollectionAuthority PDA:**
```rust
seeds = [b"collection-authority", collection_mint]
```
Tracks: total minted, collection mint

**DnaRegistry PDA:**
```rust
seeds = [b"dna-registry", collection_mint]
```
Tracks: all DNA hashes (prevents duplicates)

**KwamiTreasury PDA:**
```rust
seeds = [b"kwami-treasury"]
```
Tracks: QWAMI revenue, refunds, dividend pool

**KwamiNft PDA:**
```rust
seeds = [b"kwami-nft", nft_mint]
```
Tracks: DNA, owner, metadata URI, mint cost

---

## 🔑 Key Features

### **Security:**
✅ PDA-based authority  
✅ Validation on all transfers  
✅ Max supply enforcement  
✅ Reserve requirements  
✅ Duplicate DNA prevention  

### **Transparency:**
✅ Public treasury accounting  
✅ All balances queryable  
✅ On-chain transaction logs  
✅ Auditable revenue flows  

### **Economics:**
✅ Two-way SOL/USDC liquidity  
✅ Deflationary burn mechanics  
✅ Revenue sharing (80/20 split)  
✅ Dynamic generational pricing  
✅ Partial refunds on burns  

---

## 🎯 Status

| Component | Status |
|-----------|--------|
| **QWAMI Token Program** | ✅ Complete |
| **KWAMI NFT Program** | ✅ Complete |
| **Treasury System** | ✅ Complete |
| **Economic Integration** | ✅ Complete |
| **Unit Tests** | 🔄 In Progress |
| **Integration Tests** | 🔄 In Progress |
| **Devnet Deployment** | ⏳ Pending |
| **Security Audit** | ⏳ Pending |
| **Mainnet Deployment** | ⏳ Pending |

---

## 📞 Support

- **Documentation:** See `/solana/` folder
- **Issues:** GitHub Issues
- **Discord:** [Coming Soon]

---

## 📄 License

MIT License - See LICENSE file for details

---

**Built with 💜 for the KWAMI ecosystem**

*One KWAMI for every human on Earth by 2100* 🌍
