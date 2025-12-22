use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_option::COption;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, MintTo};
use anchor_spl::associated_token::AssociatedToken;
use mpl_token_metadata::{
    instructions::{
        CreateMetadataAccountV3Cpi,
        CreateMetadataAccountV3CpiAccounts,
        CreateMetadataAccountV3InstructionArgs,
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

/// Base minting costs in QWAMI tokens by generation
/// Gen #0 (2026): Premium early adopter pricing
const GEN_0_MINT_COST: u64 = 10_000; // 10,000 QWAMI = $100 USD

/// Gen #1-5 (2027-2031): Early adopter pricing
const GEN_1_5_MINT_COST: u64 = 5_000; // 5,000 QWAMI = $50 USD

/// Gen #6-20 (2032-2046): Growth phase pricing
const GEN_6_20_MINT_COST: u64 = 2_500; // 2,500 QWAMI = $25 USD

/// Gen #21-50 (2047-2076): Mass adoption pricing
const GEN_21_50_MINT_COST: u64 = 1_000; // 1,000 QWAMI = $10 USD

/// Gen #51-74 (2077-2100): Universal access pricing
const GEN_51_74_MINT_COST: u64 = 500; // 500 QWAMI = $5 USD

/// Platform fee percentage (10% of base cost)
const PLATFORM_FEE_PERCENTAGE: u64 = 10; // 10%

/// Transaction fee (fixed)
const TRANSACTION_FEE_QWAMI: u64 = 50; // 50 QWAMI

/// Burn refund percentage (50% of original base cost)
const BURN_REFUND_PERCENTAGE: u64 = 50; // 50%

/// Dividend pool allocation (80% of revenue)
const DIVIDEND_POOL_PERCENTAGE: u64 = 80; // 80%

/// Operations fund allocation (20% of revenue)
const OPERATIONS_FUND_PERCENTAGE: u64 = 20; // 20%

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

/// Calculate the total minting cost in QWAMI tokens based on generation
/// Returns (base_cost, platform_fee, transaction_fee, total_cost)
fn calculate_mint_cost(generation: i64) -> (u64, u64, u64, u64) {
    // Determine base cost by generation tier
    let base_cost = if generation == 0 {
        GEN_0_MINT_COST
    } else if generation >= 1 && generation <= 5 {
        GEN_1_5_MINT_COST
    } else if generation >= 6 && generation <= 20 {
        GEN_6_20_MINT_COST
    } else if generation >= 21 && generation <= 50 {
        GEN_21_50_MINT_COST
    } else {
        // Gen #51-74
        GEN_51_74_MINT_COST
    };

    // Calculate fees
    let platform_fee = (base_cost * PLATFORM_FEE_PERCENTAGE) / 100;
    let transaction_fee = TRANSACTION_FEE_QWAMI;
    let total_cost = base_cost + platform_fee + transaction_fee;

    (base_cost, platform_fee, transaction_fee, total_cost)
}

/// Calculate burn refund amount (50% of original base cost)
fn calculate_burn_refund(base_cost: u64) -> u64 {
    (base_cost * BURN_REFUND_PERCENTAGE) / 100
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
        treasury.qwami_vault = ctx.accounts.qwami_vault.key();
        treasury.total_qwami_received = 0;
        treasury.total_qwami_refunded = 0;
        treasury.nft_mints_count = 0;
        treasury.nft_burns_count = 0;
        treasury.dividend_pool_balance = 0;
        treasury.operations_balance = 0;
        treasury.last_dividend_distribution = 0;
        treasury.bump = ctx.bumps.treasury;

        msg!("Kwami NFT program initialized");
        msg!("Collection: {}", collection_authority.collection_mint);
        msg!("Authority: {}", collection_authority.authority);
        msg!("Treasury: {}", treasury.key());

        Ok(())
    }

    /// Mint a new Kwami NFT with unique DNA validation (requires QWAMI payment)
    pub fn mint_kwami(
        ctx: Context<MintKwami>,
        dna_hash: [u8; 32],
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let dna_registry = &mut ctx.accounts.dna_registry;
        let collection_authority = &mut ctx.accounts.collection_authority;
        let treasury = &mut ctx.accounts.treasury;

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

        // Calculate minting cost based on generation
        let (base_cost, platform_fee, transaction_fee, total_cost) = calculate_mint_cost(current_generation);

        // Validate user has sufficient QWAMI tokens
        let user_qwami_balance = ctx.accounts.user_qwami_account.amount;
        require!(
            user_qwami_balance >= total_cost,
            ErrorCode::InsufficientQwamiBalance
        );

        // Transfer QWAMI tokens from user to treasury
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_qwami_account.to_account_info(),
                to: ctx.accounts.qwami_vault.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, total_cost)?;

        // Update treasury accounting
        treasury.total_qwami_received += total_cost;
        treasury.nft_mints_count += 1;

        // Split revenue: 80% to dividend pool, 20% to operations
        let dividend_amount = (total_cost * DIVIDEND_POOL_PERCENTAGE) / 100;
        let operations_amount = (total_cost * OPERATIONS_FUND_PERCENTAGE) / 100;
        treasury.dividend_pool_balance += dividend_amount;
        treasury.operations_balance += operations_amount;

        // Create Kwami NFT account
        let kwami_nft = &mut ctx.accounts.kwami_nft;
        kwami_nft.mint = ctx.accounts.mint.key();
        kwami_nft.owner = ctx.accounts.owner.key();
        kwami_nft.dna_hash = dna_hash;
        kwami_nft.minted_at = Clock::get()?.unix_timestamp;
        kwami_nft.updated_at = Clock::get()?.unix_timestamp;
        kwami_nft.metadata_uri = uri.clone();
        kwami_nft.mint_cost_qwami = base_cost; // Store original base cost for refund calculation
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
        
        // Drop all mutable borrows before CPI
        drop(dna_registry);
        drop(collection_authority);
        drop(treasury);
        drop(kwami_nft);
        
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
        msg!("Cost: {} QWAMI (Base: {}, Platform Fee: {}, TX Fee: {})", 
            total_cost, base_cost, platform_fee, transaction_fee);
        msg!("DNA Hash: {:?}", dna_hash);
        msg!("Mint: {}", ctx.accounts.mint.key());
        msg!("Owner: {}", ctx.accounts.owner.key());
        msg!("Total Minted: {}/{}", current_total_minted, current_max_supply);
        msg!("Global Progress: {}/{} (Final by 2100)", current_total_minted, MAX_TOTAL_KWAMIS);
        msg!("Treasury Revenue: {} QWAMI (Dividends: {} | Operations: {})",
            total_cost, dividend_amount, operations_amount);

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

    /// Burn Kwami NFT and remove DNA from registry (with 50% QWAMI refund)
    /// This allows re-minting with a different DNA
    pub fn burn_kwami(ctx: Context<BurnKwami>) -> Result<()> {
        let kwami_nft = &ctx.accounts.kwami_nft;
        let dna_registry = &mut ctx.accounts.dna_registry;
        let treasury = &mut ctx.accounts.treasury;

        // Validate owner
        require!(
            kwami_nft.owner == ctx.accounts.owner.key(),
            ErrorCode::InvalidOwner
        );

        // Calculate refund (50% of original base cost)
        let refund_amount = calculate_burn_refund(kwami_nft.mint_cost_qwami);

        // Validate treasury has sufficient QWAMI for refund
        require!(
            ctx.accounts.qwami_vault.amount >= refund_amount,
            ErrorCode::InsufficientTreasuryBalance
        );

        // Transfer QWAMI refund from treasury to user
        let treasury_seeds: &[&[u8]] = &[
            b"kwami-treasury".as_ref(),
            &[treasury.bump],
        ];
        let signer = &[treasury_seeds];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.qwami_vault.to_account_info(),
                to: ctx.accounts.user_qwami_account.to_account_info(),
                authority: treasury.to_account_info(),
            },
            signer,
        );
        token::transfer(transfer_ctx, refund_amount)?;

        // Update treasury accounting
        treasury.total_qwami_refunded += refund_amount;
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
        msg!("QWAMI Refund: {} (50% of {} base cost)", refund_amount, kwami_nft.mint_cost_qwami);
        msg!("Freed DNA for re-minting");
        msg!("Treasury Refunded: {} QWAMI", refund_amount);

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

    /// QWAMI token vault must be created off-chain and owned by the `treasury` PDA
    #[account(
        mut,
        token::mint = qwami_mint,
        token::authority = treasury,
    )]
    pub qwami_vault: Box<Account<'info, TokenAccount>>,

    /// QWAMI token mint
    pub qwami_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
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

    /// User's QWAMI token account (pays minting cost)
    #[account(
        mut,
        constraint = user_qwami_account.mint == qwami_vault.mint @ ErrorCode::InvalidQwamiMint,
        constraint = user_qwami_account.owner == owner.key() @ ErrorCode::InvalidQwamiAccount,
    )]
    pub user_qwami_account: Box<Account<'info, TokenAccount>>,

    /// Treasury's QWAMI vault (receives minting payment)
    #[account(
        mut,
        constraint = qwami_vault.key() == treasury.qwami_vault @ ErrorCode::InvalidTreasuryVault,
    )]
    pub qwami_vault: Box<Account<'info, TokenAccount>>,

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

    /// User's QWAMI token account (receives refund)
    #[account(
        mut,
        constraint = user_qwami_account.mint == qwami_vault.mint @ ErrorCode::InvalidQwamiMint,
        constraint = user_qwami_account.owner == owner.key() @ ErrorCode::InvalidQwamiAccount,
    )]
    pub user_qwami_account: Box<Account<'info, TokenAccount>>,

    /// Treasury's QWAMI vault (pays refund)
    #[account(
        mut,
        constraint = qwami_vault.key() == treasury.qwami_vault @ ErrorCode::InvalidTreasuryVault,
    )]
    pub qwami_vault: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
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
    /// Original base minting cost in QWAMI (used for refund calculation)
    pub mint_cost_qwami: u64,
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
        8 +  // mint_cost_qwami
        1;   // bump
}

#[account]
pub struct KwamiTreasury {
    /// Authority that can manage the treasury
    pub authority: Pubkey,
    
    /// QWAMI token vault PDA
    pub qwami_vault: Pubkey,
    
    /// Total QWAMI received from NFT mints
    pub total_qwami_received: u64,
    
    /// Total QWAMI refunded from NFT burns
    pub total_qwami_refunded: u64,
    
    /// Total number of NFT mints
    pub nft_mints_count: u64,
    
    /// Total number of NFT burns
    pub nft_burns_count: u64,
    
    /// Dividend pool balance (80% of revenue)
    pub dividend_pool_balance: u64,
    
    /// Operations fund balance (20% of revenue)
    pub operations_balance: u64,
    
    /// Last dividend distribution timestamp
    pub last_dividend_distribution: i64,
    
    /// Bump seed
    pub bump: u8,
}

impl KwamiTreasury {
    pub const LEN: usize = 32 + // authority
        32 + // qwami_vault
        8 +  // total_qwami_received
        8 +  // total_qwami_refunded
        8 +  // nft_mints_count
        8 +  // nft_burns_count
        8 +  // dividend_pool_balance
        8 +  // operations_balance
        8 +  // last_dividend_distribution
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
    #[msg("Insufficient QWAMI balance to mint this NFT. Check the required amount.")]
    InsufficientQwamiBalance,

    #[msg("Invalid QWAMI mint address. Please use the official QWAMI token.")]
    InvalidQwamiMint,

    #[msg("Invalid QWAMI token account. Account must be owned by the signer.")]
    InvalidQwamiAccount,

    #[msg("Invalid treasury vault. Please use the official treasury account.")]
    InvalidTreasuryVault,

    #[msg("Invalid collection mint authority")]
    InvalidCollectionMintAuthority,

    #[msg("Invalid collection mint decimals")]
    InvalidCollectionMintDecimals,

    #[msg("Insufficient treasury balance to process refund. Contact support.")]
    InsufficientTreasuryBalance,
}
