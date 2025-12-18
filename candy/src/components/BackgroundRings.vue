<template>
  <!-- Host element defines the positioning context for the rings container -->
  <div ref="host" class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createBackgroundRings } from 'kwami/ui/rings'
import type { BackgroundRingsHandle } from 'kwami/ui/rings'

const host = ref<HTMLElement | null>(null)
let centeredRings: BackgroundRingsHandle | null = null

onMounted(() => {
  if (!host.value) return

  // Centered rings (static, no animation)
  // Note: createBackgroundRings positions:
  //   cx = width + width * centerOffset.x
  //   cy = height * centerOffset.y
  // To center: cx = width/2 -> centerOffset.x = -0.5
  //            cy = height/2 -> centerOffset.y = 0.5
  centeredRings = createBackgroundRings({
    mount: host.value,
    resize: 'auto',
    sizeSource: 'mount',

    // Behind content
    zIndex: '0',
    initialOpacity: 1,

    // Smaller / tighter
    ringCount: 90,
    baseRadius: 2,
    expansionFactor: 0.006,
    maxRingOpacity: 0.26,

    centerOffset: {
      x: -0.5,
      y: 0.5,
    },
  })
})

onBeforeUnmount(() => {
  centeredRings?.destroy()
  centeredRings = null
})
</script>
