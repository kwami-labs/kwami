import { defineStore } from 'pinia';
import { PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';

export const useQwamiStore = defineStore('qwami', {
  state: () => ({
    balance: 0,
    isLoading: false,
    tokenAccountAddress: null as string | null,
  }),
  
  getters: {
    formattedBalance(): string {
      return this.balance.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    
    hasEnoughForGovernance(): boolean {
      return this.balance >= 100; // Minimum QWAMI to participate
    },
  },
  
  actions: {
    async fetchBalance(walletPublicKey: PublicKey) {
      this.isLoading = true;
      
      try {
        const walletStore = useWalletStore();
        const connection = walletStore.initializeConnection();
        
        const qwamiMint = import.meta.env.VITE_QWAMI_TOKEN_MINT;
        
        if (!qwamiMint) {
          console.warn('QWAMI token mint not configured');
          this.balance = 0;
          return;
        }
        
        // Get associated token account
        const tokenMintPublicKey = new PublicKey(qwamiMint);
        const tokenAccountAddress = await getAssociatedTokenAddress(
          tokenMintPublicKey,
          walletPublicKey
        );
        
        this.tokenAccountAddress = tokenAccountAddress.toString();
        
        try {
          // Get token account info
          const tokenAccount = await getAccount(connection, tokenAccountAddress);
          
          // Convert balance (accounting for decimals, typically 9 for SPL tokens)
          this.balance = Number(tokenAccount.amount) / 1e9;
        } catch (error: any) {
          // Token account doesn't exist - balance is 0
          if (error.name === 'TokenAccountNotFoundError') {
            this.balance = 0;
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error('Error fetching QWAMI balance:', error);
        this.balance = 0;
      } finally {
        this.isLoading = false;
      }
    },
    
    clearBalance() {
      this.balance = 0;
      this.tokenAccountAddress = null;
    },
  },
});

