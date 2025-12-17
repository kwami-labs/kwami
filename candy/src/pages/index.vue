<template>
  <div class="h-screen overflow-hidden relative">
    <!-- Header (overlay, like web page 00) -->
    <header class="fixed top-0 inset-x-0 z-30">
      <div class="px-6">
        <div class="py-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <a href="/" class="inline-flex items-center" aria-label="KWAMI">
                <span ref="logoHost" class="inline-flex items-center" />
              </a>
              <UsersOnline />
            </div>

            <div class="flex items-center gap-3">
              <ThemeToggle />
              <WalletConnect />
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Fullscreen (no page scroll) -->
    <main class="h-screen pt-24 pb-12 overflow-hidden">
      <div class="h-[calc(100vh-9rem)] px-6">
        <div class="h-full grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)_380px] gap-8 items-start">
          <!-- Left: Latest minted (mock for now) -->
          <aside class="lg:pt-2">
            <UCard class="bg-white/70 dark:bg-gray-950/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl">
              <template #header>
                <div class="flex items-baseline justify-between">
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">Latest Minted</h3>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Live soon</div>
                </div>
              </template>

              <div class="space-y-3 max-h-[calc(100vh-11.5rem)] overflow-auto pr-1">
                <div
                  v-for="item in latestMinted"
                  :key="item.mint"
                  class="p-3 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/30 dark:bg-black/20"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <div class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {{ item.name }}
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        {{ item.when }}
                      </div>
                    </div>
                    <UBadge color="green" variant="subtle">Minted</UBadge>
                  </div>

                  <div class="mt-2 space-y-1">
                    <div class="text-[11px] text-gray-500 dark:text-gray-400">Mint</div>
                    <div class="font-mono text-xs text-gray-700 dark:text-gray-200 break-all">
                      {{ short(item.mint) }}
                    </div>
                  </div>

                  <div class="mt-2 space-y-1">
                    <div class="text-[11px] text-gray-500 dark:text-gray-400">DNA</div>
                    <div class="font-mono text-xs text-gray-700 dark:text-gray-200 break-all">
                      {{ short(item.dna) }}
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
          </aside>

          <!-- Middle: keep the blob centered in the viewport -->
          <div class="h-full grid grid-rows-[1fr_auto_1fr]">
            <!-- Top row: supply (doesn't push the blob off-center) -->
            <div class="self-end pb-4">
              <div class="grid grid-cols-2 gap-4 w-full max-w-[640px] mx-auto">
                <div class="p-4 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/30 dark:bg-black/20">
                  <div class="text-xs text-gray-500 dark:text-gray-400">Minted</div>
                  <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ nftStore.totalMinted.toLocaleString() }}</div>
                </div>
                <div class="p-4 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/30 dark:bg-black/20">
                  <div class="text-xs text-gray-500 dark:text-gray-400">Remaining</div>
                  <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ remainingCount.toLocaleString() }}</div>
                </div>
              </div>
            </div>

            <!-- Middle row: blob (exact center) -->
            <div class="flex items-center justify-center">
              <div class="w-full max-w-[640px]">
                <BlobPreview
                  ref="blobPreviewRef"
                  :show-dna="false"
                  :show-randomize-button="false"
                  container-class="h-[min(52vh,520px)]"
                />
              </div>
            </div>

            <!-- Bottom row: mint (doesn't push the blob off-center) -->
            <div class="self-start pt-4">
              <div class="w-full max-w-[640px] mx-auto">
                <MintPanel :blob-preview-ref="blobPreviewRef" />
              </div>
            </div>
          </div>

          <!-- Right: NFT metadata -->
          <div class="lg:pt-2">
            <UCard class="bg-white/70 dark:bg-gray-950/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl">
              <template #header>
                <div class="flex items-baseline justify-between">
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">NFT Metadata</h3>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Solana</div>
                </div>
              </template>

              <div class="space-y-5 max-h-[calc(100vh-11.5rem)] overflow-auto pr-1">
                <!-- DNA -->
                <div class="p-4 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/30 dark:bg-black/20">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-gray-500 dark:text-gray-400">DNA Hash</span>
                    <UButton
                      size="xs"
                      color="primary"
                      variant="ghost"
                      :disabled="!nftStore.currentDna"
                      @click="copyDna"
                    >
                      {{ dnaCopied ? 'Copied!' : 'Copy' }}
                    </UButton>
                  </div>
                  <p class="font-mono text-xs break-all text-gray-700 dark:text-gray-200">
                    {{ nftStore.currentDna || '—' }}
                  </p>
                </div>

                <!-- Config snapshot -->
                <div v-if="nftStore.currentBlobConfig" class="space-y-2">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">Body Config</div>
                  <div class="text-xs text-gray-600 dark:text-gray-300 font-mono whitespace-pre-wrap break-words">
                    {{ formatConfig(nftStore.currentBlobConfig) }}
                  </div>
                </div>

                <!-- Minting cost -->
                <div class="text-sm text-gray-600 dark:text-gray-300">
                  Minting cost: ~0.01 SOL + network fees
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer (thin, fixed; no scrolling) -->
    <footer class="fixed bottom-0 inset-x-0 z-20 border-t border-gray-200/60 dark:border-gray-800/60 py-3">
      <div class="px-6">
        <div class="text-center text-xs text-gray-500">
          © 2025 Kwami.io — Solana Candy Machine
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useNFTStore } from '@/stores/nft'
import UsersOnline from '@/components/UsersOnline.vue'
import WalletConnect from '@/components/WalletConnect.vue'
import BlobPreview from '@/components/BlobPreview.vue'
import MintPanel from '@/components/MintPanel.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { createKwamiLogoSvg } from 'kwami/ui'

const nftStore = useNFTStore()
const blobPreviewRef = ref<any>(null)

const logoHost = ref<HTMLElement | null>(null)
let logoEl: SVGSVGElement | null = null

const dnaCopied = ref(false)

type LatestMintedItem = {
  mint: string
  dna: string
  name: string
  when: string
}

// Mock for now; will be wired to chain/indexer later.
const latestMinted = ref<LatestMintedItem[]>([
  {
    mint: '8Vt8oM3w5Jqf3u6ZxGmGv1g3R7YkWfWcE2xkWJmQmG1Q',
    dna: 'a7f0d3c8b2e14f9a6c3d1e0f9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1',
    name: 'KWAMI A7F0D3C8',
    when: 'just now',
  },
  {
    mint: 'F2pQkJx7bZk8a9nL2mR3tY6uV1wX4cD8eR5tY2uV9wX1cD3eR5tY2uV9wX',
    dna: 'b19e2f3c4d5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
    name: 'KWAMI B19E2F3C',
    when: '1m ago',
  },
  {
    mint: '3qXn9pLm2kJ7hG5fD3sA1zX8cV6bN4mK2jH9gF7dS5aA3zX1cV8bN6mK4j',
    dna: 'c0d1e2f3a4b5c6d7e8f9b0a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9',
    name: 'KWAMI C0D1E2F3',
    when: '6m ago',
  },
  {
    mint: '9mK4jH7gF2dS6aA1zX3cV8bN5mK2jH9gF7dS4aA1zX8cV6bN3mK2jH9gF7',
    dna: 'd8f7e6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9',
    name: 'KWAMI D8F7E6C5',
    when: '14m ago',
  },
  {
    mint: '7dS4aA1zX8cV6bN3mK2jH9gF7dS5aA3zX1cV8bN6mK4jH7gF2dS6aA1zX3',
    dna: 'e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3',
    name: 'KWAMI E2F1A0B9',
    when: '22m ago',
  },
])

const short = (value: string, left = 6, right = 6) => {
  if (!value) return '—'
  if (value.length <= left + right + 3) return value
  return `${value.slice(0, left)}…${value.slice(-right)}`
}

const remainingCount = computed(() => 1_000_000_000_000 - nftStore.totalMinted)

const formatConfig = (config: any) => {
  try {
    // Keep it compact/readable in the side panel
    return JSON.stringify(
      {
        resolution: config.resolution,
        spikes: config.spikes,
        rotation: config.rotation,
        colors: config.colors,
        baseScale: config.baseScale,
        shininess: config.shininess,
        opacity: config.opacity,
      },
      null,
      2
    )
  } catch {
    return String(config)
  }
}

const copyDna = async () => {
  if (!nftStore.currentDna) return

  try {
    await navigator.clipboard.writeText(nftStore.currentDna)
    dnaCopied.value = true
    window.setTimeout(() => {
      dnaCopied.value = false
    }, 1200)
  } catch {
    // ignore
  }
}

onMounted(async () => {
  document.title = 'Kwami.io - Mint Your Unique KWAMI NFT'
  await nftStore.fetchStats()

  if (logoHost.value) {
    // Clear (HMR / remount safety)
    logoHost.value.innerHTML = ''

    logoEl = createKwamiLogoSvg({
      gradientId: `kwami-logo-grad-${Math.random().toString(16).slice(2)}`,
      strokeWidth: 4,
      style: {
        height: '26px',
        width: '140px',
      },
    })

    logoHost.value.appendChild(logoEl)
  }
})

onBeforeUnmount(() => {
  if (logoEl?.parentNode) {
    logoEl.parentNode.removeChild(logoEl)
  }
  logoEl = null
})
</script>
