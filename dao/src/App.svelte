<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import BackgroundRings from '@/components/BackgroundRings.svelte'
  import KwamiLogo from '@/components/KwamiLogo.svelte'
  import ThemeToggle from '@/components/ThemeToggle.svelte'
  import WalletConnect from '@/components/WalletConnect.svelte'
  import InfoPage from '@/pages/InfoPage.svelte'
  import GovernancePage from '@/pages/GovernancePage.svelte'
  import TreasuryPage from '@/pages/TreasuryPage.svelte'
  import { initAuth } from '@/stores/auth'

  type Tab = 'info' | 'governance' | 'treasury'
  const tabs: Tab[] = ['info', 'governance', 'treasury']

  let activeTab: Tab = 'info'

  const tabIndex = () => tabs.indexOf(activeTab)

  const navigateTab = (direction: 'left' | 'right') => {
    const currentIndex = tabIndex()
    if (direction === 'left') {
      activeTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length]
    } else {
      activeTab = tabs[(currentIndex + 1) % tabs.length]
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const activeElement = document.activeElement
    const tag = activeElement?.tagName
    const isInputElement = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
    if (isInputElement) return

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      navigateTab('left')
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      navigateTab('right')
    }
  }

  onMount(() => {
    document.title = 'KWAMI DAO'
    initAuth()
    window.addEventListener('keydown', handleKeyDown)
  })

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
</script>

<div class="relative h-screen overflow-hidden bg-[#030712] text-white">
  <!-- Backdrop -->
  <div class="absolute inset-0">
    <div class="absolute -inset-[40%] opacity-70 blur-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(192,132,252,0.28),transparent_55%),radial-gradient(circle_at_70%_35%,rgba(56,189,248,0.20),transparent_55%),radial-gradient(circle_at_40%_85%,rgba(16,185,129,0.16),transparent_55%)]"></div>
    <div class="absolute inset-0 kwami-bg-grid opacity-[0.20]"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-black/55 to-black/70"></div>
  </div>

  <BackgroundRings />

  <!-- Header (overlay) -->
  <header class="fixed top-0 inset-x-0 z-30">
    <div class="px-6">
      <div class="py-5">
        <div class="grid grid-cols-[1fr_auto_1fr] items-center">
          <div class="flex items-center space-x-3 min-w-0">
            <a href="/" class="inline-flex items-center" aria-label="KWAMI DAO">
              <KwamiLogo />
            </a>
          </div>

          <!-- Tabs -->
          <div class="justify-self-center">
            <div class="kwami-glass-surface rounded-full border border-white/10 bg-white/5 p-1 inline-flex gap-1 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
              <button
                class={`px-4 py-2 text-xs font-semibold tracking-wider rounded-full transition ${
                  activeTab === 'info'
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5'
                }`}
                type="button"
                on:click={() => (activeTab = 'info')}
              >
                Info
              </button>

              <button
                class={`px-4 py-2 text-xs font-semibold tracking-wider rounded-full transition ${
                  activeTab === 'governance'
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5'
                }`}
                type="button"
                on:click={() => (activeTab = 'governance')}
              >
                Governance
              </button>

              <button
                class={`px-4 py-2 text-xs font-semibold tracking-wider rounded-full transition ${
                  activeTab === 'treasury'
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5'
                }`}
                type="button"
                on:click={() => (activeTab = 'treasury')}
              >
                Treasury
              </button>
            </div>
          </div>

          <div class="flex items-center gap-3 justify-self-end">
            <ThemeToggle />
            <WalletConnect />
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Fullscreen (no page scroll) -->
  <main class="h-screen overflow-hidden pt-24 pb-14">
    <div class="h-full overflow-hidden">
      <div
        class="h-full flex transition-transform duration-500 ease-out"
        style={`transform: translateX(-${tabIndex() * 100}%);`}
      >
        <section class="w-full shrink-0 h-full relative">
          <InfoPage />
        </section>

        <section class="w-full shrink-0 h-full relative">
          <GovernancePage />
        </section>

        <section class="w-full shrink-0 h-full relative">
          <TreasuryPage />
        </section>
      </div>
    </div>
  </main>

  <!-- Footer (thin, fixed; no scrolling) -->
  <footer class="fixed bottom-0 inset-x-0 z-20 border-t border-white/10 py-3">
    <div class="px-6">
      <div class="text-center text-xs text-white/45">
        © 2025 Kwami.io — KWAMI DAO
      </div>
    </div>
  </footer>
</div>
