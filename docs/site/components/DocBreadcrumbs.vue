<template>
  <nav
    aria-label="Breadcrumb"
    class="flex flex-wrap items-center gap-1 text-xs uppercase tracking-[0.2em] text-slate-500"
  >
    <NuxtLink to="/" class="hover:text-white">Home</NuxtLink>
    <template v-for="(crumb, index) in crumbs" :key="crumb.to ?? crumb.label">
      <span class="text-slate-600">/</span>
      <NuxtLink
        v-if="crumb.to && index !== crumbs.length - 1"
        :to="crumb.to"
        class="hover:text-white"
      >
        {{ crumb.label }}
      </NuxtLink>
      <span v-else class="text-white">{{ crumb.label }}</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { humanizeSlug } from '~/utils/strings'

const route = useRoute()

const crumbs = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  const trail: { label: string; to: string | null }[] = []
  let accumulator = ''

  parts.forEach((segment, index) => {
    accumulator += `/${segment}`
    const isLast = index === parts.length - 1
    trail.push({
      label: humanizeSlug(segment),
      to: isLast ? null : accumulator
    })
  })

  return trail
})
</script>

