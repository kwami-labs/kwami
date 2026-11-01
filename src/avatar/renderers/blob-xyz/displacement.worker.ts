/**
 * The blob's displacement worker. Imported by `displacementWorker.ts` with Vite's
 * `?worker&inline`, so the library build bundles this file — and simplex-noise with it —
 * into one self-contained script carried inside the package: consumers need no worker
 * support from their own bundler, and nothing here resolves a bare import at runtime.
 */
import { createNoise3D } from 'simplex-noise'
import { createDisplacementHandler, type DisplacementMessage } from './displacementProtocol.js'

const handle = createDisplacementHandler(createNoise3D())

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<DisplacementMessage>) => void) | null
  postMessage: (message: unknown, transfer: Transferable[]) => void
}

scope.onmessage = (event) => {
  const reply = handle(event.data)
  if (reply) scope.postMessage(reply.message, reply.transfer)
}
