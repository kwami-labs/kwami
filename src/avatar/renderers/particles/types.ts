import type { Scene, PerspectiveCamera, WebGLRenderer } from 'three'
import type { KwamiAudio } from '../../audio/KwamiAudio'

// =============================================================================
// PARTICLES TYPES
// =============================================================================

/**
 * A single particle in the simulation
 */
export interface ParticleData {
  /** Current position */
  x: number
  y: number
  z: number
  /** Velocity */
  vx: number
  vy: number
  vz: number
  /** Original/target position (for reformation) */
  targetX: number
  targetY: number
  targetZ: number
  /** Particle properties */
  size: number
  brightness: number
  /** Delay for follow-the-leader effect */
  delay: number
  /** Index in the chain */
  chainIndex: number
  /** Phase offset for individual animation */
  phase: number
}

/**
 * Physics configuration for particles
 */
export interface ParticlesPhysicsConfig {
  /** How fast particles return to formation (0-1) */
  returnForce: number
  /** Friction/damping (0-1) */
  damping: number
  /** Explosion force on click */
  explosionForce: number
  /** Explosion radius */
  explosionRadius: number
  /** How fast the leader moves */
  leaderSpeed: number
  /** Delay between particles following the leader */
  followDelay: number
  /** Mouse influence radius */
  mouseInfluence: number
  /** Mouse repulsion strength */
  mouseRepulsion: number
}

/**
 * Visual configuration for particles
 */
export interface ParticlesVisualConfig {
  /** Base particle color */
  color: string
  /** Secondary/glow color */
  glowColor: string
  /** Particle size (base) */
  particleSize: number
  /** Size variation range */
  sizeVariation: number
  /** Opacity (0-1) */
  opacity: number
  /** Glow intensity */
  glowIntensity: number
  /** Brightness variation */
  brightnessVariation: number
  /** Particle sharpness (0=soft, 1=sharp) */
  sharpness: number
}

/**
 * Formation configuration
 */
export interface ParticlesFormationConfig {
  /** Formation type */
  type: 'sphere' | 'disc' | 'ring' | 'cube'
  /** Radius of the formation */
  radius: number
  /** Density distribution */
  density: 'uniform' | 'center-heavy' | 'edge-heavy'
  /** Noise amount for organic look */
  noise: number
}

/**
 * Idle animation configuration
 */
export interface ParticlesAnimationConfig {
  /** Enable idle animations */
  enabled: boolean
  /** Breathing/pulse animation */
  breathing: {
    enabled: boolean
    speed: number
    intensity: number
  }
  /** Floating/hovering animation */
  floating: {
    enabled: boolean
    speed: number
    amplitude: number
  }
  /** Auto rotation */
  rotation: {
    enabled: boolean
    speedX: number
    speedY: number
    speedZ: number
  }
  /** Wave animation through particles */
  wave: {
    enabled: boolean
    speed: number
    amplitude: number
  }
  /** Turbulence/noise */
  turbulence: {
    enabled: boolean
    intensity: number
    speed: number
  }
}

/**
 * Audio reactivity configuration
 */
export interface ParticlesAudioEffects {
  /** Enable audio reactivity */
  enabled: boolean
  /** Overall reactivity multiplier (0-3) */
  reactivity: number
  /** Bass frequency influence on size */
  bassInfluence: number
  /** Mid frequency influence on brightness */
  midInfluence: number
  /** High frequency influence on movement */
  highInfluence: number
  /** Smoothing factor */
  smoothing: number
  /** Scale pulse with bass */
  scalePulse: boolean
  /** Movement intensity from audio */
  movementIntensity: number
}

/**
 * Particles configuration options
 */
export interface ParticlesConfig {
  /** Number of particles */
  particleCount?: number
  /** Physics parameters */
  physics?: Partial<ParticlesPhysicsConfig>
  /** Visual parameters */
  visual?: Partial<ParticlesVisualConfig>
  /** Formation parameters */
  formation?: Partial<ParticlesFormationConfig>
  /** Animation parameters */
  animation?: Partial<ParticlesAnimationConfig>
  /** Audio effects */
  audioEffects?: Partial<ParticlesAudioEffects>
  /** Base scale */
  scale?: number
  /** Transition duration for smooth changes (ms) */
  transitionDuration?: number
}

/**
 * Particles constructor options
 */
export interface ParticlesOptions {
  scene: Scene
  camera: PerspectiveCamera
  renderer: WebGLRenderer
  audio: KwamiAudio

  particleCount?: number
  physics?: Partial<ParticlesPhysicsConfig>
  visual?: Partial<ParticlesVisualConfig>
  formation?: Partial<ParticlesFormationConfig>
  animation?: Partial<ParticlesAnimationConfig>
  audioEffects?: Partial<ParticlesAudioEffects>
  scale?: number
  transitionDuration?: number
  onAfterRender?: () => void
}

/**
 * State for animation
 */
export type ParticlesState = 'idle' | 'exploding' | 'reforming' | 'following'
