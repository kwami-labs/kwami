import { defineStore } from 'pinia';
import { PublicKey } from '@solana/web3.js';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  creator: string;
  createdAt: number;
  endTime: number;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorum: number;
  qwamiRequired: number;
}

export interface Vote {
  proposalId: string;
  voter: string;
  vote: 'for' | 'against' | 'abstain';
  qwamiAmount: number;
  timestamp: number;
}

export const useGovernanceStore = defineStore('governance', {
  state: () => ({
    proposals: [] as Proposal[],
    userVotes: [] as Vote[],
    isLoading: false,
  }),
  
  getters: {
    activeProposals(): Proposal[] {
      const now = Date.now();
      return this.proposals.filter(p => 
        p.status === 'active' && p.endTime > now
      );
    },
    
    pastProposals(): Proposal[] {
      const now = Date.now();
      return this.proposals.filter(p => 
        p.status !== 'active' || p.endTime <= now
      );
    },
    
    hasVoted: (state) => (proposalId: string) => {
      return state.userVotes.some(v => v.proposalId === proposalId);
    },
    
    getUserVote: (state) => (proposalId: string) => {
      return state.userVotes.find(v => v.proposalId === proposalId);
    },
  },
  
  actions: {
    async fetchProposals() {
      this.isLoading = true;
      
      try {
        // TODO: Replace with actual on-chain data fetching
        // For now, using mock data
        this.proposals = [
          {
            id: '1',
            title: 'Allocate 100,000 QWAMI for Community Events',
            description: 'Proposal to allocate 100,000 QWAMI tokens from the treasury to fund community events and hackathons over the next quarter.',
            creator: 'KWAMi...abc123',
            createdAt: Date.now() - 86400000 * 2, // 2 days ago
            endTime: Date.now() + 86400000 * 5, // 5 days from now
            status: 'active',
            votesFor: 15000,
            votesAgainst: 3000,
            votesAbstain: 1000,
            quorum: 10000,
            qwamiRequired: 100,
          },
          {
            id: '2',
            title: 'Update KWAMI Minting Fee Structure',
            description: 'Proposal to reduce the QWAMI cost for minting new KWAMI NFTs from 1000 QWAMI to 500 QWAMI to increase adoption.',
            creator: 'KWAMi...def456',
            createdAt: Date.now() - 86400000 * 1, // 1 day ago
            endTime: Date.now() + 86400000 * 6, // 6 days from now
            status: 'active',
            votesFor: 8000,
            votesAgainst: 5000,
            votesAbstain: 500,
            quorum: 10000,
            qwamiRequired: 100,
          },
        ];
      } catch (error) {
        console.error('Error fetching proposals:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async createProposal(
      title: string,
      description: string,
      qwamiAmount: number
    ) {
      this.isLoading = true;
      
      try {
        // TODO: Implement on-chain proposal creation
        console.log('Creating proposal:', { title, description, qwamiAmount });
        
        // Mock implementation
        const newProposal: Proposal = {
          id: Date.now().toString(),
          title,
          description,
          creator: 'Current User',
          createdAt: Date.now(),
          endTime: Date.now() + 86400000 * 7, // 7 days
          status: 'active',
          votesFor: 0,
          votesAgainst: 0,
          votesAbstain: 0,
          quorum: 10000,
          qwamiRequired: 100,
        };
        
        this.proposals.unshift(newProposal);
        return newProposal;
      } catch (error) {
        console.error('Error creating proposal:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async vote(
      proposalId: string,
      voteType: 'for' | 'against' | 'abstain',
      qwamiAmount: number,
      walletPublicKey: PublicKey
    ) {
      this.isLoading = true;
      
      try {
        // TODO: Implement on-chain voting
        console.log('Voting:', { proposalId, voteType, qwamiAmount });
        
        // Mock implementation
        const vote: Vote = {
          proposalId,
          voter: walletPublicKey.toString(),
          vote: voteType,
          qwamiAmount,
          timestamp: Date.now(),
        };
        
        this.userVotes.push(vote);
        
        // Update proposal vote counts
        const proposal = this.proposals.find(p => p.id === proposalId);
        if (proposal) {
          if (voteType === 'for') {
            proposal.votesFor += qwamiAmount;
          } else if (voteType === 'against') {
            proposal.votesAgainst += qwamiAmount;
          } else {
            proposal.votesAbstain += qwamiAmount;
          }
        }
        
        return vote;
      } catch (error) {
        console.error('Error voting:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});

