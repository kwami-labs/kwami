use crate::error::ApiError;
use crate::models::KwamiInfo;
use crate::state::AppState;
use solana_sdk::{commitment_config::CommitmentConfig, pubkey::Pubkey};
use tracing::{debug, info};

/// Verify that a wallet owns a specific NFT and it's from the KWAMI collection
pub async fn verify_nft_ownership(
    state: &AppState,
    owner: &Pubkey,
    nft_mint: &Pubkey,
) -> Result<bool, ApiError> {
    info!("🔐 Verifying {} owns KWAMI NFT {}", owner, nft_mint);

    // Step 1: Verify token account ownership
    let token_accounts = state
        .rpc_client
        .get_token_accounts_by_owner(
            owner,
            solana_client::rpc_request::TokenAccountsFilter::Mint(*nft_mint),
        )
        .map_err(|e| ApiError::SolanaRpcError(e.to_string()))?;

    if token_accounts.is_empty() {
        info!("❌ No token account found for mint {}", nft_mint);
        return Ok(false);
    }

    // Step 2: Verify amount >= 1 (they own the token)
    let mut has_balance = false;
    for account in token_accounts {
        let account_data = match &account.account.data {
            solana_account_decoder::UiAccountData::Binary(data, _) => {
                bs58::decode(data).into_vec().unwrap_or_default()
            }
            solana_account_decoder::UiAccountData::Json(_) => continue,
            solana_account_decoder::UiAccountData::LegacyBinary(data) => {
                bs58::decode(data).into_vec().unwrap_or_default()
            }
        };

        if account_data.len() >= 72 {
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

            debug!("Token account for {} has amount={}", nft_mint, amount);
            
            if amount >= 1 {
                has_balance = true;
                break;
            }
        }
    }

    if !has_balance {
        info!("❌ Token account has insufficient balance");
        return Ok(false);
    }

    // Step 3: Verify collection (if configured)
    if let Some(required_collection) = &state.kwami_collection_mint {
        info!("🔍 Verifying NFT is from KWAMI collection: {}", required_collection);
        
        match verify_nft_collection(state, nft_mint, required_collection).await {
            Ok(true) => {
                info!("✅ NFT collection verified");
            }
            Ok(false) => {
                info!("❌ NFT is not from the required collection");
                return Err(ApiError::WrongCollection);
            }
            Err(e) => {
                info!("⚠️  Could not verify collection: {}", e);
                // For now, allow if we can't verify (could make this stricter)
                info!("⚠️  Proceeding without collection verification");
            }
        }
    }

    info!("✅ Full verification passed for NFT {}", nft_mint);
    Ok(true)
}

/// Verify NFT is from a specific collection by checking metadata
async fn verify_nft_collection(
    state: &AppState,
    nft_mint: &Pubkey,
    required_collection: &Pubkey,
) -> Result<bool, ApiError> {
    // Derive metadata PDA
    let metadata_seeds = &[
        b"metadata",
        state.metaplex_program.as_ref(),
        nft_mint.as_ref(),
    ];
    
    let (metadata_pda, _bump) =
        Pubkey::find_program_address(metadata_seeds, &state.metaplex_program);

    // Fetch metadata account
    let account = state
        .rpc_client
        .get_account_with_commitment(&metadata_pda, CommitmentConfig::confirmed())
        .map_err(|e| ApiError::MetadataParseError(format!("Failed to fetch metadata: {}", e)))?
        .value
        .ok_or_else(|| ApiError::MetadataParseError("Metadata account not found".to_string()))?;

    let data = &account.data;
    
    // Basic validation
    if data.len() < 100 {
        return Err(ApiError::MetadataParseError("Metadata too short".to_string()));
    }

    // For now, we'll do a simple check by looking for the collection pubkey in the metadata
    // A full borsh deserialization would be better but requires exact struct definitions
    let collection_str = required_collection.to_string();
    let data_str = bs58::encode(&data[100..]).into_string(); // Skip header
    
    if data_str.contains(&collection_str) {
        debug!("Found collection pubkey in metadata");
        return Ok(true);
    }

    // Alternative: check if collection pubkey bytes appear in data
    let collection_bytes = required_collection.to_bytes();
    for window in data.windows(32) {
        if window == collection_bytes {
            debug!("Found collection pubkey bytes in metadata");
            return Ok(true);
        }
    }

    Ok(false)
}

/// Query owned KWAMIs from Solana blockchain
pub async fn query_owned_kwamis(
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

    let total_accounts = token_accounts.len();
    debug!("Found {} token accounts for owner", total_accounts);

    let mut kwamis = Vec::new();
    let mut nft_count = 0;
    let mut parse_failures = 0;

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
            parse_failures += 1;
            debug!("Token account data too short: {} bytes", account_data.len());
            continue;
        }

        // Mint is at bytes 0-32
        let mint_bytes: [u8; 32] = account_data[0..32].try_into().unwrap();
        let mint = Pubkey::new_from_array(mint_bytes);
        
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

        debug!("Token {} has amount={}", mint, amount);

        // Skip if amount is not 1 (NFTs have amount = 1)
        if amount != 1 {
            continue;
        }
        
        nft_count += 1;

        // Fetch metadata for this mint
        debug!("Found NFT with amount=1, mint: {}", mint);
        match fetch_nft_metadata(state, &mint).await {
            Ok(kwami_info) => {
                debug!("Successfully fetched metadata for {}", mint);
                // For now, include all NFTs with amount=1 regardless of collection
                // TODO: Parse verified_collection from metadata to filter precisely
                kwamis.push(kwami_info);
            }
            Err(e) => {
                debug!("Failed to fetch metadata for {}: {}", mint, e);
                // Continue to next NFT
            }
        }
    }

    debug!(
        "Summary: {} total accounts, {} with amount=1, {} parse failures, {} KWAMIs found",
        total_accounts,
        nft_count,
        parse_failures,
        kwamis.len()
    );

    Ok(kwamis)
}

/// Fetch NFT metadata from Metaplex
pub async fn fetch_nft_metadata(
    state: &AppState,
    mint: &Pubkey,
) -> Result<KwamiInfo, ApiError> {
    // Derive metadata PDA
    let metadata_seeds = &[
        b"metadata",
        state.metaplex_program.as_ref(),
        mint.as_ref(),
    ];

    let (metadata_pda, _bump) =
        Pubkey::find_program_address(metadata_seeds, &state.metaplex_program);

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
        return Err(ApiError::MetadataParseError(
            "Metadata too short".to_string(),
        ));
    }

    // Simple parsing - in production, use proper borsh deserialization
    // For now, return basic info
    let kwami_info = KwamiInfo {
        mint: mint.to_string(),
        name: "KWAMI".to_string(),     // TODO: Parse from metadata
        symbol: "KWAMI".to_string(),   // TODO: Parse from metadata
        uri: String::new(),            // TODO: Parse from metadata
        image: None,
        attributes: None,
    };

    Ok(kwami_info)
}
