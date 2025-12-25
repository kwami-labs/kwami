use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("DAO11111111111111111111111111111111111111111");

#[program]
pub mod kwami_dao {
    use super::*;

    /// Initialize the DAO governance system
    pub fn initialize(ctx: Context<Initialize>, governance_config: GovernanceConfig) -> Result<()> {
        let dao_state = &mut ctx.accounts.dao_state;
        
        dao_state.authority = ctx.accounts.authority.key();
        dao_state.qwami_mint = ctx.accounts.qwami_mint.key();
        dao_state.kwami_collection = governance_config.kwami_collection;
        dao_state.treasury_wallet = governance_config.treasury_wallet;
        dao_state.qwami_token_authority = governance_config.qwami_token_authority;
        dao_state.kwami_collection_authority = governance_config.kwami_collection_authority;
        dao_state.proposal_count = 0;
        dao_state.governance_config = governance_config;
        dao_state.bump = ctx.bumps.dao_state;
        
        msg!("DAO initialized with authority: {}", dao_state.authority);
        Ok(())
    }

    /// Create a new governance proposal
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        execution_delay_seconds: i64,
        voting_period_seconds: i64,
    ) -> Result<()> {
        require!(title.len() <= 100, DaoError::TitleTooLong);
        require!(description.len() <= 2000, DaoError::DescriptionTooLong);
        require!(voting_period_seconds >= 86400, DaoError::VotingPeriodTooShort); // Min 1 day
        require!(voting_period_seconds <= 1_209_600, DaoError::VotingPeriodTooLong); // Max 14 days
        
        let dao_state = &mut ctx.accounts.dao_state;
        let proposal = &mut ctx.accounts.proposal;
        
        // Check minimum QWAMI balance
        let min_qwami = dao_state.governance_config.min_qwami_to_propose;
        require!(
            ctx.accounts.proposer_qwami_account.amount >= min_qwami,
            DaoError::InsufficientQwami
        );
        
        // Set proposal data
        proposal.proposal_id = dao_state.proposal_count;
        proposal.proposer = ctx.accounts.proposer.key();
        proposal.title = title;
        proposal.description = description;
        proposal.status = ProposalStatus::Active;
        proposal.created_at = Clock::get()?.unix_timestamp;
        proposal.voting_ends_at = Clock::get()?.unix_timestamp + voting_period_seconds;
        proposal.execution_delay_seconds = execution_delay_seconds;
        proposal.votes_for = 0;
        proposal.votes_against = 0;
        proposal.votes_abstain = 0;
        proposal.total_votes = 0;
        proposal.executed = false;
        proposal.cancelled = false;
        proposal.bump = ctx.bumps.proposal;
        
        dao_state.proposal_count += 1;
        
        msg!("Proposal #{} created: {}", proposal.proposal_id, proposal.title);
        Ok(())
    }

    /// Cast a vote on a proposal
    pub fn vote(
        ctx: Context<Vote>,
        vote_type: VoteType,
        qwami_amount: u64,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let vote_record = &mut ctx.accounts.vote_record;
        let clock = Clock::get()?;
        
        // Check proposal is active
        require!(
            proposal.status == ProposalStatus::Active,
            DaoError::ProposalNotActive
        );
        
        // Check voting period hasn't ended
        require!(
            clock.unix_timestamp < proposal.voting_ends_at,
            DaoError::VotingPeriodEnded
        );
        
        // Check voter has enough QWAMI
        require!(
            ctx.accounts.voter_qwami_account.amount >= qwami_amount,
            DaoError::InsufficientQwami
        );
        
        // Check voter hasn't already voted
        require!(
            vote_record.qwami_amount == 0,
            DaoError::AlreadyVoted
        );
        
        // Lock tokens in a per-vote vault (escrow) so voting is economically meaningful.
        // Tokens can be withdrawn after voting ends via `withdraw_vote`.
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.voter_qwami_account.to_account_info(),
                to: ctx.accounts.vote_vault.to_account_info(),
                authority: ctx.accounts.voter.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, qwami_amount)?;

        // Record the vote
        vote_record.proposal_id = proposal.proposal_id;
        vote_record.voter = ctx.accounts.voter.key();
        vote_record.vote_type = vote_type.clone();
        vote_record.qwami_amount = qwami_amount;
        vote_record.voted_at = clock.unix_timestamp;
        vote_record.withdrawn = false;
        vote_record.bump = ctx.bumps.vote_record;
        
        // Update proposal vote counts
        match vote_type {
            VoteType::For => proposal.votes_for += qwami_amount,
            VoteType::Against => proposal.votes_against += qwami_amount,
            VoteType::Abstain => proposal.votes_abstain += qwami_amount,
        }
        proposal.total_votes += qwami_amount;
        
        msg!(
            "Vote cast on proposal #{}: {:?} with {} QWAMI",
            proposal.proposal_id,
            vote_type,
            qwami_amount
        );
        Ok(())
    }

    /// Finalize a proposal after voting period ends
    pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let dao_state = &ctx.accounts.dao_state;
        let clock = Clock::get()?;
        
        // Check voting period has ended
        require!(
            clock.unix_timestamp >= proposal.voting_ends_at,
            DaoError::VotingPeriodNotEnded
        );
        
        // Check proposal is still active
        require!(
            proposal.status == ProposalStatus::Active,
            DaoError::ProposalNotActive
        );
        
        // Check if quorum was met
        let quorum = dao_state.governance_config.quorum;
        let quorum_met = proposal.total_votes >= quorum;
        
        // Determine outcome
        if quorum_met {
            if proposal.votes_for > proposal.votes_against {
                proposal.status = ProposalStatus::Passed;
                proposal.execution_available_at = clock.unix_timestamp + proposal.execution_delay_seconds;
                msg!("Proposal #{} PASSED", proposal.proposal_id);
            } else {
                proposal.status = ProposalStatus::Rejected;
                msg!("Proposal #{} REJECTED", proposal.proposal_id);
            }
        } else {
            proposal.status = ProposalStatus::QuorumNotMet;
            msg!("Proposal #{} failed to meet quorum", proposal.proposal_id);
        }
        
        Ok(())
    }

    /// Cancel a proposal (only by proposer or authority)
    pub fn cancel_proposal(ctx: Context<CancelProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let dao_state = &ctx.accounts.dao_state;
        
        // Check caller is proposer or authority
        let caller = ctx.accounts.caller.key();
        require!(
            caller == proposal.proposer || caller == dao_state.authority,
            DaoError::Unauthorized
        );
        
        // Check proposal is still active
        require!(
            proposal.status == ProposalStatus::Active,
            DaoError::ProposalNotActive
        );
        
        proposal.status = ProposalStatus::Cancelled;
        proposal.cancelled = true;
        
        msg!("Proposal #{} cancelled", proposal.proposal_id);
        Ok(())
    }

    /// Update governance configuration (authority only)
    pub fn update_config(
        ctx: Context<UpdateConfig>,
        new_config: GovernanceConfig,
    ) -> Result<()> {
        let dao_state = &mut ctx.accounts.dao_state;
        dao_state.governance_config = new_config;
        
        msg!("Governance config updated");
        Ok(())
    }

    /// Withdraw locked voting tokens after the voting period ends (or proposal is no longer active).
    pub fn withdraw_vote(ctx: Context<WithdrawVote>) -> Result<()> {
        let proposal = &ctx.accounts.proposal;
        let vote_record = &mut ctx.accounts.vote_record;
        let clock = Clock::get()?;

        require!(!vote_record.withdrawn, DaoError::AlreadyWithdrawn);
        require!(vote_record.qwami_amount > 0, DaoError::NothingToWithdraw);

        // Allow withdrawal after voting ends or if proposal is finalized/cancelled.
        let voting_ended = clock.unix_timestamp >= proposal.voting_ends_at;
        let not_active = proposal.status != ProposalStatus::Active;
        require!(voting_ended || not_active, DaoError::VotingStillActive);

        let amount = vote_record.qwami_amount;

        // Transfer from vault back to voter ATA, signed by dao_state PDA.
        let dao_seeds: &[&[u8]] = &[b"dao-state", &[ctx.accounts.dao_state.bump]];
        let signer = &[dao_seeds];
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vote_vault.to_account_info(),
                to: ctx.accounts.voter_qwami_account.to_account_info(),
                authority: ctx.accounts.dao_state.to_account_info(),
            },
            signer,
        );
        token::transfer(transfer_ctx, amount)?;

        vote_record.withdrawn = true;
        vote_record.qwami_amount = 0;

        msg!("Vote tokens withdrawn");
        Ok(())
    }
}

// ========== ACCOUNTS ==========

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + DaoState::INIT_SPACE,
        seeds = [b"dao-state"],
        bump
    )]
    pub dao_state: Account<'info, DaoState>,
    
    /// CHECK: QWAMI token mint address
    pub qwami_mint: AccountInfo<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(
        mut,
        seeds = [b"dao-state"],
        bump = dao_state.bump
    )]
    pub dao_state: Account<'info, DaoState>,
    
    #[account(
        init,
        payer = proposer,
        space = 8 + Proposal::INIT_SPACE,
        seeds = [b"proposal", dao_state.proposal_count.to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(
        constraint = proposer_qwami_account.owner == proposer.key(),
        constraint = proposer_qwami_account.mint == dao_state.qwami_mint
    )]
    pub proposer_qwami_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub proposer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(vote_type: VoteType, qwami_amount: u64)]
pub struct Vote<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(
        init,
        payer = voter,
        space = 8 + VoteRecord::INIT_SPACE,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,
    
    #[account(
        seeds = [b"dao-state"],
        bump = dao_state.bump
    )]
    pub dao_state: Account<'info, DaoState>,
    
    #[account(
        constraint = voter_qwami_account.owner == voter.key(),
        constraint = voter_qwami_account.mint == dao_state.qwami_mint
    )]
    pub voter_qwami_account: Account<'info, TokenAccount>,

    /// Per-vote escrow vault owned by `dao_state` PDA.
    #[account(
        init,
        payer = voter,
        token::mint = dao_state.qwami_mint,
        token::authority = dao_state,
        seeds = [b"vote-vault", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub voter: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawVote<'info> {
    #[account(
        seeds = [b"dao-state"],
        bump = dao_state.bump
    )]
    pub dao_state: Account<'info, DaoState>,

    #[account(
        seeds = [b"proposal", proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        mut,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump = vote_record.bump
    )]
    pub vote_record: Account<'info, VoteRecord>,

    #[account(
        mut,
        seeds = [b"vote-vault", proposal.key().as_ref(), voter.key().as_ref()],
        bump,
    )]
    pub vote_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = voter_qwami_account.owner == voter.key(),
        constraint = voter_qwami_account.mint == dao_state.qwami_mint
    )]
    pub voter_qwami_account: Account<'info, TokenAccount>,

    pub voter: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct FinalizeProposal<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(
        seeds = [b"dao-state"],
        bump = dao_state.bump
    )]
    pub dao_state: Account<'info, DaoState>,
}

#[derive(Accounts)]
pub struct CancelProposal<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal.proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(
        seeds = [b"dao-state"],
        bump = dao_state.bump
    )]
    pub dao_state: Account<'info, DaoState>,
    
    pub caller: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(
        mut,
        seeds = [b"dao-state"],
        bump = dao_state.bump,
        has_one = authority
    )]
    pub dao_state: Account<'info, DaoState>,
    
    pub authority: Signer<'info>,
}

// ========== STATE ==========

#[account]
#[derive(InitSpace)]
pub struct DaoState {
    pub authority: Pubkey,
    pub qwami_mint: Pubkey,
    pub kwami_collection: Pubkey,
    /// Wallet where SOL proceeds are deposited (for dashboard display).
    pub treasury_wallet: Pubkey,
    /// QWAMI TokenAuthority PDA (for minted/burned dashboard stats).
    pub qwami_token_authority: Pubkey,
    /// KWAMI CollectionAuthority PDA (for minted dashboard stats).
    pub kwami_collection_authority: Pubkey,
    pub proposal_count: u64,
    pub governance_config: GovernanceConfig,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Proposal {
    pub proposal_id: u64,
    pub proposer: Pubkey,
    #[max_len(100)]
    pub title: String,
    #[max_len(2000)]
    pub description: String,
    pub status: ProposalStatus,
    pub created_at: i64,
    pub voting_ends_at: i64,
    pub execution_delay_seconds: i64,
    pub execution_available_at: i64,
    pub votes_for: u64,
    pub votes_against: u64,
    pub votes_abstain: u64,
    pub total_votes: u64,
    pub executed: bool,
    pub cancelled: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct VoteRecord {
    pub proposal_id: u64,
    pub voter: Pubkey,
    pub vote_type: VoteType,
    pub qwami_amount: u64,
    pub voted_at: i64,
    pub withdrawn: bool,
    pub bump: u8,
}

// ========== TYPES ==========

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct GovernanceConfig {
    pub min_qwami_to_propose: u64,  // Minimum QWAMI to create proposal (e.g., 100)
    pub quorum: u64,                 // Minimum total votes for proposal to pass (e.g., 10000)
    pub max_voting_period: i64,      // Maximum voting period in seconds (e.g., 14 days)
    pub min_execution_delay: i64,    // Minimum time between passing and execution (e.g., 2 days)
    pub kwami_collection: Pubkey,    // KWAMI NFT collection address for verification
    /// Wallet where SOL proceeds are deposited (for dashboard display).
    pub treasury_wallet: Pubkey,
    /// QWAMI TokenAuthority PDA (for minted/burned dashboard stats).
    pub qwami_token_authority: Pubkey,
    /// KWAMI CollectionAuthority PDA (for minted dashboard stats).
    pub kwami_collection_authority: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum ProposalStatus {
    Active,
    Passed,
    Rejected,
    QuorumNotMet,
    Cancelled,
    Executed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq, InitSpace)]
pub enum VoteType {
    For,
    Against,
    Abstain,
}

// ========== ERRORS ==========

#[error_code]
pub enum DaoError {
    #[msg("Title must be 100 characters or less")]
    TitleTooLong,
    
    #[msg("Description must be 2000 characters or less")]
    DescriptionTooLong,
    
    #[msg("Voting period must be at least 1 day")]
    VotingPeriodTooShort,
    
    #[msg("Voting period cannot exceed 14 days")]
    VotingPeriodTooLong,
    
    #[msg("Insufficient QWAMI tokens")]
    InsufficientQwami,
    
    #[msg("Proposal is not active")]
    ProposalNotActive,
    
    #[msg("Voting period has ended")]
    VotingPeriodEnded,
    
    #[msg("Voting period has not ended yet")]
    VotingPeriodNotEnded,
    
    #[msg("Already voted on this proposal")]
    AlreadyVoted,
    
    #[msg("Unauthorized")]
    Unauthorized,
    
    #[msg("Proposal execution not available yet")]
    ExecutionNotAvailable,
    
    #[msg("Proposal has already been executed")]
    AlreadyExecuted,

    #[msg("Vote tokens are still locked because voting is still active")]
    VotingStillActive,

    #[msg("Vote tokens already withdrawn")]
    AlreadyWithdrawn,

    #[msg("Nothing to withdraw")]
    NothingToWithdraw,
}

