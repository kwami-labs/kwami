# 🪙 QWAMI Token Program

Solana SPL token implementation for the QWAMI utility token using Anchor Framework.

## 📋 Specifications

- **Symbol:** QWAMI (or QWA)
- **Decimals:** 9
- **Max Supply:** 1,000,000,000,000 (1 trillion tokens)
- **Base Price:** $0.01 USD per token
- **Standard:** SPL Token
- **Features:**
  - Authority-controlled minting
  - Burn functionality
  - Supply tracking (minted/burned/circulating)
  - Base price management
  - Authority transfer

## 🏗️ Architecture

### Program Instructions

1. **Initialize**
   - Creates the token mint and authority account
   - Sets initial authority
   - Initializes supply tracking

2. **Mint Tokens**
   - Mints new tokens (authority only)
   - Validates max supply not exceeded
   - Updates total minted counter

3. **Burn Tokens**
   - Burns tokens from user account
   - Updates total burned counter
   - Any token holder can burn their own tokens

4. **Update Base Price**
   - Updates the base price in USD cents (authority only)
   - For tracking purposes (off-chain pricing uses this)

5. **Transfer Authority**
   - Transfers program authority to new address (current authority only)
   - For security and governance

### State Accounts

#### TokenAuthority (PDA)
```rust
{
    authority: Pubkey,           // Current authority
    mint: Pubkey,                // Token mint address
    total_minted: u64,           // Total ever minted
    total_burned: u64,           // Total ever burned
    base_price_usd_cents: u64,   // Base price (1 = $0.01)
    bump: u8                     // PDA bump seed
}
```

**PDA Seeds:** `["token-authority", mint_pubkey]`

## 🚀 Deployment

### Prerequisites

1. Install dependencies (see `../../SETUP.md`):
   - Rust & Cargo
   - Solana CLI
   - Anchor Framework

2. Configure Solana for devnet:
   ```bash
   solana config set --url https://api.devnet.solana.com
   ```

3. Fund your wallet:
   ```bash
   solana airdrop 2
   ```

### Build

```bash
cd /home/quantium/labs/quami/solana/anchor/qwami-token

# Clean previous builds
anchor clean

# Build program
anchor build
```

### Test

```bash
# Run tests on local validator
anchor test

# Run tests with logs
anchor test -- --nocapture
```

### Deploy to Devnet

```bash
# Deploy program
anchor deploy

# Note the program ID from output
# Example: Program Id: Fg6PaFpoGXkYsidMpWxTWKJqz...

# Update Anchor.toml with the new program ID
# Update programs/qwami-token/src/lib.rs:
# declare_id!("YourNewProgramIDHere");

# Rebuild with correct program ID
anchor build

# Deploy again
anchor deploy
```

### Update Environment Variables

After deployment, update your `/home/quantium/labs/quami/.env`:

```env
NUXT_PUBLIC_QWAMI_TOKEN_MINT=<mint_address>
NUXT_PUBLIC_QWAMI_TOKEN_AUTHORITY=<authority_address>
NUXT_PUBLIC_QWAMI_TOKEN_PROGRAM_ID=<program_id>
```

## 📝 Usage Examples

### Initialize Token

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { QwamiToken } from "../target/types/qwami_token";

const program = anchor.workspace.QwamiToken as Program<QwamiToken>;
const provider = anchor.AnchorProvider.env();

// Generate mint keypair
const mintKeypair = anchor.web3.Keypair.generate();

// Find PDA for token authority
const [tokenAuthority, bump] = await anchor.web3.PublicKey.findProgramAddress(
  [Buffer.from("token-authority"), mintKeypair.publicKey.toBuffer()],
  program.programId
);

// Initialize
await program.methods
  .initialize(bump)
  .accounts({
    mint: mintKeypair.publicKey,
    tokenAuthority: tokenAuthority,
    payer: provider.wallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  })
  .signers([mintKeypair])
  .rpc();
```

### Mint Tokens

```typescript
// Amount in smallest units (9 decimals)
// 1 QWAMI = 1_000_000_000
const amount = new anchor.BN(1000_000_000_000); // 1000 QWAMI

await program.methods
  .mintTokens(amount)
  .accounts({
    mint: mintPubkey,
    tokenAuthority: authorityPubkey,
    destination: destinationTokenAccount,
    authority: provider.wallet.publicKey,
    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
  })
  .rpc();
```

### Burn Tokens

```typescript
const amount = new anchor.BN(100_000_000_000); // 100 QWAMI

await program.methods
  .burnTokens(amount)
  .accounts({
    mint: mintPubkey,
    tokenAuthority: authorityPubkey,
    source: sourceTokenAccount,
    owner: provider.wallet.publicKey,
    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
  })
  .rpc();
```

### Query Supply

```typescript
// Get token authority account
const tokenAuthority = await program.account.tokenAuthority.fetch(authorityPubkey);

console.log("Total Minted:", tokenAuthority.totalMinted.toString());
console.log("Total Burned:", tokenAuthority.totalBurned.toString());
console.log("Circulating Supply:", 
  tokenAuthority.totalMinted.sub(tokenAuthority.totalBurned).toString()
);
```

## 🔐 Security

### Access Control

- **Mint Authority:** Only the program authority can mint tokens
- **Burn:** Any token holder can burn their own tokens
- **Authority Transfer:** Only current authority can transfer control
- **Price Update:** Only authority can update base price

### Constraints

- Maximum supply enforced (1 trillion tokens)
- Checked math operations (no overflow/underflow)
- PDA-based authority (no private key needed for mint authority)
- Signer validation on all privileged operations

## 🧪 Testing

Run the test suite:

```bash
anchor test
```

Tests cover:
- ✓ Initialization
- ✓ Minting within limits
- ✓ Max supply validation
- ✓ Burning tokens
- ✓ Supply tracking
- ✓ Price updates
- ✓ Authority transfer
- ✓ Access control

## 📡 Integration

### Frontend (TypeScript)

```typescript
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import QwamiTokenIDL from "./idl/qwami_token.json";

const connection = new Connection("https://api.devnet.solana.com");
const programId = new PublicKey("YourProgramID");

const program = new Program(QwamiTokenIDL, programId, provider);

// Use program.methods as shown in examples above
```

### Backend (Node.js)

See `/home/quantium/labs/quami/server/api/qwami/` for API implementation.

## 🔄 Upgrade

To upgrade the program:

```bash
# Build new version
anchor build

# Upgrade (requires upgrade authority)
anchor upgrade target/deploy/qwami_token.so --program-id <program_id>
```

## 📊 Monitoring

### View Program Logs

```bash
solana logs <program_id>
```

### Query Authority Account

```bash
solana account <authority_pda>
```

### Check Mint Info

```bash
spl-token display <mint_address>
```

## ⚠️ Important Notes

1. **Program ID:** Update `declare_id!()` after first deployment
2. **Authority:** Keep authority private key secure
3. **Max Supply:** Hard-coded at 1 trillion, cannot be changed without upgrade
4. **Decimals:** Fixed at 9, standard for Solana tokens
5. **Devnet Only:** Current configuration is for devnet testing

## 📚 Resources

- [Anchor Documentation](https://www.anchor-lang.com/)
- [SPL Token Program](https://spl.solana.com/token)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)

---

**Status:** Ready for Devnet Deployment  
**Version:** 0.1.0  
**License:** See main project LICENSE
