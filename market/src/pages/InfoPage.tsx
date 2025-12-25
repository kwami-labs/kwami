import { KwamiGlassCard } from '@/components/KwamiGlassCard'

export function InfoPage() {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-6">
      <div className="w-[min(92vw,720px)]">
        <KwamiGlassCard
          className="w-full"
          scrollContent
          cursorGlow={false}
          title={<span>Info</span>}
          headerRight={<span>KWAMI</span>}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Welcome to the KWAMI Market. Anyone can browse what’s listed — only wallets that own a KWAMI NFT can
              participate (list, buy, bid, etc.).
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200/60 bg-white/10 p-4 dark:border-gray-800/60 dark:bg-black/10">
                <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Open browsing</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  The Market tab is fully readable without connecting a wallet.
                </div>
              </div>
              <div className="rounded-lg border border-gray-200/60 bg-white/10 p-4 dark:border-gray-800/60 dark:bg-black/10">
                <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">KWAMI holder access</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  Connect a wallet with a KWAMI NFT to unlock participation and manage your KWAMIs.
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300">
              Configure your environment:
              <span className="ml-2 font-mono text-xs">VITE_SOLANA_NETWORK</span>,
              <span className="ml-2 font-mono text-xs">VITE_SOLANA_RPC_URL</span>,
              <span className="ml-2 font-mono text-xs">VITE_COLLECTION_MINT</span>.
            </div>
          </div>
        </KwamiGlassCard>
      </div>
    </div>
  )
}




