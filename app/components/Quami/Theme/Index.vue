<template>
  <CommonMagicWindow
    icon="i-heroicons-paint-brush-solid"
    :title="$t('theme')"
    class="h-fit"
    :menu-to-left="8"
    :default-position="{ x: 10, y: 150 }"
    :is-modal-open="true"
  >
    <div class="flex w-full space-x-4">
      <QuamiThemeBtnLight />
      <QuamiThemeBtnColors />
      <QuamiThemeBtnLangs />
      <QuamiThemeBtnVideo />
      <QuamiThemeBtnLang />
      <QuamiThemeBtnTheme />
      <USwitch
        v-model="ui.showVideo"
      />
    </div>
  </CommonMagicWindow>
</template>

<script setup lang="ts">
const { ui } = useStore();
</script>
