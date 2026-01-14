use solana_sdk::pubkey::Pubkey;
use std::{env, str::FromStr};
use tracing::{error, info};

/// Server configuration loaded from environment variables
#[derive(Clone)]
pub struct Config {
    pub solana_rpc_url: String,
    pub jwt_secret: String,
    pub elevenlabs_api_key: String,
    pub metaplex_program: Pubkey,
    pub kwami_collection_mint: Option<Pubkey>,
    pub port: u16,
}

impl Config {
    /// Load configuration from environment variables
    pub fn from_env() -> Self {
        let solana_rpc_url = env::var("SOLANA_RPC_URL")
            .unwrap_or_else(|_| "https://api.mainnet-beta.solana.com".to_string());

        let jwt_secret = env::var("JWT_SECRET")
            .expect("JWT_SECRET must be set in environment");

        if jwt_secret.len() < 32 {
            error!("⚠️  WARNING: JWT_SECRET should be at least 32 characters for security");
        }

        let elevenlabs_api_key = env::var("ELEVENLABS_API_KEY")
            .unwrap_or_else(|_| {
                info!("⚠️  ELEVENLABS_API_KEY not set - proxy functionality will be limited");
                String::new()
            });

        let metaplex_program = Pubkey::from_str(
            &env::var("METAPLEX_METADATA_PROGRAM")
                .unwrap_or_else(|_| "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s".to_string()),
        )
        .expect("Invalid METAPLEX_METADATA_PROGRAM");

        let kwami_collection_mint = env::var("KWAMI_COLLECTION_MINT")
            .ok()
            .and_then(|s| Pubkey::from_str(&s).ok());

        let port = env::var("PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(3000);

        Self {
            solana_rpc_url,
            jwt_secret,
            elevenlabs_api_key,
            metaplex_program,
            kwami_collection_mint,
            port,
        }
    }
}
