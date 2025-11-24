<template>
  <div class="flex h-full flex-col gap-4">
    <UInput
      v-model="searchTerm"
      icon="i-ph-magnifying-glass-duotone"
      placeholder="Search sections"
      variant="outline"
      color="white"
      size="sm"
    />

    <div class="flex-1 overflow-y-auto pr-3">
      <DocSidebarList
        v-if="filteredLinks.length"
        :items="filteredLinks"
        :current-path="currentPath"
        @navigate="handleNavigate"
      />

      <div
        v-else
        class="rounded-xl border border-white/5 bg-white/5 p-4 text-sm text-slate-400"
      >
        No matches for <span class="text-white">“{{ searchTerm }}”</span>.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fetchContentNavigation } from '#content'
import type { NavItem } from '@nuxt/content/dist/runtime/types'
import type { SidebarLink } from '~/types/navigation'
import { labelFromPath, normalizePath } from '~/utils/strings'

const emit = defineEmits<{
  (event: 'navigate'): void
}>()

const route = useRoute()
const searchTerm = ref('')

const { data: navigation } = await useAsyncData('kwami-navigation', () =>
  fetchContentNavigation({
    where: [
      {
        _path: {
          $notRegex: '^/site'
        }
      },
      {
        _extension: 'md'
      }
    ]
  })
)

const links = computed<SidebarLink[]>(() =>
  (navigation.value ?? []).map((item) => mapNavItem(item))
)

const filteredLinks = computed<SidebarLink[]>(() =>
  filterLinks(links.value, searchTerm.value)
)

const currentPath = computed(() => normalizePath(route.path))

const handleNavigate = () => emit('navigate')

function mapNavItem(item: NavItem): SidebarLink {
  return {
    label: item.title || labelFromPath(item._path),
    to: normalizePath(item._path),
    children: (item.children ?? []).map((child) => mapNavItem(child))
  }
}

function filterLinks(items: SidebarLink[], term: string): SidebarLink[] {
  if (!term) {
    return items
  }

  const query = term.toLowerCase()

  return items
    .map((item) => {
      const childMatches = filterLinks(item.children ?? [], term)
      const matchesSelf = item.label.toLowerCase().includes(query)

      if (matchesSelf || childMatches.length) {
        return {
          ...item,
          children: childMatches
        }
      }

      return null
    })
    .filter(Boolean) as SidebarLink[]
}
</script>

