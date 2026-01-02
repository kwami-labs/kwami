#!/bin/bash

# 🚀 KWAMI Ecosystem Program Initialization Script
# Initializes both QWAMI Token and KWAMI NFT programs
# (Folder structure refactored: qwami-token/, kwami-nft/)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SOLANA_DIR="$(cd "$SCRIPT_DIR/.." &> /dev/null && pwd)"
QWAMI_DIR="${SOLANA_DIR}/qwami-token"
KWAMI_DIR="${SOLANA_DIR}/kwami-nft"

is_lt() {
  # float-safe compare without depending on `bc`
  awk -v a="$1" -v b="$2" 'BEGIN { exit !(a+0 < b+0) }'
}

echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════════════"
echo "  🚀 KWAMI Ecosystem Program Initialization"
echo "═══════════════════════════════════════════════════════════"
echo -e "${NC}"

# Verify expected workspaces exist
if [ ! -d "$QWAMI_DIR" ] || [ ! -d "$KWAMI_DIR" ]; then
  echo -e "${RED}❌ Expected workspaces not found.${NC}"
  echo -e "${YELLOW}Looked for:${NC}"
  echo -e "  - ${BLUE}${QWAMI_DIR}${NC}"
  echo -e "  - ${BLUE}${KWAMI_DIR}${NC}"
  exit 1
fi

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

if is_lt "$BALANCE" "0.5"; then
    echo -e "${RED}❌ Insufficient balance. Need at least 0.5 SOL${NC}"
    exit 1
fi

echo -e "\n${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  Step 1: Initialize QWAMI Token Program${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}\n"

cd "$QWAMI_DIR"

# Ensure JS deps exist (safe if already installed)
if [ ! -d node_modules ]; then
  npm install
fi

echo -e "${YELLOW}Running QWAMI initialization...${NC}"

if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ Node.js/npx not found. Cannot run initialization.${NC}"
    exit 1
fi

if ANCHOR_PROVIDER_URL="$CLUSTER" ANCHOR_WALLET="$WALLET_PATH" npm run initialize; then
    echo -e "${GREEN}✅ QWAMI Token initialized successfully!${NC}"
    
    # Addresses are written by the script in the workspace directory
    # Addresses are written by the script in the workspace directory
    CLUSTER_NAME=$(
      if echo "$CLUSTER" | grep -qE 'localhost|127\.0\.0\.1'; then echo "localnet";
      elif echo "$CLUSTER" | grep -q 'devnet'; then echo "devnet";
      elif echo "$CLUSTER" | grep -q 'testnet'; then echo "testnet";
      elif echo "$CLUSTER" | grep -q 'mainnet'; then echo "mainnet";
      else echo "unknown"; fi
    )
    ADDRESSES_FILE="${CLUSTER_NAME}-addresses.json"
    
    if [ -f "$ADDRESSES_FILE" ]; then
        QWAMI_MINT=$(grep -o '"qwamiMint": "[^"]*"' "$ADDRESSES_FILE" | cut -d'"' -f4)
        echo -e "${GREEN}  Mint: ${QWAMI_MINT}${NC}"
        echo -e "${GREEN}  Addresses: ${QWAMI_DIR}/${ADDRESSES_FILE}${NC}"
    fi
else
    echo -e "${RED}❌ QWAMI initialization failed${NC}"
    cd "$SOLANA_DIR"
    exit 1
fi

cd "$SOLANA_DIR"

echo -e "\n${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  Step 2: Initialize KWAMI NFT Program${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}\n"

cd "$KWAMI_DIR"

# Ensure JS deps exist (safe if already installed)
if [ ! -d node_modules ]; then
  npm install
fi

echo -e "${YELLOW}Running KWAMI initialization...${NC}"

if ANCHOR_PROVIDER_URL="$CLUSTER" ANCHOR_WALLET="$WALLET_PATH" npm run initialize; then
    echo -e "${GREEN}✅ KWAMI NFT initialized successfully!${NC}"

    CLUSTER_NAME=$(
      if echo "$CLUSTER" | grep -qE 'localhost|127\.0\.0\.1'; then echo "localnet";
      elif echo "$CLUSTER" | grep -q 'devnet'; then echo "devnet";
      elif echo "$CLUSTER" | grep -q 'testnet'; then echo "testnet";
      elif echo "$CLUSTER" | grep -q 'mainnet'; then echo "mainnet";
      else echo "unknown"; fi
    )
    ADDRESSES_FILE="${CLUSTER_NAME}-addresses.json"
    if [ -f "$ADDRESSES_FILE" ]; then
        COLLECTION_MINT=$(grep -o '"collectionMint": "[^"]*"' "$ADDRESSES_FILE" | cut -d'"' -f4)
        echo -e "${GREEN}  Collection Mint: ${COLLECTION_MINT}${NC}"
        echo -e "${GREEN}  Addresses: ${KWAMI_DIR}/${ADDRESSES_FILE}${NC}"
    fi
    KWAMI_INITIALIZED=true
else
    echo -e "${RED}❌ KWAMI initialization failed${NC}"
    KWAMI_INITIALIZED=false
fi

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Initialization Complete${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Status:${NC}"
echo -e "  ✅ QWAMI Token: Initialized"
if [ "${KWAMI_INITIALIZED}" = true ]; then
  echo -e "  ✅ KWAMI NFT: Initialized"
else
  echo -e "  ❌ KWAMI NFT: Failed"
fi
echo -e ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. If needed, deploy programs: ${BLUE}${SOLANA_DIR}/scripts/deploy-programs.sh${NC}"
echo -e "  2. Re-run initialization: ${BLUE}${SOLANA_DIR}/scripts/initialize-programs.sh${NC}"
echo ""
