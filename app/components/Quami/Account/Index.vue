<template>
  <CommonMagicWindow
    icon="i-icon-park-solid-user"
    :title="$t('account')"
    class="h-fit"
    :menu-to-left="4"
    :tabs="tabs"
    :selected-tab="selectedTab"
    :default-position="{ x: 10, y: 10 }"
    @tab-click="selectedTab = $event"
  >
    <QuamiAccountProfile v-if="selectedTab.title.toUpperCase() === 'PROFILE'" />
    <QuamiAccountAuthLoginEmail />
  </CommonMagicWindow>
</template>

<script setup lang="ts">
const tabs = [
  {
    title: 'Auth',
    icon: 'i-mdi-account-outline',
  },
  {
    title: 'Security',
    icon: 'i-mdi-lock-outline',
  },
];

const selectedTab = ref(tabs[0]);
</script>
