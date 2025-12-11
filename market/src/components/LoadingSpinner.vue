<template>
  <div class="flex flex-col items-center justify-center py-16">
    <div class="relative">
      <!-- Outer Ring -->
      <div class="w-16 h-16 border-4 border-gray-700 border-t-primary-500 rounded-full animate-spin"></div>
      
      <!-- Inner Ring -->
      <div class="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-kwami-purple rounded-full animate-spin" style="animation-direction: reverse; animation-duration: 1.5s;"></div>
    </div>
    
    <p v-if="message" class="mt-6 text-lg text-gray-300 animate-pulse">
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Loading...'
})
</script>
