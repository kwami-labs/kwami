<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    
    <main class="flex-1 container mx-auto px-4 py-8">
      <slot />
    </main>
    
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
</script>
