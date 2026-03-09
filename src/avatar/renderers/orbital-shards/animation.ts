import type { Mesh, Group, ShaderMaterial } from 'three'
import type { OrbitalShardsAudioEffects } from './types'

/**
 * Shard animation state
 */
export interface ShardState {
  mesh: Mesh
  basePosition: [number, number, number]
  orbitSpeed: number
  orbitPhase: number
  tilt: number
  rotationSpeed: { x: number; y: number; z: number }
  baseScale: number
}

/**
 * Audio analysis result for animation
 */
export interface AudioLevels {
  bass: number
  mid: number
  high: number
  overall: number
}

/**
 * Analyze frequency data to extract bass, mid, and high levels
 */
export function analyzeAudio(frequencyData: Uint8Array): AudioLevels {
  if (!frequencyData || frequencyData.length === 0) {
    return { bass: 0, mid: 0, high: 0, overall: 0 }
  }

  const binCount = frequencyData.length

  // Frequency ranges (approximate for 44.1kHz sample rate with 2048 FFT)
  const bassEnd = Math.floor(binCount * 0.1) // 0-200Hz
  const midEnd = Math.floor(binCount * 0.4) // 200-2000Hz

  let bassSum = 0
  let midSum = 0
  let highSum = 0

  // Calculate average levels for each band
  for (let i = 0; i < binCount; i++) {
    const value = frequencyData[i] / 255

    if (i < bassEnd) {
      bassSum += value
    } else if (i < midEnd) {
      midSum += value
    } else {
      highSum += value
    }
  }

  const bass = bassSum / bassEnd
  const mid = midSum / (midEnd - bassEnd)
  const high = highSum / (binCount - midEnd)
  const overall = (bass + mid + high) / 3

  return { bass, mid, high, overall }
}

/**
 * Smooth audio levels for more fluid animation
 */
export function smoothAudioLevels(
  current: AudioLevels,
  previous: AudioLevels,
  smoothing: number,
): AudioLevels {
  const factor = 1 - smoothing

  return {
    bass: previous.bass + (current.bass - previous.bass) * factor,
    mid: previous.mid + (current.mid - previous.mid) * factor,
    high: previous.high + (current.high - previous.high) * factor,
    overall: previous.overall + (current.overall - previous.overall) * factor,
  }
}

/**
 * Animate orbital shards with orbital motion
 */
export function animateShards(
  shards: ShardState[],
  time: number,
  audioLevels: AudioLevels,
  effects: OrbitalShardsAudioEffects,
  listeningTransition: number,
  thinkingTransition: number,
): void {
  const reactivity = effects.enabled ? effects.reactivity : 0

  for (const shard of shards) {
    // Base orbital motion
    const orbitAngle = shard.orbitPhase + time * shard.orbitSpeed * 0.5

    // Audio-reactive orbit radius expansion
    const orbitExpansion = 1 + audioLevels.bass * effects.bassOrbitBoost * reactivity

    // Calculate orbital position
    const radius = Math.sqrt(
      shard.basePosition[0] ** 2 +
      shard.basePosition[1] ** 2 +
      shard.basePosition[2] ** 2,
    ) * orbitExpansion

    // Apply different patterns based on state
    let x: number
    let y: number
    let z: number

    if (thinkingTransition > 0.01) {
      // Thinking mode: faster, more chaotic orbits
      const thinkingSpeed = 1 + thinkingTransition * 2
      const chaos = Math.sin(time * 5 + shard.orbitPhase * 10) * thinkingTransition * 0.3

      x = Math.cos(orbitAngle * thinkingSpeed) * radius * (1 + chaos)
      y = shard.basePosition[1] + Math.sin(time * 3 + shard.orbitPhase) * thinkingTransition * 0.5
      z = Math.sin(orbitAngle * thinkingSpeed) * radius * (1 + chaos)
    } else if (listeningTransition > 0.01) {
      // Listening mode: shards gather closer, gentle pulse
      const gatherFactor = 1 - listeningTransition * 0.3
      const breathe = Math.sin(time * 2) * 0.1 * listeningTransition

      x = Math.cos(orbitAngle) * radius * gatherFactor + breathe
      y = shard.basePosition[1] * gatherFactor
      z = Math.sin(orbitAngle) * radius * gatherFactor + breathe
    } else {
      // Idle mode: gentle orbital drift
      x = Math.cos(orbitAngle) * radius
      y = shard.basePosition[1] + Math.sin(time * 0.5 + shard.orbitPhase) * 0.2
      z = Math.sin(orbitAngle) * radius
    }

    shard.mesh.position.set(x, y, z)

    // Rotation with audio reactivity
    const rotationBoost = 1 + audioLevels.mid * effects.midRotationBoost * reactivity
    shard.mesh.rotation.x += shard.rotationSpeed.x * rotationBoost
    shard.mesh.rotation.y += shard.rotationSpeed.y * rotationBoost
    shard.mesh.rotation.z += shard.rotationSpeed.z * rotationBoost

    // Scale pulsing with audio
    const scalePulse = 1 + audioLevels.high * 0.2 * reactivity
    const baseScale = shard.baseScale * scalePulse
    shard.mesh.scale.setScalar(baseScale)
  }
}

/**
 * Animate the core with pulsing energy
 */
export function animateCore(
  core: Mesh,
  glow: Mesh,
  time: number,
  audioLevels: AudioLevels,
  effects: OrbitalShardsAudioEffects,
  listeningTransition: number,
  thinkingTransition: number,
): void {
  const reactivity = effects.enabled ? effects.reactivity : 0

  // Core rotation
  core.rotation.y += 0.005
  core.rotation.x += 0.002

  // Core scale pulsing
  const basePulse = Math.sin(time * 2) * 0.05
  const audioPulse = audioLevels.bass * 0.15 * reactivity
  const coreScale = 1 + basePulse + audioPulse

  // State-based modifications
  let stateScale = 1
  if (thinkingTransition > 0.01) {
    // Thinking: rapid pulsing
    stateScale = 1 + Math.sin(time * 8) * 0.1 * thinkingTransition
  } else if (listeningTransition > 0.01) {
    // Listening: gentle breathing
    stateScale = 1 + Math.sin(time * 1.5) * 0.08 * listeningTransition
  }

  core.scale.setScalar(coreScale * stateScale)

  // Glow follows core but larger
  glow.rotation.copy(core.rotation)
  glow.scale.setScalar(coreScale * stateScale * 1.5)

  // Update glow intensity based on audio
  const glowMaterial = glow.material as ShaderMaterial
  if (glowMaterial.uniforms?.uGlowIntensity) {
    const baseIntensity = glowMaterial.uniforms.uGlowIntensity.value
    glowMaterial.uniforms.uGlowIntensity.value = baseIntensity * (1 + audioLevels.high * effects.highGlowBoost * reactivity)
  }
}

/**
 * Animate the entire orbital shards group
 */
export function animateOrbitalShards(
  group: Group,
  shards: ShardState[],
  core: Mesh,
  glow: Mesh,
  time: number,
  audioLevels: AudioLevels,
  effects: OrbitalShardsAudioEffects,
  rotation: { x: number; y: number; z: number },
  listeningTransition: number,
  thinkingTransition: number,
  orientation?: { x: number; y: number; z: number },
  accumulatedRotation?: { x: number; y: number; z: number },
): void {
  // Update accumulated rotation by adding rotation speed
  if (accumulatedRotation) {
    accumulatedRotation.x += rotation.x
    accumulatedRotation.y += rotation.y
    accumulatedRotation.z += rotation.z
  }

  // Apply orientation + accumulated rotation
  if (orientation && accumulatedRotation) {
    group.rotation.x = orientation.x + accumulatedRotation.x
    group.rotation.y = orientation.y + accumulatedRotation.y
    group.rotation.z = orientation.z + accumulatedRotation.z
  } else {
    // Fallback to original behavior
    group.rotation.x += rotation.x
    group.rotation.y += rotation.y
    group.rotation.z += rotation.z
  }

  // Animate individual components
  animateShards(shards, time, audioLevels, effects, listeningTransition, thinkingTransition)
  animateCore(core, glow, time, audioLevels, effects, listeningTransition, thinkingTransition)
}
