#!/bin/bash

# 🚀 KWAMI Ecosystem Unified Deployment Script
# This script deploys both QWAMI Token and KWAMI NFT programs to Solana

set -e  # Exit on error

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════════════"
echo "  🚀 KWAMI Ecosystem Deployment"
echo "═══════════════════════════════════════════════════════════"
echo -e "${NC}"

# Check if we're in the right directory
if [ ! -d "qwami" ] || [ ! -d "kwami" ]; then
    echo -e "${RED}❌ Error: Must run from /solana/anchor directory${NC}"
    exit 1
fi

# Step 1: Select Network
echo -e "\n${YELLOW}Step 1: Select deployment network${NC}"
echo -e "${BLUE}1)${NC} Localnet (local development)"
echo -e "${BLUE}2)${NC} Devnet (testing)"
echo -e "${BLUE}3)${NC} Mainnet-beta (production)"
echo ""

read -p "Enter your choice (1-3): " network_choice

case $network_choice in
    1)
        CLUSTER="localnet"
        CLUSTER_URL="http://localhost:8899"
        USDC_MINT="11111111111111111111111111111111"  # Placeholder for localnet
        ;;
    2)
        CLUSTER="devnet"
        CLUSTER_URL="https://api.devnet.solana.com"
        USDC_MINT="4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"  # Devnet USDC
        ;;
    3)
        CLUSTER="mainnet-beta"
        CLUSTER_URL="https://api.mainnet-beta.solana.com"
        USDC_MINT="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"  # Mainnet USDC
        
        echo -e "\n${RED}⚠️  WARNING: You are about to deploy to MAINNET!${NC}"
        echo -e "${YELLOW}This will use REAL SOL and the deployment is PERMANENT.${NC}"
        echo -e "${YELLOW}Your wallet balance will be used for deployment costs.${NC}"
        echo -e "${RED}This action CANNOT be undone!${NC}"
        echo ""
        read -p "Type 'YES' in capital letters to confirm mainnet deployment: " confirm1
        
        if [ "$confirm1" != "YES" ]; then
            echo -e "${YELLOW}Deployment cancelled.${NC}"
            exit 0
        fi
        
        echo -e "\n${RED}⚠️  SECOND CONFIRMATION REQUIRED${NC}"
        echo -e "${YELLOW}Are you ABSOLUTELY SURE you want to deploy to mainnet-beta?${NC}"
        read -p "Type 'I understand the risks' to proceed: " confirm2
        
        if [ "$confirm2" != "I understand the risks" ]; then
            echo -e "${YELLOW}Deployment cancelled.${NC}"
            exit 0
        fi
        ;;
    *)
        echo -e "${RED}❌ Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ Selected network: ${CLUSTER}${NC}"

# Step 2: Check prerequisites
echo -e "\n${YELLOW}Step 2: Checking prerequisites...${NC}"

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

# If AVM is available, select a compatible Anchor version for this repo
if command -v avm &> /dev/null; then
    ANCHOR_VERSION="${ANCHOR_VERSION:-0.32.1}"
    avm use "$ANCHOR_VERSION" &> /dev/null || true
fi

echo -e "${GREEN}✅ Anchor found: $(anchor --version)${NC}"

# Step 3: Configure Solana
echo -e "\n${YELLOW}Step 3: Configuring Solana for ${CLUSTER}...${NC}"
solana config set --url $CLUSTER
echo -e "${GREEN}✅ Configured for ${CLUSTER}${NC}"

# Step 4: Check wallet balance
echo -e "\n${YELLOW}Step 4: Checking wallet balance...${NC}"

# Configurable funding behavior (override via env vars)
MIN_SOL_BALANCE="${MIN_SOL_BALANCE:-4}"
AIRDROP_AMOUNT="${AIRDROP_AMOUNT:-2}"
MAX_AIRDROP_ATTEMPTS="${MAX_AIRDROP_ATTEMPTS:-2}"

WALLET_ADDRESS=$(solana address)

get_balance() {
    # `solana balance` prints like: "6 SOL" -> take the numeric portion
    solana balance | awk '{print $1}'
}

is_lt() {
    # float-safe compare without depending on `bc`
    awk -v a="$1" -v b="$2" 'BEGIN { exit !(a+0 < b+0) }'
}

BALANCE=$(get_balance)

echo -e "Wallet: ${BLUE}${WALLET_ADDRESS}${NC}"
echo -e "Balance: ${BLUE}${BALANCE} SOL${NC}"

if is_lt "$BALANCE" "$MIN_SOL_BALANCE"; then
    if [ "$CLUSTER" = "devnet" ]; then
        echo -e "${YELLOW}⚠️  Low balance (< ${MIN_SOL_BALANCE} SOL). Attempting airdrop...${NC}"

        for ((i=1; i<=MAX_AIRDROP_ATTEMPTS; i++)); do
            # Re-check before each attempt so we don't spam airdrops
            BALANCE=$(get_balance)
            if ! is_lt "$BALANCE" "$MIN_SOL_BALANCE"; then
                break
            fi

            echo -e "${YELLOW}Airdrop attempt ${i}/${MAX_AIRDROP_ATTEMPTS}: ${AIRDROP_AMOUNT} SOL${NC}"
            if ! solana airdrop "$AIRDROP_AMOUNT"; then
                echo -e "${YELLOW}⚠️  Airdrop failed (rate limit is common on devnet). You may need to wait or request manually.${NC}"
            fi

            sleep 2
            BALANCE=$(get_balance)
            echo -e "Updated balance: ${BLUE}${BALANCE} SOL${NC}"
        done

        if is_lt "$BALANCE" "$MIN_SOL_BALANCE"; then
            echo -e "${YELLOW}⚠️  Balance is still below ${MIN_SOL_BALANCE} SOL; deployment may fail due to insufficient funds.${NC}"
        fi
    else
        echo -e "${RED}❌ Insufficient balance for ${CLUSTER}. Please fund your wallet.${NC}"
        exit 1
    fi
fi

# Step 5: Build QWAMI Token program
echo -e "\n${YELLOW}Step 5: Building QWAMI Token program...${NC}"
cd qwami
anchor clean
anchor build
echo -e "${GREEN}✅ QWAMI Token program built (with IDL)${NC}"

# Get QWAMI program ID
QWAMI_PROGRAM_ID=$(anchor keys list | grep qwami_token | awk '{print $2}')
echo -e "QWAMI Program ID: ${BLUE}${QWAMI_PROGRAM_ID}${NC}"

# Step 6: Deploy QWAMI Token program (without IDL first)
echo -e "\n${YELLOW}Step 6: Deploying QWAMI Token to ${CLUSTER} (initial deployment)...${NC}"
anchor deploy --provider.cluster $CLUSTER --program-name qwami_token 2>&1 | grep -v "Error creating IDL" || true
echo -e "${GREEN}✅ QWAMI Token deployed to ${CLUSTER}${NC}"
echo -e "Explorer: ${BLUE}https://explorer.solana.com/address/${QWAMI_PROGRAM_ID}?cluster=${CLUSTER}${NC}"
echo -e "${YELLOW}Note: IDL will be uploaded after updating program IDs${NC}"

# Step 7: Build KWAMI NFT program
echo -e "\n${YELLOW}Step 7: Building KWAMI NFT program...${NC}"
cd ../kwami
anchor clean
anchor build
echo -e "${GREEN}✅ KWAMI NFT program built (with IDL)${NC}"

# Get KWAMI program ID
KWAMI_PROGRAM_ID=$(anchor keys list | grep kwami_nft | awk '{print $2}')
echo -e "KWAMI NFT Program ID: ${BLUE}${KWAMI_PROGRAM_ID}${NC}"

# Step 8: Deploy KWAMI NFT program (without IDL first)
echo -e "\n${YELLOW}Step 8: Deploying KWAMI NFT to ${CLUSTER} (initial deployment)...${NC}"
anchor deploy --provider.cluster $CLUSTER --program-name kwami_nft 2>&1 | grep -v "Error creating IDL" || true
echo -e "${GREEN}✅ KWAMI NFT deployed to ${CLUSTER}${NC}"
echo -e "Explorer: ${BLUE}https://explorer.solana.com/address/${KWAMI_PROGRAM_ID}?cluster=${CLUSTER}${NC}"
echo -e "${YELLOW}Note: IDL will be uploaded after updating program IDs${NC}"

# Step 9: Update program IDs in source code and redeploy
echo -e "\n${YELLOW}Step 9: Updating program IDs in source code...${NC}"
cd ..

# Update QWAMI program ID
QWAMI_LIB_RS="qwami/programs/qwami-token/src/lib.rs"
if [ -f "$QWAMI_LIB_RS" ]; then
    sed -i "s/declare_id!(\"[^\"]*\");/declare_id!(\"${QWAMI_PROGRAM_ID}\");/" "$QWAMI_LIB_RS"
    echo -e "${GREEN}✅ Updated QWAMI program ID in source${NC}"
else
    echo -e "${RED}❌ Could not find ${QWAMI_LIB_RS}${NC}"
fi

# Update KWAMI program ID
KWAMI_LIB_RS="kwami/programs/kwami-nft/src/lib.rs"
if [ -f "$KWAMI_LIB_RS" ]; then
    sed -i "s/declare_id!(\"[^\"]*\");/declare_id!(\"${KWAMI_PROGRAM_ID}\");/" "$KWAMI_LIB_RS"
    echo -e "${GREEN}✅ Updated KWAMI program ID in source${NC}"
else
    echo -e "${RED}❌ Could not find ${KWAMI_LIB_RS}${NC}"
fi

# Step 10: Rebuild and redeploy with correct IDs
echo -e "\n${YELLOW}Step 10: Rebuilding with correct program IDs...${NC}"

echo -e "${YELLOW}Rebuilding QWAMI...${NC}"
cd qwami
anchor build

anchor deploy --provider.cluster $CLUSTER
echo -e "${GREEN}✅ QWAMI redeployed with correct ID${NC}"

# Upload QWAMI IDL
echo -e "${YELLOW}Uploading QWAMI IDL...${NC}"
anchor idl init --filepath target/idl/qwami_token.json "${QWAMI_PROGRAM_ID}" --provider.cluster $CLUSTER 2>/dev/null || \
  anchor idl upgrade --filepath target/idl/qwami_token.json "${QWAMI_PROGRAM_ID}" --provider.cluster $CLUSTER
echo -e "${GREEN}✅ QWAMI IDL uploaded${NC}"

echo -e "\n${YELLOW}Rebuilding KWAMI...${NC}"
cd ../kwami
anchor build

anchor deploy --provider.cluster $CLUSTER
echo -e "${GREEN}✅ KWAMI redeployed with correct ID${NC}"

# Upload KWAMI IDL
echo -e "${YELLOW}Uploading KWAMI IDL...${NC}"
anchor idl init --filepath target/idl/kwami_nft.json "${KWAMI_PROGRAM_ID}" --provider.cluster $CLUSTER 2>/dev/null || \
  anchor idl upgrade --filepath target/idl/kwami_nft.json "${KWAMI_PROGRAM_ID}" --provider.cluster $CLUSTER
echo -e "${GREEN}✅ KWAMI IDL uploaded${NC}"

cd ..

# Step 11: Initialize programs
echo -e "\n${YELLOW}Step 11: Initializing programs...${NC}"

# Check if Node.js/npm is available
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js/npm not found. Skipping initialization.${NC}"
    echo -e "${YELLOW}   Run initialization scripts manually:${NC}"
    echo -e "   cd qwami && npm run initialize"
    echo -e "   cd kwami && npm run initialize"
    INIT_SKIPPED=true
else
    # Initialize QWAMI
    echo -e "\n${YELLOW}Initializing QWAMI Token...${NC}"
    cd qwami
    
    # Set environment variables for Anchor provider
    export ANCHOR_PROVIDER_URL="$CLUSTER_URL"
    export ANCHOR_WALLET="${HOME}/.config/solana/id.json"
    
    if npm run initialize; then
        echo -e "${GREEN}✅ QWAMI Token initialized${NC}"
        QWAMI_INITIALIZED=true
    else
        echo -e "${YELLOW}⚠️  QWAMI initialization failed. You may need to run it manually.${NC}"
        QWAMI_INITIALIZED=false
    fi

    # Initialize KWAMI
    echo -e "\n${YELLOW}Initializing KWAMI NFT...${NC}"
    cd ../kwami
    
    # Update QWAMI mint address in initialization script
    if [ -f "../qwami/devnet-addresses.json" ]; then
        QWAMI_MINT=$(cat ../qwami/devnet-addresses.json | grep -o '"qwamiMint": "[^"]*"' | cut -d'"' -f4)
        if [ -n "$QWAMI_MINT" ]; then
            sed -i "s/const QWAMI_MINT_ADDRESS = \"[^\"]*\";/const QWAMI_MINT_ADDRESS = \"${QWAMI_MINT}\";/" scripts/initialize-kwami.ts
        fi
    fi
    
    if npm run initialize; then
        echo -e "${GREEN}✅ KWAMI NFT initialized${NC}"
        KWAMI_INITIALIZED=true
    else
        echo -e "${YELLOW}⚠️  KWAMI initialization failed. You may need to run it manually.${NC}"
        KWAMI_INITIALIZED=false
    fi
    
    cd ..
    INIT_SKIPPED=false
fi

# Step 12: Create deployment record
echo -e "\n${YELLOW}Step 12: Creating deployment record...${NC}"

RECORD_FILE="$SCRIPT_DIR/DEPLOY_${CLUSTER^^}_RECORD.md"

cat > "$RECORD_FILE" << EOF
# 🚀 ${CLUSTER^} Deployment Record

**Date:** $(date)
**Deployer:** ${WALLET_ADDRESS}
**Cluster:** ${CLUSTER}

---

## 📝 Program IDs

### QWAMI Token Program
\`\`\`
Program ID: ${QWAMI_PROGRAM_ID}
Explorer: https://explorer.solana.com/address/${QWAMI_PROGRAM_ID}?cluster=${CLUSTER}
\`\`\`

### KWAMI NFT Program
\`\`\`
Program ID: ${KWAMI_PROGRAM_ID}
Explorer: https://explorer.solana.com/address/${KWAMI_PROGRAM_ID}?cluster=${CLUSTER}
\`\`\`

---

## 🔑 Configuration

### USDC Mint
\`\`\`
USDC Mint: ${USDC_MINT}
\`\`\`

### Wallet
\`\`\`
Address: ${WALLET_ADDRESS}
Balance: ${BALANCE} SOL
\`\`\`

---

## ⚠️ Next Steps

1. **Test on ${CLUSTER^}**
   - Run test scripts
   - Verify all operations work
   - Check treasury accounting

2. **Monitor for 24 Hours**
   - Watch for errors
   - Check transaction success rate
   - Verify economic model

---

## 📚 Resources

- [Solana Explorer](https://explorer.solana.com/?cluster=${CLUSTER})
- [Anchor Docs](https://www.anchor-lang.com/)

---

**Deployment Status:** ✅ Programs Deployed and Initialized
EOF

if [ "$INIT_SKIPPED" = true ]; then
    echo "\n## ⚠️ Manual Initialization Required\n" >> "$RECORD_FILE"
    echo "Node.js was not available during deployment. Run:\n" >> "$RECORD_FILE"
    echo "\`\`\`bash" >> "$RECORD_FILE"
    echo "cd qwami && npm run initialize" >> "$RECORD_FILE"
    echo "cd ../kwami && npm run initialize" >> "$RECORD_FILE"
    echo "\`\`\`" >> "$RECORD_FILE"
elif [ "$QWAMI_INITIALIZED" = false ] || [ "$KWAMI_INITIALIZED" = false ]; then
    echo "\n## ⚠️ Initialization Issues\n" >> "$RECORD_FILE"
    [ "$QWAMI_INITIALIZED" = false ] && echo "- QWAMI: Failed (run manually)\n" >> "$RECORD_FILE"
    [ "$KWAMI_INITIALIZED" = false ] && echo "- KWAMI: Failed (run manually)\n" >> "$RECORD_FILE"
else
    echo "\n## ✅ Initialization Complete\n" >> "$RECORD_FILE"
    echo "Both programs are fully initialized and ready to use.\n" >> "$RECORD_FILE"
fi

echo -e "${GREEN}✅ Deployment record created: ${RECORD_FILE}${NC}"

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
echo -e "QWAMI: ${BLUE}https://explorer.solana.com/address/${QWAMI_PROGRAM_ID}?cluster=${CLUSTER}${NC}"
echo -e "KWAMI: ${BLUE}https://explorer.solana.com/address/${KWAMI_PROGRAM_ID}?cluster=${CLUSTER}${NC}"

if [ "$INIT_SKIPPED" = true ] || [ "$QWAMI_INITIALIZED" = false ] || [ "$KWAMI_INITIALIZED" = false ]; then
    echo -e "\n${YELLOW}⚠️  Next Steps:${NC}"
    [ "$INIT_SKIPPED" = true ] && echo -e "1. Install Node.js if needed"
    [ "$QWAMI_INITIALIZED" = false ] && echo -e "2. Run: cd qwami && npm run initialize"
    [ "$KWAMI_INITIALIZED" = false ] && echo -e "3. Run: cd kwami && npm run initialize"
    echo -e "4. Test all operations on ${CLUSTER}"
    echo -e "5. Monitor for 24-48 hours"
else
    echo -e "\n${GREEN}🎊 All Done! Programs are deployed and initialized!${NC}"
    echo -e "\n${YELLOW}📋 Next Steps:${NC}"
    echo -e "1. Test all operations on ${CLUSTER}"
    echo -e "2. Monitor for 24-48 hours"
    echo -e "3. Review treasury accounting"
fi

echo -e "\n${GREEN}🎉 Ready for the next phase!${NC}\n"
