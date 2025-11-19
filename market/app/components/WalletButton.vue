<template>
  <div class="relative">
    <!-- Connect Button -->
    <button
      v-if="!connected"
      @click="handleConnect"
      :disabled="connecting"
      class="btn btn-primary"
    >
      <span v-if="connecting" class="spinner mr-2"></span>
      {{ connecting ? 'Connecting...' : 'Connect Wallet' }}
    </button>

    <!-- Wallet Info -->
    <div v-else class="flex items-center space-x-2">
      <!-- Balance -->
      <div class="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg">
        <svg class="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
        </svg>
        <span class="font-medium">{{ balance.toFixed(2) }} SOL</span>
      </div>

      <!-- Address Button -->
      <button
        @click="showMenu = !showMenu"
        class="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
      >
        <div class="w-2 h-2 rounded-full bg-green-400"></div>
        <span class="font-medium">{{ shortAddress }}</span>
        <svg 
          class="w-4 h-4 transition-transform"
          :class="{ 'rotate-180': showMenu }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
    </div>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div 
        v-if="connected && showMenu"
        class="absolute right-0 mt-2 w-64 glass rounded-xl shadow-xl overflow-hidden"
      >
        <div class="p-4 border-b border-gray-700">
          <p class="text-sm text-gray-400 mb-1">Wallet Address</p>
          <div class="flex items-center justify-between">
            <p class="font-mono text-sm">{{ shortAddress }}</p>
            <button
              @click="copyAddress"
              class="p-1.5 hover:bg-gray-700 rounded"
              title="Copy address"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </button>
          </div>
          <p class="text-lg font-bold mt-2">{{ balance.toFixed(4) }} SOL</p>
        </div>

        <div class="p-2">
          <NuxtLink
            to="/my-kwamis"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            @click="showMenu = false"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span>My Profile</span>
          </NuxtLink>

          <button
            @click="handleRefresh"
            class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span>Refresh Balance</span>
          </button>

          <button
            @click="handleDisconnect"
            class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span>Disconnect</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Error Toast -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-2 opacity-0"
    >
      <div 
        v-if="error"
        class="fixed bottom-4 right-4 max-w-md bg-red-500/20 border border-red-500 rounded-lg p-4 shadow-xl"
      >
        <div class="flex items-start space-x-3">
          <svg class="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div class="flex-1">
            <p class="text-sm text-red-300">{{ error }}</p>
          </div>
          <button
            @click="error = null"
            class="text-red-400 hover:text-red-300"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWallet } from '~/composables/useWallet'
import { useWalletStore } from '~/stores/wallet'

const walletStore = useWalletStore()
const { connect, disconnect, refreshBalance, error: walletError } = useWallet()

const showMenu = ref(false)
const error = ref<string | null>(null)

const connected = computed(() => walletStore.connected)
const shortAddress = computed(() => walletStore.shortAddress)
const balance = computed(() => walletStore.balance)
const connecting = computed(() => walletStore.connecting)

const handleConnect = async () => {
  const success = await connect()
  if (!success && walletError.value) {
    error.value = walletError.value
    setTimeout(() => {
      error.value = null
    }, 5000)
  }
}

const handleDisconnect = async () => {
  await disconnect()
  showMenu.value = false
}

const handleRefresh = async () => {
  await refreshBalance()
}

const copyAddress = async () => {
  if (walletStore.publicKey) {
    await navigator.clipboard.writeText(walletStore.publicKey)
    // Could add a toast notification here
  }
}

// Close menu when clicking outside
if (process.client) {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      showMenu.value = false
    }
  })
}
</script>

