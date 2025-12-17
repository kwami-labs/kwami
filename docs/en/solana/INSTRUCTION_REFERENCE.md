# 📖 Instruction Reference Guide

**Quick reference for all KWAMI ecosystem program instructions**

---

## 🪙 QWAMI Token Program

### **1. initialize**
Initialize the QWAMI token program with treasury

```rust
pub fn initialize(ctx: Context<Initialize>) -> Result<()>
```

**Accounts:**
- `mint` - QWAMI token mint (PDA)
- `token_authority` - Token authority PDA
- `treasury` - QWAMI treasury PDA
- `usdc_vault` - Treasury's USDC vault
- `usdc_mint` - Official USDC mint
- `payer` - Signer paying for accounts

**Seeds:**
- Token Authority: `["token-authority", mint]`
- Treasury: `["qwami-treasury"]`

---

### **2. mint_with_sol**
Mint QWAMI tokens by paying with SOL

```rust
pub fn mint_with_sol(ctx: Context<MintWithSol>, sol_lamports: u64) -> Result<()>
```

**Parameters:**
- `sol_lamports` - Amount of SOL in lamports to pay

**Accounts:**
- `mint` - QWAMI token mint
- `token_authority` - Token authority PDA
- `treasury` - Treasury PDA
- `sol_vault` - Treasury's SOL vault (PDA)
- `buyer_qwami_account` - Buyer's QWAMI token account
- `buyer` - Signer paying SOL

**Formula:**
```
1 SOL (1,000,000,000 lamports) = 1,000 QWAMI
```

**Example:**
```typescript
await program.methods
  .mintWithSol(new BN(1_000_000_000)) // 1 SOL
  .accounts({
    mint: qwamiMint,
    tokenAuthority: tokenAuthorityPda,
    treasury: treasuryPda,
    solVault: solVaultPda,
    buyerQwamiAccount: userQwamiAta,
    buyer: wallet.publicKey,
  })
  .rpc();
// User receives 1,000 QWAMI
```

---

### **3. mint_with_usdc**
Mint QWAMI tokens by paying with USDC

```rust
pub fn mint_with_usdc(ctx: Context<MintWithUsdc>, usdc_amount: u64) -> Result<()>
```

**Parameters:**
- `usdc_amount` - Amount of USDC (in smallest units, 6 decimals)

**Accounts:**
- `mint` - QWAMI token mint
- `token_authority` - Token authority PDA
- `treasury` - Treasury PDA
- `usdc_vault` - Treasury's USDC vault
- `buyer_usdc_account` - Buyer's USDC token account
- `buyer_qwami_account` - Buyer's QWAMI token account
- `buyer` - Signer paying USDC

**Formula:**
```
1 USDC (1,000,000 units) = 100 QWAMI
$0.01 per QWAMI
```

**Example:**
```typescript
await program.methods
  .mintWithUsdc(new BN(1_000_000)) // 1 USDC
  .accounts({
    mint: qwamiMint,
    tokenAuthority: tokenAuthorityPda,
    treasury: treasuryPda,
    usdcVault: usdcVaultPda,
    buyerUsdcAccount: userUsdcAta,
    buyerQwamiAccount: userQwamiAta,
    buyer: wallet.publicKey,
  })
  .rpc();
// User receives 100 QWAMI
```

---

### **4. burn_for_sol**
Burn QWAMI tokens to receive SOL

```rust
pub fn burn_for_sol(ctx: Context<BurnForSol>, qwami_amount: u64) -> Result<()>
```

**Parameters:**
- `qwami_amount` - Amount of QWAMI to burn

**Accounts:**
- `mint` - QWAMI token mint
- `token_authority` - Token authority PDA
- `treasury` - Treasury PDA
- `sol_vault` - Treasury's SOL vault (PDA)
- `seller_qwami_account` - Seller's QWAMI token account
- `seller` - Signer burning QWAMI

**Formula:**
```
1,000 QWAMI = 1 SOL
```

**Example:**
```typescript
await program.methods
  .burnForSol(new BN(1_000)) // 1,000 QWAMI
  .accounts({
    mint: qwamiMint,
    tokenAuthority: tokenAuthorityPda,
    treasury: treasuryPda,
    solVault: solVaultPda,
    sellerQwamiAccount: userQwamiAta,
    seller: wallet.publicKey,
  })
  .rpc();
// User receives 1 SOL
```

---

### **5. burn_for_usdc**
Burn QWAMI tokens to receive USDC

```rust
pub fn burn_for_usdc(ctx: Context<BurnForUsdc>, qwami_amount: u64) -> Result<()>
```

**Parameters:**
- `qwami_amount` - Amount of QWAMI to burn

**Accounts:**
- `mint` - QWAMI token mint
- `token_authority` - Token authority PDA
- `treasury` - Treasury PDA
- `usdc_vault` - Treasury's USDC vault
- `seller_usdc_account` - Seller's USDC token account
- `seller_qwami_account` - Seller's QWAMI token account
- `seller` - Signer burning QWAMI

**Formula:**
```
100 QWAMI = 1 USDC
```

**Example:**
```typescript
await program.methods
  .burnForUsdc(new BN(100)) // 100 QWAMI
  .accounts({
    mint: qwamiMint,
    tokenAuthority: tokenAuthorityPda,
    treasury: treasuryPda,
    usdcVault: usdcVaultPda,
    sellerUsdcAccount: userUsdcAta,
    sellerQwamiAccount: userQwamiAta,
    seller: wallet.publicKey,
  })
  .rpc();
// User receives 1 USDC
```

---

## 🦋 KWAMI NFT Program

### **1. initialize**
Initialize the KWAMI NFT program with collection, DNA registry, and treasury

```rust
pub fn initialize(ctx: Context<Initialize>) -> Result<()>
```

**Accounts:**
- `collection_mint` - Collection mint (PDA)
- `collection_authority` - Collection authority PDA
- `dna_registry` - DNA registry PDA
- `treasury` - KWAMI treasury PDA
- `qwami_vault` - Treasury's QWAMI vault
- `qwami_mint` - QWAMI token mint
- `payer` - Signer paying for accounts

**Seeds:**
- Collection Authority: `["collection-authority", collection_mint]`
- DNA Registry: `["dna-registry", collection_mint]`
- Treasury: `["kwami-treasury"]`

---

### **2. mint_kwami**
Mint a new KWAMI NFT (requires QWAMI payment)

```rust
pub fn mint_kwami(
    ctx: Context<MintKwami>,
    dna_hash: [u8; 32],
    name: String,
    symbol: String,
    uri: String,
) -> Result<()>
```

**Parameters:**
- `dna_hash` - SHA-256 hash of DNA (must be unique)
- `name` - NFT name (max 32 chars)
- `symbol` - NFT symbol (max 10 chars)
- `uri` - Metadata URI (max 200 chars, Arweave)

**Accounts:**
- `mint` - NFT token mint (PDA)
- `kwami_nft` - KWAMI NFT account (PDA)
- `collection_authority` - Collection authority PDA
- `dna_registry` - DNA registry PDA
- `treasury` - KWAMI treasury PDA
- `user_qwami_account` - User's QWAMI token account
- `qwami_vault` - Treasury's QWAMI vault
- `metadata` - Metaplex metadata account
- `owner` - Signer minting NFT

**Pricing by Generation:**
| Generation | Years | Base Cost |
|------------|-------|-----------|
| Gen #0 | 2026 | 10,000 QWAMI |
| Gen #1-5 | 2027-2031 | 5,000 QWAMI |
| Gen #6-20 | 2032-2046 | 2,500 QWAMI |
| Gen #21-50 | 2047-2076 | 1,000 QWAMI |
| Gen #51-74 | 2077-2100 | 500 QWAMI |

**Total Cost:**
```
Total = Base Cost + Platform Fee (10%) + TX Fee (50 QWAMI)

Example (Gen #0):
Total = 10,000 + 1,000 + 50 = 11,050 QWAMI
```

**Example:**
```typescript
const dnaHash = new Uint8Array(32); // SHA-256 hash
crypto.getRandomValues(dnaHash);

await program.methods
  .mintKwami(
    Array.from(dnaHash),
    "Kwami #1",
    "KWAMI",
    "https://arweave.net/..."
  )
  .accounts({
    mint: nftMint.publicKey,
    kwamiNft: kwamiNftPda,
    collectionAuthority: collectionAuthorityPda,
    dnaRegistry: dnaRegistryPda,
    treasury: treasuryPda,
    userQwamiAccount: userQwamiAta,
    qwamiVault: qwamiVaultPda,
    metadata: metadataPda,
    owner: wallet.publicKey,
    metadataProgram: METAPLEX_PROGRAM_ID,
  })
  .rpc();
```

---

### **3. burn_kwami**
Burn KWAMI NFT and receive 50% QWAMI refund

```rust
pub fn burn_kwami(ctx: Context<BurnKwami>) -> Result<()>
```

**Accounts:**
- `kwami_nft` - KWAMI NFT account (PDA, will be closed)
- `mint` - NFT token mint
- `dna_registry` - DNA registry PDA
- `treasury` - KWAMI treasury PDA
- `user_qwami_account` - User's QWAMI token account
- `qwami_vault` - Treasury's QWAMI vault
- `owner` - Signer burning NFT

**Refund:**
```
Refund = Original Base Cost × 50%

Example (Gen #0 NFT):
Refund = 10,000 × 50% = 5,000 QWAMI
```

**Example:**
```typescript
await program.methods
  .burnKwami()
  .accounts({
    kwamiNft: kwamiNftPda,
    mint: nftMint.publicKey,
    dnaRegistry: dnaRegistryPda,
    treasury: treasuryPda,
    userQwamiAccount: userQwamiAta,
    qwamiVault: qwamiVaultPda,
    owner: wallet.publicKey,
  })
  .rpc();
// User receives 5,000 QWAMI refund (50% of 10,000 base cost)
// DNA becomes available for reminting
```

---

## 🔍 Query Treasury State

### **QWAMI Treasury**
```typescript
const treasury = await program.account.qwamiTreasury.fetch(treasuryPda);

console.log("SOL Received:", treasury.totalSolReceived);
console.log("USDC Received:", treasury.totalUsdcReceived);
console.log("SOL Distributed:", treasury.totalSolDistributed);
console.log("USDC Distributed:", treasury.totalUsdcDistributed);
console.log("QWAMI Mints (SOL):", treasury.qwamiMintsWithSol);
console.log("QWAMI Mints (USDC):", treasury.qwamiMintsWithUsdc);
```

### **KWAMI Treasury**
```typescript
const treasury = await program.account.kwamiTreasury.fetch(treasuryPda);

console.log("QWAMI Received:", treasury.totalQwamiReceived);
console.log("QWAMI Refunded:", treasury.totalQwamiRefunded);
console.log("NFT Mints:", treasury.nftMintsCount);
console.log("NFT Burns:", treasury.nftBurnsCount);
console.log("Dividend Pool:", treasury.dividendPoolBalance);
console.log("Operations Fund:", treasury.operationsBalance);
```

---

## 🔑 PDA Seeds Reference

### **QWAMI Token Program:**
```
Token Authority:  ["token-authority", mint]
QWAMI Treasury:   ["qwami-treasury"]
SOL Vault:        ["sol-vault"]
```

### **KWAMI NFT Program:**
```
Collection Authority: ["collection-authority", collection_mint]
DNA Registry:         ["dna-registry", collection_mint]
KWAMI Treasury:       ["kwami-treasury"]
KWAMI NFT:            ["kwami-nft", nft_mint]
```

---

## ⚠️ Error Codes

### **QWAMI Token:**
- `MaxSupplyExceeded` - Cannot mint more than 1 trillion tokens
- `InvalidAuthority` - Invalid authority provided
- `InvalidPrice` - Invalid price value
- `MathOverflow` - Math operation overflow
- `InvalidTreasuryVault` - Invalid treasury vault
- `InsufficientTreasuryBalance` - Not enough funds in treasury

### **KWAMI NFT:**
- `MaxSupplyReached` - 10 billion NFTs minted
- `GenerationSupplyReached` - Current generation's cap reached
- `DuplicateDNA` - DNA hash already exists
- `RegistryFull` - DNA registry at capacity
- `InvalidOwner` - Not the owner of this NFT
- `NameTooLong` - Name > 32 characters
- `SymbolTooLong` - Symbol > 10 characters
- `UriTooLong` - URI > 200 characters
- `InsufficientQwamiBalance` - Not enough QWAMI to mint
- `InvalidQwamiMint` - Wrong QWAMI mint address
- `InvalidQwamiAccount` - Invalid QWAMI account
- `InvalidTreasuryVault` - Invalid treasury vault
- `InsufficientTreasuryBalance` - Treasury can't process refund

---

## 📊 Economic Formulas

### **QWAMI Minting:**
```
With SOL:  QWAMI = (SOL_lamports / 1_000_000)
With USDC: QWAMI = (USDC_units / 10_000)
```

### **QWAMI Burning:**
```
To SOL:  SOL_lamports = QWAMI × 1_000_000
To USDC: USDC_units = QWAMI × 10_000
```

### **KWAMI NFT Minting:**
```
Base Cost by Generation (see table above)
Platform Fee = Base × 10%
TX Fee = 50 QWAMI
Total Cost = Base + Platform Fee + TX Fee
```

### **KWAMI NFT Burning:**
```
Refund = Original Base Cost × 50%
```

### **Revenue Split:**
```
80% → Dividend Pool (weekly distribution)
20% → Operations Fund
```

---

**Last Updated:** November 22, 2025  
**Version:** 1.5.12  
**Status:** Production Ready 🚀

