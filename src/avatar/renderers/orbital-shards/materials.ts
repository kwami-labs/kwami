import {
  ShaderMaterial,
  Color,
  AdditiveBlending,
  DoubleSide,
  FrontSide,
  BackSide,
} from 'three'

// Import shaders with ?raw for vite
import shardVertexShader from './shaders/shard.vertex.glsl?raw'
import shardFragmentShader from './shaders/shard.fragment.glsl?raw'
import coreVertexShader from './shaders/core.vertex.glsl?raw'
import coreFragmentShader from './shaders/core.fragment.glsl?raw'
import glowVertexShader from './shaders/glow.vertex.glsl?raw'
import glowFragmentShader from './shaders/glow.fragment.glsl?raw'

import type { CoreConfig } from './types'

export interface ShardMaterialOptions {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  opacity: number
  shininess: number
}

export interface CoreMaterialOptions {
  innerColor: string
  outerColor: string
  glowIntensity: number
  pulseSpeed: number
}

export interface GlowMaterialOptions {
  color: string
  intensity: number
}

/**
 * Create shader material for crystal shards
 */
export function createShardMaterial(options: ShardMaterialOptions): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: shardVertexShader,
    fragmentShader: shardFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uPrimaryColor: { value: new Color(options.primaryColor) },
      uSecondaryColor: { value: new Color(options.secondaryColor) },
      uAccentColor: { value: new Color(options.accentColor) },
      uOpacity: { value: options.opacity },
      uShininess: { value: options.shininess },
      uLightPosition: { value: { x: 5, y: 5, z: 5 } },
      uAudioReactivity: { value: 1.0 },
      uBassLevel: { value: 0 },
      uMidLevel: { value: 0 },
      uHighLevel: { value: 0 },
    },
    transparent: true,
    side: DoubleSide,
    depthWrite: true,
  })
}

/**
 * Create shader material for the energy core
 */
export function createCoreMaterial(options: CoreMaterialOptions): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: coreVertexShader,
    fragmentShader: coreFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uInnerColor: { value: new Color(options.innerColor) },
      uOuterColor: { value: new Color(options.outerColor) },
      uGlowIntensity: { value: options.glowIntensity },
      uPulseSpeed: { value: options.pulseSpeed },
      uAudioReactivity: { value: 1.0 },
      uBassLevel: { value: 0 },
      uMidLevel: { value: 0 },
      uHighLevel: { value: 0 },
    },
    transparent: true,
    side: FrontSide,
    depthWrite: true,
  })
}

/**
 * Create shader material for the volumetric glow
 */
export function createGlowMaterial(options: GlowMaterialOptions): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: glowVertexShader,
    fragmentShader: glowFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uGlowColor: { value: new Color(options.color) },
      uGlowIntensity: { value: options.intensity },
      uAudioReactivity: { value: 1.0 },
      uBassLevel: { value: 0 },
      uMidLevel: { value: 0 },
      uHighLevel: { value: 0 },
    },
    transparent: true,
    blending: AdditiveBlending,
    side: BackSide,
    depthWrite: false,
  })
}

/**
 * Create all materials for a crystal formation
 */
export function createCrystalMaterials(
  colors: { primary: string; secondary: string; accent: string },
  coreConfig: CoreConfig,
): {
  shardMaterial: ShaderMaterial
  coreMaterial: ShaderMaterial
  glowMaterial: ShaderMaterial
} {
  const shardMaterial = createShardMaterial({
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    accentColor: colors.accent,
    opacity: 0.85,
    shininess: 100,
  })

  const coreMaterial = createCoreMaterial({
    innerColor: coreConfig.innerColor,
    outerColor: coreConfig.outerColor,
    glowIntensity: coreConfig.glowIntensity,
    pulseSpeed: coreConfig.pulseSpeed,
  })

  const glowMaterial = createGlowMaterial({
    color: coreConfig.outerColor,
    intensity: coreConfig.glowIntensity * 0.5,
  })

  return { shardMaterial, coreMaterial, glowMaterial }
}

/**
 * Update time uniform on all materials
 */
export function updateMaterialsTime(
  materials: { shardMaterial: ShaderMaterial; coreMaterial: ShaderMaterial; glowMaterial: ShaderMaterial },
  time: number,
): void {
  materials.shardMaterial.uniforms.uTime.value = time
  materials.coreMaterial.uniforms.uTime.value = time
  materials.glowMaterial.uniforms.uTime.value = time
}

/**
 * Update audio levels on all materials
 */
export function updateMaterialsAudio(
  materials: { shardMaterial: ShaderMaterial; coreMaterial: ShaderMaterial; glowMaterial: ShaderMaterial },
  bass: number,
  mid: number,
  high: number,
  reactivity: number,
): void {
  const mats = [materials.shardMaterial, materials.coreMaterial, materials.glowMaterial]

  for (const mat of mats) {
    mat.uniforms.uBassLevel.value = bass
    mat.uniforms.uMidLevel.value = mid
    mat.uniforms.uHighLevel.value = high
    mat.uniforms.uAudioReactivity.value = reactivity
  }
}
