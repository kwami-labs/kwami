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
        class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="handleClose"
      >
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="show"
            class="modal-content max-w-md w-full"
          >
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold">List KWAMI for Sale</h2>
              <button
                @click="handleClose"
                class="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- NFT Preview -->
            <div class="mb-6">
              <div class="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-xl">
                <div class="w-20 h-20 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                  <img
                    v-if="nft.image"
                    :src="nft.image"
                    :alt="nft.name"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <span class="text-3xl">👻</span>
                  </div>
                </div>
                
                <div>
                  <h3 class="font-bold">{{ nft.name }}</h3>
                  <p class="text-gray-400 text-sm">{{ nft.symbol }}</p>
                </div>
              </div>
            </div>

            <!-- Price Input -->
            <div class="mb-6">
              <label class="block text-sm font-medium mb-2">
                Sale Price (SOL)
              </label>
              <div class="relative">
                <input
                  v-model.number="price"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  class="input w-full text-lg font-bold pr-16"
                  :class="{ 'border-red-500': error }"
                />
                <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 text-gray-400">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-sm font-medium">SOL</span>
                </div>
              </div>
              <p v-if="error" class="mt-2 text-sm text-red-400">{{ error }}</p>
            </div>

            <!-- Suggested Prices -->
            <div class="mb-6">
              <p class="text-sm text-gray-400 mb-2">Suggested Prices</p>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="suggested in suggestedPrices"
                  :key="suggested"
                  @click="price = suggested"
                  class="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  {{ suggested }} SOL
                </button>
              </div>
            </div>

            <!-- Fee Breakdown -->
            <div class="space-y-2 mb-6 p-4 bg-gray-800/50 rounded-xl text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Listing Price</span>
                <span>{{ price || 0 }} SOL</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Marketplace Fee (2.5%)</span>
                <span>{{ ((price || 0) * 0.025).toFixed(4) }} SOL</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Creator Royalty (5%)</span>
                <span>{{ ((price || 0) * 0.05).toFixed(4) }} SOL</span>
              </div>
              <div class="pt-2 border-t border-gray-700 flex justify-between font-bold">
                <span>You'll Receive</span>
                <span class="text-primary-400">
                  {{ ((price || 0) * 0.925).toFixed(4) }} SOL
                </span>
              </div>
            </div>

            <!-- Info -->
            <div class="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-6">
              <div class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
                <p class="text-sm text-blue-400">
                  Your NFT will be transferred to an escrow account until sold or cancelled.
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex space-x-3">
              <button
                @click="handleClose"
                class="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                @click="handleConfirm"
                :disabled="!price || price <= 0 || processing"
                class="btn btn-primary flex-1"
              >
                <span v-if="processing" class="spinner mr-2"></span>
                {{ processing ? 'Listing...' : 'List for Sale' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { NFTListing } from '~/stores/marketplace'

interface Props {
  nft: NFTListing
  show: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  confirm: [price: number]
}>()

const price = ref<number>(props.nft.price || 0)
const error = ref<string>('')
const processing = ref(false)

const suggestedPrices = [0.5, 1.0, 2.5]

watch(() => props.show, (newVal) => {
  if (newVal) {
    price.value = props.nft.price || 0
    error.value = ''
  }
})

watch(price, (newVal) => {
  if (newVal && newVal <= 0) {
    error.value = 'Price must be greater than 0'
  } else {
    error.value = ''
  }
})

const handleClose = () => {
  if (!processing.value) {
    emit('close')
  }
}

const handleConfirm = () => {
  if (!price.value || price.value <= 0) {
    error.value = 'Please enter a valid price'
    return
  }
  
  emit('confirm', price.value)
}
</script>
