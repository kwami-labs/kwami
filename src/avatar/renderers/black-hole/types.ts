/**
 * Black Hole Renderer Types
 * 
 * Type definitions for the black hole avatar renderer with
 * accretion disk, gravitational lensing, and star field effects.
 */

import type * as THREE from 'three'

// Color schemes
export type BlackHoleColorScheme = 'classic' | 'fire' | 'ice' | 'nebula' | 'void'

export interface BlackHoleColorSchemeSelection {
  scheme: BlackHoleColorScheme
}

// Core configuration
export interface BlackHoleCoreConfig {
  radius: number              // Combined radius (convenience)
  blackHoleRadius: number     // Dark center sphere radius
  eventHorizonRadius: number  // Glowing event horizon shell radius
  glowIntensity: number
  pulseSpeed: number
}

// Accretion disk configuration
export interface BlackHoleDiskConfig {
  innerRadius: number
  outerRadius: number
  tiltAngle: number
  flowSpeed: number
  noiseScale: number
  density: number
}

// Disk colors
export interface BlackHoleDiskColors {
  hot: string
  mid1: string
  mid2: string
  mid3: string
  outer: string
}

// Stars configuration
export interface BlackHoleStarsConfig {
  count: number
  fieldRadius: number
  twinkleSpeed: number
}

// Animation configuration
export interface BlackHoleAnimationConfig {
  autoRotate: boolean
  autoRotateSpeed: number
  diskRotationSpeed: number
  starsRotationSpeed: number
}

// Post-processing effects
export interface BlackHoleEffectsConfig {
  bloomIntensity: number
  bloomThreshold: number
  bloomRadius: number
  lensingStrength: number
  lensingRadius: number
  chromaticAberration: number
}

// Audio reactivity
export interface BlackHoleAudioEffects {
  enabled: boolean
  reactivity: number
  bassDiskGlow: number
  midDiskSpeed: number
  highStarTwinkle: number
  smoothing: number
}

// Complete configuration
export interface BlackHoleConfig {
  colorScheme: BlackHoleColorSchemeSelection
  core: BlackHoleCoreConfig
  disk: BlackHoleDiskConfig
  colors: BlackHoleDiskColors
  stars: BlackHoleStarsConfig
  animation: BlackHoleAnimationConfig
  effects: BlackHoleEffectsConfig
  audioEffects: BlackHoleAudioEffects
  scale: number
}

// Options for creating a black hole (partial config)
export interface BlackHoleOptions {
  colorScheme?: Partial<BlackHoleColorSchemeSelection>
  core?: Partial<BlackHoleCoreConfig>
  disk?: Partial<BlackHoleDiskConfig>
  colors?: Partial<BlackHoleDiskColors>
  stars?: Partial<BlackHoleStarsConfig>
  animation?: Partial<BlackHoleAnimationConfig>
  effects?: Partial<BlackHoleEffectsConfig>
  audioEffects?: Partial<BlackHoleAudioEffects>
  scale?: number
}

// Color scheme presets
export interface ColorSchemePreset {
  colors: BlackHoleDiskColors
  effects?: Partial<BlackHoleEffectsConfig>
}

// Shader uniforms
export interface DiskShaderUniforms {
  uTime: THREE.IUniform<number>
  uColorHot: THREE.IUniform<THREE.Color>
  uColorMid1: THREE.IUniform<THREE.Color>
  uColorMid2: THREE.IUniform<THREE.Color>
  uColorMid3: THREE.IUniform<THREE.Color>
  uColorOuter: THREE.IUniform<THREE.Color>
  uNoiseScale: THREE.IUniform<number>
  uFlowSpeed: THREE.IUniform<number>
  uDensity: THREE.IUniform<number>
  uInnerRadius: THREE.IUniform<number>
  uOuterRadius: THREE.IUniform<number>
  uAudioBass: THREE.IUniform<number>
  uAudioMid: THREE.IUniform<number>
}

export interface StarShaderUniforms {
  uTime: THREE.IUniform<number>
  uPixelRatio: THREE.IUniform<number>
  uTwinkleSpeed: THREE.IUniform<number>
  uAudioHigh: THREE.IUniform<number>
}

export interface EventHorizonShaderUniforms {
  uTime: THREE.IUniform<number>
  uCameraPosition: THREE.IUniform<THREE.Vector3>
  uGlowIntensity: THREE.IUniform<number>
  uPulseSpeed: THREE.IUniform<number>
  uAudioBass: THREE.IUniform<number>
}

export interface LensingShaderUniforms {
  tDiffuse: THREE.IUniform<THREE.Texture | null>
  blackHoleScreenPos: THREE.IUniform<THREE.Vector2>
  lensingStrength: THREE.IUniform<number>
  lensingRadius: THREE.IUniform<number>
  aspectRatio: THREE.IUniform<number>
  chromaticAberration: THREE.IUniform<number>
}
