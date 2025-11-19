import { useWallet } from 'solana-wallets-vue';
import { computed } from 'vue';

export const useAuth = () => {
  const { publicKey, connected, select, connect, disconnect, wallet } = useWallet();
  const nftStore = useNFTStore();
  const qwamiStore = useQwamiStore();
  
  const isAuthenticated = computed(() => {
    return connected.value && nftStore.hasVerifiedNFT;
  });
  
  const canParticipate = computed(() => {
    return isAuthenticated.value && qwamiStore.hasEnoughForGovernance;
  });
  
  const connectWallet = async () => {
    try {
      if (!wallet.value) {
        throw new Error('Please select a wallet first');
      }
      
      await connect();
      
      // Fetch NFTs and QWAMI balance after connecting
      if (publicKey.value) {
        await Promise.all([
          nftStore.fetchKwamiNFTs(publicKey.value),
          qwamiStore.fetchBalance(publicKey.value),
        ]);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };
  
  const disconnectWallet = async () => {
    try {
      await disconnect();
      nftStore.clearNFTs();
      qwamiStore.clearBalance();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  };
  
  const refreshData = async () => {
    if (publicKey.value) {
      await Promise.all([
        nftStore.fetchKwamiNFTs(publicKey.value),
        qwamiStore.fetchBalance(publicKey.value),
      ]);
    }
  };
  
  return {
    publicKey,
    connected,
    wallet,
    isAuthenticated,
    canParticipate,
    select,
    connectWallet,
    disconnectWallet,
    refreshData,
  };
};

