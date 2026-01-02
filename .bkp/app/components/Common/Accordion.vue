<template>
  <div class="w-full">
    <UAccordion
      :key="title"
      variant="ghost"
      color="gray"
      :items="items"
      :icon="icon"
    >
      <template #default="{ item, open }">
        <UButton
          color="gray"
          variant="ghost"
          class="!bg-transparent hover:!bg-transparent"
          :ui="{ rounded: 'rounded-none', padding: { sm: 'p-2' } }"
        >
          <span
            class="truncate text-lg font-extrabold uppercase text-gray-800
            dark:text-gray-200"
          >
            {{ item.title }}
          </span>
          <span class="">
            {{ item.subtitle }}
          </span>
          <template #trailing>
            <UIcon
              name="i-heroicons-chevron-up-20-solid"
              class="w-5 h-5 ms-auto transform transition-transform
              duration-200"
              :class="[open && 'rotate-180']"
            />
          </template>
        </UButton>
      </template>
      <template #content>
        <slot />
      </template>
    </UAccordion>
  </div>
</template>

<script setup lang="ts">
const { title, subtitle, isOpen } = defineProps<{
  title: string;
  subtitle?: string;
  isOpen?: boolean;
  icon?: string;
}>();

const items = [{
  title,
  subtitle,
  slot: 'content',
  defaultOpen: isOpen,
}];
</script>
