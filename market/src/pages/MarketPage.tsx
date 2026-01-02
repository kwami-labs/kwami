import { KwamiGlassButton } from '@/components/KwamiGlassButton'
import { KwamiGlassCard } from '@/components/KwamiGlassCard'
import { useWallet } from '@/state/wallet'

export function MarketPage() {
  const { connected, hasKwamiNft, selectedKwamiMint } = useWallet()
  const canParticipate = connected && hasKwamiNft

  return (
    <>
      <div className="pointer-events-none absolute left-1/2 top-4 z-20 w-[min(92vw,640px)] -translate-x-1/2 text-center">
        <div className="text-3xl font-black tracking-tight sm:text-4xl">
          <span className="bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            KWAMI Market
          </span>
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Browse publicly. Participate with a KWAMI NFT.
        </div>
      </div>

      <div className="absolute inset-0 px-6 py-6 pt-24">
        <div className="mx-auto h-full w-full max-w-6xl">
          <div className="grid h-full grid-rows-[auto_1fr] gap-5 overflow-hidden">
            <KwamiGlassCard
              className="w-full"
              scrollContent={false}
              cursorGlow={false}
              title={<span>Status</span>}
              headerRight={<span>Solana</span>}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  {connected ? (
                    canParticipate ? (
                      <span>
                        Logged in as <span className="font-mono text-xs">{selectedKwamiMint ?? 'KWAMI holder'}</span>
                      </span>
                    ) : (
                      <span>Connected wallet does not own a KWAMI NFT — view-only mode.</span>
                    )
                  ) : (
                    <span>Browse mode — connect a wallet to participate.</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <KwamiGlassButton
                    label="Create Listing"
                    mode={canParticipate ? 'primary' : 'outline'}
                    size="md"
                    disabled={!canParticipate}
                    onClick={() => {
                      // TODO: wire Metaplex marketplace utilities (Auction House / listing flow)
                    }}
                  />
                  <KwamiGlassButton
                    label="Buy / Bid"
                    mode="outline"
                    size="md"
                    disabled={!canParticipate}
                    onClick={() => {
                      // TODO: wire Metaplex marketplace utilities
                    }}
                  />
                </div>
              </div>
            </KwamiGlassCard>

            <div className="grid grid-cols-1 gap-5 overflow-hidden lg:grid-cols-3">
              <div className="lg:col-span-2 h-full overflow-hidden">
                <KwamiGlassCard
                  className="h-full"
                  title={<span>Listings</span>}
                  headerRight={<span>Public</span>}
                >
                  <div className="space-y-4">
                    <div className="rounded-lg border border-gray-200/60 bg-white/10 p-4 text-sm text-gray-700 dark:border-gray-800/60 dark:bg-black/10 dark:text-gray-200">
                      Marketplace indexing is environment-specific. This UI is ready; next step is wiring Metaplex
                      Auction House (or your preferred market program) via env config.
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <article
                          key={i}
                          className="rounded-2xl border border-gray-200/60 bg-white/10 p-4 dark:border-gray-800/60 dark:bg-black/10"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                KWAMI Listing #{i + 1}
                              </div>
                              <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                Visible to everyone
                              </div>
                            </div>
                            <span className="rounded-full border border-primary-500/30 bg-primary-500/10 px-2 py-1 text-[11px] font-semibold text-primary-600 dark:text-primary-300">
                              Demo
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Price</div>
                            <div className="font-mono text-xs text-gray-700 dark:text-gray-200">— SOL</div>
                          </div>

                          <div className="mt-3">
                            <KwamiGlassButton
                              label={canParticipate ? 'View / Act' : 'View'}
                              mode="ghost"
                              size="sm"
                              onClick={() => {}}
                            />
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </KwamiGlassCard>
              </div>

              <div className="h-full overflow-hidden">
                <KwamiGlassCard
                  className="h-full"
                  title={<span>Activity</span>}
                  headerRight={<span>Feed</span>}
                >
                  <div className="space-y-3">
                    {[
                      'New listing created',
                      'Bid placed',
                      'Sale completed',
                      'Floor updated',
                      'Offer accepted',
                    ].map((label, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-gray-200/60 bg-white/10 p-3 text-sm text-gray-700 dark:border-gray-800/60 dark:bg-black/10 dark:text-gray-200"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold">{label}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">soon</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </KwamiGlassCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}





