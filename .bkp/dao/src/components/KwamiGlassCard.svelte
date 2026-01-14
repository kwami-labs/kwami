<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { createGlassCard } from 'kwami/ui'

  export let title: string | undefined = undefined
  export let headerRight: string | undefined = undefined
  export let className: string | undefined = undefined
  export let scrollContent: boolean = true
  export let cursorGlow: boolean = true

  let mountEl: HTMLDivElement | null = null
  let contentHost: HTMLDivElement | null = null

  let card: ReturnType<typeof createGlassCard> | null = null

  onMount(() => {
    if (!mountEl || !contentHost) return

    card = createGlassCard({
      title,
      headerRight,
      content: undefined,
      footer: undefined,
      scrollContent,
      cursorGlow,
      className,
    })

    mountEl.appendChild(card.element)

    // Move the Svelte-rendered body into the GlassCard body.
    card.body.appendChild(contentHost)
    contentHost.style.display = ''
  })

  $: if (card) {
    card.setTitle(title)
    card.setHeaderRight(headerRight)
  }

  onDestroy(() => {
    card?.element.remove()
    card = null
  })
</script>

<div bind:this={mountEl}></div>

<!-- Render content immediately so Svelte can manage it, then move into the GlassCard on mount. -->
<div bind:this={contentHost} style="display:none">
  <slot />
</div>


