# 🚀 Devnet Deployment Record

**Date:** Tue Dec 16 11:54:19 PM CET 2025
**Deployer:** 3TYRKswBCUy8agGNBF3wpg4AoiahZWKBKJB3ZJhybscf
**Cluster:** Devnet

---

## 📝 Program IDs

### QWAMI Token Program
```
Program ID: 4GCAV5a3UfEAa3Zer3Bmuti7DFe9mN4Znrjok8AUyNG2
Explorer: https://explorer.solana.com/address/4GCAV5a3UfEAa3Zer3Bmuti7DFe9mN4Znrjok8AUyNG2?cluster=devnet
```

### KWAMI NFT Program
```
Program ID: BTpKTZUyyAgiKsLrJfzFCYAyAFVx1Jd8xsbE11dTTswL
Explorer: https://explorer.solana.com/address/BTpKTZUyyAgiKsLrJfzFCYAyAFVx1Jd8xsbE11dTTswL?cluster=devnet
```

---

## 🔑 Configuration

### Devnet USDC
```
USDC Mint: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

### Wallet
```
Address: 3TYRKswBCUy8agGNBF3wpg4AoiahZWKBKJB3ZJhybscf
Balance: 4.0857194 SOL
```

---

## ⚠️ Next Steps

1. **Test on Devnet**
   - Run test scripts
   - Verify all operations work
   - Check treasury accounting

2. **Monitor for 24 Hours**
   - Watch for errors
   - Check transaction success rate
   - Verify economic model

---

## 📚 Resources

- [Devnet Deployment Guide](../../DEVNET_DEPLOYMENT_GUIDE.md)
- [Solana Explorer](https://explorer.solana.com/?cluster=devnet)
- [Anchor Docs](https://www.anchor-lang.com/)

---

**Deployment Status:** ✅ Programs Deployed | 🚧 Initialization In Progress

---

## ✅ Completed Steps

### Build Environment Fixed
- ✅ Installed Solana 2.3.0 (compatible with Anchor 0.32.1)
- ✅ Resolved all Rust/Cargo dependency conflicts
- ✅ Successfully built both QWAMI and KWAMI programs
- ✅ Generated IDL files for both programs
- ✅ Uploaded IDLs to devnet

### IDL Accounts Created
```
QWAMI IDL: 7nbwPUEJnvygBQ5AVHyms77Aoq3hPU7D69VoU53UGEhi
KWAMI IDL: BydTjVWMTe5Q9W1ogGQ3LoZpxZ8p1rwmpedn5CuPNpWx
```

---

## 🚧 Next: Initialize Programs

The programs are deployed and ready to be initialized. Run:

```bash
cd qwami
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com ANCHOR_WALLET=~/.config/solana/id.json npm run initialize

cd ../kwami
# Update QWAMI_MINT_ADDRESS in scripts/initialize-kwami.ts with the QWAMI mint from previous step
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com ANCHOR_WALLET=~/.config/solana/id.json npm run initialize
```

---
