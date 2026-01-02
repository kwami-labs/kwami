use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_option::COption;
use anchor_lang::system_program::{transfer as system_transfer, Transfer as SystemTransfer};
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount};

declare_id!("6CAgdgpPq8Np78LsDwREJqFPh9rM5Jh6RSS8eZ37kZuv"); // Will be updated after deployment

/// Maximum supply: 1 trillion tokens (0 decimals - integer token)
const MAX_SUPPLY: u64 = 1_000_000_000_000; // 1 trillion whole tokens

/// Base price in USD cents (1 cent = 0.01 USD)
const BASE_PRICE_USD_CENTS: u64 = 1;

#[program]
pub mod qwami_token {
    use super::*;

    /// Initialize the QWAMI token, authority, and treasury
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let token_authority = &mut ctx.accounts.token_authority;
        token_authority.authority = ctx.accounts.payer.key();
        token_authority.mint = ctx.accounts.mint.key();
        token_authority.total_minted = 0;
        token_authority.total_burned = 0;
        token_authority.base_price_usd_cents = BASE_PRICE_USD_CENTS;
        token_authority.bump = ctx.bumps.token_authority;

        // Initialize treasury
        let treasury = &mut ctx.accounts.treasury;
        treasury.authority = ctx.accounts.payer.key();
        treasury.total_sol_received = 0;
        treasury.qwami_mints_with_sol = 0;
        treasury.bump = ctx.bumps.treasury;

        msg!("QWAMI Token initialized");
        msg!("Authority: {}", token_authority.authority);
        msg!("Mint: {}", token_authority.mint);
        msg!("Max Supply: {} tokens", MAX_SUPPLY);
        msg!("Treasury: {}", treasury.key());

        Ok(())
    }

    /// Mint new QWAMI tokens (authority only)
    pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
        let token_authority = &mut ctx.accounts.token_authority;

        // Calculate current circulating supply
        let circulating_supply = token_authority
            .total_minted
            .checked_sub(token_authority.total_burned)
            .ok_or(ErrorCode::MathOverflow)?;

        // Check if minting would exceed max supply
        let new_supply = circulating_supply
            .checked_add(amount)
            .ok_or(ErrorCode::MathOverflow)?;

        require!(new_supply <= MAX_SUPPLY, ErrorCode::MaxSupplyExceeded);

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
        token_authority.total_minted = token_authority
            .total_minted
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
        token_authority.total_burned = token_authority
            .total_burned
            .checked_add(amount)
            .ok_or(ErrorCode::MathOverflow)?;

        let circulating_supply = token_authority
            .total_minted
            .checked_sub(token_authority.total_burned)
            .ok_or(ErrorCode::MathOverflow)?;

        msg!("Burned {} QWAMI tokens", amount);
        msg!("New circulating supply: {}", circulating_supply);
        msg!("Total burned: {}", token_authority.total_burned);

        Ok(())
    }

    /// Update base price (authority only)
    pub fn update_base_price(
        ctx: Context<UpdateBasePrice>,
        new_price_usd_cents: u64,
    ) -> Result<()> {
        let token_authority = &mut ctx.accounts.token_authority;

        require!(new_price_usd_cents > 0, ErrorCode::InvalidPrice);

        token_authority.base_price_usd_cents = new_price_usd_cents;

        msg!("Updated base price to {} USD cents", new_price_usd_cents);

        Ok(())
    }

    /// Transfer authority to a new address
    pub fn transfer_authority(
        ctx: Context<TransferAuthority>,
        new_authority: Pubkey,
    ) -> Result<()> {
        let token_authority = &mut ctx.accounts.token_authority;

        require!(new_authority != Pubkey::default(), ErrorCode::InvalidAuthority);

        let old_authority = token_authority.authority;
        token_authority.authority = new_authority;

        msg!("Authority transferred from {} to {}", old_authority, new_authority);

        Ok(())
    }

    /// Mint QWAMI tokens by paying with SOL (SOL-only MVP).
    /// QWAMI amount is derived from lamports at a fixed ratio:
    /// 1 SOL (1,000,000,000 lamports) = 1,000 QWAMI.
    pub fn mint_with_sol(ctx: Context<MintWithSol>, sol_lamports: u64) -> Result<()> {
        let token_authority = &mut ctx.accounts.token_authority;
        let treasury = &mut ctx.accounts.treasury;

        // Transfer SOL from user to the treasury authority wallet (master wallet).
        // This makes treasury balance visible as a normal wallet balance.
        require_keys_eq!(
            ctx.accounts.treasury_authority.key(),
            treasury.authority,
            ErrorCode::InvalidTreasuryAuthority
        );

        system_transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                SystemTransfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.treasury_authority.to_account_info(),
                },
            ),
            sol_lamports,
        )?;

        // Calculate QWAMI amount: 1 SOL = 1,000 QWAMI
        let qwami_amount = sol_lamports / 1_000_000; // 1 SOL (1B lamports) = 1,000 QWAMI

        // Check max supply
        let circulating_supply = token_authority
            .total_minted
            .checked_sub(token_authority.total_burned)
            .ok_or(ErrorCode::MathOverflow)?;

        let new_supply = circulating_supply
            .checked_add(qwami_amount)
            .ok_or(ErrorCode::MathOverflow)?;

        require!(new_supply <= MAX_SUPPLY, ErrorCode::MaxSupplyExceeded);

        // Mint QWAMI tokens to buyer
        let seeds = &[
            b"token-authority",
            token_authority.mint.as_ref(),
            &[token_authority.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.buyer_qwami_account.to_account_info(),
            authority: token_authority.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

        token::mint_to(cpi_ctx, qwami_amount)?;

        // Update accounting
        token_authority.total_minted += qwami_amount;
        treasury.total_sol_received += sol_lamports;
        treasury.qwami_mints_with_sol += 1;

        msg!("Minted {} QWAMI tokens with {} SOL", qwami_amount, sol_lamports);
        msg!("New circulating supply: {}", new_supply);

        Ok(())
    }
}

// ========== Instructions ==========

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// QWAMI mint account must be created off-chain (so this instruction stays under the SBF stack limit)
    #[account(
        mut,
        constraint = mint.decimals == 0 @ ErrorCode::InvalidMintDecimals,
        constraint = mint.mint_authority == COption::Some(token_authority.key()) @ ErrorCode::InvalidMintAuthority,
    )]
    pub mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = payer,
        space = 8 + TokenAuthority::LEN,
        seeds = [b"token-authority", mint.key().as_ref()],
        bump,
    )]
    pub token_authority: Box<Account<'info, TokenAuthority>>,

    #[account(
        init,
        payer = payer,
        space = 8 + QwamiTreasury::LEN,
        seeds = [b"qwami-treasury"],
        bump,
    )]
    pub treasury: Box<Account<'info, QwamiTreasury>>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
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

#[derive(Accounts)]
pub struct MintWithSol<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [b"token-authority", mint.key().as_ref()],
        bump = token_authority.bump,
        has_one = mint,
    )]
    pub token_authority: Account<'info, TokenAuthority>,

    #[account(
        mut,
        seeds = [b"qwami-treasury"],
        bump = treasury.bump,
    )]
    pub treasury: Account<'info, QwamiTreasury>,

    /// The wallet that receives SOL proceeds (must match `treasury.authority`).
    #[account(mut)]
    pub treasury_authority: SystemAccount<'info>,

    /// Buyer's QWAMI token account (receives minted tokens)
    #[account(mut)]
    pub buyer_qwami_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
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
        1; // bump
}

#[account]
pub struct QwamiTreasury {
    /// Authority that can manage the treasury
    pub authority: Pubkey,

    /// Total SOL received from QWAMI mints
    pub total_sol_received: u64,

    /// Number of QWAMI mints with SOL
    pub qwami_mints_with_sol: u64,

    /// Bump seed
    pub bump: u8,
}

impl QwamiTreasury {
    pub const LEN: usize = 32 + // authority
        8 +  // total_sol_received
        8 +  // qwami_mints_with_sol
        1; // bump
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

    #[msg("Invalid mint authority")]
    InvalidMintAuthority,

    #[msg("Invalid mint decimals")]
    InvalidMintDecimals,

    #[msg("Treasury authority wallet does not match the configured authority")]
    InvalidTreasuryAuthority,
}


