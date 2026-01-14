<template>
  <div
    id="app"
    class="relative h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300"
  >
    <BackgroundRings />

    <div class="relative z-10">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import BackgroundRings from './components/BackgroundRings.vue'
</script>

<style>
/* Global styles */
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100%;
  overflow: hidden;
}
</style>
