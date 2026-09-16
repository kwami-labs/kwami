import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene as ThreeScene,
  DirectionalLight,
  AmbientLight,
  PCFSoftShadowMap,
  Color,
  CanvasTexture,
  Texture,
} from 'three'
import type { Material, Mesh, Object3D } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { SceneConfig } from '../../types/index.js'
import { logger } from '../../utils/logger.js'
import { StarField, type StarFieldConfig } from './StarField.js'

/**
 * Scene - Manages the THREE.js scene configuration for Kwami
 */
export class Scene {
  public renderer: WebGLRenderer
  public camera: PerspectiveCamera
  public scene: ThreeScene
  public lights: ReturnType<typeof createLights>
  public controls: OrbitControls | null
  public starField: StarField

  private readonly canvas: HTMLCanvasElement
  private contextLost = false
  private onContextLostCb: (() => void) | null = null
  private onContextRestoredCb: (() => void) | null = null
  private readonly handleContextLost = (event: Event): void => {
    // Without preventDefault the browser will not fire `webglcontextrestored` at all, and the
    // avatar is dead until the page reloads.
    event.preventDefault()
    this.contextLost = true
    logger.warn('WebGL context lost')
    this.onContextLostCb?.()
  }
  private readonly handleContextRestored = (): void => {
    this.contextLost = false
    logger.info('WebGL context restored')
    this.onContextRestoredCb?.()
  }

  constructor(canvas: HTMLCanvasElement, config?: SceneConfig) {
    this.canvas = canvas
    this.renderer = createRenderer(canvas, config)
    this.camera = createCamera(canvas, config)
    this.scene = new ThreeScene()
    this.lights = createLights(config)

    applySceneBackground(this.scene, config)
    this.scene.add(this.lights.top)
    this.scene.add(this.lights.bottom)
    this.scene.add(this.lights.ambient)

    this.controls = config?.enableControls === true
      ? createControls(this.camera, this.renderer)
      : null

    // Initialize star field (disabled by default)
    this.starField = new StarField(this.scene, this.renderer, config?.starField)

    this.canvas.addEventListener('webglcontextlost', this.handleContextLost)
    this.canvas.addEventListener('webglcontextrestored', this.handleContextRestored)
  }

  /**
   * Whether the GPU has taken the context away.
   *
   * A backgrounded mobile tab, a driver reset or another page exhausting the browser's WebGL
   * context budget all cause this. Drawing into a lost context is a no-op, so render loops
   * should stop until it comes back.
   */
  isContextLost(): boolean {
    return this.contextLost
  }

  /** Register handlers for GPU context loss and recovery. */
  onContextChange(handlers: { onLost?: () => void; onRestored?: () => void }): void {
    this.onContextLostCb = handlers.onLost ?? null
    this.onContextRestoredCb = handlers.onRestored ?? null
  }

  /**
   * Update renderer and camera on resize
   */
  resize(width: number, height: number): void {
    const safeWidth = Math.max(1, width)
    const safeHeight = Math.max(1, height)
    this.renderer.setSize(safeWidth, safeHeight)
    this.camera.aspect = safeWidth / safeHeight
    this.camera.updateProjectionMatrix()
    this.starField.onResize()
  }

  /**
   * Update the scene background dynamically
   */
  setBackground(config: SceneConfig['background']): void {
    applySceneBackground(this.scene, { background: config })
  }

  /**
   * Enable/disable the star field effect
   */
  setStarFieldEnabled(enabled: boolean): void {
    if (enabled) {
      this.starField.enable()
    } else {
      this.starField.disable()
    }
  }

  /**
   * Configure the star field
   */
  setStarFieldConfig(config: Partial<StarFieldConfig>): void {
    if (config.count !== undefined) this.starField.setCount(config.count)
    if (config.fieldRadius !== undefined) this.starField.setFieldRadius(config.fieldRadius)
    if (config.twinkleSpeed !== undefined) this.starField.setTwinkleSpeed(config.twinkleSpeed)
    if (config.rotationSpeed !== undefined) this.starField.setRotationSpeed(config.rotationSpeed)
    if (config.minSize !== undefined) this.starField.setMinSize(config.minSize)
    if (config.maxSize !== undefined) this.starField.setMaxSize(config.maxSize)
  }

  /**
   * Advance the scene's own per-frame work: the star field's time uniform and rotation, and
   * the OrbitControls damping integrator.
   *
   * Driven by `Avatar`'s ticker. Nothing called this before, with two visible consequences:
   * a star field enabled through `setStarFieldEnabled(true)` rendered but never twinkled or
   * rotated, and `enableDamping` did nothing — dragging tracked the pointer only because
   * OrbitControls calls `update()` from its own pointer handlers, so rotation stopped dead on
   * pointer-up instead of easing out.
   */
  update(deltaTime?: number): void {
    this.starField.update(deltaTime)
    this.controls?.update()
  }

  /**
   * Dispose of all resources.
   *
   * `renderer.dispose()` alone releases the renderer's own caches but nothing in the scene
   * graph: every geometry, material and texture still held a GPU allocation. The traversal
   * below releases them, and `forceContextLoss()` tells the driver the context is finished
   * rather than waiting for the canvas to be garbage collected — browsers cap the number of
   * live WebGL contexts per page, so an app that mounts and unmounts avatars would eventually
   * fail to get one at all.
   */
  dispose(): void {
    this.canvas.removeEventListener('webglcontextlost', this.handleContextLost)
    this.canvas.removeEventListener('webglcontextrestored', this.handleContextRestored)
    this.onContextLostCb = null
    this.onContextRestoredCb = null

    this.starField.dispose()
    this.controls?.dispose()
    this.controls = null

    disposeSceneGraph(this.scene)
    this.scene.clear()

    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }
}

/** Release every GPU resource reachable from `root`. */
function disposeSceneGraph(root: Object3D): void {
  root.traverse((object) => {
    const mesh = object as Partial<Mesh>
    mesh.geometry?.dispose()

    const material = mesh.material
    if (!material) return
    for (const entry of Array.isArray(material) ? material : [material]) {
      disposeMaterial(entry)
    }
  })
}

/** Materials own textures, and three.js does not release them for you. */
function disposeMaterial(material: Material): void {
  for (const value of Object.values(material as unknown as Record<string, unknown>)) {
    if (value instanceof Texture) value.dispose()
  }
  material.dispose()
}

/**
 * Canvas dimensions that cannot produce a NaN or Infinite aspect ratio.
 *
 * A canvas inside a `display: none` container — a collapsed tab, an accordion, a modal that
 * has not opened yet — reports 0x0, and `0 / 0` is NaN. That NaN reaches the projection matrix
 * and the avatar never draws again, even after the container becomes visible. The
 * ResizeObserver in Avatar corrects the size as soon as it is real.
 */
function safeCanvasSize(canvas: HTMLCanvasElement): { width: number; height: number } {
  return {
    width: Math.max(1, canvas.clientWidth),
    height: Math.max(1, canvas.clientHeight),
  }
}

/**
 * Device pixel ratio, capped.
 *
 * Uncapped, a 3x-DPI phone renders nine times the fragments — and this library's heaviest
 * shaders are full-screen (the black hole's bloom and lensing passes) or per-fragment noise,
 * so the cost lands exactly where it hurts. Two is the conventional ceiling; above it the
 * difference is not visible on a handheld display.
 */
function resolvePixelRatio(config?: SceneConfig): number {
  const available = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
  const cap = config?.maxPixelRatio ?? 2
  return Math.min(available, cap)
}

/**
 * Create and configure the WebGL renderer
 */
function createRenderer(
  canvas: HTMLCanvasElement,
  config?: SceneConfig,
): WebGLRenderer {
  const context = canvas.getContext('webgl2', {
    antialias: true,
    alpha: true,
    stencil: true,
    preserveDrawingBuffer: config?.preserveDrawingBuffer ?? false,
  }) as WebGL2RenderingContext

  const renderer = new WebGLRenderer({
    canvas,
    context,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: config?.preserveDrawingBuffer ?? false,
  })

  renderer.autoClearStencil = true

  const { width, height } = safeCanvasSize(canvas)
  renderer.setSize(width, height)
  renderer.setPixelRatio(resolvePixelRatio(config))

  // Opt-in. No mesh in any shipped renderer sets castShadow or receiveShadow, so with this on
  // three.js allocated multi-megabyte depth targets and ran a shadow pass every frame that
  // produced nothing. Turning it off changes no pixel of the shipped renderers.
  if (config?.enableShadows === true) {
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFSoftShadowMap
  }

  return renderer
}

/**
 * Create and configure the perspective camera
 */
function createCamera(
  canvas: HTMLCanvasElement,
  config?: SceneConfig,
): PerspectiveCamera {
  const fov = config?.fov || 100
  const near = config?.near || 0.1
  const far = config?.far || 1000

  const { width, height } = safeCanvasSize(canvas)
  const camera = new PerspectiveCamera(fov, width / height, near, far)

  const position = config?.cameraPosition || { x: 0, y: 0, z: 6 }
  camera.position.set(position.x, position.y, position.z)
  camera.lookAt(0, 0, 0)

  return camera
}

/**
 * Create and configure scene lighting
 */
function createLights(config?: SceneConfig) {
  const intensity = config?.lightIntensity || {}
  const topIntensity = intensity.top ?? 0.7
  const bottomIntensity = intensity.bottom ?? 0.4
  const ambientIntensity = intensity.ambient ?? 1

  const shadowsEnabled = config?.enableShadows === true

  const top = new DirectionalLight(0xFFFFFF, topIntensity)
  top.position.set(0, 500, 2000)
  if (shadowsEnabled) {
    top.castShadow = true
    top.shadow.mapSize.width = 4048
    top.shadow.mapSize.height = 4048
    top.shadow.camera.near = 0
    top.shadow.camera.far = 1000
    top.shadow.camera.left = -200
    top.shadow.camera.right = 200
    top.shadow.camera.top = 200
    top.shadow.camera.bottom = -200
  }

  const bottom = new DirectionalLight(0xFFFFFF, bottomIntensity)
  bottom.position.set(0, -500, 400)
  if (shadowsEnabled) {
    bottom.castShadow = true
    bottom.shadow.mapSize.width = 5048
    bottom.shadow.mapSize.height = 5048
    bottom.shadow.camera.near = 0.5
    bottom.shadow.camera.far = 1000
    bottom.shadow.camera.left = -200
    bottom.shadow.camera.right = 200
    bottom.shadow.camera.top = 200
    bottom.shadow.camera.bottom = -200
  }

  const ambient = new AmbientLight(0x798296, ambientIntensity)

  return { top, bottom, ambient }
}

/**
 * Create orbit controls for camera manipulation
 */
function createControls(
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
) {
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enableZoom = false
  controls.target.set(0, 0, 0)
  controls.update()
  return controls
}

/**
 * Apply background configuration to the scene
 */
function applySceneBackground(scene: ThreeScene, config?: SceneConfig) {
  const bgConfig = config?.background

  if (!bgConfig || bgConfig.type === 'transparent') {
    scene.background = null
    return
  }

  if (bgConfig.type === 'solid' && bgConfig.color) {
    scene.background = new Color(bgConfig.color)
    return
  }

  if (bgConfig.type === 'gradient' && bgConfig.gradient) {
    const gradientTexture = createGradientTexture(
      bgConfig.gradient.colors,
      bgConfig.gradient.direction || 'vertical',
      bgConfig.gradient.opacity ?? bgConfig.opacity ?? 1,
      bgConfig.gradient.angle,
      bgConfig.gradient.stops,
    )
    scene.background = gradientTexture
    return
  }
}

/**
 * Create a gradient texture for scene background
 */
function createGradientTexture(
  colors: string[],
  direction: 'vertical' | 'horizontal' | 'radial' | 'diagonal',
  opacity: number = 1,
  angle?: number,
  stops?: number[],
): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  ctx.globalAlpha = opacity

  let gradient: CanvasGradient

  if (direction === 'radial') {
    gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 512)
  } else if (typeof angle === 'number' && Number.isFinite(angle)) {
    gradient = createLinearGradientWithAngle(ctx, angle)
  } else if (direction === 'horizontal') {
    gradient = ctx.createLinearGradient(0, 0, 512, 0)
  } else if (direction === 'diagonal') {
    gradient = ctx.createLinearGradient(0, 0, 512, 512)
  } else {
    gradient = ctx.createLinearGradient(0, 0, 0, 512)
  }

  const normalizedStops = getStopsForGradient(colors.length, stops)
  normalizedStops.forEach((stop, index) => {
    gradient.addColorStop(Math.max(0, Math.min(1, stop)), colors[index])
  })

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 512, 512)

  return new CanvasTexture(canvas)
}

function createLinearGradientWithAngle(ctx: CanvasRenderingContext2D, angle: number): CanvasGradient {
  const canvas = ctx.canvas
  const width = canvas.width
  const height = canvas.height
  const radians = ((angle % 360) - 90) * (Math.PI / 180)
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const halfWidth = width / 2
  const halfHeight = height / 2

  const x0 = halfWidth - cos * halfWidth
  const y0 = halfHeight - sin * halfHeight
  const x1 = halfWidth + cos * halfWidth
  const y1 = halfHeight + sin * halfHeight

  return ctx.createLinearGradient(x0, y0, x1, y1)
}

function getStopsForGradient(count: number, stops?: number[]): number[] {
  if (count <= 0) return [0]
  const sanitized = sanitizeStops(count, stops)
  if (sanitized) return sanitized

  if (count === 1) return [0]
  if (count === 2) return [0, 1]

  return Array.from({ length: count }, (_, index) => index / (count - 1))
}

function sanitizeStops(count: number, stops?: number[]): number[] | undefined {
  if (!Array.isArray(stops) || stops.length !== count || count <= 0) {
    return undefined
  }

  const sanitized = stops.map((stop, index) => {
    const numeric = Number(stop)
    if (!Number.isFinite(numeric)) {
      return count > 1 ? index / (count - 1) : 0
    }
    return Math.max(0, Math.min(1, numeric))
  })

  for (let i = 1; i < sanitized.length; i++) {
    if (sanitized[i] < sanitized[i - 1]) {
      sanitized[i] = sanitized[i - 1]
    }
  }

  return sanitized
}
