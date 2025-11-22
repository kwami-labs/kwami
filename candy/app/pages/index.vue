<template>
  <div class="min-h-screen flex flex-col bg-gray-950">
    <!-- Header -->
    <UContainer>
      <header class="py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <h1 class="text-2xl font-bold bg-gradient-to-r from-primary-400 to-green-400 bg-clip-text text-transparent">
              KWAMI.io
            </h1>
            <UsersOnline />
          </div>
          
          <WalletConnect />
        </div>
      </header>
    </UContainer>

    <!-- Hero Section -->
    <main class="flex-1">
      <UContainer>
        <!-- Hero Content -->
        <div class="text-center mb-16 mt-8">
          <h2 class="text-6xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-green-400 bg-clip-text text-transparent">
            Mint Your Unique KWAMI
          </h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Create a one-of-a-kind AI companion NFT on Solana blockchain. 
            Each KWAMI has unique DNA - 10 billion by 2100, one for every human on Earth.
          </p>
          
          <!-- Stats -->
          <div class="flex justify-center space-x-8 mb-12">
            <div class="text-center">
              <div class="text-3xl font-bold text-green-400">{{ mintedCount.toLocaleString() }}</div>
              <div class="text-sm text-gray-500">Minted</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-primary-400">1T</div>
              <div class="text-sm text-gray-500">Max Supply</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-400">{{ remainingCount.toLocaleString() }}</div>
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
                <h3 class="text-2xl font-bold">Preview Your KWAMI</h3>
              </template>
              <BlobPreview ref="blobPreviewRef" />
            </UCard>

            <!-- Mint Panel -->
            <UCard>
              <template #header>
                <h3 class="text-2xl font-bold">Create & Mint</h3>
              </template>
              <MintPanel :blob-preview-ref="blobPreviewRef" />
            </UCard>
          </div>
        </div>

        <!-- NFT Gallery -->
        <div class="mb-16" v-if="wallet.connected">
          <h3 class="text-3xl font-bold text-center mb-8">Your KWAMIs</h3>
          <NFTGallery />
        </div>
      </UContainer>
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-800 py-8">
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
const wallet = useWalletStore()
const nftStore = useNFTStore()
const blobPreviewRef = ref<any>(null)

// Get minting statistics
const mintedCount = ref(0)
const remainingCount = computed(() => 1_000_000_000_000 - mintedCount.value)

onMounted(async () => {
  // Load minting statistics
  await nftStore.fetchStats()
  mintedCount.value = nftStore.totalMinted
})
</script>

