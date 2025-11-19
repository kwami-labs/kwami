<template>
  <div class="flex flex-col items-center justify-center py-12">
    <div class="relative w-16 h-16 mb-4">
      <div class="absolute inset-0 border-4 border-primary-600/20 rounded-full"></div>
      <div class="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
    </div>
    <p v-if="message" class="text-gray-400 text-sm">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Loading...',
})
</script>

