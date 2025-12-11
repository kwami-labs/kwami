<template>
  <div>
    <UButton
      v-if="!wallet.connected"
      size="lg"
      color="primary"
      :loading="wallet.connecting"
      @click="handleConnect"
    >
      {{ wallet.connecting ? 'Connecting...' : 'Connect Wallet' }}
    </UButton>
    
    <div v-else class="flex items-center gap-3">
      <!-- Balance -->
      <div class="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <UIcon name="i-heroicons-currency-dollar" class="w-5 h-5 text-green-600 dark:text-green-400" />
        <span class="font-mono font-semibold text-gray-900 dark:text-white">{{ wallet.balance.toFixed(2) }} SOL</span>
      </div>
      
      <!-- Wallet Address -->
      <div class="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
          <span class="font-mono text-sm text-gray-900 dark:text-white">{{ wallet.shortAddress }}</span>
        </div>
        
        <!-- Disconnect Button -->
        <UButton
          size="xs"
          color="gray"
          variant="ghost"
          icon="i-heroicons-arrow-right-on-rectangle"
          @click="handleDisconnect"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWalletStore } from '@/stores/wallet'

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
/* Styles are handled by @nuxt/ui wrappers */
</style>
