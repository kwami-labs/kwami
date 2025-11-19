<template>
  <div class="card space-y-6">
    <div>
      <h3 class="font-bold text-lg mb-4">Filters</h3>
    </div>

    <!-- Search -->
    <div>
      <label class="block text-sm font-medium mb-2">Search</label>
      <input
        v-model="localFilters.search"
        type="text"
        placeholder="Search by name or mint..."
        class="input"
        @input="debouncedUpdate"
      />
    </div>

    <!-- Price Range -->
    <div>
      <label class="block text-sm font-medium mb-2">Price Range (SOL)</label>
      <div class="grid grid-cols-2 gap-2">
        <input
          v-model.number="localFilters.priceMin"
          type="number"
          placeholder="Min"
          min="0"
          step="0.1"
          class="input"
          @input="debouncedUpdate"
        />
        <input
          v-model.number="localFilters.priceMax"
          type="number"
          placeholder="Max"
          min="0"
          step="0.1"
          class="input"
          @input="debouncedUpdate"
        />
      </div>
    </div>

    <!-- Rarity -->
    <div>
      <label class="block text-sm font-medium mb-2">Rarity</label>
      <div class="space-y-2">
        <label
          v-for="rarity in rarities"
          :key="rarity"
          class="flex items-center space-x-2 cursor-pointer"
        >
          <input
            type="checkbox"
            :value="rarity"
            :checked="localFilters.rarity?.includes(rarity)"
            @change="toggleRarity(rarity)"
            class="w-4 h-4 rounded border-gray-600 bg-gray-800 text-primary-600 focus:ring-primary-600 focus:ring-offset-gray-900"
          />
          <span class="text-sm">{{ rarity }}</span>
        </label>
      </div>
    </div>

    <!-- Sort By -->
    <div>
      <label class="block text-sm font-medium mb-2">Sort By</label>
      <select
        v-model="localFilters.sortBy"
        class="input"
        @change="updateFilters"
      >
        <option value="recent">Recently Listed</option>
        <option value="oldest">Oldest Listed</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>

    <!-- Clear Filters -->
    <button
      @click="clearFilters"
      class="w-full btn btn-outline"
    >
      Clear All Filters
    </button>

    <!-- Results Count -->
    <div class="pt-4 border-t border-gray-700">
      <p class="text-sm text-gray-400 text-center">
        <span class="font-bold text-white">{{ resultsCount }}</span> 
        {{ resultsCount === 1 ? 'result' : 'results' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { MarketplaceFilters } from '~/stores/marketplace'

interface Props {
  filters: MarketplaceFilters
  resultsCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [filters: Partial<MarketplaceFilters>]
}>()

const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']

const localFilters = reactive<MarketplaceFilters>({
  ...props.filters,
  rarity: props.filters.rarity || [],
})

// Debounce timer
let debounceTimer: NodeJS.Timeout | null = null

const debouncedUpdate = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  debounceTimer = setTimeout(() => {
    updateFilters()
  }, 300)
}

const updateFilters = () => {
  emit('update', { ...localFilters })
}

const toggleRarity = (rarity: string) => {
  if (!localFilters.rarity) {
    localFilters.rarity = []
  }
  
  const index = localFilters.rarity.indexOf(rarity)
  if (index >= 0) {
    localFilters.rarity.splice(index, 1)
  } else {
    localFilters.rarity.push(rarity)
  }
  
  updateFilters()
}

const clearFilters = () => {
  localFilters.search = undefined
  localFilters.priceMin = undefined
  localFilters.priceMax = undefined
  localFilters.rarity = []
  localFilters.sortBy = 'recent'
  updateFilters()
}

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  Object.assign(localFilters, newFilters)
}, { deep: true })
</script>

