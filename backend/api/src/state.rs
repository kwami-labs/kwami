use chrono::{DateTime, Utc};
use solana_client::rpc_client::RpcClient;
use solana_sdk::pubkey::Pubkey;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

/// Nonce storage with expiration
/// TODO: In production, replace with Redis:
/// - SETEX "nonce:{pubkey}" 300 {nonce}
/// - GET "nonce:{pubkey}" for validation
/// - DEL "nonce:{pubkey}" after use
pub type NonceStore = Arc<Mutex<HashMap<Pubkey, (Uuid, DateTime<Utc>)>>>;

/// Optional cache for owned KWAMIs to reduce RPC calls
/// TODO: In production, consider Redis with TTL:
/// - SETEX "kwamis:{pubkey}" 3600 {json_array_of_kwamis}
pub type KwamiCache = Arc<Mutex<HashMap<Pubkey, (Vec<String>, DateTime<Utc>)>>>;

/// Shared application state
#[derive(Clone)]
pub struct AppState {
    /// In-memory nonce storage (pubkey -> (nonce, expiry))
    pub nonce_store: NonceStore,
    
    /// Solana RPC client for blockchain queries
    pub rpc_client: Arc<RpcClient>,
    
    /// JWT signing secret
    pub jwt_secret: String,
    
    /// ElevenLabs API key (for future proxy endpoints)
    #[allow(dead_code)]
    pub elevenlabs_api_key: String,
    
    /// Metaplex Metadata program ID
    pub metaplex_program: Pubkey,
    
    /// KWAMI collection mint for filtering (optional)
    pub kwami_collection_mint: Option<Pubkey>,
    
    /// Optional cache for owned KWAMIs
    pub kwami_cache: KwamiCache,
    
    /// Nonce expiration time in seconds (default: 300 = 5 minutes)
    #[allow(dead_code)]
    pub nonce_expiry_seconds: i64,
}

impl AppState {
    /// Create new application state
    pub fn new(
        rpc_url: String,
        jwt_secret: String,
        elevenlabs_api_key: String,
        metaplex_program: Pubkey,
        kwami_collection_mint: Option<Pubkey>,
    ) -> Self {
        Self {
            nonce_store: Arc::new(Mutex::new(HashMap::new())),
            rpc_client: Arc::new(RpcClient::new(rpc_url)),
            jwt_secret,
            elevenlabs_api_key,
            metaplex_program,
            kwami_collection_mint,
            kwami_cache: Arc::new(Mutex::new(HashMap::new())),
            nonce_expiry_seconds: 300, // 5 minutes
        }
    }
    
    /// Clean up expired nonces (call periodically)
    pub fn cleanup_expired_nonces(&self) {
        let now = Utc::now();
        if let Ok(mut store) = self.nonce_store.lock() {
            store.retain(|_, (_, expiry)| *expiry > now);
        }
    }
    
    /// Clean up expired cache entries
    pub fn cleanup_expired_cache(&self) {
        let now = Utc::now();
        if let Ok(mut cache) = self.kwami_cache.lock() {
            cache.retain(|_, (_, expiry)| *expiry > now);
        }
    }
}
