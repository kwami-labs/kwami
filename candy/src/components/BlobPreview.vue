<template>
  <div :class="rootClass">
    <div ref="canvasContainer" :class="canvasContainerClass">
      <canvas ref="canvas" class="w-full h-full" />

      <!-- Rolling overlay: keep it subtle so you can still see the blob changing -->
      <div
        v-if="isRolling"
        class="absolute inset-0 flex items-center justify-center bg-white/10 dark:bg-black/20 backdrop-blur-sm"
      >
        <div class="text-center">
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-10 h-10 animate-spin text-primary-500 dark:text-primary-400 mx-auto mb-3"
          />
          <p class="text-gray-700 dark:text-gray-200 font-medium">Rolling candy machine…</p>
        </div>
      </div>

      <!-- Loading overlay: used for init / manual randomize -->
      <div
        v-else-if="loading"
        class="absolute inset-0 flex items-center justify-center bg-gray-50/80 dark:bg-gray-950/70"
      >
        <div class="text-center">
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-12 h-12 animate-spin text-primary-500 dark:text-primary-400 mx-auto mb-4"
          />
          <p class="text-gray-500 dark:text-gray-300">{{ loadingText }}</p>
        </div>
      </div>
    </div>

    <!-- DNA Display -->
    <UCard v-if="props.showDna && dna">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500 dark:text-gray-400">DNA Hash</span>
          <UButton size="xs" color="primary" variant="ghost" @click="copyDna">
            {{ copied ? 'Copied!' : 'Copy' }}
          </UButton>
        </div>
        <p class="font-mono text-xs break-all text-gray-600 dark:text-gray-300">{{ dna }}</p>
      </div>
    </UCard>

    <!-- Controls -->
    <UButton
      v-if="props.showRandomizeButton"
      block
      size="lg"
      color="gray"
      variant="soft"
      :disabled="isRolling"
      :loading="loading || isRolling"
      @click="onClickRandomize"
      icon="i-heroicons-arrow-path"
    >
      Randomize
    </UButton>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { computed, ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { captureAndPrepareForUpload } from '@/utils/canvasCapture'
import { useNFTStore } from '@/stores/nft'

type RollCandyMachineOptions = {
  minSpins?: number
  maxSpins?: number
  minDelayMs?: number
  maxDelayMs?: number
}

type RandomizeOnceOptions = {
  showLoading?: boolean
  loadingText?: string
}

const props = withDefaults(
  defineProps<{
    containerClass?: string
    showDna?: boolean
    showRandomizeButton?: boolean
  }>(),
  {
    showDna: true,
    showRandomizeButton: true,
  }
)

const canvasContainer = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

const loading = ref(true)
const loadingText = ref('Loading preview...')
const isRolling = ref(false)

const dna = ref<string | null>(null)
const copied = ref(false)

const rootClass = computed(() => {
  // If controls are hidden, avoid spacing so the canvas can dominate.
  return props.showDna || props.showRandomizeButton ? 'space-y-4' : ''
})

const canvasContainerClass = computed(() => {
  const base =
    'relative w-full rounded-lg overflow-hidden border border-gray-200/60 dark:border-gray-800/60 bg-white/20 dark:bg-black/20'
  const fallbackSize = 'h-96'
  return [base, props.containerClass ?? fallbackSize].filter(Boolean).join(' ')
})

// Three.js objects
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let mesh: THREE.Mesh | null = null
let animationId: number | null = null

// Current blob configuration
const blobConfig = reactive({
  resolution: 128,
  spikes: { x: 0.3, y: 0.3, z: 0.3 },
  time: { x: 1.0, y: 1.0, z: 1.0 },
  rotation: { x: 0.01, y: 0.01, z: 0.01 },
  colors: { x: 0.8, y: 0.2, z: 0.9 },
  shininess: 50,
  wireframe: false,
  skin: 'tricolor',
  baseScale: 1.5,
  opacity: 1.0,
  frequency: { x: 1.0, y: 1.0, z: 1.0 },
  amplitude: { x: 0.8, y: 0.8, z: 0.8 },
})

const sleep = async (ms: number) => {
  await new Promise<void>((resolve) => window.setTimeout(resolve, ms))
}

const captureImage = async (): Promise<Buffer | null> => {
  if (!canvas.value) {
    console.error('[BlobPreview] Canvas not available for capture')
    return null
  }

  try {
    return await captureAndPrepareForUpload(canvas.value)
  } catch (error) {
    console.error('[BlobPreview] Error capturing canvas:', error)
    return null
  }
}

const getConfig = () => {
  return { ...blobConfig }
}

const getDna = () => {
  return dna.value
}

const generateDna = async () => {
  const { calculateKwamiDNA } = await import('@/utils/calculateKwamiDNA')
  dna.value = calculateKwamiDNA(blobConfig)

  // Update NFT store with current DNA and configuration
  const nftStore = useNFTStore()
  nftStore.currentDna = dna.value
  nftStore.setBlobConfig({ ...blobConfig })
}

const applyRandomConfig = () => {
  blobConfig.colors.x = Math.random()
  blobConfig.colors.y = Math.random()
  blobConfig.colors.z = Math.random()

  blobConfig.spikes.x = Math.random() * 0.8
  blobConfig.spikes.y = Math.random() * 0.8
  blobConfig.spikes.z = Math.random() * 0.8

  blobConfig.rotation.x = Math.random() * 0.02
  blobConfig.rotation.y = Math.random() * 0.02
  blobConfig.rotation.z = Math.random() * 0.02

  blobConfig.baseScale = 1.2 + Math.random() * 0.8
}

const randomizeOnce = async (options: RandomizeOnceOptions = {}) => {
  if (!mesh) return

  const showLoading = options.showLoading ?? false
  if (showLoading) {
    loadingText.value = options.loadingText ?? 'Randomizing...'
    loading.value = true
  }

  applyRandomConfig()

  // Update material color
  const material = mesh.material as THREE.MeshPhongMaterial
  material.color.setRGB(blobConfig.colors.x, blobConfig.colors.y, blobConfig.colors.z)

  await generateDna()

  if (showLoading) {
    // Small delay so the user sees the effect.
    await sleep(220)
    loading.value = false
  }
}

const rollCandyMachine = async (options: RollCandyMachineOptions = {}) => {
  if (!mesh) return
  if (isRolling.value) return

  const minSpins = Math.max(1, options.minSpins ?? 12)
  const maxSpins = Math.max(minSpins, options.maxSpins ?? 24)
  const spins = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins

  const minDelayMs = Math.max(0, options.minDelayMs ?? 60)
  const maxDelayMs = Math.max(minDelayMs, options.maxDelayMs ?? 220)

  isRolling.value = true

  try {
    for (let i = 0; i < spins; i++) {
      await randomizeOnce({ showLoading: false })

      // Ease-out delays for that "slot machine" feel.
      const t = spins <= 1 ? 1 : i / (spins - 1)
      const eased = t * t
      const delay = Math.round(minDelayMs + (maxDelayMs - minDelayMs) * eased)
      await sleep(delay)
    }
  } finally {
    isRolling.value = false
  }
}

const onClickRandomize = async () => {
  if (isRolling.value) return
  await randomizeOnce({ showLoading: true, loadingText: 'Randomizing...' })
}

// Expose functions to parent
defineExpose({
  captureImage,
  getConfig,
  getDna,
  blobConfig,
  randomizeOnce,
  rollCandyMachine,
})

const initThreeJS = async () => {
  if (!canvas.value) return

  loading.value = true
  loadingText.value = 'Loading preview...'

  try {
    scene = new THREE.Scene()

    const aspect = canvas.value.clientWidth / canvas.value.clientHeight
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000)
    camera.position.z = 5

    renderer = new THREE.WebGLRenderer({
      canvas: canvas.value,
      antialias: true,
      alpha: true,
    })

    renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    const geometry = new THREE.SphereGeometry(1, blobConfig.resolution, blobConfig.resolution)

    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(blobConfig.colors.x, blobConfig.colors.y, blobConfig.colors.z),
      shininess: blobConfig.shininess,
      wireframe: blobConfig.wireframe,
      transparent: true,
      opacity: blobConfig.opacity,
    })

    mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0xff00ff, 1, 100)
    pointLight1.position.set(5, 5, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x00ffff, 1, 100)
    pointLight2.position.set(-5, -5, 5)
    scene.add(pointLight2)

    await generateDna()

    animate()

    loading.value = false
  } catch (error) {
    console.error('Failed to initialize Three.js:', error)
    loading.value = false
  }
}

const animate = () => {
  if (!scene || !camera || !renderer || !mesh) return

  mesh.rotation.x += blobConfig.rotation.x
  mesh.rotation.y += blobConfig.rotation.y
  mesh.rotation.z += blobConfig.rotation.z

  const scale = blobConfig.baseScale + Math.sin(Date.now() * 0.001) * 0.1
  mesh.scale.set(scale, scale, scale)

  renderer.render(scene, camera)
  animationId = requestAnimationFrame(animate)
}

const handleResize = () => {
  if (!camera || !renderer || !canvas.value) return

  const width = canvas.value.clientWidth
  const height = canvas.value.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
}

const copyDna = async () => {
  if (!dna.value) return

  try {
    await navigator.clipboard.writeText(dna.value)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

onMounted(async () => {
  await nextTick()
  await initThreeJS()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }

  if (renderer) {
    renderer.dispose()
  }

  if (mesh) {
    mesh.geometry.dispose()
    if (mesh.material instanceof THREE.Material) {
      mesh.material.dispose()
    }
  }

  window.removeEventListener('resize', handleResize)

  scene = null
  camera = null
  renderer = null
  mesh = null
})
</script>

<style scoped>
canvas {
  display: block;
}
</style>