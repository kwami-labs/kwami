#!/bin/bash

# 🚀 Initialize Kwami NFT Collection
# This script deploys the Kwami NFT program and initializes the collection

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Kwami NFT Collection Initialization${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found. Please install it first.${NC}"
    exit 1
fi

if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor CLI not found. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites satisfied${NC}"
echo ""

# Get current configuration
echo -e "${YELLOW}📡 Checking Solana configuration...${NC}"
CLUSTER=$(solana config get | grep "RPC URL" | awk '{print $3}')
WALLET=$(solana config get | grep "Keypair Path" | awk '{print $3}')
BALANCE=$(solana balance | awk '{print $1}')

echo "   Cluster: $CLUSTER"
echo "   Wallet: $WALLET"
echo "   Balance: $BALANCE SOL"
echo ""

# Confirm cluster
if [[ $CLUSTER != *"devnet"* ]] && [[ $CLUSTER != *"localhost"* ]]; then
    echo -e "${RED}⚠️  WARNING: You are not on devnet or localhost!${NC}"
    echo -e "${RED}   Current cluster: $CLUSTER${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Check balance
if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Low balance detected. Consider funding your wallet.${NC}"
    echo "   You can request an airdrop: solana airdrop 2"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Navigate to Kwami NFT program
echo -e "${YELLOW}📦 Building Kwami NFT program...${NC}"
cd "$(dirname "$0")/../anchor/kwami-nft"

# Clean and build
anchor clean
anchor build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Deploy program
echo -e "${YELLOW}🚀 Deploying Kwami NFT program...${NC}"
DEPLOY_OUTPUT=$(anchor deploy 2>&1)
echo "$DEPLOY_OUTPUT"

# Extract program ID
PROGRAM_ID=$(echo "$DEPLOY_OUTPUT" | grep "Program Id:" | awk '{print $3}')

if [ -z "$PROGRAM_ID" ]; then
    echo -e "${RED}❌ Failed to deploy program${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Program deployed: $PROGRAM_ID${NC}"
echo ""

# Update declare_id in lib.rs
echo -e "${YELLOW}📝 Updating program ID in source code...${NC}"
sed -i "s/declare_id!(\".*\")/declare_id!(\"$PROGRAM_ID\")/" programs/kwami-nft/src/lib.rs

# Rebuild with correct program ID
echo -e "${YELLOW}🔨 Rebuilding with correct program ID...${NC}"
anchor build

# Redeploy
echo -e "${YELLOW}🚀 Redeploying with correct program ID...${NC}"
anchor deploy

echo -e "${GREEN}✅ Program redeployed with correct ID${NC}"
echo ""

# Generate collection mint keypair
echo -e "${YELLOW}🔑 Generating collection mint keypair...${NC}"
COLLECTION_KEYPAIR="/tmp/kwami-collection-$(date +%s).json"
solana-keygen new --no-bip39-passphrase --outfile "$COLLECTION_KEYPAIR"
COLLECTION_MINT=$(solana-keygen pubkey "$COLLECTION_KEYPAIR")

echo -e "${GREEN}✅ Collection mint: $COLLECTION_MINT${NC}"
echo "   Keypair saved to: $COLLECTION_KEYPAIR"
echo ""

# TODO: Initialize collection using Anchor client
# This would require a TypeScript/JavaScript script
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "   1. Run the collection initialization script:"
echo "      cd solana/metaplex"
echo "      ts-node utils/initializeCollection.ts"
echo ""
echo "   2. Update your .env file with:"
echo "      NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=$PROGRAM_ID"
echo "      NUXT_PUBLIC_KWAMI_COLLECTION_MINT=$COLLECTION_MINT"
echo ""
echo "   3. Save the collection keypair securely:"
echo "      mv $COLLECTION_KEYPAIR ~/kwami-collection.json"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Kwami NFT Program Deployed${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Program ID: $PROGRAM_ID${NC}"
echo -e "${BLUE}Collection Mint: $COLLECTION_MINT${NC}"
echo ""
