# QWAMI Token Updates - Aligned with Source of Truth

## 📝 Summary

Updated the QWAMI token Anchor program to align with the specifications from the qwami landing page (source of truth at `../qwami/README.md`).

## 🔄 Key Changes

### 1. Token Decimals: 9 → 0 (Integer Token)
**Critical Change**: QWAMI is now an **integer token** with 0 decimals, meaning no fractional tokens are allowed.

#### Files Modified:
- `programs/qwami-token/src/lib.rs`
  - Changed `mint::decimals = 0` (was 9)
  - Updated `MAX_SUPPLY = 1_000_000_000_000` (was 1e21)
  - Removed division by `10^9` in logging

- `tests/qwami-token.ts`
  - Changed `DECIMALS = 0` (was 9)
  - Updated `MAX_SUPPLY = 1_000_000_000_000` (was 1T * 10^9)
  - Removed all `.mul(new anchor.BN(1_000_000_000))` multiplications
  - All token amounts are now whole integers

### 2. Enhanced Documentation

#### README.md Updates:
- Added comprehensive overview section
- Added detailed tokenomics section matching source of truth:
  - Price: $0.01 USD
  - Max Supply: 1 Trillion
  - Decimals: 0 (Integer token)
  - Model: Deflationary + Revenue sharing
  
- Added Token Utility section explaining:
  - **💰 Weekly Dividends** - 80% profit distribution every Friday
  - **🔒 Staking** - APY rewards + dividend eligibility
  - **⚡ Energy** - Powers AI API calls and DAO voting
  - **🔗 Connections** - App integration expansion
  - **🦋 Metamorphosis** - Multiple KWAMI configurations

- Updated ecosystem integration:
  - kwami.io - Core framework
  - qwami.io - Token landing page
  - candy.kwami.io - NFT minting
  - market.kwami.io - Marketplace

- Updated code examples:
  - Minting: `new anchor.BN(1000)` for 1000 tokens (was 1000_000_000_000)
  - Burning: `new anchor.BN(100)` for 100 tokens (was 100_000_000_000)

### 3. Package Metadata

#### Cargo.toml:
- Updated description to: "QWAMI SPL Token - Integer token with 1 trillion supply, powering KWAMI AI ecosystem"

## ⚠️ Important Breaking Changes

### For Frontend/Backend Integration:

**Before (9 decimals):**
```typescript
// 1 QWAMI = 1_000_000_000 (base units)
const amount = new anchor.BN(1000).mul(new anchor.BN(1_000_000_000)); // 1000 QWAMI
```

**After (0 decimals):**
```typescript
// 1 QWAMI = 1 (base unit)
const amount = new anchor.BN(1000); // 1000 QWAMI
```

### For Wallet Displays:

**Before:**
- Display amount divided by 1e9
- Example: `1000000000000` → "1000.00 QWAMI"

**After:**
- Display amount as-is (integer)
- Example: `1000` → "1000 QWAMI"

## 🧪 Testing

All tests have been updated to reflect 0 decimals:
- ✅ Initialize with 0 decimals
- ✅ Mint integer amounts
- ✅ Burn integer amounts
- ✅ Max supply validation (1 trillion)
- ✅ Price updates
- ✅ Authority transfer

Run tests:
```bash
cd /home/kali/labs/kwami/solana/anchor/qwami-token
anchor test
```

## 🚀 Deployment Notes

### Before Deploying:

1. **Clean previous builds:**
   ```bash
   anchor clean
   ```

2. **Build with new specifications:**
   ```bash
   anchor build
   ```

3. **Update program ID** in `lib.rs`:
   ```rust
   declare_id!("YourNewProgramIDHere");
   ```

4. **Deploy to devnet:**
   ```bash
   anchor deploy
   ```

### After Deployment:

1. Update environment variables in all dependent projects:
   - qwami frontend
   - candy.kwami.io
   - market.kwami.io
   - DAO

2. Update IDL files in frontend applications

3. Update any hardcoded decimal conversions

## 📊 Token Specifications Summary

| Property | Value |
|----------|-------|
| Symbol | QWAMI |
| Name | QWAMI Token |
| Decimals | **0** (Integer) |
| Max Supply | 1,000,000,000,000 |
| Price | $0.01 USD |
| Network | Solana |
| Standard | SPL Token |
| Model | Deflationary + Revenue Share |
| Dividends | 80% weekly (Fridays) |

## 🔗 References

- **Source of Truth:** `/home/kali/labs/qwami/README.md`
- **Landing Page:** qwami.io
- **Minting:** candy.kwami.io
- **Marketplace:** market.kwami.io
- **Framework:** kwami.io

## ✅ Verification Checklist

- [x] Updated Rust program decimals to 0
- [x] Updated MAX_SUPPLY constant
- [x] Updated test suite
- [x] Updated README documentation
- [x] Updated Cargo.toml description
- [x] Added token utility documentation
- [x] Added tokenomics section
- [x] Added ecosystem integration info
- [x] No linter errors

---

**Updated:** November 19, 2025  
**Status:** Ready for clean build and deployment  
**Version:** 1.5.11 → 0.2.0 (breaking change)

