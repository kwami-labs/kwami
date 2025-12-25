import { useEffect, useMemo, useState } from 'react'
import { BackgroundRings } from '@/components/BackgroundRings'
import { KwamiLogo } from '@/components/KwamiLogo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { WalletConnect } from '@/components/WalletConnect'
import { InfoPage } from '@/pages/InfoPage'
import { MarketPage } from '@/pages/MarketPage'
import { YouPage } from '@/pages/YouPage'
import { WalletProvider } from '@/state/wallet'

type Tab = 'info' | 'market' | 'you'

function InnerApp() {
  const [activeTab, setActiveTab] = useState<Tab>('market')
  const tabIndex = activeTab === 'info' ? 0 : activeTab === 'market' ? 1 : 2

  const tabs = useMemo(
    () =>
      [
        { id: 'info' as const, label: 'Info' },
        { id: 'market' as const, label: 'Market' },
        { id: 'you' as const, label: 'You' },
      ] as const,
    [],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const el = document.activeElement
      const isInputLike =
        el &&
        (el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.tagName === 'SELECT' ||
          (el as HTMLElement).isContentEditable)
      if (isInputLike) return

      const idx = tabs.findIndex((t) => t.id === activeTab)
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        const next = idx - 1 < 0 ? tabs.length - 1 : idx - 1
        setActiveTab(tabs[next]!.id)
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        const next = idx + 1 >= tabs.length ? 0 : idx + 1
        setActiveTab(tabs[next]!.id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, tabs])

  return (
    <div className="relative h-screen overflow-hidden bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
      <BackgroundRings />

      <header className="fixed inset-x-0 top-0 z-30">
        <div className="px-6">
          <div className="py-5">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center">
              <div className="flex min-w-0 items-center space-x-3">
                <a href="/" className="inline-flex items-center" aria-label="KWAMI">
                  <KwamiLogo className="h-[26px] w-[140px]" />
                </a>
              </div>

              <div className="justify-self-center">
                <div className="kwami-glass-surface inline-flex gap-1 rounded-full border border-gray-200/60 bg-white/15 p-1 dark:border-gray-800/60 dark:bg-black/15">
                  {tabs.map((t) => {
                    const isActive = t.id === activeTab
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={[
                          'rounded-full px-4 py-2 text-xs font-semibold tracking-wider transition',
                          isActive
                            ? 'bg-white/30 text-gray-900 dark:bg-white/10 dark:text-white'
                            : 'text-gray-600 hover:bg-white/10 dark:text-gray-300 dark:hover:bg-white/5',
                        ].join(' ')}
                        onClick={() => setActiveTab(t.id)}
                      >
                        {t.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-self-end gap-3">
                <ThemeToggle />
                <WalletConnect />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="h-screen overflow-hidden pb-14 pt-24">
        <div className="h-full overflow-hidden">
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${tabIndex * 100}%)` }}
          >
            <section className="relative h-full w-full shrink-0">
              <InfoPage />
            </section>
            <section className="relative h-full w-full shrink-0">
              <MarketPage />
            </section>
            <section className="relative h-full w-full shrink-0">
              <YouPage />
            </section>
          </div>
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200/60 py-3 dark:border-gray-800/60">
        <div className="px-6">
          <div className="text-center text-xs text-gray-500">© 2025 Kwami.io — Marketplace</div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <WalletProvider>
      <InnerApp />
    </WalletProvider>
  )
}
