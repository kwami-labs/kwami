<template>
  <UButton
    class="transition-all duration-500 ease-in-out text-center h-9
      hover:shadow-2xl shadow-primary-500 dark:shadow-primary-400
      active:!shadow-inner active:!dark:shadow-white"
    :class="[
      `bg-gradient-to-r dark:bg-gradient-to-l from-${color}-500
       hover:bg-gradient-to-l hover:text-black !pl-6 !pr-8
       dark:hover:bg-gradient-to-r dark:hover:text-white
       transition-all duration-500 ease-in-out text-center h-9`,
      `to-${color}-500 dark:to-${color}-500`
    ]"
  >
    <slot />
  </UButton>
</template>

<script setup lang="ts">

const colors = [
  'orange', 'red', 'rose', 'pink', 'fuchsia', 'purple', 'violet',
  'indigo', 'blue', 'sky', 'cyan', 'teal', 'emerald', 'green', 'lime',
  'yellow', 'amber'
];

const randomColor = () => colors[Math.floor(Math.random() * colors.length)];
const color = ref(randomColor());

setInterval(() => {
  color.value = randomColor();
}, 5000);

</script>
