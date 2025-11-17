<template>
  <div 
    class="flex items-center gap-2 px-3 py-2 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-primary-500/50 transition-all cursor-pointer"
    title="Users currently online"
  >
    <!-- Connection Status Indicator -->
    <div 
      class="w-2 h-2 rounded-full transition-all"
      :class="socketStore.isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'"
    />
    
    <!-- Users Icon -->
    <UIcon 
      name="i-heroicons-users" 
      class="w-4 h-4"
      :class="socketStore.isConnected ? 'text-green-400' : 'text-gray-500'"
    />
    
    <!-- User Count -->
    <span 
      class="text-sm font-semibold font-mono"
      :class="socketStore.isConnected ? 'text-white' : 'text-gray-500'"
    >
      {{ socketStore.connectedUsers }}
    </span>
  </div>
</template>

<script setup lang="ts">
const socketStore = useSocketStore()
</script>

