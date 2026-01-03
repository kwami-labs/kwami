<template>
  <div class="h-screen overflow-hidden relative">
    <!-- Header (overlay, like web page 00) -->
    <header class="fixed top-0 inset-x-0 z-30">
      <div class="px-6">
        <div class="py-5">
          <div class="grid grid-cols-[1fr_auto_1fr] items-center">
            <div class="flex items-center space-x-3 min-w-0">
              <a href="/" class="inline-flex items-center" aria-label="KWAMI">
                <span ref="logoHost" class="inline-flex items-center" />
              </a>
            </div>

            <!-- Tabs (center) -->
            <div class="justify-self-center">
              <div class="kwami-glass-surface rounded-full border border-gray-200/60 dark:border-gray-800/60 bg-white/15 dark:bg-black/15 p-1 inline-flex gap-1">
                <button
                  class="px-4 py-2 text-xs font-semibold tracking-wider rounded-full transition"
                  :class="activeTab === 'info'
                    ? 'bg-white/30 dark:bg-white/10 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5'"
                  @click="activeTab = 'info'"
                >
                  Info
                </button>
                <button
                  class="px-4 py-2 text-xs font-semibold tracking-wider rounded-full transition"
                  :class="activeTab === 'mint'
                    ? 'bg-white/30 dark:bg-white/10 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5'"
                  @click="activeTab = 'mint'"
                >
                  Mint
                </button>
                <button
                  class="px-4 py-2 text-xs font-semibold tracking-wider rounded-full transition"
                  :class="activeTab === 'traits'
                    ? 'bg-white/30 dark:bg-white/10 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5'"
                  @click="activeTab = 'traits'"
                >
                  Traits
                </button>
              </div>
            </div>

            <div class="flex items-center gap-3 justify-self-end">
              <ThemeToggle />
              <WalletConnect ref="walletConnectRef" />
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
          :style="{ transform: `translateX(-${tabIndex * 100}%)` }"
        >
          <!-- Info page (left) -->
          <section class="w-full shrink-0 h-full relative">
            <div class="absolute inset-0 flex items-center justify-center px-6">
              <div class="w-[min(92vw,720px)]">
                <KwamiGlassCard class-name="w-full" :scroll-content="true" :cursor-glow="false">
                  <template #title>Info</template>
                  <template #headerRight>KWAMI</template>

                  <div class="space-y-4">
                    <p class="text-sm text-gray-700 dark:text-gray-200">
                      Welcome. This is the Candy Machine mint screen.
                    </p>
                    <div class="grid sm:grid-cols-2 gap-3">
                      <div class="p-4 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">How it works</div>
                        <div class="text-sm text-gray-700 dark:text-gray-200">
                          Click Roll & Mint to spin 12–24 times, then mint your final configuration.
                        </div>
                      </div>
                      <div class="p-4 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Controls</div>
                        <div class="text-sm text-gray-700 dark:text-gray-200">
                          Drag on the blob to rotate. Single click to randomize.
                        </div>
                      </div>
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-300">
                      Minting cost: ~0.01 SOL + network fees.
                    </div>
                  </div>
                </KwamiGlassCard>
              </div>
            </div>
          </section>

          <!-- Mint page (center / default) -->
          <section class="w-full shrink-0 h-full relative">
            <!-- Title (moves with the page) -->
            <div class="absolute left-1/2 top-4 -translate-x-1/2 z-20 w-[min(92vw,640px)] text-center pointer-events-none">
              <div class="text-3xl sm:text-4xl font-black tracking-tight">
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400">
                  Mint your unique KWAMI
                </span>
              </div>
              <div class="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Roll the Candy Machine. Mint on Solana.
              </div>
            </div>

            <!-- Left panel (slides with page) -->
            <aside class="hidden lg:block absolute left-6 top-0 bottom-0 w-[380px] z-10">
              <KwamiGlassCard class-name="h-full" :scroll-content="true">
                <template #title>Body</template>
                <template #headerRight>Solana</template>

                <div v-if="nftStore.currentBlobConfig" class="space-y-3">
                  <!-- Skin Type & Subtype -->
                  <div class="grid grid-cols-2 gap-2">
                    <div class="p-2 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Skin Type</div>
                      <div class="text-sm font-semibold text-gray-900 dark:text-white">Tricolor</div>
                    </div>
                    <div class="p-2 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Skin Subtype</div>
                      <div class="text-sm font-semibold text-gray-900 dark:text-white capitalize">{{ getSkinSubtype(nftStore.currentBlobConfig.skin) }}</div>
                    </div>
                  </div>

                  <!-- Skin Palette -->
                  <div class="p-3 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">Skin Palette</div>
                    <div class="flex gap-2">
                      <div class="flex-1 text-center">
                        <div
                          class="h-8 rounded border border-gray-300 dark:border-gray-600 mb-1"
                          :style="{ backgroundColor: getColorValue(nftStore.currentBlobConfig.colors?.x) }"
                        />
                        <div class="text-xs text-gray-600 dark:text-gray-400 font-mono">{{ getColorValue(nftStore.currentBlobConfig.colors?.x) }}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-500">R:{{ getColorComponent(nftStore.currentBlobConfig.colors?.x, 'r') }}</div>
                      </div>
                      <div class="flex-1 text-center">
                        <div
                          class="h-8 rounded border border-gray-300 dark:border-gray-600 mb-1"
                          :style="{ backgroundColor: getColorValue(nftStore.currentBlobConfig.colors?.y) }"
                        />
                        <div class="text-xs text-gray-600 dark:text-gray-400 font-mono">{{ getColorValue(nftStore.currentBlobConfig.colors?.y) }}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-500">G:{{ getColorComponent(nftStore.currentBlobConfig.colors?.y, 'g') }}</div>
                      </div>
                      <div class="flex-1 text-center">
                        <div
                          class="h-8 rounded border border-gray-300 dark:border-gray-600 mb-1"
                          :style="{ backgroundColor: getColorValue(nftStore.currentBlobConfig.colors?.z) }"
                        />
                        <div class="text-xs text-gray-600 dark:text-gray-400 font-mono">{{ getColorValue(nftStore.currentBlobConfig.colors?.z) }}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-500">B:{{ getColorComponent(nftStore.currentBlobConfig.colors?.z, 'b') }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Resolution & Wireframe -->
                  <div class="grid grid-cols-2 gap-2">
                    <div class="p-2 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Resolution</div>
                      <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.resolution || '—' }}</div>
                    </div>
                    <div class="p-2 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Wireframe</div>
                      <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.wireframe ? 'Yes' : 'No' }}</div>
                    </div>
                  </div>

                  <!-- Shininess & Light Intensity -->
                  <div class="grid grid-cols-2 gap-2">
                    <div class="p-2 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Shininess</div>
                      <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.shininess || '—' }}</div>
                    </div>
                    <div class="p-2 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Light Intensity</div>
                      <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.lightIntensity?.toFixed(1) || '1.0' }}</div>
                    </div>
                  </div>

                  <!-- Noise Frequency -->
                  <div class="p-3 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">Noise Frequency</div>
                    <div class="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">X</div>
                        <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.spikes?.x?.toFixed(2) || '—' }}</div>
                      </div>
                      <div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Y</div>
                        <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.spikes?.y?.toFixed(2) || '—' }}</div>
                      </div>
                      <div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Z</div>
                        <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.spikes?.z?.toFixed(2) || '—' }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Frequency Amplitude -->
                  <div class="p-3 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">Frequency Amplitude</div>
                    <div class="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">X</div>
                        <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.amplitude?.x?.toFixed(1) || '—' }}</div>
                      </div>
                      <div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Y</div>
                        <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.amplitude?.y?.toFixed(1) || '—' }}</div>
                      </div>
                      <div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Z</div>
                        <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.amplitude?.z?.toFixed(1) || '—' }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Animation Speed -->
                  <div class="p-3 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">Animation Speed</div>
                    <div class="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">X</div>
                        <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.time?.x?.toFixed(1) || '—' }}</div>
                      </div>
                      <div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Y</div>
                        <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.time?.y?.toFixed(1) || '—' }}</div>
                      </div>
                      <div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Z</div>
                        <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.time?.z?.toFixed(1) || '—' }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Auto Rotation -->
                  <div class="p-3 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">Auto Rotation</div>
                    <div class="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">X</div>
                        <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.rotation?.x?.toFixed(3) || '0.000' }}</div>
                      </div>
                      <div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Y</div>
                        <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.rotation?.y?.toFixed(3) || '0.000' }}</div>
                      </div>
                      <div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Z</div>
                        <div class="text-sm font-mono text-gray-900 dark:text-white">{{ nftStore.currentBlobConfig.rotation?.z?.toFixed(3) || '0.000' }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </KwamiGlassCard>
            </aside>

            <!-- Right panel (slides with page) -->
            <aside class="hidden lg:block absolute right-6 top-0 bottom-0 w-[380px] z-10">
              <KwamiGlassCard class-name="h-full" :scroll-content="true">
                <template #title>Soul</template>
                <template #headerRight>Solana</template>

                <div class="space-y-5">
                  <!-- Soul Config -->
                  <div v-if="nftStore.currentSoulConfig" class="space-y-3">
                    
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

                  <!-- Minting cost -->
                  <div class="text-sm text-gray-600 dark:text-gray-300">
                    Minting cost: ~0.01 SOL + network fees
                  </div>
                </div>
              </KwamiGlassCard>
            </aside>

            <!-- Center blob preview (slides with page) -->
            <div class="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
              <div class="pointer-events-auto w-[min(60vmin,520px)] space-y-3">
                <BlobPreview
                  ref="blobPreviewRef"
                  :show-dna="false"
                  :show-randomize-button="false"
                  container-class="aspect-square"
                />
                <!-- DNA Hash below blob -->
                <div class="px-4">
                  <div class="p-3 rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/20 dark:bg-black/20 backdrop-blur-sm">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs text-gray-500 dark:text-gray-400">DNA Hash</span>
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
                </div>
              </div>
            </div>

            <!-- Mint button (slides with page) -->
            <div class="absolute left-1/2 bottom-0 -translate-x-1/2 z-20 w-[min(92vw,560px)]">
              <MintPanel :blob-preview-ref="blobPreviewRef" :on-request-connect="openWalletConnect" />
            </div>
          </section>

          <!-- Traits page (right) -->
          <section class="w-full shrink-0 h-full relative">
            <div class="absolute inset-0 px-6 py-6 overflow-hidden">
              <div class="h-full overflow-hidden grid grid-cols-[240px_1fr] gap-6">
                <!-- Left vertical menu -->
                <aside class="h-full overflow-y-auto pr-2">
                  <div class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Traits</div>

                  <nav class="space-y-2">
                    <button
                      v-for="section in traitsCatalog.sections"
                      :key="section.id"
                      type="button"
                      class="w-full text-left px-3 py-2 rounded-xl border transition"
                      :class="activeTraitSection === section.id
                        ? 'border-primary-500/40 bg-primary-500/10 text-gray-900 dark:text-white'
                        : 'border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10 text-gray-700 dark:text-gray-200 hover:bg-white/15 dark:hover:bg-black/15'"
                      @click="activeTraitSection = section.id"
                    >
                      <div class="text-sm font-semibold">
                        {{ section.label }}
                      </div>
                      <div class="text-xs opacity-70 mt-0.5">
                        {{ section.description || '' }}
                      </div>
                    </button>
                  </nav>
                </aside>

                <!-- Content -->
                <div class="h-full overflow-y-auto">
                  <div class="mb-6">
                    <div class="text-3xl sm:text-4xl font-black tracking-tight">
                      <span class="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400">
                        {{ activeSection?.label || 'Traits' }}
                      </span>
                    </div>
                    <div class="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {{ activeSection?.description || 'Browse the catalog of mint traits.' }}
                    </div>
                  </div>

                  <!-- BODY -->
                  <div v-if="activeTraitSection === 'body'" class="space-y-6">
                    <div class="grid lg:grid-cols-3 gap-5">
                      <section
                        v-for="category in bodyCategories"
                        :key="category.id"
                        class="space-y-3"
                      >
                        <div>
                          <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ category.label }}</div>
                          <div class="text-xs text-gray-500 dark:text-gray-400">{{ category.description || '' }}</div>
                        </div>

                        <div class="grid grid-cols-1 gap-3">
                          <article
                            v-for="item in category.items"
                            :key="item.id"
                            class="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/10 dark:bg-black/10 p-4"
                          >
                            <div class="flex items-start justify-between gap-3">
                              <div class="min-w-0">
                                <div class="text-sm font-semibold text-gray-900 dark:text-white">
                                  {{ item.title }}
                                </div>
                                <div v-if="item.subtitle" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {{ item.subtitle }}
                                </div>
                              </div>
                              <div v-if="typeof item.probability === 'number'" class="text-xs font-mono text-gray-500 dark:text-gray-400">
                                {{ formatPct(item.probability) }}
                              </div>
                            </div>

                            <div v-if="item.config" class="mt-3 text-xs font-mono text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words">
                              {{ formatConfig(item.config) }}
                            </div>
                          </article>
                        </div>
                      </section>
                    </div>
                  </div>

                  <!-- Fallback (other sections) -->
                  <div v-else class="text-sm text-gray-600 dark:text-gray-300">
                    This section is not configured yet.
                  </div>
                </div>
              </div>
            </div>
          </section>
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
import WalletConnect from '@/components/WalletConnect.vue'
import BlobPreview from '@/components/BlobPreview.vue'
import MintPanel from '@/components/MintPanel.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import KwamiGlassCard from '@/components/KwamiGlassCard.vue'
import KwamiGlassButton from '@/components/KwamiGlassButton.vue'
import { createKwamiLogoSvg } from 'kwami/ui'
import traitsCatalogJson from '@/config/traits-catalog.json'

const nftStore = useNFTStore()
const blobPreviewRef = ref<any>(null)
const walletConnectRef = ref<{ open?: () => Promise<void> } | null>(null)

const openWalletConnect = async () => {
  await walletConnectRef.value?.open?.()
}

type TraitsCatalog = {
  version: number
  sections: Array<{
    id: string
    label: string
    description?: string
    categories?: Array<{
      id: string
      label: string
      description?: string
      items: Array<{
        id: string
        title: string
        subtitle?: string
        probability?: number
        config?: any
      }>
    }>
  }>
}

const traitsCatalog = traitsCatalogJson as TraitsCatalog

const activeTraitSection = ref<string>(traitsCatalog.sections[0]?.id || 'body')

const activeSection = computed(() => traitsCatalog.sections.find((s) => s.id === activeTraitSection.value))

const bodyCategories = computed(() => {
  const body = traitsCatalog.sections.find((s) => s.id === 'body')
  return body?.categories ?? []
})

const formatPct = (p: number) => `${Math.round(p * 1000) / 10}%`

const activeTab = ref<'info' | 'mint' | 'traits'>('mint')
const tabIndex = computed(() => (activeTab.value === 'info' ? 0 : activeTab.value === 'mint' ? 1 : 2))

// Function to navigate to the next tab
const navigateTab = (direction: 'left' | 'right') => {
  const tabs = ['info', 'mint', 'traits'] as const
  const currentIndex = tabs.indexOf(activeTab.value)
  
  if (direction === 'left') {
    // Move to the previous tab, with wrap-around
    const newIndex = currentIndex - 1 < 0 ? tabs.length - 1 : currentIndex - 1
    activeTab.value = tabs[newIndex]
  } else {
    // Move to the next tab, with wrap-around
    const newIndex = currentIndex + 1 >= tabs.length ? 0 : currentIndex + 1
    activeTab.value = tabs[newIndex]
  }
}

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
    return JSON.stringify(config, null, 2)
  } catch {
    return String(config)
  }
}

// Helper to convert hex color to RGB value for display
const getColorValue = (hexColor: string | undefined): string => {
  if (!hexColor || typeof hexColor !== 'string') return '#808080'
  // Hex colors are already in the right format
  return hexColor
}

// Helper to extract RGB component from hex color
const getColorComponent = (hexColor: string | undefined, component: 'r' | 'g' | 'b'): number => {
  if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) return 128
  
  const hex = hexColor.replace('#', '')
  let r = 0, g = 0, b = 0
  
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16)
    g = parseInt(hex[1] + hex[1], 16)
    b = parseInt(hex[2] + hex[2], 16)
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16)
    g = parseInt(hex.substring(2, 4), 16)
    b = parseInt(hex.substring(4, 6), 16)
  }
  
  return component === 'r' ? r : component === 'g' ? g : b
}

// Helper to map skin selection to subtype label
const getSkinSubtype = (skin: any): string => {
  const subtype = String(skin?.subtype || 'poles')
  return subtype.charAt(0).toUpperCase() + subtype.slice(1)
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

// Keyboard event handler for arrow navigation
const handleKeyDown = (event: KeyboardEvent) => {
  // Only handle arrow keys when not focused on an input/textarea
  const activeElement = document.activeElement
  const isInputElement = activeElement && (
    activeElement.tagName === 'INPUT' || 
    activeElement.tagName === 'TEXTAREA' || 
    activeElement.tagName === 'SELECT'
  )
  
  if (isInputElement) return
  
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    navigateTab('left')
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    navigateTab('right')
  }
}

onMounted(async () => {
  document.title = 'Kwami.io - Mint Your Unique KWAMI NFT'
  await nftStore.fetchStats()
  
  // Add keyboard event listener for arrow navigation
  window.addEventListener('keydown', handleKeyDown)

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
  // Remove keyboard event listener
  window.removeEventListener('keydown', handleKeyDown)
  
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
