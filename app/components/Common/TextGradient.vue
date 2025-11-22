<template>
  <h2
    class="text-2xl font-semibold text-transparent bg-clip-text
    bg-gradient-to-r dark:bg-gradient-to-l
    from-primary-500 to-orange-500"
  >
    <slot />
  </h2>
</template>

<script setup lang="ts">
const { ui } = useStore();
</script>
