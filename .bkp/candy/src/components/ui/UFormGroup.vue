<template>
  <div class="space-y-1">
    <label v-if="label" class="block text-sm font-medium leading-6 text-gray-700 dark:text-gray-200">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="mt-2">
      <slot />
    </div>
    <div v-if="$slots.help" class="text-sm text-gray-500">
      <slot name="help" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
  required?: boolean
}>()
</script>
