<template>
  <div class="space-y-4">
    <div ref="canvasContainer" class="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
      <canvas ref="canvas" class="w-full h-full" />
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-900/80">
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
import * as THREE from 'three'
import { captureAndPrepareForUpload } from '~/utils/canvasCapture'

const canvasContainer = ref<HTMLDivElement>()
const canvas = ref<HTMLCanvasElement>()
const loading = ref(true)
const dna = ref<string | null>(null)
const copied = ref(false)

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

// Expose methods for parent component
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

// Expose functions to parent
defineExpose({
  captureImage,
  getConfig,
  getDna,
  blobConfig
})

const initThreeJS = async () => {
  if (!canvas.value) return
  
  loading.value = true
  
  try {
    // Create scene
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)
    
    // Create camera
    const aspect = canvas.value.clientWidth / canvas.value.clientHeight
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000)
    camera.position.z = 5
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas.value,
      antialias: true,
      alpha: true,
    })
    renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    // Create blob geometry
    const geometry = new THREE.SphereGeometry(1, blobConfig.resolution, blobConfig.resolution)
    
    // Create material with tricolor shader-like effect
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(blobConfig.colors.x, blobConfig.colors.y, blobConfig.colors.z),
      shininess: blobConfig.shininess,
      wireframe: blobConfig.wireframe,
      transparent: true,
      opacity: blobConfig.opacity,
    })
    
    // Create mesh
    mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)
    
    const pointLight1 = new THREE.PointLight(0xff00ff, 1, 100)
    pointLight1.position.set(5, 5, 5)
    scene.add(pointLight1)
    
    const pointLight2 = new THREE.PointLight(0x00ffff, 1, 100)
    pointLight2.position.set(-5, -5, 5)
    scene.add(pointLight2)
    
    // Generate initial DNA
    await generateDna()
    
    // Start animation loop
    animate()
    
    loading.value = false
  } catch (error) {
    console.error('Failed to initialize Three.js:', error)
    loading.value = false
  }
}

const animate = () => {
  if (!scene || !camera || !renderer || !mesh) return
  
  // Rotate mesh
  mesh.rotation.x += blobConfig.rotation.x
  mesh.rotation.y += blobConfig.rotation.y
  mesh.rotation.z += blobConfig.rotation.z
  
  // Apply scale animation
  const scale = blobConfig.baseScale + Math.sin(Date.now() * 0.001) * 0.1
  mesh.scale.set(scale, scale, scale)
  
  renderer.render(scene, camera)
  animationId = requestAnimationFrame(animate)
}

const generateDna = async () => {
  // Calculate DNA using the utility function
  const { calculateKwamiDNA } = await import('~/utils/calculateKwamiDNA')
  dna.value = calculateKwamiDNA(blobConfig)
  
  // Update NFT store with current DNA and configuration
  const nftStore = useNFTStore()
  nftStore.currentDna = dna.value
  nftStore.setBlobConfig({ ...blobConfig })
}

const randomize = async () => {
  if (!mesh) return
  
  loading.value = true
  
  // Randomize configuration
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
  
  // Update material
  const material = mesh.material as THREE.MeshPhongMaterial
  material.color.setRGB(blobConfig.colors.x, blobConfig.colors.y, blobConfig.colors.z)
  
  // Regenerate DNA
  await generateDna()
  
  setTimeout(() => {
    loading.value = false
  }, 300)
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

const handleResize = () => {
  if (!camera || !renderer || !canvas.value) return
  
  const width = canvas.value.clientWidth
  const height = canvas.value.clientHeight
  
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  
  renderer.setSize(width, height)
}

onMounted(async () => {
  await nextTick()
  await initThreeJS()
  
  // Handle window resize
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // Cleanup Three.js
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

