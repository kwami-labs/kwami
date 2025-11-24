<template>
  <UAlert
    icon="i-ph-warning-octagon-duotone"
    color="red"
    variant="soft"
    :title="title"
    class="my-4"
  >
    <template #description>
      <div class="prose prose-sm prose-invert max-w-none">
        <slot />
      </div>
    </template>
  </UAlert>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

