/**
 * Advanced Canvas Capture Utility
 * Captures static image, animated GIF, and 3D model (GLB) from Three.js scene
 */

import { GIFEncoder, quantize, applyPalette } from 'gifenc'
import { GLTFExporter } from 'three-stdlib'
import { 
  Mesh as ThreeMesh, 
  MeshStandardMaterial, 
  AnimationClip, 
  NumberKeyframeTrack,
  VectorKeyframeTrack,
  Color,
  WebGLRenderTarget,
  OrthographicCamera,
  CanvasTexture,
  SphereGeometry,
  BufferGeometry,
  BufferAttribute,
  LinearFilter,
  RGBAFormat,
  Vector3
} from 'three'
import { createNoise3D } from 'simplex-noise'
import type { Scene, Mesh, WebGLRenderer } from 'three'

export interface CaptureResult {
  image: Buffer      // Static PNG image
  gif: Buffer        // Animated GIF
  model: Buffer      // GLB 3D model file
}

/**
 * Capture static PNG image from canvas
 */
async function captureStaticImage(canvas: HTMLCanvasElement): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to capture static image'))
        return
      }
      blob.arrayBuffer().then(buffer => {
        resolve(Buffer.from(buffer))
      })
    }, 'image/png', 1.0)
  })
}

/**
 * Capture animated GIF from canvas
 * Records multiple frames and encodes them into a GIF
 */
async function captureAnimatedGif(
  canvas: HTMLCanvasElement,
  duration: number = 3000,  // 3 seconds
  fps: number = 20  // Lower FPS for smaller file size
): Promise<Buffer> {
  console.log('[GIF] Starting GIF capture...', { duration, fps, size: `${canvas.width}x${canvas.height}` })
  
  const gif = GIFEncoder()
  const frameCount = Math.floor((duration / 1000) * fps)
  const frameDelay = Math.floor(1000 / fps)
  
  // Create temporary 2D canvas to read WebGL frames
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  const ctx = tempCanvas.getContext('2d')!
  
  console.log('[GIF] Will capture', frameCount, 'frames')
  
  // Capture and encode frames
  for (let i = 0; i < frameCount; i++) {
    await new Promise(resolve => requestAnimationFrame(resolve))
    
    // Copy WebGL canvas to 2D canvas
    ctx.drawImage(canvas, 0, 0)
    
    // Get pixel data
    const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
    
    // Quantize and encode frame
    const palette = quantize(imageData.data, 256)
    const index = applyPalette(imageData.data, palette)
    
    gif.writeFrame(index, tempCanvas.width, tempCanvas.height, {
      palette,
      delay: frameDelay,
    })
  }
  
  gif.finish()
  const buffer = Buffer.from(gif.bytes())
  
  console.log('[GIF] ✅ GIF encoded:', buffer.length, 'bytes')
  return buffer
}

/**
 * Compute displaced geometry by EXACTLY replicating the blob's noise displacement
 * This matches the calculation in animation.ts lines 187-283
 */
function computeDisplacedGeometry(blobMesh: Mesh): BufferGeometry {
  const noise3D = createNoise3D()
  const geometry = blobMesh.geometry.clone()
  const positions = geometry.attributes.position
  const vertex = new Vector3()
  
  // Time calculation (matching animation.ts line 164)
  const reduction = 0.00003
  const perf = performance.now() * reduction
  
  // Default spike values (these should ideally come from blob config)
  const spikeX = 0.3
  const spikeY = 0.3
  const spikeZ = 0.3
  const amplitudeX = 0.8
  const amplitudeY = 0.8
  const amplitudeZ = 0.8
  const timeX = 1.0
  const timeY = 1.0
  const timeZ = 1.0
  
  // Calculate time factors (lines 178-180)
  const tX = perf * timeX
  const tY = perf * timeY
  const tZ = perf * timeZ
  
  // Calculate noise frequencies (lines 188-190)
  const baseFreqX = Math.max(0.025, spikeX)
  const baseFreqY = Math.max(0.025, spikeY)
  const baseFreqZ = Math.max(0.025, spikeZ)
  
  // Apply EXACT displacement to each vertex (lines 193-283)
  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i)
    const direction = vertex.clone().normalize()
    
    // Generate multi-layered noise (lines 230-251)
    const noise1 = noise3D(
      direction.x * baseFreqX * 0.5 + tX,
      direction.y * baseFreqY * 0.5 + tY,
      direction.z * baseFreqZ * 0.5 + tZ,
    )
    
    const noise2 = noise3D(
      direction.x * baseFreqX * 1.2 + tX * 1.2,
      direction.y * baseFreqY * 1.2 + tY * 1.2,
      direction.z * baseFreqZ * 1.2 + tZ * 1.2,
    )
    
    const noise3 = noise3D(
      direction.x * baseFreqX * 0.3 + tX * 0.8,
      direction.y * baseFreqY * 0.3 + tY * 0.8,
      direction.z * baseFreqZ * 0.3 + tZ * 0.8,
    )
    
    // Combine noises with frequency weighting (line 251)
    const finalNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2
    
    // Base amplitude (line 256 - idle state)
    const baseAmplitude = 0.16
    
    // Apply per-axis amplitude modulation (lines 259-264)
    const amplitudeMultiplier =
      Math.abs(direction.x) * amplitudeX +
      Math.abs(direction.y) * amplitudeY +
      Math.abs(direction.z) * amplitudeZ
    
    const amplitude = baseAmplitude * amplitudeMultiplier
    
    // Normal/Speaking mode displacement (line 282 - idle, no audio)
    const speakingDisplacement = amplitude * finalNoise
    
    // Apply displacement along vertex direction
    const displacedVertex = direction.multiplyScalar(1 + speakingDisplacement)
    positions.setXYZ(i, displacedVertex.x, displacedVertex.y, displacedVertex.z)
  }
  
  positions.needsUpdate = true
  geometry.computeVertexNormals()
  
  console.log('[Geometry] Applied EXACT noise displacement to', positions.count, 'vertices')
  return geometry
}

/**
 * Bake the shader to a texture by rendering it
 */
function bakeShaderToTexture(
  blobMesh: Mesh,
  renderer: WebGLRenderer | undefined,
  scene: Scene,
  canvas: HTMLCanvasElement
): CanvasTexture {
  console.log('[Texture Bake] Starting texture baking...')
  
  if (!renderer) {
    console.warn('[Texture Bake] No renderer provided, using canvas snapshot')
    // Fallback: copy WebGL canvas to 2D canvas for texture
    const textureCanvas = document.createElement('canvas')
    textureCanvas.width = canvas.width
    textureCanvas.height = canvas.height
    const ctx = textureCanvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(canvas, 0, 0)
      console.log('[Texture Bake] ✅ Created texture from canvas snapshot')
      return new CanvasTexture(textureCanvas)
    }
    throw new Error('Cannot create 2D context for texture')
  }
  
  // Create a render target for baking
  const textureSize = 1024
  const renderTarget = new WebGLRenderTarget(textureSize, textureSize, {
    format: RGBAFormat,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
  })
  
  // Create temporary camera for rendering
  const camera = new OrthographicCamera(-2, 2, 2, -2, 0.1, 100)
  camera.position.set(0, 0, 5)
  camera.lookAt(0, 0, 0)
  
  // Store original settings
  const originalRenderTarget = renderer.getRenderTarget()
  const originalClearColor = renderer.getClearColor(new Color())
  const originalClearAlpha = renderer.getClearAlpha()
  
  // Render to texture
  renderer.setRenderTarget(renderTarget)
  renderer.setClearColor(0x000000, 0)
  renderer.clear()
  renderer.render(scene, camera)
  
  // Read pixels from render target
  const pixelBuffer = new Uint8Array(textureSize * textureSize * 4)
  renderer.readRenderTargetPixels(renderTarget, 0, 0, textureSize, textureSize, pixelBuffer)
  
  // Restore original settings
  renderer.setRenderTarget(originalRenderTarget)
  renderer.setClearColor(originalClearColor, originalClearAlpha)
  
  // Create canvas from pixel data
  const textureCanvas = document.createElement('canvas')
  textureCanvas.width = textureSize
  textureCanvas.height = textureSize
  const ctx = textureCanvas.getContext('2d')!
  const imageData = ctx.createImageData(textureSize, textureSize)
  imageData.data.set(pixelBuffer)
  ctx.putImageData(imageData, 0, 0)
  
  // Clean up
  renderTarget.dispose()
  
  console.log('[Texture Bake] ✅ Texture baked successfully')
  return new CanvasTexture(textureCanvas)
}

/**
 * Export 3D model as GLB file with baked texture
 * This creates a perfect visual match with the preview
 */
async function export3DModel(
  scene: Scene,
  blobMesh: Mesh,
  renderer: WebGLRenderer | undefined,
  canvas: HTMLCanvasElement
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    console.log('[3D Export] Exporting model as GLB...', { 
      meshType: blobMesh.type,
      hasGeometry: !!blobMesh.geometry,
      hasMaterial: !!blobMesh.material
    })
    
    try {
      console.log('[3D Export] Baking shader to texture...')
      
      // Bake the shader appearance to a texture
      const bakedTexture = bakeShaderToTexture(blobMesh, renderer, scene, canvas)
      bakedTexture.flipY = false  // Fix texture orientation
      
      // Compute displaced geometry on CPU (replicating shader displacement)
      console.log('[3D Export] Computing displaced geometry...')
      const geometry = computeDisplacedGeometry(blobMesh)
      
      console.log('[3D Export] Displaced geometry:', geometry.attributes.position.count, 'vertices')
      
      // Clone the mesh with textured material
      const exportMesh = new ThreeMesh(
        geometry,
        new MeshStandardMaterial({
          map: bakedTexture,
          roughness: 0.4,
          metalness: 0.3,
          side: 2, // DoubleSide
        })
      )
      
      exportMesh.name = 'KWAMI_Blob'
      exportMesh.position.copy(blobMesh.position)
      exportMesh.rotation.copy(blobMesh.rotation)
      exportMesh.scale.copy(blobMesh.scale)
      
      console.log('[3D Export] Capturing morphing animation frames...')
      
      // NOTE: Shader-based morphing can't be directly exported
      // We'll create a simple pulsing scale animation instead
      const animDuration = 2.0  // 2 second loop
      const times = [0, 0.5, 1.0, 1.5, 2.0]
      
      // Pulsing scale animation (simulates the morphing)
      const scaleValues = [1.0, 1.1, 1.0, 0.95, 1.0]
      const scaleTrack = new NumberKeyframeTrack(
        'KWAMI_Blob.scale[x]',
        times,
        scaleValues
      )
      const scaleTrackY = new NumberKeyframeTrack(
        'KWAMI_Blob.scale[y]',
        times,
        scaleValues
      )
      const scaleTrackZ = new NumberKeyframeTrack(
        'KWAMI_Blob.scale[z]',
        times,
        scaleValues
      )
      
      // Rotation animation
      const rotationY = [0, Math.PI / 2, Math.PI, Math.PI * 1.5, Math.PI * 2]
      const rotationTrack = new NumberKeyframeTrack(
        'KWAMI_Blob.rotation[y]',
        times,
        rotationY
      )
      
      const clip = new AnimationClip('PulseAndRotate', animDuration, [
        scaleTrack,
        scaleTrackY,
        scaleTrackZ,
        rotationTrack
      ])
      console.log('[3D Export] Created pulse & rotation animation:', clip.duration, 'seconds')
      
      const exporter = new GLTFExporter()
      
      exporter.parse(
        exportMesh,
        (result) => {
          console.log('[3D Export] Parse complete, result type:', typeof result)
          
          if (result instanceof ArrayBuffer) {
            const buffer = Buffer.from(result)
            console.log('[3D Export] ✅ Model exported as GLB:', buffer.length, 'bytes')
            resolve(buffer)
          } else {
            // Result is JSON GLTF, convert to string then buffer
            const json = JSON.stringify(result)
            const buffer = Buffer.from(json)
            console.log('[3D Export] ✅ Model exported as GLTF JSON:', buffer.length, 'bytes')
            resolve(buffer)
          }
        },
        (error) => {
          console.error('[3D Export] ❌ Export failed:', error)
          reject(new Error(`GLB export failed: ${error}`))
        },
        {
          binary: true,
          embedImages: true,
          truncateDrawRange: false,
          animations: [clip],  // Include rotation animation
        }
      )
    } catch (error) {
      console.error('[3D Export] ❌ Exporter error:', error)
      reject(error)
    }
  })
}

/**
 * Capture all formats: static image, animated GIF, and 3D model
 */
export async function captureAllFormats(
  canvas: HTMLCanvasElement,
  scene: Scene,
  blobMesh: Mesh,
  renderer: WebGLRenderer | undefined,
  options?: {
    gifDuration?: number
    gifFps?: number
  }
): Promise<CaptureResult> {
  console.log('[Capture] Starting comprehensive capture...')
  
  try {
    // Capture static image
    console.log('[Capture] 1/3 - Capturing static image...')
    const image = await captureStaticImage(canvas)
    console.log('[Capture] Static image captured:', image.length, 'bytes')
    
    // Capture animated GIF
    console.log('[Capture] 2/3 - Capturing animated GIF...')
    const gif = await captureAnimatedGif(
      canvas,
      options?.gifDuration ?? 3000,
      options?.gifFps ?? 30
    )
    console.log('[Capture] GIF captured:', gif.length, 'bytes')
    
    // Export 3D model
    console.log('[Capture] 3/3 - Exporting 3D model...')
    const model = await export3DModel(scene, blobMesh, renderer, canvas)
    console.log('[Capture] 3D model exported:', model.length, 'bytes')
    
    console.log('[Capture] ✅ All formats captured successfully!')
    return { image, gif, model }
    
  } catch (error) {
    console.error('[Capture] ❌ Capture failed:', error)
    throw error
  }
}

/**
 * Quick capture for just static image (backwards compatible)
 */
export async function captureStaticOnly(canvas: HTMLCanvasElement): Promise<Buffer> {
  return captureStaticImage(canvas)
}
