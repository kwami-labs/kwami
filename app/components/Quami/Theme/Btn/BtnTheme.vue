<template>
  <ClientOnly>
    <UPopover
      class="z-50"
      :ui="{
        content: 'bg-white dark:bg-black',
      }"
      :content="{
        side,
      }"
      arrow
    >
      <CommonBtnIcon
        size="sm"
        :icon="themeIcon"
      />
      <template #content>
        <div class="p-2">
          <div class="space-y-1">
            <CommonBtnIcon
              size="sm"
              :icon="iconSun"
              :class="colorMode.preference === 'light' ? selectedClass : ''"
              @click="setTheme('light')"
            />
            <CommonBtnIcon
              size="sm"
              :icon="iconMoon"
              :class="colorMode.preference === 'dark' ? selectedClass : ''"
              @click="setTheme('dark')"
            />
          </div>
          <div class="border-b my-2 border-black10 dark:border-white10" />
          <CommonBtnIcon
            size="sm"
            :icon="iconSystem"
            :class="colorMode.preference === 'system' ? selectedClass : ''"
            @click="setTheme('system')"
          />
        </div>
      </template>
    </UPopover>
  </ClientOnly>
</template>

<script setup lang="ts">
defineProps<{
  side?: 'top' | 'bottom' | 'left' | 'right';
}>();

const { ui } = useStore();
const colorMode = useColorMode();

const iconSun = 'i-hugeicons-sun-03';
const iconMoon = 'i-hugeicons-moon-02';
const iconSystem = 'i-hugeicons-computer';
const selectedClass = 'bg-black10 dark:bg-white10';

// Avoid window access during setup for SSR/compat safety
const systemDarkMode = ref(false);

if (!colorMode.preference) {
  colorMode.preference = 'system';
}

const themeIcon = computed(() => {
  if (colorMode.preference === 'system') {
    return systemDarkMode.value
      ? iconMoon
      : iconSun;
  }
  return colorMode.preference === 'dark'
    ? iconMoon
    : iconSun;
});

const setTheme = (mode: ThemeMode) => {
  colorMode.preference = mode;
  if (import.meta.client) {
    systemDarkMode.value = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
  }
  ui.isDark = mode === 'dark' || (mode === 'system' && systemDarkMode.value);
};

setTheme(colorMode.preference as ThemeMode);

type MediaQueryListEventHandler = (ev: MediaQueryListEvent) => void;
const updateSystemTheme: MediaQueryListEventHandler = (event) => {
  systemDarkMode.value = event.matches;
};

onMounted(() => {
  if (import.meta.client) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemDarkMode.value = mediaQuery.matches;
    mediaQuery.addEventListener('change', updateSystemTheme);
  }
});

watchEffect(() => {
  ui.isDark = colorMode.preference === 'dark'
    || (colorMode.preference === 'system' && systemDarkMode.value);
});
</script>
