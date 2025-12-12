import { defineStore } from 'pinia';
import { PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { useWalletStore } from '@/stores/wallet';

export interface KwamiNFT {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  image?: string;
  attributes?: any[];
  dna?: string;
}

export const useNFTStore = defineStore('nft', {
  state: () => ({
    kwamiNFTs: [] as KwamiNFT[],
    isLoading: false,
    hasVerifiedNFT: false,
    selectedNFT: null as KwamiNFT | null,
  }),
  
  getters: {
    hasKwamiNFT(): boolean {
      return this.kwamiNFTs.length > 0;
    },
    
    kwamiCount(): number {
      return this.kwamiNFTs.length;
    },
  },
  
  actions: {
    async fetchKwamiNFTs(walletPublicKey: PublicKey) {
      this.isLoading = true;
      
      try {
        const walletStore = useWalletStore();
        const connection = walletStore.initializeConnection() as any;
        
        // Initialize Metaplex
        const metaplex = Metaplex.make(connection);
        
        // Find all NFTs owned by the wallet
        const nfts = await metaplex
          .nfts()
          .findAllByOwner({ owner: walletPublicKey });
        
        // Filter for KWAMI NFTs based on collection or symbol
        const collectionAddress = import.meta.env.VITE_KWAMI_COLLECTION_ADDRESS;
        
        const kwamiNFTs: KwamiNFT[] = [];
        
        for (const nft of nfts) {
          // Load full metadata
          const fullNft = await metaplex.nfts().load({ metadata: nft as any });
          
          // Check if it's a KWAMI NFT
          const isKwami = 
            fullNft.symbol === 'KWAMI' ||
            (collectionAddress && 
             fullNft.collection?.address.toString() === collectionAddress);
          
          if (isKwami) {
            let metadata: any = {};
            
            // Fetch off-chain metadata if URI exists
            if (fullNft.uri) {
              try {
                const response = await fetch(fullNft.uri);
                metadata = await response.json();
              } catch (error) {
                console.error('Error fetching NFT metadata:', error);
              }
            }
            
            kwamiNFTs.push({
              mint: fullNft.address.toString(),
              name: fullNft.name,
              symbol: fullNft.symbol,
              uri: fullNft.uri,
              image: metadata.image,
              attributes: metadata.attributes,
              dna: metadata.dna,
            });
          }
        }
        
        this.kwamiNFTs = kwamiNFTs;
        this.hasVerifiedNFT = kwamiNFTs.length > 0;
        
        // Auto-select first NFT if available
        if (kwamiNFTs.length > 0 && !this.selectedNFT) {
          this.selectedNFT = kwamiNFTs[0] ?? null;
        }
        
      } catch (error) {
        console.error('Error fetching KWAMI NFTs:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    selectNFT(nft: KwamiNFT) {
      this.selectedNFT = nft;
    },
    
    clearNFTs() {
      this.kwamiNFTs = [];
      this.hasVerifiedNFT = false;
      this.selectedNFT = null;
    },
  },
});

