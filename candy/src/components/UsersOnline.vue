<template>
  <div 
    class="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary-500/50 transition-all cursor-pointer duration-300"
    title="Users currently online"
  >
    <!-- Connection Status Indicator -->
    <div 
      class="w-2 h-2 rounded-full transition-all"
      :class="socketStore.isConnected ? 'bg-green-500 dark:bg-green-400 animate-pulse' : 'bg-gray-400 dark:bg-gray-600'"
    />
    
    <!-- Users Icon -->
    <UIcon 
      name="i-heroicons-users" 
      class="w-4 h-4"
      :class="socketStore.isConnected ? 'text-green-600 dark:text-green-400' : 'text-gray-500'"
    />
    
    <!-- User Count -->
    <span 
      class="text-sm font-semibold font-mono"
      :class="socketStore.isConnected ? 'text-gray-900 dark:text-white' : 'text-gray-500'"
    >
      {{ socketStore.connectedUsers }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useSocketStore } from '@/stores/socket'

const socketStore = useSocketStore()
</script>
