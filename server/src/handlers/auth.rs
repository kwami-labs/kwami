use crate::error::ApiError;
use crate::models::*;
use crate::services::{auth_service, kwami_service};
use crate::state::AppState;
use axum::{extract::State, http::HeaderMap, Json};
use chrono::{Duration, Utc};
use solana_sdk::pubkey::Pubkey;
use std::str::FromStr;
use tracing::{debug, info, warn};
use uuid::Uuid;

const NONCE_EXPIRY_SECONDS: i64 = 300; // 5 minutes

/// Generate a nonce for wallet authentication
pub async fn generate_nonce(
    State(state): State<AppState>,
    Json(req): Json<NonceRequest>,
) -> Result<Json<NonceResponse>, ApiError> {
    debug!("Generating nonce for pubkey: {}", req.pubkey);

    // Validate pubkey format
    let pubkey =
        Pubkey::from_str(&req.pubkey).map_err(|e| ApiError::InvalidPublicKey(e.to_string()))?;

    // Generate new nonce
    let nonce = Uuid::new_v4();
    let expiry = Utc::now() + Duration::seconds(NONCE_EXPIRY_SECONDS);

    // Store nonce with expiration
    {
        let mut store = state
            .nonce_store
            .lock()
            .map_err(|e| ApiError::InternalError(format!("Lock error: {}", e)))?;
        store.insert(pubkey, (nonce, expiry));
    }

    // Create message template for signing
    let message = format!("Login to KWAMI API with nonce: {}", nonce);

    info!("Generated nonce {} for {}", nonce, pubkey);

    Ok(Json(NonceResponse {
        nonce,
        message,
        expires_in: NONCE_EXPIRY_SECONDS as u64,
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

    // 2. Validate and consume nonce
    let (stored_nonce, expiry) = {
        let mut store = state
            .nonce_store
            .lock()
            .map_err(|e| ApiError::InternalError(format!("Lock error: {}", e)))?;

        let entry = store.remove(&pubkey).ok_or(ApiError::NonceNotFound)?;
        entry
    };

    // Check nonce expiration
    if Utc::now() > expiry {
        warn!("Expired nonce used for {}", pubkey);
        return Err(ApiError::NonceNotFound);
    }

    // Check nonce matches
    if stored_nonce != req.nonce {
        warn!("Nonce mismatch for {}", pubkey);
        return Err(ApiError::InvalidNonce);
    }

    // Verify nonce is in message
    if !req.message.contains(&req.nonce.to_string()) {
        warn!("Nonce not found in message for {}", pubkey);
        return Err(ApiError::InvalidNonce);
    }

    // 3. Verify signature
    auth_service::verify_signature(&req.pubkey, &req.signature, &req.message)?;

    info!("Signature verified for {}", pubkey);

    // 4. Query owned KWAMIs
    let owned_kwamis = kwami_service::query_owned_kwamis(&state, &pubkey).await?;

    if owned_kwamis.is_empty() {
        warn!("No KWAMIs found for {}", pubkey);
        return Err(ApiError::NoKwamisFound);
    }

    info!("Found {} KWAMIs for {}", owned_kwamis.len(), pubkey);

    // 5. Generate JWT (without kwami_mint selected yet)
    let token = auth_service::generate_jwt(&state.jwt_secret, &req.pubkey, None)?;

    Ok(Json(LoginResponse {
        token,
        owned_kwamis,
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
