<template>
  <input
    type="range"
    :value="modelValue"
    @input="onInput"
    :step="step ?? 1"
    :min="min ?? 0"
    :max="max ?? 100"
    class="h-2 w-full cursor-pointer rounded-lg bg-gray-300/50 dark:bg-gray-600/50 accent-primary-500"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  step?: number
  min?: number
  max?: number
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>();

const onInput = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value);
  if (!Number.isNaN(val)) emit('update:modelValue', val);
};
</script>
