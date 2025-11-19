import { defineStore } from 'pinia';
import { Connection, PublicKey } from '@solana/web3.js';
import type { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    connection: null as Connection | null,
    isConnecting: false,
    error: null as string | null,
  }),
  
  getters: {
    isConnected(): boolean {
      return this.connection !== null;
    },
    
    network(): WalletAdapterNetwork {
      const config = useRuntimeConfig();
      return (config.public.solanaNetwork || 'devnet') as WalletAdapterNetwork;
    },
    
    rpcUrl(): string {
      const config = useRuntimeConfig();
      return config.public.solanaRpcUrl || 'https://api.devnet.solana.com';
    },
  },
  
  actions: {
    initializeConnection() {
      if (!this.connection) {
        this.connection = new Connection(this.rpcUrl, 'confirmed');
      }
      return this.connection;
    },
    
    async getBalance(publicKey: PublicKey): Promise<number> {
      if (!this.connection) {
        this.initializeConnection();
      }
      
      try {
        const balance = await this.connection!.getBalance(publicKey);
        return balance / 1e9; // Convert lamports to SOL
      } catch (error) {
        console.error('Error getting balance:', error);
        throw error;
      }
    },
    
    setError(error: string | null) {
      this.error = error;
    },
    
    clearError() {
      this.error = null;
    },
  },
});

