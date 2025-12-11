<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke-width="1.5" 
    stroke="currentColor" 
    :class="['icon', className]"
  >
    <component :is="iconPath" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  name: string;
  class?: string;
}>();

const className = computed(() => props.class || '');

// Map icon names to SVG paths
const iconPath = computed(() => {
  const icons: Record<string, string> = {
    'i-heroicons-home': 'path',
    'i-heroicons-wallet': 'path',
    'i-heroicons-document-text': 'path',
    'i-heroicons-plus-circle': 'path',
    'i-heroicons-check-circle': 'path',
    'i-heroicons-x-circle': 'path',
    'i-heroicons-arrow-path': 'path',
    'i-heroicons-clock': 'path',
    'i-heroicons-exclamation-triangle': 'path',
    'i-heroicons-lock-closed': 'path',
    'i-heroicons-document': 'path',
    'i-heroicons-plus': 'path',
  };
  
  // For simplicity, return a generic path - you can expand this later
  return 'path';
});
</script>

<style scoped>
.icon {
  width: 1.5rem;
  height: 1.5rem;
  display: inline-block;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
