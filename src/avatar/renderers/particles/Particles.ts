import * as THREE from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import type { KwamiAudio } from '../../audio/KwamiAudio'
import type {
  ParticlesOptions,
  ParticleData,
  ParticlesPhysicsConfig,
  ParticlesVisualConfig,
  ParticlesFormationConfig,
  ParticlesAnimationConfig,
  ParticlesAudioEffects,
} from './types'
import {
  defaultParticlesPhysics,
  defaultParticlesVisual,
  defaultParticlesFormation,
  defaultParticlesAnimation,
  defaultParticlesAudioEffects,
  defaultParticlesConfig,
} from './config'
import vertexShader from './shaders/particle.vertex.glsl?raw'
import fragmentShader from './shaders/particle.fragment.glsl?raw'
import { logger } from '../../../utils/logger'

// =============================================================================
// PARTICLES RENDERER
// =============================================================================

// Helper for deep merging animation config
function mergeAnimationConfig(
  defaults: ParticlesAnimationConfig,
  overrides?: Partial<ParticlesAnimationConfig>
): ParticlesAnimationConfig {
  if (!overrides) return { ...defaults }
  return {
    enabled: overrides.enabled ?? defaults.enabled,
    breathing: { ...defaults.breathing, ...overrides.breathing },
    floating: { ...defaults.floating, ...overrides.floating },
    rotation: { ...defaults.rotation, ...overrides.rotation },
    wave: { ...defaults.wave, ...overrides.wave },
    turbulence: { ...defaults.turbulence, ...overrides.turbulence },
  }
}

export class Particles {
  // Three.js components
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private audio: KwamiAudio

  // Particle system
  private particles: ParticleData[] = []
  private geometry!: THREE.BufferGeometry
  private material!: THREE.ShaderMaterial
  private points!: THREE.Points
  private group: THREE.Group

  // Configuration
  private particleCount: number
  private physics: ParticlesPhysicsConfig
  private visual: ParticlesVisualConfig
  private formation: ParticlesFormationConfig
  private animation: ParticlesAnimationConfig
  private audioEffects: ParticlesAudioEffects
  private scale: number
  private transitionDuration: number

  // Animation state
  private animationFrameId: number | null = null
  private time = 0
  private explosionProgress = 0
  private smoothedAudioLevel = 0
  private lastFrameTime = 0

  // Smooth transition state
  private targetFormation: ParticleData[] = []
  private isTransitioning = false
  private transitionProgress = 0

  // Leader/follow system
  private leaderPosition = new THREE.Vector3(0, 0, 0)
  private leaderTarget = new THREE.Vector3(0, 0, 0)
  private leaderAngle = 0
  private leaderRadius = 0.3
  private isFollowing = false

  // Mouse interaction
  private mouse = new THREE.Vector2(9999, 9999)
  private mouseWorld = new THREE.Vector3()
  private raycaster = new THREE.Raycaster()
  private isExploding = false
  private explosionCenter = new THREE.Vector3()

  // State tracking
  private disposed = false

  // Callback for after render
  private onAfterRender?: () => void

  // Click handlers
  public onConversationToggle: (() => Promise<void>) | null = null
  public onDoubleClick: (() => void | Promise<void>) | null = null

  // Event handlers (bound references for cleanup)
  private boundOnClick: (e: MouseEvent) => void
  private boundOnDoubleClick: (e: MouseEvent) => void
  private boundOnMouseMove: (e: MouseEvent) => void
  private boundOnMouseLeave: () => void

  constructor(options: ParticlesOptions) {
    this.scene = options.scene
    this.camera = options.camera
    this.renderer = options.renderer
    this.audio = options.audio
    this.onAfterRender = options.onAfterRender

    // Merge configs with defaults
    this.particleCount = options.particleCount ?? defaultParticlesConfig.particleCount
    this.physics = { ...defaultParticlesPhysics, ...options.physics }
    this.visual = { ...defaultParticlesVisual, ...options.visual }
    this.formation = { ...defaultParticlesFormation, ...options.formation }
    this.animation = mergeAnimationConfig(defaultParticlesAnimation, options.animation)
    this.audioEffects = { ...defaultParticlesAudioEffects, ...options.audioEffects }
    this.scale = options.scale ?? defaultParticlesConfig.scale
    this.transitionDuration = options.transitionDuration ?? defaultParticlesConfig.transitionDuration

    // Create container group
    this.group = new THREE.Group()
    this.group.name = 'particles-avatar'

    // Initialize particles
    this.initParticles()
    this.createGeometry()
    this.createMaterial()
    this.createPoints()

    // Bind event handlers
    this.boundOnClick = this.handleClick.bind(this)
    this.boundOnDoubleClick = this.handleDoubleClick.bind(this)
    this.boundOnMouseMove = this.handleMouseMove.bind(this)
    this.boundOnMouseLeave = this.handleMouseLeave.bind(this)

    // Start animation
    this.lastFrameTime = performance.now()
    this.animate()

    logger.info('Particles renderer initialized', { particleCount: this.particleCount })
  }

  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================

  private initParticles(): void {
    this.particles = []
    const formationRadius = this.formation.radius * this.scale

    for (let i = 0; i < this.particleCount; i++) {
      // Generate position based on formation type
      const pos = this.generateFormationPosition(formationRadius, i)
      
      // Add noise for organic look
      pos.x += (Math.random() - 0.5) * this.formation.noise * formationRadius
      pos.y += (Math.random() - 0.5) * this.formation.noise * formationRadius
      pos.z += (Math.random() - 0.5) * this.formation.noise * formationRadius

      // Calculate chain index based on distance from center for follow effect
      const distFromCenter = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z)
      const chainIndex = Math.floor((distFromCenter / formationRadius) * 100)

      this.particles.push({
        x: pos.x,
        y: pos.y,
        z: pos.z,
        vx: 0,
        vy: 0,
        vz: 0,
        targetX: pos.x,
        targetY: pos.y,
        targetZ: pos.z,
        size: 1 + (Math.random() - 0.5) * this.visual.sizeVariation,
        brightness: 1 - Math.random() * this.visual.brightnessVariation,
        delay: chainIndex * this.physics.followDelay,
        chainIndex,
        phase: Math.random() * Math.PI * 2, // Random phase for individual animation
      })
    }
  }

  private generateFormationPosition(radius: number, index: number): THREE.Vector3 {
    const pos = new THREE.Vector3()

    switch (this.formation.type) {
      case 'sphere': {
        // Fibonacci sphere distribution for even coverage
        const phi = Math.acos(1 - 2 * (index + 0.5) / this.particleCount)
        const theta = Math.PI * (1 + Math.sqrt(5)) * index
        
        let r = radius
        if (this.formation.density === 'center-heavy') {
          r *= Math.pow(Math.random(), 0.5)
        } else if (this.formation.density === 'edge-heavy') {
          r *= 0.7 + Math.random() * 0.3
        } else {
          r *= Math.cbrt(Math.random())
        }
        
        pos.x = r * Math.sin(phi) * Math.cos(theta)
        pos.y = r * Math.sin(phi) * Math.sin(theta)
        pos.z = r * Math.cos(phi)
        break
      }

      case 'disc': {
        const angle = Math.random() * Math.PI * 2
        let r = radius * Math.sqrt(Math.random())
        if (this.formation.density === 'center-heavy') {
          r = radius * Math.pow(Math.random(), 0.7)
        }
        pos.x = Math.cos(angle) * r
        pos.y = Math.sin(angle) * r
        pos.z = (Math.random() - 0.5) * radius * 0.15
        break
      }

      case 'ring': {
        const angle = (index / this.particleCount) * Math.PI * 2
        const ringRadius = radius * (0.8 + Math.random() * 0.4)
        pos.x = Math.cos(angle) * ringRadius
        pos.y = Math.sin(angle) * ringRadius
        pos.z = (Math.random() - 0.5) * radius * 0.25
        break
      }

      case 'cube': {
        pos.x = (Math.random() - 0.5) * radius * 2
        pos.y = (Math.random() - 0.5) * radius * 2
        pos.z = (Math.random() - 0.5) * radius * 2
        break
      }
    }

    return pos
  }

  private createGeometry(): void {
    this.geometry = new THREE.BufferGeometry()
    
    const positions = new Float32Array(this.particleCount * 3)
    const sizes = new Float32Array(this.particleCount)
    const brightnesses = new Float32Array(this.particleCount)
    const delays = new Float32Array(this.particleCount)
    const phases = new Float32Array(this.particleCount)

    for (let i = 0; i < this.particleCount; i++) {
      const p = this.particles[i]
      positions[i * 3] = p.x
      positions[i * 3 + 1] = p.y
      positions[i * 3 + 2] = p.z
      sizes[i] = p.size
      brightnesses[i] = p.brightness
      delays[i] = p.delay
      phases[i] = p.phase
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    this.geometry.setAttribute('aBrightness', new THREE.BufferAttribute(brightnesses, 1))
    this.geometry.setAttribute('aDelay', new THREE.BufferAttribute(delays, 1))
    this.geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  }

  private createMaterial(): void {
    const color = new THREE.Color(this.visual.color)
    const glowColor = new THREE.Color(this.visual.glowColor)

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uBaseSize: { value: this.visual.particleSize * 50 },  // Adjusted multiplier
        uColor: { value: color },
        uGlowColor: { value: glowColor },
        uOpacity: { value: this.visual.opacity },
        uGlowIntensity: { value: this.visual.glowIntensity },
        uSharpness: { value: this.visual.sharpness },
        uAudioLevel: { value: 0 },
        uExplosionProgress: { value: 0 },
        uBreathingIntensity: { value: this.animation.breathing.intensity },
        uBreathingSpeed: { value: this.animation.breathing.speed },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }

  private createPoints(): void {
    this.points = new THREE.Points(this.geometry, this.material)
    this.group.add(this.points)
  }

  // ===========================================================================
  // ANIMATION
  // ===========================================================================

  private animate(): void {
    if (this.disposed) return

    this.animationFrameId = requestAnimationFrame(() => this.animate())
    
    const now = performance.now()
    const delta = Math.min((now - this.lastFrameTime) / 1000, 0.1) // Cap delta to prevent jumps
    this.lastFrameTime = now
    this.time += delta

    // Update audio level
    this.updateAudioLevel()

    // Apply idle animations
    this.applyIdleAnimations(delta)

    // Update leader position for follow effect
    this.updateLeader(delta)

    // Update all particles
    this.updateParticles(delta)

    // Handle smooth transitions
    if (this.isTransitioning) {
      this.updateTransition(delta)
    }

    // Update geometry
    this.updateGeometry()

    // Update uniforms
    this.updateUniforms()

    // Render the scene
    this.renderer.render(this.scene, this.camera)

    // Call after render callback if provided
    this.onAfterRender?.()
  }

  private updateUniforms(): void {
    this.material.uniforms.uTime.value = this.time
    this.material.uniforms.uAudioLevel.value = this.smoothedAudioLevel
    this.material.uniforms.uExplosionProgress.value = this.explosionProgress
    
    // Update breathing uniforms
    if (this.animation.breathing.enabled) {
      this.material.uniforms.uBreathingIntensity.value = this.animation.breathing.intensity
      this.material.uniforms.uBreathingSpeed.value = this.animation.breathing.speed
    } else {
      this.material.uniforms.uBreathingIntensity.value = 0
    }
  }

  private applyIdleAnimations(delta: number): void {
    if (!this.animation.enabled) return

    // Auto rotation
    if (this.animation.rotation.enabled) {
      this.group.rotation.x += this.animation.rotation.speedX * delta
      this.group.rotation.y += this.animation.rotation.speedY * delta
      this.group.rotation.z += this.animation.rotation.speedZ * delta
    }

    // Floating animation affects the whole group
    if (this.animation.floating.enabled) {
      const floatY = Math.sin(this.time * this.animation.floating.speed) * this.animation.floating.amplitude
      this.group.position.y = floatY
    }
  }

  private updateAudioLevel(): void {
    if (!this.audioEffects.enabled) {
      this.smoothedAudioLevel = 0
      return
    }

    const audioData = this.audio.getFrequencyData()
    let level = 0

    if (audioData && audioData.length > 0) {
      // Extract frequency bands
      const bassEnd = Math.floor(audioData.length * 0.1)
      const midEnd = Math.floor(audioData.length * 0.5)
      
      let bass = 0, mid = 0, high = 0
      for (let i = 0; i < bassEnd; i++) bass += audioData[i]
      for (let i = bassEnd; i < midEnd; i++) mid += audioData[i]
      for (let i = midEnd; i < audioData.length; i++) high += audioData[i]
      
      // Normalize and apply influence - much stronger values
      bass = (bass / bassEnd / 255) * this.audioEffects.bassInfluence * 2
      mid = (mid / (midEnd - bassEnd) / 255) * this.audioEffects.midInfluence * 2
      high = (high / (audioData.length - midEnd) / 255) * this.audioEffects.highInfluence * 2
      
      level = (bass + mid + high) * this.audioEffects.reactivity
    }

    // Smooth the audio level with faster response
    const smoothFactor = 1 - this.audioEffects.smoothing
    this.smoothedAudioLevel += (level - this.smoothedAudioLevel) * smoothFactor
  }

  private updateLeader(delta: number): void {
    // Leader moves in a smooth pattern around the formation
    this.leaderAngle += this.physics.leaderSpeed * delta * 60

    // Create interesting movement patterns
    const baseRadius = this.leaderRadius * this.scale
    const wobble = Math.sin(this.time * 0.5) * 0.2

    this.leaderTarget.x = Math.cos(this.leaderAngle) * (baseRadius + wobble)
    this.leaderTarget.y = Math.sin(this.leaderAngle * 0.7) * (baseRadius + wobble)
    this.leaderTarget.z = Math.sin(this.leaderAngle * 0.3) * baseRadius * 0.5

    // Smooth leader movement
    this.leaderPosition.lerp(this.leaderTarget, 0.05)
  }

  private updateParticles(delta: number): void {
    const formationRadius = this.formation.radius * this.scale
    const deltaScale = delta * 60 // Normalize to 60fps

    for (let i = 0; i < this.particleCount; i++) {
      const p = this.particles[i]

      if (this.isExploding) {
        // Explosion: particles fly away from explosion center
        const dx = p.x - this.explosionCenter.x
        const dy = p.y - this.explosionCenter.y
        const dz = p.z - this.explosionCenter.z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.001

        if (dist < this.physics.explosionRadius * formationRadius) {
          const force = this.physics.explosionForce * (1 - dist / (this.physics.explosionRadius * formationRadius))
          p.vx += (dx / dist) * force * deltaScale * 0.1
          p.vy += (dy / dist) * force * deltaScale * 0.1
          p.vz += (dz / dist) * force * deltaScale * 0.1
        }

        // Decay explosion over time
        this.explosionProgress = Math.max(0, this.explosionProgress - delta * 0.8)
        if (this.explosionProgress <= 0) {
          this.isExploding = false
        }
      }

      // Return force towards target position
      const returnForce = this.physics.returnForce * (this.isExploding ? 0.1 : 1)
      
      // Calculate target with follow-the-leader offset
      let targetX = p.targetX
      let targetY = p.targetY
      let targetZ = p.targetZ

      if (this.isFollowing) {
        // Add leader influence based on chain index (delay)
        const leaderInfluence = Math.max(0, 1 - p.delay * 2)
        targetX += this.leaderPosition.x * leaderInfluence * 0.5
        targetY += this.leaderPosition.y * leaderInfluence * 0.5
        targetZ += this.leaderPosition.z * leaderInfluence * 0.5
      }

      // Apply return force
      p.vx += (targetX - p.x) * returnForce
      p.vy += (targetY - p.y) * returnForce
      p.vz += (targetZ - p.z) * returnForce

      // Mouse repulsion
      if (this.mouse.x < 9000) {
        const mdx = p.x - this.mouseWorld.x
        const mdy = p.y - this.mouseWorld.y
        const mdz = p.z - this.mouseWorld.z
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy + mdz * mdz) + 0.001

        if (mDist < this.physics.mouseInfluence) {
          const repulsion = this.physics.mouseRepulsion * (1 - mDist / this.physics.mouseInfluence)
          p.vx += (mdx / mDist) * repulsion * deltaScale * 0.5
          p.vy += (mdy / mDist) * repulsion * deltaScale * 0.5
          p.vz += (mdz / mDist) * repulsion * deltaScale * 0.5
        }
      }

      // Audio reactivity - add movement and scale pulse
      if (this.smoothedAudioLevel > 0.01 && this.audioEffects.enabled) {
        const audioMovement = this.smoothedAudioLevel * this.audioEffects.movementIntensity * 0.1
        p.vx += (Math.random() - 0.5) * audioMovement
        p.vy += (Math.random() - 0.5) * audioMovement
        p.vz += (Math.random() - 0.5) * audioMovement
      }

      // Turbulence animation
      if (this.animation.turbulence.enabled) {
        const turbulence = this.animation.turbulence.intensity
        const turbSpeed = this.animation.turbulence.speed
        p.vx += (Math.sin(this.time * turbSpeed + p.phase) - 0.5) * turbulence * deltaScale
        p.vy += (Math.cos(this.time * turbSpeed * 0.8 + p.phase * 1.3) - 0.5) * turbulence * deltaScale
        p.vz += (Math.sin(this.time * turbSpeed * 0.6 + p.phase * 1.7) - 0.5) * turbulence * deltaScale
      }

      // Wave animation
      if (this.animation.wave.enabled) {
        const waveOffset = p.chainIndex * 0.05
        const waveForce = Math.sin(this.time * this.animation.wave.speed - waveOffset) * this.animation.wave.amplitude
        p.vy += waveForce * deltaScale * 0.01
      }

      // Apply damping
      p.vx *= this.physics.damping
      p.vy *= this.physics.damping
      p.vz *= this.physics.damping

      // Update position
      p.x += p.vx * deltaScale
      p.y += p.vy * deltaScale
      p.z += p.vz * deltaScale
    }
  }

  private updateTransition(delta: number): void {
    this.transitionProgress += delta * 1000 / this.transitionDuration

    if (this.transitionProgress >= 1) {
      // Transition complete
      this.transitionProgress = 1
      this.isTransitioning = false
      
      // Snap to final positions
      for (let i = 0; i < this.particleCount; i++) {
        const target = this.targetFormation[i]
        const p = this.particles[i]
        p.targetX = target.targetX
        p.targetY = target.targetY
        p.targetZ = target.targetZ
      }
    } else {
      // Smooth easing
      const t = this.easeInOutCubic(this.transitionProgress)
      
      for (let i = 0; i < this.particleCount; i++) {
        const target = this.targetFormation[i]
        const p = this.particles[i]
        
        // Lerp target positions
        const currentTargetX = p.targetX
        const currentTargetY = p.targetY
        const currentTargetZ = p.targetZ
        
        p.targetX = currentTargetX + (target.targetX - currentTargetX) * t * delta * 5
        p.targetY = currentTargetY + (target.targetY - currentTargetY) * t * delta * 5
        p.targetZ = currentTargetZ + (target.targetZ - currentTargetZ) * t * delta * 5
      }
    }
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  private updateGeometry(): void {
    const positions = this.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < this.particleCount; i++) {
      const p = this.particles[i]
      positions[i * 3] = p.x
      positions[i * 3 + 1] = p.y
      positions[i * 3 + 2] = p.z
    }

    this.geometry.attributes.position.needsUpdate = true
  }

  // ===========================================================================
  // INTERACTION
  // ===========================================================================

  public enableClickInteraction(): void {
    const canvas = this.renderer.domElement
    canvas.addEventListener('click', this.boundOnClick)
    canvas.addEventListener('dblclick', this.boundOnDoubleClick)
    canvas.addEventListener('mousemove', this.boundOnMouseMove)
    canvas.addEventListener('mouseleave', this.boundOnMouseLeave)
  }

  public disableClickInteraction(): void {
    const canvas = this.renderer.domElement
    canvas.removeEventListener('click', this.boundOnClick)
    canvas.removeEventListener('dblclick', this.boundOnDoubleClick)
    canvas.removeEventListener('mousemove', this.boundOnMouseMove)
    canvas.removeEventListener('mouseleave', this.boundOnMouseLeave)
  }

  private handleClick(event: MouseEvent): void {
    // Get normalized device coordinates
    const rect = this.renderer.domElement.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // Set raycaster
    this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera)

    // Check if click is near the particle formation
    const intersects = this.raycaster.intersectObject(this.points)
    
    // Also check if clicking within the bounding sphere
    const center = new THREE.Vector3(0, 0, 0)
    const distanceToCenter = this.raycaster.ray.distanceToPoint(center)
    const clickNearFormation = distanceToCenter < this.formation.radius * this.scale * 1.5

    if (intersects.length > 0 || clickNearFormation) {
      this.triggerExplosion(x, y)
    }
  }

  private handleDoubleClick(_event: MouseEvent): void {
    if (this.onDoubleClick) {
      this.onDoubleClick()
    }
    if (this.onConversationToggle) {
      this.onConversationToggle()
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // Project mouse to world coordinates
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    this.raycaster.ray.intersectPlane(plane, this.mouseWorld)
  }

  private handleMouseLeave(): void {
    this.mouse.set(9999, 9999)
  }

  private triggerExplosion(x: number, y: number): void {
    // Calculate explosion center in world space
    this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera)
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    this.raycaster.ray.intersectPlane(plane, this.explosionCenter)

    this.isExploding = true
    this.explosionProgress = 1

    logger.debug('Particles explosion triggered')
  }

  // ===========================================================================
  // PUBLIC API
  // ===========================================================================

  public getMesh(): THREE.Group {
    return this.group
  }

  public startListening(): void {
    this.isFollowing = true
    logger.debug('Particles: listening started')
  }

  public stopListening(): void {
    this.isFollowing = false
    logger.debug('Particles: listening stopped')
  }

  public startThinking(): void {
    // Increase leader movement speed while thinking
    this.physics.leaderSpeed = defaultParticlesPhysics.leaderSpeed * 2.5
    this.isFollowing = true
    logger.debug('Particles: thinking started')
  }

  public stopThinking(): void {
    this.physics.leaderSpeed = defaultParticlesPhysics.leaderSpeed
    this.isFollowing = false
    logger.debug('Particles: thinking stopped')
  }

  public setScale(scale: number): void {
    this.scale = scale
    this.group.scale.setScalar(scale)
  }

  public setColors(primary: string, glow?: string): void {
    this.visual.color = primary
    if (glow) this.visual.glowColor = glow
    
    this.material.uniforms.uColor.value = new THREE.Color(primary)
    if (glow) {
      this.material.uniforms.uGlowColor.value = new THREE.Color(glow)
    }
  }

  public setOpacity(opacity: number): void {
    this.visual.opacity = opacity
    this.material.uniforms.uOpacity.value = opacity
  }

  public setParticleSize(size: number): void {
    this.visual.particleSize = size
    this.material.uniforms.uBaseSize.value = size * 50
  }

  public setGlowIntensity(intensity: number): void {
    this.visual.glowIntensity = intensity
    this.material.uniforms.uGlowIntensity.value = intensity
  }

  public setSharpness(sharpness: number): void {
    this.visual.sharpness = sharpness
    this.material.uniforms.uSharpness.value = sharpness
  }

  public setFormation(type: 'sphere' | 'disc' | 'ring' | 'cube', smooth = true): void {
    if (this.formation.type === type) return
    
    this.formation.type = type
    
    if (smooth) {
      // Generate new target positions
      this.generateTargetFormation()
      this.isTransitioning = true
      this.transitionProgress = 0
    } else {
      this.initParticles()
      this.updateGeometryFromParticles()
    }
  }

  private generateTargetFormation(): void {
    this.targetFormation = []
    const formationRadius = this.formation.radius * this.scale

    for (let i = 0; i < this.particleCount; i++) {
      const pos = this.generateFormationPosition(formationRadius, i)
      
      // Add noise
      pos.x += (Math.random() - 0.5) * this.formation.noise * formationRadius
      pos.y += (Math.random() - 0.5) * this.formation.noise * formationRadius
      pos.z += (Math.random() - 0.5) * this.formation.noise * formationRadius

      const distFromCenter = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z)
      const chainIndex = Math.floor((distFromCenter / formationRadius) * 100)

      this.targetFormation.push({
        ...this.particles[i],
        targetX: pos.x,
        targetY: pos.y,
        targetZ: pos.z,
        chainIndex,
        delay: chainIndex * this.physics.followDelay,
      })
    }
  }

  public setPhysics(physics: Partial<ParticlesPhysicsConfig>): void {
    this.physics = { ...this.physics, ...physics }
  }

  public setAnimation(animation: Partial<ParticlesAnimationConfig>): void {
    this.animation = mergeAnimationConfig(this.animation, animation)
  }

  public setAudioEffects(effects: Partial<ParticlesAudioEffects>): void {
    this.audioEffects = { ...this.audioEffects, ...effects }
  }

  public setAudioReactivity(value: number): void {
    this.audioEffects.reactivity = value
  }

  public toggleFollowMode(enabled: boolean): void {
    this.isFollowing = enabled
  }

  public setRandomParticles(): void {
    // Randomize colors
    const hue = Math.random() * 360
    const primary = `hsl(${hue}, 80%, 70%)`
    const glow = `hsl(${(hue + 30) % 360}, 90%, 60%)`
    this.setColors(primary, glow)

    // Randomize formation
    const formations: Array<'sphere' | 'disc' | 'ring' | 'cube'> = ['sphere', 'disc', 'ring', 'cube']
    this.setFormation(formations[Math.floor(Math.random() * formations.length)])

    // Randomize particle size
    this.setParticleSize(0.4 + Math.random() * 0.8)

    logger.debug('Particles randomized')
  }

  private updateGeometryFromParticles(): void {
    const positions = this.geometry.attributes.position.array as Float32Array
    const sizes = this.geometry.attributes.aSize.array as Float32Array
    const brightnesses = this.geometry.attributes.aBrightness.array as Float32Array
    const delays = this.geometry.attributes.aDelay.array as Float32Array
    const phases = this.geometry.attributes.aPhase.array as Float32Array

    for (let i = 0; i < this.particleCount; i++) {
      const p = this.particles[i]
      positions[i * 3] = p.x
      positions[i * 3 + 1] = p.y
      positions[i * 3 + 2] = p.z
      sizes[i] = p.size
      brightnesses[i] = p.brightness
      delays[i] = p.delay
      phases[i] = p.phase
    }

    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.aSize.needsUpdate = true
    this.geometry.attributes.aBrightness.needsUpdate = true
    this.geometry.attributes.aDelay.needsUpdate = true
    this.geometry.attributes.aPhase.needsUpdate = true
  }

  // Getters for current state
  public getVisual(): ParticlesVisualConfig {
    return { ...this.visual }
  }

  public getPhysics(): ParticlesPhysicsConfig {
    return { ...this.physics }
  }

  public getAnimation(): ParticlesAnimationConfig {
    return JSON.parse(JSON.stringify(this.animation))
  }

  public getAudioEffects(): ParticlesAudioEffects {
    return { ...this.audioEffects }
  }

  public getFormation(): ParticlesFormationConfig {
    return { ...this.formation }
  }

  public exportGLTF(): void {
    const exporter = new GLTFExporter()
    exporter.parse(
      this.group,
      (gltf) => {
        const output = JSON.stringify(gltf, null, 2)
        const blob = new Blob([output], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'particles-avatar.gltf'
        link.click()
        URL.revokeObjectURL(url)
      },
      (error) => {
        logger.error('GLTF export failed:', error)
      }
    )
  }

  public dispose(): void {
    this.disposed = true

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
    }

    this.disableClickInteraction()
    this.geometry.dispose()
    this.material.dispose()
    this.group.clear()

    logger.info('Particles renderer disposed')
  }
}
