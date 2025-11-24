<template>
  <div class="step" :data-step="step">
    <div class="prose prose-sm prose-invert max-w-none">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  step: number | string
}>()
</script>

