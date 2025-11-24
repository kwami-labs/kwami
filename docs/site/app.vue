<template>
  <UApp>
    <NuxtLoadingIndicator color="#34d399" :height="3" />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

onMounted(() => {
  colorMode.preference = colorMode.preference || 'dark'
})

useHead({
  htmlAttrs: {
    lang: 'en',
    class: 'scroll-smooth'
  },
  bodyAttrs: {
    class: 'bg-slate-950'
  }
})
</script>
