/**
 * BlobXyz's side of the displacement worker: ships one frame at a time, writes each result
 * into the mesh's geometry when it lands, and steps aside (so BlobXyz displaces on the main
 * thread as before) whenever a worker cannot run here.
 *
 * WHY. Re-displacing every vertex and recomputing normals is ~11ms a frame at 160 segments —
 * most of a 60Hz budget, every frame, on the main thread of whatever page hosts the blob.
 * Off-thread, the main thread keeps only the cheap per-frame bookkeeping (computeBlobFrame)
 * and a buffer copy, and the surface updates at whatever rate the worker sustains.
 *
 * PACING. At most one frame is in flight. A frame that comes up while the worker is still busy
 * is not queued, just skipped — the next one carries fresher numbers anyway — so a slow machine
 * gets a slower-moving surface, never a growing backlog or a blocked render loop.
 *
 * FALLBACK. `create` returns null when there is no Worker, or when constructing one throws
 * (a page whose CSP forbids blob:/data: workers). A worker that loads but then errors flips
 * `active` off, and BlobXyz goes back to displacing on the main thread from the next frame.
 */
import type { BufferGeometry, Mesh } from 'three'
import { logger } from '../../../utils/logger.js'
import type { DisplacementFrame } from './displacement.js'
import type { DisplacementInit, DisplacementReply, DisplacementRequest } from './displacementProtocol.js'

/** The slice of the Worker API this uses — structural, so tests can pass a fake. */
export interface DisplacementWorkerLike {
  postMessage(message: unknown, transfer: Transferable[]): void
  addEventListener(type: 'message' | 'error' | 'messageerror', listener: (event: MessageEvent) => void): void
  terminate(): void
}

export class BlobDisplacementWorker {
  private worker: DisplacementWorkerLike | null
  private geometry: BufferGeometry | null = null
  private generation = 0
  private inFlight = false
  /** The buffers the last reply handed back, reused for the next request. */
  private spare: { positions: Float32Array; normals: Float32Array } | null = null

  /** A worker for this mesh, or null when one cannot be started here. */
  static create(mesh: Mesh, createWorker: () => DisplacementWorkerLike): BlobDisplacementWorker | null {
    if (typeof Worker === 'undefined') return null
    try {
      return new BlobDisplacementWorker(mesh, createWorker())
    } catch (error) {
      logger.warn('Blob displacement worker unavailable; displacing on the main thread.', error)
      return null
    }
  }

  constructor(
    private readonly mesh: Mesh,
    worker: DisplacementWorkerLike,
  ) {
    this.worker = worker
    worker.addEventListener('message', this.onMessage)
    worker.addEventListener('error', this.onError)
    worker.addEventListener('messageerror', this.onError)
  }

  /** False once the worker has failed or been disposed — then the caller displaces itself. */
  get active(): boolean {
    return this.worker !== null
  }

  /** Hand one frame to the worker, unless it is still busy with the previous one. */
  submit(frame: DisplacementFrame): void {
    const worker = this.worker
    if (!worker) return
    const geometry = this.mesh.geometry
    const position = geometry.attributes.position
    if (!position) return
    if (geometry !== this.geometry && !this.init(geometry)) return
    if (this.inFlight) return

    const length = position.count * 3
    let buffers = this.spare
    this.spare = null
    if (!buffers || buffers.positions.length !== length) {
      buffers = { positions: new Float32Array(length), normals: new Float32Array(length) }
    }

    const request: DisplacementRequest = {
      type: 'frame',
      generation: this.generation,
      frame,
      positions: buffers.positions,
      normals: buffers.normals,
    }
    this.inFlight = true
    try {
      worker.postMessage(request, [buffers.positions.buffer, buffers.normals.buffer])
    } catch (error) {
      this.fail(error)
    }
  }

  dispose(): void {
    this.worker?.terminate()
    this.worker = null
    this.geometry = null
    this.spare = null
  }

  /** A new geometry (first frame, or a mesh-detail change): send its rest pose and index. */
  private init(geometry: BufferGeometry): boolean {
    const worker = this.worker
    const position = geometry.attributes.position
    if (!worker || !position) return false
    // The writes below need somewhere to land; the blob's merged sphere always has normals,
    // but a caller-supplied geometry might not.
    if (!geometry.attributes.normal) geometry.computeVertexNormals()

    this.geometry = geometry
    this.generation++
    this.spare = null
    const positions = Float32Array.from(position.array as ArrayLike<number>)
    const source = geometry.index?.array
    const index = source
      ? (source instanceof Uint16Array ? Uint16Array.from(source) : Uint32Array.from(source as ArrayLike<number>))
      : null
    const message: DisplacementInit = { type: 'init', generation: this.generation, positions, index }
    const transfer: ArrayBuffer[] = [positions.buffer]
    if (index) transfer.push(index.buffer as ArrayBuffer)
    try {
      worker.postMessage(message, transfer)
      return true
    } catch (error) {
      this.fail(error)
      return false
    }
  }

  private onMessage = (event: MessageEvent): void => {
    const reply = event.data as DisplacementReply
    if (!reply || reply.type !== 'frame') return
    this.inFlight = false
    const geometry = this.geometry
    if (!reply.stale && geometry && reply.generation === this.generation && geometry === this.mesh.geometry) {
      const position = geometry.attributes.position
      const normal = geometry.attributes.normal
      if (position && position.array.length === reply.positions.length) {
        (position.array as Float32Array).set(reply.positions)
        position.needsUpdate = true
      }
      if (normal && normal.array.length === reply.normals.length) {
        (normal.array as Float32Array).set(reply.normals)
        normal.needsUpdate = true
      }
    }
    this.spare = { positions: reply.positions, normals: reply.normals }
  }

  private onError = (event: unknown): void => {
    this.fail(event)
  }

  private fail(error: unknown): void {
    if (!this.worker) return
    logger.warn('Blob displacement worker failed; displacing on the main thread.', error)
    this.worker.terminate()
    this.worker = null
    this.inFlight = false
  }
}
