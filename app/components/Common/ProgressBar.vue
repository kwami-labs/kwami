<template>
  <div
    class="w-full dark:bg-gray-400 bg-gray-600 rounded-full h-1.5
      transition-all duration-500 ease-in-out"
    :class="progressBar === 0 && props.transparent ? '!bg-transparent' : ''"
  >
    <div
      class="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
      :style="{ width: progressBar + '%' }"
    />
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  progress: number;
  loading?: boolean;
  transparent?: boolean;
  waitToResetMs?: number;
}>();

const progressBar = ref(0);

watch(() => props.progress, (v) => {
  progressBar.value = v;
  if (v === 100) {
    setTimeout(() => {
      if (!props.loading) {
        progressBar.value = 0;
      }
    }, props.waitToResetMs || 1500);
  }
});

</script>
