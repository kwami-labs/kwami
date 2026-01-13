# KWAMI Server Quick Start Guide

Get your KWAMI authentication server up and running in 5 minutes!

## Prerequisites

- Rust 1.75+ installed
- Solana wallet (Phantom, Solflare, etc.)
- KWAMI NFT (for testing)

## Setup Steps

### 1. Configure Environment

The `.env` file is already created with defaults. Update if needed:

```bash
# Edit .env to customize settings
nano .env
```

Key variables:
- `JWT_SECRET`: Already generated (keep secure!)
- `SOLANA_RPC_URL`: Currently set to devnet
- `KWAMI_COLLECTION_MINT`: Already configured

### 2. Build the Server

```bash
# Development build (faster)
cargo build

# OR Production build (optimized)
cargo build --release
```

### 3. Run the Server

```bash
# Development mode
cargo run

# OR Production mode
./target/release/kwami-server
```

You should see:
```
🚀 Starting KWAMI Authentication Server
🎧 Listening on 0.0.0.0:3000
📡 Solana RPC: https://api.devnet.solana.com
🖼️  KWAMI Collection: Some(...)
✅ Server ready to accept connections
```

### 4. Test the Server

In a new terminal:

```bash
# Test health endpoint
curl http://localhost:3000/health
# Should return: OK

# Test nonce generation (replace with your pubkey)
curl -X POST http://localhost:3000/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"pubkey":"YOUR_SOLANA_PUBKEY"}'

# OR use the test script
./test_api.sh
```

## Integration with Frontend

### Frontend Flow

1. **Connect Wallet**
```typescript
import { useWallet } from '@solana/wallet-adapter-react';

const { publicKey, signMessage } = useWallet();
```

2. **Request Nonce**
```typescript
const response = await fetch('http://localhost:3000/auth/nonce', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pubkey: publicKey.toBase58() })
});
const { nonce, message } = await response.json();
```

3. **Sign Message**
```typescript
const encodedMessage = new TextEncoder().encode(message);
const signature = await signMessage(encodedMessage);
const signatureBase58 = bs58.encode(signature);
```

4. **Login**
```typescript
const loginResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pubkey: publicKey.toBase58(),
    signature: signatureBase58,
    message,
    nonce
  })
});
const { token, owned_kwamis } = await loginResponse.json();
```

5. **Select KWAMI**
```typescript
const selectResponse = await fetch('http://localhost:3000/auth/select-kwami', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ kwami_mint: selectedKwami.mint })
});
const { token: newToken } = await selectResponse.json();
```

6. **Use Protected Endpoints**
```typescript
const kwamisResponse = await fetch('http://localhost:3000/me/owned-kwamis', {
  headers: { 'Authorization': `Bearer ${newToken}` }
});
const { owned_kwamis } = await kwamisResponse.json();
```

## Directory Structure

```
server/
├── src/
│   ├── main.rs      # Server setup & routing
│   ├── auth.rs      # Auth handlers & Solana queries
│   ├── models.rs    # Request/response structs
│   ├── errors.rs    # Error handling
│   └── state.rs     # Application state
├── .env             # Configuration (created)
├── .env.sample      # Template
├── Cargo.toml       # Dependencies
├── test_api.sh      # API test script
└── README.md        # Full documentation
```

## Troubleshooting

### Port already in use
```bash
# Change port in .env
PORT=3001
```

### RPC rate limiting
```bash
# Use paid RPC service in .env
SOLANA_RPC_URL=https://your-rpc-provider.com/YOUR_API_KEY
```

### JWT errors
```bash
# Regenerate JWT secret
openssl rand -base64 32
# Update JWT_SECRET in .env
```

### No KWAMIs found
- Ensure you're using the correct network (devnet/mainnet)
- Verify wallet owns KWAMI NFTs on that network
- Check `KWAMI_COLLECTION_MINT` is correct

## Development Tips

### Watch mode (auto-reload)
```bash
cargo install cargo-watch
cargo watch -x run
```

### Debug logging
```bash
RUST_LOG=debug cargo run
```

### Check compilation
```bash
cargo check
```

### Format code
```bash
cargo fmt
```

### Run tests
```bash
cargo test
```

## Production Deployment

### 1. Use HTTPS
Set up reverse proxy (Nginx/Caddy):
```nginx
server {
    listen 443 ssl;
    server_name api.kwami.io;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. Use Production RPC
Update `.env`:
```bash
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
# OR use paid service (Helius, QuickNode, etc.)
```

### 3. Enable Redis (recommended)
See `state.rs` for Redis upgrade instructions.

### 4. Run as Service
```bash
# Create systemd service
sudo nano /etc/systemd/system/kwami-server.service

[Unit]
Description=KWAMI Authentication Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/server
Environment="RUST_LOG=info"
ExecStart=/path/to/server/target/release/kwami-server
Restart=always

[Install]
WantedBy=multi-user.target

# Enable and start
sudo systemctl enable kwami-server
sudo systemctl start kwami-server
```

## Next Steps

1. ✅ Server is running
2. 📱 Integrate with your frontend app (see app/ directory)
3. 🎤 Add ElevenLabs WebSocket proxy for conversational AI
4. 🚀 Deploy to production

## Support

- 📖 Full docs: [README.md](README.md)
- 🐛 Issues: Check server logs with `RUST_LOG=debug`
- 💬 Questions: Open issue on project repository

---

**Happy building with KWAMI! 🎨✨**
