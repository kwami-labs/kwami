use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use solana_sdk::pubkey::Pubkey;
use sqlx::FromRow;
use uuid::Uuid;

/// User authentication record
#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct User {
    pub id: Uuid,
    pub wallet_address: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub last_login: Option<DateTime<Utc>>,
}

impl User {
    pub fn wallet_pubkey(&self) -> Result<Pubkey, String> {
        self.wallet_address
            .parse()
            .map_err(|e| format!("Invalid wallet address: {}", e))
    }
}

/// Authentication nonce for wallet signature verification
#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct AuthNonce {
    pub id: Uuid,
    pub wallet_address: String,
    pub nonce: Uuid,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub used: bool,
}

/// User session/JWT token tracking
#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct Session {
    pub id: Uuid,
    pub user_id: Uuid,
    pub token_jti: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub revoked: bool,
}

/// KWAMI NFT ownership cache
#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct KwamiOwnership {
    pub id: Uuid,
    pub wallet_address: String,
    pub mint_address: String,
    pub metadata_url: Option<String>,
    pub cached_at: DateTime<Utc>,
    pub verified_at: DateTime<Utc>,
}
