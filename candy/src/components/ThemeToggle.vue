<template>
  <button
    type="button"
    @click="toggleTheme"
    class="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
    :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
  >
    <span class="block w-5 h-5 text-gray-600 dark:text-gray-300" aria-hidden="true">
      <!-- Sun/Moon (minimal inline SVG) -->
      <svg v-if="!isDark" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" stroke="currentColor" stroke-width="2"/>
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 12.8A8.5 8.5 0 0 1 11.2 3a6.5 6.5 0 1 0 9.8 9.8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      </svg>
    </span>
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>
