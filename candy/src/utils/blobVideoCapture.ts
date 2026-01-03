/**
 * Record the BlobPreview canvas to a WebM video using the browser MediaRecorder API.
 *
 * Usage:
 *   import { recordCanvasVideo } from '@/utils/blobVideoCapture'
 *   const { blob, buffer, mimeType } = await recordCanvasVideo(canvas, { durationMs: 10_000, fps: 30 })
 *
 * Notes:
 * - Works only in browsers with MediaRecorder + canvas.captureStream support.
 * - Captures exactly what you see on the canvas (lights, wireframe, animation).
 * - Returns both the Blob (for downloads) and Buffer (for uploads/IPFS).
 */

export type RecordCanvasVideoOptions = {
  /** Recording duration in milliseconds. Default: 3000 (3s). */
  durationMs?: number
  /** Frames per second for captureStream. Default: 30. */
  fps?: number
  /** Preferred MIME type. Default tries VP9, falls back to WebM if unsupported. */
  mimeType?: string
  /** Optional progress callback (0..1). */
  onProgress?: (progress: number) => void
}

export type RecordCanvasVideoResult = {
  blob: Blob
  buffer: Buffer
  mimeType: string
  durationMs: number
}

function pickSupportedMime(preferred?: string): string {
  const fallbacks = [
    preferred,
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ].filter(Boolean) as string[]

  for (const type of fallbacks) {
    if (type && MediaRecorder.isTypeSupported(type)) return type
  }
  return 'video/webm'
}

export async function recordCanvasVideo(
  canvas: HTMLCanvasElement,
  options: RecordCanvasVideoOptions = {},
): Promise<RecordCanvasVideoResult> {
  if (!canvas) throw new Error('Canvas is required for video recording')
  const durationMs = Math.max(100, options.durationMs ?? 3000)
  const fps = Math.max(1, options.fps ?? 30)
  const mimeType = pickSupportedMime(options.mimeType)

  // Ensure the canvas is rendering before capture starts
  const ctx = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas has no rendering context; cannot record')

  // captureStream yields a MediaStream of the live canvas
  const stream = (canvas as any).captureStream?.(fps) as MediaStream | undefined
  if (!stream) throw new Error('captureStream is not supported in this browser')

  const recorder = new MediaRecorder(stream, { mimeType })
  const chunks: BlobPart[] = []

  const blobPromise = new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunks.push(event.data)
    }
    recorder.onerror = (e) => reject(e.error ?? e)
    recorder.onstop = () => {
      try {
        resolve(new Blob(chunks, { type: mimeType }))
      } catch (err) {
        reject(err)
      }
    }
  })

  recorder.start(Math.max(1000 / fps, 10))

  // Optional simple progress callback
  if (typeof options.onProgress === 'function') {
    const start = performance.now()
    const tick = () => {
      const elapsed = performance.now() - start
      options.onProgress!(Math.min(1, elapsed / durationMs))
      if (elapsed < durationMs && recorder.state === 'recording') {
        requestAnimationFrame(tick)
      }
    }
    requestAnimationFrame(tick)
  }

  // Stop after duration
  await new Promise<void>((resolve) => setTimeout(resolve, durationMs))
  if (recorder.state === 'recording') recorder.stop()

  const blob = await blobPromise
  const buffer = Buffer.from(await blob.arrayBuffer())

  return { blob, buffer, mimeType, durationMs }
}
