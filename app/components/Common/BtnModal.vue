<template>
  <UButton
    color="gray"
    variant="ghost"
    :icon="!isOpen ? icon : 'i-heroicons-x-mark-20-solid'"
    class="hover:shadow-sm !shadow-gray-400/80 dark:hover:bg-gray-800/80
      active:shadow-inner transition-all duration-300 ease-in-out border
      active:duration-500 active:!opacity-80 !ring-0 focus-visible:!ring-0
      border-transparent hover:border-gray-200 hover:dark:border-gray-600
      active:bg-white dark:active:bg-gray-900 dark:shadow-gray-800 h-6 px-0
      -pl-2"
    :ui="{
      color: {
        gray: {
          ghost: '!ring-0 focus-visible:!ring-0'
        }
      }
    }"
    @click="onClick"
  />
</template>

<script setup lang="ts">

defineProps<{
  onClick:() => void;
  isOpen: boolean;
  title: string;
  icon: string;
  isTooltip?: boolean;
}>();

</script>
