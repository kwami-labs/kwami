# ⚡ Quick Start - Devnet Deployment

**Get your KWAMI ecosystem deployed to devnet in 10 minutes!**

---

## 🎯 Prerequisites (5 minutes)

### Install Required Tools
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Verify installations
solana --version
anchor --version
```

---

## 🚀 Deploy to Devnet (5 minutes)

### Step 1: Navigate to Project
```bash
cd /home/kali/labs/kwami/solana/anchor
```

### Step 2: Run Deployment Script
```bash
# Make sure script is executable
chmod +x deploy-devnet.sh

# Run deployment
./deploy-devnet.sh
```

**That's it!** The script will:
- ✅ Check prerequisites
- ✅ Configure Solana for devnet
- ✅ Fund your wallet (airdrop SOL)
- ✅ Build both programs
- ✅ Deploy to devnet
- ✅ Create deployment record

---

## 📝 Next Steps

### 1. Update Program IDs
After deployment, you'll see output like:
```
QWAMI Program ID: AbC123...XyZ
KWAMI Program ID: DeF456...UvW
```

Update these in your code:
```bash
# QWAMI Token
nano qwami/programs/qwami-token/src/lib.rs
# Change line 4: declare_id!("YOUR_QWAMI_PROGRAM_ID");

# KWAMI NFT
nano kwami/programs/kwami-nft/src/lib.rs
# Change line 17: declare_id!("YOUR_KWAMI_PROGRAM_ID");
```

### 2. Rebuild and Redeploy
```bash
cd qwami
anchor build
anchor deploy --provider.cluster devnet

cd ../kwami
anchor build
anchor deploy --provider.cluster devnet
```

### 3. Initialize Programs
```bash
# QWAMI Token
cd qwami
npm install  # if needed
npx ts-node scripts/initialize-qwami.ts

# KWAMI NFT (update QWAMI mint address first)
cd ../kwami
npm install  # if needed
npx ts-node scripts/initialize-kwami.ts
```

### 4. Test Operations
```bash
# Test QWAMI operations
cd qwami
npx ts-node scripts/test-qwami-devnet.ts

# Test KWAMI operations
cd ../kwami
npx ts-node scripts/test-kwami-devnet.ts
```

---

## 🔍 Verify Deployment

### Check on Solana Explorer
Replace `YOUR_PROGRAM_ID` with actual IDs:
- QWAMI: https://explorer.solana.com/address/YOUR_QWAMI_ID?cluster=devnet
- KWAMI: https://explorer.solana.com/address/YOUR_KWAMI_ID?cluster=devnet

### Check Your Transactions
https://explorer.solana.com/address/YOUR_WALLET?cluster=devnet

---

## 🆘 Troubleshooting

### "Insufficient SOL" Error
```bash
solana airdrop 2
# Wait 30 seconds, then
solana airdrop 2
```

### "RPC request failed" Error
```bash
# Try different RPC endpoint
solana config set --url https://api.devnet.solana.com
```

### Programs Not Found
```bash
# Rebuild everything
cd qwami && anchor clean && anchor build
cd ../kwami && anchor clean && anchor build
```

### Need More Help?
Check the full guide: `DEVNET_DEPLOYMENT_GUIDE.md`

---

## ✅ Success Checklist

- [ ] Prerequisites installed
- [ ] Deployment script ran successfully
- [ ] Program IDs updated in code
- [ ] Programs redeployed with correct IDs
- [ ] Both programs initialized
- [ ] Test transactions successful
- [ ] All accounts created
- [ ] Treasury accounting works

---

## 🎉 You're Done!

Your KWAMI ecosystem is now live on Solana devnet!

**What's Next?**
1. Monitor for 24-48 hours
2. Share with testers
3. Run full test suite
4. Security audit
5. Mainnet deployment 🚀

---

**Need Help?** See `DEVNET_DEPLOYMENT_GUIDE.md` for detailed instructions.

