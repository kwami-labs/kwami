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
    
    /// ElevenLabs API key (for future proxy endpoints)
    #[allow(dead_code)]
    pub elevenlabs_api_key: String,
    
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
        elevenlabs_api_key: String,
        metaplex_program: Pubkey,
        kwami_collection_mint: Option<Pubkey>,
    ) -> Self {
        Self {
            db,
            rpc_client: Arc::new(RpcClient::new(rpc_url)),
            jwt_secret,
            elevenlabs_api_key,
            metaplex_program,
            kwami_collection_mint,
        }
    }
}
