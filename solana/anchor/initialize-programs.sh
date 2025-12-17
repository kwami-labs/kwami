#!/bin/bash

# 🚀 KWAMI Ecosystem Program Initialization Script
# Initializes both QWAMI Token and KWAMI NFT programs
# Note: KWAMI NFT has a known issue with DNA Registry initialization

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════════════"
echo "  🚀 KWAMI Ecosystem Program Initialization"
echo "═══════════════════════════════════════════════════════════"
echo -e "${NC}"

# Check current configuration
CLUSTER=$(solana config get | grep "RPC URL" | awk '{print $3}')
WALLET_PATH=$(solana config get | grep "Keypair Path" | awk '{print $3}')
WALLET=$(solana address)

echo -e "${GREEN}✅ Current Configuration:${NC}"
echo -e "  Cluster: ${BLUE}${CLUSTER}${NC}"
echo -e "  Wallet: ${BLUE}${WALLET}${NC}"

# Check balance
BALANCE=$(solana balance | awk '{print $1}')
echo -e "  Balance: ${BLUE}${BALANCE} SOL${NC}"

if (( $(echo "$BALANCE < 0.5" | bc -l) )); then
    echo -e "${RED}❌ Insufficient balance. Need at least 0.5 SOL${NC}"
    exit 1
fi

echo -e "\n${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  Step 1: Initialize QWAMI Token Program${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}\n"

cd qwami

echo -e "${YELLOW}Running QWAMI initialization...${NC}"

if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ Node.js/npx not found. Cannot run initialization.${NC}"
    exit 1
fi

if ANCHOR_PROVIDER_URL="$CLUSTER" ANCHOR_WALLET="$WALLET_PATH" npx ts-node scripts/initialize-qwami.ts; then
    echo -e "${GREEN}✅ QWAMI Token initialized successfully!${NC}"
    
    if [ -f "devnet-addresses.json" ]; then
        QWAMI_MINT=$(grep -o '"qwamiMint": "[^"]*"' devnet-addresses.json | cut -d'"' -f4)
        echo -e "${GREEN}  Mint: ${QWAMI_MINT}${NC}"
    fi
else
    echo -e "${RED}❌ QWAMI initialization failed${NC}"
    cd ..
    exit 1
fi

cd ..

echo -e "\n${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  Step 2: Initialize KWAMI NFT Program${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}\n"

echo -e "${RED}⚠️  KWAMI NFT Initialization Blocked${NC}"
echo -e "${YELLOW}Known Issue: DNA Registry account size exceeds Solana's 10KB reallocation limit${NC}"
echo -e ""
echo -e "${YELLOW}The DNA Registry tries to allocate 32KB upfront for 1000 DNA hashes.${NC}"
echo -e "${YELLOW}Solana limits account reallocation to 10KB in init instructions.${NC}"
echo -e ""
echo -e "${BLUE}Required Fix:${NC}"
echo -e "  1. Modify DnaRegistry to initialize with empty Vec"
echo -e "  2. OR use multiple registry accounts"
echo -e "  3. OR use PDA-per-DNA-hash storage pattern"
echo -e ""
echo -e "${YELLOW}Skipping KWAMI initialization for now.${NC}"

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Initialization Complete (Partial)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Status:${NC}"
echo -e "  ✅ QWAMI Token: Initialized"
echo -e "  ❌ KWAMI NFT: Blocked (needs code fix)"
echo -e ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Fix KWAMI DNA Registry storage design"
echo -e "  2. Rebuild and redeploy KWAMI program"
echo -e "  3. Run KWAMI initialization"
echo ""
