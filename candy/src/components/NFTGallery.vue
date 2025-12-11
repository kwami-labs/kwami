<template>
  <div class="nft-gallery">
    <div v-if="nftStore.loading" class="text-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 animate-spin text-primary-500 dark:text-primary-400 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400">Loading your KWAMIs...</p>
    </div>

    <div v-else-if="nftStore.ownedNfts.length === 0" class="text-center py-12">
      <div class="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-heroicons-cube-transparent" class="w-12 h-12 text-gray-400 dark:text-gray-600" />
      </div>
      <p class="text-xl text-gray-600 dark:text-gray-400 mb-2">No KWAMIs Yet</p>
      <p class="text-sm text-gray-500">Mint your first KWAMI NFT above!</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="nft in nftStore.ownedNfts"
        :key="nft.mint"
        class="hover:ring-2 hover:ring-primary-500 transition-all cursor-pointer"
      >
        <template #header>
          <div class="aspect-square bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
            <img
              v-if="nft.image"
              :src="nft.image"
              :alt="nft.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-heroicons-cube-transparent" class="w-16 h-16 text-gray-400 dark:text-gray-600" />
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <div>
            <h4 class="font-bold text-lg text-gray-900 dark:text-white">{{ nft.name }}</h4>
            <p class="text-sm text-gray-500 font-mono">{{ shortenAddress(nft.mint) }}</p>
          </div>

          <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">DNA</p>
            <p class="font-mono text-xs break-all text-gray-600 dark:text-gray-300">{{ nft.dna.slice(0, 32) }}...</p>
          </div>

          <div class="flex space-x-2">
            <UButton block size="sm" color="gray" variant="soft">
              View
            </UButton>
            <UButton block size="sm" color="primary" variant="soft">
              Update
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useNFTStore } from '@/stores/nft'
import { useWalletStore } from '@/stores/wallet'

const nftStore = useNFTStore()
const wallet = useWalletStore()

const shortenAddress = (address: string) => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

onMounted(async () => {
  if (wallet.connected) {
    await nftStore.fetchOwnedNfts()
  }
})

watch(() => wallet.connected, async (connected) => {
  if (connected) {
    await nftStore.fetchOwnedNfts()
  }
})
</script>
