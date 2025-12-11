<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Total Listings -->
    <div class="stat-card">
      <div class="stat-icon bg-primary-500/20 text-primary-400">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
      </div>
      <div class="stat-content">
        <p class="stat-label">Total Listings</p>
        <p class="stat-value">{{ stats.totalListings }}</p>
      </div>
    </div>

    <!-- Floor Price -->
    <div class="stat-card">
      <div class="stat-icon bg-green-500/20 text-green-400">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
        </svg>
      </div>
      <div class="stat-content">
        <p class="stat-label">Floor Price</p>
        <p class="stat-value">{{ formatSol(stats.minPrice) }} ◎</p>
      </div>
    </div>

    <!-- Average Price -->
    <div class="stat-card">
      <div class="stat-icon bg-blue-500/20 text-blue-400">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      </div>
      <div class="stat-content">
        <p class="stat-label">Avg Price</p>
        <p class="stat-value">{{ formatSol(stats.avgPrice) }} ◎</p>
      </div>
    </div>

    <!-- Total Volume -->
    <div class="stat-card">
      <div class="stat-icon bg-purple-500/20 text-purple-400">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
        </svg>
      </div>
      <div class="stat-content">
        <p class="stat-label">Total Volume</p>
        <p class="stat-value">{{ formatSol(stats.totalVolume) }} ◎</p>
      </div>
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

const formatSol = (amount: number) => {
  if (amount === 0) return '0.00'
  if (amount < 0.01) return '< 0.01'
  return amount.toFixed(2)
}
</script>
