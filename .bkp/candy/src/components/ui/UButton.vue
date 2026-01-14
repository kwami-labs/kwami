<template>
  <button
    :class="[
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClasses[size || 'md'],
      variantClasses,
      block ? 'w-full' : ''
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <UIcon v-if="loading" name="i-heroicons-arrow-path" class="animate-spin mr-2 h-5 w-5" />
    <UIcon v-else-if="icon" :name="icon" class="mr-2 h-5 w-5" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UIcon from './UIcon.vue'

const props = defineProps<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  variant?: 'solid' | 'outline' | 'ghost' | 'soft' | 'link'
  block?: boolean
  loading?: boolean
  disabled?: boolean
  icon?: string
}>()

defineEmits(['click'])

const sizeClasses = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-2 text-base',
  xl: 'px-6 py-3 text-base',
}

const variantClasses = computed(() => {
  const color = props.color || 'primary'
  const variant = props.variant || 'solid'
  
  // Simplified color mapping logic for demo
  if (variant === 'solid') {
    if (color === 'primary') return 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
    if (color === 'green') return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
    if (color === 'red') return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    if (color === 'gray') return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
    return 'bg-gray-600 text-white'
  }
  
  if (variant === 'soft') {
    if (color === 'primary') return 'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/50 dark:text-primary-400 dark:hover:bg-primary-900'
    if (color === 'gray') return 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
    return 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200'
  }
  
  if (variant === 'ghost') {
    return 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
  }
  
  return ''
})
</script>
