# KWAMI App + Server Integration Guide

This guide walks you through testing the complete authentication flow between the frontend app and the Rust backend server.

## Quick Start

### 1. Start the Backend Server

In terminal 1:
```bash
# From project root
npm run server

# You should see:
# 🚀 Starting KWAMI Authentication Server
# 🎧 Listening on 0.0.0.0:3000
# 📡 Solana RPC: https://api.devnet.solana.com
# ✅ Server ready to accept connections
```

### 2. Start the Frontend App

In terminal 2:
```bash
# From project root
npm run app

# Opens at http://localhost:5500
```

### 3. Test the Flow

1. **Connect Wallet**: Click "Connect Wallet" and connect your Solana wallet
2. **Select KWAMI**: Choose one of your KWAMI NFTs from the dialog
3. **Watch Console**: Open browser DevTools (F12) and check console logs

You should see:
```
✅ Logged in with KWAMI: KWAMI #123
🔐 Authenticating with server...
📝 Signing message: Login to KWAMI API with nonce: ...
✅ Authenticated with server, JWT token received
🎨 Server found 3 KWAMIs
✨ Selected KWAMI: <mint-address>
```

## What's Happening

### Authentication Flow

```
1. User selects KWAMI NFT
   └─▶ App triggers authenticateWithServer()

2. App checks server health
   └─▶ GET http://localhost:3000/health

3. App requests nonce
   └─▶ POST /auth/nonce { pubkey }
   └─▶ Server returns { nonce, message }

4. User signs message with wallet
   └─▶ Wallet extension prompts user
   └─▶ Returns Ed25519 signature

5. App sends login request
   └─▶ POST /auth/login { pubkey, signature, message, nonce }
   └─▶ Server verifies signature via Solana SDK
   └─▶ Server queries Solana for owned KWAMIs
   └─▶ Returns { token, owned_kwamis }

6. App selects KWAMI
   └─▶ POST /auth/select-kwami { kwami_mint }
   └─▶ Server verifies ownership
   └─▶ Returns new JWT with kwami_mint embedded

7. JWT stored in localStorage
   └─▶ Ready for future ElevenLabs requests
```

## Verifying Authentication

### Check JWT Token

Open browser console:
```javascript
// Get stored token
localStorage.getItem('kwami-auth-token')

// Decode JWT (paste token at jwt.io)
```

### Server Logs

Check server terminal for authentication logs:
```
INFO  Generated nonce abc-123 for <pubkey>
INFO  Signature verified for <pubkey>
INFO  Found 3 KWAMIs for <pubkey>
INFO  User <pubkey> selected KWAMI <mint>
```

### Test Protected Endpoint

In browser console:
```javascript
// Get token
const token = localStorage.getItem('kwami-auth-token')

// Call protected endpoint
fetch('http://localhost:3000/me/owned-kwamis', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(data => console.log('Owned KWAMIs:', data))
```

## Troubleshooting

### Server Not Starting

```bash
# Check if port 3000 is in use
lsof -i :3000

# Use different port
cd server
PORT=3001 cargo run
```

Then update `app/.env`:
```
VITE_AUTH_SERVER_URL=http://localhost:3001
```

### "Auth server is not reachable"

1. Ensure server is running (`npm run server`)
2. Check firewall settings
3. Verify URL in `app/.env`

### Signature Verification Failed

- Ensure you're using the correct network (devnet/mainnet)
- Check wallet is properly connected
- Try disconnecting and reconnecting wallet

### No KWAMIs Found

- Verify wallet owns KWAMI NFTs on the correct network
- Check `KWAMI_COLLECTION_MINT` in `server/.env`
- Ensure RPC endpoint is working

### CORS Errors

The server has CORS enabled for all origins by default. If issues persist:
```rust
// In server/src/main.rs, update CORS layer
.allow_origin(["http://localhost:5500".parse().unwrap()])
```

## Network Configuration

### Using Devnet (Default)

App (`.env`):
```
VITE_SOLANA_NETWORK=devnet
VITE_KWAMI_COLLECTION_ADDRESS=CzNuMseUFbpXNDLEKWEtrD3snXhNdZiGMn1rFFjjGvj6
```

Server (`.env`):
```
SOLANA_RPC_URL=https://api.devnet.solana.com
KWAMI_COLLECTION_MINT=CzNuMseUFbpXNDLEKWEtrD3snXhNdZiGMn1rFFjjGvj6
```

### Switching to Mainnet

App:
```
VITE_SOLANA_NETWORK=mainnet-beta
VITE_KWAMI_COLLECTION_ADDRESS=<your-mainnet-collection>
```

Server:
```
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
# Or use paid RPC for better performance
SOLANA_RPC_URL=https://your-rpc-provider.com/YOUR_KEY
KWAMI_COLLECTION_MINT=<your-mainnet-collection>
```

## Performance Tips

### Development

1. **Faster Builds**: Use `cargo run` (debug mode)
2. **Hot Reload**: Install `cargo-watch`:
   ```bash
   cargo install cargo-watch
   cargo watch -x run
   ```

### Production

1. **Optimized Server**: Use release build
   ```bash
   npm run server:build
   ./server/target/release/kwami-server
   ```

2. **Use Premium RPC**: Replace public endpoints with Helius/QuickNode
3. **Enable Redis**: See `server/src/state.rs` for upgrade instructions
4. **HTTPS**: Use reverse proxy (Nginx/Caddy)

## Testing Without Wallet

For development, you can test endpoints directly:

```bash
# 1. Generate nonce
curl -X POST http://localhost:3000/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"pubkey":"YOUR_PUBKEY"}'

# 2. Test health check
curl http://localhost:3000/health
```

For full authentication flow, you need a real wallet to sign messages.

## Next Steps

✅ **Server Running**: Authentication backend operational  
✅ **App Integrated**: Frontend connects to server  
✅ **JWT Flow**: Complete authentication working  

### Future Enhancements

1. **ElevenLabs Proxy**: Add WebSocket handler in server
2. **Voice Personalization**: Use KWAMI traits for custom voices
3. **Session Management**: Add token refresh endpoints
4. **Admin Dashboard**: Monitor active sessions

## File Locations

- **Server**: `server/` - Rust backend
- **App**: `app/` - Frontend application
- **API Client**: `app/src/lib/authApi.ts` - Server communication
- **Integration**: `app/src/main.ts` - Auth flow implementation

## Support

- 📖 Server Docs: [server/README.md](server/README.md)
- 🚀 Quick Start: [server/QUICKSTART.md](server/QUICKSTART.md)
- 🧪 API Tests: `server/test_api.sh`

---

**Ready to build with KWAMI! 🎨✨**
