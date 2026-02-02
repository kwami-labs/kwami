import type { Scene, PerspectiveCamera, WebGLRenderer } from 'three'
import type { KwamiAudio } from '../../audio/KwamiAudio'

// =============================================================================
// CRYSTAL BALL TYPES
// =============================================================================

/**
 * Crystal ball style - different visual presets
 */
export type CrystalBallStyle = 'mystical' | 'nebula' | 'earth' | 'fire' | 'ocean'

/**
 * Crystal ball style selection
 */
export interface CrystalBallStyleSelection {
  style: CrystalBallStyle
}

/**
 * Volume configuration for the raymarching effect
 */
export interface VolumeConfig {
  /** Number of raymarching iterations (higher = more detail, more expensive) */
  iterations: number
  /** Maximum depth into the sphere (0-1) */
  depth: number
  /** Smoothing factor between layers */
  smoothing: number
  /** Noise scale for the heightmap */
  noiseScale: number
  /** Noise octaves for detail */
  noiseOctaves: number
}

/**
 * Animation configuration
 */
export interface CrystalBallAnimationConfig {
  /** Displacement animation speed */
  displacementSpeed: number
  /** Displacement strength */
  displacementStrength: number
  /** Base rotation speed */
  rotationSpeed: { x: number; y: number; z: number }
  /** Pulse speed for breathing effect */
  pulseSpeed: number
  /** Pulse intensity */
  pulseIntensity: number
}

/**
 * Crystal ball audio effects configuration
 */
export interface CrystalBallAudioEffects {
  /** How much bass affects displacement */
  bassDisplacement: number
  /** How much mids affect color intensity */
  midColorBoost: number
  /** How much highs affect glow */
  highGlowBoost: number
  /** Overall reactivity multiplier */
  reactivity: number
  /** Smoothing factor for transitions */
  smoothing: number
  /** Enable/disable audio reactivity */
  enabled: boolean
}

/**
 * Crystal ball configuration options
 */
export interface CrystalBallConfig {
  style?: CrystalBallStyleSelection
  volume?: Partial<VolumeConfig>
  animation?: Partial<CrystalBallAnimationConfig>
  colors?: {
    primary: string
    secondary: string
  }
  audioEffects?: Partial<CrystalBallAudioEffects>
  /** Overall scale */
  scale?: number
  /** Roughness of the glass surface (0 = mirror, 1 = matte) */
  roughness?: number
  /** Metalness (0 = dielectric, 1 = metallic) */
  metalness?: number
  /** Environment map intensity */
  envMapIntensity?: number
}

/**
 * Crystal ball constructor options
 */
export interface CrystalBallOptions {
  scene: Scene
  camera: PerspectiveCamera
  renderer: WebGLRenderer
  audio: KwamiAudio

  style?: CrystalBallStyleSelection
  volume?: Partial<VolumeConfig>
  animation?: Partial<CrystalBallAnimationConfig>
  colors?: {
    primary: string
    secondary: string
  }
  audioEffects?: Partial<CrystalBallAudioEffects>
  scale?: number
  roughness?: number
  metalness?: number
  envMapIntensity?: number
  onAfterRender?: () => void
}

/**
 * Crystal ball options configuration (defaults)
 */
export interface CrystalBallOptionsConfig {
  volume: VolumeConfig
  animation: CrystalBallAnimationConfig
  audioEffects: CrystalBallAudioEffects
  styles: Record<CrystalBallStyle, StyleConfig>
  scale: {
    min: number
    max: number
    default: number
  }
}

/**
 * Style-specific configuration
 */
export interface StyleConfig {
  colors: {
    primary: string
    secondary: string
  }
  volume: Partial<VolumeConfig>
  animation: Partial<CrystalBallAnimationConfig>
  roughness: number
  metalness: number
  envMapIntensity: number
}
