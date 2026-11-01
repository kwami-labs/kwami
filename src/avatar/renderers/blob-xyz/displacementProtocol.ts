/**
 * The message protocol between BlobXyz and its displacement worker, as a plain function so
 * it can be unit-tested without a real Worker (the worker entry only wires it to `self`).
 *
 *   main → worker  `init`   a fresh geometry: its rest positions and triangle index
 *   main → worker  `frame`  one frame's numbers, plus two buffers to write into (transferred)
 *   worker → main  `frame`  the same two buffers back, filled with positions and normals
 *
 * Every message carries a `generation`, bumped on each `init`. A mesh-detail change rebuilds
 * the geometry while a frame for the old one may still be in flight; its reply comes back
 * marked stale and its buffers are simply recycled, never written into the new geometry.
 *
 * The per-vertex smoothing state lives HERE, on the worker side — it is what makes the
 * surface ease from frame to frame instead of jumping, and it is per vertex, so it stays
 * with the code that walks the vertices.
 */
import { computeVertexNormalsInto, displaceVertices, restDirectionsFrom, type DisplacementFrame, type Noise3D } from './displacement.js'

export interface DisplacementInit {
  type: 'init'
  generation: number
  /** The undisplaced sphere's vertex positions, xyz-interleaved. */
  positions: Float32Array
  /** Triangle index for normals, or null for a non-indexed geometry. */
  index: Uint32Array | Uint16Array | null
}

export interface DisplacementRequest {
  type: 'frame'
  generation: number
  frame: DisplacementFrame
  /** Filled with the displaced positions. Transferred both ways. */
  positions: Float32Array
  /** Filled with the vertex normals. Transferred both ways. */
  normals: Float32Array
}

export interface DisplacementReply {
  type: 'frame'
  generation: number
  /** True when the geometry changed while this frame was in flight: nothing was written. */
  stale: boolean
  positions: Float32Array
  normals: Float32Array
}

export type DisplacementMessage = DisplacementInit | DisplacementRequest

interface WorkerState {
  generation: number
  rest: Float32Array
  previous: Float32Array
  index: Uint32Array | Uint16Array | null
}

/** Returns the worker's message handler; a reply is `{ message, transfer }` or null. */
export function createDisplacementHandler(noise3D: Noise3D) {
  let state: WorkerState | null = null

  return (msg: DisplacementMessage): { message: DisplacementReply; transfer: ArrayBuffer[] } | null => {
    if (msg.type === 'init') {
      const rest = restDirectionsFrom(msg.positions)
      const previous = new Float32Array(rest.length / 3)
      previous.fill(1)
      state = { generation: msg.generation, rest, previous, index: msg.index }
      return null
    }

    const { positions, normals } = msg
    const transfer = [positions.buffer as ArrayBuffer, normals.buffer as ArrayBuffer]
    const current = state
    if (!current || msg.generation !== current.generation || positions.length !== current.rest.length) {
      return { message: { type: 'frame', generation: msg.generation, stale: true, positions, normals }, transfer }
    }

    displaceVertices(msg.frame, current.rest, current.previous, positions, noise3D)
    computeVertexNormalsInto(positions, current.index, normals)
    return { message: { type: 'frame', generation: msg.generation, stale: false, positions, normals }, transfer }
  }
}
