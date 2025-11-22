#!/bin/bash

# Build Anchor Programs for KWAMI Candy Machine
# This script builds both QWAMI token and KWAMI NFT programs

set -e

echo "🔨 Building Anchor Programs..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ANCHOR_ROOT="$PROJECT_ROOT/solana/anchor"

echo -e "${BLUE}Project root: $PROJECT_ROOT${NC}"
echo ""

# Build QWAMI Token Program
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 Building QWAMI Token Program...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cd "$ANCHOR_ROOT/qwami"

# Clean previous build
echo "Cleaning previous build..."
anchor clean

# Build
echo "Building..."
anchor build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ QWAMI Token Program built successfully${NC}"
    QWAMI_PROGRAM_ID=$(solana address -k target/deploy/qwami_token-keypair.json)
    echo -e "${GREEN}Program ID: $QWAMI_PROGRAM_ID${NC}"
else
    echo -e "${RED}❌ QWAMI Token Program build failed${NC}"
    exit 1
fi

echo ""

# Build KWAMI NFT Program
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🎨 Building KWAMI NFT Program...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cd "$ANCHOR_ROOT/kwami"

# Clean previous build
echo "Cleaning previous build..."
anchor clean

# Build
echo "Building..."
anchor build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ KWAMI NFT Program built successfully${NC}"
    KWAMI_PROGRAM_ID=$(solana address -k target/deploy/kwami_nft-keypair.json)
    echo -e "${GREEN}Program ID: $KWAMI_PROGRAM_ID${NC}"
else
    echo -e "${RED}❌ KWAMI NFT Program build failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ All programs built successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 Program IDs:"
echo "  QWAMI Token: $QWAMI_PROGRAM_ID"
echo "  KWAMI NFT:   $KWAMI_PROGRAM_ID"
echo ""
echo "💡 Next steps:"
echo "  1. Update program IDs in declare_id!() macros"
echo "  2. Rebuild programs after updating IDs"
echo "  3. Run deploy script: ./scripts/deploy-anchor.sh"
echo ""

