#!/bin/bash

# 🚀 KWAMI Ecosystem Devnet Deployment Script
# This script deploys both QWAMI Token and KWAMI NFT programs to Solana devnet

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════════════"
echo "  🚀 KWAMI Ecosystem Devnet Deployment"
echo "═══════════════════════════════════════════════════════════"
echo -e "${NC}"

# Check if we're in the right directory
if [ ! -d "qwami" ] || [ ! -d "kwami" ]; then
    echo -e "${RED}❌ Error: Must run from /solana/anchor directory${NC}"
    exit 1
fi

# Step 1: Check prerequisites
echo -e "\n${YELLOW}Step 1: Checking prerequisites...${NC}"

# Check Solana CLI
if ! command -v solana &> /dev/null; then
    # Try to add default Solana path
    if [ -d "$HOME/.local/share/solana/install/active_release/bin" ]; then
        export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    fi
fi

if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found. Please install it first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Solana CLI found: $(solana --version)${NC}"

# Check Anchor
if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor not found. Please install it first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Anchor found: $(anchor --version)${NC}"

# Step 2: Configure Solana for devnet
echo -e "\n${YELLOW}Step 2: Configuring Solana for devnet...${NC}"
solana config set --url devnet
echo -e "${GREEN}✅ Configured for devnet${NC}"

# Step 3: Check wallet balance
echo -e "\n${YELLOW}Step 3: Checking wallet balance...${NC}"
WALLET_ADDRESS=$(solana address)
BALANCE=$(solana balance | awk '{print $1}')
echo -e "Wallet: ${BLUE}${WALLET_ADDRESS}${NC}"
echo -e "Balance: ${BLUE}${BALANCE} SOL${NC}"

if (( $(echo "$BALANCE < 5" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Low balance. Requesting airdrop...${NC}"
    solana airdrop 2 || echo -e "${YELLOW}⚠️  Airdrop failed. You may need to wait or request manually.${NC}"
    sleep 2
    solana airdrop 2 || echo -e "${YELLOW}⚠️  Airdrop failed. You may need to wait or request manually.${NC}"
fi

# Step 4: Build QWAMI Token program
echo -e "\n${YELLOW}Step 4: Building QWAMI Token program...${NC}"
cd qwami
anchor clean
anchor build
echo -e "${GREEN}✅ QWAMI Token program built${NC}"

# Get QWAMI program ID
QWAMI_PROGRAM_ID=$(anchor keys list | grep qwami_token | awk '{print $2}')
echo -e "QWAMI Program ID: ${BLUE}${QWAMI_PROGRAM_ID}${NC}"

# Step 5: Deploy QWAMI Token program
echo -e "\n${YELLOW}Step 5: Deploying QWAMI Token to devnet...${NC}"
anchor deploy --provider.cluster devnet
echo -e "${GREEN}✅ QWAMI Token deployed to devnet${NC}"
echo -e "Explorer: ${BLUE}https://explorer.solana.com/address/${QWAMI_PROGRAM_ID}?cluster=devnet${NC}"

# Step 6: Build KWAMI NFT program
echo -e "\n${YELLOW}Step 6: Building KWAMI NFT program...${NC}"
cd ../kwami
anchor clean
anchor build
echo -e "${GREEN}✅ KWAMI NFT program built${NC}"

# Get KWAMI program ID
KWAMI_PROGRAM_ID=$(anchor keys list | grep kwami_nft | awk '{print $2}')
echo -e "KWAMI NFT Program ID: ${BLUE}${KWAMI_PROGRAM_ID}${NC}"

# Step 7: Deploy KWAMI NFT program
echo -e "\n${YELLOW}Step 7: Deploying KWAMI NFT to devnet...${NC}"
anchor deploy --provider.cluster devnet
echo -e "${GREEN}✅ KWAMI NFT deployed to devnet${NC}"
echo -e "Explorer: ${BLUE}https://explorer.solana.com/address/${KWAMI_PROGRAM_ID}?cluster=devnet${NC}"

# Step 8: Create deployment record
echo -e "\n${YELLOW}Step 8: Creating deployment record...${NC}"
cd ..

cat > DEVNET_DEPLOYMENT_RECORD.md << EOF
# 🚀 Devnet Deployment Record

**Date:** $(date)
**Deployer:** ${WALLET_ADDRESS}
**Cluster:** Devnet

---

## 📝 Program IDs

### QWAMI Token Program
\`\`\`
Program ID: ${QWAMI_PROGRAM_ID}
Explorer: https://explorer.solana.com/address/${QWAMI_PROGRAM_ID}?cluster=devnet
\`\`\`

### KWAMI NFT Program
\`\`\`
Program ID: ${KWAMI_PROGRAM_ID}
Explorer: https://explorer.solana.com/address/${KWAMI_PROGRAM_ID}?cluster=devnet
\`\`\`

---

## 🔑 Configuration

### Devnet USDC
\`\`\`
USDC Mint: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
\`\`\`

### Wallet
\`\`\`
Address: ${WALLET_ADDRESS}
Balance: ${BALANCE} SOL
\`\`\`

---

## ⚠️ Next Steps

1. **Update Program IDs in Code**
   - Update \`qwami/programs/qwami-token/src/lib.rs\` line 4
   - Update \`kwami/programs/kwami-nft/src/lib.rs\` line 17

2. **Rebuild with Correct IDs**
   \`\`\`bash
   cd qwami && anchor build && anchor deploy --provider.cluster devnet
   cd ../kwami && anchor build && anchor deploy --provider.cluster devnet
   \`\`\`

3. **Initialize Programs**
   \`\`\`bash
   # Initialize QWAMI Token
   cd qwami
   npx ts-node scripts/initialize-qwami.ts
   
   # Initialize KWAMI NFT
   cd ../kwami
   npx ts-node scripts/initialize-kwami.ts
   \`\`\`

4. **Test on Devnet**
   - Run test scripts
   - Verify all operations work
   - Check treasury accounting

5. **Monitor for 24 Hours**
   - Watch for errors
   - Check transaction success rate
   - Verify economic model

---

## 📚 Resources

- [Devnet Deployment Guide](./DEVNET_DEPLOYMENT_GUIDE.md)
- [Solana Explorer](https://explorer.solana.com/?cluster=devnet)
- [Anchor Docs](https://www.anchor-lang.com/)

---

**Deployment Status:** ✅ Programs Deployed (Initialization Pending)
EOF

echo -e "${GREEN}✅ Deployment record created: DEVNET_DEPLOYMENT_RECORD.md${NC}"

# Final summary
echo -e "\n${GREEN}"
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ Deployment Complete!"
echo "═══════════════════════════════════════════════════════════"
echo -e "${NC}"

echo -e "\n${YELLOW}📝 Important Program IDs:${NC}"
echo -e "QWAMI Token: ${BLUE}${QWAMI_PROGRAM_ID}${NC}"
echo -e "KWAMI NFT:   ${BLUE}${KWAMI_PROGRAM_ID}${NC}"

echo -e "\n${YELLOW}🔗 Explorer Links:${NC}"
echo -e "QWAMI: ${BLUE}https://explorer.solana.com/address/${QWAMI_PROGRAM_ID}?cluster=devnet${NC}"
echo -e "KWAMI: ${BLUE}https://explorer.solana.com/address/${KWAMI_PROGRAM_ID}?cluster=devnet${NC}"

echo -e "\n${YELLOW}⚠️  Next Steps:${NC}"
echo -e "1. Update program IDs in lib.rs files"
echo -e "2. Rebuild and redeploy with correct IDs"
echo -e "3. Run initialization scripts"
echo -e "4. Test all operations on devnet"
echo -e "5. Monitor for 24-48 hours"

echo -e "\n${YELLOW}📖 Full guide: ./DEVNET_DEPLOYMENT_GUIDE.md${NC}"

echo -e "\n${GREEN}🎉 Ready for the next phase!${NC}\n"

