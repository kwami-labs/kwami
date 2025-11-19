<template>
  <div class="wallet-button-container">
    <ClientOnly>
      <WalletMultiButton :dark="true" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { WalletMultiButton } from 'solana-wallets-vue';

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

