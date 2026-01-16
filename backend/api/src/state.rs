use solana_client::rpc_client::RpcClient;
use solana_sdk::pubkey::Pubkey;
use std::sync::Arc;

use crate::db::DatabasePools;

/// Shared application state
#[derive(Clone)]
pub struct AppState {
    /// Database connection pools (PostgreSQL, Redis, Qdrant)
    pub db: DatabasePools,
    
    /// Solana RPC client for blockchain queries
    pub rpc_client: Arc<RpcClient>,
    
    /// JWT signing secret
    pub jwt_secret: String,
    
    /// LiveKit API credentials
    pub livekit_api_key: String,
    pub livekit_api_secret: String,
    pub livekit_url: String,
    
    /// Metaplex Metadata program ID
    pub metaplex_program: Pubkey,
    
    /// KWAMI collection mint for filtering (optional)
    pub kwami_collection_mint: Option<Pubkey>,
}

impl AppState {
    /// Create new application state
    pub fn new(
        db: DatabasePools,
        rpc_url: String,
        jwt_secret: String,
        livekit_api_key: String,
        livekit_api_secret: String,
        livekit_url: String,
        metaplex_program: Pubkey,
        kwami_collection_mint: Option<Pubkey>,
    ) -> Self {
        Self {
            db,
            rpc_client: Arc::new(RpcClient::new(rpc_url)),
            jwt_secret,
            livekit_api_key,
            livekit_api_secret,
            livekit_url,
            metaplex_program,
            kwami_collection_mint,
        }
    }
}
