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

  const setActiveTab = (tab: Tab) => {
    activeTab = tab
  }

  const handleNavigateEvent = (event: Event) => {
    const detail = (event as CustomEvent).detail as Tab | undefined
    if (!detail) return
    if (tabs.includes(detail)) setActiveTab(detail)
  }

  onMount(() => {
    document.title = 'KWAMI DAO'
    initAuth()
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('kwami:navigate', handleNavigateEvent as EventListener)
  })

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('kwami:navigate', handleNavigateEvent as EventListener)
  })
</script>

<div 
  class="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-gray-900 transition-colors duration-300 dark:bg-gradient-to-br dark:from-gray-950 dark:via-black dark:to-gray-900 dark:text-white"
  style="width: 100vw !important; min-width: 100vw !important; max-width: 100vw !important; overflow-x: hidden !important;"
>
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
            <div class="kwami-glass-surface inline-flex gap-1 rounded-full border border-gray-200/60 bg-white/15 p-1 dark:border-gray-800/60 dark:bg-black/15">
              <button
                class={`px-4 py-2 text-xs font-semibold tracking-wider rounded-full transition ${
                  activeTab === 'info'
                    ? 'bg-white/30 text-gray-900 dark:bg-white/10 dark:text-white'
                    : 'text-gray-600 hover:bg-white/10 dark:text-gray-300 dark:hover:bg-white/5'
                }`}
                type="button"
                on:click={() => (activeTab = 'info')}
              >
                Info
              </button>

              <button
                class={`px-4 py-2 text-xs font-semibold tracking-wider rounded-full transition ${
                  activeTab === 'governance'
                    ? 'bg-white/30 text-gray-900 dark:bg-white/10 dark:text-white'
                    : 'text-gray-600 hover:bg-white/10 dark:text-gray-300 dark:hover:bg-white/5'
                }`}
                type="button"
                on:click={() => (activeTab = 'governance')}
              >
                Governance
              </button>

              <button
                class={`px-4 py-2 text-xs font-semibold tracking-wider rounded-full transition ${
                  activeTab === 'treasury'
                    ? 'bg-white/30 text-gray-900 dark:bg-white/10 dark:text-white'
                    : 'text-gray-600 hover:bg-white/10 dark:text-gray-300 dark:hover:bg-white/5'
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
  <main class="h-screen overflow-hidden pt-24 pb-14" style="width: 100vw !important; max-width: 100vw !important;">
    <div class="h-full overflow-hidden" style="width: 100vw !important; max-width: 100vw !important;">
      <div
        class="h-full flex transition-transform duration-500 ease-out"
        style={`transform: translateX(-${tabIndex() * 100}%); width: ${tabs.length * 100}vw !important;`}
      >
        <section class="h-full relative flex items-center justify-center px-6" style="width: 100vw; flex-shrink: 0;">
          <div class="w-[min(92vw,720px)]">
            <InfoPage />
          </div>
        </section>

        <section class="h-full relative flex items-center justify-center px-6" style="width: 100vw; flex-shrink: 0;">
          <div class="w-[min(96vw,1180px)]">
            <GovernancePage />
          </div>
        </section>

        <section class="h-full relative flex items-center justify-center px-6" style="width: 100vw; flex-shrink: 0;">
          <div class="w-[min(96vw,1180px)]">
            <TreasuryPage />
          </div>
        </section>
      </div>
    </div>
  </main>

  <!-- Footer (thin, fixed; no scrolling) -->
  <footer class="fixed bottom-0 inset-x-0 z-20 border-t border-gray-200/60 py-3 dark:border-gray-800/60">
    <div class="px-6">
      <div class="text-center text-xs text-gray-500">
        © 2025 Kwami.io — KWAMI DAO
      </div>
    </div>
  </footer>
</div>
