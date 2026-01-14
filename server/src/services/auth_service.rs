use crate::error::ApiError;
use crate::models::{Claims, UserContext};
use axum::http::HeaderMap;
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use solana_sdk::{pubkey::Pubkey, signature::Signature};
use std::str::FromStr;

const JWT_EXPIRY_HOURS: i64 = 1; // 1 hour for security

/// Verify Ed25519 signature
pub fn verify_signature(
    pubkey_str: &str,
    signature_str: &str,
    message: &str,
) -> Result<(), ApiError> {
    // Decode pubkey
    let pubkey =
        Pubkey::from_str(pubkey_str).map_err(|e| ApiError::InvalidPublicKey(e.to_string()))?;

    // Decode signature from Base58
    let signature_bytes = bs58::decode(signature_str)
        .into_vec()
        .map_err(|e| ApiError::InvalidSignature(format!("Base58 decode error: {}", e)))?;

    if signature_bytes.len() != 64 {
        return Err(ApiError::InvalidSignature(format!(
            "Invalid signature length: expected 64, got {}",
            signature_bytes.len()
        )));
    }

    let mut sig_array = [0u8; 64];
    sig_array.copy_from_slice(&signature_bytes);

    // Verify signature using ed25519-dalek (via solana-sdk)
    let signature = Signature::from(sig_array);

    // Convert message to bytes for verification
    let message_bytes = message.as_bytes();

    // Verify the signature
    if !signature.verify(pubkey.as_ref(), message_bytes) {
        return Err(ApiError::InvalidSignature(
            "Signature verification failed".to_string(),
        ));
    }

    Ok(())
}

/// Generate JWT token
pub fn generate_jwt(
    secret: &str,
    pubkey: &str,
    kwami_mint: Option<String>,
) -> Result<String, ApiError> {
    let now = Utc::now();
    let expiry = now + Duration::hours(JWT_EXPIRY_HOURS);

    let claims = Claims {
        sub: pubkey.to_string(),
        kwami_mint,
        exp: expiry.timestamp() as usize,
        iat: now.timestamp() as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| ApiError::InternalError(format!("JWT encoding error: {}", e)))
}

/// Extract user context from Authorization header
pub fn extract_user_from_headers(
    headers: &HeaderMap,
    secret: &str,
) -> Result<UserContext, ApiError> {
    let auth_header = headers
        .get("Authorization")
        .ok_or(ApiError::MissingAuthHeader)?
        .to_str()
        .map_err(|_| ApiError::InvalidToken("Invalid header format".to_string()))?;

    if !auth_header.starts_with("Bearer ") {
        return Err(ApiError::InvalidToken(
            "Invalid authorization format".to_string(),
        ));
    }

    let token = &auth_header[7..];

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|e| ApiError::InvalidToken(e.to_string()))?;

    Ok(UserContext {
        pubkey: token_data.claims.sub,
        kwami_mint: token_data.claims.kwami_mint,
    })
}
