import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PublicKey } from '@solana/web3.js'
import { uploadImageToIpfs, uploadMetadataToIpfs, uploadGifToIpfs, upload3DModelToIpfs } from '@/utils/uploadIpfs'
import { checkDnaExists as checkDnaOnChain, mintKwamiNft, fetchOwnedKwamis, getTotalMintedCount, burnKwamiNft } from '@/utils/solanaHelpers'
import { prepareKwamiMetadata, type SoulConfig } from '@/utils/prepareKwamiMetadata'
import { calculateKwamiDNA } from '@/utils/calculateKwamiDNA'
import { generateSoulFromDNA } from '@/utils/generateSoulFromDNA'
import { useWalletStore } from './wallet'

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
  const currentSoulConfig = ref<SoulConfig | null>(null)
  const currentImageBuffer = ref<Buffer | null>(null)
  
  // Fetch user's owned KWAMIs
  const fetchOwnedNfts = async () => {
    if (!walletStore.connected || !walletStore.publicKey) return
    
    try {
      loading.value = true
      error.value = null
      
      // Fetch NFTs from blockchain
      const nfts = await fetchOwnedKwamis(walletStore.publicKey, walletStore.wallet)
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
    if (!walletStore.wallet) return
    
    try {
      const count = await getTotalMintedCount(walletStore.wallet)
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
      
      // Calculate DNA from body configuration
      const dna = calculateKwamiDNA(config)
      currentDna.value = dna
      
      // Generate soul from DNA (deterministic)
      currentSoulConfig.value = generateSoulFromDNA(dna)
      
      return dna
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }
  
  // Check if DNA already exists on-chain
  const checkDnaExists = async (dna: string): Promise<boolean> => {
    if (!walletStore.wallet) {
      throw new Error('Wallet not connected')
    }
    
    try {
      mintingStatus.value = 'checking'
      
      // Check DNA on blockchain
      const exists = await checkDnaOnChain(dna, walletStore.wallet)
      
      console.log(`[NFT Store] DNA exists: ${exists}`)
      return exists
    } catch (err: any) {
      console.error('Error checking DNA:', err)
      throw err
    }
  }
  
  // Mint a new KWAMI NFT with image, GIF, and 3D model
  const mintKwami = async (
    config: any,
    metadata: { name: string; description: string },
    soulConfig?: any,
    imageBuffer: Buffer | null = null,
    gifBuffer?: Buffer | null,
    modelBuffer?: Buffer | null
  ) => {
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
      
      // Upload image to IPFS (instant availability!)
      mintingStatus.value = 'uploading'
      
      let imageResult
      if (imageBuffer) {
        // Use actual image buffer from canvas
        imageResult = await uploadImageToIpfs(
          imageBuffer,
          walletStore.wallet,
          'image/png'
        )
      } else {
        // Fallback to mock (for testing)
        console.warn('[NFT Store] No image buffer provided, using mock upload')
        imageResult = await uploadImageToIpfs(
          Buffer.from('mock'),
          undefined,
          'image/png'
        )
      }
      
      console.log('[NFT Store] Image uploaded:', imageResult.uri)
      
      // Upload GIF if provided
      let gifResult
      if (gifBuffer) {
        console.log('[NFT Store] Uploading GIF...')
        gifResult = await uploadGifToIpfs(gifBuffer, walletStore.wallet)
        console.log('[NFT Store] GIF uploaded:', gifResult.uri)
      }
      
      // Upload 3D model if provided
      let modelResult
      if (modelBuffer) {
        console.log('[NFT Store] Uploading 3D model...')
        modelResult = await upload3DModelToIpfs(modelBuffer, walletStore.wallet)
        console.log('[NFT Store] 3D model uploaded:', modelResult.uri)
      }
      
      // Prepare metadata with GIF as primary image
      const metadataJson = prepareKwamiMetadata({
        name: metadata.name,
        description: metadata.description,
        dna,
        bodyConfig: config,
        soulConfig,
        imageUri: gifResult ? gifResult.uri : imageResult.uri,  // Use GIF as main image
        creatorAddress: walletStore.publicKey!.toBase58(),
      })
      
      // Set animation_url to 3D model (GLB) for Phantom 3D viewer
      if (modelResult) {
        metadataJson.animation_url = modelResult.uri
        console.log('[NFT Store] Set animation_url to 3D model for Phantom display')
      }
      
      // Add static PNG to properties.files
      if (imageResult) {
        metadataJson.properties = metadataJson.properties || {}
        metadataJson.properties.files = metadataJson.properties.files || []
        metadataJson.properties.files.push({
          uri: imageResult.uri,
          type: 'image/png',
          cdn: false
        })
      }
      
      // Upload metadata to IPFS
      const metadataResult = await uploadMetadataToIpfs(
        metadataJson,
        walletStore.wallet
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
      
      return mintAddress
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
    
    // Generate DNA and soul if config changes
    if (config) {
      const dna = calculateKwamiDNA(config)
      currentDna.value = dna
      currentSoulConfig.value = generateSoulFromDNA(dna)
    }
  }
  
  // Set current image buffer
  const setImageBuffer = (buffer: Buffer | null) => {
    currentImageBuffer.value = buffer
  }
  
  // Reset minting status
  const resetMintingStatus = () => {
    mintingStatus.value = 'idle'
    error.value = null
    currentDna.value = null
    currentMetadata.value = null
    currentSoulConfig.value = null
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
    currentSoulConfig,
    currentImageBuffer,
    fetchOwnedNfts,
    fetchStats,
    calculateDNA,
    checkDnaExists,
    mintKwami,
    updateMetadata,
    burnKwami,
    resetMintingStatus,
    setBlobConfig,
    setImageBuffer,
  }
})
