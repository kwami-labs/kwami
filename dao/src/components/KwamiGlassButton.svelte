<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import { createGlassButton } from 'kwami/ui'

  export let label: string = 'Button'
  export let icon: string | undefined = undefined
  export let mode: 'primary' | 'ghost' | 'outline' = 'primary'
  export let size: 'sm' | 'md' | 'lg' = 'md'
  export let disabled: boolean = false
  export let className: string | undefined = undefined

  const dispatch = createEventDispatcher<{ click: MouseEvent }>()

  let host: HTMLDivElement | null = null
  let handle: ReturnType<typeof createGlassButton> | null = null

  onMount(() => {
    if (!host) return
    host.innerHTML = ''

    handle = createGlassButton({
      label,
      icon,
      mode,
      size,
      disabled,
      className,
      onClick: (e: MouseEvent) => dispatch('click', e),
    })

    host.appendChild(handle.element)
  })

  $: if (handle) {
    handle.setLabel(label)
    handle.setIcon(icon)
    handle.setDisabled(Boolean(disabled))
  }

  onDestroy(() => {
    handle?.element.remove()
    handle = null
  })
</script>

<div bind:this={host} class="inline-flex"></div>


