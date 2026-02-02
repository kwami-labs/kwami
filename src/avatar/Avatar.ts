import type { AvatarConfig, KwamiState, OrbitalShardsFormationSelection, CrystalBallStyleSelection } from '../types'
import type { BlobXyzSkinSelection } from './renderers/blob-xyz/types'
import { Scene } from './scene'
import { BlobXyz } from './renderers/blob-xyz'
import { OrbitalShards } from './renderers/orbital-shards'
import { Particles } from './renderers/particles'
import { CrystalBall } from './renderers/crystal-ball'
import { KwamiAudio } from './audio'
import { logger } from '../utils/logger'

/**
 * Avatar - Manages the visual representation of Kwami
 * 
 * Supports different renderers (blob, orbital-shards, future: humanoid, etc.)
 * The blob is the default renderer; orbital-shards is a new geometric alternative.
 */
export class Avatar {
  private canvas: HTMLCanvasElement
  private config: AvatarConfig
  private scene: Scene
  private blobXyz: BlobXyz | null = null
  private crystal: OrbitalShards | null = null
  private particles: Particles | null = null
  private crystalBall: CrystalBall | null = null
  private audio: KwamiAudio
  private currentState: KwamiState = 'idle'
  private resizeObserver: ResizeObserver | null = null
  private currentRenderer: 'blob-xyz' | 'orbital-shards' | 'particles' | 'crystal-ball' = 'blob-xyz'

  constructor(canvas: HTMLCanvasElement, config?: AvatarConfig) {
    this.canvas = canvas
    this.config = config ?? {}

    // Initialize audio
    this.audio = new KwamiAudio(config?.audio?.files ?? [])

    // Initialize scene
    this.scene = new Scene(canvas, config?.scene)

    // Initialize renderer
    this.initRenderer()

    // Setup resize handling
    this.setupResizeHandling()
  }

  private initRenderer(): void {
    const rendererType = this.config.renderer ?? 'blob-xyz'

    if (rendererType === 'blob-xyz') {
      this.currentRenderer = 'blob-xyz'
      this.initBlobXyzRenderer()
    } else if (rendererType === 'orbital-shards') {
      this.currentRenderer = 'orbital-shards'
      this.initOrbitalShardsRenderer()
    } else if (rendererType === 'particles') {
      this.currentRenderer = 'particles'
      this.initParticlesRenderer()
    } else if (rendererType === 'crystal-ball') {
      this.currentRenderer = 'crystal-ball'
      this.initCrystalBallRenderer()
    } else {
      // Future: Support other renderer types
      logger.warn(`Renderer type "${rendererType}" not supported, falling back to blob-xyz`)
      this.currentRenderer = 'blob-xyz'
      this.initBlobXyzRenderer()
    }
  }

  private initBlobXyzRenderer(): void {
    const blobConfig = this.config.blob ?? {}

    this.blobXyz = new BlobXyz({
      scene: this.scene.scene,
      camera: this.scene.camera,
      renderer: this.scene.renderer,
      audio: this.audio,
      skin: blobConfig.skin,
      resolution: blobConfig.resolution,
      spikes: blobConfig.spikes,
      time: blobConfig.time,
      rotation: blobConfig.rotation,
      colors: blobConfig.colors,
      shininess: blobConfig.shininess,
      wireframe: blobConfig.wireframe,
    })

    // Add blob mesh to scene
    this.scene.scene.add(this.blobXyz.getMesh())

    // Apply initial position if provided
    if (blobConfig.position) {
      this.blobXyz.position.set(blobConfig.position.x, blobConfig.position.y)
    }

    // Enable click interaction by default
    this.blobXyz.enableClickInteraction()
  }

  private initOrbitalShardsRenderer(): void {
    const orbitalShardsConfig = this.config.orbitalShards ?? {}

    this.crystal = new OrbitalShards({
      scene: this.scene.scene,
      camera: this.scene.camera,
      renderer: this.scene.renderer,
      audio: this.audio,
      formation: orbitalShardsConfig.formation,
      shards: orbitalShardsConfig.shards,
      core: orbitalShardsConfig.core,
      colors: orbitalShardsConfig.colors,
      audioEffects: orbitalShardsConfig.audioEffects,
      particleCount: orbitalShardsConfig.particleCount,
      scale: orbitalShardsConfig.scale,
      rotation: orbitalShardsConfig.rotation,
    })

    // Add crystal group to scene
    this.scene.scene.add(this.crystal.getMesh())

    // Enable click interaction by default
    this.crystal.enableClickInteraction()
  }

  private initParticlesRenderer(): void {
    const particlesConfig = this.config.particles ?? {}

    this.particles = new Particles({
      scene: this.scene.scene,
      camera: this.scene.camera,
      renderer: this.scene.renderer,
      audio: this.audio,
      particleCount: particlesConfig.particleCount,
      physics: particlesConfig.physics,
      visual: particlesConfig.visual,
      formation: particlesConfig.formation,
      audioEffects: particlesConfig.audioEffects,
      scale: particlesConfig.scale,
    })

    // Add particles group to scene
    this.scene.scene.add(this.particles.getMesh())

    // Enable click interaction by default
    this.particles.enableClickInteraction()
  }

  private initCrystalBallRenderer(): void {
    const crystalBallConfig = this.config.crystalBall ?? {}

    this.crystalBall = new CrystalBall({
      scene: this.scene.scene,
      camera: this.scene.camera,
      renderer: this.scene.renderer,
      audio: this.audio,
      style: crystalBallConfig.style,
      volume: crystalBallConfig.volume,
      animation: crystalBallConfig.animation,
      colors: crystalBallConfig.colors,
      audioEffects: crystalBallConfig.audioEffects,
      scale: crystalBallConfig.scale,
      roughness: crystalBallConfig.roughness,
      metalness: crystalBallConfig.metalness,
      envMapIntensity: crystalBallConfig.envMapIntensity,
    })

    // Add crystal ball group to scene
    this.scene.scene.add(this.crystalBall.getMesh())

    // Enable click interaction by default
    this.crystalBall.enableClickInteraction()
  }

  private setupResizeHandling(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          this.scene.resize(width, height)
          // Only blob has position management; crystal is centered
          if (this.currentRenderer === 'blob-xyz') {
            this.blobXyz?.position.refresh()
          }
        }
      }
    })

    this.resizeObserver.observe(this.canvas)
  }

  /**
   * Set the avatar state (affects visual appearance)
   */
  setState(state: KwamiState): void {
    if (this.currentState === state) return

    const previousState = this.currentState
    this.currentState = state

    // Handle state for blob renderer
    if (this.currentRenderer === 'blob-xyz' && this.blobXyz) {
      switch (state) {
        case 'idle':
          if (previousState === 'listening') this.blobXyz.stopListening()
          if (previousState === 'thinking') this.blobXyz.stopThinking()
          break
        case 'listening':
          this.blobXyz.startListening()
          break
        case 'thinking':
          this.blobXyz.startThinking()
          break
        case 'speaking':
          // Speaking state is driven by audio automatically
          break
      }
    }

    // Handle state for orbital-shards renderer
    if (this.currentRenderer === 'orbital-shards' && this.crystal) {
      switch (state) {
        case 'idle':
          if (previousState === 'listening') this.crystal.stopListening()
          if (previousState === 'thinking') this.crystal.stopThinking()
          break
        case 'listening':
          this.crystal.startListening()
          break
        case 'thinking':
          this.crystal.startThinking()
          break
        case 'speaking':
          // Speaking state is driven by audio automatically
          break
      }
    }

    // Handle state for particles renderer
    if (this.currentRenderer === 'particles' && this.particles) {
      switch (state) {
        case 'idle':
          if (previousState === 'listening') this.particles.stopListening()
          if (previousState === 'thinking') this.particles.stopThinking()
          break
        case 'listening':
          this.particles.startListening()
          break
        case 'thinking':
          this.particles.startThinking()
          break
        case 'speaking':
          // Speaking state is driven by audio automatically
          break
      }
    }

    // Handle state for crystal-ball renderer
    if (this.currentRenderer === 'crystal-ball' && this.crystalBall) {
      switch (state) {
        case 'idle':
          if (previousState === 'listening') this.crystalBall.stopListening()
          if (previousState === 'thinking') this.crystalBall.stopThinking()
          break
        case 'listening':
          this.crystalBall.startListening()
          break
        case 'thinking':
          this.crystalBall.startThinking()
          break
        case 'speaking':
          // Speaking state is driven by audio automatically
          break
      }
    }

    logger.debug(`Avatar state changed: ${previousState} → ${state}`)
  }

  /**
   * Get the current state
   */
  getState(): KwamiState {
    return this.currentState
  }

  // ===========================================================================
  // RENDERER ACCESS METHODS
  // ===========================================================================

  /**
   * Get the current renderer type
   */
  getRendererType(): 'blob-xyz' | 'orbital-shards' | 'particles' | 'crystal-ball' {
    return this.currentRenderer
  }

  /**
   * Switch to a different renderer type dynamically
   * Preserves the connection and state
   */
  switchRenderer(newRenderer: 'blob-xyz' | 'orbital-shards' | 'particles' | 'crystal-ball'): void {
    if (this.currentRenderer === newRenderer) {
      logger.debug(`Already using ${newRenderer} renderer`)
      return
    }

    logger.info(`Switching renderer from ${this.currentRenderer} to ${newRenderer}`)

    // Save current state
    const savedState = this.currentState

    // Dispose current renderer
    if (this.currentRenderer === 'blob-xyz' && this.blobXyz) {
      this.scene.scene.remove(this.blobXyz.getMesh())
      this.blobXyz.dispose()
      this.blobXyz = null
    } else if (this.currentRenderer === 'orbital-shards' && this.crystal) {
      this.scene.scene.remove(this.crystal.getMesh())
      this.crystal.dispose()
      this.crystal = null
    } else if (this.currentRenderer === 'particles' && this.particles) {
      this.scene.scene.remove(this.particles.getMesh())
      this.particles.dispose()
      this.particles = null
    } else if (this.currentRenderer === 'crystal-ball' && this.crystalBall) {
      this.scene.scene.remove(this.crystalBall.getMesh())
      this.crystalBall.dispose()
      this.crystalBall = null
    }

    // Initialize new renderer
    this.currentRenderer = newRenderer
    if (newRenderer === 'blob-xyz') {
      this.initBlobXyzRenderer()
    } else if (newRenderer === 'orbital-shards') {
      this.initOrbitalShardsRenderer()
    } else if (newRenderer === 'particles') {
      this.initParticlesRenderer()
    } else if (newRenderer === 'crystal-ball') {
      this.initCrystalBallRenderer()
    }

    // Restore state
    this.currentState = 'idle' // Reset first
    this.setState(savedState)

    // Update background gradient for the new renderer
    let newColors: string[]
    if (newRenderer === 'orbital-shards') {
      newColors = ['#050510', '#0a0a20', '#050510']
    } else if (newRenderer === 'particles') {
      newColors = ['#000000', '#0a0a15', '#000000']
    } else if (newRenderer === 'crystal-ball') {
      newColors = ['#0a0510', '#150a20', '#0a0510']
    } else {
      newColors = ['#0a0a1a', '#1a1a3a', '#0a0a1a']
    }
    this.scene.setBackground({ type: 'gradient', gradient: { colors: newColors, direction: 'radial' } })

    logger.info(`Renderer switched to ${newRenderer}`)
  }

  /**
   * Get the blob instance (for direct control)
   */
  getBlob(): BlobXyz | null {
    return this.blobXyz
  }

  /**
   * Get the orbital shards instance (for direct control)
   */
  getOrbitalShards(): OrbitalShards | null {
    return this.crystal
  }

  /**
   * Get the particles instance (for direct control)
   */
  getParticles(): Particles | null {
    return this.particles
  }

  /**
   * Get the crystal ball instance (for direct control)
   */
  getCrystalBall(): CrystalBall | null {
    return this.crystalBall
  }

  /**
   * Get the audio instance
   */
  getAudio(): KwamiAudio {
    return this.audio
  }

  /**
   * Get the scene instance
   */
  getScene(): Scene {
    return this.scene
  }

  /**
   * Set blob colors
   */
  setColors(x: string, y: string, z: string): void {
    this.blobXyz?.setColors(x, y, z)
  }

  /**
   * Set blob skin
   */
  setSkin(selection: BlobXyzSkinSelection): void {
    this.blobXyz?.setSkin(selection)
  }

  /**
   * Set blob scale
   */
  setScale(scale: number): void {
    this.blobXyz?.setScale(scale)
  }

  /**
   * Set blob spikes (noise frequency)
   */
  setSpikes(x: number, y: number, z: number): void {
    this.blobXyz?.setSpikes(x, y, z)
  }

  /**
   * Set blob position (normalized 0-1)
   */
  setPosition(x: number, y: number): void {
    this.blobXyz?.position.set(x, y)
  }

  /**
   * Set blob rotation speed
   */
  setRotation(x: number, y: number, z: number): void {
    this.blobXyz?.setRotation(x, y, z)
  }

  /**
   * Set blob shininess
   */
  setShininess(value: number): void {
    this.blobXyz?.setShininess(value)
  }

  /**
   * Set blob wireframe mode
   */
  setWireframe(enabled: boolean): void {
    this.blobXyz?.setWireframe(enabled)
  }

  /**
   * Set blob opacity
   */
  setOpacity(value: number): void {
    this.blobXyz?.setOpacity(value)
  }

  /**
   * Randomize avatar appearance
   */
  randomize(): void {
    if (this.currentRenderer === 'blob-xyz') {
      this.blobXyz?.setRandomBlob()
    } else if (this.currentRenderer === 'orbital-shards') {
      this.crystal?.setRandomOrbitalShards()
    } else if (this.currentRenderer === 'particles') {
      this.particles?.setRandomParticles()
    } else if (this.currentRenderer === 'crystal-ball') {
      this.crystalBall?.setRandomCrystalBall()
    }
  }

  /**
   * Set callback for conversation toggle (double-click)
   */
  onConversationToggle(callback: () => Promise<void>): void {
    if (this.blobXyz) {
      this.blobXyz.onConversationToggle = callback
    }
    if (this.crystal) {
      this.crystal.onConversationToggle = callback
    }
    if (this.particles) {
      this.particles.onConversationToggle = callback
    }
    if (this.crystalBall) {
      this.crystalBall.onConversationToggle = callback
    }
  }

  /**
   * Set callback for double-click
   */
  onDoubleClick(callback: () => void | Promise<void>): void {
    if (this.blobXyz) {
      this.blobXyz.onDoubleClick = callback
    }
    if (this.crystal) {
      this.crystal.onDoubleClick = callback
    }
    if (this.particles) {
      this.particles.onDoubleClick = callback
    }
    if (this.crystalBall) {
      this.crystalBall.onDoubleClick = callback
    }
  }

  /**
   * Connect a media stream for audio visualization
   */
  async connectMediaStream(stream: MediaStream): Promise<void> {
    await this.audio.connectMediaStream(stream)
  }

  /**
   * Disconnect the current media stream
   */
  disconnectMediaStream(): void {
    this.audio.disconnectMediaStream()
  }

  /**
   * Export avatar as GLTF file
   */
  exportGLTF(): void {
    if (this.currentRenderer === 'blob-xyz') {
      this.blobXyz?.exportGLTF()
    } else if (this.currentRenderer === 'orbital-shards') {
      this.crystal?.exportGLTF()
    } else if (this.currentRenderer === 'particles') {
      this.particles?.exportGLTF()
    } else if (this.currentRenderer === 'crystal-ball') {
      this.crystalBall?.exportGLTF()
    }
  }

  // ===========================================================================
  // ORBITAL-SHARDS-SPECIFIC METHODS (delegated to orbital shards renderer)
  // ===========================================================================

  /**
   * Set orbital shards formation (constellation, helix, vortex)
   */
  setFormation(selection: OrbitalShardsFormationSelection): void {
    this.crystal?.setFormation(selection)
  }

  /**
   * Set orbital shards colors (primary, secondary, accent)
   */
  setOrbitalShardsColors(primary: string, secondary: string, accent: string): void {
    this.crystal?.setOrbitalShardsColors(primary, secondary, accent)
  }

  /**
   * Set orbital shards core colors
   */
  setCoreColors(innerColor: string, outerColor: string): void {
    this.crystal?.setCoreColors(innerColor, outerColor)
  }

  /**
   * Set orbital shards glow intensity
   */
  setGlowIntensity(intensity: number): void {
    this.crystal?.setGlowIntensity(intensity)
  }

  /**
   * Set orbital shards shard count
   */
  setShardCount(count: number): void {
    this.crystal?.setShardCount(count)
  }

  /**
   * Set orbital shards audio reactivity
   */
  setAudioReactivity(value: number): void {
    this.crystal?.setAudioReactivity(value)
  }

  /**
   * Cleanup and dispose all resources
   */
  dispose(): void {
    this.resizeObserver?.disconnect()
    this.blobXyz?.dispose()
    this.crystal?.dispose()
    this.particles?.dispose()
    this.crystalBall?.dispose()
    this.audio.dispose()
    this.scene.dispose()
  }

  // ===========================================================================
  // CRYSTAL-BALL-SPECIFIC METHODS (delegated to crystal ball renderer)
  // ===========================================================================

  /**
   * Set crystal ball style
   */
  setCrystalBallStyle(selection: CrystalBallStyleSelection): void {
    this.crystalBall?.setStyle(selection)
  }

  /**
   * Set crystal ball colors (primary, secondary)
   */
  setCrystalBallColors(primary: string, secondary: string): void {
    this.crystalBall?.setColors(primary, secondary)
  }
}
