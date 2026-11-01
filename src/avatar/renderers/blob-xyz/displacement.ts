/**
 * The blob's per-vertex surface displacement, as a pure kernel over plain typed arrays.
 *
 * This is the expensive half of every blob frame — a few simplex-noise samples per vertex,
 * then vertex normals — about 11ms at 160 segments on a laptop CPU. It lives here, apart from
 * the per-frame bookkeeping in `animation.ts`, so the SAME code can run in two places:
 *
 * - on the main thread, inside `animateBlobXyz` (the fallback, and what the unit tests drive);
 * - in a Web Worker (`displacement.worker.ts`), which is how BlobXyz runs it by default, so a
 *   page with a blob on it keeps its main thread for everything else.
 *
 * Nothing here may import three.js or touch the DOM: the worker bundle carries only this file,
 * the protocol beside it and the noise function.
 */

/** A 3D noise function returning roughly -1..1 (simplex-noise's `createNoise3D()`). */
export type Noise3D = (x: number, y: number, z: number) => number

/**
 * Everything the per-vertex loop reads for one frame. Plain numbers and one plain array, so
 * the whole thing crosses `postMessage` by structured clone without a custom codec.
 */
export interface DisplacementFrame {
  /** Noise time per axis (`performance.now() * 3e-5 * time.axis`). */
  tX: number
  tY: number
  tZ: number
  /** Noise frequency per axis (the spikes), floored at 0.025. */
  freqX: number
  freqY: number
  freqZ: number
  /** Noise depth per axis (the amplitude). */
  ampX: number
  ampY: number
  ampZ: number
  /** How hard the audio pushes the surface out (0 when silent). */
  audioPush: number
  /** Noise-frequency multiplier while audio plays (`1 + audioPush * spikeDensity`). */
  audioFreqBoost: number
  /** Audio above the activation threshold — speeds up the per-vertex smoothing. */
  audioActive: boolean
  /** 0..1, how quickly the surface follows the audio. */
  responseSpeed: number
  listeningBlend: number
  thinkingBlend: number
  thinkingProgress: number
  /** Live touch points, flattened: [x, y, z, strength, ease, progress] per point, mesh-local. */
  touches: number[]
  liquidVX: number
  liquidVY: number
  liquidStretch: number
}

/** Values per touch point in `DisplacementFrame.touches`. */
export const TOUCH_STRIDE = 6

/** Unit directions of an undisplaced sphere's vertices — the rest pose every frame starts from. */
export function restDirectionsFrom(positions: ArrayLike<number>): Float32Array {
  const count = Math.floor(positions.length / 3)
  const rest = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const x = positions[i * 3] ?? 0
    const y = positions[i * 3 + 1] ?? 0
    const z = positions[i * 3 + 2] ?? 0
    const length = Math.hypot(x, y, z) || 1
    rest[i * 3] = x / length
    rest[i * 3 + 1] = y / length
    rest[i * 3 + 2] = z / length
  }
  return rest
}

/**
 * Displace every vertex for one frame.
 *
 * `previous` holds each vertex's smoothed radius from the last frame (start it at 1) and is
 * updated in place; `out` receives the new positions, xyz-interleaved, and may be the
 * geometry's own position array.
 */
export function displaceVertices(
  frame: DisplacementFrame,
  rest: Float32Array,
  previous: Float32Array,
  out: Float32Array,
  noise3D: Noise3D,
): void {
  const {
    tX, tY, tZ, freqX, freqY, freqZ, ampX, ampY, ampZ,
    audioPush, audioFreqBoost, audioActive, responseSpeed,
    listeningBlend, thinkingBlend, thinkingProgress, touches,
    liquidVX, liquidVY, liquidStretch,
  } = frame
  const count = previous.length
  const touchCount = Math.floor(touches.length / TOUCH_STRIDE)
  const smoothing = audioActive ? 0.3 + responseSpeed * 0.4 : 0.25
  const thinking = thinkingBlend > 0.01

  // Per-frame thinking constants (they only depend on the progress, not the vertex).
  const thinkPhaseX = Math.sin(thinkingProgress * Math.PI * 2) * 1.5
  const thinkPhaseY = Math.cos(thinkingProgress * Math.PI * 2.5) * 1.5
  const thinkPhaseZ = Math.sin(thinkingProgress * Math.PI * 3) * 1.5
  const thinkPulse = Math.sin(thinkingProgress * Math.PI * 5) * 0.3 + 0.7
  const thinkFade = 1 - Math.pow(thinkingProgress, 2)

  // Per-frame liquid constants.
  const velocityMagnitude = Math.sqrt(liquidVX * liquidVX + liquidVY * liquidVY)
  const liquid = velocityMagnitude > 0.0005
  const velDirX = liquid ? liquidVX / velocityMagnitude : 0
  const velDirY = liquid ? liquidVY / velocityMagnitude : 0
  const velocityInfluence = Math.min(velocityMagnitude * 8, 0.8)

  const detailOn = audioPush > 0.2
  const detailWeight = detailOn ? Math.min(1, (audioPush - 0.2) * 1.5) : 0

  for (let i = 0; i < count; i++) {
    const o = i * 3
    const dx = rest[o] ?? 0
    const dy = rest[o + 1] ?? 0
    const dz = rest[o + 2] ?? 0
    const prev = previous[i] ?? 1

    const amplitudeMultiplier = Math.abs(dx) * ampX + Math.abs(dy) * ampY + Math.abs(dz) * ampZ

    // Idle noise: low frequency, gentle organic morphing
    const idleNoise = noise3D(
      dx * freqX * 0.5 + tX,
      dy * freqY * 0.5 + tY,
      dz * freqZ * 0.5 + tZ,
    ) * 0.6 + noise3D(
      dx * freqX * 0.3 + tX * 0.7,
      dy * freqY * 0.3 + tY * 0.7,
      dz * freqZ * 0.3 + tZ * 0.7,
    ) * 0.4

    // Audio spike noise: higher frequency, MORE spikes when louder.
    const spikeNoise = noise3D(
      dx * freqX * audioFreqBoost + tX * 1.3,
      dy * freqY * audioFreqBoost + tY * 1.3,
      dz * freqZ * audioFreqBoost + tZ * 1.3,
    )

    // High-frequency detail that only appears during loud audio
    const detailNoise = detailOn ? noise3D(
      dx * freqX * audioFreqBoost * 2 + tX * 1.8,
      dy * freqY * audioFreqBoost * 2 + tY * 1.8,
      dz * freqZ * audioFreqBoost * 2 + tZ * 1.8,
    ) * detailWeight : 0

    const idleAmp = 0.14 * amplitudeMultiplier
    const audioAmp = audioPush * 0.25 * amplitudeMultiplier
    const audioDetail = audioPush * 0.08 * amplitudeMultiplier

    const speakingDisplacement = idleAmp * idleNoise + audioAmp * spikeNoise + audioDetail * detailNoise
    const listeningDisplacement = -idleAmp * idleNoise * 0.7 + audioAmp * 0.4 * spikeNoise

    let finalDisplacement = speakingDisplacement * (1 - listeningBlend) + listeningDisplacement * listeningBlend
    if (thinking) {
      const thinkNoise1 = noise3D(dx * 2 + tX * 3.5 + thinkPhaseX, dy * 2 + tY * 3.5 + thinkPhaseY, dz * 2 + tZ * 3.5 + thinkPhaseZ)
      const thinkNoise2 = noise3D(
        dx * 1 + tX * 2.5 - thinkingProgress * 3,
        dy * 1 + tY * 2.5 + thinkingProgress * 2.5,
        dz * 1 + tZ * 2.5 - thinkingProgress * 3.5,
      )
      const thinkNoise3 = noise3D(dx * 0.5 + tX * 1.5, dy * 0.5 + tY * 1.5, dz * 0.5 + tZ * 1.5)
      const thinkingNoise = (thinkNoise1 * 0.4 + thinkNoise2 * 0.35 + thinkNoise3 * 0.25) * thinkPulse
      const thinkingDisplacement = thinkingNoise * 0.35 * thinkFade * amplitudeMultiplier
      finalDisplacement = finalDisplacement * (1 - thinkingBlend) + thinkingDisplacement * thinkingBlend
    }

    let displacement = 1 + finalDisplacement

    if (touchCount > 0) {
      // Distance from last frame's vertex, as the original loop measured it.
      const vx = dx * prev
      const vy = dy * prev
      const vz = dz * prev
      let touchDisplacement = 0
      for (let t = 0; t < touchCount; t++) {
        const b = t * TOUCH_STRIDE
        const ease = touches[b + 4] ?? 0
        if (ease <= 0.01) continue
        const dist = Math.hypot(vx - (touches[b] ?? 0), vy - (touches[b + 1] ?? 0), vz - (touches[b + 2] ?? 0))
        const influenceRadius = 2.1
        if (dist > influenceRadius) continue
        const influence = Math.max(0, 1 - dist / influenceRadius)
        const smoothInfluence = Math.pow(influence, 3.2)
        const strength = touches[b + 3] ?? 0
        const progress = touches[b + 5] ?? 0
        const sink = -strength * 0.42 * smoothInfluence * ease
        const wave = Math.sin(dist * 2.4 - progress * 5.4) * 0.24 * smoothInfluence * ease
        touchDisplacement += sink + wave
      }
      if (touchDisplacement !== 0) {
        displacement += Math.max(-0.7, Math.min(0.5, touchDisplacement))
      }
    }

    const target = Math.max(0.55, Math.min(1.45, displacement))
    const smoothed = prev + (target - prev) * smoothing
    previous[i] = smoothed

    let px = dx * smoothed
    let py = dy * smoothed
    const pz = dz * smoothed

    if (liquid) {
      const alignment = dx * velDirX + dy * velDirY
      const stretchAmount = alignment * velocityInfluence * liquidStretch
      const deformation = stretchAmount > 0 ? stretchAmount * 0.25 : stretchAmount * 0.15
      px += velDirX * deformation * smoothed
      py += velDirY * deformation * smoothed
    }

    out[o] = px
    out[o + 1] = py
    out[o + 2] = pz
  }
}

/**
 * Smooth vertex normals for a triangle mesh — the same area-weighted accumulation as three's
 * `BufferGeometry.computeVertexNormals()`, so a worker-displaced blob shades exactly like one
 * displaced on the main thread.
 */
export function computeVertexNormalsInto(
  positions: Float32Array,
  index: ArrayLike<number> | null,
  out: Float32Array,
): void {
  out.fill(0)
  const face = (a: number, b: number, c: number, accumulate: boolean): void => {
    const ax = positions[a * 3] ?? 0, ay = positions[a * 3 + 1] ?? 0, az = positions[a * 3 + 2] ?? 0
    const bx = positions[b * 3] ?? 0, by = positions[b * 3 + 1] ?? 0, bz = positions[b * 3 + 2] ?? 0
    const cx = positions[c * 3] ?? 0, cy = positions[c * 3 + 1] ?? 0, cz = positions[c * 3 + 2] ?? 0
    // cb × ab, as three does
    const cbx = cx - bx, cby = cy - by, cbz = cz - bz
    const abx = ax - bx, aby = ay - by, abz = az - bz
    const nx = cby * abz - cbz * aby
    const ny = cbz * abx - cbx * abz
    const nz = cbx * aby - cby * abx
    // Unrolled: this runs once per triangle per frame, so no per-face array.
    write(a, nx, ny, nz, accumulate)
    write(b, nx, ny, nz, accumulate)
    write(c, nx, ny, nz, accumulate)
  }
  const write = (v: number, nx: number, ny: number, nz: number, accumulate: boolean): void => {
    const o = v * 3
    if (accumulate) {
      out[o] = (out[o] ?? 0) + nx
      out[o + 1] = (out[o + 1] ?? 0) + ny
      out[o + 2] = (out[o + 2] ?? 0) + nz
    } else {
      out[o] = nx
      out[o + 1] = ny
      out[o + 2] = nz
    }
  }
  if (index) {
    for (let i = 0; i + 2 < index.length; i += 3) face(index[i] ?? 0, index[i + 1] ?? 0, index[i + 2] ?? 0, true)
  } else {
    const count = Math.floor(positions.length / 3)
    for (let i = 0; i + 2 < count; i += 3) face(i, i + 1, i + 2, false)
  }
  const count = Math.floor(out.length / 3)
  for (let i = 0; i < count; i++) {
    const x = out[i * 3] ?? 0, y = out[i * 3 + 1] ?? 0, z = out[i * 3 + 2] ?? 0
    const length = Math.hypot(x, y, z) || 1
    out[i * 3] = x / length
    out[i * 3 + 1] = y / length
    out[i * 3 + 2] = z / length
  }
}
