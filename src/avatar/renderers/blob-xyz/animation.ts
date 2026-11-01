import { createNoise3D } from 'simplex-noise'
import type { Mesh, Vector3 } from 'three'
import type { BlobXyzAudioEffects } from './types.js'
import { displaceVertices, type DisplacementFrame } from './displacement.js'

const noise3D = createNoise3D()

const previousDisplacementMap = new WeakMap<Mesh, Float32Array>()

/**
 * Unit-sphere directions captured the first time a mesh is animated.
 *
 * `animateBlobXyz` used to read each vertex, normalize it, displace it, then
 * add a non-radial liquid offset and write that back. The next frame treated
 * the drifted point as the new rest direction, so a few seconds of beat-bob
 * baked a cone into the body that only a geometry rebuild could undo.
 */
const restDirectionsMap = new WeakMap<Mesh, Float32Array>()

function getRestDirections(
  mesh: Mesh,
  positions: { count: number; getX: (i: number) => number; getY: (i: number) => number; getZ: (i: number) => number },
): Float32Array {
  let rest = restDirectionsMap.get(mesh)
  if (!rest || rest.length !== positions.count * 3) {
    rest = new Float32Array(positions.count * 3)
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const z = positions.getZ(i)
      const length = Math.hypot(x, y, z) || 1
      rest[i * 3] = x / length
      rest[i * 3 + 1] = y / length
      rest[i * 3 + 2] = z / length
    }
    restDirectionsMap.set(mesh, rest)
  }
  return rest
}

interface AudioSmoothing {
  low: number
  mid: number
  high: number
  level: number
}

/**
 * Per-mesh audio smoothing state.
 *
 * This used to be one module-level object shared by every BlobXyz on the page, so two avatars
 * — the multi-instance case the library's own docs lead with — cross-contaminated each other's
 * audio reactivity. Keyed by mesh and weak, exactly like `previousDisplacementMap` above, so
 * the state dies with the renderer it belongs to.
 */
const audioSmoothingMap = new WeakMap<Mesh, AudioSmoothing>()

export function getAudioSmoothing(mesh: Mesh): AudioSmoothing {
  let state = audioSmoothingMap.get(mesh)
  if (!state) {
    state = { low: 0, mid: 0, high: 0, level: 0 }
    audioSmoothingMap.set(mesh, state)
  }
  return state
}

function getFrequencyBands(frequencyData: Uint8Array): {
  low: number
  mid: number
  high: number
  ultra: number
} {
  const dataLength = frequencyData.length

  const lowEnd = Math.floor(dataLength * 0.1)
  const midEnd = Math.floor(dataLength * 0.4)
  const highEnd = Math.floor(dataLength * 0.7)

  let lowSum = 0, midSum = 0, highSum = 0, ultraSum = 0

  for (let i = 0; i < dataLength; i++) {
    const value = (frequencyData[i] ?? 0) / 255

    if (i < lowEnd) lowSum += value
    else if (i < midEnd) midSum += value
    else if (i < highEnd) highSum += value
    else ultraSum += value
  }

  return {
    low: lowSum / lowEnd,
    mid: midSum / (midEnd - lowEnd),
    high: highSum / (highEnd - midEnd),
    ultra: ultraSum / (dataLength - highEnd),
  }
}

export interface LiquidPhysics {
  velocityX: number
  velocityY: number
  stretch: number
}

export interface BlobTouchPoint {
  position: Vector3
  strength: number
  startTime: number
  duration: number
}

const DEFAULT_AUDIO_EFFECTS: BlobXyzAudioEffects = {
  bassSpike: 0.55,
  midSpike: 0.65,
  highSpike: 0.35,
  enabled: true,
  reactivity: 1.8,
  sensitivity: 0.08,
  breathing: 0.035,
  responseSpeed: 0.65,
  transientBoost: 0.4,
}

/**
 * The cheap, per-frame half of a blob frame: read the analyser, smooth the audio bands, set
 * the breathing scale on the mesh, and work out every number the per-vertex loop will need.
 *
 * Runs on the main thread every frame (it owns the analyser and the mesh transform). The
 * expensive half — `displaceVertices` over every vertex — then runs either right here
 * (`animateBlobXyz`) or in the displacement worker.
 */
export function computeBlobFrame(
  mesh: Mesh,
  frequencyData: Uint8Array<ArrayBuffer>,
  analyser: AnalyserNode,
  spikeX: number,
  spikeY: number,
  spikeZ: number,
  amplitudeX: number = 1.0,
  amplitudeY: number = 1.0,
  amplitudeZ: number = 1.0,
  timeX: number,
  timeY: number,
  timeZ: number,
  baseScale: number = 1.0,
  touchPoints: BlobTouchPoint[] = [],
  listeningBlend: number = 0,
  thinkingBlend: number = 0,
  thinkingProgress: number = 0,
  audioEffects: BlobXyzAudioEffects = DEFAULT_AUDIO_EFFECTS,
  liquidPhysics?: LiquidPhysics,
): { frame: DisplacementFrame; audioActive: boolean } {
  const reduction = 0.00003
  const perf = performance.now() * reduction

  const isEnabled = audioEffects.enabled

  analyser.getByteFrequencyData(frequencyData)
  const bands = isEnabled ? getFrequencyBands(frequencyData) : { low: 0, mid: 0, high: 0, ultra: 0 }

  const responseSpeed = Math.min(1, Math.max(0, audioEffects.responseSpeed ?? 0.65))
  const transientBoost = Math.min(1, Math.max(0, audioEffects.transientBoost ?? 0.35))
  const reactivity = audioEffects.reactivity ?? 1.8
  const breathing = audioEffects.breathing ?? 0.035

  const audioSmoothing = getAudioSmoothing(mesh)
  const smoothFactor = 0.12 + responseSpeed * 0.35
  audioSmoothing.low += (bands.low - audioSmoothing.low) * smoothFactor
  audioSmoothing.mid += (bands.mid - audioSmoothing.mid) * smoothFactor
  audioSmoothing.high += (bands.high - audioSmoothing.high) * smoothFactor
  const averageLevel = (bands.low * 0.4 + bands.mid * 0.35 + bands.high * 0.2 + bands.ultra * 0.05)
  audioSmoothing.level += (averageLevel - audioSmoothing.level) * smoothFactor

  const fastBlend = 0.15 + transientBoost * 0.5
  const fastBands = {
    low: audioSmoothing.low * (1 - fastBlend) + bands.low * fastBlend,
    mid: audioSmoothing.mid * (1 - fastBlend) + bands.mid * fastBlend,
    high: audioSmoothing.high * (1 - fastBlend) + bands.high * fastBlend,
  }
  const fastLevel = audioSmoothing.level * (1 - fastBlend) + averageLevel * fastBlend

  const sensitivity = audioEffects.sensitivity ?? 0.075
  const activationThreshold = Math.max(0.01, sensitivity) * 0.75
  const audioActive = isEnabled && fastLevel > activationThreshold

  // No scale change — blob stays the same size. Audio drives surface displacement only.
  const bassEnergy = isEnabled ? fastBands.low * audioEffects.bassSpike : 0
  const midEnergy = isEnabled ? fastBands.mid * audioEffects.midSpike : 0
  const highEnergy = isEnabled ? fastBands.high * audioEffects.highSpike : 0

  const idlePulse = audioActive ? 0 : breathing * 0.15 * Math.sin(perf * 60)
  const targetScale = baseScale * (1 + idlePulse)
  mesh.scale.set(targetScale, targetScale, targetScale)

  // Audio-driven displacement intensity: how far spikes push outward.
  // Louder audio = bigger surface deformation, like sound pushing from inside.
  const audioPush = isEnabled && audioActive
    ? Math.min(3.0, (bassEnergy * 0.7 + midEnergy * 0.9 + highEnergy * 0.5) * reactivity)
    : 0

  const spikeDensity = audioEffects.spikeDensity ?? 1.5

  // Touch points become flat numbers: each one's ease and progress only depend on the time,
  // so they are worked out once here rather than once per vertex.
  const touches: number[] = []
  if (touchPoints.length > 0) {
    const currentTime = Date.now()
    for (const touch of touchPoints) {
      const progress = (currentTime - touch.startTime) / touch.duration
      let easeFactor
      if (progress < 0.25) {
        const t = progress / 0.25
        easeFactor = t * t
      } else {
        const t = (progress - 0.25) / 0.75
        easeFactor = 1 - Math.pow(t, 3)
      }
      if (easeFactor <= 0.01) continue
      touches.push(touch.position.x, touch.position.y, touch.position.z, touch.strength, easeFactor, progress)
    }
  }

  const frame: DisplacementFrame = {
    tX: perf * timeX,
    tY: perf * timeY,
    tZ: perf * timeZ,
    freqX: Math.max(0.025, spikeX),
    freqY: Math.max(0.025, spikeY),
    freqZ: Math.max(0.025, spikeZ),
    ampX: amplitudeX,
    ampY: amplitudeY,
    ampZ: amplitudeZ,
    audioPush,
    audioFreqBoost: 1 + audioPush * spikeDensity,
    audioActive,
    responseSpeed,
    listeningBlend,
    thinkingBlend,
    thinkingProgress,
    touches,
    liquidVX: liquidPhysics?.velocityX ?? 0,
    liquidVY: liquidPhysics?.velocityY ?? 0,
    liquidStretch: liquidPhysics?.stretch ?? 0,
  }
  return { frame, audioActive }
}

/**
 * One whole blob frame on the MAIN thread: the bookkeeping, then every vertex, then normals.
 * BlobXyz runs the vertex half in a worker when it can; this is the fallback, and the
 * reference the worker path is tested against.
 */
export function animateBlobXyz(
  mesh: Mesh,
  frequencyData: Uint8Array<ArrayBuffer>,
  analyser: AnalyserNode,
  spikeX: number,
  spikeY: number,
  spikeZ: number,
  amplitudeX: number = 1.0,
  amplitudeY: number = 1.0,
  amplitudeZ: number = 1.0,
  timeX: number,
  timeY: number,
  timeZ: number,
  baseScale: number = 1.0,
  touchPoints: BlobTouchPoint[] = [],
  listeningBlend: number = 0,
  thinkingBlend: number = 0,
  thinkingProgress: number = 0,
  audioEffects: BlobXyzAudioEffects = DEFAULT_AUDIO_EFFECTS,
  liquidPhysics?: LiquidPhysics,
): boolean {
  const positions = mesh.geometry.attributes.position
  if (!positions) return false

  const { frame, audioActive } = computeBlobFrame(
    mesh, frequencyData, analyser, spikeX, spikeY, spikeZ, amplitudeX, amplitudeY, amplitudeZ,
    timeX, timeY, timeZ, baseScale, touchPoints, listeningBlend, thinkingBlend, thinkingProgress,
    audioEffects, liquidPhysics,
  )

  let previousDisplacements = previousDisplacementMap.get(mesh)
  if (!previousDisplacements || previousDisplacements.length !== positions.count) {
    previousDisplacements = new Float32Array(positions.count)
    previousDisplacements.fill(1)
    previousDisplacementMap.set(mesh, previousDisplacements)
  }
  const restDirections = getRestDirections(mesh, positions)

  displaceVertices(frame, restDirections, previousDisplacements, positions.array as Float32Array, noise3D)

  positions.needsUpdate = true
  mesh.geometry.computeVertexNormals()

  return audioActive
}
