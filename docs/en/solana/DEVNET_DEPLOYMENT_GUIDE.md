# 🚀 Devnet Deployment Guide

**Complete step-by-step guide to deploy KWAMI ecosystem to Solana Devnet**

---

## 📋 Pre-Deployment Checklist

### **1. Environment Setup**
- [ ] Rust installed (`rustc --version`)
- [ ] Solana CLI installed (`solana --version`)
- [ ] Anchor installed (`anchor --version`)
- [ ] Node.js and npm installed (`node --version`)
- [ ] Wallet with devnet SOL (at least 10 SOL)

### **2. Code Verification**
- [x] All programs compile without errors
- [x] No linter errors
- [x] Test suites created (6 suites, 100+ tests)
- [x] Documentation complete
- [x] Economic model validated

### **3. Configuration**
- [ ] Anchor.toml configured for devnet
- [ ] Keypairs generated for deployment
- [ ] USDC devnet mint address obtained
- [ ] Program IDs ready to update

---

## 🔧 Step 1: Environment Configuration

### **Set Solana to Devnet**
```bash
cd /home/kali/labs/kwami/solana/anchor

# Set cluster to devnet
solana config set --url devnet

# Verify configuration
solana config get

# Expected output:
# RPC URL: https://api.devnet.solana.com
# WebSocket URL: wss://api.devnet.solana.com/
```

### **Check Wallet Balance**
```bash
# Show your wallet address
solana address

# Check balance
solana balance

# If balance is low, airdrop SOL (max 2 SOL per request)
solana airdrop 2
solana airdrop 2
solana airdrop 2
# Repeat until you have at least 10 SOL
```

### **Generate Deployment Keypairs**
```bash
# QWAMI Token program keypair
solana-keygen new --outfile ~/.config/solana/qwami-program-keypair.json

# KWAMI NFT program keypair
solana-keygen new --outfile ~/.config/solana/kwami-program-keypair.json

# Save these addresses - you'll need them!
echo "QWAMI Program ID: $(solana-keygen pubkey ~/.config/solana/qwami-program-keypair.json)"
echo "KWAMI Program ID: $(solana-keygen pubkey ~/.config/solana/kwami-program-keypair.json)"
```

---

## 📝 Step 2: Update Configuration Files

### **Update Anchor.toml for QWAMI Token**
```bash
cd qwami
```

Edit `Anchor.toml`:
```toml
[features]
seeds = false
skip-lint = false

[programs.devnet]
qwami_token = "YOUR_QWAMI_PROGRAM_ID_HERE"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

### **Update Anchor.toml for KWAMI NFT**
```bash
cd ../kwami
```

Edit `Anchor.toml`:
```toml
[features]
seeds = false
skip-lint = false

[programs.devnet]
kwami_nft = "YOUR_KWAMI_PROGRAM_ID_HERE"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

---

## 🏗️ Step 3: Build Programs

### **Build QWAMI Token Program**
```bash
cd /home/kali/labs/kwami/solana/anchor/qwami

# Clean previous builds
anchor clean

# Build the program
anchor build

# Verify the build
ls -lh target/deploy/qwami_token.so

# Get program ID from build
anchor keys list
```

### **Build KWAMI NFT Program**
```bash
cd /home/kali/labs/kwami/solana/anchor/kwami

# Clean previous builds
anchor clean

# Build the program
anchor build

# Verify the build
ls -lh target/deploy/kwami_nft.so

# Get program ID from build
anchor keys list
```

---

## 🚀 Step 4: Deploy to Devnet

### **Deploy QWAMI Token Program**
```bash
cd /home/kali/labs/kwami/solana/anchor/qwami

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Expected output:
# Deploying workspace: https://explorer.solana.com/address/YOUR_PROGRAM_ID?cluster=devnet
# Upgrade authority: YOUR_WALLET_ADDRESS
# Deploying program "qwami_token"...
# Program path: target/deploy/qwami_token.so...
# Program Id: YOUR_QWAMI_PROGRAM_ID
# Deploy success ✅

# Save the Program ID!
```

### **Deploy KWAMI NFT Program**
```bash
cd /home/kali/labs/kwami/solana/anchor/kwami

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Expected output:
# Deploying workspace: https://explorer.solana.com/address/YOUR_PROGRAM_ID?cluster=devnet
# Upgrade authority: YOUR_WALLET_ADDRESS
# Deploying program "kwami_nft"...
# Program path: target/deploy/kwami_nft.so...
# Program Id: YOUR_KWAMI_PROGRAM_ID
# Deploy success ✅

# Save the Program ID!
```

---

## 🔄 Step 5: Update Program IDs in Code

### **Update QWAMI Token lib.rs**
```bash
cd /home/kali/labs/kwami/solana/anchor/qwami/programs/qwami-token/src
```

Edit `lib.rs` line 4:
```rust
declare_id!("YOUR_ACTUAL_QWAMI_PROGRAM_ID");
```

### **Update KWAMI NFT lib.rs**
```bash
cd /home/kali/labs/kwami/solana/anchor/kwami/programs/kwami-nft/src
```

Edit `lib.rs` line 17:
```rust
declare_id!("YOUR_ACTUAL_KWAMI_PROGRAM_ID");
```

### **Get Devnet USDC Mint Address**
Devnet USDC mint: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

Update both programs if needed.

### **Rebuild and Redeploy**
```bash
# QWAMI
cd /home/kali/labs/kwami/solana/anchor/qwami
anchor build
anchor deploy --provider.cluster devnet

# KWAMI
cd /home/kali/labs/kwami/solana/anchor/kwami
anchor build
anchor deploy --provider.cluster devnet
```

---

## 🎬 Step 6: Initialize Programs

### **Initialize QWAMI Token Program**

Create `scripts/initialize-qwami.ts`:
```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { QwamiToken } from "../target/types/qwami_token";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.QwamiToken as Program<QwamiToken>;
  
  console.log("Initializing QWAMI Token program...");
  console.log("Program ID:", program.programId.toString());
  
  // Create mint keypair
  const mintKeypair = anchor.web3.Keypair.generate();
  console.log("QWAMI Mint:", mintKeypair.publicKey.toString());
  
  // Derive PDAs
  const [tokenAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("token-authority"), mintKeypair.publicKey.toBuffer()],
    program.programId
  );
  
  const [treasury] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("qwami-treasury")],
    program.programId
  );
  
  // USDC devnet mint
  const usdcMint = new anchor.web3.PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
  
  // Create USDC vault
  const usdcVaultKeypair = anchor.web3.Keypair.generate();
  
  const tx = await program.methods
    .initialize()
    .accounts({
      mint: mintKeypair.publicKey,
      tokenAuthority: tokenAuthority,
      treasury: treasury,
      usdcVault: usdcVaultKeypair.publicKey,
      usdcMint: usdcMint,
      payer: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .signers([mintKeypair, usdcVaultKeypair])
    .rpc();
  
  console.log("✅ QWAMI Token initialized!");
  console.log("Transaction:", tx);
  console.log("Explorer:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);
  
  console.log("\n📝 Save these addresses:");
  console.log("QWAMI Mint:", mintKeypair.publicKey.toString());
  console.log("Token Authority:", tokenAuthority.toString());
  console.log("Treasury:", treasury.toString());
  console.log("USDC Vault:", usdcVaultKeypair.publicKey.toString());
}

main().then(() => process.exit(0)).catch(console.error);
```

Run:
```bash
cd /home/kali/labs/kwami/solana/anchor/qwami
npx ts-node scripts/initialize-qwami.ts
```

### **Initialize KWAMI NFT Program**

Create `scripts/initialize-kwami.ts`:
```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { KwamiNft } from "../target/types/kwami_nft";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.KwamiNft as Program<KwamiNft>;
  
  console.log("Initializing KWAMI NFT program...");
  console.log("Program ID:", program.programId.toString());
  
  // Use QWAMI mint from previous step
  const qwamiMint = new anchor.web3.PublicKey("YOUR_QWAMI_MINT_ADDRESS");
  
  // Create collection mint
  const collectionMintKeypair = anchor.web3.Keypair.generate();
  console.log("Collection Mint:", collectionMintKeypair.publicKey.toString());
  
  // Derive PDAs
  const [collectionAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("collection-authority"), collectionMintKeypair.publicKey.toBuffer()],
    program.programId
  );
  
  const [dnaRegistry] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("dna-registry"), collectionMintKeypair.publicKey.toBuffer()],
    program.programId
  );
  
  const [treasury] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("kwami-treasury")],
    program.programId
  );
  
  // Create QWAMI vault
  const qwamiVaultKeypair = anchor.web3.Keypair.generate();
  
  const tx = await program.methods
    .initialize()
    .accounts({
      collectionMint: collectionMintKeypair.publicKey,
      collectionAuthority: collectionAuthority,
      dnaRegistry: dnaRegistry,
      treasury: treasury,
      qwamiVault: qwamiVaultKeypair.publicKey,
      qwamiMint: qwamiMint,
      payer: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .signers([collectionMintKeypair, qwamiVaultKeypair])
    .rpc();
  
  console.log("✅ KWAMI NFT initialized!");
  console.log("Transaction:", tx);
  console.log("Explorer:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);
  
  console.log("\n📝 Save these addresses:");
  console.log("Collection Mint:", collectionMintKeypair.publicKey.toString());
  console.log("Collection Authority:", collectionAuthority.toString());
  console.log("DNA Registry:", dnaRegistry.toString());
  console.log("Treasury:", treasury.toString());
  console.log("QWAMI Vault:", qwamiVaultKeypair.publicKey.toString());
}

main().then(() => process.exit(0)).catch(console.error);
```

Run:
```bash
cd /home/kali/labs/kwami/solana/anchor/kwami
npx ts-node scripts/initialize-kwami.ts
```

---

## 🧪 Step 7: Test on Devnet

### **Test QWAMI Token Operations**

Create `scripts/test-qwami-devnet.ts`:
```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { QwamiToken } from "../target/types/qwami_token";
import { getAssociatedTokenAddress } from "@solana/spl-token";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.QwamiToken as Program<QwamiToken>;
  
  console.log("Testing QWAMI Token on devnet...");
  
  const qwamiMint = new anchor.web3.PublicKey("YOUR_QWAMI_MINT");
  const [tokenAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("token-authority"), qwamiMint.toBuffer()],
    program.programId
  );
  
  const [treasury] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("qwami-treasury")],
    program.programId
  );
  
  const [solVault] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("sol-vault")],
    program.programId
  );
  
  const userQwamiAccount = await getAssociatedTokenAddress(
    qwamiMint,
    provider.wallet.publicKey
  );
  
  // Test: Mint QWAMI with SOL
  console.log("\n💰 Test 1: Mint QWAMI with 0.1 SOL...");
  const solAmount = new anchor.BN(100_000_000); // 0.1 SOL
  
  try {
    const tx = await program.methods
      .mintWithSol(solAmount)
      .accounts({
        mint: qwamiMint,
        tokenAuthority: tokenAuthority,
        treasury: treasury,
        solVault: solVault,
        buyerQwamiAccount: userQwamiAccount,
        buyer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .rpc();
    
    console.log("✅ Minted 100 QWAMI with 0.1 SOL");
    console.log("TX:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);
  } catch (err) {
    console.error("❌ Error:", err);
  }
  
  // Check balance
  const balance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
  console.log("\n📊 Current QWAMI Balance:", balance.value.amount);
}

main().then(() => process.exit(0)).catch(console.error);
```

Run:
```bash
npx ts-node scripts/test-qwami-devnet.ts
```

### **Test KWAMI NFT Minting**

Similar script for NFT minting - test the complete flow!

---

## 📊 Step 8: Verification

### **Verify Programs on Solana Explorer**

Visit these URLs (replace with your program IDs):
- QWAMI: `https://explorer.solana.com/address/YOUR_QWAMI_ID?cluster=devnet`
- KWAMI: `https://explorer.solana.com/address/YOUR_KWAMI_ID?cluster=devnet`

Check for:
- ✅ Program is deployed
- ✅ Upgrade authority set
- ✅ Executable data present

### **Verify Initialized Accounts**

Check PDAs are created:
- Token Authority PDA
- Treasury PDAs (both programs)
- Vaults (SOL, USDC, QWAMI)

### **Monitor Transactions**

All transactions visible on:
`https://explorer.solana.com/address/YOUR_WALLET?cluster=devnet`

---

## 🎯 Step 9: Create Deployment Record

Create `DEVNET_DEPLOYMENT_RECORD.md`:
```markdown
# Devnet Deployment Record

**Date:** [INSERT DATE]
**Deployer:** [YOUR WALLET]

## Program IDs
- QWAMI Token: [INSERT]
- KWAMI NFT: [INSERT]

## Mints
- QWAMI Mint: [INSERT]
- Collection Mint: [INSERT]
- USDC Mint: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

## PDAs
- QWAMI Authority: [INSERT]
- QWAMI Treasury: [INSERT]
- SOL Vault: [INSERT]
- USDC Vault: [INSERT]
- Collection Authority: [INSERT]
- DNA Registry: [INSERT]
- KWAMI Treasury: [INSERT]
- KWAMI QWAMI Vault: [INSERT]

## Transactions
- QWAMI Initialize: [TX SIGNATURE]
- KWAMI Initialize: [TX SIGNATURE]

## Tests Run
- [ ] Mint QWAMI with SOL
- [ ] Mint QWAMI with USDC
- [ ] Mint KWAMI NFT
- [ ] Burn KWAMI NFT
- [ ] Burn QWAMI for USDC
```

---

## ✅ Deployment Checklist

### **Pre-Deployment:**
- [ ] Devnet selected
- [ ] Wallet funded (10+ SOL)
- [ ] Programs build successfully
- [ ] Configuration updated

### **Deployment:**
- [ ] QWAMI Token deployed
- [ ] KWAMI NFT deployed
- [ ] Program IDs updated in code
- [ ] Programs redeployed with correct IDs

### **Initialization:**
- [ ] QWAMI Token initialized
- [ ] KWAMI NFT initialized
- [ ] All PDAs created
- [ ] Vaults created

### **Testing:**
- [ ] Mint QWAMI with SOL (works)
- [ ] Mint QWAMI with USDC (works)
- [ ] Mint KWAMI NFT (works)
- [ ] Burn NFT with refund (works)
- [ ] Burn QWAMI for USDC (works)
- [ ] Treasury accounting (correct)

### **Verification:**
- [ ] Programs visible on explorer
- [ ] Accounts created
- [ ] Transactions confirmed
- [ ] Balances correct

### **Documentation:**
- [ ] Deployment record created
- [ ] All addresses saved
- [ ] Screenshots taken
- [ ] Issues documented

---

## 🚨 Troubleshooting

### **"Insufficient funds" error**
```bash
# Airdrop more SOL
solana airdrop 2
```

### **"Account already exists" error**
```bash
# Use different keypairs or update existing
anchor clean
anchor build
```

### **"Program not found" error**
```bash
# Verify program ID matches
anchor keys list
# Update lib.rs with correct ID
```

### **Transaction fails**
```bash
# Check Solana status
solana cluster-version
# Verify RPC endpoint
solana config get
# Try different RPC if slow
```

---

## 📈 Next Steps After Devnet

1. **Monitor for 24-48 hours** - Watch for any issues
2. **Run full test suite** - All 100+ tests on devnet
3. **Get user feedback** - Share with testers
4. **Security audit** - Professional review
5. **Mainnet deployment** - Production launch!

---

## 🎉 Success Criteria

Your devnet deployment is successful when:

✅ Both programs deployed and verified  
✅ Both programs initialized  
✅ All PDAs created correctly  
✅ Test transactions succeed  
✅ Treasury accounting works  
✅ No errors in 24 hours  
✅ Ready for security audit  

---

**Need Help?**
- Solana Discord: https://discord.gg/solana
- Anchor Discord: https://discord.gg/anchor
- Stack Exchange: https://solana.stackexchange.com/

**Good luck with your deployment! 🚀**

