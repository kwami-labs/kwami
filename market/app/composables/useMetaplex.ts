import { ref } from 'vue'
import { Connection, PublicKey } from '@solana/web3.js'
import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js'
import { useSolana } from './useSolana'
import { useRuntimeConfig } from '#app'
import type { NFTListing } from '~/stores/marketplace'

export const useMetaplex = () => {
  const { getConnection } = useSolana()
  const config = useRuntimeConfig()
  
  const loading = ref(false)
  const error = ref<string | null>(null)

  const collectionMint = computed(() => config.public.kwamiCollectionMint as string)

  /**
   * Initialize Metaplex instance
   */
  const getMetaplex = (wallet?: any): Metaplex => {
    const connection = getConnection()
    const metaplex = Metaplex.make(connection)

    if (wallet) {
      metaplex.use(keypairIdentity(wallet))
    }

    return metaplex
  }

  /**
   * Fetch all NFTs from a wallet
   */
  const fetchWalletNfts = async (walletAddress: string): Promise<NFTListing[]> => {
    try {
      loading.value = true
      error.value = null

      const metaplex = getMetaplex()
      const owner = new PublicKey(walletAddress)

      const nfts = await metaplex
        .nfts()
        .findAllByOwner({ owner })

      // Filter for KWAMI collection if collection mint is set
      let filteredNfts = nfts
      if (collectionMint.value) {
        filteredNfts = nfts.filter(nft => 
          nft.collection?.address.toString() === collectionMint.value
        )
      }

      // Load metadata for each NFT
      const nftListings: NFTListing[] = []
      for (const nft of filteredNfts) {
        try {
          const metadata = await metaplex.nfts().load({ metadata: nft })
          
          nftListings.push({
            mint: nft.mintAddress.toString(),
            name: nft.name,
            symbol: nft.symbol,
            description: metadata.json?.description || '',
            image: metadata.json?.image || '',
            glbUri: metadata.json?.animation_url || metadata.json?.properties?.files?.find((f: any) => f.type === 'model/gltf-binary')?.uri,
            owner: walletAddress,
            listed: false,
            dnaHash: metadata.json?.attributes?.find((a: any) => a.trait_type === 'DNA')?.value || '',
            attributes: metadata.json?.attributes || [],
            rarity: metadata.json?.attributes?.find((a: any) => a.trait_type === 'Rarity')?.value,
            metadata: metadata.json,
          })
        } catch (err) {
          console.error('Error loading NFT metadata:', err)
        }
      }

      return nftListings
    } catch (err: any) {
      console.error('Error fetching wallet NFTs:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch NFT by mint address
   */
  const fetchNftByMint = async (mintAddress: string): Promise<NFTListing | null> => {
    try {
      loading.value = true
      error.value = null

      const metaplex = getMetaplex()
      const mint = new PublicKey(mintAddress)

      const nft = await metaplex.nfts().findByMint({ mintAddress: mint })
      const metadata = await metaplex.nfts().load({ metadata: nft })

      return {
        mint: mintAddress,
        name: nft.name,
        symbol: nft.symbol,
        description: metadata.json?.description || '',
        image: metadata.json?.image || '',
        glbUri: metadata.json?.animation_url || metadata.json?.properties?.files?.find((f: any) => f.type === 'model/gltf-binary')?.uri,
        owner: nft.updateAuthorityAddress.toString(),
        listed: false,
        dnaHash: metadata.json?.attributes?.find((a: any) => a.trait_type === 'DNA')?.value || '',
        attributes: metadata.json?.attributes || [],
        rarity: metadata.json?.attributes?.find((a: any) => a.trait_type === 'Rarity')?.value,
        metadata: metadata.json,
      }
    } catch (err: any) {
      console.error('Error fetching NFT:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch all listed NFTs (mock implementation)
   * In production, you'd query a marketplace program or database
   */
  const fetchListedNfts = async (): Promise<NFTListing[]> => {
    try {
      loading.value = true
      error.value = null

      // Mock data for now
      // In production, query your marketplace program or backend API
      return []
    } catch (err: any) {
      console.error('Error fetching listed NFTs:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Upload JSON metadata to Arweave
   */
  const uploadMetadata = async (metadata: any, wallet: any): Promise<string | null> => {
    try {
      loading.value = true
      error.value = null

      const metaplex = getMetaplex(wallet)
      const { uri } = await metaplex.nfts().uploadMetadata(metadata)
      
      return uri
    } catch (err: any) {
      console.error('Error uploading metadata:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Upload file to Arweave
   */
  const uploadFile = async (file: File, wallet: any): Promise<string | null> => {
    try {
      loading.value = true
      error.value = null

      const metaplex = getMetaplex(wallet)
      const buffer = await file.arrayBuffer()
      const { uri } = await metaplex.storage().upload(new Uint8Array(buffer))
      
      return uri
    } catch (err: any) {
      console.error('Error uploading file:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    collectionMint,
    getMetaplex,
    fetchWalletNfts,
    fetchNftByMint,
    fetchListedNfts,
    uploadMetadata,
    uploadFile,
  }
}

