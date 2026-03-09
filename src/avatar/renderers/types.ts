import type { AvatarRenderer, BlobXyzConfig, SceneConfig } from '../../types'

/**
 * Base interface for avatar renderers
 */
export type { AvatarRenderer }

/**
 * Blob-specific renderer interface
 */
export interface BlobXyzRendererInterface extends AvatarRenderer {
  // Blob-specific methods
  setColors(x: string, y: string, z: string): void
  setSpikes(x: number, y: number, z: number): void
  setAmplitude(x: number, y: number, z: number): void
  setTime(x: number, y: number, z: number): void
  setRotation(x: number, y: number, z: number): void
  setScale(scale: number): void
  setResolution(resolution: number): void
  setShininess(shininess: number): void
  setWireframe(wireframe: boolean): void
  setOpacity(opacity: number): void
  setSkin(skin: { skin: string; subtype?: string }): void

  // Randomization
  randomize(): void
  resetToDefaults(): void

  // Export
  exportGLTF(): void
}

/**
 * Renderer factory function type
 */
export type RendererFactory = (
  canvas: HTMLCanvasElement,
  config?: BlobXyzConfig & { scene?: SceneConfig }
) => AvatarRenderer
