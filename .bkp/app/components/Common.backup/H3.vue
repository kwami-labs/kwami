<template>
  <h1 class="text-xl font-bold text-black">
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
