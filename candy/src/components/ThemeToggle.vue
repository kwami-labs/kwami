<template>
  <button
    @click="toggleTheme"
    class="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
    :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
  >
    <UIcon
      :name="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
      class="w-5 h-5 text-gray-600 dark:text-gray-300"
    />
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import UIcon from './ui/UIcon.vue'

const { isDark, toggleTheme } = useTheme()
</script>
