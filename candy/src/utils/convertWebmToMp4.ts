/**
 * Convert WebM video to MP4 using FFmpeg.wasm
 * This is needed because Phantom wallet may not support WebM properly
 */

import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

let ffmpeg: FFmpeg | null = null

async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg

  ffmpeg = new FFmpeg()
  
  // Load FFmpeg (this downloads ~30MB on first use)
  await ffmpeg.load({
    coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
    wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
  })

  return ffmpeg
}

export async function convertWebmToMp4(
  webmBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob; buffer: Buffer }> {
  console.log('[Video Convert] Starting WebM to MP4 conversion...')
  
  const ffmpeg = await loadFFmpeg()

  // Listen for progress
  if (onProgress) {
    ffmpeg.on('progress', ({ progress }) => {
      onProgress(progress)
    })
  }

  // Write input file
  await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob))

  // Convert to MP4 with fast settings for browser
  await ffmpeg.exec([
    '-i', 'input.webm',
    '-c:v', 'libx264',           // H.264 codec (widely supported)
    '-preset', 'ultrafast',      // Fastest encoding (trades file size for speed)
    '-crf', '28',                // Lower quality but faster (28 is still acceptable)
    '-movflags', '+faststart',   // Enable streaming
    '-vf', 'scale=-2:480',       // Reduce to 480p for smaller file
    'output.mp4'
  ])

  // Read output file
  const data = await ffmpeg.readFile('output.mp4')
  const buffer = Buffer.from(data as Uint8Array)
  const blob = new Blob([buffer], { type: 'video/mp4' })

  // Clean up
  await ffmpeg.deleteFile('input.webm')
  await ffmpeg.deleteFile('output.mp4')

  console.log('[Video Convert] Conversion complete!', {
    inputSize: webmBlob.size,
    outputSize: buffer.length
  })

  return { blob, buffer }
}
