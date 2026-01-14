import { useMemo, useState } from 'react'
import { KwamiGlassCard } from '@/components/KwamiGlassCard'
import { KwamiGlassButton } from '@/components/KwamiGlassButton'
import { useWallet } from '@/state/wallet'

function short(addr: string, left = 6, right = 6) {
  if (!addr) return '—'
  if (addr.length <= left + right + 3) return addr
  return `${addr.slice(0, left)}…${addr.slice(-right)}`
}

export function YouPage() {
  const {
    connected,
    publicKey,
    kwamiNfts,
    kwamiLoading,
    kwamiError,
    hasKwamiNft,
    selectedKwamiMint,
    setSelectedKwamiMint,
    refreshKwamiNfts,
  } = useWallet()

  // Large wallets: don't auto-load hundreds of GIFs at once.
  const [showPreviews, setShowPreviews] = useState(false)
  const [visibleCount, setVisibleCount] = useState(24)

  const orderedKwamiNfts = useMemo(() => {
    if (!selectedKwamiMint) return kwamiNfts
    const selected = kwamiNfts.find((n) => n.mint === selectedKwamiMint)
    if (!selected) return kwamiNfts
    return [selected, ...kwamiNfts.filter((n) => n.mint !== selectedKwamiMint)]
  }, [kwamiNfts, selectedKwamiMint])

  const visibleKwamiNfts = useMemo(() => orderedKwamiNfts.slice(0, visibleCount), [orderedKwamiNfts, visibleCount])

  return (
    <div className="absolute inset-0 px-6 py-6">
      <div className="mx-auto h-full w-full max-w-6xl overflow-hidden">
        <div className="grid h-full grid-cols-1 gap-5 overflow-hidden lg:grid-cols-[360px_1fr]">
          <div className="h-full overflow-hidden">
            <KwamiGlassCard className="h-full" title={<span>You</span>} headerRight={<span>Passport</span>}>
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200/60 bg-white/10 p-4 dark:border-gray-800/60 dark:bg-black/10">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Wallet</div>
                  <div className="mt-1 font-mono text-xs text-gray-700 break-all dark:text-gray-200">
                    {connected && publicKey ? publicKey.toBase58() : 'Not connected'}
                  </div>
                </div>

                <div className="flex gap-2">
                  <KwamiGlassButton
                    label="Refresh"
                    mode="ghost"
                    size="md"
                    disabled={!connected || kwamiLoading}
                    onClick={() => void refreshKwamiNfts()}
                  />
                  <KwamiGlassButton
                    label="Select first"
                    mode="outline"
                    size="md"
                    disabled={!hasKwamiNft || kwamiLoading}
                    onClick={() => setSelectedKwamiMint(kwamiNfts[0]?.mint ?? null)}
                  />
                </div>

                {!connected ? (
                  <div className="rounded-lg border border-gray-200/60 bg-white/10 p-4 text-sm text-gray-700 dark:border-gray-800/60 dark:bg-black/10 dark:text-gray-200">
                    Connect a wallet to see your KWAMI NFTs.
                  </div>
                ) : kwamiLoading ? (
                  <div className="rounded-lg border border-gray-200/60 bg-white/10 p-4 text-sm text-gray-700 dark:border-gray-800/60 dark:bg-black/10 dark:text-gray-200">
                    Loading your KWAMIs…
                  </div>
                ) : kwamiError ? (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                    {kwamiError}
                  </div>
                ) : !hasKwamiNft ? (
                  <div className="rounded-lg border border-gray-200/60 bg-white/10 p-4 text-sm text-gray-700 dark:border-gray-800/60 dark:bg-black/10 dark:text-gray-200">
                    No KWAMI NFTs found in this wallet (or collection mint not configured).
                  </div>
                ) : (
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-gray-700 dark:text-gray-200">
                    Holder access granted. Pick your KWAMI below to use as your “passport”.
                  </div>
                )}
              </div>
            </KwamiGlassCard>
          </div>

          <div className="h-full overflow-hidden">
            <KwamiGlassCard className="h-full" title={<span>Your KWAMIs</span>} headerRight={<span>{kwamiNfts.length}</span>}>
              {hasKwamiNft ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <KwamiGlassButton
                        label={showPreviews ? 'Hide previews' : 'Show previews'}
                        mode={showPreviews ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setShowPreviews((v) => !v)}
                      />
                      <KwamiGlassButton
                        label={visibleCount >= orderedKwamiNfts.length ? 'All loaded' : `Load more (${Math.min(orderedKwamiNfts.length, visibleCount)}/${orderedKwamiNfts.length})`}
                        mode="ghost"
                        size="sm"
                        disabled={visibleCount >= orderedKwamiNfts.length}
                        onClick={() => setVisibleCount((n) => Math.min(orderedKwamiNfts.length, n + 24))}
                      />
                    </div>
                    {!showPreviews ? (
                      <div className="text-xs text-gray-500 dark:text-gray-400">Previews are off to keep the page fast.</div>
                    ) : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleKwamiNfts.map((nft) => {
                      const selected = nft.mint === selectedKwamiMint
                      return (
                        <article
                          key={nft.mint}
                          className={[
                            'rounded-2xl border bg-white/10 p-4 transition',
                            selected
                              ? 'border-primary-500/40 bg-primary-500/10'
                              : 'border-gray-200/60 dark:border-gray-800/60 dark:bg-black/10',
                          ].join(' ')}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                {nft.name || 'KWAMI'}
                              </div>
                              <div className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400">{short(nft.mint)}</div>
                            </div>
                            {selected ? (
                              <span className="rounded-full border border-primary-500/30 bg-primary-500/10 px-2 py-1 text-[11px] font-semibold text-primary-600 dark:text-primary-300">
                                Selected
                              </span>
                            ) : null}
                          </div>

                          {showPreviews && nft.image ? (
                            <div className="mt-3 overflow-hidden rounded-xl border border-white/20">
                              {/* Image-only preview (metadata points to a GIF). Avoid canvas-per-card for perf. */}
                              <img
                                src={nft.image}
                                alt={nft.name || 'KWAMI'}
                                className="h-40 w-full object-cover"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                          ) : (
                            <div className="mt-3 flex h-40 items-center justify-center rounded-xl border border-gray-200/60 bg-white/10 text-xs text-gray-500 dark:border-gray-800/60 dark:bg-black/10 dark:text-gray-400">
                              {showPreviews ? 'No image' : 'Preview disabled'}
                            </div>
                          )}

                          <div className="mt-3 flex items-center gap-2">
                            <KwamiGlassButton
                              label="Use this KWAMI"
                              mode={selected ? 'primary' : 'outline'}
                              size="sm"
                              block
                              onClick={() => setSelectedKwamiMint(nft.mint)}
                            />
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {connected ? 'No KWAMIs to show.' : 'Connect a wallet to see your KWAMIs.'}
                </div>
              )}
            </KwamiGlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}




