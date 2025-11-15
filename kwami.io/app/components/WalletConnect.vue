<template>
  <div class="wallet-connect">
    <button
      v-if="!wallet.connected"
      @click="handleConnect"
      :disabled="wallet.connecting"
      class="btn-primary"
    >
      <span v-if="wallet.connecting">Connecting...</span>
      <span v-else>Connect Wallet</span>
    </button>
    
    <div v-else class="flex items-center space-x-4">
      <!-- Balance -->
      <div class="glass-effect px-4 py-2 rounded-lg flex items-center space-x-2">
        <svg class="w-5 h-5 text-kwami-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="font-mono font-semibold">{{ wallet.balance.toFixed(2) }} SOL</span>
      </div>
      
      <!-- Wallet Address -->
      <div class="glass-effect px-4 py-2 rounded-lg flex items-center space-x-3">
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-kwami-secondary rounded-full animate-pulse"></div>
          <span class="font-mono text-sm">{{ wallet.shortAddress }}</span>
        </div>
        
        <!-- Disconnect Button -->
        <button
          @click="handleDisconnect"
          class="text-kwami-gray-400 hover:text-white transition-colors"
          title="Disconnect"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const wallet = useWalletStore()

const handleConnect = async () => {
  try {
    await wallet.connect()
  } catch (error: any) {
    console.error('Connection error:', error)
    alert('Failed to connect wallet. Please make sure Phantom is installed.')
  }
}

const handleDisconnect = async () => {
  await wallet.disconnect()
}
</script>

<style scoped>
.btn-primary {
  @apply px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200;
  @apply bg-gradient-to-r from-kwami-primary to-kwami-secondary;
  @apply hover:shadow-lg hover:shadow-kwami-primary/50;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>

