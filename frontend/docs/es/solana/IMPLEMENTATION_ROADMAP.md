# 🚀 KWAMI Solana Programs - Complete Implementation Roadmap

**Complete specification for implementing the KWAMI token economy on Solana**

**Status:** Design Complete → Ready for Implementation  
**Estimated Implementation Time:** 4-6 weeks  
**Complexity:** High (Cross-program invocation, treasury management, oracle integration)

---

## 📋 Executive Summary

This document provides a complete, step-by-step implementation guide for finishing the KWAMI Solana programs with the full economic model documented in [KWAMI_TOKEN_ECONOMICS.md](./KWAMI_TOKEN_ECONOMICS.md).

**Current State:**
- ✅ QWAMI Token: Basic authority-based mint/burn implemented
- ✅ KWAMI NFT: Generation-based supply with DNA validation implemented
- ✅ Documentation: Complete economic model documented
- ❌ **Missing:** Treasury system, SOL/USDC integration, QWAMI payment for NFTs, burn refunds

**Target State:**
- ✅ Complete dual-token economy
- ✅ QWAMI mint/burn with SOL/USDC
- ✅ KWAMI NFT requires QWAMI payment
- ✅ Burn refunds (50%)
- ✅ Public treasury accounting
- ✅ Dividend distribution system

---

## 🎯 Implementation Phases

### **Phase 1: QWAMI Token Treasury & Exchange (2 weeks)**
**Priority:** CRITICAL  
**Dependencies:** None  
**Testing:** Extensive (money handling)

### **Phase 2: KWAMI NFT Payment Integration (1-2 weeks)**
**Priority:** CRITICAL  
**Dependencies:** Phase 1 complete  
**Testing:** Integration testing required

### **Phase 3: Treasury Accounting & Dividends (1 week)**
**Priority:** HIGH  
**Dependencies:** Phases 1 & 2  
**Testing:** Accounting verification

### **Phase 4: Frontend Integration (1-2 weeks)**
**Priority:** HIGH  
**Dependencies:** Phases 1-3  
**Testing:** User acceptance testing

### **Phase 5: Security Audit & Deployment (1+ week)**
**Priority:** CRITICAL  
**Dependencies:** All phases  
**Testing:** Professional audit required

---

## 🔧 Phase 1: QWAMI Token Treasury & Exchange

### **1.1 Add Required Dependencies**

**File:** `solana/anchor/qwami-token/programs/qwami-token/Cargo.toml`

```toml
[dependencies]
anchor-lang = "1.5.12"
anchor-spl = "1.5.12"
solana-program = "~1.17"
```

### **1.2 Update Token Authority Structure**

**File:** `solana/anchor/qwami-token/programs/qwami-token/src/lib.rs`

Add to TokenAuthority:
```rust
pub struct TokenAuthority {
    // Existing fields...
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub total_minted: u64,
    pub total_burned: u64,
    pub base_price_usd_cents: u64,
    pub bump: u8,
    
    // NEW: Treasury tracking
    pub sol_vault: Pubkey,          // SOL vault PDA
    pub usdc_vault: Pubkey,         // USDC token account PDA
    pub total_sol_received: u64,    // Lamports received from mints
    pub total_sol_distributed: u64, // Lamports sent for burns
    pub total_usdc_received: u64,   // USDC received from mints
    pub total_usdc_distributed: u64,// USDC sent for burns
}

impl TokenAuthority {
    pub const LEN: usize = 
        32 +  // authority
        32 +  // mint
        8 +   // total_minted
        8 +   // total_burned
        8 +   // base_price_usd_cents
        1 +   // bump
        32 +  // sol_vault
        32 +  // usdc_vault
        8 +   // total_sol_received
        8 +   // total_sol_distributed
        8 +   // total_usdc_received
        8;    // total_usdc_distributed
}
```

### **1.3 Create Treasury Vault PDAs**

Add initialization for vault PDAs:

```rust
/// Initialize SOL vault PDA
/// Seeds: ["sol-vault", mint]
pub fn init_sol_vault(ctx: Context<InitSolVault>) -> Result<()> {
    // SOL vault is a system account (PDA)
    // No initialization needed, just validate PDA
    msg!("SOL vault initialized: {}", ctx.accounts.sol_vault.key());
    Ok(())
}

/// Initialize USDC vault (token account)
/// Seeds: ["usdc-vault", mint]  
pub fn init_usdc_vault(ctx: Context<InitUsdcVault>) -> Result<()> {
    // USDC vault is SPL token account
    // Initialized by Anchor with init constraint
    msg!("USDC vault initialized: {}", ctx.accounts.usdc_vault.key());
    Ok(())
}

#[derive(Accounts)]
pub struct InitSolVault<'info> {
    #[account(
        mut,
        seeds = [b"sol-vault", token_authority.mint.as_ref()],
        bump,
    )]
    pub sol_vault: SystemAccount<'info>,
    
    #[account(
        mut,
        seeds = [b"token-authority", token_authority.mint.as_ref()],
        bump = token_authority.bump,
    )]
    pub token_authority: Account<'info, TokenAuthority>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitUsdcVault<'info> {
    #[account(
        init,
        payer = payer,
        seeds = [b"usdc-vault", token_authority.mint.as_ref()],
        bump,
        token::mint = usdc_mint,
        token::authority = token_authority,
    )]
    pub usdc_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"token-authority", token_authority.mint.as_ref()],
        bump = token_authority.bump,
    )]
    pub token_authority: Account<'info, TokenAuthority>,
    
    pub usdc_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
```

### **1.4 Implement Mint with SOL**

```rust
/// Mint QWAMI tokens by paying SOL
/// User sends SOL, receives QWAMI
pub fn mint_with_sol(
    ctx: Context<MintWithSol>, 
    sol_amount: u64,  // Lamports to pay
) -> Result<()> {
    let token_authority = &mut ctx.accounts.token_authority;
    
    // Calculate QWAMI amount to mint
    // TODO: Integrate with Pyth oracle for real pricing
    // For now, use base price
    // 1 QWAMI = $0.01 USD
    // Assume 1 SOL = $100 USD (should be from oracle)
    let sol_price_usd_cents = 10000; // $100 = 10,000 cents
    let qwami_amount = (sol_amount * sol_price_usd_cents) 
        / (token_authority.base_price_usd_cents * 1_000_000_000); // Lamports conversion
    
    // Check max supply
    let new_supply = token_authority.total_minted
        .checked_add(qwami_amount)
        .ok_or(ErrorCode::MathOverflow)?;
    require!(new_supply <= MAX_SUPPLY, ErrorCode::MaxSupplyExceeded);
    
    // Transfer SOL from user to vault
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.payer.key(),
        &ctx.accounts.sol_vault.key(),
        sol_amount,
    );
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.sol_vault.to_account_info(),
        ],
    )?;
    
    // Mint QWAMI tokens to user
    let seeds = &[
        b"token-authority",
        token_authority.mint.as_ref(),
        &[token_authority.bump],
    ];
    let signer = &[&seeds[..]];
    
    let cpi_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.user_qwami_account.to_account_info(),
        authority: token_authority.to_account_info(),
    };
    
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    
    token::mint_to(cpi_ctx, qwami_amount)?;
    
    // Update accounting
    token_authority.total_minted += qwami_amount;
    token_authority.total_sol_received += sol_amount;
    
    msg!("Minted {} QWAMI for {} lamports SOL", qwami_amount, sol_amount);
    
    Ok(())
}

#[derive(Accounts)]
pub struct MintWithSol<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(
        mut,
        seeds = [b"token-authority", mint.key().as_ref()],
        bump = token_authority.bump,
        has_one = mint,
        has_one = sol_vault,
    )]
    pub token_authority: Account<'info, TokenAuthority>,
    
    #[account(
        mut,
        seeds = [b"sol-vault", mint.key().as_ref()],
        bump,
    )]
    pub sol_vault: SystemAccount<'info>,
    
    #[account(mut)]
    pub user_qwami_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
```

### **1.5 Implement Mint with USDC**

```rust
/// Mint QWAMI tokens by paying USDC
pub fn mint_with_usdc(
    ctx: Context<MintWithUsdc>,
    usdc_amount: u64,  // USDC amount (6 decimals)
) -> Result<()> {
    let token_authority = &mut ctx.accounts.token_authority;
    
    // Calculate QWAMI amount
    // 1 QWAMI = $0.01 USD = 0.01 USDC = 10,000 (6 decimals)
    let qwami_amount = usdc_amount / 10_000; // Convert USDC (6 dec) to QWAMI count
    
    // Check max supply
    let new_supply = token_authority.total_minted
        .checked_add(qwami_amount)
        .ok_or(ErrorCode::MathOverflow)?;
    require!(new_supply <= MAX_SUPPLY, ErrorCode::MaxSupplyExceeded);
    
    // Transfer USDC from user to vault
    let cpi_accounts = token::Transfer {
        from: ctx.accounts.user_usdc_account.to_account_info(),
        to: ctx.accounts.usdc_vault.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
    };
    
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    
    token::transfer(cpi_ctx, usdc_amount)?;
    
    // Mint QWAMI tokens to user
    let seeds = &[
        b"token-authority",
        token_authority.mint.as_ref(),
        &[token_authority.bump],
    ];
    let signer = &[&seeds[..]];
    
    let cpi_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.user_qwami_account.to_account_info(),
        authority: token_authority.to_account_info(),
    };
    
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    
    token::mint_to(cpi_ctx, qwami_amount)?;
    
    // Update accounting
    token_authority.total_minted += qwami_amount;
    token_authority.total_usdc_received += usdc_amount;
    
    msg!("Minted {} QWAMI for {} USDC", qwami_amount, usdc_amount);
    
    Ok(())
}

#[derive(Accounts)]
pub struct MintWithUsdc<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(
        mut,
        seeds = [b"token-authority", mint.key().as_ref()],
        bump = token_authority.bump,
        has_one = mint,
        has_one = usdc_vault,
    )]
    pub token_authority: Account<'info, TokenAuthority>,
    
    #[account(
        mut,
        seeds = [b"usdc-vault", mint.key().as_ref()],
        bump,
    )]
    pub usdc_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_qwami_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}
```

### **1.6 Implement Burn for SOL**

```rust
/// Burn QWAMI tokens to receive SOL
pub fn burn_for_sol(
    ctx: Context<BurnForSol>,
    qwami_amount: u64,
) -> Result<()> {
    let token_authority = &mut ctx.accounts.token_authority;
    
    // Calculate SOL to return
    // TODO: Use oracle pricing
    let sol_price_usd_cents = 10000; // $100
    let sol_amount = (qwami_amount * token_authority.base_price_usd_cents * 1_000_000_000)
        / sol_price_usd_cents;
    
    // Check vault has enough SOL
    require!(
        ctx.accounts.sol_vault.lamports() >= sol_amount,
        ErrorCode::InsufficientTreasuryFunds
    );
    
    // Burn QWAMI tokens
    let cpi_accounts = Burn {
        mint: ctx.accounts.mint.to_account_info(),
        from: ctx.accounts.user_qwami_account.to_account_info(),
        authority: ctx.accounts.owner.to_account_info(),
    };
    
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    
    token::burn(cpi_ctx, qwami_amount)?;
    
    // Transfer SOL from vault to user
    let seeds = &[
        b"sol-vault",
        token_authority.mint.as_ref(),
        &[ctx.bumps.sol_vault],
    ];
    let signer = &[&seeds[..]];
    
    **ctx.accounts.sol_vault.to_account_info().try_borrow_mut_lamports()? -= sol_amount;
    **ctx.accounts.owner.to_account_info().try_borrow_mut_lamports()? += sol_amount;
    
    // Update accounting
    token_authority.total_burned += qwami_amount;
    token_authority.total_sol_distributed += sol_amount;
    
    msg!("Burned {} QWAMI for {} lamports SOL", qwami_amount, sol_amount);
    
    Ok(())
}

#[derive(Accounts)]
pub struct BurnForSol<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(
        mut,
        seeds = [b"token-authority", mint.key().as_ref()],
        bump = token_authority.bump,
        has_one = mint,
        has_one = sol_vault,
    )]
    pub token_authority: Account<'info, TokenAuthority>,
    
    #[account(
        mut,
        seeds = [b"sol-vault", mint.key().as_ref()],
        bump,
    )]
    pub sol_vault: SystemAccount<'info>,
    
    #[account(mut)]
    pub user_qwami_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
```

### **1.7 Implement Burn for USDC**

Similar structure to burn_for_sol, but transfer USDC tokens instead.

### **1.8 Add Error Codes**

```rust
#[error_code]
pub enum ErrorCode {
    // Existing...
    #[msg("Maximum supply of 1 trillion tokens exceeded")]
    MaxSupplyExceeded,
    
    // NEW
    #[msg("Insufficient funds in treasury vault")]
    InsufficientTreasuryFunds,
    
    #[msg("Invalid exchange rate or oracle price")]
    InvalidExchangeRate,
    
    #[msg("Reserve requirement not met (need 110% backing)")]
    InsufficientReserves,
}
```

---

## 🦋 Phase 2: KWAMI NFT Payment Integration

### **2.1 Add QWAMI Token Import**

**File:** `solana/anchor/kwami-nft/programs/kwami-nft/Cargo.toml`

```toml
[dependencies]
anchor-lang = "1.5.12"
anchor-spl = "1.5.12"
qwami-token = { path = "../../qwami-token/programs/qwami-token" }
```

### **2.2 Add Treasury Structure**

Add to lib.rs:

```rust
/// NFT Treasury for QWAMI payments
#[account]
pub struct NftTreasury {
    pub authority: Pubkey,
    pub collection: Pubkey,
    pub qwami_vault: Pubkey,          // QWAMI token account
    pub total_qwami_received: u64,    // From mints
    pub total_qwami_refunded: u64,    // From burns
    pub nft_mints_count: u64,
    pub nft_burns_count: u64,
    pub dividend_pool: u64,           // 80% of revenue
    pub operations_fund: u64,         // 20% of revenue
    pub last_dividend_time: i64,
    pub bump: u8,
}

impl NftTreasury {
    pub const LEN: usize = 
        32 +  // authority
        32 +  // collection
        32 +  // qwami_vault
        8 +   // total_qwami_received
        8 +   // total_qwami_refunded
        8 +   // nft_mints_count
        8 +   // nft_burns_count
        8 +   // dividend_pool
        8 +   // operations_fund
        8 +   // last_dividend_time
        1;    // bump
}
```

### **2.3 Update Mint Instruction to Require QWAMI**

```rust
/// Mint Kwami NFT with QWAMI payment
pub fn mint_kwami_with_qwami(
    ctx: Context<MintKwamiWithQwami>,
    dna_hash: [u8; 32],
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    // Existing DNA and generation validation...
    
    // Calculate mint cost in QWAMI
    let base_cost = get_generation_mint_cost(current_generation);
    let platform_fee = base_cost / 10; // 10%
    let total_cost = base_cost + platform_fee + 50; // +50 for tx fees
    
    // Transfer QWAMI from user to treasury
    let cpi_accounts = token::Transfer {
        from: ctx.accounts.user_qwami_account.to_account_info(),
        to: ctx.accounts.nft_treasury_qwami_vault.to_account_info(),
        authority: ctx.accounts.owner.to_account_info(),
    };
    
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    
    token::transfer(cpi_ctx, total_cost)?;
    
    // Update treasury accounting
    let nft_treasury = &mut ctx.accounts.nft_treasury;
    nft_treasury.total_qwami_received += total_cost;
    nft_treasury.nft_mints_count += 1;
    
    // Split revenue: 80% dividends, 20% operations
    let dividend_amount = (total_cost * 80) / 100;
    let operations_amount = total_cost - dividend_amount;
    
    nft_treasury.dividend_pool += dividend_amount;
    nft_treasury.operations_fund += operations_amount;
    
    // Continue with existing NFT minting logic...
    
    msg!("Paid {} QWAMI for KWAMI NFT", total_cost);
    msg!("Dividend pool: +{}, Operations: +{}", dividend_amount, operations_amount);
    
    Ok(())
}

/// Calculate mint cost based on generation
fn get_generation_mint_cost(generation: i64) -> u64 {
    match generation {
        0..=0 => 10_000,      // Gen #0: 10,000 QWAMI
        1..=5 => 5_000,       // Gen #1-5: 5,000 QWAMI
        6..=20 => 2_500,      // Gen #6-20: 2,500 QWAMI
        21..=50 => 1_000,     // Gen #21-50: 1,000 QWAMI
        _ => 500,             // Gen #51-74: 500 QWAMI
    }
}

#[derive(Accounts)]
pub struct MintKwamiWithQwami<'info> {
    // Existing accounts...
    
    // NEW: QWAMI payment accounts
    #[account(mut)]
    pub user_qwami_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"nft-treasury", collection_authority.collection_mint.as_ref()],
        bump = nft_treasury.bump,
    )]
    pub nft_treasury: Account<'info, NftTreasury>,
    
    #[account(
        mut,
        seeds = [b"nft-treasury-qwami-vault", collection_authority.collection_mint.as_ref()],
        bump,
    )]
    pub nft_treasury_qwami_vault: Account<'info, TokenAccount>,
}
```

### **2.4 Add Burn with Refund**

```rust
/// Burn Kwami NFT and receive 50% QWAMI refund
pub fn burn_kwami_for_refund(ctx: Context<BurnKwamiForRefund>) -> Result<()> {
    let kwami_nft = &ctx.accounts.kwami_nft;
    let nft_treasury = &mut ctx.accounts.nft_treasury;
    
    // Calculate refund (50% of original mint cost)
    // TODO: Store original mint cost in kwami_nft state
    // For now, use average cost
    let refund_amount = 500; // 50% of 1,000 QWAMI average
    
    // Check treasury has enough QWAMI
    require!(
        nft_treasury.dividend_pool + nft_treasury.operations_fund >= refund_amount,
        ErrorCode::InsufficientTreasuryFunds
    );
    
    // Transfer QWAMI refund to user
    let seeds = &[
        b"nft-treasury-qwami-vault",
        ctx.accounts.collection_authority.collection_mint.as_ref(),
        &[ctx.bumps.nft_treasury_qwami_vault],
    ];
    let signer = &[&seeds[..]];
    
    let cpi_accounts = token::Transfer {
        from: ctx.accounts.nft_treasury_qwami_vault.to_account_info(),
        to: ctx.accounts.user_qwami_account.to_account_info(),
        authority: ctx.accounts.nft_treasury.to_account_info(),
    };
    
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    
    token::transfer(cpi_ctx, refund_amount)?;
    
    // Burn NFT (existing logic)
    // Remove DNA from registry
    // ...
    
    // Update accounting
    nft_treasury.total_qwami_refunded += refund_amount;
    nft_treasury.nft_burns_count += 1;
    
    msg!("Burned KWAMI NFT, refunded {} QWAMI", refund_amount);
    
    Ok(())
}
```

---

## 📊 Phase 3: Treasury Accounting & Dividends

### **3.1 Add Dividend Distribution**

```rust
/// Distribute dividends to QWAMI holders (called weekly)
pub fn distribute_dividends(ctx: Context<DistributeDividends>) -> Result<()> {
    let nft_treasury = &mut ctx.accounts.nft_treasury;
    let current_time = Clock::get()?.unix_timestamp;
    
    // Check if it's Friday (day 5 of week)
    // Check if a week has passed since last distribution
    let one_week = 7 * 24 * 60 * 60;
    require!(
        current_time - nft_treasury.last_dividend_time >= one_week,
        ErrorCode::DividendCooldown
    );
    
    let dividend_amount = nft_treasury.dividend_pool;
    
    // TODO: Implement proportional distribution to all QWAMI holders
    // This requires either:
    // 1. Snapshot system (off-chain)
    // 2. Claim system (on-chain)
    // 3. Merkle tree distribution
    
    nft_treasury.last_dividend_time = current_time;
    
    msg!("Distributed {} QWAMI in dividends", dividend_amount);
    
    Ok(())
}
```

### **3.2 Query Methods for Public Accounting**

```rust
/// Get treasury balances (view-only)
pub fn get_treasury_info(ctx: Context<GetTreasuryInfo>) -> Result<()> {
    let nft_treasury = &ctx.accounts.nft_treasury;
    
    msg!("NFT Treasury Info:");
    msg!("Total QWAMI received: {}", nft_treasury.total_qwami_received);
    msg!("Total QWAMI refunded: {}", nft_treasury.total_qwami_refunded);
    msg!("NFT mints: {}", nft_treasury.nft_mints_count);
    msg!("NFT burns: {}", nft_treasury.nft_burns_count);
    msg!("Dividend pool: {}", nft_treasury.dividend_pool);
    msg!("Operations fund: {}", nft_treasury.operations_fund);
    
    Ok(())
}
```

---

## 🎨 Phase 4: Frontend Integration

### **4.1 Candy Machine Updates**

**Files to update:**
- `candy/app/stores/wallet.ts` - Add QWAMI balance tracking
- `candy/app/stores/nft.ts` - Update mint flow for QWAMI payment
- `candy/app/components/MintPanel.vue` - Add QWAMI balance display, buy QWAMI button

### **4.2 QWAMI Exchange UI**

Create new component: `candy/app/components/QwamiExchange.vue`

```vue
<template>
  <div class="qwami-exchange">
    <h3>Get QWAMI Tokens</h3>
    
    <!-- Buy QWAMI -->
    <div class="exchange-panel">
      <h4>Buy QWAMI</h4>
      <input v-model="solAmount" type="number" placeholder="SOL amount" />
      <p>≈ {{ estimatedQwami }} QWAMI</p>
      <button @click="mintWithSol">Buy with SOL</button>
      
      <input v-model="usdcAmount" type="number" placeholder="USDC amount" />
      <p>≈ {{ estimatedQwamiUsdc }} QWAMI</p>
      <button @click="mintWithUsdc">Buy with USDC</button>
    </div>
    
    <!-- Sell QWAMI -->
    <div class="exchange-panel">
      <h4>Sell QWAMI</h4>
      <p>Your balance: {{ qwamiBalance }} QWAMI</p>
      <input v-model="qwamiAmount" type="number" placeholder="QWAMI amount" />
      <button @click="burnForSol">Sell for SOL</button>
      <button @click="burnForUsdc">Sell for USDC</button>
    </div>
  </div>
</template>
```

### **4.3 Treasury Dashboard**

Create: `candy/app/components/TreasuryDashboard.vue`

Display:
- Live treasury balances (SOL, USDC, QWAMI)
- Total revenue
- NFT mints/burns count
- Dividend pool balance
- Next dividend date

---

## 🔒 Phase 5: Security & Testing

### **5.1 Security Checklist**

- [ ] Input validation on all amounts
- [ ] Overflow/underflow checks
- [ ] Reserve requirement enforcement (110%)
- [ ] Rate limiting implementation
- [ ] Multi-sig for treasury withdrawals
- [ ] Timelock for large operations
- [ ] Oracle manipulation protection
- [ ] Reentrancy guards

### **5.2 Test Scenarios**

**QWAMI Token:**
- [ ] Mint with SOL (success)
- [ ] Mint with USDC (success)
- [ ] Burn for SOL (success)
- [ ] Burn for USDC (success)
- [ ] Insufficient treasury funds (fail)
- [ ] Max supply exceeded (fail)
- [ ] Reserve requirement check

**KWAMI NFT:**
- [ ] Mint with QWAMI payment (success)
- [ ] Insufficient QWAMI balance (fail)
- [ ] Burn with 50% refund (success)
- [ ] Treasury accounting correct
- [ ] Generation cost calculation
- [ ] Dividend pool allocation (80/20)

**Integration:**
- [ ] Full user journey: SOL → QWAMI → NFT
- [ ] Burn journey: NFT → QWAMI → SOL
- [ ] Treasury balance correctness
- [ ] Public accounting queries

### **5.3 Audit Requirements**

**Critical Items:**
- Treasury fund handling (SOL/USDC/QWAMI)
- Cross-program invocations (CPI)
- PDA derivations and signatures
- Math operations (no overflow)
- Access control (authority checks)

**Recommended Auditors:**
- Otter Sec
- Neodyme
- Kudelski Security
- Trail of Bits

---

## 📦 Deployment Sequence

### **Step 1: Devnet Deployment**

```bash
# 1. Deploy QWAMI Token
cd solana/anchor/qwami-token
anchor clean && anchor build
anchor deploy --provider.cluster devnet

# Note program ID, update Anchor.toml and lib.rs
# Rebuild and redeploy

# 2. Initialize QWAMI with vaults
anchor run initialize-qwami

# 3. Deploy KWAMI NFT
cd ../kwami-nft
anchor clean && anchor build
anchor deploy --provider.cluster devnet

# Update program IDs
# Rebuild and redeploy

# 4. Initialize NFT program with treasury
anchor run initialize-nft-treasury

# 5. Test full flow on devnet
anchor test
```

### **Step 2: Mainnet Deployment**

After successful devnet testing and audit:

```bash
# Set to mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Ensure sufficient SOL for deployment
solana balance

# Deploy with mainnet cluster
anchor deploy --provider.cluster mainnet

# Initialize with production settings
# Enable multi-sig
# Set up monitoring
```

---

## 📈 Success Metrics

### **Technical Metrics**
- [ ] All tests passing (100% coverage)
- [ ] Zero critical audit findings
- [ ] Gas optimization (<5000 CU per instruction)
- [ ] Treasury accounting accuracy (100%)

### **Economic Metrics**
- [ ] QWAMI liquidity ($100K+ in vaults)
- [ ] 110% reserve maintained
- [ ] Dividend distribution successful
- [ ] NFT minting functional

### **User Metrics**
- [ ] <5 second transaction time
- [ ] <$0.50 average gas cost
- [ ] 95%+ transaction success rate
- [ ] Intuitive UI/UX

---

## 🛠️ Development Tools

### **Required**
- Rust 1.75+
- Solana CLI 1.18+
- Anchor 0.29+
- Node.js 18+

### **Recommended**
- Cursor IDE (Solana extension)
- Solana Explorer (devnet)
- Phantom Wallet (testing)
- Metaplex CLI

### **Testing**
- Anchor Test Suite
- Solana Test Validator
- Bankrun (fast testing)

---

## 📚 Reference Implementation

For similar implementations, study:
- Jupiter Exchange (SOL/token swaps)
- Marinade Finance (treasury management)
- Magic Eden (NFT marketplace with token payments)

---

## ⏱️ Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1 | 2 weeks | None |
| Phase 2 | 1-2 weeks | Phase 1 |
| Phase 3 | 1 week | Phases 1-2 |
| Phase 4 | 1-2 weeks | Phases 1-3 |
| Phase 5 | 1-2 weeks | All phases |
| **Total** | **6-9 weeks** | Sequential |

With 2-3 developers: **4-6 weeks**

---

## 🎯 Next Steps

1. **Immediate:**
   - Review this roadmap
   - Set up development environment
   - Start Phase 1 implementation

2. **Week 1-2:**
   - Implement QWAMI treasury system
   - Test SOL/USDC exchange thoroughly
   - Deploy to devnet

3. **Week 3-4:**
   - Implement NFT payment integration
   - Test full user journeys
   - Add frontend components

4. **Week 5-6:**
   - Security audit
   - Bug fixes
   - Mainnet preparation

---

**Document Version:** 1.0  
**Status:** Complete - Ready for Implementation  
**Last Updated:** November 19, 2025

---

*This roadmap represents ~200+ hours of development work. Plan accordingly!* 🚀

