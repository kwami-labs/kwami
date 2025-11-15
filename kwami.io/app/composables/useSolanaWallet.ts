import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import type { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

export const useSolanaWallet = () => {
  const config = useRuntimeConfig()
  
  // Get network and RPC URL from config
  const network = (config.public.solanaNetwork || 'devnet') as WalletAdapterNetwork
  const rpcUrl = config.public.solanaRpcUrl || clusterApiUrl(network)
  
  // Create connection
  const connection = ref(new Connection(rpcUrl, 'confirmed'))
  
  // Wallet state
  const wallet = ref<any>(null)
  const publicKey = ref<PublicKey | null>(null)
  const connected = ref(false)
  const connecting = ref(false)
  
  // Connect to Phantom wallet
  const connectPhantom = async () => {
    try {
      connecting.value = true
      
      // Check if Phantom is installed
      const { solana } = window as any
      
      if (!solana?.isPhantom) {
        window.open('https://phantom.app/', '_blank')
        throw new Error('Phantom wallet not installed')
      }
      
      // Connect
      const response = await solana.connect()
      wallet.value = solana
      publicKey.value = new PublicKey(response.publicKey.toString())
      connected.value = true
      
      // Listen for account changes
      solana.on('accountChanged', (pubkey: any) => {
        if (pubkey) {
          publicKey.value = new PublicKey(pubkey.toString())
        } else {
          disconnect()
        }
      })
      
      // Listen for disconnection
      solana.on('disconnect', () => {
        disconnect()
      })
      
      return publicKey.value
    } catch (error) {
      console.error('Error connecting to Phantom:', error)
      throw error
    } finally {
      connecting.value = false
    }
  }
  
  // Disconnect wallet
  const disconnect = async () => {
    try {
      if (wallet.value) {
        await wallet.value.disconnect()
      }
    } catch (error) {
      console.error('Error disconnecting:', error)
    } finally {
      wallet.value = null
      publicKey.value = null
      connected.value = false
    }
  }
  
  // Get SOL balance
  const getBalance = async (): Promise<number> => {
    if (!publicKey.value) return 0
    
    try {
      const balance = await connection.value.getBalance(publicKey.value)
      return balance / 1e9 // Convert lamports to SOL
    } catch (error) {
      console.error('Error getting balance:', error)
      return 0
    }
  }
  
  // Request airdrop (devnet only)
  const requestAirdrop = async (amount: number = 1): Promise<string> => {
    if (!publicKey.value) {
      throw new Error('Wallet not connected')
    }
    
    if (network !== 'devnet') {
      throw new Error('Airdrop only available on devnet')
    }
    
    try {
      const signature = await connection.value.requestAirdrop(
        publicKey.value,
        amount * 1e9 // Convert SOL to lamports
      )
      
      await connection.value.confirmTransaction(signature)
      return signature
    } catch (error) {
      console.error('Error requesting airdrop:', error)
      throw error
    }
  }
  
  return {
    connection,
    wallet,
    publicKey,
    connected,
    connecting,
    network,
    rpcUrl,
    connectPhantom,
    disconnect,
    getBalance,
    requestAirdrop,
  }
}

