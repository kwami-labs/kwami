import { GLTFExporter } from 'three-stdlib'
import {
  AnimationClip,
  BufferAttribute,
  BufferGeometry,
  Color,
  EdgesGeometry,
  InterpolateLinear,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  NumberKeyframeTrack,
  Object3D,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'

type TricolorSubtype = 'poles' | 'donut' | 'vintage' | 'unknown'

export interface ExactBlobReplicaOptions {
  /** How long to sample the live blob animation (milliseconds). */
  durationMs?: number
  /** Frames per second to sample while recording. */
  sampleRate?: number
  /** If true, include nearby PointLights from the live scene in the exported GLB. */
  includeLights?: boolean
  /** If true, compute and bake morph target normals for more accurate shading. */
  bakeNormals?: boolean
  /** Optional mesh name to embed inside the GLB. */
  meshName?: string
}

export interface ExactBlobReplicaResult {
  glb: Buffer
  frameCount: number
  durationMs: number
  sampleRate: number
}

interface SampleFrame {
  timeMs: number
  positions: Float32Array
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
}

function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

function clonePositions(mesh: Mesh): Float32Array {
  const attr = (mesh.geometry as BufferGeometry).getAttribute('position')
  if (!attr) throw new Error('Blob mesh has no position attribute')
  return Float32Array.from(attr.array as ArrayLike<number>)
}

function computeNormalsFromPositions(baseGeometry: BufferGeometry, positions: Float32Array): Float32Array {
  const temp = baseGeometry.clone()
  temp.setAttribute('position', new BufferAttribute(positions, 3))
  temp.computeVertexNormals()
  const normals = temp.getAttribute('normal')
  const result = normals ? Float32Array.from(normals.array as ArrayLike<number>) : new Float32Array(positions.length)
  temp.dispose()
  return result
}

async function sampleAnimationFrames(
  mesh: Mesh,
  durationMs: number,
  sampleRate: number,
): Promise<SampleFrame[]> {
  const frames: SampleFrame[] = []
  const start = performance.now()
  const interval = 1000 / sampleRate
  let nextSampleAt = start

  const captureFrame = (): SampleFrame => ({
    timeMs: performance.now() - start,
    positions: clonePositions(mesh),
    rotation: { x: mesh.rotation.x, y: mesh.rotation.y, z: mesh.rotation.z },
    scale: { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z },
  })

  frames.push(captureFrame())

  while (performance.now() - start < durationMs) {
    await waitForNextFrame()
    const now = performance.now()
    if (now >= nextSampleAt - 1) {
      frames.push(captureFrame())
      nextSampleAt += interval
    }
  }

  // Ensure we end exactly at duration boundary for looping
  const lastTime = frames[frames.length - 1]?.timeMs ?? 0
  if (durationMs - lastTime > interval * 0.25) {
    const finalFrame = captureFrame()
    finalFrame.timeMs = durationMs
    frames.push(finalFrame)
  }

  return frames
}

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

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
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
      const normalizedY = (p.y + 1.0) / 2.0
      if (normalizedY > 0.66) {
        const t = (normalizedY - 0.66) / 0.34
        const s = smoothstep(0.0, 1.0, t)
        r = lerp(c2.r, c1.r, s)
        g = lerp(c2.g, c1.g, s)
        b = lerp(c2.b, c1.b, s)
      } else if (normalizedY > 0.33) {
        r = c2.r
        g = c2.g
        b = c2.b
      } else {
        const t = normalizedY / 0.33
        const s = smoothstep(0.0, 1.0, t)
        r = lerp(c3.r, c2.r, s)
        g = lerp(c3.g, c2.g, s)
        b = lerp(c3.b, c2.b, s)
      }
    } else if (subtype === 'vintage') {
      const vintageStripes = (x: number, frequency: number, width: number) => {
        const m = ((x * frequency + 0.5) % 1 + 1) % 1
        return smoothstep(0.5 - width * 0.5, 0.5 + width * 0.5, m)
      }
      const stripeX = vintageStripes(p.x, 5.0, 0.1)
      const stripeY = vintageStripes(p.y, 5.0, 0.1)

      r = lerp(c1.r, c2.r, stripeX)
      g = lerp(c1.g, c2.g, stripeX)
      b = lerp(c1.b, c2.b, stripeX)

      const t2 = stripeY * 0.5
      r = lerp(r, c3.r, t2)
      g = lerp(g, c3.g, t2)
      b = lerp(b, c3.b, t2)
    } else {
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

function createReplicaMaterial(srcMaterial: any, geometry: BufferGeometry): MeshBasicMaterial {
  const subtype = detectTricolorSubtype(srcMaterial?.fragmentShader)
  const useBackgroundTexture = Boolean(srcMaterial?.uniforms?.useBackgroundTexture?.value)
  const backgroundTexture = srcMaterial?.uniforms?.backgroundTexture?.value

  const opacity = getShaderUniformNumber(srcMaterial, 'opacity', 1.0)
  const shininess = getShaderUniformNumber(srcMaterial, 'shininess', 50)

  const materialParams: any = {
    transparent: opacity < 0.999,
    opacity,
    // NOTE: Don't set wireframe: true on the material itself
    // We'll use EdgesGeometry as a separate overlay instead
    // because GLB doesn't support wireframe flag properly
    wireframe: false,
    side: srcMaterial?.side ?? 2, // Default to DoubleSide for parity with preview
    depthWrite: srcMaterial?.depthWrite ?? opacity >= 0.999,
  }

  if (useBackgroundTexture && backgroundTexture) {
    const map = backgroundTexture.clone ? backgroundTexture.clone() : backgroundTexture
    if (map) {
      map.flipY = false
      map.needsUpdate = true
      materialParams.map = map
    }
  } else {
    const c1 = getShaderUniformColor(srcMaterial, '_color1', new Color('#ff0000'))
    const c2 = getShaderUniformColor(srcMaterial, '_color2', new Color('#00ff00'))
    const c3 = getShaderUniformColor(srcMaterial, '_color3', new Color('#0000ff'))
    bakeTricolorVertexColors(geometry, subtype, c1, c2, c3)
    materialParams.vertexColors = true
  }

  // Use unlit material to avoid bright IBL in viewers and match preview colors
  const material = new MeshBasicMaterial(materialParams)
  ;(material as any).userData = (material as any).userData || {}
  ;(material as any).userData.gltfExtensions = {
    ...(material as any).userData.gltfExtensions,
    KHR_materials_unlit: {},
  }
  return material as any
}

function createWireframeOverlay(geometry: BufferGeometry, baseColor: Color): LineSegments {
  const edges = new EdgesGeometry(geometry, 1)
  const lineMaterial = new LineBasicMaterial({
    color: baseColor,
    transparent: false,
    opacity: 1.0,
    depthTest: true,
    depthWrite: true,
  })
  const lines = new LineSegments(edges, lineMaterial)
  lines.name = 'KWAMI_Blob_Wireframe'
  
  console.log('[GLB Export] Created wireframe with', edges.attributes.position.count / 2, 'lines')
  return lines
}

function buildMorphTargets(
  baseGeometry: BufferGeometry,
  frames: SampleFrame[],
  bakeNormals: boolean,
  maxTargets: number,
): number {
  if (frames.length <= 1) return 0

  // Spread samples evenly to avoid exceeding GPU morph target limits.
  const targetCount = Math.min(maxTargets, frames.length - 1)
  const step = Math.max(1, Math.floor((frames.length - 1) / targetCount))

  const basePositions = frames[0].positions
  const baseNormals = bakeNormals ? computeNormalsFromPositions(baseGeometry, basePositions) : null

  const positionTargets: BufferAttribute[] = []
  const normalTargets: BufferAttribute[] = []

  for (let i = 1; i < frames.length; i += step) {
    const sample = frames[i].positions
    const delta = new Float32Array(sample.length)
    for (let j = 0; j < sample.length; j++) {
      delta[j] = sample[j] - basePositions[j]
    }
    positionTargets.push(new BufferAttribute(delta, 3))

    if (bakeNormals && baseNormals) {
      const normals = computeNormalsFromPositions(baseGeometry, sample)
      const normalDelta = new Float32Array(normals.length)
      for (let j = 0; j < normals.length; j++) {
        normalDelta[j] = normals[j] - baseNormals[j]
      }
      normalTargets.push(new BufferAttribute(normalDelta, 3))
    }
  }

  baseGeometry.morphTargetsRelative = true
  baseGeometry.morphAttributes.position = positionTargets
  if (bakeNormals && normalTargets.length) {
    baseGeometry.morphAttributes.normal = normalTargets
  }

  return positionTargets.length
}

function createAnimationClip(
  meshName: string,
  frames: SampleFrame[],
  durationMs: number,
  morphTargetCount: number,
  morphTargetNames: string[],
): AnimationClip | null {
  if (frames.length === 0) return null

  const times = frames.map((f) => f.timeMs / 1000)
  const tracks: NumberKeyframeTrack[] = []

  // Rotation tracks
  tracks.push(new NumberKeyframeTrack(`${meshName}.rotation[x]`, times, frames.map((f) => f.rotation.x)))
  tracks.push(new NumberKeyframeTrack(`${meshName}.rotation[y]`, times, frames.map((f) => f.rotation.y)))
  tracks.push(new NumberKeyframeTrack(`${meshName}.rotation[z]`, times, frames.map((f) => f.rotation.z)))

  // Scale tracks (captures breathing/audio scale modulation)
  tracks.push(new NumberKeyframeTrack(`${meshName}.scale[x]`, times, frames.map((f) => f.scale.x)))
  tracks.push(new NumberKeyframeTrack(`${meshName}.scale[y]`, times, frames.map((f) => f.scale.y)))
  tracks.push(new NumberKeyframeTrack(`${meshName}.scale[z]`, times, frames.map((f) => f.scale.z)))

  // Morph target tracks - improved to distribute influence evenly across animation
  const morphCount = morphTargetCount
  if (morphCount > 0) {
    const step = (frames.length - 1) / morphCount
    
    for (let i = 0; i < morphCount; i++) {
      const values = frames.map((_, frameIdx) => {
        // Calculate which morph targets should be active for this frame
        const targetFrameIndex = (i + 1) * step
        const distance = Math.abs(frameIdx - targetFrameIndex)
        
        // Use smooth interpolation between adjacent targets
        if (distance <= step) {
          return Math.cos((distance / step) * Math.PI * 0.5) ** 2
        }
        return 0
      })

      // Use morph target name from the dictionary, not index
      const morphName = morphTargetNames[i] || `frame_${i + 1}`
      const track = new NumberKeyframeTrack(`${meshName}.morphTargetInfluences[${morphName}]`, times, values)
      track.setInterpolation(InterpolateLinear)
      tracks.push(track)
    }
  }
  
  const clipDuration = durationMs / 1000
  return new AnimationClip('BlobReplica', clipDuration, tracks)
}

function cloneRelevantLights(scene: Scene, origin: Vector3, maxDistance = 30): Object3D[] {
  const lights: Object3D[] = []
  scene.traverse((obj) => {
    if (obj instanceof PointLight) {
      if (obj.position.distanceTo(origin) <= maxDistance) {
        lights.push(obj.clone())
      }
    }
  })
  return lights
}

/**
 * Export an exact replica of the live BlobPreview as a GLB, including:
 * - Per-frame geometry (baked as morph targets)
 * - Recorded rotation/scale animation
 * - Wireframe flag, opacity, and baked vertex colors or background texture
 * - Nearby point lights from the preview scene (optional)
 */
export async function exportExactBlobReplica(params: {
  canvas: HTMLCanvasElement
  scene: Scene
  blobMesh: Mesh
  renderer?: WebGLRenderer
  options?: ExactBlobReplicaOptions
}): Promise<ExactBlobReplicaResult> {
  const { canvas, scene, blobMesh, options } = params
  if (!canvas) throw new Error('Canvas is required for export (used to sync with the live renderer)')
  if (!blobMesh) throw new Error('Blob mesh is required for export')
  if (!scene) throw new Error('Scene is required for export')

  const durationMs = Math.max(200, options?.durationMs ?? 2000)
  const sampleRate = Math.max(8, options?.sampleRate ?? 30)
  const includeLights = options?.includeLights ?? false
  const bakeNormals = options?.bakeNormals ?? true
  const meshName = options?.meshName ?? 'KWAMI_Blob'

  // Ensure the current frame is rendered before we start sampling
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
  gl?.finish?.()

  const frames = await sampleAnimationFrames(blobMesh, durationMs, sampleRate)
  if (!frames.length) {
    throw new Error('Failed to sample blob animation')
  }

  const exportGeometry = (blobMesh.geometry as BufferGeometry).clone()
  exportGeometry.setAttribute('position', new BufferAttribute(frames[0].positions, 3))
  exportGeometry.computeVertexNormals()

  // Limit morph targets to avoid GPU attribute limits (e.g., 32 is widely supported)
  const morphTargetCount = buildMorphTargets(exportGeometry, frames, bakeNormals, 32)

  const sourceMaterial = Array.isArray(blobMesh.material) ? blobMesh.material[0] : blobMesh.material
  const exportMaterial = createReplicaMaterial(sourceMaterial, exportGeometry)

  const exportMesh = new Mesh(exportGeometry, exportMaterial)
  exportMesh.updateMorphTargets()
  
  // Build morph target dictionary and collect names
  const morphTargetNames: string[] = []
  if (morphTargetCount > 0) {
    exportMesh.morphTargetInfluences = new Array(morphTargetCount).fill(0)
    exportMesh.morphTargetDictionary = {}
    for (let i = 0; i < morphTargetCount; i++) {
      const name = `frame_${i + 1}`
      exportMesh.morphTargetDictionary[name] = i
      morphTargetNames.push(name)
    }
  }
  
  exportMesh.name = meshName
  exportMesh.position.copy(blobMesh.position)
  exportMesh.rotation.set(frames[0].rotation.x, frames[0].rotation.y, frames[0].rotation.z)
  exportMesh.scale.set(frames[0].scale.x, frames[0].scale.y, frames[0].scale.z)

  const exportScene = new Scene()
  exportScene.add(exportMesh)
  
  // Preserve wireframe by adding an explicit edges layer (glTF has no wireframe flag)
  const wantsWireframe = Boolean((sourceMaterial as any)?.wireframe)
  if (wantsWireframe) {
    console.log('[GLB Export] Wireframe detected - creating EdgesGeometry overlay')
    const c1 = getShaderUniformColor(sourceMaterial, '_color1', new Color('#ffffff'))
    const wireframe = createWireframeOverlay(exportGeometry, c1)
    // Attach wireframe to mesh so it inherits animations
    exportMesh.add(wireframe)
    
    // Make base mesh semi-transparent so wireframe stands out
    exportMaterial.transparent = true
    exportMaterial.opacity = 0.15
    exportMaterial.depthWrite = false
    console.log('[GLB Export] Set base mesh opacity to 0.15 for wireframe mode')
  }

  if (includeLights) {
    const lights = cloneRelevantLights(scene, exportMesh.position.clone())
    lights.forEach((light) => exportScene.add(light))
  }
  const clip = createAnimationClip(meshName, frames, durationMs, morphTargetCount, morphTargetNames)
  
  // Add metadata to help viewers understand this is an animated blob
  exportScene.userData = {
    generator: 'Kwami Blob Exporter',
    version: '1.0.0',
    animated: true,
    animationDuration: durationMs / 1000,
    frameCount: frames.length,
    morphTargetCount,
  }

  const gltfExporter = new GLTFExporter()

  const resultBuffer: Buffer = await new Promise((resolve, reject) => {
    gltfExporter.parse(
      exportScene as any,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(Buffer.from(result))
        } else {
          resolve(Buffer.from(JSON.stringify(result)))
        }
      },
      (error) => reject(error),
      {
        binary: true,
        animations: clip ? [clip as any] : [],
        embedImages: true,
        truncateDrawRange: false,
      },
    )
  })

  return {
    glb: resultBuffer,
    frameCount: frames.length,
    durationMs,
    sampleRate,
  }
}
