<template>
  <UCard
    :ui="{
      base: 'my-6',
      background: 'bg-white/5 dark:bg-white/5',
      ring: 'ring-1 ring-white/10',
      rounded: 'rounded-2xl',
      shadow: 'shadow-xl',
      body: {
        padding: 'p-6 sm:p-8'
      }
    }"
  >
    <template v-if="title" #header>
      <h3 class="text-xl font-semibold text-white">{{ title }}</h3>
    </template>

    <div class="prose prose-sm prose-invert max-w-none">
      <slot />
    </div>

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

