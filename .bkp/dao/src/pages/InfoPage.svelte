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

<div class="w-full h-full">
  <KwamiGlassCard title="KWAMI DAO" headerRight={$auth.network} className="w-full" scrollContent={true} cursorGlow={false}>
    <div class="space-y-6">
      <div class="space-y-2">
        <div class="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400">
            Fully open DAO
          </span>
          <span class="text-gray-700/80 dark:text-white/80">, gated participation.</span>
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-300">
          Browse everything. Connect a wallet with a KWAMI NFT to create proposals, vote, and execute treasury actions.
        </div>
      </div>

      <div class="grid sm:grid-cols-3 gap-3">
        <div class="kwami-subpanel p-4">
          <div class="text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Network</div>
          <div class="mt-2 text-lg font-black text-gray-900 dark:text-white">{$auth.network}</div>
        </div>
        <div class="kwami-subpanel p-4">
          <div class="text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Mode</div>
          <div class="mt-2 text-lg font-black text-gray-900 dark:text-white">
            {$auth.status === 'member' ? 'Member' : $auth.status === 'connected' ? 'Connected' : 'Read-only'}
          </div>
        </div>
        <div class="kwami-subpanel p-4">
          <div class="text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">KWAMI NFTs</div>
          <div class="mt-2 text-lg font-black text-gray-900 dark:text-white">{$auth.kwamiNfts.length}</div>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 gap-3">
        <div class="kwami-subpanel p-4">
          <div class="text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-1">Public</div>
          <div class="text-sm text-gray-700 dark:text-gray-200">DAO overview, proposals list + outcomes, treasury dashboards and history.</div>
        </div>
        <div class="kwami-subpanel p-4">
          <div class="text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-1">Gated</div>
          <div class="text-sm text-gray-700 dark:text-gray-200">Creating proposals, voting, and treasury actions.</div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 pt-1">
        <KwamiGlassButton label="Open Governance" icon="↗" mode="primary" size="md" on:click={() => nav('governance')} />
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

      {#if $auth.status !== 'member'}
        <div class="kwami-subpanel p-4 space-y-1">
          {#if $auth.status === 'disconnected'}
            <div class="text-sm font-semibold text-gray-900 dark:text-white">Read-only mode</div>
            <div class="text-sm text-gray-600 dark:text-gray-300">Connect a wallet to verify KWAMI NFT ownership.</div>
          {:else if $auth.status === 'checking'}
            <div class="text-sm font-semibold text-gray-900 dark:text-white">Verifying…</div>
            <div class="text-sm text-gray-600 dark:text-gray-300">Checking your wallet for verified KWAMI NFTs.</div>
          {:else if $auth.status === 'connected'}
            <div class="text-sm font-semibold text-gray-900 dark:text-white">No KWAMI NFT found</div>
            <div class="text-sm text-gray-600 dark:text-gray-300">You can browse, but need a KWAMI NFT to participate.</div>
          {:else}
            <div class="text-sm font-semibold text-gray-900 dark:text-white">Verification error</div>
            <div class="rounded-xl border border-gray-200/60 bg-white/10 p-3 dark:border-gray-800/60 dark:bg-black/10">
              <pre class="whitespace-pre-wrap break-words text-[11px] leading-relaxed text-gray-700 dark:text-gray-200 font-mono">{($auth.errorMessage || 'Something went wrong.').trim()}</pre>
            </div>
          {/if}
        </div>
      {/if}

      <div class="grid sm:grid-cols-2 gap-3">
        <KwamiGlassButton label="Open proposals" icon="↗" mode="ghost" size="sm" on:click={() => nav('governance')} />
        <KwamiGlassButton label="Open treasury" icon="↗" mode="ghost" size="sm" on:click={() => nav('treasury')} />
      </div>

      {#if envCollection}
        <div class="text-xs text-gray-500 dark:text-gray-400">
          Collection: <span class="font-mono">{short(envCollection)}</span>
        </div>
      {:else}
        <div class="text-xs text-gray-500 dark:text-gray-400">
          Tip: set <span class="font-mono">VITE_KWAMI_COLLECTION_ADDRESS</span> for strict collection gating.
        </div>
      {/if}
    </div>
  </KwamiGlassCard>
</div>


