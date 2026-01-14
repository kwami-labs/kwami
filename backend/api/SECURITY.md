# Security Measures

This document outlines the security measures implemented in the KWAMI Authentication Server.

## Authentication Flow Security

### 1. **Signature Verification** ✅
- Users must sign a message with their Solana wallet's private key
- Ed25519 signature verification ensures the user controls the wallet
- Prevents impersonation attacks

### 2. **Nonce-Based Replay Protection** ✅
- Server generates unique UUID nonces for each authentication attempt
- Nonces expire after 5 minutes
- Nonces are single-use (deleted after successful login)
- Prevents replay attacks where attackers reuse old signatures

### 3. **NFT Ownership Verification** ✅
- Backend queries Solana blockchain to verify token ownership
- Checks that user's wallet has a token account for the claimed NFT
- Verifies balance >= 1 to confirm possession
- Cannot be faked client-side

### 4. **Collection Verification** ✅ HIGH PRIORITY
- Verifies NFT is from the KWAMI collection
- Checks metadata account for collection pubkey
- Prevents authentication with random/fake NFTs
- Returns `403 Forbidden` for wrong collection
- Falls back gracefully if metadata unavailable

### 5. **JWT Security** ✅
- Tokens signed with HS256 (HMAC-SHA256)
- Secret key stored securely in environment variables
- **1-hour expiration** for reduced exposure window
- Includes `iat` (issued-at) timestamp for audit trail
- Embeds `kwami_mint` in claims for authorization

### 6. **Rate Limiting** ✅ MEDIUM PRIORITY
- **10 requests per minute** per IP address
- Applied to authentication endpoints (`/auth/nonce`, `/auth/login`)
- Uses `tower-governor` for production-ready limiting
- Returns `429 Too Many Requests` when exceeded
- Prevents brute force and DoS attacks

## Security Best Practices

### Environment Variables
```bash
# Always use strong, random secrets
JWT_SECRET=$(openssl rand -base64 48)

# Use premium RPC for reliability
SOLANA_RPC_URL=https://your-premium-rpc.com/key

# Configure collection mint
KWAMI_COLLECTION_MINT=CzNuMseUFbpXNDLEKWEtrD3snXhNdZiGMn1rFFjjGvj6
```

### Production Deployment

1. **HTTPS Only**
   ```nginx
   server {
       listen 443 ssl;
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location / {
           proxy_pass http://localhost:3000;
       }
   }
   ```

2. **Redis for Session Management**
   - Move nonce storage to Redis with TTL
   - Enables horizontal scaling
   - Allows session invalidation

3. **Monitoring & Alerts**
   - Log failed authentication attempts
   - Monitor rate limit hits
   - Alert on suspicious patterns

## Threat Model

### Threats Mitigated

| Threat | Mitigation |
|--------|-----------|
| Signature replay | Nonce expiration + single-use |
| Fake NFT claims | Blockchain ownership verification |
| Wrong NFT collection | Collection metadata verification |
| Token theft | Short JWT expiry (1h) |
| Brute force | Rate limiting (10/min) |
| DoS attacks | Rate limiting + timeout configs |
| JWT forgery | HS256 signing with secret key |

### Remaining Risks

#### 1. **NFT Transfer After Auth** (LOW)
**Risk**: User transfers NFT after getting JWT but token remains valid for 1h.

**Mitigations**:
- ✅ Short expiry (1h reduces window)
- 🔄 Future: Token refresh with re-verification
- 🔄 Future: Webhook monitoring for transfers

#### 2. **Metadata Manipulation** (LOW)
**Risk**: Off-chain metadata could be modified.

**Mitigations**:
- ✅ Only verify on-chain collection field
- ✅ Don't trust metadata for security decisions
- ✅ Verify via Metaplex program

#### 3. **RPC Endpoint Reliability** (MEDIUM)
**Risk**: RPC could return stale/incorrect data.

**Mitigations**:
- ✅ Use `confirmed` commitment level
- 📝 Recommendation: Use premium RPC (Helius, QuickNode)
- 📝 Recommendation: Multiple RPC fallbacks

#### 4. **Collection Verification Bypass** (LOW)
**Risk**: If collection check fails, we currently allow it.

**Current**: Graceful fallback (logs warning, allows auth)

**Recommendation**: Make it strict:
```rust
if !collection_verified {
    return Err(ApiError::UnverifiedCollection);
}
```

## Security Checklist

- [x] Signature verification with Ed25519
- [x] Nonce-based replay protection
- [x] On-chain ownership verification
- [x] Collection verification
- [x] JWT with short expiry (1h)
- [x] Rate limiting (10 req/min)
- [x] Secure error messages (no info leak)
- [x] Structured logging for audit
- [ ] Redis for distributed nonces
- [ ] Token refresh mechanism
- [ ] NFT transfer webhook monitoring
- [ ] Multiple RPC fallback
- [ ] IP geoblocking (optional)
- [ ] 2FA for high-value operations (optional)

## Audit Log Events

The server logs these security events:

```
✅ Signature verified for {pubkey}
🔐 Verifying {pubkey} owns KWAMI NFT {mint}
🔍 Verifying NFT is from KWAMI collection
✅ NFT collection verified
✅ Full verification passed
❌ NFT is not from the required collection
⚠️  Rate limit hit
```

Monitor these logs for security incidents.

## Incident Response

### Compromised JWT Secret

1. Rotate `JWT_SECRET` immediately
2. All existing tokens become invalid
3. Users must re-authenticate
4. Update secret in all server instances

### Suspicious Activity

1. Check logs for patterns:
   ```bash
   grep "Rate limit hit" server.log
   grep "Wrong collection" server.log
   ```

2. Ban IP if needed (add to firewall)

3. Investigate wallet addresses:
   ```bash
   grep "pubkey" server.log | sort | uniq -c | sort -rn
   ```

## Security Contacts

- Report vulnerabilities: security@kwami.io
- Response time: < 24 hours
- PGP key: [Add if available]

## Changelog

- **2026-01-14**: Initial security implementation
  - Collection verification
  - Rate limiting
  - 1h JWT expiry
  - Multi-step verification

---

Last updated: 2026-01-14
