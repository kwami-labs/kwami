import {
  Mesh,
  Group,
  Color,
  PointLight,
  Vector2,
  Raycaster,
  type ShaderMaterial,
} from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

import {
  createCoreGeometry,
  createCoreGlowGeometry,
  getShardGeometry,
  generateOrbitalPositions,
} from './geometry'
import {
  createCrystalMaterials,
  createShardMaterial,
  updateMaterialsTime,
  updateMaterialsAudio,
} from './materials'
import {
  analyzeAudio,
  smoothAudioLevels,
  animateOrbitalShards,
  type ShardState,
  type AudioLevels,
} from './animation'
import { defaultOrbitalShardsConfig } from './config'

import type {
  OrbitalShardsOptions,
  OrbitalShardsFormationSelection,
  OrbitalShardsFormation,
  ShardConfig,
  CoreConfig,
  OrbitalShardsAudioEffects,
  FormationConfig,
} from './types'
import { logger } from '../../../utils/logger'
import {
  getRandomBetween,
  getRandomHexColor,
  getRandomBoolean,
} from '../../../utils/randoms'

/**
 * OrbitalShards - A geometric 3D avatar made of floating crystal shards
 * orbiting an energy core with prismatic light effects
 */
export class OrbitalShards {
  private group: Group
  private shards: ShardState[] = []
  private core: Mesh
  private glow: Mesh
  private config = defaultOrbitalShardsConfig

  public currentFormation: OrbitalShardsFormationSelection
  private materials: {
    shardMaterial: ShaderMaterial
    coreMaterial: ShaderMaterial
    glowMaterial: ShaderMaterial
  }

  private animationFrameId: number | null = null
  private startTime: number = Date.now()

  // Lights for scene illumination
  private lights: { primary: PointLight; secondary: PointLight; accent: PointLight } | null = null
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
  public rotation = { x: 0, y: 0.002, z: 0 }
  public scale = 1.0
  public colors: { primary: string; secondary: string; accent: string }

  // Audio effects
  public audioEffects: OrbitalShardsAudioEffects
  private previousAudioLevels: AudioLevels = { bass: 0, mid: 0, high: 0, overall: 0 }

  // Shard configuration
  private shardConfig: ShardConfig
  private coreConfig: CoreConfig

  constructor(private options: OrbitalShardsOptions) {
    // Initialize formation
    this.currentFormation = options.formation ?? { formation: 'constellation', coreStyle: 'plasma' }

    // Get formation-specific config
    const formationConfig = this.config.formations[this.currentFormation.formation]

    // Initialize colors
    this.colors = options.colors ?? { ...formationConfig.colors }

    // Initialize shard config
    this.shardConfig = {
      ...this.config.shards,
      ...options.shards,
    }

    // Initialize core config
    this.coreConfig = {
      ...this.config.core,
      ...options.core,
    }

    // Initialize audio effects
    this.audioEffects = {
      ...this.config.audioEffects,
      ...options.audioEffects,
    }

    // Initialize scale
    this.scale = options.scale ?? this.config.scale.default

    // Initialize rotation
    if (options.rotation) {
      this.rotation = options.rotation
    }

    // Create materials
    this.materials = createCrystalMaterials(this.colors, this.coreConfig)

    // Create the group that holds everything
    this.group = new Group()

    // Create core
    const coreGeometry = createCoreGeometry(this.coreConfig.size)
    this.core = new Mesh(coreGeometry, this.materials.coreMaterial)
    this.group.add(this.core)

    // Create glow
    const glowGeometry = createCoreGlowGeometry(this.coreConfig.size * 1.5)
    this.glow = new Mesh(glowGeometry, this.materials.glowMaterial)
    this.group.add(this.glow)

    // Create shards
    this.createShards(formationConfig)

    // Apply scale
    this.group.scale.setScalar(this.scale)

    // Start animation
    this.startAnimation()
  }

  /**
   * Create floating crystal shards
   */
  private createShards(formationConfig: FormationConfig): void {
    const shardGeometry = getShardGeometry(formationConfig)
    const orbitalPositions = generateOrbitalPositions(
      this.shardConfig.count,
      this.shardConfig.orbitRadius,
      formationConfig.orbitPattern,
    )

    for (let i = 0; i < this.shardConfig.count; i++) {
      const orbital = orbitalPositions[i]

      // Random size within range
      const size = getRandomBetween(
        this.shardConfig.sizeRange[0],
        this.shardConfig.sizeRange[1],
        2,
      )

      // Create individual material instance for unique opacity
      const opacity = getRandomBetween(
        this.shardConfig.opacityRange[0],
        this.shardConfig.opacityRange[1],
        2,
      )

      const shardMaterial = createShardMaterial({
        primaryColor: this.colors.primary,
        secondaryColor: this.colors.secondary,
        accentColor: this.colors.accent,
        opacity,
        shininess: 80 + Math.random() * 40,
      })

      const shard = new Mesh(shardGeometry.clone(), shardMaterial)
      shard.position.set(...orbital.position)
      shard.scale.setScalar(size)

      // Random initial rotation
      shard.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      )

      this.group.add(shard)

      this.shards.push({
        mesh: shard,
        basePosition: orbital.position,
        orbitSpeed: orbital.orbitSpeed * this.shardConfig.rotationSpeed,
        orbitPhase: orbital.orbitPhase,
        tilt: orbital.tilt,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02,
        },
        baseScale: size,
      })
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

      if (analyser) {
        const frequencyData = this.options.audio.getFrequencyData()
        audioLevels = analyzeAudio(frequencyData)
        audioLevels = smoothAudioLevels(
          audioLevels,
          this.previousAudioLevels,
          this.audioEffects.smoothing,
        )
        this.previousAudioLevels = audioLevels
      }

      // Update material uniforms
      updateMaterialsTime(this.materials, time)
      updateMaterialsAudio(
        this.materials,
        audioLevels.bass,
        audioLevels.mid,
        audioLevels.high,
        this.audioEffects.reactivity,
      )

      // Update shard materials
      for (const shard of this.shards) {
        const mat = shard.mesh.material as ShaderMaterial
        mat.uniforms.uTime.value = time
        mat.uniforms.uBassLevel.value = audioLevels.bass
        mat.uniforms.uMidLevel.value = audioLevels.mid
        mat.uniforms.uHighLevel.value = audioLevels.high
        mat.uniforms.uAudioReactivity.value = this.audioEffects.reactivity
      }

      // Animate orbital shards
      animateOrbitalShards(
        this.group,
        this.shards,
        this.core,
        this.glow,
        time,
        audioLevels,
        this.audioEffects,
        this.rotation,
        this.listeningTransition,
        this.thinkingTransition,
      )

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
  // FORMATION & APPEARANCE
  // ==========================================================================

  /**
   * Change the crystal formation
   */
  setFormation(selection: OrbitalShardsFormationSelection): void {
    if (this.currentFormation.formation === selection.formation) return

    this.currentFormation = selection
    const formationConfig = this.config.formations[selection.formation]

    // Clear existing shards
    for (const shard of this.shards) {
      this.group.remove(shard.mesh)
      shard.mesh.geometry.dispose()
        ; (shard.mesh.material as ShaderMaterial).dispose()
    }
    this.shards = []

    // Create new shards with formation pattern
    this.createShards(formationConfig)

    logger.info(`OrbitalShards formation changed to: ${selection.formation}`)
  }

  /**
   * Get current formation
   */
  getFormation(): OrbitalShardsFormationSelection {
    return this.currentFormation
  }

  /**
   * Set primary, secondary, and accent colors
   */
  setOrbitalShardsColors(primary: string, secondary: string, accent: string): void {
    this.colors = { primary, secondary, accent }

    // Update shard materials
    for (const shard of this.shards) {
      const mat = shard.mesh.material as ShaderMaterial
      mat.uniforms.uPrimaryColor.value = new Color(primary)
      mat.uniforms.uSecondaryColor.value = new Color(secondary)
      mat.uniforms.uAccentColor.value = new Color(accent)
    }

    // Update lights if they exist
    this.updateLightColors()

    logger.debug(`OrbitalShards colors updated`)
  }

  /**
   * Get current colors
   */
  getColors(): { primary: string; secondary: string; accent: string } {
    return { ...this.colors }
  }

  /**
   * Set core colors
   */
  setCoreColors(innerColor: string, outerColor: string): void {
    this.coreConfig.innerColor = innerColor
    this.coreConfig.outerColor = outerColor

    this.materials.coreMaterial.uniforms.uInnerColor.value = new Color(innerColor)
    this.materials.coreMaterial.uniforms.uOuterColor.value = new Color(outerColor)
    this.materials.glowMaterial.uniforms.uGlowColor.value = new Color(outerColor)
  }

  /**
   * Set overall scale
   */
  setScale(scale: number): void {
    this.scale = Math.max(this.config.scale.min, Math.min(this.config.scale.max, scale))
    this.group.scale.setScalar(this.scale)
    logger.debug(`OrbitalShards scale set to: ${this.scale}`)
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

  /**
   * Set core glow intensity
   */
  setGlowIntensity(intensity: number): void {
    this.coreConfig.glowIntensity = intensity
    this.materials.coreMaterial.uniforms.uGlowIntensity.value = intensity
    this.materials.glowMaterial.uniforms.uGlowIntensity.value = intensity * 0.5
  }

  /**
   * Set shard count (recreates shards)
   */
  setShardCount(count: number): void {
    if (count === this.shardConfig.count) return

    this.shardConfig.count = count
    const formationConfig = this.config.formations[this.currentFormation.formation]

    // Clear existing shards
    for (const shard of this.shards) {
      this.group.remove(shard.mesh)
      shard.mesh.geometry.dispose()
        ; (shard.mesh.material as ShaderMaterial).dispose()
    }
    this.shards = []

    // Create new shards
    this.createShards(formationConfig)
  }

  // ==========================================================================
  // AUDIO EFFECTS
  // ==========================================================================

  /**
   * Set audio reactivity
   */
  setAudioReactivity(value: number): void {
    this.audioEffects.reactivity = value
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
        this.lights.secondary.intensity = intensity * 0.7
        this.lights.accent.intensity = intensity * 0.5
      }
    } else if (this.lights) {
      this.lights.primary.intensity = 0
      this.lights.secondary.intensity = 0
      this.lights.accent.intensity = 0
    }
  }

  /**
   * Set light position for shader lighting
   */
  setLightPosition(x: number, y: number, z: number): void {
    // Scale down for crystal's smaller scale
    const scaledX = x / 200
    const scaledY = y / 200
    const scaledZ = z / 200

    if (this.materials.shardMaterial.uniforms.uLightPosition) {
      this.materials.shardMaterial.uniforms.uLightPosition.value = { x: scaledX, y: scaledY, z: scaledZ }
      this.materials.shardMaterial.needsUpdate = true
    }
  }

  /**
   * Get current light position
   */
  getLightPosition(): { x: number; y: number; z: number } {
    if (this.materials.shardMaterial.uniforms.uLightPosition) {
      const pos = this.materials.shardMaterial.uniforms.uLightPosition.value
      return { x: pos.x * 200, y: pos.y * 200, z: pos.z * 200 }
    }
    return { x: 1000, y: 1000, z: 1000 }
  }

  private initializeLights(): void {
    const primary = new PointLight(new Color(this.colors.primary).getHex(), this.lightIntensity, 15)
    const secondary = new PointLight(new Color(this.colors.secondary).getHex(), this.lightIntensity * 0.7, 12)
    const accent = new PointLight(new Color(this.colors.accent).getHex(), this.lightIntensity * 0.5, 10)

    primary.position.set(3, 2, 2)
    secondary.position.set(-2, -1, 3)
    accent.position.set(0, 3, -2)

    this.options.scene.add(primary)
    this.options.scene.add(secondary)
    this.options.scene.add(accent)

    this.lights = { primary, secondary, accent }
  }

  private updateLightColors(): void {
    if (this.lights) {
      this.lights.primary.color.setHex(new Color(this.colors.primary).getHex())
      this.lights.secondary.color.setHex(new Color(this.colors.secondary).getHex())
      this.lights.accent.color.setHex(new Color(this.colors.accent).getHex())
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

      // Check intersection with core and shards
      const objects = [this.core, ...this.shards.map(s => s.mesh)]
      const intersects = raycaster.intersectObjects(objects)

      if (intersects.length > 0) {
        // Execute custom click callback if set, otherwise do default pulse
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

      const objects = [this.core, this.glow, ...this.shards.map(s => s.mesh)]
      const intersects = raycaster.intersectObjects(objects)

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

      const objects = [this.core, this.glow, ...this.shards.map(s => s.mesh)]
      const intersects = raycaster.intersectObjects(objects)

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
      ; (this as unknown as Record<string, unknown>)._clickHandler = handleClick
      ; (this as unknown as Record<string, unknown>)._dblClickHandler = handleDoubleClick
      ; (this as unknown as Record<string, unknown>)._contextMenuHandler = handleContextMenu
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
    // Temporarily boost glow
    const originalIntensity = this.coreConfig.glowIntensity
    this.setGlowIntensity(originalIntensity * 2)

    setTimeout(() => {
      this.setGlowIntensity(originalIntensity)
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
      logger.info('🎤 OrbitalShards started listening')
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
    logger.info('🔇 OrbitalShards stopped listening')
  }

  /**
   * Start thinking mode
   */
  startThinking(): void {
    if (this.thinkingTimeout !== null) {
      clearTimeout(this.thinkingTimeout)
    }

    this.isThinking = true
    logger.info(`🤔 OrbitalShards started thinking (${this.thinkingDuration / 1000}s)`)

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
    logger.info('💭 Orbital Shards stopped thinking')
  }

  // ==========================================================================
  // RANDOMIZATION
  // ==========================================================================

  /**
   * Randomize orbital shards appearance
   */
  setRandomOrbitalShards(): void {
    // Random formation
    const formations: OrbitalShardsFormation[] = ['constellation', 'helix', 'vortex']
    const randomFormation = formations[Math.floor(Math.random() * formations.length)]
    this.setFormation({ formation: randomFormation })

    // Random colors
    this.setOrbitalShardsColors(
      getRandomHexColor(),
      getRandomHexColor(),
      getRandomHexColor(),
    )

    // Random core colors
    this.setCoreColors(getRandomHexColor(), getRandomHexColor())

    // Random scale
    this.setScale(getRandomBetween(0.7, 1.5, 2))

    // Random rotation
    if (getRandomBoolean()) {
      this.setRotation(
        getRandomBetween(-0.005, 0.005, 4),
        getRandomBetween(0.001, 0.01, 4),
        getRandomBetween(-0.003, 0.003, 4),
      )
    } else {
      this.setRotation(0, 0.002, 0)
    }

    // Random shard count
    this.setShardCount(Math.floor(getRandomBetween(12, 40)))

    // Random glow
    this.setGlowIntensity(getRandomBetween(0.8, 2.0, 2))

    logger.info('🎲 Crystal randomized')
  }

  // ==========================================================================
  // EXPORT
  // ==========================================================================

  /**
   * Export crystal as GLTF
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
        link.download = 'kwami-crystal.glb'
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

    // Dispose shards
    for (const shard of this.shards) {
      shard.mesh.geometry.dispose()
        ; (shard.mesh.material as ShaderMaterial).dispose()
    }
    this.shards = []

    // Dispose core and glow
    this.core.geometry.dispose()
    this.materials.coreMaterial.dispose()
    this.glow.geometry.dispose()
    this.materials.glowMaterial.dispose()
    this.materials.shardMaterial.dispose()

    // Remove lights
    if (this.lights) {
      this.options.scene.remove(this.lights.primary)
      this.options.scene.remove(this.lights.secondary)
      this.options.scene.remove(this.lights.accent)
      this.lights = null
    }

    logger.info('Crystal disposed')
  }
}
