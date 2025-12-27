<script lang="ts">
  import KwamiGlassCard from '@/components/KwamiGlassCard.svelte'
  import KwamiGlassButton from '@/components/KwamiGlassButton.svelte'
  import { auth, verifyKwamiOwnership } from '@/stores/auth'

  const envCollection = ((import.meta as any).env?.VITE_KWAMI_COLLECTION_ADDRESS as string | undefined) ?? ''

  const short = (value: string, left = 6, right = 6) => {
    if (!value) return '—'
    if (value.length <= left + right + 3) return value
    return `${value.slice(0, left)}…${value.slice(-right)}`
  }

  const nav = (tab: 'info' | 'governance' | 'treasury') => {
    window.dispatchEvent(new CustomEvent('kwami:navigate', { detail: tab }))
  }
</script>

<div class="absolute inset-0 px-6 py-6 overflow-hidden">
  <div class="h-full overflow-hidden mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-6">
    <section class="h-full overflow-hidden">
      <KwamiGlassCard title="Overview" headerRight="KWAMI DAO" className="h-full" scrollContent={true} cursorGlow={true}>
        <div class="space-y-5">
          <div>
            <div class="text-4xl sm:text-5xl font-black tracking-tight leading-[1.05]">
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400">
                Fully open DAO
              </span>
              <span class="text-white/80">, gated participation.</span>
            </div>
            <div class="mt-3 text-sm text-gray-600 dark:text-gray-300 max-w-[70ch]">
              Everyone can browse. To create proposals, vote, and execute actions, connect a wallet that owns at least one
              <span class="font-semibold text-gray-900 dark:text-white">KWAMI NFT</span>.
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div class="p-4 rounded-xl border border-gray-200/60 bg-white/10 dark:border-gray-800/60 dark:bg-black/10">
              <div class="text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-2">Public</div>
              <div class="text-sm text-gray-700 dark:text-gray-200">
                DAO overview, proposals list + outcomes, treasury dashboards and history.
              </div>
            </div>
            <div class="p-4 rounded-xl border border-gray-200/60 bg-white/10 dark:border-gray-800/60 dark:bg-black/10">
              <div class="text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-2">Gated</div>
              <div class="text-sm text-gray-700 dark:text-gray-200">
                Creating proposals, voting, and treasury actions.
              </div>
            </div>
          </div>

          <div class="grid sm:grid-cols-3 gap-3">
            <div class="p-4 rounded-xl border border-gray-200/60 bg-white/10 dark:border-gray-800/60 dark:bg-black/10">
              <div class="text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Network</div>
              <div class="mt-2 text-lg font-black text-gray-900 dark:text-white">{$auth.network}</div>
            </div>
            <div class="p-4 rounded-xl border border-gray-200/60 bg-white/10 dark:border-gray-800/60 dark:bg-black/10">
              <div class="text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Mode</div>
              <div class="mt-2 text-lg font-black text-gray-900 dark:text-white">
                {$auth.status === 'member' ? 'Member' : $auth.status === 'connected' ? 'Connected' : 'Read-only'}
              </div>
            </div>
            <div class="p-4 rounded-xl border border-gray-200/60 bg-white/10 dark:border-gray-800/60 dark:bg-black/10">
              <div class="text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">KWAMI NFTs</div>
              <div class="mt-2 text-lg font-black text-gray-900 dark:text-white">{$auth.kwamiNfts.length}</div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 pt-1">
            <KwamiGlassButton
              label="Open Governance"
              icon="↗"
              mode="primary"
              size="md"
              on:click={() => nav('governance')}
            />
            <KwamiGlassButton label="Open Treasury" icon="↗" mode="outline" size="md" on:click={() => nav('treasury')} />
            <KwamiGlassButton
              label="Re-check membership"
              icon="⟳"
              mode="ghost"
              size="md"
              disabled={$auth.status === 'disconnected' || $auth.status === 'checking'}
              on:click={() => verifyKwamiOwnership()}
            />
          </div>

          {#if !envCollection}
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Tip: set <span class="font-mono">VITE_KWAMI_COLLECTION_ADDRESS</span> for strict collection gating.
            </div>
          {/if}
        </div>
      </KwamiGlassCard>
    </section>

    <aside class="h-full overflow-hidden grid grid-rows-2 gap-6">
      <KwamiGlassCard title="Membership" headerRight={$auth.status === 'member' ? 'Verified' : 'Check'} className="h-full" scrollContent={true} cursorGlow={true}>
        <div class="space-y-4">
          {#if $auth.status === 'disconnected'}
            <div class="p-4 rounded-xl border border-gray-200/60 bg-white/10 dark:border-gray-800/60 dark:bg-black/10">
              <div class="text-sm font-semibold text-gray-900 dark:text-white">Read-only mode</div>
              <div class="mt-1 text-sm text-gray-600 dark:text-gray-300">Connect a wallet to verify KWAMI NFT ownership.</div>
            </div>
          {:else if $auth.status === 'checking'}
            <div class="p-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
              <div class="text-sm font-semibold text-gray-900 dark:text-white">Verifying…</div>
              <div class="mt-1 text-sm text-gray-600 dark:text-gray-300">Checking your wallet for verified KWAMI NFTs.</div>
            </div>
          {:else if $auth.status === 'member'}
            <div class="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
              <div class="text-sm font-semibold text-gray-900 dark:text-white">Verified KWAMI holder</div>
              <div class="mt-1 text-sm text-gray-700 dark:text-gray-200">
                You own <span class="font-semibold">{$auth.kwamiNfts.length}</span> KWAMI NFT{$auth.kwamiNfts.length === 1 ? '' : 's'}.
              </div>
              {#if $auth.kwamiNfts[0]}
                <div class="mt-3 text-xs text-gray-600 dark:text-gray-300">
                  Example mint: <span class="font-mono">{short($auth.kwamiNfts[0].mint)}</span>
                </div>
              {/if}
            </div>
          {:else if $auth.status === 'connected'}
            <div class="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10">
              <div class="text-sm font-semibold text-gray-900 dark:text-white">No KWAMI NFT found</div>
              <div class="mt-1 text-sm text-gray-600 dark:text-gray-300">You can browse, but you need a KWAMI NFT to participate.</div>
            </div>
          {:else}
            <div class="p-4 rounded-2xl border border-red-500/30 bg-red-500/10">
              <div class="text-sm font-semibold text-gray-900 dark:text-white">Verification error</div>
              <div class="mt-2 rounded-xl border border-gray-200/60 bg-white/10 p-3 dark:border-gray-800/60 dark:bg-black/10">
                <pre class="whitespace-pre-wrap break-words text-[11px] leading-relaxed text-gray-700 dark:text-gray-200 font-mono">{($auth.errorMessage || 'Something went wrong.').trim()}</pre>
              </div>
            </div>
          {/if}

          {#if envCollection}
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Collection: <span class="font-mono">{short(envCollection)}</span>
            </div>
          {/if}
        </div>
      </KwamiGlassCard>

      <KwamiGlassCard title="Quick actions" headerRight="Shortcuts" className="h-full" scrollContent={true} cursorGlow={true}>
        <div class="space-y-3">
          <div class="p-4 rounded-xl border border-gray-200/60 bg-white/10 dark:border-gray-800/60 dark:bg-black/10">
            <div class="text-sm font-semibold text-gray-900 dark:text-white">Governance</div>
            <div class="mt-1 text-sm text-gray-600 dark:text-gray-300">Browse proposals and outcomes. Voting unlocks after verification.</div>
            <div class="mt-3">
              <KwamiGlassButton label="Open proposals" icon="↗" mode="ghost" size="sm" on:click={() => nav('governance')} />
            </div>
          </div>

          <div class="p-4 rounded-xl border border-gray-200/60 bg-white/10 dark:border-gray-800/60 dark:bg-black/10">
            <div class="text-sm font-semibold text-gray-900 dark:text-white">Treasury</div>
            <div class="mt-1 text-sm text-gray-600 dark:text-gray-300">Track balances and activity. Actions are gated.</div>
            <div class="mt-3">
              <KwamiGlassButton label="Open treasury" icon="↗" mode="ghost" size="sm" on:click={() => nav('treasury')} />
            </div>
          </div>
        </div>
      </KwamiGlassCard>
    </aside>
  </div>
</div>


