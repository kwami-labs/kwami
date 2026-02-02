import {
  Mesh,
  Group,
  Color,
  SphereGeometry,
  PointLight,
  Vector2,
  Raycaster,
  type MeshStandardMaterial,
} from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

import {
  createCrystalBallMaterial,
  createCrystalBallUniforms,
  updateMaterialUniforms,
  type CrystalBallUniforms,
} from './materials'
import { defaultCrystalBallConfig } from './config'

import type {
  CrystalBallOptions,
  CrystalBallStyleSelection,
  CrystalBallStyle,
  VolumeConfig,
  CrystalBallAnimationConfig,
  CrystalBallAudioEffects,
} from './types'
import { logger } from '../../../utils/logger'
import {
  getRandomBetween,
  getRandomHexColor,
  getRandomBoolean,
} from '../../../utils/randoms'

/**
 * Audio levels for smooth transitions
 */
interface AudioLevels {
  bass: number
  mid: number
  high: number
  overall: number
}

/**
 * CrystalBall - A magical marble 3D avatar with volumetric effects
 * Based on the "Magical Marbles in Three.js" technique
 * 
 * Creates a glass sphere with raymarched internal volume that reacts
 * to audio and displays beautiful animated patterns
 */
export class CrystalBall {
  private group: Group
  private sphere: Mesh
  private config = defaultCrystalBallConfig
  private uniforms: CrystalBallUniforms

  public currentStyle: CrystalBallStyleSelection
  private material: MeshStandardMaterial

  private animationFrameId: number | null = null
  private startTime: number = Date.now()

  // Lights for scene illumination
  private lights: { primary: PointLight; secondary: PointLight } | null = null
  public lightIntensity = 0

  // Click interaction
  private clickEnabled = false

  // Conversation callback
  public onConversationToggle?: () => Promise<void>

  // Click callbacks
  public onClick?: () => void | Promise<void>
  public onDoubleClick?: () => void | Promise<void>

  // Right-click callbacks
  public onRightClick?: () => void | Promise<void>
  public onDoubleRightClick?: () => void | Promise<void>

  // Right-click tracking
  private lastRightClickTime = 0
  private rightClickTimeout: number | null = null

  // State management
  public isListening = false
  private listeningTransition = 0
  public isThinking = false
  private thinkingTimeout: number | null = null
  private thinkingTransition = 0
  public thinkingDuration = 10000
  public transitionSpeed = 0.05

  // Animation parameters
  public rotation = { x: 0, y: 0.001, z: 0 }
  public scale = 1.0
  public colors: { primary: string; secondary: string }

  // Volume configuration
  private volumeConfig: VolumeConfig
  private animationConfig: CrystalBallAnimationConfig

  // Audio effects
  public audioEffects: CrystalBallAudioEffects
  private previousAudioLevels: AudioLevels = { bass: 0, mid: 0, high: 0, overall: 0 }

  constructor(private options: CrystalBallOptions) {
    // Initialize style
    this.currentStyle = options.style ?? { style: 'mystical' }

    // Get style-specific config
    const styleConfig = this.config.styles[this.currentStyle.style]

    // Initialize colors
    this.colors = options.colors ?? { ...styleConfig.colors }

    // Initialize volume config
    this.volumeConfig = {
      ...this.config.volume,
      ...styleConfig.volume,
      ...options.volume,
    }

    // Initialize animation config
    this.animationConfig = {
      ...this.config.animation,
      ...styleConfig.animation,
      ...options.animation,
    }

    // Initialize audio effects
    this.audioEffects = {
      ...this.config.audioEffects,
      ...options.audioEffects,
    }

    // Initialize scale
    this.scale = options.scale ?? this.config.scale.default

    // Initialize rotation
    if (options.animation?.rotationSpeed) {
      this.rotation = options.animation.rotationSpeed
    } else {
      this.rotation = { ...this.animationConfig.rotationSpeed }
    }

    // Create uniforms
    this.uniforms = createCrystalBallUniforms(
      this.colors.primary,
      this.colors.secondary,
      this.volumeConfig.iterations,
      this.volumeConfig.depth,
      this.volumeConfig.smoothing,
      this.volumeConfig.noiseScale,
      this.animationConfig.displacementSpeed,
      this.animationConfig.displacementStrength,
      this.animationConfig.pulseSpeed,
      this.animationConfig.pulseIntensity,
    )

    // Create material
    const roughness = options.roughness ?? styleConfig.roughness
    const metalness = options.metalness ?? styleConfig.metalness
    const envMapIntensity = options.envMapIntensity ?? styleConfig.envMapIntensity
    this.material = createCrystalBallMaterial(
      this.uniforms,
      roughness,
      metalness,
      envMapIntensity,
    )

    // Create the group that holds everything
    this.group = new Group()

    // Create sphere geometry with high detail for smooth surface
    const geometry = new SphereGeometry(1, 64, 64)
    this.sphere = new Mesh(geometry, this.material)
    this.group.add(this.sphere)

    // Apply scale
    this.group.scale.setScalar(this.scale)

    // Start animation
    this.startAnimation()
  }

  /**
   * Analyze audio frequency data into bass, mid, high levels
   */
  private analyzeAudio(frequencyData: Uint8Array): AudioLevels {
    if (!frequencyData || frequencyData.length === 0) {
      return { bass: 0, mid: 0, high: 0, overall: 0 }
    }

    const bassRange = Math.floor(frequencyData.length * 0.15)
    const midRange = Math.floor(frequencyData.length * 0.5)

    let bassSum = 0
    let midSum = 0
    let highSum = 0

    for (let i = 0; i < bassRange; i++) {
      bassSum += frequencyData[i]
    }
    for (let i = bassRange; i < midRange; i++) {
      midSum += frequencyData[i]
    }
    for (let i = midRange; i < frequencyData.length; i++) {
      highSum += frequencyData[i]
    }

    const bass = bassSum / (bassRange * 255)
    const mid = midSum / ((midRange - bassRange) * 255)
    const high = highSum / ((frequencyData.length - midRange) * 255)
    const overall = (bass + mid + high) / 3

    return { bass, mid, high, overall }
  }

  /**
   * Smooth audio levels for natural transitions
   */
  private smoothAudioLevels(current: AudioLevels, previous: AudioLevels, smoothing: number): AudioLevels {
    return {
      bass: previous.bass * smoothing + current.bass * (1 - smoothing),
      mid: previous.mid * smoothing + current.mid * (1 - smoothing),
      high: previous.high * smoothing + current.high * (1 - smoothing),
      overall: previous.overall * smoothing + current.overall * (1 - smoothing),
    }
  }

  /**
   * Start the animation loop
   */
  private startAnimation(): void {
    const animate = () => {
      const time = (Date.now() - this.startTime) / 1000

      // Update state transitions
      if (this.isListening) {
        this.listeningTransition = Math.min(1, this.listeningTransition + this.transitionSpeed)
      } else {
        this.listeningTransition = Math.max(0, this.listeningTransition - this.transitionSpeed)
      }

      if (this.isThinking) {
        this.thinkingTransition = Math.min(1, this.thinkingTransition + this.transitionSpeed)
      } else {
        this.thinkingTransition = Math.max(0, this.thinkingTransition - this.transitionSpeed)
      }

      // Get audio data
      let audioLevels: AudioLevels = { bass: 0, mid: 0, high: 0, overall: 0 }
      const analyser = this.options.audio.getAnalyser()

      if (analyser && this.audioEffects.enabled) {
        const frequencyData = this.options.audio.getFrequencyData()
        audioLevels = this.analyzeAudio(frequencyData)
        audioLevels = this.smoothAudioLevels(
          audioLevels,
          this.previousAudioLevels,
          this.audioEffects.smoothing,
        )
        this.previousAudioLevels = audioLevels
      }

      // Update material uniforms
      updateMaterialUniforms(
        this.uniforms,
        time,
        audioLevels.bass * this.audioEffects.reactivity,
        audioLevels.mid * this.audioEffects.reactivity,
        audioLevels.high * this.audioEffects.reactivity,
        this.listeningTransition,
        this.thinkingTransition,
      )

      // Apply rotation
      this.group.rotation.x += this.rotation.x
      this.group.rotation.y += this.rotation.y
      this.group.rotation.z += this.rotation.z

      // Render
      this.options.renderer.render(this.options.scene, this.options.camera)
      this.options.onAfterRender?.()

      this.animationFrameId = requestAnimationFrame(animate)
    }

    animate()
  }

  /**
   * Stop the animation loop
   */
  private stopAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * Get the THREE.js group (for adding to scene)
   */
  getMesh(): Group {
    return this.group
  }

  /**
   * Get the group (alias for getMesh)
   */
  getGroup(): Group {
    return this.group
  }

  // ==========================================================================
  // STYLE & APPEARANCE
  // ==========================================================================

  /**
   * Change the crystal ball style
   */
  setStyle(selection: CrystalBallStyleSelection): void {
    if (this.currentStyle.style === selection.style) return

    this.currentStyle = selection
    const styleConfig = this.config.styles[selection.style]

    // Update colors
    this.setColors(styleConfig.colors.primary, styleConfig.colors.secondary)

    // Update volume config
    this.volumeConfig = {
      ...this.config.volume,
      ...styleConfig.volume,
    }
    this.uniforms.uNoiseScale.value = this.volumeConfig.noiseScale
    this.uniforms.uIterations.value = this.volumeConfig.iterations
    this.uniforms.uSmoothing.value = this.volumeConfig.smoothing

    // Update animation config
    this.animationConfig = {
      ...this.config.animation,
      ...styleConfig.animation,
    }
    this.uniforms.uDisplacementSpeed.value = this.animationConfig.displacementSpeed
    this.uniforms.uDisplacementStrength.value = this.animationConfig.displacementStrength

    // Update material properties
    this.material.roughness = styleConfig.roughness
    this.material.metalness = styleConfig.metalness
    this.material.envMapIntensity = styleConfig.envMapIntensity
    this.material.needsUpdate = true

    logger.info(`Crystal ball style changed to: ${selection.style}`)
  }

  /**
   * Get current style
   */
  getStyle(): CrystalBallStyleSelection {
    return this.currentStyle
  }

  /**
   * Set primary and secondary colors
   */
  setColors(primary: string, secondary: string): void {
    this.colors = { primary, secondary }
    this.uniforms.uColorA.value = new Color(primary)
    this.uniforms.uColorB.value = new Color(secondary)

    // Update lights if they exist
    this.updateLightColors()

    logger.debug('Crystal ball colors updated')
  }

  /**
   * Get current colors
   */
  getColors(): { primary: string; secondary: string } {
    return { ...this.colors }
  }

  /**
   * Set overall scale
   */
  setScale(scale: number): void {
    this.scale = Math.max(this.config.scale.min, Math.min(this.config.scale.max, scale))
    this.group.scale.setScalar(this.scale)
    logger.debug(`Crystal ball scale set to: ${this.scale}`)
  }

  /**
   * Get scale
   */
  getScale(): number {
    return this.scale
  }

  /**
   * Set rotation speed
   */
  setRotation(x: number, y: number, z: number): void {
    this.rotation = { x, y, z }
  }

  /**
   * Get rotation
   */
  getRotation(): { x: number; y: number; z: number } {
    return { ...this.rotation }
  }

  // ==========================================================================
  // VOLUME PARAMETERS
  // ==========================================================================

  /**
   * Set raymarching iterations (affects detail and performance)
   */
  setIterations(iterations: number): void {
    this.volumeConfig.iterations = Math.max(8, Math.min(64, iterations))
    this.uniforms.uIterations.value = this.volumeConfig.iterations
  }

  /**
   * Set volume depth
   */
  setDepth(depth: number): void {
    this.volumeConfig.depth = Math.max(0.1, Math.min(1.0, depth))
    this.uniforms.uDepth.value = this.volumeConfig.depth
  }

  /**
   * Set smoothing factor
   */
  setSmoothing(smoothing: number): void {
    this.volumeConfig.smoothing = Math.max(0.1, Math.min(0.8, smoothing))
    this.uniforms.uSmoothing.value = this.volumeConfig.smoothing
  }

  /**
   * Set noise scale
   */
  setNoiseScale(scale: number): void {
    this.volumeConfig.noiseScale = Math.max(0.5, Math.min(5.0, scale))
    this.uniforms.uNoiseScale.value = this.volumeConfig.noiseScale
  }

  // ==========================================================================
  // ANIMATION PARAMETERS
  // ==========================================================================

  /**
   * Set displacement animation speed
   */
  setDisplacementSpeed(speed: number): void {
    this.animationConfig.displacementSpeed = Math.max(0, Math.min(1.0, speed))
    this.uniforms.uDisplacementSpeed.value = this.animationConfig.displacementSpeed
  }

  /**
   * Set displacement strength
   */
  setDisplacementStrength(strength: number): void {
    this.animationConfig.displacementStrength = Math.max(0, Math.min(1.0, strength))
    this.uniforms.uDisplacementStrength.value = this.animationConfig.displacementStrength
  }

  /**
   * Set pulse speed
   */
  setPulseSpeed(speed: number): void {
    this.animationConfig.pulseSpeed = Math.max(0, Math.min(5.0, speed))
    this.uniforms.uPulseSpeed.value = this.animationConfig.pulseSpeed
  }

  /**
   * Set pulse intensity
   */
  setPulseIntensity(intensity: number): void {
    this.animationConfig.pulseIntensity = Math.max(0, Math.min(0.3, intensity))
    this.uniforms.uPulseIntensity.value = this.animationConfig.pulseIntensity
  }

  // ==========================================================================
  // AUDIO EFFECTS
  // ==========================================================================

  /**
   * Set audio reactivity
   */
  setAudioReactivity(value: number): void {
    this.audioEffects.reactivity = value
    this.uniforms.uAudioReactivity.value = value
  }

  /**
   * Enable/disable audio effects
   */
  setAudioEnabled(enabled: boolean): void {
    this.audioEffects.enabled = enabled
  }

  // ==========================================================================
  // LIGHTS
  // ==========================================================================

  /**
   * Set light intensity (adds point lights to scene)
   */
  setLightIntensity(intensity: number): void {
    this.lightIntensity = intensity

    if (intensity > 0) {
      if (!this.lights) {
        this.initializeLights()
      }
      if (this.lights) {
        this.lights.primary.intensity = intensity
        this.lights.secondary.intensity = intensity * 0.6
      }
    } else if (this.lights) {
      this.lights.primary.intensity = 0
      this.lights.secondary.intensity = 0
    }
  }

  private initializeLights(): void {
    const primary = new PointLight(new Color(this.colors.primary).getHex(), this.lightIntensity, 15)
    const secondary = new PointLight(new Color(this.colors.secondary).getHex(), this.lightIntensity * 0.6, 12)

    primary.position.set(3, 2, 2)
    secondary.position.set(-2, -1, 3)

    this.options.scene.add(primary)
    this.options.scene.add(secondary)

    this.lights = { primary, secondary }
  }

  private updateLightColors(): void {
    if (this.lights) {
      this.lights.primary.color.setHex(new Color(this.colors.primary).getHex())
      this.lights.secondary.color.setHex(new Color(this.colors.secondary).getHex())
    }
  }

  // ==========================================================================
  // INTERACTION
  // ==========================================================================

  /**
   * Enable click interaction
   */
  enableClickInteraction(): void {
    if (this.clickEnabled) return
    this.clickEnabled = true

    const canvas = this.options.renderer.domElement
    const raycaster = new Raycaster()
    const mouse = new Vector2()

    const handleClick = async (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, this.options.camera)

      const intersects = raycaster.intersectObject(this.sphere)

      if (intersects.length > 0) {
        if (this.onClick) {
          await this.onClick()
        } else {
          // Default behavior: visual feedback - pulse effect
          this.triggerPulse()
        }
      }
    }

    const handleDoubleClick = async (event: MouseEvent) => {
      event.preventDefault()

      const rect = canvas.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, this.options.camera)

      const intersects = raycaster.intersectObject(this.sphere)

      if (intersects.length > 0) {
        if (this.onDoubleClick) {
          await this.onDoubleClick()
        } else if (this.onConversationToggle) {
          await this.onConversationToggle()
        } else {
          if (this.isListening) {
            this.stopListening()
          } else {
            await this.startListening()
          }
        }
      }
    }

    const handleContextMenu = async (event: MouseEvent) => {
      event.preventDefault()

      const rect = canvas.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, this.options.camera)

      const intersects = raycaster.intersectObject(this.sphere)

      if (intersects.length > 0) {
        const now = Date.now()
        const DOUBLE_CLICK_THRESHOLD = 300 // ms

        if (now - this.lastRightClickTime < DOUBLE_CLICK_THRESHOLD) {
          // Double right-click detected
          if (this.rightClickTimeout) {
            clearTimeout(this.rightClickTimeout)
            this.rightClickTimeout = null
          }
          if (this.onDoubleRightClick) {
            await this.onDoubleRightClick()
          }
        } else {
          // Potential single right-click, wait to see if it's a double
          this.rightClickTimeout = window.setTimeout(async () => {
            if (this.onRightClick) {
              await this.onRightClick()
            }
            this.rightClickTimeout = null
          }, DOUBLE_CLICK_THRESHOLD)
        }

        this.lastRightClickTime = now
      }
    }

    canvas.addEventListener('click', handleClick)
    canvas.addEventListener('dblclick', handleDoubleClick)
    canvas.addEventListener('contextmenu', handleContextMenu)

    // Store handlers for cleanup
    ;(this as unknown as Record<string, unknown>)._clickHandler = handleClick
    ;(this as unknown as Record<string, unknown>)._dblClickHandler = handleDoubleClick
    ;(this as unknown as Record<string, unknown>)._contextMenuHandler = handleContextMenu
  }

  /**
   * Disable click interaction
   */
  disableClickInteraction(): void {
    if (!this.clickEnabled) return
    this.clickEnabled = false

    const canvas = this.options.renderer.domElement
    const handlers = this as unknown as Record<string, EventListener | undefined>

    if (handlers._clickHandler) {
      canvas.removeEventListener('click', handlers._clickHandler)
      delete handlers._clickHandler
    }

    if (handlers._dblClickHandler) {
      canvas.removeEventListener('dblclick', handlers._dblClickHandler)
      delete handlers._dblClickHandler
    }

    if (handlers._contextMenuHandler) {
      canvas.removeEventListener('contextmenu', handlers._contextMenuHandler)
      delete handlers._contextMenuHandler
    }

    // Clean up right-click timeout
    if (this.rightClickTimeout) {
      clearTimeout(this.rightClickTimeout)
      this.rightClickTimeout = null
    }

    if (this.isListening) {
      this.stopListening()
    }
  }

  /**
   * Set click callback
   */
  setClickCallback(callback: () => void | Promise<void>): void {
    this.onClick = callback
  }

  /**
   * Set right-click callback
   */
  setRightClickCallback(callback: () => void | Promise<void>): void {
    this.onRightClick = callback
  }

  /**
   * Set double right-click callback
   */
  setDoubleRightClickCallback(callback: () => void | Promise<void>): void {
    this.onDoubleRightClick = callback
  }

  /**
   * Trigger a visual pulse effect
   */
  triggerPulse(): void {
    // Temporarily boost displacement
    const originalStrength = this.uniforms.uDisplacementStrength.value
    this.uniforms.uDisplacementStrength.value = originalStrength * 2

    setTimeout(() => {
      this.uniforms.uDisplacementStrength.value = originalStrength
    }, 200)
  }

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  /**
   * Start listening mode
   */
  async startListening(): Promise<void> {
    try {
      await this.options.audio.startMicrophoneListening()
      this.isListening = true
      logger.info('🎤 Crystal ball started listening')
    } catch (error) {
      logger.error('Failed to start listening:', error)
      throw error
    }
  }

  /**
   * Stop listening mode
   */
  stopListening(): void {
    this.options.audio.stopMicrophoneListening()
    this.isListening = false
    logger.info('🔇 Crystal ball stopped listening')
  }

  /**
   * Start thinking mode
   */
  startThinking(): void {
    if (this.thinkingTimeout !== null) {
      clearTimeout(this.thinkingTimeout)
    }

    this.isThinking = true
    logger.info(`🤔 Crystal ball started thinking (${this.thinkingDuration / 1000}s)`)

    this.thinkingTimeout = window.setTimeout(() => {
      this.stopThinking()
    }, this.thinkingDuration)
  }

  /**
   * Stop thinking mode
   */
  stopThinking(): void {
    if (this.thinkingTimeout !== null) {
      clearTimeout(this.thinkingTimeout)
      this.thinkingTimeout = null
    }

    this.isThinking = false
    logger.info('💭 Crystal ball stopped thinking')
  }

  // ==========================================================================
  // RANDOMIZATION
  // ==========================================================================

  /**
   * Randomize crystal ball appearance
   */
  setRandomCrystalBall(): void {
    // Random style
    const styles: CrystalBallStyle[] = ['mystical', 'nebula', 'earth', 'fire', 'ocean']
    const randomStyle = styles[Math.floor(Math.random() * styles.length)]
    this.setStyle({ style: randomStyle })

    // Random colors (optionally override style colors)
    if (getRandomBoolean(0.5)) {
      this.setColors(getRandomHexColor(), getRandomHexColor())
    }

    // Random scale
    this.setScale(getRandomBetween(0.7, 1.5, 2))

    // Random rotation
    if (getRandomBoolean()) {
      this.setRotation(
        getRandomBetween(-0.003, 0.003, 4),
        getRandomBetween(0.0005, 0.005, 4),
        getRandomBetween(-0.002, 0.002, 4),
      )
    } else {
      this.setRotation(0, 0.001, 0)
    }

    // Random volume parameters
    this.setNoiseScale(getRandomBetween(1.5, 4.0, 2))
    this.setSmoothing(getRandomBetween(0.2, 0.5, 2))
    this.setDisplacementStrength(getRandomBetween(0.2, 0.6, 2))
    this.setDisplacementSpeed(getRandomBetween(0.05, 0.3, 2))

    logger.info('🎲 Crystal ball randomized')
  }

  // ==========================================================================
  // EXPORT
  // ==========================================================================

  /**
   * Export crystal ball as GLTF
   */
  exportGLTF(): void {
    const exporter = new GLTFExporter()

    exporter.parse(
      this.group,
      (result: ArrayBuffer | { [key: string]: unknown }) => {
        const blobData = new globalThis.Blob([result as ArrayBuffer], {
          type: 'model/gltf-binary',
        })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blobData)
        link.download = 'kwami-crystal-ball.glb'
        link.click()
      },
      (error: unknown) => {
        logger.error('Failed to export GLTF:', error)
      },
      { binary: true },
    )
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  /**
   * Dispose all resources
   */
  dispose(): void {
    this.disableClickInteraction()
    this.stopThinking()
    this.stopAnimation()

    // Dispose sphere
    this.sphere.geometry.dispose()
    this.material.dispose()

    // Remove lights
    if (this.lights) {
      this.options.scene.remove(this.lights.primary)
      this.options.scene.remove(this.lights.secondary)
      this.lights = null
    }

    logger.info('Crystal ball disposed')
  }
}
