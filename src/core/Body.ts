import type {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
} from 'three';
import { Color, CanvasTexture } from 'three';
import { KwamiAudio } from './Audio';
import { Blob } from '../blob/Blob.js';
import { setupScene } from '../scene/setup.js';
import type { BodyConfig, BlobSkinType, SceneBackgroundConfig } from '../types/index';

/**
 * KwamiBody - Manages the 3D visual representation of Kwami
 * Handles the THREE.js scene, renderer, camera, and the blob mesh
 */
export class KwamiBody {
  private canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;
  private scene: Scene;
  private resizeObserver?: ResizeObserver;

  public audio: KwamiAudio;
  public blob: Blob;

  constructor(canvas: HTMLCanvasElement, config?: BodyConfig) {
    this.canvas = canvas;

    // Setup the 3D scene
    const sceneSetup = setupScene(this.canvas, config?.scene);
    this.renderer = sceneSetup.renderer;
    this.camera = sceneSetup.camera;
    this.scene = sceneSetup.scene;

    // Initialize audio
    this.audio = new KwamiAudio(config?.audioFiles || [], config?.audio);

    // Create the blob
    this.blob = new Blob({
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
      audio: this.audio,
      skin: config?.initialSkin || 'tricolor',
      ...config?.blob,
    });

    // Add blob to scene
    this.scene.add(this.blob.getMesh());

    // Setup resize handling
    this.setupResize();
  }

  /**
   * Setup automatic resize handling
   */
  private setupResize(): void {
    const handleResize = () => {
      const width = this.canvas.clientWidth;
      const height = this.canvas.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    };

    // Use ResizeObserver for better resize handling
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(handleResize);
      this.resizeObserver.observe(this.canvas);
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', handleResize);
    }

    // Initial resize
    handleResize();
  }

  /**
   * Change the blob's skin
   */
  setSkin(skin: BlobSkinType): void {
    this.blob.setSkin(skin);
  }

  /**
   * Get the THREE.js scene
   */
  getScene(): Scene {
    return this.scene;
  }

  /**
   * Get the THREE.js camera
   */
  getCamera(): PerspectiveCamera {
    return this.camera;
  }

  /**
   * Get the THREE.js renderer
   */
  getRenderer(): WebGLRenderer {
    return this.renderer;
  }

  /**
   * Export the blob as GLB file
   */
  exportAsGLB(): void {
    this.blob.exportGLTF();
  }

  /**
   * Enable click interaction on the blob
   * Click to create liquid-like touch effects
   */
  enableBlobInteraction(): void {
    this.blob.enableClickInteraction();
  }

  /**
   * Disable click interaction on the blob
   */
  disableBlobInteraction(): void {
    this.blob.disableClickInteraction();
  }

  /**
   * Check if blob is currently listening to microphone
   */
  isListening(): boolean {
    return this.blob.isListening;
  }

  /**
   * Start listening to microphone (double-click also triggers this)
   */
  async startListening(): Promise<void> {
    await this.blob.startListening();
  }

  /**
   * Stop listening to microphone
   */
  stopListening(): void {
    this.blob.stopListening();
  }

  /**
   * Check if blob is currently in thinking mode
   */
  isThinking(): boolean {
    return this.blob.isThinking;
  }

  /**
   * Start thinking mode (random animation for 10 seconds)
   */
  startThinking(): void {
    this.blob.startThinking();
  }

  /**
   * Stop thinking mode
   */
  stopThinking(): void {
    this.blob.stopThinking();
  }

  /**
   * Set the scene background
   * @param config - Background configuration
   */
  setBackground(config: SceneBackgroundConfig): void {
    if (!config || config.type === 'transparent') {
      this.scene.background = null;
      return;
    }
    
    if (config.type === 'solid' && config.color) {
      this.scene.background = new Color(config.color);
      return;
    }
    
    if (config.type === 'gradient' && config.gradient) {
      const gradientTexture = this.createGradientTexture(
        config.gradient.colors,
        config.gradient.direction || 'vertical'
      );
      this.scene.background = gradientTexture;
      return;
    }
  }

  /**
   * Set a solid color background
   * @param color - Hex color string (e.g., '#667eea')
   * @param opacity - Opacity value (0-1), default 1
   */
  setBackgroundColor(color: string, opacity: number = 1): void {
    if (opacity >= 1) {
      this.scene.background = new Color(color);
    } else {
      // Use canvas texture for opacity support
      const texture = this.createSolidColorTexture(color, opacity);
      this.scene.background = texture;
    }
  }

  /**
   * Set a gradient background
   * @param colors - Array of hex color strings
   * @param direction - Gradient direction ('vertical', 'horizontal', or 'radial')
   * @param opacity - Opacity value (0-1), default 1
   */
  setBackgroundGradient(
    colors: string[],
    direction: 'vertical' | 'horizontal' | 'radial' = 'vertical',
    opacity: number = 1
  ): void {
    const gradientTexture = this.createGradientTexture(colors, direction, opacity);
    this.scene.background = gradientTexture;
  }

  /**
   * Set transparent background
   */
  setBackgroundTransparent(): void {
    this.scene.background = null;
  }

  /**
   * Get current background type
   */
  getBackgroundType(): 'transparent' | 'color' | 'texture' {
    if (this.scene.background === null) {
      return 'transparent';
    }
    if (this.scene.background instanceof Color) {
      return 'color';
    }
    return 'texture';
  }

  /**
   * Create a gradient texture for background
   * @private
   */
  private createGradientTexture(
    colors: string[],
    direction: 'vertical' | 'horizontal' | 'radial',
    opacity: number = 1
  ): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Set global alpha for opacity
    ctx.globalAlpha = opacity;
    
    let gradient: CanvasGradient;
    
    if (direction === 'radial') {
      gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 512);
    } else if (direction === 'horizontal') {
      gradient = ctx.createLinearGradient(0, 0, 512, 0);
    } else {
      // vertical (default)
      gradient = ctx.createLinearGradient(0, 0, 0, 512);
    }
    
    // Add color stops evenly distributed
    colors.forEach((color, index) => {
      const stop = index / (colors.length - 1);
      gradient.addColorStop(stop, color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    return new CanvasTexture(canvas);
  }

  /**
   * Create a solid color texture for background with opacity support
   * @private
   */
  private createSolidColorTexture(color: string, opacity: number): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Set global alpha for opacity
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 512);
    
    return new CanvasTexture(canvas);
  }

  /**
   * Cleanup and dispose all resources
   */
  dispose(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.blob.dispose();
    this.audio.dispose();
    this.renderer.dispose();

    // Clear scene
    while (this.scene.children.length > 0) {
      const child = this.scene.children[0];
      if (child) {
        this.scene.remove(child);
      }
    }
  }
}
