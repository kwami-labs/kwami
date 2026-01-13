use crate::errors::ApiError;
use crate::models::*;
use crate::state::AppState;
use axum::{
    extract::State,
    http::HeaderMap,
    Json,
};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use solana_sdk::{
    commitment_config::CommitmentConfig,
    pubkey::Pubkey,
    signature::Signature,
};
use std::str::FromStr;
use tracing::{debug, info, warn};
use uuid::Uuid;

const NONCE_EXPIRY_SECONDS: i64 = 300; // 5 minutes
const JWT_EXPIRY_HOURS: i64 = 24; // 24 hours

/// Generate a nonce for wallet authentication
pub async fn generate_nonce(
    State(state): State<AppState>,
    Json(req): Json<NonceRequest>,
) -> Result<Json<NonceResponse>, ApiError> {
    debug!("Generating nonce for pubkey: {}", req.pubkey);

    // Validate pubkey format
    let pubkey = Pubkey::from_str(&req.pubkey)
        .map_err(|e| ApiError::InvalidPublicKey(e.to_string()))?;

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
    let pubkey = Pubkey::from_str(&req.pubkey)
        .map_err(|e| ApiError::InvalidPublicKey(e.to_string()))?;

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
    verify_signature(&req.pubkey, &req.signature, &req.message)?;

    info!("Signature verified for {}", pubkey);

    // 4. Query owned KWAMIs
    let owned_kwamis = query_owned_kwamis(&state, &pubkey).await?;

    if owned_kwamis.is_empty() {
        warn!("No KWAMIs found for {}", pubkey);
        return Err(ApiError::NoKwamisFound);
    }

    info!("Found {} KWAMIs for {}", owned_kwamis.len(), pubkey);

    // 5. Generate JWT (without kwami_mint selected yet)
    let token = generate_jwt(&state.jwt_secret, &req.pubkey, None)?;

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
    let user_context = extract_user_from_headers(&headers, &state.jwt_secret)?;

    debug!("Fetching KWAMIs for {}", user_context.pubkey);

    let pubkey = Pubkey::from_str(&user_context.pubkey)
        .map_err(|e| ApiError::InvalidPublicKey(e.to_string()))?;

    // Query owned KWAMIs
    let owned_kwamis = query_owned_kwamis(&state, &pubkey).await?;

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
    let user_context = extract_user_from_headers(&headers, &state.jwt_secret)?;

    debug!(
        "User {} selecting KWAMI {}",
        user_context.pubkey, req.kwami_mint
    );

    let pubkey = Pubkey::from_str(&user_context.pubkey)
        .map_err(|e| ApiError::InvalidPublicKey(e.to_string()))?;

    // Validate kwami_mint format
    let kwami_mint = Pubkey::from_str(&req.kwami_mint)
        .map_err(|e| ApiError::InvalidPublicKey(e.to_string()))?;

    // Verify ownership
    let owned_kwamis = query_owned_kwamis(&state, &pubkey).await?;
    let is_owned = owned_kwamis.iter().any(|k| k.mint == req.kwami_mint);

    if !is_owned {
        warn!("User {} tried to select unowned KWAMI {}", pubkey, kwami_mint);
        return Err(ApiError::KwamiNotOwned);
    }

    // Generate new JWT with kwami_mint
    let token = generate_jwt(&state.jwt_secret, &user_context.pubkey, Some(req.kwami_mint.clone()))?;

    info!("User {} selected KWAMI {}", pubkey, kwami_mint);

    Ok(Json(SelectKwamiResponse {
        token,
        kwami_mint: req.kwami_mint,
        message: "KWAMI selected successfully".to_string(),
    }))
}

/// Verify Ed25519 signature
fn verify_signature(pubkey_str: &str, signature_str: &str, message: &str) -> Result<(), ApiError> {
    // Decode pubkey
    let pubkey = Pubkey::from_str(pubkey_str)
        .map_err(|e| ApiError::InvalidPublicKey(e.to_string()))?;

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

/// Query owned KWAMIs from Solana blockchain
async fn query_owned_kwamis(
    state: &AppState,
    owner: &Pubkey,
) -> Result<Vec<KwamiInfo>, ApiError> {
    debug!("Querying KWAMIs for owner: {}", owner);

    // Get all token accounts owned by the user
    let token_accounts = state
        .rpc_client
        .get_token_accounts_by_owner(
            owner,
            solana_client::rpc_request::TokenAccountsFilter::ProgramId(spl_token::id()),
        )
        .map_err(|e| ApiError::SolanaRpcError(e.to_string()))?;

    let mut kwamis = Vec::new();

    for account in token_accounts {
        // Parse token account data
        let account_data = match &account.account.data {
            solana_account_decoder::UiAccountData::Binary(data, _) => {
                bs58::decode(data).into_vec().unwrap_or_default()
            }
            solana_account_decoder::UiAccountData::Json(_) => continue,
            solana_account_decoder::UiAccountData::LegacyBinary(data) => {
                bs58::decode(data).into_vec().unwrap_or_default()
            }
        };
        
        // Token account data is 165 bytes for SPL Token
        if account_data.len() < 165 {
            continue;
        }

        // Amount is at bytes 64-72 (u64 little-endian)
        let amount = u64::from_le_bytes([
            account_data[64],
            account_data[65],
            account_data[66],
            account_data[67],
            account_data[68],
            account_data[69],
            account_data[70],
            account_data[71],
        ]);

        // Skip if amount is not 1 (NFTs have amount = 1)
        if amount != 1 {
            continue;
        }

        // Mint is at bytes 0-32
        let mint_bytes: [u8; 32] = account_data[0..32].try_into().unwrap();
        let mint = Pubkey::new_from_array(mint_bytes);

        // Fetch metadata for this mint
        if let Ok(kwami_info) = fetch_nft_metadata(state, &mint).await {
            // Filter by collection if configured
            if let Some(collection_mint) = state.kwami_collection_mint {
                // For now, we'll include all NFTs with amount=1
                // TODO: Parse verified_collection from metadata to filter precisely
                kwamis.push(kwami_info);
            } else {
                kwamis.push(kwami_info);
            }
        }
    }

    Ok(kwamis)
}

/// Fetch NFT metadata from Metaplex
async fn fetch_nft_metadata(
    state: &AppState,
    mint: &Pubkey,
) -> Result<KwamiInfo, ApiError> {
    // Derive metadata PDA
    let metadata_seeds = &[
        b"metadata",
        state.metaplex_program.as_ref(),
        mint.as_ref(),
    ];
    
    let (metadata_pda, _bump) = Pubkey::find_program_address(metadata_seeds, &state.metaplex_program);

    // Fetch metadata account
    let account = state
        .rpc_client
        .get_account_with_commitment(&metadata_pda, CommitmentConfig::confirmed())
        .map_err(|e| ApiError::MetadataParseError(format!("Failed to fetch metadata: {}", e)))?
        .value
        .ok_or_else(|| ApiError::MetadataParseError("Metadata account not found".to_string()))?;

    // Parse metadata using mpl-token-metadata
    // For now, we'll do basic parsing. Full borsh deserialization would be ideal.
    // The metadata struct starts after discriminator (1 byte) + key (1 byte)
    let data = &account.data;
    
    if data.len() < 100 {
        return Err(ApiError::MetadataParseError("Metadata too short".to_string()));
    }

    // Simple parsing - in production, use proper borsh deserialization
    // For now, return basic info
    let kwami_info = KwamiInfo {
        mint: mint.to_string(),
        name: "KWAMI".to_string(), // TODO: Parse from metadata
        symbol: "KWAMI".to_string(), // TODO: Parse from metadata
        uri: String::new(), // TODO: Parse from metadata
        image: None,
        attributes: None,
    };

    Ok(kwami_info)
}

/// Generate JWT token
fn generate_jwt(
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
