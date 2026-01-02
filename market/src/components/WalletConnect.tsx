import { useEffect, useRef } from 'react'
import { createWalletConnectWidget, type WalletConnectWidgetHandle } from 'kwami/ui/wallet'
import { useWallet } from '@/state/wallet'

export function WalletConnect() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const widgetRef = useRef<WalletConnectWidgetHandle | null>(null)
  const { connector, refreshKwamiNfts } = useWallet()

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    widgetRef.current?.destroy()
    widgetRef.current = createWalletConnectWidget({
      connectLabel: 'Connect Wallet',
      showBalanceInButton: true,
      autoRefreshBalanceMs: 30_000,
      wallet: connector as any,
      onConnected: () => {
        void refreshKwamiNfts()
      },
      onAccountChange: () => {
        void refreshKwamiNfts()
      },
    })

    mount.innerHTML = ''
    mount.appendChild(widgetRef.current.element)

    return () => {
      widgetRef.current?.destroy()
      widgetRef.current = null
    }
  }, [connector, refreshKwamiNfts])

  return <div ref={mountRef} className="inline-flex items-center" />
}





