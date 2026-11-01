/**
 * Starts the blob's displacement worker. Kept apart from `displacementWorker.ts` so that file
 * (and its tests) never touch Vite's `?worker&inline` import: here the library build bundles
 * `displacement.worker.ts` — simplex-noise included — into a script inlined in the package.
 */
import DisplacementWorker from './displacement.worker?worker&inline'
import type { DisplacementWorkerLike } from './displacementWorker.js'

export function createDisplacementWorker(): DisplacementWorkerLike {
  return new DisplacementWorker({ name: 'kwami-blob-displacement' })
}
