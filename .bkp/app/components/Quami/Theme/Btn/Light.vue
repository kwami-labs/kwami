<template>
  <div class="inline-flex items-center gap-2">
    <UIcon
      name="i-heroicons-sun-20-solid"
      class="w-5 h-5"
      :class="!isDark ? 'opacity-90 text-yellow-400' : 'opacity-50'"
    />
    <USwitch
      v-model="isDark"
      variant="ghost"
      color="gray"
    />
    <UIcon
      name="i-heroicons-moon-20-solid"
      class="w-5 h-5"
      :class="isDark ? 'opacity-90 text-blue-400' : 'opacity-50'"
    />
  </div>
</template>

<script setup lang="ts">
const { ui } = useStore();
const colorMode = useColorMode();

watch(colorMode, () => {
  ui.isDark = colorMode.value === 'dark';
});

const isDark = computed({
  get() {
    return colorMode.value === 'dark';
  },
  set(v) {
    colorMode.preference = v ? 'dark' : 'light';
  },
});
</script>
