import { ref } from 'vue'
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token'
import { useSolana } from './useSolana'
import { useMarketplaceStore } from '~/stores/marketplace'
import type { NFTListing } from '~/stores/marketplace'

export const useMarketplace = () => {
  const { getConnection, confirmTransaction } = useSolana()
  const marketplaceStore = useMarketplaceStore()
  
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Buy NFT from marketplace
   */
  const buyNft = async (nft: NFTListing, buyerPublicKey: string): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null

      if (!nft.price || nft.price <= 0) {
        throw new Error('Invalid NFT price')
      }

      const connection = getConnection()
      const buyer = new PublicKey(buyerPublicKey)
      const seller = new PublicKey(nft.owner)
      const mintAddress = new PublicKey(nft.mint)

      // Get wallet from window (Phantom)
      const phantom = (window as any).solana
      if (!phantom) {
        throw new Error('Wallet not connected')
      }

      // Create transaction
      const transaction = new Transaction()

      // Add payment instruction (SOL transfer)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: buyer,
          toPubkey: seller,
          lamports: nft.price * LAMPORTS_PER_SOL,
        })
      )

      // Get token accounts
      const buyerTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        buyer
      )

      const sellerTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        seller
      )

      // Add NFT transfer instruction
      transaction.add(
        createTransferInstruction(
          sellerTokenAccount,
          buyerTokenAccount,
          seller,
          1, // Transfer 1 NFT
          [],
          TOKEN_PROGRAM_ID
        )
      )

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = buyer

      // Sign and send transaction
      const signed = await phantom.signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signed.serialize())

      // Confirm transaction
      const confirmed = await confirmTransaction(signature)
      if (!confirmed) {
        throw new Error('Transaction failed to confirm')
      }

      // Update marketplace state
      marketplaceStore.removeNft(nft.mint)

      return true
    } catch (err: any) {
      console.error('Error buying NFT:', err)
      error.value = err.message || 'Failed to buy NFT'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * List NFT for sale
   */
  const listNft = async (
    nft: NFTListing,
    price: number,
    ownerPublicKey: string
  ): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null

      if (price <= 0) {
        throw new Error('Price must be greater than 0')
      }

      // In a production marketplace, you would:
      // 1. Create a listing account on-chain
      // 2. Transfer NFT to escrow
      // 3. Store listing data

      // For this demo, we'll simulate the listing
      const listedNft: NFTListing = {
        ...nft,
        price,
        listed: true,
        listedAt: Date.now(),
      }

      marketplaceStore.addNft(listedNft)

      return true
    } catch (err: any) {
      console.error('Error listing NFT:', err)
      error.value = err.message || 'Failed to list NFT'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Unlist NFT from marketplace
   */
  const unlistNft = async (
    mintAddress: string,
    ownerPublicKey: string
  ): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null

      // In a production marketplace, you would:
      // 1. Close the listing account
      // 2. Return NFT from escrow to owner

      // For this demo, we'll just remove from listings
      const nft = marketplaceStore.nfts.find(n => n.mint === mintAddress)
      if (nft && nft.owner === ownerPublicKey) {
        marketplaceStore.removeNft(mintAddress)
        return true
      }

      throw new Error('NFT not found or you are not the owner')
    } catch (err: any) {
      console.error('Error unlisting NFT:', err)
      error.value = err.message || 'Failed to unlist NFT'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Update NFT price
   */
  const updatePrice = async (
    mintAddress: string,
    newPrice: number,
    ownerPublicKey: string
  ): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null

      if (newPrice <= 0) {
        throw new Error('Price must be greater than 0')
      }

      const nft = marketplaceStore.nfts.find(n => n.mint === mintAddress)
      if (!nft) {
        throw new Error('NFT not found')
      }

      if (nft.owner !== ownerPublicKey) {
        throw new Error('You are not the owner of this NFT')
      }

      const updatedNft: NFTListing = {
        ...nft,
        price: newPrice,
      }

      marketplaceStore.addNft(updatedNft)

      return true
    } catch (err: any) {
      console.error('Error updating price:', err)
      error.value = err.message || 'Failed to update price'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Make offer on NFT
   */
  const makeOffer = async (
    nft: NFTListing,
    offerAmount: number,
    buyerPublicKey: string
  ): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null

      if (offerAmount <= 0) {
        throw new Error('Offer amount must be greater than 0')
      }

      // In a production marketplace, you would:
      // 1. Create an offer account on-chain
      // 2. Lock SOL in escrow
      // 3. Emit offer event

      console.log('Offer made:', {
        nft: nft.mint,
        amount: offerAmount,
        buyer: buyerPublicKey,
      })

      return true
    } catch (err: any) {
      console.error('Error making offer:', err)
      error.value = err.message || 'Failed to make offer'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Get marketplace statistics
   */
  const getStats = () => {
    const listed = marketplaceStore.listedNfts
    
    const totalVolume = listed.reduce((sum, nft) => sum + (nft.price || 0), 0)
    const avgPrice = listed.length > 0 ? totalVolume / listed.length : 0
    const minPrice = listed.length > 0 ? Math.min(...listed.map(n => n.price || 0)) : 0
    const maxPrice = listed.length > 0 ? Math.max(...listed.map(n => n.price || 0)) : 0

    return {
      totalListings: listed.length,
      totalVolume,
      avgPrice,
      minPrice,
      maxPrice,
    }
  }

  return {
    loading,
    error,
    buyNft,
    listNft,
    unlistNft,
    updatePrice,
    makeOffer,
    getStats,
  }
}

