import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PublicKey } from '@solana/web3.js'
import { uploadImageToIpfs, uploadMetadataToIpfs, uploadGifToIpfs, uploadVideoToIpfs } from '@/utils/uploadIpfs'
import { checkDnaExists as checkDnaOnChain, mintKwamiWithReceipt, fetchOwnedKwamis, getTotalMintedCount, burnKwamiNft } from '@/utils/solanaHelpers'
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
  const mintingStatus = ref<
    | 'idle'
    | 'preparing'
    | 'capturing'
    | 'paying'
    | 'confirming-payment'
    | 'rolling'
    | 'generating-dna'
    | 'checking'
    | 'uploading-image'
    | 'uploading-gif'
    | 'uploading-video'
    | 'uploading-metadata'
    | 'minting'
    | 'confirming-mint'
    | 'refreshing'
    | 'success'
    | 'error'
  >('idle')
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
  
  // Mint a new KWAMI NFT with image + video asset
  const mintKwami = async (
    config: any,
    metadata: { name: string; description: string },
    soulConfig?: any,
    imageBuffer: Buffer | null = null,
    gifBuffer?: Buffer | null,
    videoBuffer?: Buffer | null,
    opts?: {
      rollId?: string
      onSigned?: () => void | Promise<void>
    }
  ) => {
    if (!walletStore.connected || !walletStore.wallet) {
      throw new Error('Wallet not connected')
    }
    
    try {
      error.value = null
      // NOTE: mint flow is orchestrated by the UI now:
      // 1) pay -> 2) roll -> 3) check dna loop -> 4) upload -> 5) finalize mint
      // This method assumes `config` is already the final rolled selection.
      mintingStatus.value = 'generating-dna'

      const dna = await calculateDNA(config)
      console.log('[NFT Store] Final selected DNA:', dna.substring(0, 16) + '...')
      
      // Upload image to IPFS (instant availability!)
      let imageResult
      if (imageBuffer) {
        mintingStatus.value = 'uploading-image'
        // Use actual image buffer from canvas
        imageResult = await uploadImageToIpfs(
          imageBuffer,
          walletStore.wallet,
          'image/png'
        )
      } else {
        // Fallback to mock (for testing)
        mintingStatus.value = 'uploading-image'
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
        mintingStatus.value = 'uploading-gif'
        console.log('[NFT Store] Uploading GIF...')
        gifResult = await uploadGifToIpfs(gifBuffer, walletStore.wallet)
        console.log('[NFT Store] GIF uploaded:', gifResult.uri)
      }
      
      // Upload video if provided (WebM file but we'll claim it's MP4 in metadata for Phantom compatibility)
      let videoResult
      if (videoBuffer) {
        mintingStatus.value = 'uploading-video'
        console.log('[NFT Store] Uploading video...')
        // Upload as WebM (actual format)
        videoResult = await uploadVideoToIpfs(videoBuffer, walletStore.wallet, 'video/webm')
        console.log('[NFT Store] Video uploaded:', videoResult.uri)
      }

      // Prepare metadata (PNG as image + video as animation_url)
      console.log('[NFT Store] Preparing metadata with:', {
        hasVideo: !!videoResult,
        videoUri: videoResult?.uri,
        imageUri: imageResult.uri
      })
      const metadataJson = prepareKwamiMetadata({
        name: metadata.name,
        description: metadata.description,
        dna,
        bodyConfig: config,
        soulConfig,
        imageUri: imageResult.uri,
        animationUri: videoResult?.uri,
        // Claim MP4 in metadata even though file is WebM (Phantom wallet hack)
        animationMimeType: videoResult ? 'video/mp4' : undefined,
        creatorAddress: walletStore.publicKey!.toBase58(),
      })
      console.log('[NFT Store] Metadata prepared:', {
        name: metadataJson.name,
        hasAnimationUrl: !!metadataJson.animation_url,
        animationUrl: metadataJson.animation_url,
        category: metadataJson.properties.category,
        filesCount: metadataJson.properties.files.length
      })
      
      // Upload metadata to IPFS
      mintingStatus.value = 'uploading-metadata'
      const metadataResult = await uploadMetadataToIpfs(
        metadataJson,
        walletStore.wallet
      )
      
      console.log('[NFT Store] Metadata uploaded:', metadataResult.uri)
      currentMetadata.value = metadataJson
      
      // Finalize mint (requires a purchased roll id)
      const rollId = opts?.rollId
      if (!rollId) {
        throw new Error('Missing rollId (must purchase roll before minting)')
      }

      mintingStatus.value = 'minting'
      const mintAddress = await mintKwamiWithReceipt(
        walletStore.wallet,
        rollId,
        dna,
        metadataResult.uri,
        metadata.name,
        opts
      )
      
      console.log('[NFT Store] KWAMI minted:', mintAddress)
      
      mintingStatus.value = 'success'
      
      // Refresh owned NFTs
      mintingStatus.value = 'refreshing'
      await fetchOwnedNfts()
      await fetchStats()
      mintingStatus.value = 'success'
      
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
