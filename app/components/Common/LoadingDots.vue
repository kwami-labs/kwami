<template>
  <span class="inline-block">
    <span v-if="currentDots === 1">.</span>
    <span v-if="currentDots === 2">..</span>
    <span v-if="currentDots === 3">...</span>
    <span v-if="currentDots === 0">&nbsp;</span>
  </span>
</template>

<script setup>

const currentDots = ref(0);
let intervalId = null;

onMounted(() => {
  intervalId = setInterval(() => {
    currentDots.value = (currentDots.value + 1) % 4;
  }, 500);
});

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

</script>
