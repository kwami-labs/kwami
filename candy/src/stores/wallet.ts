import { defineStore } from 'pinia'
import type { PublicKey } from '@solana/web3.js'
import { ref, computed, watch } from 'vue'
import { useSolanaWallet } from '../composables/useSolanaWallet'

export const useWalletStore = defineStore('wallet', () => {
  const publicKey = ref<PublicKey | null>(null)
  const connected = ref(false)
  const connecting = ref(false)
  const balance = ref(0)
  
  const {
    connectPhantom,
    disconnect: disconnectWallet,
    getBalance,
    connection,
    network,
  } = useSolanaWallet()
  
  // Computed
  const address = computed(() => publicKey.value?.toBase58() || '')
  const shortAddress = computed(() => {
    if (!address.value) return ''
    return `${address.value.slice(0, 4)}...${address.value.slice(-4)}`
  })
  
  // Connect wallet
  const connect = async () => {
    try {
      connecting.value = true
      const pubkey = await connectPhantom()
      publicKey.value = pubkey
      connected.value = true
      
      // Update balance
      await updateBalance()
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      throw error
    } finally {
      connecting.value = false
    }
  }
  
  // Disconnect wallet
  const disconnect = async () => {
    await disconnectWallet()
    publicKey.value = null
    connected.value = false
    balance.value = 0
  }
  
  // Update balance
  const updateBalance = async () => {
    try {
      balance.value = await getBalance()
    } catch (error) {
      console.error('Failed to update balance:', error)
    }
  }
  
  // Auto-update balance every 30 seconds when connected
  let balanceInterval: NodeJS.Timeout | null = null
  
  watch(connected, (isConnected) => {
    if (isConnected) {
      balanceInterval = setInterval(updateBalance, 30000)
    } else if (balanceInterval) {
      clearInterval(balanceInterval)
      balanceInterval = null
    }
  })
  
  return {
    publicKey,
    connected,
    connecting,
    balance,
    address,
    shortAddress,
    connection,
    network,
    connect,
    disconnect,
    updateBalance,
  }
})
