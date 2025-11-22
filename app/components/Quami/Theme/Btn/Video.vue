<template>
  <UPopover
    mode="hover"
    class="z-50"
  >
    <UButton
      variant="ghost"
      class="focus:outline-transparent focus-visible:outline-0
        disabled:cursor-not-allowed disabled:opacity-75
        flex-shrink-0 font-medium rounded-md text-sm gap-x-1.5
        p-1.5 text-gray-900 dark:text-gray-100
        hover:text-primary-600 dark:hover:text-primary-400
        hover:bg-white dark:hover:bg-gray-900
        focus-visible:ring-inset focus-visible:ring-2
        focus-visible:ring-primary-500 align-middle h-[31px] w-[31px]
        dark:focus-visible:ring-primary-400 inline-flex items-center
        hover:border border-gray-300 dark:border-gray-700"
    >
      <UIcon
        name="i-heroicons-paint-brush-solid"
        class="h-5 w-5 text-primary-900 dark:text-primary-100"
      />
    </UButton>
    <template #panel>
      <div class="bg-gray-100 dark:bg-gray-900 min-w-56">
        <USlider
          v-model="opacity"
          :steps="steps"
        />
        <div>
          {{ opacity }}
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
const { ui } = useStore();

const opacity = ref(0);

const steps = [
  0, 30, 50, 70, 100,
];

watch(opacity, (v) => {
  console.log('opacity', v);
  ui.opacityVideo = v;
});
</script>
