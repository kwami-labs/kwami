<template>
  <ul :class="wrapperClasses">
    <li v-for="item in items" :key="`${item.to}-${depth}`" class="space-y-1">
      <NuxtLink
        :to="item.to"
        class="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
        :class="[
          isActive(item.to)
            ? 'bg-white/10 text-white shadow-inner'
            : 'text-slate-300 hover:bg-white/5 hover:text-white'
        ]"
        @click="emit('navigate')"
      >
        <UIcon
          v-if="depth === 0"
          name="i-ph-folders-duotone"
          class="text-base text-emerald-300"
        />
        <span class="truncate">{{ item.label }}</span>
      </NuxtLink>

      <DocSidebarList
        v-if="item.children?.length"
        :items="item.children"
        :depth="depth + 1"
        :current-path="currentPath"
        @navigate="emit('navigate')"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { SidebarLink } from '~/types/navigation'

defineOptions({ name: 'DocSidebarList' })

const props = withDefaults(
  defineProps<{
    items: SidebarLink[]
    depth?: number
    currentPath?: string
  }>(),
  {
    depth: 0,
    currentPath: '/'
  }
)

const emit = defineEmits<{
  (event: 'navigate'): void
}>()

const normalizedCurrentPath = computed(() =>
  (props.currentPath ?? '/').replace(/\/+$/, '') || '/'
)

const wrapperClasses = computed(() =>
  props.depth === 0
    ? 'space-y-2'
    : 'mt-1 space-y-1 border-l border-white/5 pl-3'
)

const isActive = (path: string) => {
  const normalizedTarget = path.replace(/\/+$/, '') || '/'
  return normalizedTarget === normalizedCurrentPath.value
}
</script>

