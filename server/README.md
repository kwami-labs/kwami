# KWAMI Authentication Server

A production-ready Rust backend for Web3 authentication using Solana wallet signatures and KWAMI NFT ownership verification. Built with Axum for high-performance async operations.

## Features

- ✅ **Solana Wallet Authentication**: Verify ownership via Ed25519 signature
- ✅ **KWAMI NFT Verification**: Query and verify Metaplex NFT ownership on Solana
- ✅ **JWT Sessions**: Secure session management with JWT tokens
- ✅ **KWAMI Selection**: Users select active KWAMI identity for personalization
- ✅ **Rate Limiting**: Built-in protection against abuse
- ✅ **CORS Support**: Cross-origin requests for browser-based apps
- ✅ **Nonce-based Security**: Replay attack protection

## Architecture

```
┌─────────────┐          ┌──────────────┐          ┌─────────────┐
│   Browser   │─────────▶│ KWAMI Server │─────────▶│   Solana    │
│  (wallet)   │          │    (Axum)    │          │     RPC     │
└─────────────┘          └──────────────┘          └─────────────┘
      │                         │
      │                         ▼
      │                  ┌──────────────┐
      └─────────────────▶│ ElevenLabs   │
                         │    (future)  │
                         └──────────────┘
```

## Quick Start

### 1. Install Dependencies

Ensure you have Rust 1.75+ installed:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. Configure Environment

Copy the sample environment file and configure:

```bash
cp .env.sample .env
```

Edit `.env` and set:

- `JWT_SECRET`: Random 32+ character string (e.g., `openssl rand -base64 32`)
- `SOLANA_RPC_URL`: Your Solana RPC endpoint (e.g., Helius, QuickNode)
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key
- `KWAMI_COLLECTION_MINT`: Your KWAMI collection mint address

### 3. Build and Run

```bash
# Development (with hot reload)
cargo watch -x run

# Production build
cargo build --release
./target/release/kwami-server
```

Server will start on `http://localhost:3000`

## API Endpoints

### Public Endpoints

#### `POST /auth/nonce`

Generate a nonce for wallet authentication.

**Request:**

```json
{
  "pubkey": "YourSolanaPublicKeyBase58"
}
```

**Response:**

```json
{
  "nonce": "uuid-v4-here",
  "message": "Login to KWAMI API with nonce: {nonce}",
  "expires_in": 300
}
```

#### `POST /auth/login`

Login with wallet signature.

**Request:**

```json
{
  "pubkey": "YourSolanaPublicKeyBase58",
  "signature": "Base58EncodedSignature",
  "message": "Login to KWAMI API with nonce: {nonce}",
  "nonce": "uuid-from-nonce-endpoint"
}
```

**Response:**

```json
{
  "token": "jwt-token",
  "owned_kwamis": [
    {
      "mint": "MintAddressBase58",
      "name": "KWAMI #123",
      "symbol": "KWAMI",
      "uri": "https://arweave.net/...",
      "image": "https://...",
      "attributes": [...]
    }
  ],
  "pubkey": "YourSolanaPublicKeyBase58"
}
```

### Protected Endpoints

These require `Authorization: Bearer {jwt-token}` header.

#### `GET /me/owned-kwamis`

Get list of owned KWAMIs for authenticated user.

**Response:**

```json
{
  "count": 3,
  "owned_kwamis": [...]
}
```

#### `POST /auth/select-kwami`

Select a KWAMI as active identity.

**Request:**

```json
{
  "kwami_mint": "MintAddressBase58"
}
```

**Response:**

```json
{
  "token": "new-jwt-with-kwami",
  "kwami_mint": "MintAddressBase58",
  "message": "KWAMI selected successfully"
}
```

#### `GET /health`

Health check endpoint.

**Response:** `OK`

## Authentication Flow

```
1. Frontend: Connect wallet (Phantom/Solflare)
   └─▶ User approves connection

2. Frontend: POST /auth/nonce { pubkey }
   └─▶ Backend: Generates UUID nonce, stores with 5min TTL
   └─▶ Backend: Returns { nonce, message }

3. Frontend: Sign message with wallet
   └─▶ Message: "Login to KWAMI API with nonce: {uuid}"
   └─▶ Wallet returns Base58 signature

4. Frontend: POST /auth/login { pubkey, signature, message, nonce }
   └─▶ Backend: Verifies signature with Ed25519
   └─▶ Backend: Validates nonce (exists, not expired, matches)
   └─▶ Backend: Queries Solana for NFTs (amount=1)
   └─▶ Backend: Fetches metadata from Metaplex
   └─▶ Backend: Returns JWT + owned KWAMIs

5. Frontend: Display KWAMIs, user selects one
   └─▶ Frontend: POST /auth/select-kwami { kwami_mint }
   └─▶ Backend: Validates ownership, issues new JWT with kwami_mint

6. Frontend: Use JWT for protected routes
   └─▶ Authorization: Bearer {jwt-token}
```

## Testing with curl

### 1. Generate Nonce

```bash
curl -X POST http://localhost:3000/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"pubkey":"YourPublicKeyHere"}'
```

### 2. Login (requires valid signature)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "pubkey":"YourPublicKeyHere",
    "signature":"Base58SignatureHere",
    "message":"Login to KWAMI API with nonce: {uuid-from-step-1}",
    "nonce":"{uuid-from-step-1}"
  }'
```

### 3. Get Owned KWAMIs

```bash
curl http://localhost:3000/me/owned-kwamis \
  -H "Authorization: Bearer {jwt-from-login}"
```

### 4. Select KWAMI

```bash
curl -X POST http://localhost:3000/auth/select-kwami \
  -H "Authorization: Bearer {jwt-from-login}" \
  -H "Content-Type: application/json" \
  -d '{"kwami_mint":"MintAddressHere"}'
```

## Project Structure

```
server/
├── src/
│   ├── main.rs          # Server setup, routing, middleware
│   ├── auth.rs          # Authentication handlers & Solana queries
│   ├── models.rs        # Request/response structs, JWT claims
│   ├── errors.rs        # Custom error types & responses
│   └── state.rs         # Shared application state
├── Cargo.toml           # Dependencies
├── .env.sample          # Environment template
└── README.md            # This file
```

## Security Considerations

### Current (In-Memory)

- ✅ Nonces stored in-memory with expiration
- ✅ Thread-safe with Arc<Mutex<HashMap>>
- ⚠️ Nonces cleared on server restart
- ⚠️ Not suitable for multi-instance deployment

### Production Upgrade (Redis)

For production, replace in-memory storage with Redis:

```rust
// Nonce storage
SETEX "nonce:{pubkey}" 300 {nonce}
GET "nonce:{pubkey}"
DEL "nonce:{pubkey}"  // consume after use

// KWAMI cache
SETEX "kwamis:{pubkey}" 3600 {json_array}
```

### JWT Security

- ✅ HS256 algorithm (HMAC-SHA256)
- ✅ 24-hour expiration
- ✅ Issued-at timestamp
- ⚠️ Use 32+ character random secret
- ⚠️ Store JWT_SECRET securely (env vars, not in code)

### HTTPS

- ⚠️ Use reverse proxy (Nginx/Caddy) with SSL/TLS in production
- ⚠️ Never send JWTs over unencrypted connections

## Performance Optimization

### RPC Caching

The server includes optional KWAMI cache to reduce RPC calls:

```rust
pub kwami_cache: Arc<Mutex<HashMap<Pubkey, (Vec<String>, DateTime<Utc>)>>>
```

Enable caching in production to reduce Solana RPC costs.

### Rate Limiting

Built-in request body limit (1MB). Add IP-based rate limiting with `tower-governor` for production.

### Connection Pooling

Consider `deadpool` for Redis connection pooling when upgrading storage.

## Environment Variables

| Variable                    | Required | Default                               | Description                           |
| --------------------------- | -------- | ------------------------------------- | ------------------------------------- |
| `SOLANA_RPC_URL`            | No       | `https://api.mainnet-beta.solana.com` | Solana RPC endpoint                   |
| `SOLANA_NETWORK`            | No       | `mainnet-beta`                        | Network identifier                    |
| `JWT_SECRET`                | **Yes**  | -                                     | JWT signing secret (32+ chars)        |
| `ELEVENLABS_API_KEY`        | No       | -                                     | ElevenLabs API key (future use)       |
| `PORT`                      | No       | `3000`                                | Server port                           |
| `RUST_LOG`                  | No       | `info`                                | Logging level                         |
| `METAPLEX_METADATA_PROGRAM` | No       | `metaqbxx...`                         | Metaplex program ID                   |
| `KWAMI_COLLECTION_MINT`     | No       | -                                     | KWAMI collection mint (for filtering) |

## Logging

Logs use `tracing` with structured output:

```bash
# Set log level
export RUST_LOG=info,kwami_server=debug

# Run with verbose logging
RUST_LOG=debug cargo run
```

## Future Enhancements

- [ ] **WebSocket Proxy**: Proxy to ElevenLabs with KWAMI personalization
- [ ] **Redis Integration**: Distributed nonce/cache storage
- [ ] **Advanced Rate Limiting**: Per-IP/per-user limits with `tower-governor`
- [ ] **Metadata Parsing**: Full Borsh deserialization of Metaplex metadata
- [ ] **Collection Filtering**: Verify `verified_collection` field
- [ ] **Webhook Support**: Real-time NFT transfer notifications
- [ ] **Admin Dashboard**: Monitor active sessions, usage stats

## License

MIT

## Support

For issues or questions, please open an issue on the project repository.
