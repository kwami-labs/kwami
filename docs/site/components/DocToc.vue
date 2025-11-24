<template>
  <nav
    v-if="links && links.length > 0"
    class="sticky top-24 space-y-3 rounded-2xl border border-white/5 bg-white/5 p-6"
  >
    <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
      On This Page
    </p>
    <ul class="space-y-2 text-sm">
      <li
        v-for="link in links"
        :key="link.id"
        :class="[
          link.depth === 2 ? 'pl-0' : link.depth === 3 ? 'pl-4' : 'pl-8'
        ]"
      >
        <a
          :href="`#${link.id}`"
          class="block py-1 text-slate-300 transition-colors hover:text-emerald-300"
          :class="{
            'font-medium text-emerald-300': activeId === link.id
          }"
          @click.prevent="scrollToHeading(link.id)"
        >
          {{ link.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import type { TocLink } from '@nuxt/content/dist/runtime/types'

defineProps<{
  links?: TocLink[]
}>()

const activeId = ref<string | null>(null)

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeId.value = id
  }
}

// Observer to update active heading
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      })
    },
    {
      rootMargin: '-80px 0px -80% 0px'
    }
  )

  document.querySelectorAll('h2[id], h3[id], h4[id]').forEach((heading) => {
    observer.observe(heading)
  })

  onUnmounted(() => {
    observer.disconnect()
  })
})
</script>

