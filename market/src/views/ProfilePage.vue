<template>
  <div>
    <!-- Loading State -->
    <LoadingSpinner v-if="loading" message="Loading profile..." />

    <!-- Error State -->
    <div v-else-if="error" class="card text-center py-16">
      <div class="text-6xl mb-4">⚠️</div>
      <h2 class="text-2xl font-bold mb-2">Error Loading Profile</h2>
      <p class="text-gray-400 mb-6">{{ error }}</p>
      <RouterLink to="/" class="btn btn-primary">
        Back to Marketplace
      </RouterLink>
    </div>

    <!-- Profile Content -->
    <div v-else>
      <!-- Profile Header -->
      <div class="card mb-8">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div class="flex items-center space-x-4">
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-kwami-purple flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <h1 class="text-2xl font-bold mb-1">{{ shortAddress(address) }}</h1>
              <div class="flex items-center space-x-3 text-sm text-gray-400">
                <span>{{ balance.toFixed(2) }} SOL</span>
                <button
                  @click="copyAddress"
                  class="flex items-center space-x-1 hover:text-primary-400 transition-colors"
                  title="Copy address"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  <span>Copy</span>
                </button>
                <a
                  :href="`https://solscan.io/account/${address}?cluster=devnet`"
                  target="_blank"
                  class="flex items-center space-x-1 hover:text-primary-400 transition-colors"
                  title="View on Solscan"
                >
                  <span>View on Solscan</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div v-if="isOwnProfile" class="flex items-center space-x-2">
            <RouterLink to="/my-kwamis" class="btn btn-primary">
              Manage Collection
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="stat-card">
          <div class="stat-icon bg-primary-500/20 text-primary-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Owned</p>
            <p class="stat-value">{{ nfts.length }}</p>
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

        <div class="stat-card">
          <div class="stat-icon bg-purple-500/20 text-purple-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Floor Price</p>
            <p class="stat-value">{{ minPrice > 0 ? minPrice.toFixed(2) + ' ◎' : '—' }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="nfts.length === 0" class="card text-center py-16">
        <div class="text-6xl mb-4">👻</div>
        <h2 class="text-2xl font-bold mb-2">No KWAMIs</h2>
        <p class="text-gray-400 mb-6">
          {{ isOwnProfile 
            ? 'You don\'t have any KWAMIs yet' 
            : 'This wallet doesn\'t own any KWAMIs' 
          }}
        </p>
        <RouterLink v-if="isOwnProfile" to="/create" class="btn btn-primary">
          Create KWAMI
        </RouterLink>
      </div>

      <!-- NFT Grid -->
      <div v-else>
        <h2 class="text-2xl font-bold mb-6">Collection</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <NftCard
            v-for="nft in nfts"
            :key="nft.mint"
            :nft="nft"
            @view="navigateToNft(nft.mint)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'
import { useMetaplex } from '@/composables/useMetaplex'
import { useSolana } from '@/composables/useSolana'
import type { NFTListing } from '@/stores/marketplace'

const route = useRoute()
const router = useRouter()
const walletStore = useWalletStore()
const { fetchWalletNfts } = useMetaplex()
const { getBalance } = useSolana()

const address = computed(() => route.params.address as string)
const nfts = ref<NFTListing[]>([])
const balance = ref(0)
const loading = ref(true)
const error = ref<string | null>(null)

const isOwnProfile = computed(() => {
  return walletStore.publicKey === address.value
})

const listedCount = computed(() => {
  return nfts.value.filter(nft => nft.listed).length
})

const totalValue = computed(() => {
  return nfts.value
    .filter(nft => nft.listed && nft.price)
    .reduce((sum, nft) => sum + (nft.price || 0), 0)
})

const minPrice = computed(() => {
  const listedWithPrice = nfts.value
    .filter(nft => nft.listed && nft.price && nft.price > 0)
  if (listedWithPrice.length === 0) return 0
  return Math.min(...listedWithPrice.map(nft => nft.price!))
})

const shortAddress = (addr: string) => {
  if (!addr) return ''
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

const copyAddress = async () => {
  if (address.value) {
    await navigator.clipboard.writeText(address.value)
    // Could add a toast notification here
  }
}

const navigateToNft = (mint: string) => {
  router.push(`/nft/${mint}`)
}

const loadProfile = async () => {
  try {
    loading.value = true
    error.value = null

    // Fetch balance
    balance.value = await getBalance(address.value)

    // Fetch NFTs
    const fetchedNfts = await fetchWalletNfts(address.value)
    nfts.value = fetchedNfts
  } catch (err: any) {
    console.error('Error loading profile:', err)
    error.value = err.message || 'Failed to load profile'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProfile()
})

</script>
