<template>
  <div class="nft-verification">
    <div v-if="nftStore.isLoading" class="loading">
      <BaseIcon name="i-heroicons-arrow-path" class="animate-spin" />
      <p>Verifying KWAMI NFT ownership...</p>
    </div>
    
    <div v-else-if="!auth.connected.value" class="not-connected">
      <BaseIcon name="i-heroicons-wallet" class="icon" />
      <h3>Connect Your Wallet</h3>
      <p>Connect your Solana wallet to access the DAO</p>
    </div>
    
    <div v-else-if="!nftStore.hasVerifiedNFT" class="no-nft">
      <BaseIcon name="i-heroicons-x-circle" class="icon error" />
      <h3>No KWAMI NFT Found</h3>
      <p>You need to own at least one KWAMI NFT to participate in the DAO.</p>
      <BaseButton
        href="https://kwami.io"
        target="_blank"
        color="primary"
        class="mt-4"
      >
        Mint a KWAMI NFT
      </BaseButton>
    </div>
    
    <div v-else class="verified">
      <BaseIcon name="i-heroicons-check-circle" class="icon success" />
      <h3>Verified KWAMI Holder</h3>
      <p>You own {{ nftStore.kwamiCount }} KWAMI NFT{{ nftStore.kwamiCount > 1 ? 's' : '' }}</p>
      
      <div v-if="nftStore.selectedNFT" class="selected-nft">
        <img
          v-if="nftStore.selectedNFT.image"
          :src="nftStore.selectedNFT.image"
          :alt="nftStore.selectedNFT.name"
          class="nft-image"
        />
        <div class="nft-info">
          <h4>{{ nftStore.selectedNFT.name }}</h4>
          <p class="nft-mint">{{ truncateAddress(nftStore.selectedNFT.mint) }}</p>
        </div>
      </div>
      
      <div v-if="nftStore.kwamiCount > 1" class="select-nft">
        <select
          v-model="selectedNFTMint"
          @change="handleNFTSelect"
          class="nft-select"
        >
          <option v-for="nft in nftStore.kwamiNFTs" :key="nft.mint" :value="nft.mint">
            {{ nft.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useNFTStore } from '@/stores/nft';
import BaseIcon from '@/components/BaseIcon.vue';
import BaseButton from '@/components/BaseButton.vue';

const auth = useAuth();
const nftStore = useNFTStore();

const selectedNFTMint = ref(nftStore.selectedNFT?.mint || '');

const handleNFTSelect = () => {
  const nft = nftStore.kwamiNFTs.find(n => n.mint === selectedNFTMint.value);
  if (nft) {
    nftStore.selectNFT(nft);
  }
};

const truncateAddress = (address: string) => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

watch(() => nftStore.selectedNFT, (nft) => {
  if (nft) {
    selectedNFTMint.value = nft.mint;
  }
});
</script>

<style scoped>
.nft-verification {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  text-align: center;
}

.loading,
.not-connected,
.no-nft,
.verified {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.icon {
  width: 4rem;
  height: 4rem;
}

.icon.success {
  color: #10b981;
}

.icon.error {
  color: #ef4444;
}

.loading .icon {
  color: #3b82f6;
}

h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.selected-nft {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0.5rem;
}

.nft-image {
  width: 80px;
  height: 80px;
  border-radius: 0.5rem;
  object-fit: cover;
}

.nft-info {
  text-align: left;
}

.nft-info h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.nft-mint {
  font-size: 0.875rem;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.5);
}

.select-nft {
  margin-top: 1rem;
  width: 100%;
  max-width: 300px;
}
</style>

