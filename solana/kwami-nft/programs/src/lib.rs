use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_option::COption;
use anchor_lang::system_program::{transfer as system_transfer, Transfer as SystemTransfer};
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo};
use anchor_spl::associated_token::AssociatedToken;
use mpl_token_metadata::{
    instructions::{
        CreateMetadataAccountV3Cpi,
        CreateMetadataAccountV3CpiAccounts,
        CreateMetadataAccountV3InstructionArgs,
        VerifyCollectionCpi,
        VerifyCollectionCpiAccounts,
    },
    types::DataV2,
};

declare_id!("DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD"); // Will be updated after deployment

/// Maximum total KWAMIs by 2100 - One for every human on Earth (10 billion)
/// Based on UN World Population Prospects 2022 - Medium Variant: ~10.4B by 2100
/// See: https://population.un.org/wpp/
const MAX_TOTAL_KWAMIS: u64 = 10_000_000_000;

/// Annual supply increment - 133.33 Million per generation (75 generations over 75 years)
const ANNUAL_SUPPLY_INCREMENT: u64 = 133_333_333;

/// Launch timestamp: January 1, 2026 00:00:00 UTC (Generation #0)
const LAUNCH_TIMESTAMP: i64 = 1735689600;

/// Seconds in a year (365.25 days accounting for leap years)
const SECONDS_PER_YEAR: i64 = 31_557_600;

/// Maximum generation number (Gen #0 to Gen #74 = 75 generations)
const MAX_GENERATION: i64 = 74;

/// Maximum DNA entries stored in a single account (account size limit)
const MAX_DNA_PER_ACCOUNT: usize = 1000;

/// Size of a DNA hash (SHA-256 = 32 bytes)
const DNA_HASH_SIZE: usize = 32;

// ========== Economic Constants ==========

/// KWAMI mint cost schedule (SOL-paid):
/// Gen #0 (2026): 0.1 SOL
/// Gen #1 (2027): 0.2 SOL
/// Gen #2 (2028): 0.3 SOL
/// ... and so on (linear: +0.1 SOL per year).
const BASE_MINT_COST_LAMPORTS_PER_GENERATION: u64 = 100_000_000; // 0.1 SOL


/// Calculate the current generation number based on timestamp
/// Returns generation number (0-74) and max supply for that generation
fn get_current_generation_info(current_timestamp: i64) -> (i64, u64) {
    // If before launch, return Gen #0 with first generation supply
    if current_timestamp < LAUNCH_TIMESTAMP {
        return (0, ANNUAL_SUPPLY_INCREMENT);
    }

    // Calculate years since launch
    let seconds_since_launch = current_timestamp - LAUNCH_TIMESTAMP;
    let years_since_launch = seconds_since_launch / SECONDS_PER_YEAR;

    // Cap at Gen #74 (2100)
    let generation = years_since_launch.min(MAX_GENERATION);

    // Calculate max supply for this generation
    // Formula: (generation + 1) × 133,333,333
    let max_supply = (generation as u64 + 1) * ANNUAL_SUPPLY_INCREMENT;

    (generation, max_supply)
}

/// Calculate mint cost in lamports for the given generation.
/// Returns (base_cost_lamports, total_cost_lamports).
fn calculate_mint_cost_lamports(generation: i64) -> Result<(u64, u64)> {
    let gen_u64: u64 = generation
        .try_into()
        .map_err(|_| ErrorCode::MathOverflow)?;

    let base_cost = (gen_u64 + 1)
        .checked_mul(BASE_MINT_COST_LAMPORTS_PER_GENERATION)
        .ok_or(ErrorCode::MathOverflow)?;

    // SOL-only MVP: no extra platform/tx fee at the program level
    Ok((base_cost, base_cost))
}

#[program]
pub mod kwami_nft {
    use super::*;

    /// Initialize the Kwami NFT program, DNA registry, and treasury
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let collection_authority = &mut ctx.accounts.collection_authority;
        collection_authority.authority = ctx.accounts.payer.key();
        collection_authority.collection_mint = ctx.accounts.collection_mint.key();
        collection_authority.total_minted = 0;
        collection_authority.bump = ctx.bumps.collection_authority;

        let dna_registry = &mut ctx.accounts.dna_registry;
        dna_registry.authority = ctx.accounts.payer.key();
        dna_registry.collection = ctx.accounts.collection_mint.key();
        dna_registry.dna_count = 0;

        // Initialize treasury
        let treasury = &mut ctx.accounts.treasury;
        treasury.authority = ctx.accounts.payer.key();
        treasury.total_sol_received = 0;
        treasury.nft_mints_count = 0;
        treasury.nft_burns_count = 0;
        treasury.bump = ctx.bumps.treasury;

        msg!("Kwami NFT program initialized");
        msg!("Collection: {}", collection_authority.collection_mint);
        msg!("Authority: {}", collection_authority.authority);
        msg!("Treasury: {}", treasury.key());

        Ok(())
    }

    /// Mint a new Kwami NFT with unique DNA validation (requires SOL payment)
    pub fn mint_kwami(
        ctx: Context<MintKwami>,
        dna_hash: [u8; 32],
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let dna_registry = &mut ctx.accounts.dna_registry;
        let collection_authority = &mut ctx.accounts.collection_authority;

        // Get current timestamp and calculate generation info
        let current_timestamp = Clock::get()?.unix_timestamp;
        let (current_generation, current_max_supply) = get_current_generation_info(current_timestamp);

        // Check if we've reached the current generation's supply limit
        require!(
            collection_authority.total_minted < current_max_supply,
            ErrorCode::GenerationSupplyReached
        );

        // Also check absolute maximum (10 billion by 2100)
        require!(
            collection_authority.total_minted < MAX_TOTAL_KWAMIS,
            ErrorCode::MaxSupplyReached
        );

        // Validate DNA uniqueness
        require!(
            !dna_registry.dna_hashes.contains(&dna_hash),
            ErrorCode::DuplicateDNA
        );

        // Check account capacity
        require!(
            dna_registry.dna_count < MAX_DNA_PER_ACCOUNT as u64,
            ErrorCode::RegistryFull
        );

        // Validate inputs
        require!(name.len() <= 32, ErrorCode::NameTooLong);
        require!(symbol.len() <= 10, ErrorCode::SymbolTooLong);
        require!(uri.len() <= 200, ErrorCode::UriTooLong);

        // Calculate minting cost based on generation (SOL schedule)
        let (base_cost_lamports, total_cost_lamports) =
            calculate_mint_cost_lamports(current_generation)?;

        // Best-effort pre-check; the CPI will also fail if insufficient.
        require!(
            ctx.accounts.owner.to_account_info().lamports() >= total_cost_lamports,
            ErrorCode::InsufficientSolBalance
        );

        // Transfer SOL (lamports) from user to the treasury authority wallet (master wallet).
        // This keeps the "treasury" as a normal wallet balance visible to everyone.
        require_keys_eq!(
            ctx.accounts.treasury_authority.key(),
            ctx.accounts.treasury.authority,
            ErrorCode::InvalidTreasuryAuthority
        );

        system_transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                SystemTransfer {
                    from: ctx.accounts.owner.to_account_info(),
                    to: ctx.accounts.treasury_authority.to_account_info(),
                },
            ),
            total_cost_lamports,
        )?;

        // Update treasury accounting
        let treasury = &mut ctx.accounts.treasury;
        treasury.total_sol_received = treasury
            .total_sol_received
            .checked_add(total_cost_lamports)
            .ok_or(ErrorCode::MathOverflow)?;
        treasury.nft_mints_count += 1;


        // Create Kwami NFT account
        let kwami_nft = &mut ctx.accounts.kwami_nft;
        kwami_nft.mint = ctx.accounts.mint.key();
        kwami_nft.owner = ctx.accounts.owner.key();
        kwami_nft.dna_hash = dna_hash;
        kwami_nft.minted_at = Clock::get()?.unix_timestamp;
        kwami_nft.updated_at = Clock::get()?.unix_timestamp;
        kwami_nft.metadata_uri = uri.clone();
        kwami_nft.mint_cost_lamports = base_cost_lamports; // Store original base cost for refund calculation
        kwami_nft.bump = ctx.bumps.kwami_nft;

        // Add DNA to registry
        dna_registry.dna_hashes.push(dna_hash);
        dna_registry.dna_count += 1;

        // Increment collection counter before CPI
        collection_authority.total_minted += 1;

        // Store values needed for CPI before dropping mutable borrows
        let collection_mint = collection_authority.collection_mint;
        let authority_bump = collection_authority.bump;
        let current_total_minted = collection_authority.total_minted;
        
        // Drop all mutable borrows before CPI (avoid holding &mut across CPI)
        let _ = dna_registry;
        let _ = collection_authority;
        let _ = treasury;
        let _ = kwami_nft;
        
        // Create Metaplex metadata for wallet visibility
        let collection_authority_seeds = &[
            b"collection-authority",
            collection_mint.as_ref(),
            &[authority_bump],
        ];
        let collection_authority_signer = &[&collection_authority_seeds[..]];

        CreateMetadataAccountV3Cpi::new(
            &ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountV3CpiAccounts {
                metadata: &ctx.accounts.metadata.to_account_info(),
                mint: &ctx.accounts.mint.to_account_info(),
                mint_authority: &ctx.accounts.collection_authority.to_account_info(),
                payer: &ctx.accounts.owner.to_account_info(),
                update_authority: (&ctx.accounts.collection_authority.to_account_info(), true),
                system_program: &ctx.accounts.system_program.to_account_info(),
                rent: None,
            },
            CreateMetadataAccountV3InstructionArgs {
                data: DataV2 {
                    name,
                    symbol,
                    uri,
                    seller_fee_basis_points: 500, // 5% royalty
                    creators: None,
                    collection: Some(mpl_token_metadata::types::Collection {
                        verified: false,
                        key: collection_mint,
                    }),
                    uses: None,
                },
                is_mutable: true,
                collection_details: None,
            },
        )
        .invoke_signed(collection_authority_signer)?;

        // OPTIONAL: verify collection so wallets group items under the same collection.
        // This requires passing the collection mint + collection metadata PDA + master edition PDA
        // as remaining accounts in this exact order:
        // [0] collection_mint
        // [1] collection_metadata PDA
        // [2] collection_master_edition PDA
        if ctx.remaining_accounts.len() >= 3 {
            let collection_mint_ai = &ctx.remaining_accounts[0];
            let collection_metadata_ai = &ctx.remaining_accounts[1];
            let collection_master_edition_ai = &ctx.remaining_accounts[2];

            require_keys_eq!(collection_mint_ai.key(), collection_mint, ErrorCode::InvalidCollectionMint);

            let (expected_collection_metadata, _) = Pubkey::find_program_address(
                &[
                    b"metadata",
                    mpl_token_metadata::ID.as_ref(),
                    collection_mint.as_ref(),
                ],
                &mpl_token_metadata::ID,
            );
            let (expected_collection_master_edition, _) = Pubkey::find_program_address(
                &[
                    b"metadata",
                    mpl_token_metadata::ID.as_ref(),
                    collection_mint.as_ref(),
                    b"edition",
                ],
                &mpl_token_metadata::ID,
            );

            require_keys_eq!(
                collection_metadata_ai.key(),
                expected_collection_metadata,
                ErrorCode::InvalidCollectionMetadata
            );
            require_keys_eq!(
                collection_master_edition_ai.key(),
                expected_collection_master_edition,
                ErrorCode::InvalidCollectionMasterEdition
            );

            VerifyCollectionCpi::new(
                &ctx.accounts.token_metadata_program.to_account_info(),
                VerifyCollectionCpiAccounts {
                    metadata: &ctx.accounts.metadata.to_account_info(),
                    collection_authority: &ctx.accounts.collection_authority.to_account_info(),
                    payer: &ctx.accounts.owner.to_account_info(),
                    collection_mint: collection_mint_ai,
                    collection: collection_metadata_ai,
                    collection_master_edition_account: collection_master_edition_ai,
                    collection_authority_record: None,
                },
            )
            .invoke_signed(collection_authority_signer)?;
        } else {
            msg!("Skipping collection verification (collection accounts not provided)");
        }

        // Mint 1 NFT token to owner's token account
        let mint_to_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.owner_token_account.to_account_info(),
                authority: ctx.accounts.collection_authority.to_account_info(),
            },
            collection_authority_signer,
        );
        token::mint_to(mint_to_ctx, 1)?;

        msg!("Minted Kwami NFT");
        msg!("Generation: #{}", current_generation);
        msg!(
            "Cost: {} lamports (Base: {} lamports | Total: {} lamports)",
            total_cost_lamports,
            base_cost_lamports,
            total_cost_lamports
        );
        msg!("DNA Hash: {:?}", dna_hash);
        msg!("Mint: {}", ctx.accounts.mint.key());
        msg!("Owner: {}", ctx.accounts.owner.key());
        msg!("Total Minted: {}/{}", current_total_minted, current_max_supply);
        msg!("Global Progress: {}/{} (Final by 2100)", current_total_minted, MAX_TOTAL_KWAMIS);
        Ok(())
    }

    /// Update Kwami NFT metadata (mind/soul changes only, DNA must stay same)
    pub fn update_metadata(
        ctx: Context<UpdateMetadata>,
        new_uri: String,
    ) -> Result<()> {
        let kwami_nft = &mut ctx.accounts.kwami_nft;

        // Validate owner
        require!(
            kwami_nft.owner == ctx.accounts.owner.key(),
            ErrorCode::InvalidOwner
        );

        // Validate URI length
        require!(new_uri.len() <= 200, ErrorCode::UriTooLong);

        // Update metadata URI
        kwami_nft.metadata_uri = new_uri.clone();
        kwami_nft.updated_at = Clock::get()?.unix_timestamp;

        msg!("Updated Kwami NFT metadata");
        msg!("Mint: {}", kwami_nft.mint);
        msg!("New URI: {}", new_uri);

        Ok(())
    }

    /// Burn Kwami NFT and remove DNA from registry (no SOL refund in SOL-paid MVP).
    /// This allows re-minting with a different DNA.
    pub fn burn_kwami(ctx: Context<BurnKwami>) -> Result<()> {
        let kwami_nft = &ctx.accounts.kwami_nft;
        let dna_registry = &mut ctx.accounts.dna_registry;
        let treasury = &mut ctx.accounts.treasury;

        // Validate owner
        require!(
            kwami_nft.owner == ctx.accounts.owner.key(),
            ErrorCode::InvalidOwner
        );

        // No SOL refund in this version.
        treasury.nft_burns_count += 1;

        // Remove DNA from registry
        let dna_hash = kwami_nft.dna_hash;
        if let Some(pos) = dna_registry.dna_hashes.iter().position(|&x| x == dna_hash) {
            dna_registry.dna_hashes.remove(pos);
            dna_registry.dna_count -= 1;
        }

        // Burn token (handled by Anchor with close constraint)
        msg!("Burned Kwami NFT");
        msg!("DNA Hash: {:?}", dna_hash);
        msg!("Freed DNA for re-minting");

        Ok(())
    }

    /// Check if a DNA hash is already registered
    pub fn check_dna_exists(ctx: Context<CheckDna>, dna_hash: [u8; 32]) -> Result<bool> {
        let dna_registry = &ctx.accounts.dna_registry;
        Ok(dna_registry.dna_hashes.contains(&dna_hash))
    }

    /// Transfer Kwami NFT ownership (updates internal record)
    pub fn transfer_kwami(ctx: Context<TransferKwami>, new_owner: Pubkey) -> Result<()> {
        let kwami_nft = &mut ctx.accounts.kwami_nft;

        require!(
            kwami_nft.owner == ctx.accounts.current_owner.key(),
            ErrorCode::InvalidOwner
        );

        let old_owner = kwami_nft.owner;
        kwami_nft.owner = new_owner;
        kwami_nft.updated_at = Clock::get()?.unix_timestamp;

        msg!("Transferred Kwami NFT");
        msg!("From: {}", old_owner);
        msg!("To: {}", new_owner);

        Ok(())
    }
}

// ========== Instructions ==========

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// Collection mint must be created off-chain (keeps this instruction under the SBF stack limit)
    #[account(
        mut,
        constraint = collection_mint.decimals == 0 @ ErrorCode::InvalidCollectionMintDecimals,
        constraint = collection_mint.mint_authority == COption::Some(collection_authority.key()) @ ErrorCode::InvalidCollectionMintAuthority,
    )]
    pub collection_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = payer,
        space = 8 + CollectionAuthority::LEN,
        seeds = [b"collection-authority", collection_mint.key().as_ref()],
        bump,
    )]
    pub collection_authority: Box<Account<'info, CollectionAuthority>>,

    #[account(
        init,
        payer = payer,
        space = 8 + DnaRegistry::INITIAL_SIZE,
        seeds = [b"dna-registry", collection_mint.key().as_ref()],
        bump,
    )]
    pub dna_registry: Box<Account<'info, DnaRegistry>>,

    #[account(
        init,
        payer = payer,
        space = 8 + KwamiTreasury::LEN,
        seeds = [b"kwami-treasury"],
        bump,
    )]
    pub treasury: Box<Account<'info, KwamiTreasury>>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintKwami<'info> {
    #[account(
        init,
        payer = owner,
        mint::decimals = 0,
        mint::authority = collection_authority,
    )]
    pub mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = owner,
        space = 8 + KwamiNft::LEN,
        seeds = [b"kwami-nft", mint.key().as_ref()],
        bump,
    )]
    pub kwami_nft: Box<Account<'info, KwamiNft>>,

    #[account(
        mut,
        seeds = [b"collection-authority", collection_authority.collection_mint.as_ref()],
        bump = collection_authority.bump,
    )]
    pub collection_authority: Box<Account<'info, CollectionAuthority>>,

    #[account(
        mut,
        realloc = 8 + DnaRegistry::space_for_hashes(dna_registry.dna_count as usize + 1),
        realloc::payer = owner,
        realloc::zero = false,
        seeds = [b"dna-registry", collection_authority.collection_mint.as_ref()],
        bump,
    )]
    pub dna_registry: Box<Account<'info, DnaRegistry>>,

    #[account(
        mut,
        seeds = [b"kwami-treasury"],
        bump = treasury.bump,
    )]
    pub treasury: Box<Account<'info, KwamiTreasury>>,

    /// The wallet that receives SOL proceeds (must match `treasury.authority`).
    #[account(mut)]
    pub treasury_authority: SystemAccount<'info>,

    /// CHECK: Metaplex metadata account (created by CPI)
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    /// Owner's token account to receive the minted NFT
    #[account(
        init,
        payer = owner,
        associated_token::mint = mint,
        associated_token::authority = owner,
    )]
    pub owner_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    
    /// CHECK: Metaplex Token Metadata program
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct UpdateMetadata<'info> {
    #[account(
        mut,
        seeds = [b"kwami-nft", kwami_nft.mint.as_ref()],
        bump = kwami_nft.bump,
        has_one = owner,
    )]
    pub kwami_nft: Account<'info, KwamiNft>,

    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct BurnKwami<'info> {
    #[account(
        mut,
        seeds = [b"kwami-nft", kwami_nft.mint.as_ref()],
        bump = kwami_nft.bump,
        has_one = owner,
        close = owner,
    )]
    pub kwami_nft: Box<Account<'info, KwamiNft>>,

    #[account(mut)]
    pub mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        seeds = [b"dna-registry", dna_registry.collection.as_ref()],
        bump,
    )]
    pub dna_registry: Box<Account<'info, DnaRegistry>>,

    #[account(
        mut,
        seeds = [b"kwami-treasury"],
        bump = treasury.bump,
    )]
    pub treasury: Box<Account<'info, KwamiTreasury>>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct CheckDna<'info> {
    #[account(
        seeds = [b"dna-registry", dna_registry.collection.as_ref()],
        bump,
    )]
    pub dna_registry: Box<Account<'info, DnaRegistry>>,
}

#[derive(Accounts)]
pub struct TransferKwami<'info> {
    #[account(
        mut,
        seeds = [b"kwami-nft", kwami_nft.mint.as_ref()],
        bump = kwami_nft.bump,
    )]
    pub kwami_nft: Account<'info, KwamiNft>,

    pub current_owner: Signer<'info>,
}

// ========== State ==========

#[account]
pub struct CollectionAuthority {
    /// Authority that can manage the collection
    pub authority: Pubkey,
    /// Collection mint address
    pub collection_mint: Pubkey,
    /// Total number of Kwamis minted
    pub total_minted: u64,
    /// Bump seed
    pub bump: u8,
}

impl CollectionAuthority {
    pub const LEN: usize = 32 + // authority
        32 + // collection_mint
        8 +  // total_minted
        1;   // bump
}

#[account]
pub struct DnaRegistry {
    /// Authority
    pub authority: Pubkey,
    /// Collection this registry belongs to
    pub collection: Pubkey,
    /// Array of DNA hashes
    pub dna_hashes: Vec<[u8; 32]>,
    /// Count of registered DNAs
    pub dna_count: u64,
}

impl DnaRegistry {
    // Minimal initial size - Vec will grow dynamically
    pub const INITIAL_SIZE: usize = 32 + // authority
        32 + // collection
        4 +  // vec length (starts empty)
        8;   // dna_count
    
    // Calculate space needed for N DNA hashes
    pub fn space_for_hashes(count: usize) -> usize {
        Self::INITIAL_SIZE + (DNA_HASH_SIZE * count)
    }
}

#[account]
pub struct KwamiNft {
    /// The mint address of this NFT
    pub mint: Pubkey,
    /// Current owner
    pub owner: Pubkey,
    /// DNA hash (SHA-256)
    pub dna_hash: [u8; 32],
    /// Timestamp when minted
    pub minted_at: i64,
    /// Timestamp when last updated
    pub updated_at: i64,
    /// Metadata URI (Arweave)
    pub metadata_uri: String,
    /// Original base minting cost in lamports (used for refund calculation)
    pub mint_cost_lamports: u64,
    /// Bump seed
    pub bump: u8,
}

impl KwamiNft {
    pub const LEN: usize = 32 + // mint
        32 + // owner
        32 + // dna_hash
        8 +  // minted_at
        8 +  // updated_at
        4 + 200 + // metadata_uri (max 200 chars)
        8 +  // mint_cost_lamports
        1;   // bump
}

#[account]
pub struct KwamiTreasury {
    /// Authority that can manage the treasury
    pub authority: Pubkey,
    
    /// Total SOL (lamports) received from NFT mints
    pub total_sol_received: u64,
    
    /// Total number of NFT mints
    pub nft_mints_count: u64,
    
    /// Total number of NFT burns
    pub nft_burns_count: u64,
    
    /// Bump seed
    pub bump: u8,
}

impl KwamiTreasury {
    pub const LEN: usize = 32 + // authority
        8 +  // total_sol_received
        8 +  // nft_mints_count
        8 +  // nft_burns_count
        1;   // bump
}

// ========== Errors ==========

#[error_code]
pub enum ErrorCode {
    #[msg("Maximum supply of 10 billion KWAMIs has been reached (2100). No more can be minted.")]
    MaxSupplyReached,

    #[msg("Current generation's supply limit reached. Wait for next generation (January 1st).")]
    GenerationSupplyReached,

    #[msg("This DNA already exists. Each Kwami must have unique DNA.")]
    DuplicateDNA,

    #[msg("DNA registry is full. Maximum capacity reached.")]
    RegistryFull,

    #[msg("Invalid owner for this Kwami NFT")]
    InvalidOwner,

    #[msg("Name exceeds maximum length of 32 characters")]
    NameTooLong,

    #[msg("Symbol exceeds maximum length of 10 characters")]
    SymbolTooLong,

    #[msg("URI exceeds maximum length of 200 characters")]
    UriTooLong,

    // Economic Errors
    #[msg("Insufficient SOL balance to mint this NFT.")]
    InsufficientSolBalance,

    #[msg("Invalid collection mint authority")]
    InvalidCollectionMintAuthority,

    #[msg("Invalid collection mint decimals")]
    InvalidCollectionMintDecimals,

    #[msg("Treasury authority wallet does not match the configured authority")]
    InvalidTreasuryAuthority,

    #[msg("Invalid collection mint (must match the program's collection mint)")]
    InvalidCollectionMint,

    #[msg("Invalid collection metadata PDA")]
    InvalidCollectionMetadata,

    #[msg("Invalid collection master edition PDA")]
    InvalidCollectionMasterEdition,

    #[msg("Math overflow")]
    MathOverflow,
}
