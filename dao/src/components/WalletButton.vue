<template>
  <div class="wallet-button-container">
    <WalletMultiButton :dark="true" />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { WalletMultiButton, useWallet } from 'solana-wallets-vue';
import { useAuth } from '@/composables/useAuth';

// Watch for wallet connection changes
const { publicKey, connected } = useWallet();
const { refreshData } = useAuth();

watch(connected, async (isConnected) => {
  if (isConnected && publicKey.value) {
    await refreshData();
  }
});
</script>

<style scoped>
.wallet-button-container {
  display: inline-block;
}
</style>

