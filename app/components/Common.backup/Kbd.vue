<template>
  <div :class="onClick ? 'cursor-pointer' : 'cursor-default'">
    <UTooltip
      v-if="tooltip"
      :text="tooltip.text || ''"
      :shortcuts="tooltip.shortcuts || []"
    >
      <UKbd
        :value="text"
        @click="onClick ? onClick() : null"
      >
        <slot />
      </UKbd>
    </UTooltip>
    <UKbd
      v-else
      :value="text"
      @click="onClick ? onClick() : null"
    >
      <slot />
    </UKbd>
  </div>
</template>

<script setup lang="ts">

defineProps<{
  text?: string,
  tooltip?: {
    text?: string,
    shortcuts?: string[]
  },
  onClick?:() => void
}>();

</script>
