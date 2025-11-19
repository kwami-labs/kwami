#!/usr/bin/env bash

# fund-devnet.sh - Fund Solana wallets on devnet for testing
# Usage: ./fund-devnet.sh [wallet_address] [amount_in_sol]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
DEFAULT_AMOUNT=2
MAX_AIRDROP=2

echo "🪂 Solana Devnet Funding Script"
echo "================================"
echo ""

# Check if solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo -e "${RED}Error: Solana CLI is not installed${NC}"
    echo "Please install from: https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

# Get wallet address
if [ -z "$1" ]; then
    # Use default wallet
    WALLET=$(solana address)
    echo -e "${YELLOW}Using default wallet:${NC} $WALLET"
else
    WALLET=$1
    echo -e "${YELLOW}Funding wallet:${NC} $WALLET"
fi

# Validate wallet address
if ! solana-keygen verify "$WALLET" &> /dev/null && [ ${#WALLET} -ne 44 ]; then
    echo -e "${RED}Error: Invalid wallet address${NC}"
    exit 1
fi

# Get amount
if [ -z "$2" ]; then
    AMOUNT=$DEFAULT_AMOUNT
else
    AMOUNT=$2
fi

echo -e "${YELLOW}Amount requested:${NC} $AMOUNT SOL"
echo ""

# Check current network
CURRENT_NETWORK=$(solana config get | grep "RPC URL" | awk '{print $3}')
echo -e "${YELLOW}Current RPC:${NC} $CURRENT_NETWORK"

# Warn if not on devnet
if [[ ! "$CURRENT_NETWORK" =~ "devnet" ]]; then
    echo -e "${RED}Warning: Not connected to devnet!${NC}"
    echo "Current network: $CURRENT_NETWORK"
    read -p "Switch to devnet? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        solana config set --url https://api.devnet.solana.com
        echo -e "${GREEN}Switched to devnet${NC}"
    else
        echo "Aborted"
        exit 1
    fi
fi

# Check current balance
CURRENT_BALANCE=$(solana balance "$WALLET" 2>/dev/null | awk '{print $1}')
echo -e "${YELLOW}Current balance:${NC} $CURRENT_BALANCE SOL"
echo ""

# Calculate airdrops needed
AIRDROPS_NEEDED=$(echo "($AMOUNT + $MAX_AIRDROP - 1) / $MAX_AIRDROP" | bc)

if [ "$AIRDROPS_NEEDED" -gt 5 ]; then
    echo -e "${RED}Error: Amount too large${NC}"
    echo "Maximum 10 SOL (5 airdrops x 2 SOL)"
    exit 1
fi

echo "Requesting $AIRDROPS_NEEDED airdrop(s)..."
echo ""

# Perform airdrops
SUCCESS_COUNT=0
for ((i=1; i<=$AIRDROPS_NEEDED; i++)); do
    if [ $i -eq $AIRDROPS_NEEDED ]; then
        # Last airdrop - might be partial
        REMAINING=$(echo "$AMOUNT - ($i - 1) * $MAX_AIRDROP" | bc)
        AIRDROP_AMOUNT=$REMAINING
    else
        AIRDROP_AMOUNT=$MAX_AIRDROP
    fi
    
    echo -e "${YELLOW}Airdrop $i/$AIRDROPS_NEEDED:${NC} $AIRDROP_AMOUNT SOL"
    
    if solana airdrop $AIRDROP_AMOUNT "$WALLET" 2>&1 | grep -q "Error"; then
        echo -e "${RED}✗ Failed${NC}"
        
        # Try alternative method via faucet
        echo "Trying alternative faucet..."
        
        # Use curl to hit the faucet API directly
        RESPONSE=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "{\"pubkey\": \"$WALLET\", \"amount\": $(echo "$AIRDROP_AMOUNT * 1000000000" | bc | cut -d'.' -f1)}" \
            https://api.devnet.solana.com/airdrop)
        
        if echo "$RESPONSE" | grep -q "error"; then
            echo -e "${RED}✗ Alternative faucet also failed${NC}"
            echo "Try again in a few minutes (rate limit)"
        else
            echo -e "${GREEN}✓ Success via faucet${NC}"
            ((SUCCESS_COUNT++))
        fi
    else
        echo -e "${GREEN}✓ Success${NC}"
        ((SUCCESS_COUNT++))
    fi
    
    # Wait between airdrops to avoid rate limits
    if [ $i -lt $AIRDROPS_NEEDED ]; then
        echo "Waiting 2 seconds..."
        sleep 2
    fi
    
    echo ""
done

# Check final balance
echo "Checking final balance..."
sleep 2
FINAL_BALANCE=$(solana balance "$WALLET" 2>/dev/null | awk '{print $1}')

echo ""
echo "================================"
echo -e "${GREEN}Funding Complete!${NC}"
echo ""
echo -e "Wallet: ${YELLOW}$WALLET${NC}"
echo -e "Previous balance: ${YELLOW}$CURRENT_BALANCE SOL${NC}"
echo -e "Current balance:  ${GREEN}$FINAL_BALANCE SOL${NC}"
echo -e "Added:            ${GREEN}$(echo "$FINAL_BALANCE - $CURRENT_BALANCE" | bc) SOL${NC}"
echo -e "Successful airdrops: $SUCCESS_COUNT/$AIRDROPS_NEEDED"
echo ""

if [ $SUCCESS_COUNT -lt $AIRDROPS_NEEDED ]; then
    echo -e "${YELLOW}Note: Not all airdrops succeeded${NC}"
    echo "This is usually due to rate limiting."
    echo "Wait a few minutes and run again if needed."
    echo ""
fi

# Show next steps
echo "Next Steps:"
echo "1. Deploy programs: cd solana/anchor/qwami-token && anchor deploy"
echo "2. Initialize token: ./solana/scripts/deploy-qwami-token.sh"
echo "3. Initialize collection: ./solana/scripts/initialize-collection.sh"
echo ""

exit 0
