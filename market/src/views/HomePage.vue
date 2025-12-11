<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-gradient py-16 mb-12 rounded-2xl">
      <div class="text-center max-w-4xl mx-auto px-4">
        <h1 class="text-5xl md:text-7xl font-bold mb-6">
          <span class="gradient-text">KWAMI Marketplace</span>
        </h1>
        <p class="text-xl text-gray-300 mb-8">
          Discover, collect, and trade unique AI companion NFTs on Solana
        </p>
        <div class="flex items-center justify-center space-x-4">
          <RouterLink to="#explore" class="btn btn-primary text-lg px-8 py-3">
            Explore NFTs
          </RouterLink>
          <RouterLink to="/create" class="btn btn-outline text-lg px-8 py-3">
            Create KWAMI
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="mb-12">
      <MarketplaceStats :stats="stats" />
    </section>

    <!-- Marketplace -->
    <section id="explore">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-bold">Explore KWAMIs</h2>
        <button
          @click="showFilters = !showFilters"
          class="md:hidden btn btn-secondary"
        >
          Filters
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
          </svg>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Filters Sidebar -->
        <aside 
          class="lg:col-span-1"
          :class="{ 'hidden lg:block': !showFilters }"
        >
          <MarketplaceFilters
            :filters="marketplaceStore.filters"
            :results-count="filteredNfts.length"
            @update="handleFiltersUpdate"
          />
        </aside>

        <!-- NFT Grid -->
        <div class="lg:col-span-3">
          <!-- Loading State -->
          <LoadingSpinner v-if="loading" message="Loading KWAMIs..." />

          <!-- Empty State -->
          <div 
            v-else-if="filteredNfts.length === 0"
            class="card text-center py-16"
          >
            <div class="text-6xl mb-4">👻</div>
            <h3 class="text-2xl font-bold mb-2">No KWAMIs Found</h3>
            <p class="text-gray-400 mb-6">
              {{ marketplaceStore.nfts.length === 0 
                ? 'Be the first to list a KWAMI!' 
                : 'Try adjusting your filters' 
              }}
            </p>
            <RouterLink to="/create" class="btn btn-primary">
              Create KWAMI
            </RouterLink>
          </div>

          <!-- NFT Grid -->
          <div 
            v-else
            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <NftCard
              v-for="nft in filteredNfts"
              :key="nft.mint"
              :nft="nft"
              show-actions
              @buy="handleBuy(nft)"
              @view="navigateToNft(nft.mint)"
              @list="handleList(nft)"
            />
          </div>

          <!-- Load More -->
          <div 
            v-if="hasMore"
            class="text-center mt-8"
          >
            <button
              @click="loadMore"
              :disabled="loadingMore"
              class="btn btn-secondary"
            >
              <span v-if="loadingMore" class="spinner mr-2"></span>
              {{ loadingMore ? 'Loading...' : 'Load More' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Buy Modal -->
    <BuyModal
      v-if="selectedNft"
      :nft="selectedNft"
      :show="showBuyModal"
      @close="showBuyModal = false"
      @confirm="confirmBuy"
    />

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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketplaceStore } from '~/stores/marketplace'
import { useWalletStore } from '~/stores/wallet'
import { useMetaplex } from '~/composables/useMetaplex'
import { useMarketplace } from '~/composables/useMarketplace'
import type { NFTListing, MarketplaceFilters } from '~/stores/marketplace'

const router = useRouter
const marketplaceStore = useMarketplaceStore()
const walletStore = useWalletStore()
const { fetchListedNfts } = useMetaplex()
const { getStats, buyNft, listNft } = useMarketplace()

const showFilters = ref(false)
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(false)
const selectedNft = ref<NFTListing | null>(null)
const showBuyModal = ref(false)
const showListModal = ref(false)

const filteredNfts = computed(() => marketplaceStore.filteredNfts)
const stats = computed(() => getStats())

const handleFiltersUpdate = (newFilters: Partial<MarketplaceFilters>) => {
  marketplaceStore.updateFilters(newFilters)
}

const navigateToNft = (mint: string) => {
  router.push(`/nft/${mint}`)
}

const handleBuy = (nft: NFTListing) => {
  if (!walletStore.connected) {
    alert('Please connect your wallet first')
    return
  }
  selectedNft.value = nft
  showBuyModal.value = true
}

const handleList = (nft: NFTListing) => {
  if (!walletStore.connected) {
    alert('Please connect your wallet first')
    return
  }
  selectedNft.value = nft
  showListModal.value = true
}

const confirmBuy = async () => {
  if (!selectedNft.value || !walletStore.publicKey) return

  const success = await buyNft(selectedNft.value, walletStore.publicKey)
  if (success) {
    showBuyModal.value = false
    selectedNft.value = null
    // Refresh listings
    await loadNfts()
  }
}

const confirmList = async (price: number) => {
  if (!selectedNft.value || !walletStore.publicKey) return

  const success = await listNft(selectedNft.value, price, walletStore.publicKey)
  if (success) {
    showListModal.value = false
    selectedNft.value = null
    // Refresh listings
    await loadNfts()
  }
}

const loadNfts = async () => {
  loading.value = true
  try {
    const nfts = await fetchListedNfts()
    marketplaceStore.setNfts(nfts)
  } catch (error) {
    console.error('Error loading NFTs:', error)
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  loadingMore.value = true
  // Implement pagination logic here
  await new Promise(resolve => setTimeout(resolve, 1000))
  loadingMore.value = false
}

onMounted(() => {
  loadNfts()
})

// Set page meta
definePageMeta({
  layout: 'default',
})
</script>

