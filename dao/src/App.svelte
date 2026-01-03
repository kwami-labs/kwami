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

<div class="kwami-shell">
  <BackgroundRings />

  <!-- Header (overlay) -->
  <header class="fixed top-0 inset-x-0 z-30">
    <div class="kwami-header-backdrop" aria-hidden="true"></div>

    <div class="relative px-6">
      <div class="mx-auto max-w-6xl py-5">
        <div class="relative flex items-center justify-between gap-4">
          <div class="flex items-center space-x-3 min-w-0">
            <a href="/" class="inline-flex items-center" aria-label="KWAMI DAO">
              <KwamiLogo />
            </a>
          </div>

          <!-- Tabs (hard-centered, with animated pill) -->
          <div class="absolute left-1/2 -translate-x-1/2">
            <div
              class="kwami-tabbar"
              style={`--tab-count: ${tabs.length}; --tab-index: ${tabIndex()};`}
              aria-label="Page tabs"
            >
              <div class="kwami-tab-indicator" aria-hidden="true"></div>

              <button
                class={`kwami-tab ${activeTab === 'info' ? 'is-active' : ''}`}
                type="button"
                on:click={() => (activeTab = 'info')}
              >
                Info
              </button>
              <button
                class={`kwami-tab ${activeTab === 'governance' ? 'is-active' : ''}`}
                type="button"
                on:click={() => (activeTab = 'governance')}
              >
                Governance
              </button>
              <button
                class={`kwami-tab ${activeTab === 'treasury' ? 'is-active' : ''}`}
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
        class="kwami-page-slider h-full flex"
        style={`transform: translateX(-${tabIndex() * 100}%);`}
      >
        <!-- Info page -->
        <section class="w-full shrink-0 h-full relative">
          <div class="absolute inset-0 flex items-center justify-center px-6">
            <div class="w-[min(92vw,720px)]">
              <InfoPage />
            </div>
          </div>
        </section>

        <!-- Governance page -->
        <section class="w-full shrink-0 h-full relative">
          <div class="absolute inset-0 flex items-center justify-center px-6">
            <div class="w-[min(96vw,1180px)]">
              <GovernancePage />
            </div>
          </div>
        </section>

        <!-- Treasury page -->
        <section class="w-full shrink-0 h-full relative">
          <div class="absolute inset-0 flex items-center justify-center px-6">
            <div class="w-[min(96vw,1180px)]">
              <TreasuryPage />
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>

  <!-- Footer (thin, fixed; no scrolling) -->
  <footer class="fixed bottom-0 inset-x-0 z-20">
    <div class="kwami-footer-backdrop" aria-hidden="true"></div>
    <div class="relative px-6 py-3">
      <div class="mx-auto max-w-6xl text-center text-xs text-gray-500 dark:text-gray-400">
        © 2025 Kwami.io — KWAMI DAO
      </div>
    </div>
  </footer>
</div>
