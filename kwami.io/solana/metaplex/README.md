# 🎨 Metaplex Configuration & Arweave Utilities

This directory contains configuration and utilities for Kwami NFT collection management using Metaplex and Arweave storage.

## 📂 Directory Structure

```
metaplex/
├── collection/              # Collection metadata and assets
│   └── collection-metadata.json
├── utils/                   # TypeScript utilities
│   ├── uploadToArweave.ts  # Arweave upload functions
│   └── createCollection.ts # Collection initialization
└── README.md               # This file
```

## 🎯 Overview

### Metaplex Integration

The Kwami NFT collection uses the Metaplex NFT standard for:
- NFT metadata structure
- Collection management
- Arweave storage via Bundlr

### Arweave Storage

All Kwami NFT assets and metadata are stored permanently on Arweave:
- **GLB files** - 3D Kwami models
- **Thumbnails** - PNG preview images
- **Metadata** - JSON metadata following Metaplex standard

## 🚀 Getting Started

### Prerequisites

1. Solana CLI configured for devnet
2. Funded wallet (at least 0.5 SOL for collection + Bundlr fees)
3. Kwami NFT program deployed
4. Node.js/TypeScript environment

### Install Dependencies

```bash
cd /home/quantium/labs/quami
bun install
# Or: npm install
```

## 📝 Usage

### 1. Initialize Collection

Use the shell script for automated deployment:

```bash
cd /home/quantium/labs/quami/solana/scripts
./initialize-collection.sh
```

Or use the TypeScript utility:

```bash
cd /home/quantium/labs/quami/solana/metaplex
ts-node utils/createCollection.ts \
  https://api.devnet.solana.com \
  YOUR_PROGRAM_ID \
  ~/.config/solana/id.json \
  ./kwami-collection.json
```

This will:
1. Load your wallet
2. Generate collection mint
3. Initialize collection on-chain
4. Create DNA registry
5. Output collection details

### 2. Upload to Arweave

#### Upload Single File

```typescript
import { initializeMetaplex, uploadFileToArweave } from './utils/uploadToArweave';
import { Keypair } from '@solana/web3.js';
import fs from 'fs';

// Initialize
const wallet = Keypair.fromSecretKey(/* your secret key */);
const metaplex = initializeMetaplex({
  rpcUrl: 'https://api.devnet.solana.com',
  walletKeypair: wallet,
});

// Upload file
const buffer = fs.readFileSync('./kwami.glb');
const result = await uploadFileToArweave(metaplex, buffer, 'kwami.glb');

console.log('Arweave URI:', result.uri);
```

#### Upload JSON Metadata

```typescript
import { uploadJsonToArweave } from './utils/uploadToArweave';

const metadata = {
  name: "Kwami #1",
  symbol: "KWAMI",
  description: "Unique AI companion",
  // ... rest of metadata
};

const result = await uploadJsonToArweave(metaplex, metadata);
console.log('Metadata URI:', result.uri);
```

#### Upload Complete Kwami NFT

```typescript
import { uploadCompleteKwamiNFT } from './utils/uploadToArweave';
import { prepareKwamiMetadata } from '../../app/utils/kwami/prepareKwamiMetadata';

// Prepare metadata
const metadata = prepareKwamiMetadata({
  name: "Kwami #1",
  description: "A unique AI companion",
  creatorWallet: wallet.publicKey.toBase58(),
  dna: dnaHash,
  body: bodyConfig,
  mind: mindConfig,
  soul: soulConfig,
  imageUri: '', // Will be filled by upload
  glbUri: '',   // Will be filled by upload
});

// Upload everything
const result = await uploadCompleteKwamiNFT(
  { rpcUrl, walletKeypair: wallet },
  glbBuffer,
  thumbnailBuffer,
  metadata
);

console.log('Metadata URI:', result.uri);
```

## 💰 Bundlr Funding

Arweave uploads are paid through Bundlr. You need to fund your Bundlr account:

### Check Balance

```typescript
import { getBundlrBalance } from './utils/uploadToArweave';

const balance = await getBundlrBalance(metaplex);
console.log(`Bundlr Balance: ${balance / 1e9} SOL`);
```

### Fund Bundlr

```typescript
import { fundBundlr } from './utils/uploadToArweave';

// Fund with 0.1 SOL
await fundBundlr(metaplex, 0.1);
```

### Estimate Costs

```typescript
import { estimateUploadCost } from './utils/uploadToArweave';

// Estimate for 1 MB file
const cost = await estimateUploadCost(metaplex, 1024 * 1024);
console.log(`Estimated cost: ${cost / 1e9} SOL`);
```

## 📦 Collection Metadata

The collection metadata follows Metaplex standard and is defined in `collection/collection-metadata.json`:

```json
{
  "name": "Kwami Collection",
  "symbol": "KWAMI",
  "description": "Unique AI companion NFTs...",
  "seller_fee_basis_points": 500,
  "image": "collection-image.png",
  "external_url": "https://quami.io",
  "attributes": [...]
}
```

Update this file with:
- Collection name and description
- Creator wallet address
- Royalty percentage (seller_fee_basis_points)
- Collection image

## 🔧 Configuration

### Environment Variables

After initializing the collection, add these to your `.env`:

```env
# Collection Details
NUXT_PUBLIC_KWAMI_COLLECTION_MINT=<collection_mint>
NUXT_PUBLIC_KWAMI_COLLECTION_AUTHORITY=<authority_pda>
NUXT_PUBLIC_KWAMI_DNA_REGISTRY=<dna_registry_pda>

# Arweave/Bundlr
NUXT_ARWEAVE_WALLET=<path_to_arweave_wallet>
```

### Bundlr Network

Default: `https://node1.bundlr.network`

For mainnet, consider using:
- `https://node1.bundlr.network` (Mainnet)
- `https://devnet.bundlr.network` (Devnet)

## 🛠️ API Reference

### uploadFileToArweave

Upload a file buffer to Arweave.

```typescript
async function uploadFileToArweave(
  metaplex: Metaplex,
  buffer: Buffer,
  fileName: string
): Promise<UploadResult>
```

### uploadJsonToArweave

Upload JSON metadata to Arweave.

```typescript
async function uploadJsonToArweave(
  metaplex: Metaplex,
  json: object,
  fileName?: string
): Promise<UploadResult>
```

### uploadKwamiAssets

Upload Kwami GLB and thumbnail together.

```typescript
async function uploadKwamiAssets(
  metaplex: Metaplex,
  glbBuffer: Buffer,
  thumbnailBuffer: Buffer
): Promise<{
  glbUri: string;
  thumbnailUri: string;
  success: boolean;
  errors?: string[];
}>
```

### uploadCompleteKwamiNFT

Upload complete NFT (assets + metadata) in one call.

```typescript
async function uploadCompleteKwamiNFT(
  config: ArweaveConfig,
  glbBuffer: Buffer,
  thumbnailBuffer: Buffer,
  metadata: object
): Promise<UploadResult>
```

### createKwamiCollection

Initialize collection on-chain.

```typescript
async function createKwamiCollection(
  config: CollectionConfig
): Promise<CollectionResult>
```

## 🔍 Troubleshooting

### Insufficient Bundlr Balance

```
Error: Not enough funds to send data
```

**Solution:** Fund your Bundlr account:
```typescript
await fundBundlr(metaplex, 0.1); // Fund with 0.1 SOL
```

### Upload Timeout

```
Error: Upload timeout
```

**Solution:** Increase timeout in config:
```typescript
const metaplex = initializeMetaplex({
  rpcUrl: 'https://api.devnet.solana.com',
  walletKeypair: wallet,
  timeout: 120000, // 2 minutes
});
```

### IDL Not Found

```
Error: IDL not found
```

**Solution:** Build the Anchor program first:
```bash
cd ../anchor/kwami-nft
anchor build
```

## 📊 Cost Estimation

Typical costs for Kwami NFT uploads (devnet):

| Asset Type | Size | Approximate Cost |
|------------|------|------------------|
| Thumbnail (PNG) | ~500 KB | ~0.0001 SOL |
| GLB Model | ~1-2 MB | ~0.0002-0.0004 SOL |
| Metadata (JSON) | ~5 KB | ~0.00001 SOL |
| **Total per NFT** | ~2 MB | **~0.0005 SOL** |

**Note:** Mainnet costs will be higher. Always check current Bundlr rates.

## 🔐 Security

### Best Practices

1. **Never commit keypairs** - Add `*.json` (except samples) to `.gitignore`
2. **Secure collection mint** - Store collection mint keypair securely
3. **Backup important keys** - Keep secure backups of authority keys
4. **Test on devnet first** - Always test uploads on devnet before mainnet
5. **Monitor Bundlr balance** - Keep Bundlr funded to avoid upload failures

### Collection Authority

The collection authority PDA can:
- Update collection metadata
- Verify NFTs in the collection
- Manage collection settings

Keep the wallet with authority secure!

## 📚 Resources

- [Metaplex Documentation](https://docs.metaplex.com/)
- [Bundlr Network](https://bundlr.network/)
- [Arweave](https://www.arweave.org/)
- [Solana NFT Standard](https://docs.metaplex.com/programs/token-metadata/)

## 🔗 Integration

These utilities are used by:
- `server/api/kwami/mint.ts` - Backend minting API
- Frontend minting flow
- Collection management scripts

---

**Status:** Ready for Use  
**Network:** Devnet  
**Version:** 0.1.0
