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
            <h3 class="text-2xl font-bold">Buy KWAMI</h3>
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
            <p class="text-gray-400 text-sm">{{ nft.description }}</p>
          </div>

          <!-- Price Details -->
          <div class="space-y-3 mb-6 p-4 bg-gray-800/50 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-gray-400">Price</span>
              <span class="font-bold text-lg">{{ nft.price }} SOL</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-400">Marketplace Fee (2.5%)</span>
              <span>{{ ((nft.price || 0) * 0.025).toFixed(4) }} SOL</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-400">Creator Royalty (5%)</span>
              <span>{{ ((nft.price || 0) * 0.05).toFixed(4) }} SOL</span>
            </div>
            <div class="border-t border-gray-700 pt-3 flex items-center justify-between">
              <span class="font-bold">Total</span>
              <span class="font-bold text-xl text-primary-400">
                {{ ((nft.price || 0) * 1.075).toFixed(4) }} SOL
              </span>
            </div>
          </div>

          <!-- Balance Check -->
          <div 
            v-if="walletStore.balance < ((nft.price || 0) * 1.075)"
            class="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg"
          >
            <p class="text-red-400 text-sm">
              Insufficient balance. You need {{ ((nft.price || 0) * 1.075 - walletStore.balance).toFixed(4) }} more SOL.
            </p>
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
              @click="$emit('confirm')"
              :disabled="walletStore.balance < ((nft.price || 0) * 1.075)"
              class="flex-1 btn btn-primary"
            >
              Confirm Purchase
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { NFTListing } from '~/stores/marketplace'
import { useWalletStore } from '~/stores/wallet'

interface Props {
  nft: NFTListing
  show: boolean
}

defineProps<Props>()

defineEmits<{
  close: []
  confirm: []
}>()

const walletStore = useWalletStore()
</script>

