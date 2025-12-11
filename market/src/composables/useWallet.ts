import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import { useSolana } from './useSolana'

// This is a simplified wallet composable
// In production, you'd use @solana/wallet-adapter-vue
export const useWallet = () => {
  const walletStore = useWalletStore()
  const { getBalance } = useSolana()
  
  const wallet = ref<any>(null)
  const error = ref<string | null>(null)

  const connected = computed(() => walletStore.connected)
  const publicKey = computed(() => walletStore.publicKey)
  const connecting = computed(() => walletStore.connecting)

  /**
   * Connect wallet (Phantom)
   */
  const connect = async () => {
    try {
      walletStore.setConnecting(true)
      error.value = null

      // Check if Phantom is installed
      const phantom = (window as any).solana
      if (!phantom?.isPhantom) {
        error.value = 'Phantom wallet not found. Please install it from https://phantom.app'
        return false
      }

      // Connect to Phantom
      const response = await phantom.connect()
      const pubKey = response.publicKey.toString()
      
      // Get balance
      const balance = await getBalance(pubKey)
      
      // Update store
      walletStore.setWallet(pubKey, balance)
      wallet.value = phantom

      return true
    } catch (err: any) {
      console.error('Error connecting wallet:', err)
      error.value = err.message || 'Failed to connect wallet'
      return false
    } finally {
      walletStore.setConnecting(false)
    }
  }

  /**
   * Disconnect wallet
   */
  const disconnect = async () => {
    try {
      const phantom = (window as any).solana
      if (phantom) {
        await phantom.disconnect()
      }
      walletStore.disconnect()
      wallet.value = null
    } catch (err: any) {
      console.error('Error disconnecting wallet:', err)
      error.value = err.message
    }
  }

  /**
   * Refresh balance
   */
  const refreshBalance = async () => {
    if (!publicKey.value) return
    
    try {
      const balance = await getBalance(publicKey.value)
      walletStore.setBalance(balance)
    } catch (err: any) {
      console.error('Error refreshing balance:', err)
    }
  }

  /**
   * Sign message
   */
  const signMessage = async (message: string): Promise<Uint8Array | null> => {
    try {
      const phantom = (window as any).solana
      if (!phantom) {
        throw new Error('Wallet not connected')
      }

      const encodedMessage = new TextEncoder().encode(message)
      const signedMessage = await phantom.signMessage(encodedMessage, 'utf8')
      return signedMessage.signature
    } catch (err: any) {
      console.error('Error signing message:', err)
      error.value = err.message
      return null
    }
  }

  /**
   * Listen for account changes
   */
  const handleAccountChanged = (publicKey: any) => {
    if (publicKey) {
      walletStore.setWallet(publicKey.toString())
      refreshBalance()
    } else {
      walletStore.disconnect()
    }
  }

  /**
   * Auto-connect if previously connected
   */
  const autoConnect = async () => {
    try {
      const phantom = (window as any).solana
      if (phantom?.isPhantom && phantom.isConnected) {
        const response = await phantom.connect({ onlyIfTrusted: true })
        const pubKey = response.publicKey.toString()
        const balance = await getBalance(pubKey)
        walletStore.setWallet(pubKey, balance)
        wallet.value = phantom
      }
    } catch (err) {
      // Silent fail for auto-connect
      console.debug('Auto-connect failed:', err)
    }
  }

  // Setup listeners
  onMounted(() => {
    const phantom = (window as any).solana
    if (phantom) {
      phantom.on('accountChanged', handleAccountChanged)
      autoConnect()
    }
  })

  // Cleanup listeners
  onUnmounted(() => {
    const phantom = (window as any).solana
    if (phantom) {
      phantom.removeListener('accountChanged', handleAccountChanged)
    }
  })

  return {
    wallet,
    connected,
    publicKey,
    connecting,
    error,
    connect,
    disconnect,
    refreshBalance,
    signMessage,
  }
}
