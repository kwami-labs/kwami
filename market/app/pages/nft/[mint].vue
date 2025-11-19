<template>
  <div>
    <!-- Loading State -->
    <LoadingSpinner v-if="loading" message="Loading KWAMI details..." />

    <!-- Error State -->
    <div v-else-if="error" class="card text-center py-16">
      <div class="text-6xl mb-4">❌</div>
      <h3 class="text-2xl font-bold mb-2">Error Loading KWAMI</h3>
      <p class="text-gray-400 mb-6">{{ error }}</p>
      <NuxtLink to="/" class="btn btn-primary">
        Back to Marketplace
      </NuxtLink>
    </div>

    <!-- NFT Details -->
    <div v-else-if="nft" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left Column - Media -->
      <div class="space-y-6">
        <!-- Main Image/3D Model -->
        <div class="card overflow-hidden">
          <div class="aspect-square bg-gray-900 flex items-center justify-center">
            <img
              v-if="nft.image"
              :src="nft.image"
              :alt="nft.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="text-8xl">👻</div>
          </div>
        </div>

        <!-- Properties -->
        <div v-if="nft.attributes && nft.attributes.length > 0" class="card">
          <h3 class="font-bold text-xl mb-4">Properties</h3>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="attr in nft.attributes"
              :key="attr.trait_type"
              class="p-3 bg-gray-800 rounded-lg"
            >
              <p class="text-xs text-gray-400 mb-1">{{ attr.trait_type }}</p>
              <p class="font-bold">{{ attr.value }}</p>
            </div>
          </div>
        </div>

        <!-- DNA Hash -->
        <div class="card">
          <h3 class="font-bold text-xl mb-4">DNA Information</h3>
          <div class="space-y-2">
            <div>
              <p class="text-xs text-gray-400 mb-1">DNA Hash</p>
              <p class="font-mono text-sm break-all">{{ nft.dnaHash }}</p>
            </div>
            <div class="pt-3 border-t border-gray-700">
              <p class="text-xs text-gray-400 mb-1">Mint Address</p>
              <p class="font-mono text-sm break-all">{{ nft.mint }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Details -->
      <div class="space-y-6">
        <!-- Main Info -->
        <div class="card">
          <div class="flex items-start justify-between mb-4">
            <div>
              <p class="text-sm text-gray-400 mb-1">{{ nft.symbol }}</p>
              <h1 class="text-4xl font-bold mb-2">{{ nft.name }}</h1>
              <div v-if="nft.rarity" class="inline-block">
                <span
                  class="badge"
                  :class="{
                    'badge-warning': nft.rarity === 'Legendary',
                    'badge-info': nft.rarity === 'Rare',
                    'badge-success': nft.rarity === 'Common',
                  }"
                >
                  {{ nft.rarity }}
                </span>
              </div>
            </div>
            <button
              class="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Share"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
              </svg>
            </button>
          </div>

          <p class="text-gray-300 mb-6">{{ nft.description }}</p>

          <!-- Owner Info -->
          <div class="flex items-center space-x-3 mb-6 p-4 bg-gray-800 rounded-lg">
            <div class="w-12 h-12 bg-gradient-to-br from-kwami-purple to-kwami-blue rounded-full flex items-center justify-center">
              <span class="text-2xl">👤</span>
            </div>
            <div>
              <p class="text-xs text-gray-400">Owner</p>
              <NuxtLink
                :to="`/profile/${nft.owner}`"
                class="font-mono text-sm hover:text-primary-400 transition-colors"
              >
                {{ shortAddress(nft.owner) }}
              </NuxtLink>
            </div>
          </div>

          <!-- Price & Actions -->
          <div v-if="nft.listed && nft.price" class="mb-6">
            <p class="text-sm text-gray-400 mb-2">Current Price</p>
            <div class="flex items-baseline space-x-2 mb-6">
              <svg class="w-8 h-8 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
              </svg>
              <span class="text-5xl font-bold">{{ nft.price }}</span>
              <span class="text-xl text-gray-400">SOL</span>
            </div>

            <!-- Buy Button -->
            <button
              v-if="!isOwner"
              @click="handleBuy"
              :disabled="!walletStore.connected"
              class="w-full btn btn-primary text-lg py-4"
            >
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {{ walletStore.connected ? 'Buy Now' : 'Connect Wallet to Buy' }}
            </button>

            <!-- Owner Actions -->
            <div v-else class="space-y-3">
              <button
                @click="handleUpdatePrice"
                class="w-full btn btn-primary"
              >
                Update Price
              </button>
              <button
                @click="handleUnlist"
                class="w-full btn btn-outline text-red-400 border-red-400 hover:bg-red-500/10"
              >
                Remove Listing
              </button>
            </div>
          </div>

          <!-- Not Listed -->
          <div v-else-if="isOwner" class="mb-6">
            <p class="text-gray-400 mb-4">This KWAMI is not currently listed for sale.</p>
            <button
              @click="handleList"
              class="w-full btn btn-primary text-lg py-4"
            >
              List for Sale
            </button>
          </div>

          <!-- Make Offer (if not owner) -->
          <div v-else class="mb-6">
            <p class="text-gray-400 mb-4">This KWAMI is not currently listed for sale.</p>
            <button
              @click="handleMakeOffer"
              :disabled="!walletStore.connected"
              class="w-full btn btn-outline"
            >
              Make an Offer
            </button>
          </div>
        </div>

        <!-- Additional Details -->
        <div class="card">
          <h3 class="font-bold text-xl mb-4">Details</h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between py-2 border-b border-gray-700">
              <span class="text-gray-400">Mint Address</span>
              <a
                :href="`https://explorer.solana.com/address/${nft.mint}?cluster=${network}`"
                target="_blank"
                class="font-mono text-primary-400 hover:underline flex items-center space-x-1"
              >
                <span>{{ shortAddress(nft.mint) }}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
              </a>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-700">
              <span class="text-gray-400">Token Standard</span>
              <span>Metaplex NFT</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-700">
              <span class="text-gray-400">Blockchain</span>
              <span>Solana</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-gray-400">Metadata</span>
              <a
                v-if="nft.metadata"
                :href="nft.metadata"
                target="_blank"
                class="text-primary-400 hover:underline flex items-center space-x-1"
              >
                <span>View on Arweave</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <BuyModal
      v-if="nft && showBuyModal"
      :nft="nft"
      :show="showBuyModal"
      @close="showBuyModal = false"
      @confirm="confirmBuy"
    />

    <ListModal
      v-if="nft && showListModal"
      :nft="nft"
      :show="showListModal"
      @close="showListModal = false"
      @confirm="confirmList"
      @unlist="confirmUnlist"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNftStore } from '~/stores/nft'
import { useWalletStore } from '~/stores/wallet'
import { useMetaplex } from '~/composables/useMetaplex'
import { useMarketplace } from '~/composables/useMarketplace'
import { useSolana } from '~/composables/useSolana'

const route = useRoute()
const router = useRouter()
const nftStore = useNftStore()
const walletStore = useWalletStore()
const { fetchNftByMint } = useMetaplex()
const { buyNft, listNft, unlistNft } = useMarketplace()
const { network } = useSolana()

const loading = ref(true)
const error = ref<string | null>(null)
const showBuyModal = ref(false)
const showListModal = ref(false)

const mint = computed(() => route.params.mint as string)
const nft = computed(() => nftStore.currentNft)
const isOwner = computed(() => {
  return nft.value && walletStore.publicKey === nft.value.owner
})

const shortAddress = (address: string) => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

const loadNft = async () => {
  loading.value = true
  error.value = null

  try {
    const nftData = await fetchNftByMint(mint.value)
    if (nftData) {
      nftStore.setCurrentNft(nftData)
    } else {
      error.value = 'NFT not found'
    }
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
  showListModal.value = true
}

const handleUpdatePrice = () => {
  showListModal.value = true
}

const handleUnlist = async () => {
  if (!nft.value || !walletStore.publicKey) return

  const confirmed = confirm('Are you sure you want to remove this listing?')
  if (!confirmed) return

  const success = await unlistNft(nft.value.mint, walletStore.publicKey)
  if (success) {
    await loadNft()
  }
}

const handleMakeOffer = () => {
  alert('Make offer feature coming soon!')
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

const confirmUnlist = async () => {
  await handleUnlist()
  showListModal.value = false
}

onMounted(() => {
  loadNft()
})

// Set page meta
definePageMeta({
  layout: 'default',
})
</script>

