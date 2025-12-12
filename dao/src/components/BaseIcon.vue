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
// For now we just render a generic path and ignore the specific name.
// This avoids unused variable warnings while keeping the API flexible.
const iconPath = computed(() => 'path');
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
