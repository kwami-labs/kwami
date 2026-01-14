use crate::db::repositories::{NonceRepository, UserRepository};
use crate::error::ApiError;
use crate::models::*;
use crate::services::{auth_service, kwami_service};
use crate::state::AppState;
use axum::{extract::State, http::HeaderMap, Json};
use solana_sdk::pubkey::Pubkey;
use std::str::FromStr;
use tracing::{debug, info, warn};

/// Generate a nonce for wallet authentication
pub async fn generate_nonce(
    State(state): State<AppState>,
    Json(req): Json<NonceRequest>,
) -> Result<Json<NonceResponse>, ApiError> {
    debug!("Generating nonce for pubkey: {}", req.pubkey);

    // Validate pubkey format
    let pubkey =
        Pubkey::from_str(&req.pubkey).map_err(|e| ApiError::InvalidPublicKey(e.to_string()))?;

    // Create nonce in database
    let nonce_repo = NonceRepository::new(state.db.postgres.clone());
    let auth_nonce = nonce_repo
        .create(&pubkey)
        .await
        .map_err(|e| ApiError::InternalError(format!("Failed to create nonce: {}", e)))?;

    // Create message template for signing
    let message = format!("Login to KWAMI API with nonce: {}", auth_nonce.nonce);

    let expires_in = (auth_nonce.expires_at - auth_nonce.created_at).num_seconds() as u64;

    info!("Generated nonce {} for {}", auth_nonce.nonce, pubkey);

    Ok(Json(NonceResponse {
        nonce: auth_nonce.nonce,
        message,
        expires_in,
    }))
}

/// Login with wallet signature
pub async fn login(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, ApiError> {
    debug!("Login attempt for pubkey: {}", req.pubkey);

    // 1. Validate pubkey
    let pubkey =
        Pubkey::from_str(&req.pubkey).map_err(|e| ApiError::InvalidPublicKey(e.to_string()))?;

    // 2. Validate and consume nonce from database
    let nonce_repo = NonceRepository::new(state.db.postgres.clone());
    let is_valid = nonce_repo
        .verify_and_consume(&pubkey, req.nonce)
        .await
        .map_err(|e| ApiError::InternalError(format!("Failed to verify nonce: {}", e)))?;

    if !is_valid {
        warn!("Invalid or expired nonce for {}", pubkey);
        return Err(ApiError::NonceNotFound);
    }

    // Verify nonce is in message
    if !req.message.contains(&req.nonce.to_string()) {
        warn!("Nonce not found in message for {}", pubkey);
        return Err(ApiError::InvalidNonce);
    }

    // 3. Verify signature
    auth_service::verify_signature(&req.pubkey, &req.signature, &req.message)?;

    info!("Signature verified for {}", pubkey);

    // 4. Validate kwami_mint format
    let kwami_mint = Pubkey::from_str(&req.kwami_mint)
        .map_err(|e| ApiError::InvalidPublicKey(e.to_string()))?;

    // 5. Verify ownership of the specific KWAMI
    let owns_kwami = kwami_service::verify_nft_ownership(&state, &pubkey, &kwami_mint).await?;
    
    if !owns_kwami {
        warn!("User {} does not own KWAMI {}", pubkey, kwami_mint);
        return Err(ApiError::KwamiNotOwned);
    }

    info!("Verified {} owns KWAMI {}", pubkey, kwami_mint);

    // 6. Get or create user in database
    let user_repo = UserRepository::new(state.db.postgres.clone());
    let user = user_repo
        .get_or_create(&pubkey)
        .await
        .map_err(|e| ApiError::InternalError(format!("Failed to get/create user: {}", e)))?;

    // Update last login
    user_repo
        .update_last_login(user.id)
        .await
        .map_err(|e| ApiError::InternalError(format!("Failed to update last login: {}", e)))?;

    // 7. Generate JWT with kwami_mint
    let token = auth_service::generate_jwt(&state.jwt_secret, &req.pubkey, Some(req.kwami_mint.clone()))?;

    info!("User {} logged in successfully", pubkey);

    Ok(Json(LoginResponse {
        token,
        owned_kwamis: vec![], // No longer needed, frontend already has the NFTs
        pubkey: req.pubkey,
    }))
}

/// Get owned KWAMIs for authenticated user
pub async fn get_owned_kwamis(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<OwnedKwamisResponse>, ApiError> {
    // Extract and validate JWT
    let user_context = auth_service::extract_user_from_headers(&headers, &state.jwt_secret)?;

    debug!("Fetching KWAMIs for {}", user_context.pubkey);

    let pubkey = Pubkey::from_str(&user_context.pubkey)
        .map_err(|e| ApiError::InvalidPublicKey(e.to_string()))?;

    // Query owned KWAMIs
    let owned_kwamis = kwami_service::query_owned_kwamis(&state, &pubkey).await?;

    Ok(Json(OwnedKwamisResponse {
        count: owned_kwamis.len(),
        owned_kwamis,
    }))
}

/// Select a KWAMI as active identity
pub async fn select_kwami(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(req): Json<SelectKwamiRequest>,
) -> Result<Json<SelectKwamiResponse>, ApiError> {
    // Extract and validate JWT
    let user_context = auth_service::extract_user_from_headers(&headers, &state.jwt_secret)?;

    debug!(
        "User {} selecting KWAMI {}",
        user_context.pubkey, req.kwami_mint
    );

    let pubkey = Pubkey::from_str(&user_context.pubkey)
        .map_err(|e| ApiError::InvalidPublicKey(e.to_string()))?;

    // Validate kwami_mint format
    let kwami_mint =
        Pubkey::from_str(&req.kwami_mint).map_err(|e| ApiError::InvalidPublicKey(e.to_string()))?;

    // Verify ownership
    let owned_kwamis = kwami_service::query_owned_kwamis(&state, &pubkey).await?;
    let is_owned = owned_kwamis.iter().any(|k| k.mint == req.kwami_mint);

    if !is_owned {
        warn!(
            "User {} tried to select unowned KWAMI {}",
            pubkey, kwami_mint
        );
        return Err(ApiError::KwamiNotOwned);
    }

    // Generate new JWT with kwami_mint
    let token = auth_service::generate_jwt(
        &state.jwt_secret,
        &user_context.pubkey,
        Some(req.kwami_mint.clone()),
    )?;

    info!("User {} selected KWAMI {}", pubkey, kwami_mint);

    Ok(Json(SelectKwamiResponse {
        token,
        kwami_mint: req.kwami_mint,
        message: "KWAMI selected successfully".to_string(),
    }))
}
