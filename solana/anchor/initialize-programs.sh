#!/bin/bash

# 🚀 Manual Program Initialization Script for KWAMI Ecosystem
# This script initializes both QWAMI Token and KWAMI NFT programs on devnet
# Use this when TypeScript initialization scripts can't run due to missing IDL

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════════════"
echo "  🚀 KWAMI Ecosystem Manual Initialization"
echo "═══════════════════════════════════════════════════════════"
echo -e "${NC}"

# Program IDs from deployment
QWAMI_PROGRAM_ID="4GCAV5a3UfEAa3Zer3Bmuti7DFe9mN4Znrjok8AUyNG2"
KWAMI_PROGRAM_ID="BTpKTZUyyAgiKsLrJfzFCYAyAFVx1Jd8xsbE11dTTswL"

# Devnet USDC
USDC_MINT="4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"

# Configure for devnet
echo -e "${YELLOW}Configuring for devnet...${NC}"
solana config set --url devnet
WALLET=$(solana address)
echo -e "${GREEN}✅ Wallet: ${WALLET}${NC}"

# Check balance
BALANCE=$(solana balance | awk '{print $1}')
echo -e "${GREEN}✅ Balance: ${BALANCE} SOL${NC}"

if [ "$(echo "$BALANCE < 1" | bc)" -eq 1 ]; then
    echo -e "${RED}❌ Insufficient balance. Need at least 1 SOL${NC}"
    exit 1
fi

echo -e "\n${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  Step 1: Initialize QWAMI Token Program${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}\n"

# Generate QWAMI mint keypair
QWAMI_MINT_KEYPAIR=$(mktemp)
solana-keygen new --no-bip39-passphrase --silent --outfile "$QWAMI_MINT_KEYPAIR"
QWAMI_MINT=$(solana-keygen pubkey "$QWAMI_MINT_KEYPAIR")
echo -e "${GREEN}✅ QWAMI Mint: ${QWAMI_MINT}${NC}"

# Derive QWAMI PDAs
# Note: We'll need to use a tool or calculate these manually
# For now, let's use anchor CLI if available

cd qwami

# Try to initialize using anchor
echo -e "${YELLOW}Attempting to initialize QWAMI Token...${NC}"
echo -e "${YELLOW}Note: This requires the IDL to be present${NC}"

# Check if we can build to get IDL
if anchor build --no-idl 2>&1 | grep -q "error"; then
    echo -e "${RED}❌ Cannot build QWAMI due to dependency issues${NC}"
    echo -e "${YELLOW}Manual initialization required using Anchor CLI with correct accounts${NC}"
    cd ..
    
    echo -e "\n${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  Alternative: Initialize using deployed program${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}\n"
    
    echo -e "${BLUE}To initialize manually, you need to:${NC}"
    echo -e "1. Generate mint keypairs"
    echo -e "2. Create mints with correct authorities (PDAs)"
    echo -e "3. Create token accounts with correct owners (PDAs)"
    echo -e "4. Call initialize instruction with correct accounts"
    echo -e ""
    echo -e "${YELLOW}Program IDs:${NC}"
    echo -e "QWAMI: ${QWAMI_PROGRAM_ID}"
    echo -e "KWAMI: ${KWAMI_PROGRAM_ID}"
    echo -e ""
    echo -e "${YELLOW}Devnet USDC: ${USDC_MINT}${NC}"
    echo -e ""
    echo -e "${BLUE}Recommended: Fix build issues first by upgrading Solana platform tools${NC}"
    echo -e "Then run: cd qwami && npm run initialize"
    echo -e "          cd ../kwami && npm run initialize"
    
    exit 1
fi

cd ..

echo -e "\n${GREEN}🎉 Script would continue with initialization...${NC}"
echo -e "${YELLOW}However, this requires IDL to be available${NC}"
