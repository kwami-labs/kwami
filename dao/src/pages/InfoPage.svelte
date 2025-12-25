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
</script>

<div class="absolute inset-0 flex items-center justify-center px-6">
  <div class="w-[min(92vw,920px)] space-y-5">
    <KwamiGlassCard title="Info" headerRight="KWAMI DAO" className="w-full" scrollContent={true} cursorGlow={true}>
      <div class="space-y-4">
        <div class="text-3xl sm:text-4xl font-black tracking-tight">
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400">
            Fully open DAO, gated participation
          </span>
        </div>

        <p class="text-sm text-gray-700 dark:text-gray-200">
          Everyone can browse the DAO. To <span class="font-semibold">login and participate</span>, connect a wallet that owns at least one
          <span class="font-semibold">KWAMI NFT</span>.
        </p>

        <div class="grid sm:grid-cols-2 gap-3">
          <div class="p-4 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">What’s public</div>
            <div class="text-sm text-gray-700 dark:text-gray-200">
              DAO overview, proposals list + outcomes, treasury dashboards and history.
            </div>
          </div>
          <div class="p-4 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">What’s gated</div>
            <div class="text-sm text-gray-700 dark:text-gray-200">
              Creating proposals, voting, and treasury actions.
            </div>
          </div>
        </div>
      </div>
    </KwamiGlassCard>

    <div class="grid lg:grid-cols-2 gap-5">
      <KwamiGlassCard title="Membership" headerRight={$auth.network} className="w-full" scrollContent={false} cursorGlow={true}>
        <div class="space-y-4">
          {#if $auth.status === 'disconnected'}
            <div class="p-4 rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
              <div class="text-sm font-semibold text-gray-900 dark:text-white">Read-only mode</div>
              <div class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Connect a wallet to verify KWAMI NFT ownership and participate.
              </div>
            </div>
          {:else if $auth.status === 'checking'}
            <div class="p-4 rounded-xl border border-cyan-500/25 bg-cyan-500/10">
              <div class="text-sm font-semibold text-gray-900 dark:text-white">Verifying…</div>
              <div class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Checking your wallet for verified KWAMI NFTs.
              </div>
            </div>
          {:else if $auth.status === 'member'}
            <div class="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10">
              <div class="text-sm font-semibold text-gray-900 dark:text-white">Verified KWAMI holder</div>
              <div class="mt-1 text-sm text-gray-700 dark:text-gray-200">
                You own <span class="font-semibold">{$auth.kwamiNfts.length}</span> KWAMI NFT{$auth.kwamiNfts.length === 1 ? '' : 's'}.
              </div>
              {#if $auth.kwamiNfts[0]}
                <div class="mt-3 text-xs text-gray-600 dark:text-gray-300">
                  Example: <span class="font-mono">{short($auth.kwamiNfts[0].mint)}</span>
                </div>
              {/if}
            </div>
          {:else if $auth.status === 'connected'}
            <div class="p-4 rounded-xl border border-amber-500/25 bg-amber-500/10">
              <div class="text-sm font-semibold text-gray-900 dark:text-white">No KWAMI NFT found</div>
              <div class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                You can browse, but you need a KWAMI NFT to participate.
              </div>
            </div>
          {:else}
            <div class="p-4 rounded-xl border border-red-500/25 bg-red-500/10">
              <div class="text-sm font-semibold text-gray-900 dark:text-white">Verification error</div>
              <div class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {$auth.errorMessage || 'Something went wrong.'}
              </div>
            </div>
          {/if}

          <div class="flex flex-wrap items-center gap-2">
            <KwamiGlassButton
              label="Re-check membership"
              icon="⟳"
              mode="ghost"
              size="sm"
              disabled={$auth.status === 'disconnected' || $auth.status === 'checking'}
              on:click={() => verifyKwamiOwnership()}
            />

            {#if envCollection}
              <span class="text-xs text-gray-500 dark:text-gray-400">
                Collection: <span class="font-mono">{short(envCollection)}</span>
              </span>
            {:else}
              <span class="text-xs text-gray-500 dark:text-gray-400">
                Tip: set <span class="font-mono">VITE_KWAMI_COLLECTION_ADDRESS</span> for strict collection gating.
              </span>
            {/if}
          </div>
        </div>
      </KwamiGlassCard>

      <KwamiGlassCard title="Quick actions" headerRight="Read-only by default" className="w-full" scrollContent={false} cursorGlow={true}>
        <div class="space-y-3">
          <div class="p-4 rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
            <div class="text-sm font-semibold text-gray-900 dark:text-white">Go to Governance</div>
            <div class="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Browse proposals now. Voting unlocks after KWAMI membership verification.
            </div>
          </div>

          <div class="p-4 rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
            <div class="text-sm font-semibold text-gray-900 dark:text-white">Go to Treasury</div>
            <div class="mt-1 text-sm text-gray-600 dark:text-gray-300">
              View balances and spending history. Actions are gated.
            </div>
          </div>
        </div>
      </KwamiGlassCard>
    </div>
  </div>
</div>


