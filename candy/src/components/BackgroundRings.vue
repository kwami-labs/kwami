<template>
  <!-- Host element defines the positioning context for the rings container -->
  <div ref="host" class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createBackgroundRings } from 'kwami/ui'
import type { BackgroundRingsHandle } from 'kwami/ui/rings'

const host = ref<HTMLElement | null>(null)
let rings: BackgroundRingsHandle | null = null

onMounted(() => {
  if (!host.value) return

  rings = createBackgroundRings({
    mount: host.value,
    resize: 'auto',
    sizeSource: 'auto',
    initialOpacity: 0,
    maxRingOpacity: 0.22,
    opacityTransitionMs: 1200,
    opacityTransitionEasing: 'ease-in-out',
  })

  // Fade in after mount
  requestAnimationFrame(() => rings?.show())
})

onBeforeUnmount(() => {
  rings?.destroy()
  rings = null
})
</script>
