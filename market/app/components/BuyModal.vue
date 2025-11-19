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
        @click.self="$emit('close')"
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
              <h2 class="text-2xl font-bold">Buy KWAMI</h2>
              <button
                @click="$emit('close')"
                class="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- NFT Preview -->
            <div class="mb-6">
              <div class="aspect-square rounded-xl overflow-hidden bg-gray-900 mb-4">
                <img
                  v-if="nft.image"
                  :src="nft.image"
                  :alt="nft.name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <span class="text-6xl">👻</span>
                </div>
              </div>
              
              <h3 class="text-xl font-bold mb-1">{{ nft.name }}</h3>
              <p class="text-gray-400 text-sm">{{ nft.symbol }}</p>
            </div>

            <!-- Price Details -->
            <div class="space-y-3 mb-6 p-4 bg-gray-800/50 rounded-xl">
              <div class="flex justify-between">
                <span class="text-gray-400">Price</span>
                <div class="flex items-center space-x-1">
                  <svg class="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                  </svg>
                  <span class="font-bold">{{ nft.price }}</span>
                  <span class="text-gray-400">SOL</span>
                </div>
              </div>

              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Network Fee (est.)</span>
                <span>0.000005 SOL</span>
              </div>

              <div class="pt-3 border-t border-gray-700 flex justify-between font-bold">
                <span>Total</span>
                <span class="text-primary-400">{{ (nft.price || 0) + 0.000005 }} SOL</span>
              </div>
            </div>

            <!-- Warning -->
            <div class="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-6">
              <div class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <p class="text-sm text-yellow-400">
                  This transaction cannot be reversed. Make sure you trust the seller.
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex space-x-3">
              <button
                @click="$emit('close')"
                class="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                @click="$emit('confirm')"
                :disabled="processing"
                class="btn btn-primary flex-1"
              >
                <span v-if="processing" class="spinner mr-2"></span>
                {{ processing ? 'Processing...' : 'Buy Now' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { NFTListing } from '~/stores/marketplace'

interface Props {
  nft: NFTListing
  show: boolean
}

defineProps<Props>()
defineEmits<{
  close: []
  confirm: []
}>()

const processing = ref(false)
</script>
