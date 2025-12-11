<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <UContainer>
      <header class="py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <h1 class="text-2xl font-bold bg-gradient-to-r from-primary-600 to-green-600 dark:from-primary-400 dark:to-green-400 bg-clip-text text-transparent">
              KWAMI.io
            </h1>
            <UsersOnline />
          </div>
          
          <div class="flex items-center gap-3">
            <ThemeToggle />
            <WalletConnect />
          </div>
        </div>
      </header>
    </UContainer>

    <!-- Hero Section -->
    <main class="flex-1">
      <UContainer>
        <!-- Hero Content -->
        <div class="text-center mb-16 mt-8">
          <h2 class="text-6xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-green-600 dark:from-primary-400 dark:to-green-400 bg-clip-text text-transparent">
            Mint Your Unique KWAMI
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Create a one-of-a-kind AI companion NFT on Solana blockchain. 
            Each KWAMI has unique DNA - 10 billion by 2100, one for every human on Earth.
          </p>
          
          <!-- Stats -->
          <div class="flex justify-center space-x-8 mb-12">
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ mintedCount.toLocaleString() }}</div>
              <div class="text-sm text-gray-500">Minted</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-primary-600 dark:text-primary-400">1T</div>
              <div class="text-sm text-gray-500">Max Supply</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ remainingCount.toLocaleString() }}</div>
              <div class="text-sm text-gray-500">Remaining</div>
            </div>
          </div>
        </div>

        <!-- Candy Machine Interface -->
        <div class="max-w-6xl mx-auto mb-16">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Blob Preview -->
            <UCard>
              <template #header>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Preview Your KWAMI</h3>
              </template>
              <BlobPreview ref="blobPreviewRef" />
            </UCard>

            <!-- Mint Panel -->
            <UCard>
              <template #header>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Create & Mint</h3>
              </template>
              <MintPanel :blob-preview-ref="blobPreviewRef" />
            </UCard>
          </div>
        </div>

        <!-- NFT Gallery -->
        <div class="mb-16" v-if="wallet.connected">
          <h3 class="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Your KWAMIs</h3>
          <NFTGallery />
        </div>
      </UContainer>
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200 dark:border-gray-800 py-8">
      <UContainer>
        <div class="text-center text-gray-500">
          <p>© 2025 Kwami.io - Powered by Solana Blockchain</p>
          <p class="text-sm mt-2">Part of the KWAMI Ecosystem</p>
        </div>
      </UContainer>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import { useNFTStore } from '@/stores/nft'
import UsersOnline from '@/components/UsersOnline.vue'
import WalletConnect from '@/components/WalletConnect.vue'
import BlobPreview from '@/components/BlobPreview.vue'
import MintPanel from '@/components/MintPanel.vue'
import NFTGallery from '@/components/NFTGallery.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const wallet = useWalletStore()
const nftStore = useNFTStore()
const blobPreviewRef = ref<any>(null)

// Get minting statistics
const mintedCount = ref(0)
const remainingCount = computed(() => 1_000_000_000_000 - mintedCount.value)

onMounted(async () => {
  document.title = 'Kwami.io - Mint Your Unique KWAMI NFT'
  // Load minting statistics
  await nftStore.fetchStats()
  mintedCount.value = nftStore.totalMinted
})
</script>
