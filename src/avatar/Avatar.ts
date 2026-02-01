import type { AvatarConfig, KwamiState, CrystalFormationSelection } from '../types'
import type { BlobSkinSelection } from './renderers/blob/types'
import { Scene } from './scene'
import { Blob } from './renderers/blob'
import { Crystal } from './renderers/crystal'
import { Particles } from './renderers/particles'
import { KwamiAudio } from './audio'
import { logger } from '../utils/logger'

/**
 * Avatar - Manages the visual representation of Kwami
 * 
 * Supports different renderers (blob, crystal, future: humanoid, etc.)
 * The blob is the default renderer; crystal is a new geometric alternative.
 */
export class Avatar {
  private canvas: HTMLCanvasElement
  private config: AvatarConfig
  private scene: Scene
  private blob: Blob | null = null
  private crystal: Crystal | null = null
  private particles: Particles | null = null
  private audio: KwamiAudio
  private currentState: KwamiState = 'idle'
  private resizeObserver: ResizeObserver | null = null
  private currentRenderer: 'blob' | 'crystal' | 'particles' = 'blob'

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
    const rendererType = this.config.renderer ?? 'blob'
    
    if (rendererType === 'blob') {
      this.currentRenderer = 'blob'
      this.initBlobRenderer()
    } else if (rendererType === 'crystal') {
      this.currentRenderer = 'crystal'
      this.initCrystalRenderer()
    } else if (rendererType === 'particles') {
      this.currentRenderer = 'particles'
      this.initParticlesRenderer()
    } else {
      // Future: Support other renderer types
      logger.warn(`Renderer type "${rendererType}" not supported, falling back to blob`)
      this.currentRenderer = 'blob'
      this.initBlobRenderer()
    }
  }

  private initBlobRenderer(): void {
    const blobConfig = this.config.blob ?? {}
    
    this.blob = new Blob({
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
    this.scene.scene.add(this.blob.getMesh())

    // Apply initial position if provided
    if (blobConfig.position) {
      this.blob.position.set(blobConfig.position.x, blobConfig.position.y)
    }

    // Enable click interaction by default
    this.blob.enableClickInteraction()
  }

  private initCrystalRenderer(): void {
    const crystalConfig = this.config.crystal ?? {}
    
    this.crystal = new Crystal({
      scene: this.scene.scene,
      camera: this.scene.camera,
      renderer: this.scene.renderer,
      audio: this.audio,
      formation: crystalConfig.formation,
      shards: crystalConfig.shards,
      core: crystalConfig.core,
      colors: crystalConfig.colors,
      audioEffects: crystalConfig.audioEffects,
      particleCount: crystalConfig.particleCount,
      scale: crystalConfig.scale,
      rotation: crystalConfig.rotation,
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

  private setupResizeHandling(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          this.scene.resize(width, height)
          // Only blob has position management; crystal is centered
          if (this.currentRenderer === 'blob') {
            this.blob?.position.refresh()
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
    if (this.currentRenderer === 'blob' && this.blob) {
      switch (state) {
        case 'idle':
          if (previousState === 'listening') this.blob.stopListening()
          if (previousState === 'thinking') this.blob.stopThinking()
          break
        case 'listening':
          this.blob.startListening()
          break
        case 'thinking':
          this.blob.startThinking()
          break
        case 'speaking':
          // Speaking state is driven by audio automatically
          break
      }
    }
    
    // Handle state for crystal renderer
    if (this.currentRenderer === 'crystal' && this.crystal) {
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
  getRendererType(): 'blob' | 'crystal' | 'particles' {
    return this.currentRenderer
  }

  /**
   * Switch to a different renderer type dynamically
   * Preserves the connection and state
   */
  switchRenderer(newRenderer: 'blob' | 'crystal' | 'particles'): void {
    if (this.currentRenderer === newRenderer) {
      logger.debug(`Already using ${newRenderer} renderer`)
      return
    }

    logger.info(`Switching renderer from ${this.currentRenderer} to ${newRenderer}`)

    // Save current state
    const savedState = this.currentState

    // Dispose current renderer
    if (this.currentRenderer === 'blob' && this.blob) {
      this.scene.scene.remove(this.blob.getMesh())
      this.blob.dispose()
      this.blob = null
    } else if (this.currentRenderer === 'crystal' && this.crystal) {
      this.scene.scene.remove(this.crystal.getMesh())
      this.crystal.dispose()
      this.crystal = null
    } else if (this.currentRenderer === 'particles' && this.particles) {
      this.scene.scene.remove(this.particles.getMesh())
      this.particles.dispose()
      this.particles = null
    }

    // Initialize new renderer
    this.currentRenderer = newRenderer
    if (newRenderer === 'blob') {
      this.initBlobRenderer()
    } else if (newRenderer === 'crystal') {
      this.initCrystalRenderer()
    } else if (newRenderer === 'particles') {
      this.initParticlesRenderer()
    }

    // Restore state
    this.currentState = 'idle' // Reset first
    this.setState(savedState)

    // Update background gradient for the new renderer
    let newColors: string[]
    if (newRenderer === 'crystal') {
      newColors = ['#050510', '#0a0a20', '#050510']
    } else if (newRenderer === 'particles') {
      newColors = ['#000000', '#0a0a15', '#000000']
    } else {
      newColors = ['#0a0a1a', '#1a1a3a', '#0a0a1a']
    }
    this.scene.setBackground({ type: 'gradient', gradient: { colors: newColors, direction: 'radial' } })

    logger.info(`Renderer switched to ${newRenderer}`)
  }

  /**
   * Get the blob instance (for direct control)
   */
  getBlob(): Blob | null {
    return this.blob
  }

  /**
   * Get the crystal instance (for direct control)
   */
  getCrystal(): Crystal | null {
    return this.crystal
  }

  /**
   * Get the particles instance (for direct control)
   */
  getParticles(): Particles | null {
    return this.particles
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
    this.blob?.setColors(x, y, z)
  }

  /**
   * Set blob skin
   */
  setSkin(selection: BlobSkinSelection): void {
    this.blob?.setSkin(selection)
  }

  /**
   * Set blob scale
   */
  setScale(scale: number): void {
    this.blob?.setScale(scale)
  }

  /**
   * Set blob spikes (noise frequency)
   */
  setSpikes(x: number, y: number, z: number): void {
    this.blob?.setSpikes(x, y, z)
  }

  /**
   * Set blob position (normalized 0-1)
   */
  setPosition(x: number, y: number): void {
    this.blob?.position.set(x, y)
  }

  /**
   * Set blob rotation speed
   */
  setRotation(x: number, y: number, z: number): void {
    this.blob?.setRotation(x, y, z)
  }

  /**
   * Set blob shininess
   */
  setShininess(value: number): void {
    this.blob?.setShininess(value)
  }

  /**
   * Set blob wireframe mode
   */
  setWireframe(enabled: boolean): void {
    this.blob?.setWireframe(enabled)
  }

  /**
   * Set blob opacity
   */
  setOpacity(value: number): void {
    this.blob?.setOpacity(value)
  }

  /**
   * Randomize avatar appearance
   */
  randomize(): void {
    if (this.currentRenderer === 'blob') {
      this.blob?.setRandomBlob()
    } else if (this.currentRenderer === 'crystal') {
      this.crystal?.setRandomCrystal()
    } else if (this.currentRenderer === 'particles') {
      this.particles?.setRandomParticles()
    }
  }

  /**
   * Set callback for conversation toggle (double-click)
   */
  onConversationToggle(callback: () => Promise<void>): void {
    if (this.blob) {
      this.blob.onConversationToggle = callback
    }
    if (this.crystal) {
      this.crystal.onConversationToggle = callback
    }
    if (this.particles) {
      this.particles.onConversationToggle = callback
    }
  }

  /**
   * Set callback for double-click
   */
  onDoubleClick(callback: () => void | Promise<void>): void {
    if (this.blob) {
      this.blob.onDoubleClick = callback
    }
    if (this.crystal) {
      this.crystal.onDoubleClick = callback
    }
    if (this.particles) {
      this.particles.onDoubleClick = callback
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
    if (this.currentRenderer === 'blob') {
      this.blob?.exportGLTF()
    } else if (this.currentRenderer === 'crystal') {
      this.crystal?.exportGLTF()
    } else if (this.currentRenderer === 'particles') {
      this.particles?.exportGLTF()
    }
  }

  // ===========================================================================
  // CRYSTAL-SPECIFIC METHODS (delegated to crystal renderer)
  // ===========================================================================

  /**
   * Set crystal formation (constellation, helix, vortex)
   */
  setFormation(selection: CrystalFormationSelection): void {
    this.crystal?.setFormation(selection)
  }

  /**
   * Set crystal colors (primary, secondary, accent)
   */
  setCrystalColors(primary: string, secondary: string, accent: string): void {
    this.crystal?.setColors(primary, secondary, accent)
  }

  /**
   * Set crystal core colors
   */
  setCoreColors(innerColor: string, outerColor: string): void {
    this.crystal?.setCoreColors(innerColor, outerColor)
  }

  /**
   * Set crystal glow intensity
   */
  setGlowIntensity(intensity: number): void {
    this.crystal?.setGlowIntensity(intensity)
  }

  /**
   * Set crystal shard count
   */
  setShardCount(count: number): void {
    this.crystal?.setShardCount(count)
  }

  /**
   * Set crystal audio reactivity
   */
  setAudioReactivity(value: number): void {
    this.crystal?.setAudioReactivity(value)
  }

  /**
   * Cleanup and dispose all resources
   */
  dispose(): void {
    this.resizeObserver?.disconnect()
    this.blob?.dispose()
    this.crystal?.dispose()
    this.particles?.dispose()
    this.audio.dispose()
    this.scene.dispose()
  }
}
