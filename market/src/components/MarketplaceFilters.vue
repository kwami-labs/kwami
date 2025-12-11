<template>
  <div class="card sticky top-4">
    <h3 class="text-xl font-bold mb-4">Filters</h3>

    <!-- Search -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">Search</label>
      <input
        v-model="localFilters.search"
        type="text"
        placeholder="Search by name or mint..."
        class="input w-full"
        @input="debouncedUpdate"
      />
    </div>

    <!-- Price Range -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">Price Range (SOL)</label>
      <div class="grid grid-cols-2 gap-3">
        <input
          v-model.number="localFilters.priceMin"
          type="number"
          placeholder="Min"
          min="0"
          step="0.1"
          class="input"
          @change="handleUpdate"
        />
        <input
          v-model.number="localFilters.priceMax"
          type="number"
          placeholder="Max"
          min="0"
          step="0.1"
          class="input"
          @change="handleUpdate"
        />
      </div>
    </div>

    <!-- Rarity -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">Rarity</label>
      <div class="space-y-2">
        <label 
          v-for="rarity in rarityOptions"
          :key="rarity"
          class="flex items-center space-x-2 cursor-pointer hover:bg-gray-700/30 p-2 rounded"
        >
          <input
            type="checkbox"
            :value="rarity"
            v-model="localFilters.rarity"
            @change="handleUpdate"
            class="checkbox"
          />
          <span>{{ rarity }}</span>
        </label>
      </div>
    </div>

    <!-- Sort By -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">Sort By</label>
      <select 
        v-model="localFilters.sortBy"
        @change="handleUpdate"
        class="input w-full"
      >
        <option value="recent">Recently Listed</option>
        <option value="oldest">Oldest First</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>

    <!-- Results Count -->
    <div class="pt-4 border-t border-gray-700">
      <p class="text-sm text-gray-400">
        <span class="font-bold text-white">{{ resultsCount }}</span> 
        {{ resultsCount === 1 ? 'result' : 'results' }} found
      </p>
    </div>

    <!-- Clear Filters -->
    <button
      @click="clearFilters"
      class="btn btn-outline w-full mt-4"
    >
      Clear Filters
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { MarketplaceFilters } from '@/stores/marketplace'

interface Props {
  filters: MarketplaceFilters
  resultsCount: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: [filters: Partial<MarketplaceFilters>]
}>()

const rarityOptions = ['Common', 'Rare', 'Epic', 'Legendary']

const localFilters = ref<MarketplaceFilters>({
  ...props.filters,
  rarity: props.filters.rarity || []
})

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  localFilters.value = {
    ...newFilters,
    rarity: newFilters.rarity || []
  }
}, { deep: true })

let debounceTimeout: NodeJS.Timeout | null = null

const debouncedUpdate = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  debounceTimeout = setTimeout(() => {
    emit('update', localFilters.value)
  }, 300)
}

const handleUpdate = () => {
  emit('update', localFilters.value)
}

const clearFilters = () => {
  localFilters.value = {
    sortBy: 'recent',
    rarity: []
  }
  emit('update', localFilters.value)
}
</script>
