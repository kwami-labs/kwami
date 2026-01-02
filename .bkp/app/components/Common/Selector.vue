<template>
  <USelectMenu
    :key="genHash(22)"
    v-model="selectedState"
    :options="options"
    :icon="selectedState.icon"
    :searchable="search"
    :searchable-placeholder="$t('search')"
    :clear-search-on-close="true"
    :class="width ? width : 'w-40'"
  >
    <template #option-empty>
      <slot />
    </template>
  </USelectMenu>
</template>

<script setup lang="ts">

const { selected } = defineProps<{
  options: { icon: string; label: string }[];
  selected: { icon: string; label: string };
  width?: string;
  search?: boolean;
}>();

const selectedState = ref(selected || selected[0]);

</script>
