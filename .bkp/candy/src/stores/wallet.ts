import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { getWalletConnector } from 'kwami/apps/wallet'
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

  const updateBalance = async (): Promise<number> => {
    try {
      balance.value = await getBalance()
    } catch (error) {
      console.error('Failed to update balance:', error)
      balance.value = 0
    }
    return balance.value
  }

  const connect = async (walletName?: string) => {
    if (walletName) {
      setSelectedWalletName(walletName)
    }

    const pk = await connectWallet()
    await updateBalance()

    if (!pk) return null

    return {
      publicKey: pk,
      name: walletName || selectedWalletName.value,
    }
  }

  const disconnect = async (): Promise<boolean> => {
    try {
      await disconnectWallet()
      balance.value = 0
      return true
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      return false
    }
  }

  // Connector-style helpers (used by Kwami wallet UI widget)
  const detectWallets = async () => {
    // Use Kwami's connector for consistent wallet detection + install URLs.
    // (Candy still uses wallet-adapter for the actual connect/sign flow.)
    const network = (import.meta.env.VITE_SOLANA_NETWORK || 'devnet') as any
    const rpcEndpoint = import.meta.env.VITE_SOLANA_RPC_URL || undefined

    const connector = getWalletConnector({ network, rpcEndpoint })
    const wallets = await connector.detectWallets()

    return wallets.map((w) => ({
      name: w.name,
      kind: w.kind,
      installed: w.installed,
      readyState: w.readyState,
      url: w.url,
      icon: (w as any).icon,
    }))
  }

  const isWalletConnected = () => connected.value

  const getPublicKey = () => publicKey.value

  const getSolBalance = async () => {
    return await updateBalance()
  }

  const getNetwork = () => String(network)

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

    // Kwami wallet UI widget connector surface
    detectWallets,
    isWalletConnected,
    getPublicKey,
    getSolBalance,
    getNetwork,
  }
})
