import type { Mesh, PerspectiveCamera } from 'three'

/**
 * BlobPosition - Manages normalized position coordinates for the blob
 * Uses 0-1 range where 0.5 is center, allowing positioning as percentage of viewport
 */
export class BlobXyzPosition {
  private _x: number = 0.5 // Default center (50%)
  private _y: number = 0.5 // Default middle (50%)
  private mesh: Mesh
  private camera: PerspectiveCamera
  private canvas: HTMLCanvasElement
  private _animationId: number | null = null

  constructor(mesh: Mesh, camera: PerspectiveCamera, canvas: HTMLCanvasElement) {
    this.mesh = mesh
    this.camera = camera
    this.canvas = canvas
  }

  /**
   * Set horizontal position as normalized value (0-1)
   * 0 = left edge, 0.5 = center (default), 1 = right edge
   */
  x(value: number): BlobXyzPosition {
    this._x = Math.max(0, Math.min(1, value))
    this.updatePosition()
    return this
  }

  /**
   * Set vertical position as normalized value (0-1)
   * 0 = bottom edge, 0.5 = middle (default), 1 = top edge
   */
  y(value: number): BlobXyzPosition {
    this._y = Math.max(0, Math.min(1, value))
    this.updatePosition()
    return this
  }

  /**
   * Get current normalized x position
   */
  getX(): number {
    return this._x
  }

  /**
   * Get current normalized y position
   */
  getY(): number {
    return this._y
  }

  /**
   * Set both x and y position at once
   */
  set(x: number, y: number): BlobXyzPosition {
    this._x = Math.max(0, Math.min(1, x))
    this._y = Math.max(0, Math.min(1, y))
    this.updatePosition()
    return this
  }

  /**
   * Reset position to center (0.5, 0.5)
   */
  reset(): BlobXyzPosition {
    this._x = 0.5
    this._y = 0.5
    this.updatePosition()
    return this
  }

  /**
   * Smoothly animate to a target position over a given duration.
   * Uses requestAnimationFrame for smooth interpolation.
   */
  animateTo(targetX: number, targetY: number, durationMs: number = 600): BlobXyzPosition {
    if (this._animationId !== null) {
      cancelAnimationFrame(this._animationId)
      this._animationId = null
    }

    const startX = this._x
    const startY = this._y
    const tx = Math.max(0, Math.min(1, targetX))
    const ty = Math.max(0, Math.min(1, targetY))
    const startTime = performance.now()

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3)

      this._x = startX + (tx - startX) * ease
      this._y = startY + (ty - startY) * ease
      this.updatePosition()

      if (progress < 1) {
        this._animationId = requestAnimationFrame(step)
      } else {
        this._animationId = null
      }
    }

    this._animationId = requestAnimationFrame(step)
    return this
  }

  /**
   * Update the actual mesh position based on normalized coordinates
   */
  updatePosition(): void {
    const worldPos = this.normalizedToWorld(this._x, this._y)
    this.mesh.position.x = worldPos.x
    this.mesh.position.y = worldPos.y
  }

  /**
   * Convert normalized screen coordinates (0-1) to Three.js world coordinates
   */
  private normalizedToWorld(normalizedX: number, normalizedY: number): { x: number; y: number } {
    const width = this.canvas.clientWidth || this.canvas.width
    const height = this.canvas.clientHeight || this.canvas.height
    const aspect = width / height

    const distance = Math.abs(this.camera.position.z)
    const fov = this.camera.fov * (Math.PI / 180)
    const visibleHeight = 2 * Math.tan(fov / 2) * distance
    const visibleWidth = visibleHeight * aspect

    const worldX = (normalizedX - 0.5) * visibleWidth
    const worldY = (normalizedY - 0.5) * visibleHeight

    return { x: worldX, y: worldY }
  }

  /**
   * Call this when canvas is resized to recalculate position
   */
  refresh(): void {
    this.updatePosition()
  }
}
