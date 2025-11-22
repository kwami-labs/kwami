#!/bin/bash

# Test Anchor Programs
# Runs Anchor tests for both QWAMI token and KWAMI NFT programs

set -e

echo "🧪 Testing Anchor Programs..."
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

# Test QWAMI Token Program
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 Testing QWAMI Token Program...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cd "$ANCHOR_ROOT/qwami"

anchor test

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ QWAMI Token tests passed${NC}"
else
    echo -e "${RED}❌ QWAMI Token tests failed${NC}"
    exit 1
fi

echo ""

# Test KWAMI NFT Program
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🎨 Testing KWAMI NFT Program...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cd "$ANCHOR_ROOT/kwami"

anchor test

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ KWAMI NFT tests passed${NC}"
else
    echo -e "${RED}❌ KWAMI NFT tests failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ All tests passed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

