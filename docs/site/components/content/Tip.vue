<template>
  <UAlert
    icon="i-ph-lightbulb-duotone"
    color="green"
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

