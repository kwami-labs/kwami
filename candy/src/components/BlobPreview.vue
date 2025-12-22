<template>
  <div :class="rootClass">
    <div
      ref="canvasContainer"
      :class="canvasContainerClass"
      @click="onCanvasClick"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerUp"
    >
      <canvas ref="canvas" class="w-full h-full" />

      <!-- Cursor rotation indicator (appears while rotating, fades out after) -->
      <div class="absolute inset-0 pointer-events-none">
        <div
          v-if="rotationIndicatorVisible"
          class="absolute w-10 h-10 rounded-full border border-white/40 dark:border-white/25 bg-white/5 dark:bg-white/5 backdrop-blur-sm transition-opacity duration-200"
          :class="rotationIndicatorActive ? 'opacity-100' : 'opacity-0'"
          :style="{
            left: rotationIndicatorPos.x + 'px',
            top: rotationIndicatorPos.y + 'px',
            transform: 'translate(-50%, -50%)',
          }"
        >
          <div class="absolute left-1/2 top-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />

          <!-- x/y/z (rotation) readout -->
          <div
            class="absolute -top-2 left-full ml-2 rounded-md border border-white/20 bg-black/40 backdrop-blur-sm px-2 py-1 text-[10px] font-mono text-white/90 whitespace-nowrap"
          >
            x {{ rotationReadout.x.toFixed(1) }}°
            y {{ rotationReadout.y.toFixed(1) }}°
            z {{ rotationReadout.z.toFixed(1) }}°
          </div>
        </div>
      </div>

      <!-- Loading overlay: init vs randomize -->
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
        :class="
          isInitializing
            ? 'bg-gray-50/80 dark:bg-gray-950/70'
            : 'bg-white/10 dark:bg-black/20 backdrop-blur-sm'
        "
      >
        <div class="text-center">
          <div
            class="mx-auto mb-3 rounded-full border-2 border-primary-500/40 border-t-primary-500 animate-spin"
            :class="isInitializing ? 'w-12 h-12' : 'w-10 h-10'"
          />
          <p
            class="font-medium"
            :class="isInitializing ? 'text-gray-500 dark:text-gray-300' : 'text-gray-700 dark:text-gray-200'"
          >
            {{ loadingText }}
          </p>
        </div>
      </div>
    </div>

    <!-- DNA Display -->
    <div
      v-if="props.showDna && dna"
      class="kwami-glass-surface rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-white/20 dark:bg-black/20 p-4"
    >
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500 dark:text-gray-400">DNA Hash</span>
          <KwamiGlassButton
            :label="copied ? 'Copied!' : 'Copy'"
            mode="ghost"
            size="sm"
            @click="copyDna"
          />
        </div>
        <p class="font-mono text-xs break-all text-gray-600 dark:text-gray-300">{{ dna }}</p>
      </div>
    </div>

    <!-- Controls -->
    <KwamiGlassButton
      v-if="props.showRandomizeButton"
      label="Randomize"
      mode="outline"
      size="lg"
      :disabled="isRolling || loading"
      :block="true"
      @click="onClickRandomize"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import type { SphereGeometry } from 'three'
import { Kwami } from 'kwami'
import { captureAndPrepareForUpload } from '@/utils/canvasCapture'
import { useNFTStore } from '@/stores/nft'
import KwamiGlassButton from '@/components/KwamiGlassButton.vue'

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
const isInitializing = ref(true)
const isRolling = ref(false)

const dna = ref<string | null>(null)
const copied = ref(false)

const rootClass = computed(() => {
  // If controls are hidden, avoid spacing so the canvas can dominate.
  return props.showDna || props.showRandomizeButton ? 'space-y-4' : ''
})

const canvasContainerClass = computed(() => {
  const base =
    'relative w-full rounded-lg overflow-hidden border border-gray-200/60 dark:border-gray-800/60 bg-white/20 dark:bg-black/20 select-none cursor-grab active:cursor-grabbing'
  const fallbackSize = 'h-96'
  return [base, props.containerClass ?? fallbackSize].filter(Boolean).join(' ')
})

let kwami: Kwami | null = null

let clickTimeout: number | null = null
let preventContextMenuHandler: ((event: Event) => void) | null = null

let pointerDown = false
let pointerDragging = false
let justDragged = false

let lastPointer = { x: 0, y: 0 }
let startPointer = { x: 0, y: 0 }

let hideRotationIndicatorTimeout: number | null = null

const rotationIndicatorVisible = ref(false)
const rotationIndicatorActive = ref(false)
const rotationIndicatorPos = reactive({ x: 0, y: 0 })

const rotationReadout = reactive({ x: 0, y: 0, z: 0 })

// Current blob configuration
// Note: colors are hex strings (matches kwami core blob), and we keep this loosely typed
// because it is synced from the kwami renderer.
const blobConfig = reactive<any>({
  resolution: 180,
  spikes: { x: 0.3, y: 0.3, z: 0.3 },
  time: { x: 1.0, y: 1.0, z: 1.0 },
  rotation: { x: 0.01, y: 0.01, z: 0.01 },
  colors: { x: '#ff0066', y: '#00ff66', z: '#6600ff' },
  shininess: 50,
  lightIntensity: 1.0,
  wireframe: false,
  skin: { skin: 'tricolor', subtype: 'poles' },
  baseScale: 4.0,
  opacity: 1.0,
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
    // Wait for any pending renders to complete (2 frames to be safe)
    await new Promise(resolve => requestAnimationFrame(resolve))
    await new Promise(resolve => requestAnimationFrame(resolve))
    
    console.log('[BlobPreview] Capturing canvas after render frames')
    return await captureAndPrepareForUpload(canvas.value)
  } catch (error) {
    console.error('[BlobPreview] Error capturing canvas:', error)
    return null
  }
}

const captureAllFormats = async () => {
  if (!canvas.value || !kwami?.body) {
    console.error('[BlobPreview] Canvas or kwami not available')
    return null
  }

  try {
    const { captureAllFormats } = await import('@/utils/advancedCanvasCapture')
    const scene = kwami.body.scene.scene
    const blobMesh = kwami.body.blob.getMesh()
    const renderer = kwami.body.scene.renderer
    
    return await captureAllFormats(canvas.value, scene, blobMesh, renderer, {
      gifDuration: 3000,
      gifFps: 20
    })
  } catch (error) {
    console.error('[BlobPreview] Error capturing all formats:', error)
    return null
  }
}

const getSceneAndMesh = () => {
  if (!kwami?.body) return null
  return {
    scene: kwami.body.scene.scene,
    mesh: kwami.body.blob.getMesh(),
    canvas: canvas.value
  }
}

const getConfig = () => {
  // Return a snapshot (deep-ish) of the current config for minting/metadata
  return JSON.parse(JSON.stringify(blobConfig))
}

const getDna = () => {
  return dna.value
}

const syncConfigFromKwami = () => {
  const blob = kwami?.body?.blob
  if (!blob) return

  const mesh = blob.getMesh()
  const geom = mesh.geometry as unknown as SphereGeometry

  const spikes = blob.getSpikes()
  const time = blob.getTime()
  const rotation = blob.getRotation()
  const amplitude = blob.getAmplitude()
  const colors = blob.getColors()

  blobConfig.resolution = geom.parameters.widthSegments
  blobConfig.spikes = { ...spikes }
  blobConfig.time = { ...time }
  blobConfig.rotation = { ...rotation }
  blobConfig.amplitude = { ...amplitude }
  blobConfig.colors = { ...colors }
  blobConfig.baseScale = blob.getScale()
  blobConfig.shininess = blob.getShininess()
  blobConfig.lightIntensity = blob.lightIntensity || 1.0
  blobConfig.wireframe = blob.getWireframe()
  blobConfig.opacity = blob.getOpacity()
  blobConfig.skin = blob.getCurrentSkin()
}

const generateDna = async () => {
  const { calculateKwamiDNA } = await import('@/utils/calculateKwamiDNA')
  dna.value = calculateKwamiDNA(blobConfig)

  const nftStore = useNFTStore()
  nftStore.currentDna = dna.value
  nftStore.setBlobConfig(getConfig())
}

const applyRandomConfig = () => {
  const blob = kwami?.body?.blob
  if (!blob) return

  // Use the same randomizer the main kwami blob uses (pg double-click/randomize vibe)
  blob.setRandomBlob()

  // Keep it centered in the square
  blob.position.reset()

  // Keep scale consistent so the preview stays framed
  blob.setScale(4.0)

  syncConfigFromKwami()
}

const randomizeOnce = async (options: RandomizeOnceOptions = {}) => {
  if (!kwami?.body?.blob) return

  const showLoading = options.showLoading ?? false
  if (showLoading) {
    isInitializing.value = false
    loadingText.value = options.loadingText ?? 'Randomizing...'
    loading.value = true
  }

  applyRandomConfig()
  await generateDna()

  if (showLoading) {
    // Small delay so the user sees the effect.
    await sleep(220)
    loading.value = false
  }
}

const rollCandyMachine = async (options: RollCandyMachineOptions = {}) => {
  if (!kwami?.body?.blob) return
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
  captureAllFormats,
  getSceneAndMesh,
  getConfig,
  getDna,
  blobConfig,
  randomizeOnce,
  rollCandyMachine,
})

const initKwami = async () => {
  if (!canvas.value) return

  isInitializing.value = true
  loading.value = true
  loadingText.value = 'Loading preview...'

  try {
    kwami = new Kwami(canvas.value, {
      body: {
        // Keep it lightweight and transparent for candy UI
        initialSkin: { skin: 'tricolor', subtype: 'poles' },
        blob: {
          resolution: blobConfig.resolution,
        },
        scene: {
          background: { type: 'transparent', opacity: 1 },
          preserveDrawingBuffer: true, // Required for canvas.toBlob() capture
        },
      },
    })

    // Candy: keep the blob perfectly centered in a square preview.
    // The core Scene defaults can leave the camera not looking at origin.
    kwami.body.setCameraPosition(0, 0, 6)
    kwami.body.setBackgroundTransparent()

    // Disable core right-click overlays/popovers for candy
    preventContextMenuHandler = (event: Event) => {
      event.preventDefault()
      event.stopPropagation()
    }
    canvas.value.addEventListener('contextmenu', preventContextMenuHandler, { capture: true })

    // Start with a non-boring blob, like the main app randomize
    kwami.body.blob.setRandomBlob()
    kwami.body.blob.position.reset()
    kwami.body.blob.setScale(4.0)

    syncConfigFromKwami()
    await generateDna()

    loading.value = false
    isInitializing.value = false
  } catch (error) {
    console.error('Failed to initialize Kwami preview:', error)
    loading.value = false
    isInitializing.value = false
  }
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

const setRotationIndicatorPositionFromEvent = (event: PointerEvent) => {
  const rect = canvasContainer.value?.getBoundingClientRect()
  if (!rect) return

  rotationIndicatorPos.x = Math.max(0, Math.min(rect.width, event.clientX - rect.left))
  rotationIndicatorPos.y = Math.max(0, Math.min(rect.height, event.clientY - rect.top))
}

const showRotationIndicator = (event: PointerEvent) => {
  if (hideRotationIndicatorTimeout !== null) {
    window.clearTimeout(hideRotationIndicatorTimeout)
    hideRotationIndicatorTimeout = null
  }

  rotationIndicatorVisible.value = true
  // next frame -> fade in
  rotationIndicatorActive.value = false
  setRotationIndicatorPositionFromEvent(event)
  window.requestAnimationFrame(() => {
    rotationIndicatorActive.value = true
  })
}

const hideRotationIndicator = () => {
  rotationIndicatorActive.value = false
  if (hideRotationIndicatorTimeout !== null) {
    window.clearTimeout(hideRotationIndicatorTimeout)
  }
  hideRotationIndicatorTimeout = window.setTimeout(() => {
    rotationIndicatorVisible.value = false
    hideRotationIndicatorTimeout = null
  }, 220)
}

const onPointerDown = (event: PointerEvent) => {
  if (isRolling.value || loading.value) return
  if (event.button === 2) return // right click

  // Prevent text selection / drag image
  event.preventDefault()

  pointerDown = true
  pointerDragging = false

  startPointer = { x: event.clientX, y: event.clientY }
  lastPointer = { x: event.clientX, y: event.clientY }

  // Snapshot current rotation for the readout (degrees)
  if (kwami?.body?.blob) {
    const mesh = kwami.body.blob.getMesh()
    rotationReadout.x = (mesh.rotation.x * 180) / Math.PI
    rotationReadout.y = (mesh.rotation.y * 180) / Math.PI
    rotationReadout.z = (mesh.rotation.z * 180) / Math.PI
  }

  // If we're starting a drag, cancel the click-to-randomize timeout
  if (clickTimeout !== null) {
    window.clearTimeout(clickTimeout)
    clickTimeout = null
  }

  showRotationIndicator(event)
}

const onPointerMove = (event: PointerEvent) => {
  if (!pointerDown) return
  if (!kwami?.body?.blob) return

  event.preventDefault()

  const dx = event.clientX - lastPointer.x
  const dy = event.clientY - lastPointer.y

  lastPointer = { x: event.clientX, y: event.clientY }

  const totalDx = event.clientX - startPointer.x
  const totalDy = event.clientY - startPointer.y
  const movedEnough = Math.abs(totalDx) + Math.abs(totalDy) > 6

  if (movedEnough) {
    pointerDragging = true
    justDragged = true
  }

  if (!pointerDragging) {
    setRotationIndicatorPositionFromEvent(event)
    return
  }

  // Keep indicator under cursor while dragging
  setRotationIndicatorPositionFromEvent(event)

  // Apply rotation deltas (tuned for a smooth feel)
  const mesh = kwami.body.blob.getMesh()
  mesh.rotation.y += dx * 0.01
  mesh.rotation.x += dy * 0.008

  // Update readout (degrees)
  rotationReadout.x = (mesh.rotation.x * 180) / Math.PI
  rotationReadout.y = (mesh.rotation.y * 180) / Math.PI
  rotationReadout.z = (mesh.rotation.z * 180) / Math.PI
}

const onPointerUp = () => {
  if (!pointerDown) return

  pointerDown = false
  pointerDragging = false

  hideRotationIndicator()

  if (justDragged) {
    // Prevent the subsequent click handler from randomizing
    window.setTimeout(() => {
      justDragged = false
    }, 200)
  }
}

const onCanvasClick = () => {
  if (isRolling.value || loading.value) return
  if (justDragged) return

  // Avoid double-trigger on double click
  if (clickTimeout !== null) {
    window.clearTimeout(clickTimeout)
    clickTimeout = null
  }

  clickTimeout = window.setTimeout(async () => {
    clickTimeout = null
    await randomizeOnce({ showLoading: false })
  }, 220)
}

onMounted(async () => {
  await nextTick()
  await initKwami()
})

onUnmounted(() => {
  if (clickTimeout !== null) {
    window.clearTimeout(clickTimeout)
    clickTimeout = null
  }

  if (hideRotationIndicatorTimeout !== null) {
    window.clearTimeout(hideRotationIndicatorTimeout)
    hideRotationIndicatorTimeout = null
  }

  if (preventContextMenuHandler && canvas.value) {
    canvas.value.removeEventListener('contextmenu', preventContextMenuHandler, { capture: true } as any)
    preventContextMenuHandler = null
  }

  if (kwami) {
    kwami.dispose()
    kwami = null
  }
})
</script>

<style scoped>
canvas {
  display: block;
}
</style>