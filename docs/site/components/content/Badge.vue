<template>
  <UBadge
    :color="color"
    :variant="variant"
    :size="size"
    class="inline-flex"
  >
    <slot />
  </UBadge>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    color?: 'primary' | 'emerald' | 'green' | 'blue' | 'red' | 'yellow' | 'gray'
    variant?: 'solid' | 'soft' | 'outline' | 'subtle'
    size?: 'xs' | 'sm' | 'md' | 'lg'
  }>(),
  {
    color: 'emerald',
    variant: 'soft',
    size: 'sm'
  }
)
</script>

