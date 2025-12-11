<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm transition-colors duration-300">
    <div v-if="$slots.header" class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-800">
      <slot name="header" />
    </div>
    <div class="px-4 py-5 sm:p-6">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-4 py-4 sm:px-6 border-t border-gray-200 dark:border-gray-800">
      <slot name="footer" />
    </div>
  </div>
</template>
