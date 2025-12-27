<script lang="ts">
  import KwamiGlassCard from '@/components/KwamiGlassCard.svelte'
  import KwamiGlassButton from '@/components/KwamiGlassButton.svelte'
  import { auth } from '@/stores/auth'

  type Proposal = {
    id: string
    title: string
    status: 'active' | 'passed' | 'rejected'
    endsIn: string
    summary: string
  }

  const proposals: Proposal[] = [
    {
      id: 'P-001',
      title: 'Bootstrap Treasury Allocation',
      status: 'passed',
      endsIn: 'ended',
      summary: 'Allocate initial treasury buckets for grants, ops, and reserves.',
    },
    {
      id: 'P-002',
      title: 'Community Grants Program v1',
      status: 'active',
      endsIn: '3d 12h',
      summary: 'Fund small experiments built by KWAMI holders.',
    },
    {
      id: 'P-003',
      title: 'Treasury Transparency Dashboard',
      status: 'rejected',
      endsIn: 'ended',
      summary: 'Publish monthly spending reports and on-chain receipts.',
    },
  ]

  const badgeClass = (status: Proposal['status']) => {
    if (status === 'active') return 'border-cyan-500/30 text-cyan-600 dark:text-cyan-300 bg-cyan-500/10'
    if (status === 'passed') return 'border-emerald-500/30 text-emerald-600 dark:text-emerald-300 bg-emerald-500/10'
    return 'border-red-500/30 text-red-600 dark:text-red-300 bg-red-500/10'
  }
</script>

<div class="absolute inset-0 px-6 py-6 overflow-hidden">
  <div class="h-full overflow-hidden mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
    <aside class="h-full overflow-hidden">
      <KwamiGlassCard title="Governance" headerRight="Open view" className="h-full" scrollContent={true} cursorGlow={true}>
        <div class="space-y-5">
          <div>
            <div class="text-3xl sm:text-4xl font-black tracking-tight">
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400">
                Proposals & voting
              </span>
            </div>
            <div class="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Browse everything. Participation unlocks with KWAMI NFT ownership.
            </div>
          </div>

          <div class="p-4 rounded-xl border border-gray-200/60 bg-white/10 dark:border-gray-800/60 dark:bg-black/10">
            <div class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Your access</div>
            <div class="text-sm text-gray-700 dark:text-gray-200">
              {#if $auth.status === 'member'}
                Member verified — you can create proposals and vote.
              {:else if $auth.status === 'checking'}
                Verifying membership…
              {:else if $auth.status === 'disconnected'}
                Read-only. Connect a wallet to verify membership.
              {:else}
                Connected, but not verified as a KWAMI holder yet.
              {/if}
            </div>
          </div>

          <div class="flex gap-2">
            <KwamiGlassButton
              label="Create proposal"
              icon="＋"
              mode="primary"
              size="md"
              disabled={$auth.status !== 'member'}
              on:click={() => alert('TODO: wire create proposal flow')}
            />
            <KwamiGlassButton
              label="View rules"
              icon="↗"
              mode="ghost"
              size="md"
              on:click={() => alert('TODO: wire governance rules')}
            />
          </div>

          {#if $auth.status !== 'member'}
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Tip: connect a wallet that owns a KWAMI NFT to unlock proposal creation + voting.
            </div>
          {/if}
        </div>
      </KwamiGlassCard>
    </aside>

    <section class="h-full overflow-hidden">
      <KwamiGlassCard title="Proposals" headerRight="Public" className="h-full" scrollContent={true} cursorGlow={true}>
        <div class="space-y-3">
          {#each proposals as p}
            <article class="p-4 rounded-2xl border border-gray-200/60 bg-white/10 dark:border-gray-800/60 dark:bg-black/10">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">
                    {p.title}
                  </div>
                  <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {p.id} • {p.endsIn === 'ended' ? 'Ended' : `Ends in ${p.endsIn}`}
                  </div>
                </div>
                <span class={`px-2 py-1 text-[11px] font-semibold rounded-full border ${badgeClass(p.status)}`}>
                  {p.status}
                </span>
              </div>

              <div class="mt-3 text-sm text-gray-700 dark:text-gray-200">
                {p.summary}
              </div>

              <div class="mt-4 flex gap-2">
                <KwamiGlassButton
                  label="Details"
                  icon="↗"
                  mode="ghost"
                  size="sm"
                  on:click={() => alert(`TODO: open proposal ${p.id}`)}
                />
                <KwamiGlassButton
                  label="Vote"
                  icon="✓"
                  mode="outline"
                  size="sm"
                  disabled={$auth.status !== 'member' || p.status !== 'active'}
                  on:click={() => alert(`TODO: vote on ${p.id}`)}
                />
              </div>
            </article>
          {/each}
        </div>
      </KwamiGlassCard>
    </section>
  </div>
</div>


