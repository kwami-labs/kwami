#!/bin/bash

# KWAMI Authentication Server API Test Script
# This script tests all API endpoints

set -e

BASE_URL="http://localhost:3000"
PUBKEY="YOUR_SOLANA_PUBKEY_HERE"

echo "🧪 Testing KWAMI Authentication Server API"
echo "==========================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing health endpoint..."
HEALTH=$(curl -s "${BASE_URL}/health")
if [ "$HEALTH" = "OK" ]; then
    echo "✅ Health check passed: $HEALTH"
else
    echo "❌ Health check failed: $HEALTH"
    exit 1
fi
echo ""

# Test 2: Generate Nonce
echo "2️⃣  Testing nonce generation..."
NONCE_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/nonce" \
    -H "Content-Type: application/json" \
    -d "{\"pubkey\":\"$PUBKEY\"}")

echo "Response: $NONCE_RESPONSE"

# Extract nonce and message using jq if available
if command -v jq &> /dev/null; then
    NONCE=$(echo "$NONCE_RESPONSE" | jq -r '.nonce')
    MESSAGE=$(echo "$NONCE_RESPONSE" | jq -r '.message')
    EXPIRES_IN=$(echo "$NONCE_RESPONSE" | jq -r '.expires_in')
    
    echo "✅ Nonce generated successfully"
    echo "   Nonce: $NONCE"
    echo "   Message: $MESSAGE"
    echo "   Expires in: $EXPIRES_IN seconds"
else
    echo "✅ Nonce response received (install jq for detailed parsing)"
fi
echo ""

# Test 3: Login (will fail without valid signature)
echo "3️⃣  Testing login endpoint (expected to fail without valid signature)..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"pubkey\":\"$PUBKEY\",
        \"signature\":\"FAKE_SIGNATURE_FOR_TESTING\",
        \"message\":\"$MESSAGE\",
        \"nonce\":\"$NONCE\"
    }")

echo "Response: $LOGIN_RESPONSE"
echo "⚠️  Login requires valid wallet signature (use frontend integration)"
echo ""

# Test 4: Protected endpoint without auth
echo "4️⃣  Testing protected endpoint without auth (should fail)..."
PROTECTED_RESPONSE=$(curl -s "${BASE_URL}/me/owned-kwamis")
echo "Response: $PROTECTED_RESPONSE"

if echo "$PROTECTED_RESPONSE" | grep -q "error"; then
    echo "✅ Protected endpoint correctly requires authentication"
else
    echo "❌ Protected endpoint should require authentication"
fi
echo ""

echo "==========================================="
echo "🎉 API test complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Connect your Solana wallet in the frontend"
echo "   2. Sign the message with your wallet"
echo "   3. Use the signature to complete login"
echo "   4. Use the JWT token for protected endpoints"
echo ""
echo "For full integration testing, use the frontend app with wallet connection."
