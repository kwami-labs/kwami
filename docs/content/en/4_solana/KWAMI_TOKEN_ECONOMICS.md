# 💰 KWAMI Token Economics & Payment Model

**Complete economic model for QWAMI token and KWAMI NFT minting/burning**

---

## 🎯 Overview

The KWAMI ecosystem uses a **dual-token economy** with transparent on-chain accounting:

1. **QWAMI Token** - Gateway utility token (SPL Token)
2. **KWAMI NFT** - Unique AI companions (Metaplex NFT)

**Core Principle:** All KWAMI NFT transactions require QWAMI tokens, creating natural demand and utility.

---

## 💎 QWAMI Token Economics

### **Token Specifications**

| Property | Value |
|----------|-------|
| **Symbol** | QWAMI |
| **Standard** | SPL Token (Solana) |
| **Decimals** | 0 (Integer token) |
| **Max Supply** | 1,000,000,000,000 (1 Trillion) |
| **Base Price** | $0.01 USD |

### **Minting QWAMI (Buy)**

Users can mint (purchase) QWAMI tokens with:

#### **Option 1: SOL**
```
SOL → QWAMI
Exchange Rate: Dynamic based on QWAMI price in USD
Formula: QWAMI_amount = (SOL_amount × SOL_price_USD) / QWAMI_price_USD
```

**Example:**
- User sends: 1 SOL ($100 USD)
- QWAMI price: $0.01 USD
- User receives: 10,000 QWAMI

#### **Option 2: USDC**
```
USDC → QWAMI
Exchange Rate: Fixed based on QWAMI price
Formula: QWAMI_amount = USDC_amount / QWAMI_price_USD
```

**Example:**
- User sends: 100 USDC
- QWAMI price: $0.01 USD
- User receives: 10,000 QWAMI

### **Burning QWAMI (Sell)**

Users can burn (redeem) QWAMI tokens for:

#### **Option 1: Redeem for SOL**
```
QWAMI → SOL
Formula: SOL_amount = (QWAMI_amount × QWAMI_price_USD) / SOL_price_USD
```

**Example:**
- User burns: 10,000 QWAMI
- QWAMI price: $0.01 USD
- User receives: 1 SOL (at $100/SOL)

#### **Option 2: Redeem for USDC**
```
QWAMI → USDC
Formula: USDC_amount = QWAMI_amount × QWAMI_price_USD
```

**Example:**
- User burns: 10,000 QWAMI
- QWAMI price: $0.01 USD
- User receives: 100 USDC

---

## 🦋 KWAMI NFT Economics

### **Minting KWAMI NFT**

**Payment Rule:** QWAMI tokens ONLY

#### **Minting Cost Structure**

```
Total Cost = Base_Mint_Cost + Transaction_Fees + Platform_Fee

All payments in QWAMI tokens
```

**Cost Breakdown:**

| Component | Cost (QWAMI) | Purpose |
|-----------|--------------|---------|
| **Base Mint Cost** | TBD (e.g., 1,000) | NFT creation |
| **Transaction Fee** | ~50 | On-chain operations |
| **Platform Fee** | 10% of base | Revenue/dividends |
| **Total Example** | ~1,150 QWAMI | Full minting cost |

**Pricing Strategy:**
- Generation #0 (2026): Higher cost (scarcity premium)
- Later generations: Lower cost (abundance)
- Dynamic pricing based on demand

#### **Minting Flow**

```
User Flow:
1. User has SOL/USDC
2. User mints QWAMI tokens (SOL/USDC → QWAMI)
3. User approves QWAMI token transfer
4. Smart contract validates QWAMI balance
5. Smart contract transfers QWAMI to treasury
6. Smart contract mints KWAMI NFT
7. User receives NFT in wallet

Treasury Allocation:
- 80% → Dividend pool (weekly distribution to QWAMI holders)
- 20% → Development/Operations fund
```

### **Burning KWAMI NFT**

**Refund Rule:** Partial QWAMI refund on burn

#### **Burn Refund Structure**

```
Refund_Amount = Base_Mint_Cost × Refund_Percentage

Refund paid in QWAMI tokens
```

**Refund Schedule:**

| Scenario | Refund % | Example (if base cost = 1,000 QWAMI) |
|----------|----------|--------------------------------------|
| **Standard Burn** | 50% | 500 QWAMI returned |
| **Body Change** | 50% | 500 QWAMI (burn + remint) |
| **Penalty Burn** | 0% | 0 QWAMI (policy violation) |

**Refund Rationale:**
- Encourages experimentation (50% safety net)
- Prevents frivolous minting/burning (50% cost)
- Creates deflationary pressure (burned fees)

#### **Burn Flow**

```
User Flow:
1. User owns KWAMI NFT
2. User initiates burn transaction
3. Smart contract validates ownership
4. Smart contract burns NFT token
5. Smart contract removes DNA from registry
6. Smart contract transfers QWAMI refund to user
7. DNA becomes available for reminting

Treasury Impact:
- 50% QWAMI retained in treasury
- 50% QWAMI returned to user
- Net effect: Deflationary pressure
```

---

## 🏦 Master Treasury Account

### **On-Chain Accounting**

All KWAMI ecosystem funds are held in **transparent, publicly auditable PDAs**:

#### **Main Treasury PDA**

**Seeds:** `["kwami-treasury", program_id]`

**Holds:**
- All QWAMI tokens from NFT mints
- SOL from QWAMI mints
- USDC from QWAMI mints

**Structure:**
```rust
pub struct KwamiTreasury {
    // Authority
    authority: Pubkey,
    
    // Token Accounts (PDAs)
    qwami_vault: Pubkey,      // QWAMI tokens
    sol_vault: Pubkey,         // Native SOL
    usdc_vault: Pubkey,        // USDC tokens
    
    // Accounting
    total_qwami_received: u64,     // From NFT mints
    total_qwami_refunded: u64,     // From NFT burns
    total_sol_received: u64,       // From QWAMI mints
    total_usdc_received: u64,      // From QWAMI mints
    total_sol_distributed: u64,    // From QWAMI burns
    total_usdc_distributed: u64,   // From QWAMI burns
    
    // Revenue Tracking
    nft_mints_count: u64,
    nft_burns_count: u64,
    qwami_mints_count: u64,
    qwami_burns_count: u64,
    
    // Dividend Pool (80% of revenue)
    dividend_pool_balance: u64,
    last_dividend_distribution: i64,
    
    // Operations Fund (20% of revenue)
    operations_balance: u64,
    
    bump: u8,
}
```

### **Public Visibility**

**Anyone can query:**
```rust
// Query treasury state
let treasury = program.account.kwamiTreasury.fetch(treasury_pda);

// See all balances
console.log("QWAMI Balance:", treasury.qwami_vault_balance);
console.log("SOL Balance:", treasury.sol_vault_balance);
console.log("USDC Balance:", treasury.usdc_vault_balance);

// See revenue
console.log("Total Revenue (QWAMI):", treasury.total_qwami_received);
console.log("NFT Mints:", treasury.nft_mints_count);

// See distributions
console.log("Dividend Pool:", treasury.dividend_pool_balance);
console.log("Last Distribution:", treasury.last_dividend_distribution);
```

**Frontend Dashboard:**
- Live treasury balances
- Historical revenue
- Dividend distribution schedule
- Operations fund allocation

---

## 💸 Revenue Distribution

### **From NFT Minting**

```
NFT Mint Revenue (QWAMI) = Base_Cost + Platform_Fee

Distribution:
├── 80% → Dividend Pool (weekly Friday distribution)
│   └── Split proportionally among all QWAMI holders
│
└── 20% → Operations Fund
    ├── 10% → Development
    ├── 5% → Infrastructure
    └── 5% → Marketing
```

### **Weekly Dividends (Every Friday)**

**Eligibility:**
- Hold QWAMI tokens in wallet
- Staked QWAMI also eligible
- Proportional to holdings

**Formula:**
```
User_Dividend = (User_QWAMI_Balance / Total_QWAMI_Supply) × Dividend_Pool

Example:
- User holds: 1,000,000 QWAMI (0.1% of supply)
- Dividend pool: 50,000,000 QWAMI
- User receives: 50,000 QWAMI
```

**Distribution Method:**
- Automated smart contract
- Runs every Friday 00:00 UTC
- Direct transfer to holders
- Gas fees covered by protocol

---

## 🔄 Complete Economic Flows

### **Flow 1: Mint KWAMI NFT**

```
Step 1: Acquire QWAMI
User: 1 SOL
  ↓ (mint QWAMI)
QWAMI Program: 
  - Transfer 1 SOL to treasury
  - Mint 10,000 QWAMI to user
User: 10,000 QWAMI

Step 2: Mint NFT
User: 10,000 QWAMI
  ↓ (mint KWAMI NFT, cost: 1,150 QWAMI)
KWAMI NFT Program:
  - Transfer 1,150 QWAMI to treasury
  - Mint unique KWAMI NFT
  - Validate DNA uniqueness
User: KWAMI NFT + 8,850 QWAMI remaining

Treasury Update:
  + 1,150 QWAMI received
  ├── 920 QWAMI → Dividend pool (80%)
  └── 230 QWAMI → Operations (20%)
```

### **Flow 2: Burn KWAMI NFT**

```
User: KWAMI NFT (originally cost 1,150 QWAMI)
  ↓ (burn NFT)
KWAMI NFT Program:
  - Burn NFT token
  - Remove DNA from registry
  - Calculate refund: 1,000 × 50% = 500 QWAMI
  - Transfer 500 QWAMI from treasury to user
User: 500 QWAMI refund

Treasury Update:
  - 500 QWAMI returned to user
  - 650 QWAMI retained (deflationary)
  - DNA available for reminting
```

### **Flow 3: Redeem QWAMI for USDC**

```
User: 8,850 QWAMI remaining
  ↓ (burn QWAMI for USDC)
QWAMI Program:
  - Burn 8,850 QWAMI tokens
  - Calculate USDC: 8,850 × $0.01 = 88.50 USDC
  - Transfer 88.50 USDC from treasury to user
User: 88.50 USDC

Treasury Update:
  - 8,850 QWAMI burned (deflationary)
  - 88.50 USDC sent to user
```

---

## 📊 Pricing Strategy

### **Dynamic QWAMI Pricing**

**Base Price:** $0.01 USD (soft peg)

**Factors:**
- Market demand
- Treasury reserves
- Dividend yield
- NFT minting volume

**Price Oracle:**
- Pyth Network (Solana oracle)
- Updates every 10 seconds
- Deviation tolerance: ±5%

### **KWAMI NFT Minting Costs**

**Generational Pricing:**

| Generation | Period | Base Cost (QWAMI) | Rationale |
|------------|--------|-------------------|-----------|
| Gen #0 | 2026 | 10,000 | Founder premium |
| Gen #1-5 | 2027-2031 | 5,000 | Early adopter |
| Gen #6-20 | 2032-2046 | 2,500 | Growth phase |
| Gen #21-50 | 2047-2076 | 1,000 | Mass adoption |
| Gen #51-74 | 2077-2100 | 500 | Universal access |

**Dynamic Adjustments:**
- High demand: +20% surge pricing
- Low demand: -10% incentive pricing
- Special events: Custom pricing

---

## 🔒 Security & Anti-Abuse

### **Minting Limits**

**Per Wallet:**
- Max 100 NFTs per wallet address
- Rate limit: 10 mints per day
- Prevents whale accumulation

**Per Transaction:**
- Max 10 NFTs per transaction
- Prevents spam attacks

### **Burn-Mint Prevention**

**Cooldown Period:**
- After burn: 24-hour cooldown before remint with same DNA
- Prevents rapid burn/mint arbitrage
- Allows genuine mistakes

**Penalty Burns:**
- Policy violation: 0% refund
- Spam detection: 0% refund
- Blacklist bypass: 0% refund

### **Treasury Protection**

**Multi-Sig Authority:**
- 3-of-5 multisig for treasury operations
- Timelock: 48 hours for large withdrawals
- Community governance for threshold changes

**Reserve Requirements:**
- Maintain 110% reserves for redemptions
- SOL reserve: Cover all QWAMI burn requests
- USDC reserve: Cover all QWAMI burn requests

---

## 📈 Economic Incentives

### **For QWAMI Holders**

✅ **Weekly Dividends** - Passive income every Friday  
✅ **Staking Rewards** - Additional APY for staking  
✅ **Governance Rights** - Vote on proposals  
✅ **Priority Access** - Early mint windows  

### **For KWAMI NFT Holders**

✅ **AI Companion** - Full KWAMI functionality  
✅ **Energy Credits** - Included AI API calls  
✅ **Marketplace** - Trade on secondary market  
✅ **Partial Refund** - 50% on burn  

### **For the Ecosystem**

✅ **Deflationary Pressure** - Fees burned  
✅ **Liquidity** - Two-way SOL/USDC conversion  
✅ **Transparency** - All accounting public  
✅ **Sustainability** - Revenue funds development  

---

## 🎯 Example Scenarios

### **Scenario 1: New User Journey**

**Starting Point:** User has 2 SOL ($200)

**Step 1: Buy QWAMI**
- Send: 1 SOL to mint QWAMI
- Receive: 10,000 QWAMI
- Remaining: 1 SOL

**Step 2: Mint KWAMI NFT**
- Pay: 1,150 QWAMI
- Receive: KWAMI NFT (Gen #0)
- Remaining: 8,850 QWAMI

**Step 3: Hold & Earn**
- Hold: KWAMI NFT + QWAMI
- Earn: Weekly dividends on 8,850 QWAMI
- Use: AI companion features

**ROI Analysis:**
- Initial investment: 1 SOL ($100)
- NFT value: Market price
- Dividend yield: ~5-10% APY on QWAMI
- Break-even: ~2 years via dividends

### **Scenario 2: DNA Change (Burn & Remint)**

**Starting Point:** User owns KWAMI NFT

**Step 1: Burn NFT**
- Burn: KWAMI NFT
- Receive: 500 QWAMI refund (50%)
- Cost: 650 QWAMI lost

**Step 2: Remint with New DNA**
- Pay: 1,150 QWAMI
- Need: 650 more QWAMI (buy with SOL)
- Receive: New KWAMI NFT

**Total Cost:** 0.065 SOL + original mint cost

### **Scenario 3: Exit Strategy**

**Starting Point:** User wants to cash out

**Option A: Keep NFT, Sell QWAMI**
- Keep: KWAMI NFT
- Burn: 8,850 QWAMI → 88.50 USDC
- Keep earning dividends

**Option B: Sell Everything**
- Burn: KWAMI NFT → 500 QWAMI refund
- Burn: 9,350 QWAMI → 93.50 USDC
- Total: 93.50 USDC cash

**Option C: Secondary Market**
- List: KWAMI NFT on marketplace
- Market price: 1,500-5,000 QWAMI (Gen #0 premium)
- Keep: 8,850 QWAMI for dividends

---

## 🔗 Smart Contract Integration

### **Required Program Accounts**

**QWAMI Token Program:**
- Token mint PDA
- Token authority PDA
- Treasury vaults (SOL, USDC)

**KWAMI NFT Program:**
- Collection authority PDA
- DNA registry PDA
- Treasury vault (QWAMI)
- Burn refund vault (QWAMI)

**Cross-Program Invocation (CPI):**
- KWAMI NFT program calls QWAMI program
- Transfer QWAMI tokens on mint/burn
- Atomic transactions (all or nothing)

### **Program Instructions**

**QWAMI Token:**
```rust
// Mint QWAMI with SOL
pub fn mint_qwami_with_sol(ctx: Context<MintWithSol>, sol_amount: u64)

// Mint QWAMI with USDC
pub fn mint_qwami_with_usdc(ctx: Context<MintWithUsdc>, usdc_amount: u64)

// Burn QWAMI for SOL
pub fn burn_qwami_for_sol(ctx: Context<BurnForSol>, qwami_amount: u64)

// Burn QWAMI for USDC
pub fn burn_qwami_for_usdc(ctx: Context<BurnForUsdc>, qwami_amount: u64)
```

**KWAMI NFT:**
```rust
// Mint NFT (requires QWAMI payment)
pub fn mint_kwami_with_qwami(
    ctx: Context<MintWithQwami>, 
    dna_hash: [u8; 32],
    qwami_payment: u64
)

// Burn NFT (returns QWAMI refund)
pub fn burn_kwami_for_refund(ctx: Context<BurnForRefund>)
```

---

## 📝 Implementation Checklist

### **Phase 1: QWAMI Token Economics**
- [ ] Implement mint_with_sol instruction
- [ ] Implement mint_with_usdc instruction
- [ ] Implement burn_for_sol instruction
- [ ] Implement burn_for_usdc instruction
- [ ] Create treasury vault PDAs
- [ ] Integrate Pyth oracle for pricing
- [ ] Add reserve requirement checks

### **Phase 2: KWAMI NFT Payment**
- [ ] Update mint instruction to require QWAMI
- [ ] Implement QWAMI transfer validation
- [ ] Calculate and enforce minting costs
- [ ] Route payments to treasury (80/20 split)
- [ ] Update burn to provide QWAMI refund
- [ ] Implement refund calculation (50%)
- [ ] Add burn cooldown mechanism

### **Phase 3: Treasury & Accounting**
- [ ] Create KwamiTreasury account structure
- [ ] Implement accounting updates on each transaction
- [ ] Create public query methods
- [ ] Add treasury balance checks
- [ ] Implement dividend distribution logic
- [ ] Create operations fund management

### **Phase 4: Frontend Integration**
- [ ] Add QWAMI balance display
- [ ] Implement QWAMI mint UI (SOL/USDC)
- [ ] Update NFT mint UI (QWAMI payment)
- [ ] Show minting costs in QWAMI
- [ ] Display burn refund estimates
- [ ] Create treasury dashboard
- [ ] Add dividend tracking

### **Phase 5: Security & Testing**
- [ ] Test all payment flows
- [ ] Test edge cases (insufficient funds, etc.)
- [ ] Implement rate limiting
- [ ] Add multi-sig treasury control
- [ ] Audit smart contracts
- [ ] Test dividend distribution
- [ ] Simulate treasury management

---

## 📚 References

- **SPL Token Standard:** https://spl.solana.com/token
- **Pyth Price Oracle:** https://pyth.network/
- **Metaplex Token Metadata:** https://docs.metaplex.com/
- **Solana CPI:** https://docs.solana.com/developing/programming-model/calling-between-programs

---

**Version:** 1.5.8  
**Status:** Design Complete - Ready for Implementation  
**Last Updated:** November 19, 2025

---

*Built with 💜 for a transparent, sustainable KWAMI ecosystem*

