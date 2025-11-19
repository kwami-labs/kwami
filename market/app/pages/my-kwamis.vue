<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-2">My KWAMIs</h1>
      <p class="text-gray-400">Manage your KWAMI collection</p>
    </div>

    <!-- Not Connected State -->
    <div v-if="!walletStore.connected" class="card text-center py-16">
      <div class="text-6xl mb-4">🔐</div>
      <h2 class="text-2xl font-bold mb-2">Connect Your Wallet</h2>
      <p class="text-gray-400 mb-6">
        Connect your wallet to view your KWAMI collection
      </p>
      <WalletButton />
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-else-if="loading" message="Loading your KWAMIs..." />

    <!-- Empty State -->
    <div v-else-if="myNfts.length === 0" class="card text-center py-16">
      <div class="text-6xl mb-4">👻</div>
      <h2 class="text-2xl font-bold mb-2">No KWAMIs Yet</h2>
      <p class="text-gray-400 mb-6">
        Start your collection by creating or buying a KWAMI
      </p>
      <div class="flex items-center justify-center space-x-4">
        <NuxtLink to="/create" class="btn btn-primary">
          Create KWAMI
        </NuxtLink>
        <NuxtLink to="/" class="btn btn-outline">
          Explore Marketplace
        </NuxtLink>
      </div>
    </div>

    <!-- NFT Grid -->
    <div v-else>
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="stat-card">
          <div class="stat-icon bg-primary-500/20 text-primary-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Total KWAMIs</p>
            <p class="stat-value">{{ myNfts.length }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-green-500/20 text-green-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Listed</p>
            <p class="stat-value">{{ listedCount }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-blue-500/20 text-blue-400">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Total Value</p>
            <p class="stat-value">{{ totalValue.toFixed(2) }} ◎</p>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex items-center space-x-2 mb-6">
        <button
          @click="filter = 'all'"
          class="btn"
          :class="filter === 'all' ? 'btn-primary' : 'btn-outline'"
        >
          All ({{ myNfts.length }})
        </button>
        <button
          @click="filter = 'listed'"
          class="btn"
          :class="filter === 'listed' ? 'btn-primary' : 'btn-outline'"
        >
          Listed ({{ listedCount }})
        </button>
        <button
          @click="filter = 'unlisted'"
          class="btn"
          :class="filter === 'unlisted' ? 'btn-primary' : 'btn-outline'"
        >
          Unlisted ({{ myNfts.length - listedCount }})
        </button>
      </div>

      <!-- NFT Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <NftCard
          v-for="nft in filteredNfts"
          :key="nft.mint"
          :nft="nft"
          show-actions
          @view="navigateToNft(nft.mint)"
          @list="handleList(nft)"
        />
      </div>
    </div>

    <!-- List Modal -->
    <ListModal
      v-if="selectedNft"
      :nft="selectedNft"
      :show="showListModal"
      @close="showListModal = false"
      @confirm="confirmList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from '~/stores/wallet'
import { useMetaplex } from '~/composables/useMetaplex'
import { useMarketplace } from '~/composables/useMarketplace'
import type { NFTListing } from '~/stores/marketplace'

const router = useRouter()
const walletStore = useWalletStore()
const { fetchWalletNfts } = useMetaplex()
const { listNft } = useMarketplace()

const myNfts = ref<NFTListing[]>([])
const loading = ref(false)
const filter = ref<'all' | 'listed' | 'unlisted'>('all')
const selectedNft = ref<NFTListing | null>(null)
const showListModal = ref(false)

const filteredNfts = computed(() => {
  if (filter.value === 'all') return myNfts.value
  if (filter.value === 'listed') return myNfts.value.filter(nft => nft.listed)
  return myNfts.value.filter(nft => !nft.listed)
})

const listedCount = computed(() => {
  return myNfts.value.filter(nft => nft.listed).length
})

const totalValue = computed(() => {
  return myNfts.value
    .filter(nft => nft.listed && nft.price)
    .reduce((sum, nft) => sum + (nft.price || 0), 0)
})

const loadMyNfts = async () => {
  if (!walletStore.publicKey) return
  
  try {
    loading.value = true
    const nfts = await fetchWalletNfts(walletStore.publicKey)
    myNfts.value = nfts
  } catch (err) {
    console.error('Error loading NFTs:', err)
  } finally {
    loading.value = false
  }
}

const navigateToNft = (mint: string) => {
  router.push(`/nft/${mint}`)
}

const handleList = (nft: NFTListing) => {
  selectedNft.value = nft
  showListModal.value = true
}

const confirmList = async (price: number) => {
  if (!selectedNft.value || !walletStore.publicKey) return
  
  const success = await listNft(selectedNft.value, price, walletStore.publicKey)
  if (success) {
    showListModal.value = false
    selectedNft.value = null
    await loadMyNfts()
  }
}

// Watch for wallet connection changes
watch(() => walletStore.connected, (connected) => {
  if (connected) {
    loadMyNfts()
  } else {
    myNfts.value = []
  }
})

onMounted(() => {
  if (walletStore.connected) {
    loadMyNfts()
  }
})

definePageMeta({
  layout: 'default',
})
</script>
