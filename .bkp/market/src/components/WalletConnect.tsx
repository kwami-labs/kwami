import { useEffect, useRef } from 'react'
import { createWalletConnectWidget, type WalletConnectWidgetConnector, type WalletConnectWidgetHandle } from 'kwami/ui/wallet'
import { useWallet } from '@/state/wallet'

export function WalletConnect() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const widgetRef = useRef<WalletConnectWidgetHandle | null>(null)
  const { connector } = useWallet()

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    widgetRef.current?.destroy()
    widgetRef.current = createWalletConnectWidget({
      connectLabel: 'Connect Wallet',
      showBalanceInButton: true,
      autoRefreshBalanceMs: 30_000,
      wallet: connector as unknown as WalletConnectWidgetConnector,
      // NOTE: NFT refresh is handled centrally by WalletProvider via connector events.
      // Keeping it out of the widget avoids duplicate RPC bursts on connect/account change.
    })

    mount.innerHTML = ''
    mount.appendChild(widgetRef.current.element)

    return () => {
      widgetRef.current?.destroy()
      widgetRef.current = null
    }
  }, [connector])

  return <div ref={mountRef} className="inline-flex items-center" />
}






