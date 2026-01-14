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
  Color,
  BufferGeometry,
  BufferAttribute,
  Vector3
} from 'three'
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
export async function captureAnimatedGif(
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
 * Snapshot the blob geometry exactly as currently rendered.
 *
 * Important: the Kwami blob animation displaces vertices on the CPU every frame
 * (see `kwami/src/core/body/blob/animation.ts`). So the mesh geometry at capture
 * time already matches what you see in BlobPreview; we should export that snapshot
 * rather than re-simulating noise with guessed parameters.
 */
function snapshotBlobGeometry(blobMesh: Mesh): BufferGeometry {
  const geometry = blobMesh.geometry.clone() as BufferGeometry

  const positions = geometry.getAttribute('position')
  if (!positions) {
    throw new Error('Blob mesh has no position attribute to export')
  }

  // Ensure normals exist and match the displaced vertex positions
  geometry.computeVertexNormals()

  console.log('[Geometry] Snapshotted blob geometry:', positions.count, 'vertices')
  return geometry
}

/**
 * Basic smoothstep implementation (GLSL compatible)
 */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

type TricolorSubtype = 'poles' | 'donut' | 'vintage' | 'unknown'

function detectTricolorSubtype(fragmentShader: string | undefined): TricolorSubtype {
  if (!fragmentShader) return 'unknown'
  if (fragmentShader.includes('vintageStripes')) return 'vintage'
  if (fragmentShader.includes('normalizedY')) return 'donut'
  if (fragmentShader.includes('angle=atan') || fragmentShader.includes('float angle=atan')) return 'poles'
  return 'unknown'
}

function getShaderUniformColor(material: any, uniformName: string, fallback: Color): Color {
  const v = material?.uniforms?.[uniformName]?.value
  if (v && typeof v === 'object' && 'r' in v && 'g' in v && 'b' in v) {
    return v as Color
  }
  return fallback
}

function getShaderUniformNumber(material: any, uniformName: string, fallback: number): number {
  const v = material?.uniforms?.[uniformName]?.value
  return typeof v === 'number' ? v : fallback
}

function bakeTricolorVertexColors(
  geometry: BufferGeometry,
  subtype: TricolorSubtype,
  c1: Color,
  c2: Color,
  c3: Color,
): void {
  const positions = geometry.getAttribute('position')
  if (!positions) throw new Error('Geometry has no positions for vertex color baking')

  const colors = new Float32Array(positions.count * 3)

  const p = new Vector3()
  const twoPi = Math.PI * 2

  const writeColor = (i: number, r: number, g: number, b: number) => {
    const idx = i * 3
    colors[idx + 0] = r
    colors[idx + 1] = g
    colors[idx + 2] = b
  }

  for (let i = 0; i < positions.count; i++) {
    p.fromBufferAttribute(positions as any, i)

    let r = c1.r
    let g = c1.g
    let b = c1.b

    if (subtype === 'donut') {
      // From `kwami/src/core/body/blob/skins/donut/fragment.glsl`
      const normalizedY = (p.y + 1.0) / 2.0
      if (normalizedY > 0.66) {
        const t = (normalizedY - 0.66) / 0.34
        const s = smoothstep(0.0, 1.0, t)
        r = lerp(c2.r, c1.r, s)
        g = lerp(c2.g, c1.g, s)
        b = lerp(c2.b, c1.b, s)
      } else if (normalizedY > 0.33) {
        r = c2.r; g = c2.g; b = c2.b
      } else {
        const t = normalizedY / 0.33
        const s = smoothstep(0.0, 1.0, t)
        r = lerp(c3.r, c2.r, s)
        g = lerp(c3.g, c2.g, s)
        b = lerp(c3.b, c2.b, s)
      }
    } else if (subtype === 'vintage') {
      // From `kwami/src/core/body/blob/skins/vintage/fragment.glsl`
      const vintageStripes = (x: number, frequency: number, width: number) => {
        const m = ((x * frequency + 0.5) % 1 + 1) % 1
        return smoothstep(0.5 - width * 0.5, 0.5 + width * 0.5, m)
      }
      const stripeX = vintageStripes(p.x, 5.0, 0.1)
      const stripeY = vintageStripes(p.y, 5.0, 0.1)
      // stripeZ exists in shader but is not used for mixing there

      // color = mix(c1, c2, stripeX)
      r = lerp(c1.r, c2.r, stripeX)
      g = lerp(c1.g, c2.g, stripeX)
      b = lerp(c1.b, c2.b, stripeX)

      // color = mix(color, c3, stripeY * 0.5)
      const t2 = stripeY * 0.5
      r = lerp(r, c3.r, t2)
      g = lerp(g, c3.g, t2)
      b = lerp(b, c3.b, t2)
    } else {
      // Default to poles (or unknown): `kwami/src/core/body/blob/skins/poles/fragment.glsl`
      const angle = Math.atan2(p.y, p.x)
      const hue = angle / twoPi + 0.5
      if (hue < 1 / 3) {
        const t = 3 * hue
        r = lerp(c1.r, c2.r, t)
        g = lerp(c1.g, c2.g, t)
        b = lerp(c1.b, c2.b, t)
      } else if (hue < 2 / 3) {
        const t = 3 * (hue - 1 / 3)
        r = lerp(c2.r, c3.r, t)
        g = lerp(c2.g, c3.g, t)
        b = lerp(c2.b, c3.b, t)
      } else {
        const t = 3 * (hue - 2 / 3)
        r = lerp(c3.r, c1.r, t)
        g = lerp(c3.g, c1.g, t)
        b = lerp(c3.b, c1.b, t)
      }
    }

    writeColor(i, r, g, b)
  }

  geometry.setAttribute('color', new BufferAttribute(colors, 3))
}

/**
 * Export 3D model as GLB.
 *
 * Notes:
 * - The blob "shape" is CPU-displaced per-frame; we snapshot geometry as-is.
 * - Baking the full screen into a texture will not align with UVs, so we bake
 *   the procedural tricolor shader into vertex colors (UV-free) for a closer match.
 * - If the blob is using a real `backgroundTexture` (UV-based), we reuse that texture.
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
      // Snapshot geometry exactly as currently rendered in BlobPreview
      console.log('[3D Export] Snapshotting blob geometry...')
      const geometry = snapshotBlobGeometry(blobMesh)
      
      console.log('[3D Export] Displaced geometry:', geometry.attributes.position.count, 'vertices')

      const srcMaterial: any = Array.isArray(blobMesh.material) ? blobMesh.material[0] : blobMesh.material
      const subtype = detectTricolorSubtype(srcMaterial?.fragmentShader)

      // If the shader is using a real UV-based background texture, reuse it directly.
      const useBackgroundTexture = Boolean(srcMaterial?.uniforms?.useBackgroundTexture?.value)
      const backgroundTexture = srcMaterial?.uniforms?.backgroundTexture?.value

      const opacity = getShaderUniformNumber(srcMaterial, 'opacity', 1.0)
      const shininess = getShaderUniformNumber(srcMaterial, 'shininess', 50)

      const materialParams: any = {
        side: 2, // DoubleSide
        transparent: opacity < 0.999,
        opacity,
        // Rough conversion: shader shininess (0-200) -> PBR roughness (1-0)
        roughness: Math.max(0.05, Math.min(0.95, 1 - shininess / 200)),
        metalness: 0.05,
      }

      if (useBackgroundTexture && backgroundTexture) {
        // Clone to avoid mutating the live preview texture state.
        const map = backgroundTexture.clone ? backgroundTexture.clone() : backgroundTexture
        if (map) {
          map.flipY = false
          map.needsUpdate = true
          materialParams.map = map
        }
        console.log('[3D Export] Using backgroundTexture map for export')
      } else {
        const c1 = getShaderUniformColor(srcMaterial, '_color1', new Color('#ff0000'))
        const c2 = getShaderUniformColor(srcMaterial, '_color2', new Color('#00ff00'))
        const c3 = getShaderUniformColor(srcMaterial, '_color3', new Color('#0000ff'))

        bakeTricolorVertexColors(geometry, subtype, c1, c2, c3)
        materialParams.vertexColors = true
        console.log('[3D Export] Baked vertex colors for export', { subtype })
      }

      // Clone the mesh with export-friendly PBR material
      const exportMesh = new ThreeMesh(
        geometry,
        new MeshStandardMaterial(materialParams)
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
        // NOTE: This repo currently has multiple `@types/three` copies (root + `candy/`),
        // which makes the GLTFExporter typings incompatible with Mesh from this module.
        // Runtime is fine; cast to avoid the type mismatch.
        exportMesh as any,
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
          // See note above about multiple `@types/three` copies; cast to keep TS happy.
          animations: [clip as any],  // Include rotation animation
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
