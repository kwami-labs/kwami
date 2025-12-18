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
    <main class="h-screen overflow-hidden">
      <!-- Left panel -->
      <aside class="hidden lg:block fixed left-6 top-24 bottom-14 w-[380px] z-20">
        <KwamiGlassCard class-name="h-full" :scroll-content="true">
          <template #title>Latest Minted</template>
          <template #headerRight>Live soon</template>

          <div class="space-y-3">
            <div
              v-for="item in latestMinted"
              :key="item.mint"
              class="p-3 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-transparent"
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
                <span class="px-2 py-1 text-[11px] font-semibold rounded-full border border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/10">
                  Minted
                </span>
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
        </KwamiGlassCard>
      </aside>

      <!-- Right panel -->
      <aside class="hidden lg:block fixed right-6 top-24 bottom-14 w-[380px] z-20">
        <KwamiGlassCard class-name="h-full" :scroll-content="true">
          <template #title>NFT Metadata</template>
          <template #headerRight>Solana</template>

          <div class="space-y-5">
            <!-- DNA -->
            <div class="p-4 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/20 dark:bg-black/20">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-500 dark:text-gray-400">DNA Hash</span>
                <KwamiGlassButton
                  :label="dnaCopied ? 'Copied!' : 'Copy'"
                  mode="ghost"
                  size="sm"
                  :disabled="!nftStore.currentDna"
                  @click="copyDna"
                />
              </div>
              <p class="font-mono text-xs break-all text-gray-700 dark:text-gray-200">
                {{ nftStore.currentDna || '—' }}
              </p>
            </div>

            <!-- Soul Config -->
            <div v-if="nftStore.currentSoulConfig" class="space-y-3">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">✨ Soul</span>
              </div>
              
              <div class="space-y-3">
                <div class="p-3 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ nftStore.currentSoulConfig.name }}</div>
                </div>

                <div class="p-3 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Personality</div>
                  <div class="text-sm text-gray-700 dark:text-gray-200">{{ nftStore.currentSoulConfig.personality }}</div>
                </div>

                <div class="p-3 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Traits</div>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="trait in nftStore.currentSoulConfig.traits"
                      :key="trait"
                      class="px-2 py-0.5 text-xs rounded-full bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-500/20"
                    >
                      {{ trait }}
                    </span>
                  </div>
                </div>

                <div class="p-3 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">Emotional Traits</div>
                  <div class="space-y-2">
                    <div v-for="(value, key) in nftStore.currentSoulConfig.emotionalTraits" :key="key" class="flex items-center gap-3">
                      <label class="text-xs font-medium text-gray-600 dark:text-gray-400 w-20 capitalize">
                        {{ key }}
                      </label>
                      <input
                        :value="value"
                        type="range"
                        min="-100"
                        max="100"
                        disabled
                        class="flex-1 soul-range-slider"
                      />
                      <span class="text-xs font-mono text-gray-600 dark:text-gray-400 w-10 text-right">
                        {{ value }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="p-2 rounded bg-white/10 dark:bg-black/10">
                    <div class="text-gray-500 dark:text-gray-400 mb-0.5">Style</div>
                    <div class="text-gray-900 dark:text-white capitalize">{{ nftStore.currentSoulConfig.conversationStyle }}</div>
                  </div>
                  <div class="p-2 rounded bg-white/10 dark:bg-black/10">
                    <div class="text-gray-500 dark:text-gray-400 mb-0.5">Tone</div>
                    <div class="text-gray-900 dark:text-white capitalize">{{ nftStore.currentSoulConfig.emotionalTone }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Body Config -->
            <div v-if="nftStore.currentBlobConfig" class="space-y-3">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">🧬 Body</span>
              </div>
              
              <div class="space-y-3">
                <!-- Visual Properties -->
                <div class="p-3 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">Colors (RGB)</div>
                  <div class="flex gap-2">
                    <div class="flex-1 text-center">
                      <div
                        class="h-8 rounded border border-gray-300 dark:border-gray-600 mb-1"
                        :style="{ backgroundColor: `rgb(${Math.round((nftStore.currentBlobConfig.colors?.x || 0) * 255)}, 0, 0)` }"
                      />
                      <div class="text-xs text-gray-600 dark:text-gray-400">{{ Math.round((nftStore.currentBlobConfig.colors?.x || 0) * 255) }}</div>
                    </div>
                    <div class="flex-1 text-center">
                      <div
                        class="h-8 rounded border border-gray-300 dark:border-gray-600 mb-1"
                        :style="{ backgroundColor: `rgb(0, ${Math.round((nftStore.currentBlobConfig.colors?.y || 0) * 255)}, 0)` }"
                      />
                      <div class="text-xs text-gray-600 dark:text-gray-400">{{ Math.round((nftStore.currentBlobConfig.colors?.y || 0) * 255) }}</div>
                    </div>
                    <div class="flex-1 text-center">
                      <div
                        class="h-8 rounded border border-gray-300 dark:border-gray-600 mb-1"
                        :style="{ backgroundColor: `rgb(0, 0, ${Math.round((nftStore.currentBlobConfig.colors?.z || 0) * 255)})` }"
                      />
                      <div class="text-xs text-gray-600 dark:text-gray-400">{{ Math.round((nftStore.currentBlobConfig.colors?.z || 0) * 255) }}</div>
                    </div>
                  </div>
                </div>

                <!-- Geometry -->
                <div class="grid grid-cols-2 gap-2">
                  <div class="p-2 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Resolution</div>
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.resolution }}</div>
                  </div>
                  <div class="p-2 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Skin Type</div>
                    <div class="text-sm font-semibold text-gray-900 dark:text-white capitalize">{{ nftStore.currentBlobConfig.skin }}</div>
                  </div>
                  <div class="p-2 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Shininess</div>
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.shininess }}</div>
                  </div>
                  <div class="p-2 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Wireframe</div>
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.wireframe ? 'Yes' : 'No' }}</div>
                  </div>
                </div>

                <!-- Deformation (Spikes) -->
                <div class="p-3 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">Spikes (XYZ)</div>
                  <div class="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">X</div>
                      <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.spikes?.x?.toFixed(2) }}</div>
                    </div>
                    <div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Y</div>
                      <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.spikes?.y?.toFixed(2) }}</div>
                    </div>
                    <div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Z</div>
                      <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.spikes?.z?.toFixed(2) }}</div>
                    </div>
                  </div>
                </div>

                <!-- Time -->
                <div class="p-3 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">Time (XYZ)</div>
                  <div class="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">X</div>
                      <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.time?.x?.toFixed(2) }}</div>
                    </div>
                    <div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Y</div>
                      <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.time?.y?.toFixed(2) }}</div>
                    </div>
                    <div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Z</div>
                      <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.time?.z?.toFixed(2) }}</div>
                    </div>
                  </div>
                </div>

                <!-- Rotation -->
                <div class="p-3 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">Rotation (XYZ)</div>
                  <div class="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">X</div>
                      <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.rotation?.x?.toFixed(3) }}</div>
                    </div>
                    <div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Y</div>
                      <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.rotation?.y?.toFixed(3) }}</div>
                    </div>
                    <div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Z</div>
                      <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.rotation?.z?.toFixed(3) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Minting cost -->
            <div class="text-sm text-gray-600 dark:text-gray-300">
              Minting cost: ~0.01 SOL + network fees
            </div>
          </div>
        </KwamiGlassCard>
      </aside>

      <!-- Stats (top-center) -->
      <div class="fixed left-1/2 top-24 -translate-x-1/2 z-20 w-[min(92vw,560px)]">
        <div class="grid grid-cols-2 gap-4">
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

      <!-- Blob preview (fixed center, square) -->
      <div class="fixed inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div class="pointer-events-auto w-[min(60vmin,520px)]">
          <BlobPreview
            ref="blobPreviewRef"
            :show-dna="false"
            :show-randomize-button="false"
            container-class="aspect-square"
          />
        </div>
      </div>

      <!-- Mint (bottom-center) -->
      <div class="fixed left-1/2 bottom-14 -translate-x-1/2 z-20 w-[min(92vw,560px)]">
        <MintPanel :blob-preview-ref="blobPreviewRef" />
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
import KwamiGlassCard from '@/components/KwamiGlassCard.vue'
import KwamiGlassButton from '@/components/KwamiGlassButton.vue'
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

<style scoped>
/* Custom range input styling for Soul emotional traits */
.soul-range-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: linear-gradient(to right, #ef4444 0%, #fbbf24 50%, #10b981 100%);
  border-radius: 2px;
  outline: none;
  cursor: not-allowed;
  opacity: 0.9;
}

.soul-range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  background: currentColor;
  cursor: not-allowed;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.soul-range-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: currentColor;
  cursor: not-allowed;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
