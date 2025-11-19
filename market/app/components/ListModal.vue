<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        @click.self="$emit('close')"
      >
        <div class="glass rounded-2xl max-w-md w-full p-6">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold">
              {{ nft.listed ? 'Update Listing' : 'List for Sale' }}
            </h3>
            <button
              @click="$emit('close')"
              class="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>

          <!-- NFT Preview -->
          <div class="mb-6">
            <div class="aspect-square rounded-lg overflow-hidden mb-4">
              <img
                v-if="nft.image"
                :src="nft.image"
                :alt="nft.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full bg-gray-800 flex items-center justify-center">
                <span class="text-6xl">👻</span>
              </div>
            </div>
            <h4 class="font-bold text-xl">{{ nft.name }}</h4>
          </div>

          <!-- Price Input -->
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2">
              Price (SOL)
            </label>
            <input
              v-model.number="price"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              class="input"
              @input="calculateEarnings"
            />
            <p class="text-xs text-gray-400 mt-1">
              Minimum: 0.01 SOL
            </p>
          </div>

          <!-- Earnings Breakdown -->
          <div v-if="price > 0" class="space-y-2 mb-6 p-4 bg-gray-800/50 rounded-lg text-sm">
            <div class="flex items-center justify-between">
              <span class="text-gray-400">Listing Price</span>
              <span class="font-medium">{{ price.toFixed(4) }} SOL</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-400">Marketplace Fee (2.5%)</span>
              <span class="text-red-400">-{{ marketplaceFee.toFixed(4) }} SOL</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-400">Creator Royalty (5%)</span>
              <span class="text-red-400">-{{ creatorRoyalty.toFixed(4) }} SOL</span>
            </div>
            <div class="border-t border-gray-700 pt-2 flex items-center justify-between">
              <span class="font-bold">You'll Receive</span>
              <span class="font-bold text-lg text-green-400">
                {{ earnings.toFixed(4) }} SOL
              </span>
            </div>
          </div>

          <!-- Duration (Optional - for future implementation) -->
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2">
              Duration
            </label>
            <select class="input">
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30" selected>30 days</option>
              <option value="0">No expiration</option>
            </select>
          </div>

          <!-- Actions -->
          <div class="flex space-x-3">
            <button
              @click="$emit('close')"
              class="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              @click="handleConfirm"
              :disabled="price <= 0"
              class="flex-1 btn btn-primary"
            >
              {{ nft.listed ? 'Update Listing' : 'List NFT' }}
            </button>
          </div>

          <!-- Unlist Button (if already listed) -->
          <button
            v-if="nft.listed"
            @click="handleUnlist"
            class="w-full mt-3 btn btn-outline text-red-400 border-red-400 hover:bg-red-500/10"
          >
            Remove Listing
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { NFTListing } from '~/stores/marketplace'

interface Props {
  nft: NFTListing
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: [price: number]
  unlist: []
}>()

const price = ref(props.nft.price || 0)
const marketplaceFee = ref(0)
const creatorRoyalty = ref(0)
const earnings = ref(0)

const calculateEarnings = () => {
  if (price.value > 0) {
    marketplaceFee.value = price.value * 0.025
    creatorRoyalty.value = price.value * 0.05
    earnings.value = price.value - marketplaceFee.value - creatorRoyalty.value
  } else {
    marketplaceFee.value = 0
    creatorRoyalty.value = 0
    earnings.value = 0
  }
}

const handleConfirm = () => {
  if (price.value > 0) {
    emit('confirm', price.value)
  }
}

const handleUnlist = () => {
  emit('unlist')
  emit('close')
}

// Initialize earnings calculation
calculateEarnings()
</script>

