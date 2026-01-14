<template>
  <button
    type="button"
    @click="toggleTheme"
    class="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
    :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
  >
    <Icon
      :name="isDark ? 'solar:moon-bold' : 'solar:sun-bold'"
      size="md"
      class="text-gray-600 dark:text-gray-300"
    />
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import Icon from '@/components/Icon.vue'

const { isDark, toggleTheme } = useTheme()
</script>
