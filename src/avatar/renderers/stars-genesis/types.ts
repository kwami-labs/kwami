import type { Scene, PerspectiveCamera, WebGLRenderer } from 'three'
import type { KwamiAudio } from '../../audio/KwamiAudio'

// =============================================================================
// STARS GENESIS TYPES
// =============================================================================

/**
 * A single star in the simulation
 */
export interface StarData {
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
  /** Star properties */
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
 * Physics configuration for stars
 */
export interface StarsGenesisPhysicsConfig {
  /** How fast stars return to formation (0-1) */
  returnForce: number
  /** Friction/damping (0-1) */
  damping: number
  /** Explosion force on click */
  explosionForce: number
  /** Explosion radius */
  explosionRadius: number
  /** How fast the leader moves */
  leaderSpeed: number
  /** Delay between stars following the leader */
  followDelay: number
  /** Mouse influence radius */
  mouseInfluence: number
  /** Mouse repulsion strength */
  mouseRepulsion: number
}

/**
 * Visual configuration for stars
 */
export interface StarsGenesisVisualConfig {
  /** Base star color */
  color: string
  /** Secondary/glow color */
  glowColor: string
  /** Star size (base) */
  starSize: number
  /** Size variation range */
  sizeVariation: number
  /** Opacity (0-1) */
  opacity: number
  /** Glow intensity */
  glowIntensity: number
  /** Brightness variation */
  brightnessVariation: number
  /** Star sharpness (0=soft, 1=sharp) */
  sharpness: number
}

/**
 * Formation configuration
 */
export interface StarsGenesisFormationConfig {
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
export interface StarsGenesisAnimationConfig {
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
  /** Wave animation through stars */
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
export interface StarsGenesisAudioEffects {
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
 * Stars Genesis configuration options
 */
export interface StarsGenesisConfig {
  /** Number of stars */
  starCount?: number
  /** Physics parameters */
  physics?: Partial<StarsGenesisPhysicsConfig>
  /** Visual parameters */
  visual?: Partial<StarsGenesisVisualConfig>
  /** Formation parameters */
  formation?: Partial<StarsGenesisFormationConfig>
  /** Animation parameters */
  animation?: Partial<StarsGenesisAnimationConfig>
  /** Audio effects */
  audioEffects?: Partial<StarsGenesisAudioEffects>
  /** Base scale */
  scale?: number
  /** Transition duration for smooth changes (ms) */
  transitionDuration?: number
}

/**
 * Stars Genesis constructor options
 */
export interface StarsGenesisOptions {
  scene: Scene
  camera: PerspectiveCamera
  renderer: WebGLRenderer
  audio: KwamiAudio

  starCount?: number
  physics?: Partial<StarsGenesisPhysicsConfig>
  visual?: Partial<StarsGenesisVisualConfig>
  formation?: Partial<StarsGenesisFormationConfig>
  animation?: Partial<StarsGenesisAnimationConfig>
  audioEffects?: Partial<StarsGenesisAudioEffects>
  scale?: number
  transitionDuration?: number
  onAfterRender?: () => void
}

/**
 * State for animation
 */
export type StarsGenesisState = 'idle' | 'exploding' | 'reforming' | 'following'
