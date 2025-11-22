import type { Mesh, PerspectiveCamera } from 'three';

/**
 * BlobPosition - Manages normalized position coordinates for the blob
 * Uses 0-1 range where 0.5 is center, allowing positioning as percentage of viewport
 */
export class BlobPosition {
  private _x: number = 0.5; // Default center (50%)
  private _y: number = 0.5; // Default middle (50%)
  private mesh: Mesh;
  private camera: PerspectiveCamera;
  private canvas: HTMLCanvasElement;

  constructor(mesh: Mesh, camera: PerspectiveCamera, canvas: HTMLCanvasElement) {
    this.mesh = mesh;
    this.camera = camera;
    this.canvas = canvas;
  }

  /**
   * Set horizontal position as normalized value (0-1)
   * 0 = left edge, 0.5 = center (default), 1 = right edge
   * @param value - Normalized x position (0-1)
   * @returns The BlobPosition instance for chaining
   */
  x(value: number): BlobPosition {
    this._x = Math.max(0, Math.min(1, value)); // Clamp to 0-1
    this.updatePosition();
    return this;
  }

  /**
   * Set vertical position as normalized value (0-1)
   * 0 = bottom edge, 0.5 = middle (default), 1 = top edge
   * @param value - Normalized y position (0-1)
   * @returns The BlobPosition instance for chaining
   */
  y(value: number): BlobPosition {
    this._y = Math.max(0, Math.min(1, value)); // Clamp to 0-1
    this.updatePosition();
    return this;
  }

  /**
   * Get current normalized x position
   */
  getX(): number {
    return this._x;
  }

  /**
   * Get current normalized y position
   */
  getY(): number {
    return this._y;
  }

  /**
   * Set both x and y position at once
   * @param x - Normalized x position (0-1)
   * @param y - Normalized y position (0-1)
   * @returns The BlobPosition instance for chaining
   */
  set(x: number, y: number): BlobPosition {
    this._x = Math.max(0, Math.min(1, x));
    this._y = Math.max(0, Math.min(1, y));
    this.updatePosition();
    return this;
  }

  /**
   * Reset position to center (0.5, 0.5)
   * @returns The BlobPosition instance for chaining
   */
  reset(): BlobPosition {
    this._x = 0.5;
    this._y = 0.5;
    this.updatePosition();
    return this;
  }

  /**
   * Update the actual mesh position based on normalized coordinates
   * Converts 0-1 values to world space coordinates that correspond to viewport positions
   * @internal
   */
  updatePosition(): void {
    const worldPos = this.normalizedToWorld(this._x, this._y);
    this.mesh.position.x = worldPos.x;
    this.mesh.position.y = worldPos.y;
    // Keep z position unchanged
  }

  /**
   * Convert normalized screen coordinates (0-1) to Three.js world coordinates
   * This calculates where in the 3D world space a point needs to be to appear
   * at a specific percentage of the viewport
   */
  private normalizedToWorld(normalizedX: number, normalizedY: number): { x: number; y: number } {
    // Get canvas dimensions
    const width = this.canvas.clientWidth || this.canvas.width;
    const height = this.canvas.clientHeight || this.canvas.height;
    const aspect = width / height;

    // Calculate distance from camera to the blob's z position (or default if not set)
    // Use the camera's lookAt point (0,0,0) as reference
    const distance = Math.abs(this.camera.position.z);

    // Get camera's field of view and calculate visible height at that distance
    const fov = this.camera.fov * (Math.PI / 180); // Convert to radians
    const visibleHeight = 2 * Math.tan(fov / 2) * distance;
    const visibleWidth = visibleHeight * aspect;

    // Convert normalized coordinates (0-1) to world coordinates
    // Map [0, 1] to [-visibleWidth/2, +visibleWidth/2]
    const worldX = (normalizedX - 0.5) * visibleWidth;
    const worldY = (normalizedY - 0.5) * visibleHeight;

    return { x: worldX, y: worldY };
  }

  /**
   * Call this when canvas is resized to recalculate position
   * @internal
   */
  refresh(): void {
    this.updatePosition();
  }
}

