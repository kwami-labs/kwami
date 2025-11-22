<template>
  <div
    class="w-full h-full inline-flex justify-center items-center align-middle
      transitiom-all duration-500 ease-in-out z-50"
  >
    <div class="text-center opacity-70 animate !animate-pulse -mt-8">
      <UIcon
        name="i-heroicons-cube-transparent-20-solid"
        class="mr-2 text-4xl"
        size="md"
      />
      <div>
        {{ props.info }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  info: string
}>();

</script>
