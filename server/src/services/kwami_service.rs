use crate::error::ApiError;
use crate::models::KwamiInfo;
use crate::state::AppState;
use solana_sdk::{commitment_config::CommitmentConfig, pubkey::Pubkey};
use tracing::debug;

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

    debug!("Found {} token accounts for owner", token_accounts.len());

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
            debug!("Skipping token with amount={}", amount);
            continue;
        }
        
        nft_count += 1;

        // Mint is at bytes 0-32
        let mint_bytes: [u8; 32] = account_data[0..32].try_into().unwrap();
        let mint = Pubkey::new_from_array(mint_bytes);

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
        token_accounts.len(),
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
