<template>
  <UApp :class="`
      transition-all duration-500 ease-in-out
      bg-${ui.color[ui.isDark ? 'dark' : 'light'].background}
      dark:bg-${ui.color[ui.isDark ? 'dark' : 'light'].background}
    `">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">

const theme = useAppConfig();
const colorMode = useColorMode();
const { ui } = useStore();

// Keep ui.isDark in sync with color mode
watchEffect(() => {
  ui.isDark = colorMode.value === 'dark';
});

// Optionally sync Nuxt UI palette with store legacy fields
// theme.ui.primary = ui.primary;
// theme.ui.gray = ui.gray;

</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.6s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
