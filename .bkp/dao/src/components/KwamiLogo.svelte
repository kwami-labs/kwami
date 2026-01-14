<script lang="ts">
  import { onMount } from 'svelte'
  import { createKwamiLogoSvg } from 'kwami/ui'

  export let className: string = ''

  let host: HTMLSpanElement | null = null
  let logoEl: SVGSVGElement | null = null

  onMount(() => {
    if (!host) return
    host.innerHTML = ''

    const svg = createKwamiLogoSvg({
      gradientId: `kwami-logo-grad-${Math.random().toString(16).slice(2)}`,
      strokeWidth: 4,
      style: {
        height: '26px',
        width: '140px',
      },
    })

    if (className) {
      svg.classList.add(...className.split(/\s+/g).filter(Boolean))
    }

    logoEl = svg
    host.appendChild(svg)

    return () => {
      logoEl?.remove()
      logoEl = null
    }
  })
</script>

<span bind:this={host} class="inline-flex items-center"></span>
