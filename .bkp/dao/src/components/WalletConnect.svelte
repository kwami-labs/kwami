<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { createWalletConnectWidget, type WalletConnectWidgetHandle } from 'kwami/ui/wallet'

  let host: HTMLDivElement | null = null
  let widget: WalletConnectWidgetHandle | null = null

  export async function open(): Promise<void> {
    await widget?.open()
  }

  export async function refresh(): Promise<void> {
    await widget?.refresh()
  }

  onMount(() => {
    if (!host) return
    host.innerHTML = ''

    widget = createWalletConnectWidget({
      connectLabel: 'Connect Wallet',
      showBalanceInButton: false,
      autoRefreshBalanceMs: 15_000,
      className: '',
    })

    host.appendChild(widget.element)
  })

  onDestroy(() => {
    widget?.destroy()
    widget = null
  })
</script>

<div bind:this={host} class="inline-flex items-center"></div>


