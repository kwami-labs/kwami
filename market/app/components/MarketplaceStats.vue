<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <!-- Total Listings -->
    <div class="card text-center">
      <div class="text-3xl mb-2">📊</div>
      <p class="text-2xl font-bold">{{ stats.totalListings }}</p>
      <p class="text-sm text-gray-400">Total Listings</p>
    </div>

    <!-- Total Volume -->
    <div class="card text-center">
      <div class="text-3xl mb-2">💎</div>
      <p class="text-2xl font-bold">{{ stats.totalVolume.toFixed(2) }}</p>
      <p class="text-sm text-gray-400">Total Volume (SOL)</p>
    </div>

    <!-- Average Price -->
    <div class="card text-center">
      <div class="text-3xl mb-2">📈</div>
      <p class="text-2xl font-bold">{{ stats.avgPrice.toFixed(2) }}</p>
      <p class="text-sm text-gray-400">Avg Price (SOL)</p>
    </div>

    <!-- Floor Price -->
    <div class="card text-center">
      <div class="text-3xl mb-2">🔥</div>
      <p class="text-2xl font-bold">{{ stats.minPrice.toFixed(2) }}</p>
      <p class="text-sm text-gray-400">Floor Price (SOL)</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  stats: {
    totalListings: number
    totalVolume: number
    avgPrice: number
    minPrice: number
    maxPrice: number
  }
}

defineProps<Props>()
</script>

