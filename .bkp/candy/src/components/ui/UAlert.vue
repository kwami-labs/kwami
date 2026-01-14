<template>
  <div class="rounded-md p-4" :class="colorClasses">
    <div class="flex">
      <div class="flex-shrink-0" v-if="iconName">
        <UIcon :name="iconName" class="h-5 w-5" :class="iconColorClass" />
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium" :class="titleColorClass">{{ title }}</h3>
        <div v-if="description" class="mt-2 text-sm" :class="descriptionColorClass">
          <p>{{ description }}</p>
        </div>
        <div v-if="$slots.default" class="mt-2 text-sm" :class="descriptionColorClass">
          <slot />
        </div>
      </div>
      <div class="ml-auto pl-3" v-if="$attrs.onClose">
        <div class="-mx-1.5 -my-1.5">
          <button type="button" @click="$emit('close')" :class="closeButtonClass">
            <span class="sr-only">Dismiss</span>
            <UIcon name="i-heroicons-x-mark" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UIcon from './UIcon.vue'

const props = defineProps<{
  title?: string
  description?: string
  color?: string
  variant?: string
  icon?: string
}>()

defineEmits(['close'])

const iconName = computed(() => {
  if (props.icon) return props.icon
  if (props.color === 'red') return 'i-heroicons-x-circle'
  if (props.color === 'green') return 'i-heroicons-check-circle'
  return null
})

const colorClasses = computed(() => {
  const color = props.color || 'gray'
  if (color === 'red') return 'bg-red-500/10 border border-red-500/20'
  if (color === 'green') return 'bg-green-500/10 border border-green-500/20'
  return 'bg-gray-500/10 border border-gray-500/20'
})

const iconColorClass = computed(() => {
  const color = props.color || 'gray'
  if (color === 'red') return 'text-red-400'
  if (color === 'green') return 'text-green-400'
  return 'text-gray-400'
})

const titleColorClass = computed(() => {
  const color = props.color || 'gray'
  if (color === 'red') return 'text-red-400'
  if (color === 'green') return 'text-green-400'
  return 'text-gray-200'
})

const descriptionColorClass = computed(() => {
  const color = props.color || 'gray'
  if (color === 'red') return 'text-red-300'
  if (color === 'green') return 'text-green-300'
  return 'text-gray-300'
})

const closeButtonClass = computed(() => {
    return 'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2'
})
</script>
