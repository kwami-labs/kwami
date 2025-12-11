<template>
  <Icon :icon="iconName" :class="customClass" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  name: string
  class?: string
}>()

const iconName = computed(() => {
  // Convert i-heroicons-name to heroicons:name
  return props.name.replace(/^i-/, '').replace('-', ':')
})

const customClass = computed(() => props.class || '')
</script>
