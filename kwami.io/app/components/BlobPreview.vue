<template>
  <div class="blob-preview">
    <div ref="canvasContainer" class="canvas-container w-full h-96 bg-kwami-gray-900 rounded-lg relative overflow-hidden">
      <!-- Canvas will be injected here by Three.js -->
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-kwami-primary mx-auto mb-4"></div>
          <p class="text-kwami-gray-400">Loading preview...</p>
        </div>
      </div>
    </div>
    
    <!-- DNA Display -->
    <div v-if="dna" class="mt-4 glass-effect rounded-lg p-4">
      <div class="flex items-center justify-between">
        <span class="text-sm text-kwami-gray-400">DNA Hash</span>
        <button
          @click="copyDna"
          class="text-kwami-primary hover:text-kwami-secondary transition-colors text-sm"
        >
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <p class="font-mono text-xs mt-2 break-all text-kwami-gray-300">{{ dna }}</p>
    </div>
    
    <!-- Controls -->
    <div class="mt-4 space-y-3">
      <button
        @click="randomize"
        class="btn-secondary w-full"
      >
        🎲 Randomize
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const canvasContainer = ref<HTMLDivElement>()
const loading = ref(true)
const dna = ref<string | null>(null)
const copied = ref(false)

// TODO: Initialize Three.js scene and blob
onMounted(async () => {
  await nextTick()
  
  // Simulate loading
  setTimeout(() => {
    loading.value = false
    // TODO: Initialize blob with Three.js
    generateDna()
  }, 1000)
})

const generateDna = () => {
  // TODO: Calculate real DNA from blob configuration
  dna.value = Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}

const randomize = () => {
  loading.value = true
  // TODO: Randomize blob configuration
  setTimeout(() => {
    loading.value = false
    generateDna()
  }, 500)
}

const copyDna = async () => {
  if (!dna.value) return
  
  try {
    await navigator.clipboard.writeText(dna.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

onUnmounted(() => {
  // TODO: Cleanup Three.js scene
})
</script>

<style scoped>
.canvas-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.btn-secondary {
  @apply px-4 py-2 rounded-lg font-medium text-white transition-all;
  @apply glass-effect hover:bg-white/20;
}
</style>

