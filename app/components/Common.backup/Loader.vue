<template>
  <div
    class="w-full h-full inline-flex justify-center items-center align-middle
      transitiom-all duration-500 ease-in-out z-50 animate-pulse"
  >
    <div class="text-center opacity-70 -mt-8">
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
</template>
