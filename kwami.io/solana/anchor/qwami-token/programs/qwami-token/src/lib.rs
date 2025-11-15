use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo, Burn};

declare_id!("11111111111111111111111111111111"); // Will be updated after deployment

/// Maximum supply: 1 trillion tokens (with 9 decimals)
const MAX_SUPPLY: u64 = 1_000_000_000_000_000_000_000; // 1e21 (1 trillion * 10^9)

/// Base price in USD cents (1 cent = 0.01 USD)
const BASE_PRICE_USD_CENTS: u64 = 1;

#[program]
pub mod qwami_token {
    use super::*;

    /// Initialize the QWAMI token and authority
    pub fn initialize(ctx: Context<Initialize>, authority_bump: u8) -> Result<()> {
        let token_authority = &mut ctx.accounts.token_authority;
        token_authority.authority = ctx.accounts.payer.key();
        token_authority.mint = ctx.accounts.mint.key();
        token_authority.total_minted = 0;
        token_authority.total_burned = 0;
        token_authority.base_price_usd_cents = BASE_PRICE_USD_CENTS;
        token_authority.bump = authority_bump;

        msg!("QWAMI Token initialized");
        msg!("Authority: {}", token_authority.authority);
        msg!("Mint: {}", token_authority.mint);
        msg!("Max Supply: {} tokens", MAX_SUPPLY / 10u64.pow(9));

        Ok(())
    }

    /// Mint new QWAMI tokens (authority only)
    pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
        let token_authority = &mut ctx.accounts.token_authority;

        // Calculate current circulating supply
        let circulating_supply = token_authority.total_minted
            .checked_sub(token_authority.total_burned)
            .ok_or(ErrorCode::MathOverflow)?;

        // Check if minting would exceed max supply
        let new_supply = circulating_supply
            .checked_add(amount)
            .ok_or(ErrorCode::MathOverflow)?;

        require!(
            new_supply <= MAX_SUPPLY,
            ErrorCode::MaxSupplyExceeded
        );

        // Mint tokens
        let seeds = &[
            b"token-authority",
            token_authority.mint.as_ref(),
            &[token_authority.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.destination.to_account_info(),
            authority: token_authority.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

        token::mint_to(cpi_ctx, amount)?;

        // Update total minted
        token_authority.total_minted = token_authority.total_minted
            .checked_add(amount)
            .ok_or(ErrorCode::MathOverflow)?;

        msg!("Minted {} QWAMI tokens", amount);
        msg!("New circulating supply: {}", new_supply);
        msg!("Total minted: {}", token_authority.total_minted);

        Ok(())
    }

    /// Burn QWAMI tokens
    pub fn burn_tokens(ctx: Context<BurnTokens>, amount: u64) -> Result<()> {
        let token_authority = &mut ctx.accounts.token_authority;

        // Burn tokens
        let cpi_accounts = Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.source.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::burn(cpi_ctx, amount)?;

        // Update total burned
        token_authority.total_burned = token_authority.total_burned
            .checked_add(amount)
            .ok_or(ErrorCode::MathOverflow)?;

        let circulating_supply = token_authority.total_minted
            .checked_sub(token_authority.total_burned)
            .ok_or(ErrorCode::MathOverflow)?;

        msg!("Burned {} QWAMI tokens", amount);
        msg!("New circulating supply: {}", circulating_supply);
        msg!("Total burned: {}", token_authority.total_burned);

        Ok(())
    }

    /// Update base price (authority only)
    pub fn update_base_price(ctx: Context<UpdateBasePrice>, new_price_usd_cents: u64) -> Result<()> {
        let token_authority = &mut ctx.accounts.token_authority;

        require!(
            new_price_usd_cents > 0,
            ErrorCode::InvalidPrice
        );

        token_authority.base_price_usd_cents = new_price_usd_cents;

        msg!("Updated base price to {} USD cents", new_price_usd_cents);

        Ok(())
    }

    /// Transfer authority to a new address
    pub fn transfer_authority(ctx: Context<TransferAuthority>, new_authority: Pubkey) -> Result<()> {
        let token_authority = &mut ctx.accounts.token_authority;

        require!(
            new_authority != Pubkey::default(),
            ErrorCode::InvalidAuthority
        );

        let old_authority = token_authority.authority;
        token_authority.authority = new_authority;

        msg!("Authority transferred from {} to {}", old_authority, new_authority);

        Ok(())
    }
}

// ========== Instructions ==========

#[derive(Accounts)]
#[instruction(authority_bump: u8)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = payer,
        mint::decimals = 9,
        mint::authority = token_authority,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        space = 8 + TokenAuthority::LEN,
        seeds = [b"token-authority", mint.key().as_ref()],
        bump,
    )]
    pub token_authority: Account<'info, TokenAuthority>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [b"token-authority", mint.key().as_ref()],
        bump = token_authority.bump,
        has_one = authority,
        has_one = mint,
    )]
    pub token_authority: Account<'info, TokenAuthority>,

    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,

    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnTokens<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [b"token-authority", mint.key().as_ref()],
        bump = token_authority.bump,
        has_one = mint,
    )]
    pub token_authority: Account<'info, TokenAuthority>,

    #[account(mut)]
    pub source: Account<'info, TokenAccount>,

    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateBasePrice<'info> {
    #[account(
        mut,
        seeds = [b"token-authority", token_authority.mint.as_ref()],
        bump = token_authority.bump,
        has_one = authority,
    )]
    pub token_authority: Account<'info, TokenAuthority>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferAuthority<'info> {
    #[account(
        mut,
        seeds = [b"token-authority", token_authority.mint.as_ref()],
        bump = token_authority.bump,
        has_one = authority,
    )]
    pub token_authority: Account<'info, TokenAuthority>,

    pub authority: Signer<'info>,
}

// ========== State ==========

#[account]
pub struct TokenAuthority {
    /// The authority that can mint tokens and update settings
    pub authority: Pubkey,
    /// The mint address
    pub mint: Pubkey,
    /// Total tokens minted (including burned)
    pub total_minted: u64,
    /// Total tokens burned
    pub total_burned: u64,
    /// Base price in USD cents (1 cent = 0.01 USD)
    pub base_price_usd_cents: u64,
    /// Bump seed for PDA
    pub bump: u8,
}

impl TokenAuthority {
    pub const LEN: usize = 32 + // authority
        32 + // mint
        8 +  // total_minted
        8 +  // total_burned
        8 +  // base_price_usd_cents
        1;   // bump
}

// ========== Errors ==========

#[error_code]
pub enum ErrorCode {
    #[msg("Maximum supply of 1 trillion tokens exceeded")]
    MaxSupplyExceeded,

    #[msg("Invalid authority provided")]
    InvalidAuthority,

    #[msg("Invalid price value")]
    InvalidPrice,

    #[msg("Math operation overflow")]
    MathOverflow,
}
