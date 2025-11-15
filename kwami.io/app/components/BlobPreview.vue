<template>
  <div class="space-y-4">
    <div ref="canvasContainer" class="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
      <!-- Canvas will be injected here by Three.js -->
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 animate-spin text-primary-400 mx-auto mb-4" />
          <p class="text-gray-400">Loading preview...</p>
        </div>
      </div>
    </div>
    
    <!-- DNA Display -->
    <UCard v-if="dna">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-400">DNA Hash</span>
          <UButton
            size="xs"
            color="primary"
            variant="ghost"
            @click="copyDna"
          >
            {{ copied ? 'Copied!' : 'Copy' }}
          </UButton>
        </div>
        <p class="font-mono text-xs break-all text-gray-300">{{ dna }}</p>
      </div>
    </UCard>
    
    <!-- Controls -->
    <UButton
      block
      size="lg"
      color="gray"
      variant="soft"
      @click="randomize"
      icon="i-heroicons-arrow-path"
    >
      Randomize
    </UButton>
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

const generateDna = async () => {
  // Get current blob configuration
  const blobConfig = {
    resolution: 5,
    spikes: { x: 0.5, y: 0.5, z: 0.5 },
    time: { x: 0.1, y: 0.1, z: 0.1 },
    rotation: { x: 0.01, y: 0.01, z: 0.01 },
    colors: { x: 0.5, y: 0.5, z: 0.8 },
    shininess: 50,
    wireframe: false,
    skin: 'tricolor',
    baseScale: 3.2,
    opacity: 1.0,
    frequency: { x: 1.0, y: 1.0, z: 1.0 },
    amplitude: { x: 0.8, y: 0.8, z: 0.8 },
  }
  
  // Calculate DNA using the utility function
  const { calculateKwamiDNA } = await import('~/utils/calculateKwamiDNA')
  dna.value = calculateKwamiDNA(blobConfig)
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
/* Styles are handled by @nuxt/ui */
</style>

