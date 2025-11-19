import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface NFTListing {
  mint: string
  name: string
  symbol: string
  description: string
  image: string
  glbUri?: string
  owner: string
  price?: number
  listed: boolean
  dnaHash: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
  rarity?: string
  listedAt?: number
  metadata?: any
}

export interface MarketplaceFilters {
  priceMin?: number
  priceMax?: number
  rarity?: string[]
  sortBy: 'price_asc' | 'price_desc' | 'recent' | 'oldest'
  search?: string
}

export const useMarketplaceStore = defineStore('marketplace', () => {
  const nfts = ref<NFTListing[]>([])
  const loading = ref(false)
  const filters = ref<MarketplaceFilters>({
    sortBy: 'recent'
  })

  const listedNfts = computed(() => {
    return nfts.value.filter(nft => nft.listed && nft.price && nft.price > 0)
  })

  const filteredNfts = computed(() => {
    let filtered = [...listedNfts.value]

    // Apply price filter
    if (filters.value.priceMin !== undefined) {
      filtered = filtered.filter(nft => (nft.price || 0) >= filters.value.priceMin!)
    }
    if (filters.value.priceMax !== undefined) {
      filtered = filtered.filter(nft => (nft.price || 0) <= filters.value.priceMax!)
    }

    // Apply rarity filter
    if (filters.value.rarity && filters.value.rarity.length > 0) {
      filtered = filtered.filter(nft => 
        nft.rarity && filters.value.rarity!.includes(nft.rarity)
      )
    }

    // Apply search filter
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(nft =>
        nft.name.toLowerCase().includes(search) ||
        nft.description?.toLowerCase().includes(search) ||
        nft.mint.toLowerCase().includes(search)
      )
    }

    // Apply sorting
    switch (filters.value.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price_desc':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'recent':
        filtered.sort((a, b) => (b.listedAt || 0) - (a.listedAt || 0))
        break
      case 'oldest':
        filtered.sort((a, b) => (a.listedAt || 0) - (b.listedAt || 0))
        break
    }

    return filtered
  })

  function setNfts(newNfts: NFTListing[]) {
    nfts.value = newNfts
  }

  function addNft(nft: NFTListing) {
    const index = nfts.value.findIndex(n => n.mint === nft.mint)
    if (index >= 0) {
      nfts.value[index] = nft
    } else {
      nfts.value.push(nft)
    }
  }

  function removeNft(mint: string) {
    const index = nfts.value.findIndex(n => n.mint === mint)
    if (index >= 0) {
      nfts.value.splice(index, 1)
    }
  }

  function updateFilters(newFilters: Partial<MarketplaceFilters>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function setLoading(state: boolean) {
    loading.value = state
  }

  return {
    nfts,
    listedNfts,
    filteredNfts,
    loading,
    filters,
    setNfts,
    addNft,
    removeNft,
    updateFilters,
    setLoading,
  }
})

