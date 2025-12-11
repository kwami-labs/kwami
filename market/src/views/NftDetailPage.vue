<template>
  <div>
    <!-- Loading State -->
    <LoadingSpinner v-if="loading" message="Loading KWAMI..." />

    <!-- Error State -->
    <div v-else-if="error" class="card text-center py-16">
      <div class="text-6xl mb-4">⚠️</div>
      <h2 class="text-2xl font-bold mb-2">Error Loading NFT</h2>
      <p class="text-gray-400 mb-6">{{ error }}</p>
      <RouterLink to="/" class="btn btn-primary">
        Back to Marketplace
      </RouterLink>
    </div>

    <!-- NFT Details -->
    <div v-else-if="nft" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left Column: Media -->
      <div>
        <div class="sticky top-24">
          <!-- Main Image -->
          <div class="aspect-square rounded-2xl overflow-hidden bg-gray-900 mb-4">
            <img
              v-if="nft.image"
              :src="nft.image"
              :alt="nft.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <span class="text-8xl">👻</span>
            </div>
          </div>

          <!-- Additional Info Cards -->
          <div class="grid grid-cols-2 gap-4">
            <div class="card text-center">
              <p class="text-sm text-gray-400 mb-1">Contract</p>
              <p class="text-xs font-mono">{{ shortAddress(mint) }}</p>
            </div>
            <div class="card text-center">
              <p class="text-sm text-gray-400 mb-1">Token Standard</p>
              <p class="text-sm font-medium">Metaplex NFT</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Details -->
      <div class="space-y-6">
        <!-- Header -->
        <div>
          <div class="flex items-center space-x-2 mb-2">
            <RouterLink to="/" class="text-primary-400 hover:text-primary-300 text-sm">
              KWAMI Collection
            </RouterLink>
            <span class="text-gray-600">→</span>
            <span class="text-sm text-gray-400">{{ nft.name }}</span>
          </div>
          
          <h1 class="text-4xl font-bold mb-2">{{ nft.name }}</h1>
          
          <div class="flex items-center space-x-4">
            <RouterLink
              :to="`/profile/${nft.owner}`"
              class="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-kwami-purple flex items-center justify-center">
                <span class="text-sm">👤</span>
              </div>
              <span class="text-sm">{{ shortAddress(nft.owner) }}</span>
            </RouterLink>

            <span v-if="nft.rarity" class="badge badge-warning">
              {{ nft.rarity }}
            </span>
          </div>
        </div>

        <!-- Price & Actions -->
        <div class="card" v-if="nft.listed && nft.price">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-sm text-gray-400 mb-1">Current Price</p>
              <div class="flex items-center space-x-2">
                <svg class="w-6 h-6 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                </svg>
                <span class="text-3xl font-bold">{{ nft.price }}</span>
                <span class="text-gray-400">SOL</span>
              </div>
            </div>
          </div>

          <div class="flex space-x-3">
            <button
              v-if="!isOwner"
              @click="handleBuy"
              :disabled="!walletStore.connected"
              class="btn btn-primary flex-1"
            >
              Buy Now
            </button>
            <button
              v-if="isOwner"
              @click="handleUnlist"
              class="btn btn-secondary flex-1"
            >
              Unlist
            </button>
            <button class="btn btn-outline">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="card" v-else-if="isOwner">
          <p class="text-sm text-gray-400 mb-4">This KWAMI is not listed for sale</p>
          <button
            @click="handleList"
            class="btn btn-primary w-full"
          >
            List for Sale
          </button>
        </div>

        <!-- Description -->
        <div class="card">
          <h2 class="text-xl font-bold mb-3">Description</h2>
          <p class="text-gray-300 leading-relaxed">
            {{ nft.description || 'No description available.' }}
          </p>
        </div>

        <!-- Attributes -->
        <div class="card" v-if="nft.attributes && nft.attributes.length > 0">
          <h2 class="text-xl font-bold mb-4">Attributes</h2>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="attr in nft.attributes"
              :key="attr.trait_type"
              class="bg-gray-800/50 p-4 rounded-xl"
            >
              <p class="text-xs text-gray-400 mb-1">{{ attr.trait_type }}</p>
              <p class="font-medium">{{ attr.value }}</p>
            </div>
          </div>
        </div>

        <!-- DNA Hash -->
        <div class="card" v-if="nft.dnaHash">
          <h2 class="text-xl font-bold mb-3">DNA</h2>
          <div class="bg-gray-800/50 p-4 rounded-xl">
            <p class="text-xs text-gray-400 mb-2">Unique DNA Hash</p>
            <p class="font-mono text-sm break-all text-primary-400">
              {{ nft.dnaHash }}
            </p>
          </div>
        </div>

        <!-- Details -->
        <div class="card">
          <h2 class="text-xl font-bold mb-4">Details</h2>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-400">Contract Address</span>
              <a
                :href="`https://solscan.io/token/${mint}?cluster=devnet`"
                target="_blank"
                class="text-primary-400 hover:text-primary-300 font-mono text-sm"
              >
                {{ shortAddress(mint) }} ↗
              </a>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Token ID</span>
              <span class="font-mono text-sm">{{ mint.slice(-8) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Token Standard</span>
              <span class="text-sm">Metaplex NFT</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Blockchain</span>
              <span class="text-sm">Solana</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <BuyModal
      v-if="nft"
      :nft="nft"
      :show="showBuyModal"
      @close="showBuyModal = false"
      @confirm="confirmBuy"
    />

    <ListModal
      v-if="nft"
      :nft="nft"
      :show="showListModal"
      @close="showListModal = false"
      @confirm="confirmList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMetaplex } from '@/composables/useMetaplex'
import { useMarketplace } from '@/composables/useMarketplace'
import { useWalletStore } from '@/stores/wallet'
import type { NFTListing } from '@/stores/marketplace'

const route = useRoute()
const router = useRouter()
const walletStore = useWalletStore()
const { fetchNftByMint } = useMetaplex()
const { buyNft, listNft, unlistNft } = useMarketplace()

const mint = computed(() => route.params.mint as string)
const nft = ref<NFTListing | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showBuyModal = ref(false)
const showListModal = ref(false)

const isOwner = computed(() => {
  return walletStore.publicKey === nft.value?.owner
})

const shortAddress = (address: string) => {
  if (!address) return ''
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

const loadNft = async () => {
  try {
    loading.value = true
    error.value = null
    
    const fetchedNft = await fetchNftByMint(mint.value)
    if (!fetchedNft) {
      error.value = 'NFT not found'
      return
    }
    
    nft.value = fetchedNft
  } catch (err: any) {
    console.error('Error loading NFT:', err)
    error.value = err.message || 'Failed to load NFT'
  } finally {
    loading.value = false
  }
}

const handleBuy = () => {
  if (!walletStore.connected) {
    alert('Please connect your wallet first')
    return
  }
  showBuyModal.value = true
}

const handleList = () => {
  if (!walletStore.connected) {
    alert('Please connect your wallet first')
    return
  }
  showListModal.value = true
}

const handleUnlist = async () => {
  if (!walletStore.publicKey || !nft.value) return
  
  const success = await unlistNft(nft.value.mint, walletStore.publicKey)
  if (success) {
    await loadNft()
  }
}

const confirmBuy = async () => {
  if (!nft.value || !walletStore.publicKey) return
  
  const success = await buyNft(nft.value, walletStore.publicKey)
  if (success) {
    showBuyModal.value = false
    router.push('/my-kwamis')
  }
}

const confirmList = async (price: number) => {
  if (!nft.value || !walletStore.publicKey) return
  
  const success = await listNft(nft.value, price, walletStore.publicKey)
  if (success) {
    showListModal.value = false
    await loadNft()
  }
}

onMounted(() => {
  loadNft()
})

</script>
