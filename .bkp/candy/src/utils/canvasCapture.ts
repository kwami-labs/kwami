/**
 * Canvas Capture Utility
 * Captures Three.js canvas as image for Arweave upload
 */

/**
 * Capture canvas element as PNG blob
 */
export async function captureCanvasAsBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to capture canvas as blob'))
      }
    }, 'image/png', 1.0) // Maximum quality
  })
}

/**
 * Capture canvas element as data URL
 */
export function captureCanvasAsDataURL(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png', 1.0)
}

/**
 * Convert blob to buffer for Arweave upload
 */
export async function blobToBuffer(blob: Blob): Promise<Buffer> {
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Capture canvas and prepare for upload
 * Returns buffer ready for Arweave
 */
export async function captureAndPrepareForUpload(canvas: HTMLCanvasElement): Promise<Buffer> {
  console.log('[Canvas] Capturing canvas:', {
    width: canvas.width,
    height: canvas.height,
    hasContext: !!canvas.getContext('webgl2') || !!canvas.getContext('webgl')
  })
  
  // Force canvas to render current frame
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
  if (gl) {
    gl.finish() // Wait for all rendering commands to complete
  }
  
  const blob = await captureCanvasAsBlob(canvas)
  console.log('[Canvas] Blob captured:', { size: blob.size, type: blob.type })
  
  // Debug: Create temporary download link to verify image
  const debugUrl = URL.createObjectURL(blob)
  console.log('[Canvas] Debug image URL (open in new tab):', debugUrl)
  console.log('[Canvas] To verify image, run: window.open("' + debugUrl + '")')
  
  const buffer = await blobToBuffer(blob)
  console.log('[Canvas] Buffer created:', { size: buffer.length })
  
  // Validate buffer is not empty or too small
  if (buffer.length < 100) {
    throw new Error('Captured image is too small - canvas may be empty')
  }
  
  return buffer
}

/**
 * Render blob with specific size for NFT display
 */
export async function renderBlobImage(
  canvas: HTMLCanvasElement,
  width: number = 1000,
  height: number = 1000
): Promise<Buffer> {
  // Create temporary canvas with desired dimensions
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = width
  tempCanvas.height = height
  
  const ctx = tempCanvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get 2D context')
  }

  // Draw original canvas to temp canvas with scaling
  ctx.drawImage(canvas, 0, 0, width, height)

  // Capture as blob
  const blob = await captureCanvasAsBlob(tempCanvas)
  return await blobToBuffer(blob)
}

/**
 * Create thumbnail from canvas
 */
export async function createThumbnail(
  canvas: HTMLCanvasElement,
  size: number = 300
): Promise<Buffer> {
  return await renderBlobImage(canvas, size, size)
}

/**
 * Validate canvas before capture
 */
export function validateCanvas(canvas: HTMLCanvasElement | null): boolean {
  if (!canvas) {
    console.error('[Canvas] Canvas element is null')
    return false
  }

  if (canvas.width === 0 || canvas.height === 0) {
    console.error('[Canvas] Canvas has zero dimensions')
    return false
  }

  return true
}
