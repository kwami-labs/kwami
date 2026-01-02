<template>
  <div
    class="relative"
    :class="heightFull ? '!h-[100%]' : `h-[${height ?? 600}px]`"
  >
    <div
      v-if="!removeLoader"
      class="absolute inset-0 flex justify-center items-center"
    >
      <div
        class="inline-flex justify-center items-center align-middle
          transition-opacity duration-500 ease-in-out z-50"
        :class="isLoading
          ? 'opacity-100 block animate-pulse'
          : 'opacity-0 delay-500:hidden'"
      >
        <div class="text-center opacity-70">
          <UIcon
            name="i-heroicons-cube-transparent-20-solid"
            class="mr-2 text-4xl"
            size="md"
          />
          <div>
            {{ $t('loading') }}<CommonLoadingDots />
          </div>
        </div>
      </div>
    </div>
    <div
      :class="isLoading ? 'opacity-0 invisible' : 'opacity-100 visible'"
      class="transition-opacity duration-500 ease-in-out"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  isLoading: boolean;
  height?: number;
  heightFull?: boolean
}>();

const removeLoader = ref(false);

watch(() => props.isLoading, (isLoading) => {
  if (!isLoading) {
    setTimeout(() => {
      removeLoader.value = true;
    }, 5000);
  } else {
    removeLoader.value = false;
  }
});

</script>
