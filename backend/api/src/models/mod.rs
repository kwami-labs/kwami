use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Request to generate a nonce for wallet authentication
#[derive(Debug, Deserialize)]
pub struct NonceRequest {
    pub pubkey: String,
}

/// Response containing the nonce and message template for signing
#[derive(Debug, Serialize)]
pub struct NonceResponse {
    pub nonce: Uuid,
    pub message: String,
    pub expires_in: u64, // seconds
}

/// Request to login with wallet signature
#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub pubkey: String,
    pub signature: String, // Base58 encoded
    pub message: String,
    pub nonce: Uuid,
    pub kwami_mint: String, // The KWAMI NFT mint selected by user
}

/// Response from login containing JWT and owned KWAMIs
#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub owned_kwamis: Vec<KwamiInfo>,
    pub pubkey: String,
}

/// KWAMI NFT information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KwamiInfo {
    pub mint: String,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub attributes: Option<Vec<Attribute>>,
}

/// NFT Attribute/Trait
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Attribute {
    pub trait_type: String,
    pub value: String,
}

/// Request to select a KWAMI as active identity
#[derive(Debug, Deserialize)]
pub struct SelectKwamiRequest {
    pub kwami_mint: String,
}

/// Response after selecting a KWAMI
#[derive(Debug, Serialize)]
pub struct SelectKwamiResponse {
    pub token: String,
    pub kwami_mint: String,
    pub message: String,
}

/// JWT Claims structure
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,                      // Subject: user's pubkey
    pub kwami_mint: Option<String>,       // Selected KWAMI mint (null until selected)
    pub exp: usize,                       // Expiration time (Unix timestamp)
    pub iat: usize,                       // Issued at (Unix timestamp)
}

/// User context extracted from JWT for protected routes
#[derive(Debug, Clone)]
pub struct UserContext {
    pub pubkey: String,
    #[allow(dead_code)]
    pub kwami_mint: Option<String>,
}

/// Generic success response
#[derive(Debug, Serialize)]
#[allow(dead_code)]
pub struct SuccessResponse {
    pub message: String,
}

/// Response for owned KWAMIs endpoint
#[derive(Debug, Serialize)]
pub struct OwnedKwamisResponse {
    pub owned_kwamis: Vec<KwamiInfo>,
    pub count: usize,
}
