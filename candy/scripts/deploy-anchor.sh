#!/bin/bash

# Deploy Anchor Programs to Solana Devnet/Mainnet
# This script deploys both QWAMI token and KWAMI NFT programs

set -e

echo "🚀 Deploying Anchor Programs..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ANCHOR_ROOT="$PROJECT_ROOT/solana/anchor"
CANDY_ROOT="$PROJECT_ROOT/candy"

# Get network (default to devnet)
NETWORK="${1:-devnet}"

echo -e "${BLUE}Project root: $PROJECT_ROOT${NC}"
echo -e "${BLUE}Network: $NETWORK${NC}"
echo ""

# Check if wallet is configured and funded
BALANCE=$(solana balance 2>/dev/null || echo "0")
echo -e "Wallet balance: ${BLUE}$BALANCE${NC}"

if [ "$BALANCE" == "0" ] || [ "$BALANCE" == "0 SOL" ]; then
    echo -e "${RED}❌ Wallet not funded!${NC}"
    echo ""
    echo "Please fund your wallet:"
    if [ "$NETWORK" == "devnet" ]; then
        echo "  solana airdrop 2"
    else
        echo "  Transfer SOL to your wallet address"
    fi
    exit 1
fi

echo ""

# Deploy QWAMI Token Program
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 Deploying QWAMI Token Program...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cd "$ANCHOR_ROOT/qwami"

echo "Deploying to $NETWORK..."
anchor deploy --provider.cluster $NETWORK

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ QWAMI Token Program deployed${NC}"
    QWAMI_PROGRAM_ID=$(solana address -k target/deploy/qwami_token-keypair.json)
    echo -e "${GREEN}Program ID: $QWAMI_PROGRAM_ID${NC}"
else
    echo -e "${RED}❌ QWAMI Token Program deployment failed${NC}"
    exit 1
fi

echo ""

# Deploy KWAMI NFT Program
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🎨 Deploying KWAMI NFT Program...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cd "$ANCHOR_ROOT/kwami"

echo "Deploying to $NETWORK..."
anchor deploy --provider.cluster $NETWORK

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ KWAMI NFT Program deployed${NC}"
    KWAMI_PROGRAM_ID=$(solana address -k target/deploy/kwami_nft-keypair.json)
    echo -e "${GREEN}Program ID: $KWAMI_PROGRAM_ID${NC}"
else
    echo -e "${RED}❌ KWAMI NFT Program deployment failed${NC}"
    exit 1
fi

echo ""

# Copy IDLs to candy app
echo -e "${BLUE}📄 Copying IDLs to candy app...${NC}"
mkdir -p "$CANDY_ROOT/public/idl"
cp "$ANCHOR_ROOT/qwami/target/idl/qwami_token.json" "$CANDY_ROOT/public/idl/"
cp "$ANCHOR_ROOT/kwami/target/idl/kwami_nft.json" "$CANDY_ROOT/public/idl/"
echo -e "${GREEN}✅ IDLs copied${NC}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ All programs deployed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 Program IDs:"
echo "  QWAMI Token: $QWAMI_PROGRAM_ID"
echo "  KWAMI NFT:   $KWAMI_PROGRAM_ID"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Update your .env file!${NC}"
echo ""
echo "Add these to candy/.env:"
echo ""
echo "NUXT_PUBLIC_QWAMI_TOKEN_PROGRAM_ID=$QWAMI_PROGRAM_ID"
echo "NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=$KWAMI_PROGRAM_ID"
echo ""
echo "💡 Next steps:"
echo "  1. Update candy/.env with program IDs above"
echo "  2. Initialize programs (run initialization transactions)"
echo "  3. Test minting on $NETWORK"
echo ""

