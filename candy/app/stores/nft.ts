import { defineStore } from 'pinia'
import type { PublicKey } from '@solana/web3.js'
import { uploadImageToArweave, uploadMetadataToArweave, configToAttributes } from '~/utils/arweaveUpload'
import { checkDnaExists as checkDnaOnChain, mintKwamiNft, fetchOwnedKwamis, getTotalMintedCount, burnKwamiNft } from '~/utils/solanaHelpers'

export interface KwamiNFT {
  mint: string
  name: string
  symbol: string
  uri: string
  dna: string
  owner: string
  image?: string
  attributes?: Array<{ trait_type: string; value: any }>
}

export const useNFTStore = defineStore('nft', () => {
  const walletStore = useWalletStore()
  
  // State
  const ownedNfts = ref<KwamiNFT[]>([])
  const totalMinted = ref(0)
  const loading = ref(false)
  const mintingStatus = ref<'idle' | 'generating-dna' | 'checking' | 'uploading' | 'minting' | 'success' | 'error'>('idle')
  const error = ref<string | null>(null)
  
  // Current KWAMI being created
  const currentDna = ref<string | null>(null)
  const currentMetadata = ref<any>(null)
  const currentBlobConfig = ref<any>(null)
  
  // Fetch user's owned KWAMIs
  const fetchOwnedNfts = async () => {
    if (!walletStore.connected || !walletStore.wallet) return
    
    try {
      loading.value = true
      error.value = null
      
      // Fetch NFTs from blockchain
      const nfts = await fetchOwnedKwamis(walletStore.wallet.publicKey!)
      ownedNfts.value = nfts
      
      console.log(`[NFT Store] Fetched ${nfts.length} owned KWAMIs`)
    } catch (err: any) {
      console.error('Error fetching owned NFTs:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  // Fetch global statistics
  const fetchStats = async () => {
    try {
      const count = await getTotalMintedCount()
      totalMinted.value = count
      
      console.log(`[NFT Store] Total minted: ${count}`)
    } catch (err: any) {
      console.error('Error fetching stats:', err)
    }
  }
  
  // Calculate DNA for a KWAMI configuration
  const calculateDNA = async (config: any): Promise<string> => {
    try {
      mintingStatus.value = 'generating-dna'
      
      // Import DNA calculation utility
      const { calculateKwamiDNA } = await import('~/utils/calculateKwamiDNA')
      
      // Calculate DNA from body configuration
      const dna = calculateKwamiDNA(config)
      currentDna.value = dna
      
      return dna
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }
  
  // Check if DNA already exists on-chain
  const checkDnaExists = async (dna: string): Promise<boolean> => {
    try {
      mintingStatus.value = 'checking'
      
      // Check DNA on blockchain
      const exists = await checkDnaOnChain(dna)
      
      console.log(`[NFT Store] DNA exists: ${exists}`)
      return exists
    } catch (err: any) {
      console.error('Error checking DNA:', err)
      throw err
    }
  }
  
  // Mint a new KWAMI NFT
  const mintKwami = async (config: any, metadata: { name: string; description: string }) => {
    if (!walletStore.connected || !walletStore.wallet) {
      throw new Error('Wallet not connected')
    }
    
    try {
      error.value = null
      
      // Calculate DNA
      const dna = await calculateDNA(config)
      
      // Check if DNA already exists
      const exists = await checkDnaExists(dna)
      if (exists) {
        throw new Error('This KWAMI DNA already exists! Try modifying the configuration.')
      }
      
      // Upload image to Arweave
      mintingStatus.value = 'uploading'
      const imageResult = await uploadImageToArweave(
        config,
        walletStore.wallet.publicKey!.toBase58()
      )
      
      console.log('[NFT Store] Image uploaded:', imageResult.uri)
      
      // Convert configuration to attributes
      const attributes = configToAttributes(config)
      
      // Prepare metadata
      const metadataJson = {
        name: metadata.name,
        symbol: 'KWAMI',
        description: metadata.description,
        image: imageResult.uri,
        attributes,
        properties: {
          files: [{ uri: imageResult.uri, type: 'image/png' }],
          category: 'image',
          creators: [
            {
              address: walletStore.wallet.publicKey!.toBase58(),
              share: 100,
            },
          ],
        },
        dna,
      }
      
      // Upload metadata to Arweave
      const metadataResult = await uploadMetadataToArweave(
        metadataJson,
        walletStore.wallet.publicKey!.toBase58()
      )
      
      console.log('[NFT Store] Metadata uploaded:', metadataResult.uri)
      currentMetadata.value = metadataJson
      
      // Mint NFT on-chain
      mintingStatus.value = 'minting'
      const mintAddress = await mintKwamiNft(
        walletStore.wallet,
        dna,
        metadataResult.uri,
        metadata.name
      )
      
      console.log('[NFT Store] KWAMI minted:', mintAddress)
      
      mintingStatus.value = 'success'
      
      // Refresh owned NFTs
      await fetchOwnedNfts()
      await fetchStats()
    } catch (err: any) {
      console.error('Error minting KWAMI:', err)
      error.value = err.message
      mintingStatus.value = 'error'
      throw err
    }
  }
  
  // Update KWAMI metadata (Mind/Soul only)
  const updateMetadata = async (mint: string, newMetadata: any) => {
    if (!walletStore.connected) {
      throw new Error('Wallet not connected')
    }
    
    try {
      loading.value = true
      error.value = null
      
      // TODO: Implement metadata update
      // Upload new metadata to Arweave
      // Call update_metadata instruction
      
      await fetchOwnedNfts()
    } catch (err: any) {
      console.error('Error updating metadata:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Burn KWAMI (to change DNA)
  const burnKwami = async (mint: string) => {
    if (!walletStore.connected || !walletStore.wallet) {
      throw new Error('Wallet not connected')
    }
    
    try {
      loading.value = true
      error.value = null
      
      // Burn NFT on-chain
      await burnKwamiNft(walletStore.wallet, mint)
      
      console.log('[NFT Store] KWAMI burned:', mint)
      
      await fetchOwnedNfts()
      await fetchStats()
    } catch (err: any) {
      console.error('Error burning KWAMI:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Update blob configuration
  const setBlobConfig = (config: any) => {
    currentBlobConfig.value = config
  }
  
  // Reset minting status
  const resetMintingStatus = () => {
    mintingStatus.value = 'idle'
    error.value = null
    currentDna.value = null
    currentMetadata.value = null
  }
  
  return {
    ownedNfts,
    totalMinted,
    loading,
    mintingStatus,
    error,
    currentDna,
    currentMetadata,
    currentBlobConfig,
    fetchOwnedNfts,
    fetchStats,
    calculateDNA,
    checkDnaExists,
    mintKwami,
    updateMetadata,
    burnKwami,
    resetMintingStatus,
    setBlobConfig,
  }
})

