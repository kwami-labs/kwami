<template>
  <!-- Host element defines the positioning context for the rings container -->
  <div ref="host" class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createWelcomeAnimatedRings } from 'kwami/ui/welcome'
import type { WelcomeAnimatedRingsHandle } from 'kwami/ui/welcome'

const host = ref<HTMLElement | null>(null)
let rings: WelcomeAnimatedRingsHandle | null = null

onMounted(() => {
  if (!host.value) return

  rings = createWelcomeAnimatedRings({
    mount: host.value,
    resize: 'auto',

    // Tuning for candy background (subtle + performant)
    zIndex: '0',
    opacity: 0.22,
    includeWordmark: false,
    ringCount: 90,
    cycleSeconds: 8,
    rotationDegreesPerSecond: 40,
  })
})

onBeforeUnmount(() => {
  rings?.destroy()
  rings = null
})
</script>
