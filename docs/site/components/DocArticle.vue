<template>
  <div class="flex gap-8">
    <section class="min-w-0 flex-1 space-y-8">
      <DocBreadcrumbs />

      <div class="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-xl">
        <p class="text-xs uppercase tracking-[0.3em] text-emerald-300">
          {{ doc._path }}
        </p>
        <h1 class="mt-2 text-3xl font-semibold text-white">
          {{ doc.title || 'Untitled document' }}
        </h1>
        <p v-if="doc.description" class="mt-2 text-base text-slate-300">
          {{ doc.description }}
        </p>
        <div class="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span v-if="readingTime">~{{ readingTime }}</span>
          <span class="inline-flex items-center gap-1">
            <UIcon name="i-ph-folders-duotone" class="text-base text-emerald-300" />
            {{ formatCategory(doc._dir) }}
          </span>
        </div>
      </div>

      <article class="prose prose-invert max-w-none">
        <ContentRenderer :value="doc" />
      </article>
    </section>

    <aside class="hidden w-64 shrink-0 xl:block">
      <DocToc :links="doc.body?.toc?.links" />
    </aside>
  </div>
</template>

<script setup lang="ts">
import type { ParsedContent } from '@nuxt/content/dist/runtime/types'
import { humanizeSlug } from '~/utils/strings'

const props = defineProps<{
  doc: ParsedContent
}>()

const readingTime = computed(() => props.doc.readingTime?.text ?? null)

const formatCategory = (value?: string) => {
  if (!value) {
    return 'General'
  }

  return humanizeSlug(value.split('/').at(-1) ?? value)
}
</script>

