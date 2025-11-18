# 👻 Kwami NFT Program

Solana NFT implementation with DNA-based uniqueness validation using Anchor Framework and Metaplex.

## 📋 Specifications

- **Symbol:** KWAMI
- **Standard:** Metaplex NFT
- **Decimals:** 0 (Non-fungible)
- **Storage:** Arweave for metadata and assets
- **Features:**
  - Unique DNA validation (SHA-256 hash)
  - On-chain DNA registry
  - Burn-and-remint for DNA changes
  - Metadata updates for mind/soul
  - Metaplex standard integration

## 🧬 DNA System

Each Kwami has a unique DNA hash calculated from its body configuration:

### DNA Components
- **Geometry:** resolution
- **Deformation:** spikes (x,y,z), time (x,y,z), rotation (x,y,z)
- **Visual:** colors (x,y,z), shininess, wireframe, opacity, baseScale
- **Skin:** tricolor, tricolor2, zebra

### DNA Calculation
```javascript
const dna = SHA256(
  normalized_body_config
);
// 64-character hex string
```

### Excluded from DNA
- Background configuration
- Audio effects
- Mind configuration (AI/TTS)
- Soul configuration (personality)

## 🏗️ Architecture

### Program Instructions

1. **Initialize**
   - Creates collection and DNA registry
   - Sets collection authority
   - Initializes counters

2. **Mint Kwami**
   - Validates DNA uniqueness
   - Creates Metaplex NFT
   - Registers DNA on-chain
   - Increments collection counter

3. **Update Metadata**
   - Updates metadata URI (mind/soul changes)
   - DNA must remain unchanged
   - Owner-only operation

4. **Burn Kwami**
   - Burns NFT token
   - Removes DNA from registry
   - Allows DNA re-use

5. **Check DNA Exists**
   - Query if DNA is registered
   - For frontend validation

6. **Transfer Kwami**
   - Updates ownership record
   - Complements SPL token transfer

### State Accounts

#### CollectionAuthority (PDA)
```rust
{
    authority: Pubkey,         // Collection authority
    collection_mint: Pubkey,   // Collection mint
    total_minted: u64,         // Total NFTs minted
    bump: u8                   // PDA bump
}
```
**Seeds:** `["collection-authority", collection_mint]`

#### DnaRegistry (PDA)
```rust
{
    authority: Pubkey,              // Registry authority
    collection: Pubkey,             // Collection reference
    dna_hashes: Vec<[u8; 32]>,     // Array of DNA hashes
    dna_count: u64                  // Count of registered DNAs
}
```
**Seeds:** `["dna-registry", collection_mint]`
**Capacity:** 1000 DNAs per account

#### KwamiNft (PDA)
```rust
{
    mint: Pubkey,              // NFT mint address
    owner: Pubkey,             // Current owner
    dna_hash: [u8; 32],       // SHA-256 DNA
    minted_at: i64,           // Unix timestamp
    updated_at: i64,          // Unix timestamp
    metadata_uri: String,      // Arweave URI
    bump: u8                   // PDA bump
}
```
**Seeds:** `["kwami-nft", mint]`

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
cd /home/quantium/labs/quami/solana/anchor/kwami-nft

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

# Note the program ID
# Update Anchor.toml and lib.rs with the new program ID
# declare_id!("YourNewProgramIDHere");

# Rebuild and redeploy
anchor build
anchor deploy
```

### Update Environment Variables

After deployment, update `/home/quantium/labs/quami/.env`:

```env
NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=<program_id>
NUXT_PUBLIC_KWAMI_COLLECTION_MINT=<collection_mint>
NUXT_PUBLIC_KWAMI_COLLECTION_AUTHORITY=<authority_pda>
```

## 📝 Usage Examples

### Initialize Collection

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { KwamiNft } from "../target/types/kwami_nft";

const program = anchor.workspace.KwamiNft as Program<KwamiNft>;
const provider = anchor.AnchorProvider.env();

// Generate collection mint keypair
const collectionMint = anchor.web3.Keypair.generate();

// Find PDAs
const [collectionAuthority, colBump] = await anchor.web3.PublicKey.findProgramAddress(
  [Buffer.from("collection-authority"), collectionMint.publicKey.toBuffer()],
  program.programId
);

const [dnaRegistry] = await anchor.web3.PublicKey.findProgramAddress(
  [Buffer.from("dna-registry"), collectionMint.publicKey.toBuffer()],
  program.programId
);

// Initialize
await program.methods
  .initialize(colBump)
  .accounts({
    collectionMint: collectionMint.publicKey,
    collectionAuthority,
    dnaRegistry,
    payer: provider.wallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  })
  .signers([collectionMint])
  .rpc();
```

### Mint Kwami NFT

```typescript
// Calculate DNA (use frontend utility)
const dnaHash = calculateKwamiDNA(bodyConfig); // Returns SHA-256 hash
const dnaHashBytes = Buffer.from(dnaHash, 'hex'); // Convert to bytes

// Generate mint keypair
const mintKeypair = anchor.web3.Keypair.generate();

// Find metadata PDA (Metaplex)
const [metadata] = await anchor.web3.PublicKey.findProgramAddress(
  [
    Buffer.from("metadata"),
    METADATA_PROGRAM_ID.toBuffer(),
    mintKeypair.publicKey.toBuffer(),
  ],
  METADATA_PROGRAM_ID
);

// Find Kwami NFT PDA
const [kwamiNft] = await anchor.web3.PublicKey.findProgramAddress(
  [Buffer.from("kwami-nft"), mintKeypair.publicKey.toBuffer()],
  program.programId
);

// Mint
await program.methods
  .mintKwami(
    Array.from(dnaHashBytes),
    "Kwami #1",
    "KWAMI",
    "https://arweave.net/metadata-uri"
  )
  .accounts({
    mint: mintKeypair.publicKey,
    kwamiNft,
    collectionAuthority,
    dnaRegistry,
    metadata,
    owner: provider.wallet.publicKey,
    metadataProgram: METADATA_PROGRAM_ID,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  })
  .signers([mintKeypair])
  .rpc();
```

### Check DNA Exists

```typescript
const dnaHashBytes = Buffer.from(dnaHash, 'hex');

const exists = await program.methods
  .checkDnaExists(Array.from(dnaHashBytes))
  .accounts({
    dnaRegistry,
  })
  .view();

console.log("DNA exists:", exists);
```

### Update Metadata

```typescript
// Update mind/soul configuration (DNA stays same)
await program.methods
  .updateMetadata("https://arweave.net/new-metadata-uri")
  .accounts({
    kwamiNft,
    owner: provider.wallet.publicKey,
  })
  .rpc();
```

### Burn and Remint

```typescript
// Burn existing NFT
await program.methods
  .burnKwami()
  .accounts({
    kwamiNft,
    mint: mintPubkey,
    dnaRegistry,
    owner: provider.wallet.publicKey,
    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
  })
  .rpc();

// Now can mint with different DNA
```

## 🔐 Security

### Access Control

- **Initialize:** Anyone can create collection (should be restricted in production)
- **Mint:** Any user can mint (with DNA validation)
- **Update:** Only NFT owner can update metadata
- **Burn:** Only NFT owner can burn
- **Transfer:** Only current owner

### Constraints

- DNA uniqueness enforced on-chain
- Owner validation on all mutations
- Input length limits (name, symbol, URI)
- Registry capacity limits (1000 DNAs per account)
- PDA-based authorities

### DNA Registry

- Fixed capacity: 1000 DNAs per account
- For more capacity, implement multiple registries with sharding
- DNS removal on burn for re-use

## 🧪 Testing

Run the test suite:

```bash
anchor test
```

Tests cover:
- ✓ Collection initialization
- ✓ NFT minting with valid DNA
- ✓ Duplicate DNA rejection
- ✓ Metadata updates
- ✓ Burn and DNA removal
- ✓ Transfer ownership
- ✓ Access control

## 📡 Integration

### Frontend (TypeScript)

```typescript
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import KwamiNftIDL from "./idl/kwami_nft.json";
import { calculateKwamiDNA } from "@/utils/kwami/calculateKwamiDNA";

const connection = new Connection("https://api.devnet.solana.com");
const programId = new PublicKey("YourProgramID");

const program = new Program(KwamiNftIDL, programId, provider);

// Calculate DNA before minting
const dna = calculateKwamiDNA(bodyConfig);

// Check uniqueness
const exists = await checkDNAExists(program, dna);
if (exists) {
  // Show error: DNA already exists
}
```

### Backend (Node.js)

See `/home/quantium/labs/quami/server/api/kwami/` for API implementation.

## 🔄 Workflow

### New Kwami (Unique DNA)
1. User configures body
2. Frontend calculates DNA
3. Check DNA uniqueness
4. Upload assets to Arweave
5. Upload metadata to Arweave
6. Mint NFT with DNA

### Update Mind/Soul (Same DNA)
1. User updates mind/soul config
2. Upload new metadata to Arweave
3. Call `update_metadata` with new URI
4. DNA remains registered

### Change Body (Different DNA)
1. User changes body config
2. Calculate new DNA
3. Check new DNA uniqueness
4. Burn existing NFT
5. Mint new NFT with new DNA

## ⚠️ Important Notes

1. **Program ID:** Update `declare_id!()` after first deployment
2. **DNA Registry:** Limited to 1000 entries (implement sharding for more)
3. **Metadata URI:** Max 200 characters
4. **Name:** Max 32 characters
5. **Symbol:** Max 10 characters
6. **Devnet Only:** Current configuration for testing

## 📊 Monitoring

### View Program Logs

```bash
solana logs <program_id>
```

### Query DNA Registry

```bash
solana account <dna_registry_pda>
```

### Check Collection Stats

```bash
# Query collection authority account
solana account <collection_authority_pda>
```

## 📚 Resources

- [Anchor Documentation](https://www.anchor-lang.com/)
- [Metaplex Documentation](https://docs.metaplex.com/)
- [Solana NFT Standard](https://docs.metaplex.com/programs/token-metadata/)

---

**Status:** Ready for Devnet Deployment  
**Version:** 0.1.0  
**License:** See main project LICENSE
