<template>
  <UTabs :items="tabItems" class="my-6">
    <template v-for="(_, index) in tabItems" :key="index" #[`panel-${index}`]>
      <div class="prose prose-invert max-w-none p-4">
        <slot :name="`tab-${index}`" />
      </div>
    </template>
  </UTabs>
</template>

<script setup lang="ts">
const props = defineProps<{
  labels?: string[]
}>()

const tabItems = computed(() => {
  if (!props.labels) return []
  return props.labels.map((label, index) => ({
    label,
    slot: `panel-${index}`
  }))
})
</script>

