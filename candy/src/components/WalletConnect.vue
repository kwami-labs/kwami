<template>
  <div ref="mount" class="inline-flex items-center" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { createWalletConnectWidget, type WalletConnectWidgetHandle } from 'kwami/ui/wallet'
import { useWalletStore } from '@/stores/wallet'

const mount = ref<HTMLDivElement | null>(null)
const walletStore = useWalletStore()

let widget: WalletConnectWidgetHandle | null = null

const open = async () => {
  await widget?.open()
}

defineExpose({
  open,
})

onMounted(() => {
  if (!mount.value) return

  widget = createWalletConnectWidget({
    connectLabel: 'Connect Wallet',
    showBalanceInButton: true,
    autoRefreshBalanceMs: 30_000,
    wallet: {
      detectWallets: walletStore.detectWallets,
      connect: walletStore.connect,
      disconnect: walletStore.disconnect,
      isWalletConnected: walletStore.isWalletConnected,
      getPublicKey: walletStore.getPublicKey,
      getSolBalance: walletStore.getSolBalance,
      getNetwork: walletStore.getNetwork,
    },
    onConnected: () => {
      void walletStore.updateBalance()
    },
    onDisconnected: () => {
      // keep store state in sync just in case
      walletStore.balance = 0
    },
  })

  mount.value.appendChild(widget.element)
})

onUnmounted(() => {
  widget?.destroy()
  widget = null
})
</script>
