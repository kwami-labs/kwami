import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useSolanaWallet } from '../composables/useSolanaWallet'

export const useWalletStore = defineStore('wallet', () => {
  const balance = ref(0)

  const {
    wallet,
    publicKey,
    connected,
    connecting,
    getBalance,
    connection,
    network,

    walletOptions,
    selectedWalletName,
    setSelectedWalletName,

    connect: connectWallet,
    disconnect: disconnectWallet,
  } = useSolanaWallet()

  const address = computed(() => publicKey.value?.toBase58() || '')
  const shortAddress = computed(() => {
    if (!address.value) return ''
    return `${address.value.slice(0, 4)}...${address.value.slice(-4)}`
  })

  const connect = async () => {
    await connectWallet()
    await updateBalance()
  }

  const disconnect = async () => {
    await disconnectWallet()
    balance.value = 0
  }

  const updateBalance = async () => {
    try {
      balance.value = await getBalance()
    } catch (error) {
      console.error('Failed to update balance:', error)
    }
  }

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
    wallet,
    publicKey,
    connected,
    connecting,
    balance,
    address,
    shortAddress,
    connection,
    network,

    walletOptions,
    selectedWalletName,
    setSelectedWalletName,

    connect,
    disconnect,
    updateBalance,
  }
})
