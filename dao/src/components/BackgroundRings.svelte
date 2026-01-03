<script lang="ts">
  import { onMount } from 'svelte'
  import { createBackgroundRings, type BackgroundRingsHandle } from 'kwami/ui/rings'

  let host: HTMLDivElement | null = null
  let handle: BackgroundRingsHandle | null = null

  onMount(() => {
    if (!host) return

    handle?.destroy()
    handle = createBackgroundRings({
      mount: host,
      resize: 'auto',
      sizeSource: 'mount',
      zIndex: '0',
      initialOpacity: 1,
      ringCount: 90,
      baseRadius: 2,
      expansionFactor: 0.006,
      maxRingOpacity: 0.26,
    // Position rings bottom-left
    // createBackgroundRings uses:
    //   cx = width + width * centerOffset.x
    //   cy = height * centerOffset.y
    // Bottom-left corner => cx = 0 (x = -1), cy = height (y = 1)
    centerOffset: { x: -1, y: 1 },
    })

    return () => {
      handle?.destroy()
      handle = null
    }
  })
</script>

<div bind:this={host} class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true"></div>
