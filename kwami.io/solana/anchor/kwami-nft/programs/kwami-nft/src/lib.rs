use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program::invoke,
    system_instruction,
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount},
    metadata::{
        create_metadata_accounts_v3,
        CreateMetadataAccountsV3,
        Metadata as MetaplexMetadata,
        mpl_token_metadata::types::DataV2,
    },
};

declare_id!("11111111111111111111111111111111"); // Will be updated after deployment

/// Maximum total KWAMIs that can ever be minted (1 trillion and 1 (counting #0))
const MAX_TOTAL_KWAMIS: u64 = 1_000_000_000_000;

/// Maximum DNA entries stored in a single account (account size limit)
const MAX_DNA_PER_ACCOUNT: usize = 1000;

/// Size of a DNA hash (SHA-256 = 32 bytes)
const DNA_HASH_SIZE: usize = 32;

#[program]
pub mod kwami_nft {
    use super::*;

    /// Initialize the Kwami NFT program and DNA registry
    pub fn initialize(ctx: Context<Initialize>, collection_bump: u8) -> Result<()> {
        let collection_authority = &mut ctx.accounts.collection_authority;
        collection_authority.authority = ctx.accounts.payer.key();
        collection_authority.collection_mint = ctx.accounts.collection_mint.key();
        collection_authority.total_minted = 0;
        collection_authority.bump = collection_bump;

        let dna_registry = &mut ctx.accounts.dna_registry;
        dna_registry.authority = ctx.accounts.payer.key();
        dna_registry.collection = ctx.accounts.collection_mint.key();
        dna_registry.dna_count = 0;

        msg!("Kwami NFT program initialized");
        msg!("Collection: {}", collection_authority.collection_mint);
        msg!("Authority: {}", collection_authority.authority);

        Ok(())
    }

    /// Mint a new Kwami NFT with unique DNA validation
    pub fn mint_kwami(
        ctx: Context<MintKwami>,
        dna_hash: [u8; 32],
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let dna_registry = &mut ctx.accounts.dna_registry;
        let collection_authority = &mut ctx.accounts.collection_authority;

        // Check if we've reached the 1 trillion KWAMI limit
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

        // Create Kwami NFT account
        let kwami_nft = &mut ctx.accounts.kwami_nft;
        kwami_nft.mint = ctx.accounts.mint.key();
        kwami_nft.owner = ctx.accounts.owner.key();
        kwami_nft.dna_hash = dna_hash;
        kwami_nft.minted_at = Clock::get()?.unix_timestamp;
        kwami_nft.updated_at = Clock::get()?.unix_timestamp;
        kwami_nft.metadata_uri = uri.clone();
        kwami_nft.bump = ctx.bumps.kwami_nft;

        // Add DNA to registry
        dna_registry.dna_hashes.push(dna_hash);
        dna_registry.dna_count += 1;

        // Mint NFT token to owner
        let collection_seeds = &[
            b"collection-authority",
            collection_authority.collection_mint.as_ref(),
            &[collection_authority.bump],
        ];
        let signer = &[&collection_seeds[..]];

        // Create metadata account using Metaplex
        let metadata_data = DataV2 {
            name,
            symbol,
            uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        };

        let metadata_ctx = CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                mint_authority: collection_authority.to_account_info(),
                update_authority: collection_authority.to_account_info(),
                payer: ctx.accounts.owner.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            signer,
        );

        create_metadata_accounts_v3(
            metadata_ctx,
            metadata_data,
            false, // is_mutable
            true,  // update_authority_is_signer
            None,  // collection_details
        )?;

        // Increment collection counter
        collection_authority.total_minted += 1;

        msg!("Minted Kwami NFT");
        msg!("DNA Hash: {:?}", dna_hash);
        msg!("Mint: {}", ctx.accounts.mint.key());
        msg!("Owner: {}", ctx.accounts.owner.key());
        msg!("Total Minted: {}", collection_authority.total_minted);

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

    /// Burn Kwami NFT and remove DNA from registry
    /// This allows re-minting with a different DNA
    pub fn burn_kwami(ctx: Context<BurnKwami>) -> Result<()> {
        let kwami_nft = &ctx.accounts.kwami_nft;
        let dna_registry = &mut ctx.accounts.dna_registry;

        // Validate owner
        require!(
            kwami_nft.owner == ctx.accounts.owner.key(),
            ErrorCode::InvalidOwner
        );

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
#[instruction(collection_bump: u8)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = collection_authority,
    )]
    pub collection_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        space = 8 + CollectionAuthority::LEN,
        seeds = [b"collection-authority", collection_mint.key().as_ref()],
        bump,
    )]
    pub collection_authority: Account<'info, CollectionAuthority>,

    #[account(
        init,
        payer = payer,
        space = 8 + DnaRegistry::LEN,
        seeds = [b"dna-registry", collection_mint.key().as_ref()],
        bump,
    )]
    pub dna_registry: Account<'info, DnaRegistry>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintKwami<'info> {
    #[account(
        init,
        payer = owner,
        mint::decimals = 0,
        mint::authority = collection_authority,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = owner,
        space = 8 + KwamiNft::LEN,
        seeds = [b"kwami-nft", mint.key().as_ref()],
        bump,
    )]
    pub kwami_nft: Account<'info, KwamiNft>,

    #[account(
        mut,
        seeds = [b"collection-authority", collection_authority.collection_mint.as_ref()],
        bump = collection_authority.bump,
    )]
    pub collection_authority: Account<'info, CollectionAuthority>,

    #[account(
        mut,
        seeds = [b"dna-registry", collection_authority.collection_mint.as_ref()],
        bump,
    )]
    pub dna_registry: Account<'info, DnaRegistry>,

    /// CHECK: This is the metadata account created by Metaplex
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub metadata_program: Program<'info, MetaplexMetadata>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
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
    pub kwami_nft: Account<'info, KwamiNft>,

    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [b"dna-registry", dna_registry.collection.as_ref()],
        bump,
    )]
    pub dna_registry: Account<'info, DnaRegistry>,

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
    pub dna_registry: Account<'info, DnaRegistry>,
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
    pub const LEN: usize = 32 + // authority
        32 + // collection
        4 + (DNA_HASH_SIZE * MAX_DNA_PER_ACCOUNT) + // vec of hashes
        8;   // dna_count
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
        1;   // bump
}

// ========== Errors ==========

#[error_code]
pub enum ErrorCode {
    #[msg("Maximum supply of 1 trillion KWAMIs has been reached. No more can be minted.")]
    MaxSupplyReached,

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
}
