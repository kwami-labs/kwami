<script lang="ts">
  import KwamiGlassCard from '@/components/KwamiGlassCard.svelte'
  import KwamiGlassButton from '@/components/KwamiGlassButton.svelte'
  import { auth } from '@/stores/auth'

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 })
</script>

<div class="absolute inset-0 px-6 py-6 overflow-hidden">
  <div class="h-full overflow-hidden grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
    <aside class="h-full overflow-hidden">
      <KwamiGlassCard title="Treasury" headerRight="Public view" className="h-full" scrollContent={true} cursorGlow={true}>
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
            <div class="p-4 rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Treasury (SOL)</div>
              <div class="text-xl font-black text-gray-900 dark:text-white">{fmt(128.42)}</div>
            </div>
            <div class="p-4 rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Treasury (USDC)</div>
              <div class="text-xl font-black text-gray-900 dark:text-white">{fmt(54_230.0)}</div>
            </div>
          </div>

          <div class="p-4 rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
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

    <section class="h-full overflow-hidden">
      <KwamiGlassCard title="Activity" headerRight="Public" className="h-full" scrollContent={true} cursorGlow={true}>
        <div class="space-y-3">
          <article class="p-4 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold text-gray-900 dark:text-white">Grant payout</div>
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400">2h ago</span>
            </div>
            <div class="mt-2 text-sm text-gray-700 dark:text-gray-200">
              250 USDC sent to community project milestone.
            </div>
          </article>

          <article class="p-4 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold text-gray-900 dark:text-white">Treasury top-up</div>
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400">1d ago</span>
            </div>
            <div class="mt-2 text-sm text-gray-700 dark:text-gray-200">
              12.5 SOL deposited to treasury.
            </div>
          </article>

          <article class="p-4 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold text-gray-900 dark:text-white">Ops budget</div>
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400">7d ago</span>
            </div>
            <div class="mt-2 text-sm text-gray-700 dark:text-gray-200">
              1,000 USDC allocated for infrastructure costs.
            </div>
          </article>
        </div>
      </KwamiGlassCard>
    </section>
  </div>
</div>


