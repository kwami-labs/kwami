<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center space-x-4 mb-4">
        <div class="w-20 h-20 bg-gradient-to-br from-kwami-purple to-kwami-blue rounded-full flex items-center justify-center text-4xl">
          👤
        </div>
        <div>
          <h1 class="text-4xl font-bold mb-2">My KWAMIs</h1>
          <p class="text-gray-400 font-mono">{{ walletStore.shortAddress }}</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card text-center">
          <p class="text-3xl font-bold">{{ userNfts.length }}</p>
          <p class="text-sm text-gray-400">Total KWAMIs</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold">{{ listedCount }}</p>
          <p class="text-sm text-gray-400">Listed</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold">{{ totalValue.toFixed(2) }}</p>
          <p class="text-sm text-gray-400">Total Value (SOL)</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold">{{ walletStore.balance.toFixed(2) }}</p>
          <p class="text-sm text-gray-400">Wallet Balance (SOL)</p>
        </div>
      </div>
    </div>

    <!-- Wallet Not Connected -->
    <div v-if="!walletStore.connected" class="card text-center py-16">
      <div class="text-6xl mb-4">🔒</div>
      <h3 class="text-2xl font-bold mb-2">Connect Your Wallet</h3>
      <p class="text-gray-400 mb-6">
        Connect your wallet to view your KWAMI collection
      </p>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-else-if="loading" message="Loading your KWAMIs..." />

    <!-- Empty State -->
    <div v-else-if="userNfts.length === 0" class="card text-center py-16">
      <div class="text-6xl mb-4">👻</div>
      <h3 class="text-2xl font-bold mb-2">No KWAMIs Yet</h3>
      <p class="text-gray-400 mb-6">
        Start your collection by creating or buying a KWAMI
      </p>
      <div class="flex items-center justify-center space-x-4">
        <NuxtLink to="/create" class="btn btn-primary">
          Create KWAMI
        </NuxtLink>
        <NuxtLink to="/" class="btn btn-outline">
          Browse Marketplace
        </NuxtLink>
      </div>
    </div>

    <!-- NFT Grid -->
    <div v-else>
      <!-- Tabs -->
      <div class="flex items-center space-x-4 mb-6 border-b border-gray-800">
        <button
          @click="activeTab = 'all'"
          class="tab"
          :class="{ 'tab-active': activeTab === 'all' }"
        >
          All ({{ userNfts.length }})
        </button>
        <button
          @click="activeTab = 'listed'"
          class="tab"
          :class="{ 'tab-active': activeTab === 'listed' }"
        >
          Listed ({{ listedCount }})
        </button>
        <button
          @click="activeTab = 'unlisted'"
          class="tab"
          :class="{ 'tab-active': activeTab === 'unlisted' }"
        >
          Not Listed ({{ unlistedCount }})
        </button>
      </div>

      <!-- NFTs -->
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
      @unlist="confirmUnlist"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNftStore } from '~/stores/nft'
import { useWalletStore } from '~/stores/wallet'
import { useMetaplex } from '~/composables/useMetaplex'
import { useMarketplace } from '~/composables/useMarketplace'
import type { NFTListing } from '~/stores/marketplace'

const router = useRouter()
const nftStore = useNftStore()
const walletStore = useWalletStore()
const { fetchWalletNfts } = useMetaplex()
const { listNft, unlistNft } = useMarketplace()

const loading = ref(false)
const activeTab = ref<'all' | 'listed' | 'unlisted'>('all')
const selectedNft = ref<NFTListing | null>(null)
const showListModal = ref(false)

const userNfts = computed(() => nftStore.userNfts)

const listedNfts = computed(() => 
  userNfts.value.filter(nft => nft.listed && nft.price && nft.price > 0)
)

const unlistedNfts = computed(() => 
  userNfts.value.filter(nft => !nft.listed || !nft.price || nft.price <= 0)
)

const filteredNfts = computed(() => {
  switch (activeTab.value) {
    case 'listed':
      return listedNfts.value
    case 'unlisted':
      return unlistedNfts.value
    default:
      return userNfts.value
  }
})

const listedCount = computed(() => listedNfts.value.length)
const unlistedCount = computed(() => unlistedNfts.value.length)
const totalValue = computed(() => 
  listedNfts.value.reduce((sum, nft) => sum + (nft.price || 0), 0)
)

const loadUserNfts = async () => {
  if (!walletStore.publicKey) return

  loading.value = true
  try {
    const nfts = await fetchWalletNfts(walletStore.publicKey)
    nftStore.setUserNfts(nfts)
  } catch (error) {
    console.error('Error loading user NFTs:', error)
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
    await loadUserNfts()
  }
}

const confirmUnlist = async () => {
  if (!selectedNft.value || !walletStore.publicKey) return

  const success = await unlistNft(selectedNft.value.mint, walletStore.publicKey)
  if (success) {
    showListModal.value = false
    selectedNft.value = null
    await loadUserNfts()
  }
}

// Watch for wallet connection changes
watch(() => walletStore.connected, (connected) => {
  if (connected) {
    loadUserNfts()
  } else {
    nftStore.setUserNfts([])
  }
})

onMounted(() => {
  if (walletStore.connected) {
    loadUserNfts()
  }
})

// Set page meta
definePageMeta({
  layout: 'default',
})
</script>

<style scoped>
.tab {
  @apply px-4 py-3 text-gray-400 hover:text-white transition-colors relative;
}

.tab-active {
  @apply text-white font-medium;
}

.tab-active::after {
  content: '';
  @apply absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-kwami-purple to-kwami-blue;
}
</style>

