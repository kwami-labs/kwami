import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { NFTListing } from './marketplace'

export const useNftStore = defineStore('nft', () => {
  const currentNft = ref<NFTListing | null>(null)
  const userNfts = ref<NFTListing[]>([])
  const loading = ref(false)

  function setCurrentNft(nft: NFTListing | null) {
    currentNft.value = nft
  }

  function setUserNfts(nfts: NFTListing[]) {
    userNfts.value = nfts
  }

  function addUserNft(nft: NFTListing) {
    const index = userNfts.value.findIndex(n => n.mint === nft.mint)
    if (index >= 0) {
      userNfts.value[index] = nft
    } else {
      userNfts.value.push(nft)
    }
  }

  function removeUserNft(mint: string) {
    const index = userNfts.value.findIndex(n => n.mint === mint)
    if (index >= 0) {
      userNfts.value.splice(index, 1)
    }
  }

  function setLoading(state: boolean) {
    loading.value = state
  }

  return {
    currentNft,
    userNfts,
    loading,
    setCurrentNft,
    setUserNfts,
    addUserNft,
    removeUserNft,
    setLoading,
  }
})

