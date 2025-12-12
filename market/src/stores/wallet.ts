import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface WalletState {
  connected: boolean
  publicKey: string | null
  balance: number
}

export const useWalletStore = defineStore('wallet', () => {
  const connected = ref(false)
  const publicKey = ref<string | null>(null)
  const balance = ref(0)
  const connecting = ref(false)

  const isConnected = computed(() => connected.value && publicKey.value !== null)
  const shortAddress = computed(() => {
    if (!publicKey.value) return ''
    return `${publicKey.value.slice(0, 4)}...${publicKey.value.slice(-4)}`
  })

  function setWallet(pubKey: string | null, bal: number = 0) {
    publicKey.value = pubKey
    connected.value = pubKey !== null
    balance.value = bal
  }

  function setBalance(bal: number) {
    balance.value = bal
  }

  function setConnecting(state: boolean) {
    connecting.value = state
  }

  function disconnect() {
    publicKey.value = null
    connected.value = false
    balance.value = 0
  }

  return {
    connected,
    publicKey,
    balance,
    connecting,
    isConnected,
    shortAddress,
    setWallet,
    setBalance,
    setConnecting,
    disconnect,
  }
})

