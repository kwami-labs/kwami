import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { NFTListing } from './marketplace'

export const useNftStore = defineStore('nft', () => {
  const nftCache = ref<Map<string, NFTListing>>(new Map())
  const loading = ref<Map<string, boolean>>(new Map())
  
  /**
   * Get NFT from cache
   */
  const getNft = (mint: string): NFTListing | undefined => {
    return nftCache.value.get(mint)
  }

  /**
   * Check if NFT is in cache
   */
  const hasNft = (mint: string): boolean => {
    return nftCache.value.has(mint)
  }

  /**
   * Check if NFT is loading
   */
  const isLoading = (mint: string): boolean => {
    return loading.value.get(mint) || false
  }

  /**
   * Cache NFT data
   */
  const cacheNft = (nft: NFTListing) => {
    nftCache.value.set(nft.mint, nft)
  }

  /**
   * Cache multiple NFTs
   */
  const cacheNfts = (nfts: NFTListing[]) => {
    nfts.forEach(nft => {
      nftCache.value.set(nft.mint, nft)
    })
  }

  /**
   * Remove NFT from cache
   */
  const removeFromCache = (mint: string) => {
    nftCache.value.delete(mint)
  }

  /**
   * Set loading state for NFT
   */
  const setLoading = (mint: string, state: boolean) => {
    if (state) {
      loading.value.set(mint, true)
    } else {
      loading.value.delete(mint)
    }
  }

  /**
   * Clear all cache
   */
  const clearCache = () => {
    nftCache.value.clear()
    loading.value.clear()
  }

  /**
   * Get all cached NFTs
   */
  const allCachedNfts = computed(() => {
    return Array.from(nftCache.value.values())
  })

  /**
   * Get cached NFTs by owner
   */
  const getCachedByOwner = (owner: string): NFTListing[] => {
    return allCachedNfts.value.filter(nft => nft.owner === owner)
  }

  /**
   * Get listed NFTs from cache
   */
  const getCachedListed = computed(() => {
    return allCachedNfts.value.filter(nft => nft.listed && nft.price && nft.price > 0)
  })

  /**
   * Update NFT in cache
   */
  const updateNft = (mint: string, updates: Partial<NFTListing>) => {
    const existing = nftCache.value.get(mint)
    if (existing) {
      nftCache.value.set(mint, { ...existing, ...updates })
    }
  }

  return {
    nftCache,
    loading,
    getNft,
    hasNft,
    isLoading,
    cacheNft,
    cacheNfts,
    removeFromCache,
    setLoading,
    clearCache,
    allCachedNfts,
    getCachedByOwner,
    getCachedListed,
    updateNft,
  }
})
