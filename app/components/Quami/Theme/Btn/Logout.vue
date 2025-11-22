<template>
  <div>
    <UTooltip
      :text="$t('logout')"
      :shortcuts="['⌘', 'O']"
    >
      <UButton
        variant="ghost"
        color="gray"
        icon="i-heroicons-arrow-right-start-on-rectangle-16-solid"
        class="mx-2 h-[31px] w-[31px] pr-1 hover:bg-white hover:dark:bg-gray-900
          hover:border border-gray-300 dark:border-gray-700 text-gray-900
          dark:text-gray-100"
        @click="onLogout"
      />
    </UTooltip>
  </div>
</template>

<script setup lang="ts">

// const { auth } = useStore();
const { logout } = useAlerts();

defineShortcuts({
  meta_o: {
    usingInput: true,
    handler: () => onLogout()
  }
});

const onLogout = () => {
  navigateTo('login');
  logout.success();
};

</script>
