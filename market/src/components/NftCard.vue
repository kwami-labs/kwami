<template>
  <RouterLink 
    :to="`/nft/${nft.mint}`"
    class="nft-card group"
  >
    <!-- Image -->
    <div class="relative aspect-square overflow-hidden bg-gray-900">
      <img
        v-if="nft.image"
        :src="nft.image"
        :alt="nft.name"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        @error="handleImageError"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <span class="text-6xl">👻</span>
      </div>

      <!-- Rarity Badge -->
      <div 
        v-if="nft.rarity"
        class="absolute top-3 right-3 badge"
        :class="{
          'badge-warning': nft.rarity === 'Legendary',
          'badge-info': nft.rarity === 'Rare',
          'badge-success': nft.rarity === 'Common',
        }"
      >
        {{ nft.rarity }}
      </div>

      <!-- Quick Actions Overlay -->
      <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
        <button
          v-if="showActions"
          @click.prevent="$emit('view')"
          class="btn btn-secondary"
        >
          View
        </button>
        <button
          v-if="showActions && isOwner"
          @click.prevent="$emit('list')"
          class="btn btn-primary"
        >
          {{ nft.listed ? 'Edit' : 'List' }}
        </button>
      </div>
    </div>

    <!-- Info -->
    <div class="p-4">
      <!-- Name & Collection -->
      <div class="mb-3">
        <h3 class="font-bold text-lg mb-1 truncate group-hover:text-primary-400 transition-colors">
          {{ nft.name }}
        </h3>
        <p class="text-sm text-gray-400">{{ nft.symbol }}</p>
      </div>

      <!-- Price & Owner -->
      <div class="flex items-center justify-between">
        <div v-if="nft.listed && nft.price">
          <p class="text-xs text-gray-400 mb-1">Price</p>
          <div class="flex items-center space-x-1">
            <svg class="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
            </svg>
            <span class="font-bold text-lg">{{ nft.price }}</span>
            <span class="text-sm text-gray-400">SOL</span>
          </div>
        </div>
        <div v-else>
          <p class="text-xs text-gray-400">Owner</p>
          <p class="text-sm font-mono">{{ shortAddress(nft.owner) }}</p>
        </div>

        <!-- Buy Button -->
        <button
          v-if="nft.listed && !isOwner"
          @click.prevent="$emit('buy')"
          class="btn btn-primary"
        >
          Buy Now
        </button>
      </div>

      <!-- Attributes Preview (if available) -->
      <div v-if="nft.attributes && nft.attributes.length > 0" class="mt-3 pt-3 border-t border-gray-700">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="attr in nft.attributes.slice(0, 3)"
            :key="attr.trait_type"
            class="text-xs px-2 py-1 bg-gray-700 rounded"
          >
            {{ attr.trait_type }}
          </span>
          <span
            v-if="nft.attributes.length > 3"
            class="text-xs px-2 py-1 bg-gray-700 rounded"
          >
            +{{ nft.attributes.length - 3 }}
          </span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NFTListing } from '~/stores/marketplace'
import { useWalletStore } from '~/stores/wallet'

interface Props {
  nft: NFTListing
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
})

defineEmits<{
  view: []
  buy: []
  list: []
}>()

const walletStore = useWalletStore()

const isOwner = computed(() => {
  return walletStore.publicKey === props.nft.owner
})

const shortAddress = (address: string) => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>

