<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-2">Activity</h1>
      <p class="text-gray-400">Recent marketplace activity and transactions</p>
    </div>

    <!-- Coming Soon -->
    <div class="card text-center py-16">
      <div class="text-6xl mb-4">📊</div>
      <h3 class="text-2xl font-bold mb-2">Activity Feed Coming Soon</h3>
      <p class="text-gray-400 mb-6 max-w-lg mx-auto">
        Track sales, listings, offers, and transfers across the KWAMI marketplace. 
        This feature is currently under development.
      </p>
      <NuxtLink to="/" class="btn btn-primary">
        Back to Marketplace
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// Set page meta
definePageMeta({
  layout: 'default',
})
</script>

