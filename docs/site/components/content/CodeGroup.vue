<template>
  <div class="my-6 rounded-xl border border-white/10 bg-slate-900 overflow-hidden">
    <div class="flex border-b border-white/10 bg-slate-900/50">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        class="px-4 py-2 text-sm font-medium transition-colors border-b-2"
        :class="[
          activeTab === index
            ? 'border-emerald-400 text-emerald-300 bg-white/5'
            : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-white/5'
        ]"
        @click="activeTab = index"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="relative">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        v-show="activeTab === index"
        class="prose prose-invert max-w-none [&_pre]:my-0 [&_pre]:rounded-none"
      >
        <slot :name="`tab-${index}`" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  labels?: string[]
}>()

const activeTab = ref(0)

const tabs = computed(() => {
  if (!props.labels) return []
  return props.labels.map((label, index) => ({ label, index }))
})
</script>

