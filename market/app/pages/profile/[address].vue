<template>
  <div>
    <!-- Loading State -->
    <LoadingSpinner v-if="loading" message="Loading profile..." />

    <!-- Profile Content -->
    <div v-else>
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-4">
          <div class="w-20 h-20 bg-gradient-to-br from-kwami-purple to-kwami-blue rounded-full flex items-center justify-center text-4xl">
            👤
          </div>
          <div>
            <h1 class="text-4xl font-bold mb-2">
              {{ isOwnProfile ? 'My Profile' : 'User Profile' }}
            </h1>
            <div class="flex items-center space-x-2">
              <p class="text-gray-400 font-mono">{{ shortAddress }}</p>
              <button
                @click="copyAddress"
                class="p-1.5 hover:bg-gray-700 rounded"
                title="Copy address"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              </button>
              <a
                :href="`https://explorer.solana.com/address/${address}?cluster=${network}`"
                target="_blank"
                class="p-1.5 hover:bg-gray-700 rounded"
                title="View on Solana Explorer"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="card text-center">
            <p class="text-3xl font-bold">{{ nfts.length }}</p>
            <p class="text-sm text-gray-400">KWAMIs Owned</p>
          </div>
          <div class="card text-center">
            <p class="text-3xl font-bold">{{ listedCount }}</p>
            <p class="text-sm text-gray-400">Listed for Sale</p>
          </div>
          <div class="card text-center">
            <p class="text-3xl font-bold">0</p>
            <p class="text-sm text-gray-400">Total Sales</p>
          </div>
          <div class="card text-center">
            <p class="text-3xl font-bold">0</p>
            <p class="text-sm text-gray-400">Volume (SOL)</p>
          </div>
        </div>
      </div>

      <!-- Go to My KWAMIs button if own profile -->
      <div v-if="isOwnProfile" class="mb-6 card p-4">
        <div class="flex items-center justify-between">
          <p class="text-gray-400">Viewing your public profile</p>
          <NuxtLink to="/my-kwamis" class="btn btn-primary">
            Go to My KWAMIs
          </NuxtLink>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="nfts.length === 0" class="card text-center py-16">
        <div class="text-6xl mb-4">👻</div>
        <h3 class="text-2xl font-bold mb-2">No KWAMIs</h3>
        <p class="text-gray-400 mb-6">
          {{ isOwnProfile ? 'You don\'t own any KWAMIs yet' : 'This user doesn\'t own any KWAMIs' }}
        </p>
        <NuxtLink v-if="isOwnProfile" to="/" class="btn btn-primary">
          Browse Marketplace
        </NuxtLink>
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
import { useWalletStore } from '~/stores/wallet'
import { useMetaplex } from '~/composables/useMetaplex'
import { useSolana } from '~/composables/useSolana'
import type { NFTListing } from '~/stores/marketplace'

const route = useRoute()
const router = useRouter()
const walletStore = useWalletStore()
const { fetchWalletNfts } = useMetaplex()
const { network } = useSolana()

const loading = ref(true)
const nfts = ref<NFTListing[]>([])

const address = computed(() => route.params.address as string)
const shortAddress = computed(() => {
  const addr = address.value
  return `${addr.slice(0, 8)}...${addr.slice(-8)}`
})

const isOwnProfile = computed(() => {
  return walletStore.publicKey === address.value
})

const listedCount = computed(() => {
  return nfts.value.filter(nft => nft.listed && nft.price && nft.price > 0).length
})

const loadProfile = async () => {
  loading.value = true
  try {
    const fetchedNfts = await fetchWalletNfts(address.value)
    nfts.value = fetchedNfts
  } catch (error) {
    console.error('Error loading profile:', error)
  } finally {
    loading.value = false
  }
}

const navigateToNft = (mint: string) => {
  router.push(`/nft/${mint}`)
}

const copyAddress = async () => {
  await navigator.clipboard.writeText(address.value)
  // Could add a toast notification here
}

onMounted(() => {
  loadProfile()
})

// Set page meta
definePageMeta({
  layout: 'default',
})
</script>

