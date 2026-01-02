<script lang="ts">
  import KwamiGlassCard from '@/components/KwamiGlassCard.svelte'
  import KwamiGlassButton from '@/components/KwamiGlassButton.svelte'
  import { auth } from '@/stores/auth'
  import { onDestroy } from 'svelte'
  import { refreshTreasuryMetrics, treasuryMetrics } from '@/stores/treasuryMetrics'

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 })

  let timer: any
  $: network = $auth.network
  $: {
    void refreshTreasuryMetrics(network)
    clearInterval(timer)
    timer = setInterval(() => void refreshTreasuryMetrics(network), 20_000)
  }
  onDestroy(() => clearInterval(timer))
</script>

<div class="w-full h-full">
  <div class="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-4 sm:gap-6">
    <aside>
      <KwamiGlassCard title="Treasury" headerRight="Public view" className="w-full h-full" scrollContent={true} cursorGlow={false}>
        <div class="space-y-5">
          <div>
            <div class="text-3xl sm:text-4xl font-black tracking-tight">
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400">
                Transparency first
              </span>
            </div>
            <div class="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Everyone can see the treasury. Only KWAMI holders can propose and execute actions.
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="p-4 rounded-xl border border-gray-200/60 bg-white/10 dark:border-gray-800/60 dark:bg-black/10">
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Treasury (SOL)</div>
              <div class="text-xl font-black text-gray-900 dark:text-white">
                {#if $treasuryMetrics.status === 'ready' && $treasuryMetrics.treasurySol != null}
                  {fmt($treasuryMetrics.treasurySol)}
                {:else}
                  —
                {/if}
              </div>
            </div>
            <div class="p-4 rounded-xl border border-gray-200/60 bg-white/10 dark:border-gray-800/60 dark:bg-black/10">
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">KWAMI minted</div>
              <div class="text-xl font-black text-gray-900 dark:text-white">
                {#if $treasuryMetrics.status === 'ready' && $treasuryMetrics.totalKwamiMinted != null}
                  {$treasuryMetrics.totalKwamiMinted.toLocaleString()}
                {:else}
                  —
                {/if}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="p-4 rounded-xl border border-gray-200/60 bg-white/10 dark:border-gray-800/60 dark:bg-black/10">
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">QWAMI minted</div>
              <div class="text-xl font-black text-gray-900 dark:text-white">
                {#if $treasuryMetrics.status === 'ready' && $treasuryMetrics.totalQwamiMinted != null}
                  {$treasuryMetrics.totalQwamiMinted.toLocaleString()}
                {:else}
                  —
                {/if}
              </div>
            </div>
            <div class="p-4 rounded-xl border border-gray-200/60 bg-white/10 dark:border-gray-800/60 dark:bg-black/10">
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">QWAMI burned</div>
              <div class="text-xl font-black text-gray-900 dark:text-white">
                {#if $treasuryMetrics.status === 'ready' && $treasuryMetrics.totalQwamiBurned != null}
                  {$treasuryMetrics.totalQwamiBurned.toLocaleString()}
                {:else}
                  —
                {/if}
              </div>
            </div>
          </div>

          {#if $treasuryMetrics.status === 'error' && $treasuryMetrics.errorMessage}
            <div class="p-4 rounded-xl border border-rose-200/60 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/20 text-sm text-rose-700 dark:text-rose-200">
              {$treasuryMetrics.errorMessage}
              {#if $treasuryMetrics.daoState}
                <div class="mt-2 text-xs font-mono opacity-80">daoState: {$treasuryMetrics.daoState}</div>
              {/if}
            </div>
          {/if}

          <div class="p-4 rounded-xl border border-gray-200/60 bg-white/10 dark:border-gray-800/60 dark:bg-black/10">
            <div class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Actions</div>
            <div class="flex flex-wrap gap-2">
              <KwamiGlassButton
                label="Request transfer"
                icon="⇄"
                mode="primary"
                size="md"
                disabled={$auth.status !== 'member'}
                on:click={() => alert('TODO: wire transfer request flow')}
              />
              <KwamiGlassButton
                label="Deposit"
                icon="↓"
                mode="outline"
                size="md"
                on:click={() => alert('TODO: wire deposit flow')}
              />
              <KwamiGlassButton
                label="Export report"
                icon="⤓"
                mode="ghost"
                size="md"
                on:click={() => alert('TODO: wire export')}
              />
            </div>

            {#if $auth.status !== 'member'}
              <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Transfer requests require KWAMI membership verification.
              </div>
            {/if}
          </div>
        </div>
      </KwamiGlassCard>
    </aside>

    <section>
      <KwamiGlassCard title="Activity" headerRight="Public" className="w-full h-full" scrollContent={true} cursorGlow={false}>
        <div class="space-y-3">
          <article class="p-4 rounded-2xl border border-gray-200/60 bg-white/10 dark:border-gray-800/60 dark:bg-black/10">
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold text-gray-900 dark:text-white">Treasury wallet</div>
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400">Public</span>
            </div>
            <div class="mt-2 text-sm text-gray-700 dark:text-gray-200">
              {#if $treasuryMetrics.treasuryWallet}
                <span class="font-mono text-xs break-all">{$treasuryMetrics.treasuryWallet}</span>
              {:else}
                —
              {/if}
            </div>
          </article>

          <article class="p-4 rounded-2xl border border-gray-200/60 bg-white/10 dark:border-gray-800/60 dark:bg-black/10">
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold text-gray-900 dark:text-white">DAO state</div>
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400">PDA</span>
            </div>
            <div class="mt-2 text-sm text-gray-700 dark:text-gray-200">
              {#if $treasuryMetrics.daoState}
                <span class="font-mono text-xs break-all">{$treasuryMetrics.daoState}</span>
              {:else}
                —
              {/if}
            </div>
          </article>

          <article class="p-4 rounded-2xl border border-gray-200/60 bg-white/10 dark:border-gray-800/60 dark:bg-black/10">
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold text-gray-900 dark:text-white">Last update</div>
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400">Auto</span>
            </div>
            <div class="mt-2 text-sm text-gray-700 dark:text-gray-200">
              {#if $treasuryMetrics.lastUpdatedAt}
                {new Date($treasuryMetrics.lastUpdatedAt).toLocaleString()}
              {:else}
                —
              {/if}
            </div>
          </article>
        </div>
      </KwamiGlassCard>
    </section>
  </div>
</div>


