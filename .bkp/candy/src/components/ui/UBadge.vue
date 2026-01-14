<template>
  <span :class="['inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset', colorClasses]">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  color?: string
  variant?: string
}>()

const colorClasses = computed(() => {
  const color = props.color || 'primary'
  
  if (color === 'green') return 'bg-green-500/10 text-green-400 ring-green-500/20'
  if (color === 'red') return 'bg-red-500/10 text-red-400 ring-red-500/20'
  if (color === 'primary') return 'bg-primary-500/10 text-primary-400 ring-primary-500/20'
  
  return 'bg-gray-500/10 text-gray-400 ring-gray-500/20'
})
</script>
