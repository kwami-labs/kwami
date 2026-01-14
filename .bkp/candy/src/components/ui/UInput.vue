<template>
  <div class="relative">
    <input
      :value="modelValue"
      :type="type || 'text'"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxlength"
      class="block w-full rounded-md border-0 bg-white dark:bg-gray-900 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 disabled:opacity-50 disabled:cursor-not-allowed"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  maxlength?: number | string
}>()

defineEmits(['update:modelValue'])
</script>
