<template>
  <ContentDoc :path="resolvedPath">
    <template #default="{ doc }">
      <DocArticle :doc="doc" />
    </template>

    <template #empty>
      <DocNotFound />
    </template>
  </ContentDoc>
</template>

<script setup lang="ts">
const route = useRoute()

const resolvedPath = computed(() => {
  const slug = route.params.slug

  if (!slug) {
    return '/README'
  }

  if (Array.isArray(slug)) {
    return `/${slug.join('/')}`
  }

  return `/${slug}`
})
</script>

