<script setup lang="ts">
const { data: navigation } = await useAsyncData(
  'navigation', () => fetchContentNavigation());
const { data: files } = useLazyFetch<ParsedContent[]>(
  '/api/search.json', { default: () => [], server: false });

const links = [{
  label: 'Docs',
  icon: 'i-heroicons-book-open',
  to: '/getting-started'
}, {
  label: 'Pro',
  icon: 'i-heroicons-square-3-stack-3d',
  to: '/pro'
}, {
  label: 'Pricing',
  to: '/pro/pricing',
  icon: 'i-heroicons-ticket'
}, {
  label: 'Templates',
  icon: 'i-heroicons-computer-desktop',
  to: '/pro/templates'
}, {
  label: 'Releases',
  icon: 'i-heroicons-rocket-launch',
  to: '/releases'
}];

provide('navigation', navigation);
provide('files', files);
</script>

<template>
  <!-- <SharedYoutubeVideo /> -->
  <ClientOnly>
    <LazyUContentSearch
      :files="files"
      :navigation="navigation"
      :links="links"
    />
  </ClientOnly>
</template>
