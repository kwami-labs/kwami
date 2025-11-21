<template>
  <h1 class="text-4xl font-bold">
    <slot />
    <span v-if="label">
      {{ label }}
    </span>
  </h1>
</template>

<script setup lang="ts">

defineProps<{
  label?: string,
}>();

</script>
