import { ref, computed } from 'vue'
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useRuntimeConfig } from '#app'

export const useSolana = () => {
  const config = useRuntimeConfig()
  const connecting = ref(false)
  const error = ref<string | null>(null)

  const network = computed(() => config.public.solanaNetwork as 'devnet' | 'mainnet-beta' | 'testnet')
  const rpcUrl = computed(() => config.public.solanaRpcUrl as string)

  /**
   * Get Solana connection
   */
  const getConnection = () => {
    return new Connection(rpcUrl.value, 'confirmed')
  }

  /**
   * Get SOL balance for a public key
   */
  const getBalance = async (publicKey: string | PublicKey): Promise<number> => {
    try {
      const connection = getConnection()
      const pubKey = typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey
      const balance = await connection.getBalance(pubKey)
      return balance / LAMPORTS_PER_SOL
    } catch (err: any) {
      console.error('Error getting balance:', err)
      error.value = err.message
      return 0
    }
  }

  /**
   * Airdrop SOL (devnet only)
   */
  const airdrop = async (publicKey: string | PublicKey, amount: number = 1): Promise<boolean> => {
    if (network.value !== 'devnet') {
      error.value = 'Airdrop only available on devnet'
      return false
    }

    try {
      const connection = getConnection()
      const pubKey = typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey
      
      const signature = await connection.requestAirdrop(
        pubKey,
        amount * LAMPORTS_PER_SOL
      )
      
      await connection.confirmTransaction(signature)
      return true
    } catch (err: any) {
      console.error('Error requesting airdrop:', err)
      error.value = err.message
      return false
    }
  }

  /**
   * Get recent blockhash
   */
  const getRecentBlockhash = async () => {
    try {
      const connection = getConnection()
      const { blockhash } = await connection.getLatestBlockhash()
      return blockhash
    } catch (err: any) {
      console.error('Error getting blockhash:', err)
      error.value = err.message
      return null
    }
  }

  /**
   * Confirm transaction
   */
  const confirmTransaction = async (signature: string): Promise<boolean> => {
    try {
      const connection = getConnection()
      const result = await connection.confirmTransaction(signature, 'confirmed')
      return !result.value.err
    } catch (err: any) {
      console.error('Error confirming transaction:', err)
      error.value = err.message
      return false
    }
  }

  /**
   * Get transaction details
   */
  const getTransaction = async (signature: string) => {
    try {
      const connection = getConnection()
      return await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0
      })
    } catch (err: any) {
      console.error('Error getting transaction:', err)
      error.value = err.message
      return null
    }
  }

  return {
    network,
    rpcUrl,
    connecting,
    error,
    getConnection,
    getBalance,
    airdrop,
    getRecentBlockhash,
    confirmTransaction,
    getTransaction,
  }
}

