import {
  Scene,
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  CanvasTexture,
  TextureLoader,
  Texture,
  SRGBColorSpace,
  OrthographicCamera,
  WebGLRenderTarget,
  Color,
  Vector2,
} from 'three';
import { logger } from '../../../utils/logger';

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image' | 'transparent';
  // For solid
  color?: string;
  // For gradient
  colors?: string[];
  direction?: 'vertical' | 'horizontal' | 'radial' | 'diagonal';
  // For image
  imageUrl?: string;
  imageFit?: 'cover' | 'contain' | 'stretch';
  // Common
  opacity?: number;
  // Blob transparency mode
  blobTransparencyEnabled?: boolean;
}

/**
 * BackgroundManager - Handles all background rendering for KwamiBody
 * Manages solid colors, gradients, and images entirely within THREE.js
 */
export class BackgroundManager {
  private scene: Scene;
  private backgroundPlane: Mesh | null = null;
  private currentConfig: BackgroundConfig = { type: 'transparent' };
  private textureLoader = new TextureLoader();
  private backgroundTexture: Texture | null = null;
  private gradientCanvas: HTMLCanvasElement | null = null;
  private currentImageUrl: string | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Set the background configuration
   */
  public setBackground(config: BackgroundConfig): void {
    this.currentConfig = { ...config };

    // Clean up previous background
    this.cleanup();

    switch (config.type) {
      case 'transparent':
        this.setTransparentBackground();
        break;
      case 'solid':
        this.setSolidBackground(config.color || '#000000', config.opacity || 1);
        break;
      case 'gradient':
        this.setGradientBackground(
          config.colors || ['#667eea', '#764ba2'],
          config.direction || 'vertical',
          config.opacity || 1
        );
        break;
      case 'image':
        this.setImageBackground(config.imageUrl || '', config.imageFit || 'cover', config.opacity || 1);
        break;
    }
  }

  /**
   * Get the current background texture (for blob transparency effect)
   */
  public getBackgroundTexture(): Texture | null {
    return this.backgroundTexture;
  }

  /**
   * Get current background configuration
   */
  public getConfig(): BackgroundConfig {
    return { ...this.currentConfig };
  }

  /**
   * Set transparent background (no background)
   */
  private setTransparentBackground(): void {
    this.scene.background = null;
    this.removeBackgroundPlane();
  }

  /**
   * Set solid color background
   */
  private setSolidBackground(color: string, opacity: number): void {
    if (opacity >= 1 && !this.currentConfig.blobTransparencyEnabled) {
      // Use scene.background for full opacity when not in blob transparency mode
      this.scene.background = new Color(color);
      this.removeBackgroundPlane();
    } else {
      // Use a plane for transparency support or blob transparency mode
      this.scene.background = null;
      const texture = this.createSolidTexture(color, opacity);
      this.backgroundTexture = texture;
      this.createBackgroundPlane(texture, opacity);
    }
  }

  /**
   * Set gradient background
   */
  private setGradientBackground(colors: string[], direction: string, opacity: number): void {
    this.scene.background = null;
    const texture = this.createGradientTexture(colors, direction as any, opacity);
    this.backgroundTexture = texture;

    if (this.currentConfig.blobTransparencyEnabled) {
      // In blob transparency mode, create a plane
      this.createBackgroundPlane(texture, opacity);
    } else {
      // Normal mode: use as scene background
      this.scene.background = texture;
      this.removeBackgroundPlane();
    }
  }

  /**
   * Set image background
   */
  private setImageBackground(imageUrl: string, fit: string, opacity: number): void {
    if (!imageUrl) return;

    this.currentImageUrl = imageUrl;
    this.scene.background = null;

    this.textureLoader.load(
      imageUrl,
      (texture) => {
        // Check if this is still the current image
        if (this.currentImageUrl !== imageUrl) {
          texture.dispose();
          return;
        }

        texture.colorSpace = SRGBColorSpace;
        texture.needsUpdate = true;
        this.backgroundTexture = texture;

        if (this.currentConfig.blobTransparencyEnabled) {
          // In blob transparency mode, create a plane
          this.createBackgroundPlane(texture, opacity);
        } else {
          // Normal mode: use as scene background
          this.scene.background = texture;
          this.removeBackgroundPlane();
        }
      },
      undefined,
      (error) => {
        logger.error('Failed to load background image:', error);
        this.backgroundTexture = null;
      }
    );
  }

  /**
   * Create a solid color texture
   */
  private createSolidTexture(color: string, opacity: number): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Create a gradient texture
   */
  private createGradientTexture(
    colors: string[],
    direction: 'vertical' | 'horizontal' | 'radial' | 'diagonal',
    opacity: number
  ): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.globalAlpha = opacity;

    let gradient: CanvasGradient;

    switch (direction) {
      case 'horizontal':
        gradient = ctx.createLinearGradient(0, 0, 512, 0);
        break;
      case 'diagonal':
        gradient = ctx.createLinearGradient(0, 0, 512, 512);
        break;
      case 'radial':
        gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        break;
      case 'vertical':
      default:
        gradient = ctx.createLinearGradient(0, 0, 0, 512);
        break;
    }

    // Add color stops evenly distributed
    colors.forEach((color, index) => {
      const stop = index / Math.max(1, colors.length - 1);
      gradient.addColorStop(stop, color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    this.gradientCanvas = canvas;
    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Create a background plane (for transparency effects)
   */
  private createBackgroundPlane(texture: Texture, opacity: number): void {
    this.removeBackgroundPlane();

    const geometry = new PlaneGeometry(200, 200);
    const material = new MeshBasicMaterial({
      map: texture,
      transparent: opacity < 1,
      opacity: opacity,
      depthWrite: false,
      depthTest: false,
    });

    this.backgroundPlane = new Mesh(geometry, material);
    this.backgroundPlane.position.z = -50;
    this.backgroundPlane.renderOrder = -1000;
    this.scene.add(this.backgroundPlane);
  }

  /**
   * Remove the background plane
   */
  private removeBackgroundPlane(): void {
    if (this.backgroundPlane) {
      this.scene.remove(this.backgroundPlane);
      const material = this.backgroundPlane.material as MeshBasicMaterial;
      if (material.map && material.map !== this.backgroundTexture) {
        material.map.dispose();
      }
      material.dispose();
      this.backgroundPlane.geometry.dispose();
      this.backgroundPlane = null;
    }
  }

  /**
   * Update background plane position to follow camera
   */
  public updateBackgroundPlanePosition(cameraPosition: Vector2, cameraZoom: number = 1): void {
    if (this.backgroundPlane) {
      // Keep plane centered and scaled with camera
      this.backgroundPlane.position.x = cameraPosition.x;
      this.backgroundPlane.position.y = cameraPosition.y;
      const scale = 1 / cameraZoom;
      this.backgroundPlane.scale.set(scale, scale, 1);
    }
  }

  /**
   * Enable/disable blob transparency mode
   */
  public setBlobTransparencyMode(enabled: boolean): void {
    if (this.currentConfig.blobTransparencyEnabled !== enabled) {
      this.currentConfig.blobTransparencyEnabled = enabled;
      // Re-apply current background with new mode
      this.setBackground(this.currentConfig);
    }
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    this.removeBackgroundPlane();

    if (this.backgroundTexture && this.backgroundTexture !== this.scene.background) {
      this.backgroundTexture.dispose();
      this.backgroundTexture = null;
    }

    if (this.gradientCanvas) {
      // Canvas cleanup
      this.gradientCanvas = null;
    }

    this.currentImageUrl = null;
  }

  /**
   * Dispose of all resources
   */
  public dispose(): void {
    this.cleanup();
    this.scene.background = null;
  }
}
