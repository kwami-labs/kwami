import type {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
} from 'three';
import {
  Color,
  CanvasTexture,
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  Vector3,
  TextureLoader,
  Texture,
  SRGBColorSpace,
  AlwaysStencilFunc,
  NotEqualStencilFunc,
  KeepStencilOp,
} from 'three';
import { KwamiAudio } from './Audio';
import { Blob } from '../blob/Blob.js';
import { setupScene } from '../scene/setup.js';
import type { BodyConfig, BlobSkinType, SceneBackgroundConfig } from '../types/index';

type BackgroundDirection = 'vertical' | 'horizontal' | 'radial' | 'diagonal';
type BlobImageMode = 'none' | 'overlay' | 'glass';

interface BackgroundState {
  type: 'transparent' | 'solid' | 'gradient';
  color?: string;
  colors?: string[];
  direction?: BackgroundDirection;
  opacity: number;
}

const DEFAULT_BACKGROUND_STATE: BackgroundState = {
  type: 'transparent',
  opacity: 1,
};

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
  private backgroundPlane: Mesh | null = null;
  private backgroundPlaneTexture: CanvasTexture | null = null;
  private blobImageMode: BlobImageMode = 'none';
  private backgroundTexture: Texture | null = null;
  private currentBackgroundImageUrl: string | null = null;
  private readonly textureLoader = new TextureLoader();
  private backgroundState: BackgroundState = { ...DEFAULT_BACKGROUND_STATE };

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
      onAfterRender: () => this.refreshBlobImageTransparencyMode(),
      ...config?.blob,
    });

    // Add blob to scene
    this.scene.add(this.blob.getMesh());

    // Setup resize handling
    this.setupResize();

    if (config?.scene?.background) {
      this.setBackground(config.scene.background);
    } else {
      this.applyBackgroundState();
    }
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
   * Double-click triggers conversation if callback is set
   */
  enableBlobInteraction(onConversationToggle?: () => Promise<void>): void {
    this.blob.onConversationToggle = onConversationToggle;
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
    this.backgroundState = this.mapConfigToBackgroundState(config);
    this.applyBackgroundState();
  }

  /**
   * Set a solid color background
   * @param color - Hex color string (e.g., '#667eea')
   * @param opacity - Opacity value (0-1), default 1
   */
  setBackgroundColor(color: string, opacity: number = 1): void {
    this.backgroundState = {
      type: 'solid',
      color,
      colors: [color],
      direction: 'vertical',
      opacity,
    };
    this.applyBackgroundState();
  }

  /**
   * Set a gradient background
   * @param colors - Array of hex color strings
   * @param direction - Gradient direction ('vertical', 'horizontal', 'radial', or 'diagonal')
   * @param opacity - Opacity value (0-1), default 1
   */
  setBackgroundGradient(
    colors: string[],
    direction: BackgroundDirection = 'vertical',
    opacity: number = 1,
  ): void {
    this.backgroundState = {
      type: 'gradient',
      colors,
      direction,
      opacity,
    };
    this.applyBackgroundState();
  }

  /**
   * Set transparent background
   */
  setBackgroundTransparent(): void {
    this.backgroundState = { ...DEFAULT_BACKGROUND_STATE };
    this.applyBackgroundState();
  }

  /**
   * Configure blob transparency modes (overlay/glass window)
   */
  setBlobImageTransparencyMode(
    enabled: boolean,
    colors?: string[],
    type: 'gradient' | 'solid' = 'gradient',
    direction: BackgroundDirection = 'vertical',
    opacity: number = 1,
    mode: 'overlay' | 'glass' = 'overlay',
  ): void {
    if (!enabled) {
      this.blobImageMode = 'none';
      this.applyBackgroundState();
      this.updateBlobBackgroundTextureForMode();
      return;
    }

    if (type === 'solid' && colors && colors.length > 0) {
      this.backgroundState = {
        type: 'solid',
        color: colors[0],
        colors: [colors[0]],
        direction: 'vertical',
        opacity,
      };
    } else if (type === 'gradient' && colors && colors.length > 0) {
      this.backgroundState = {
        type: 'gradient',
        colors,
        direction,
        opacity,
      };
    } else {
      this.backgroundState = {
        ...this.backgroundState,
        opacity,
        direction: this.backgroundState.direction ?? direction,
      };
    }

    this.blobImageMode = mode;
    this.applyBackgroundState();
    this.updateBlobBackgroundTextureForMode();
  }

  /**
   * Returns whether blob image transparency mode is active
   */
  isBlobImageTransparencyMode(): boolean {
    return this.blobImageMode !== 'none';
  }

  setBlobBackgroundImage(imagePath: string | null): void {
    this.currentBackgroundImageUrl = imagePath;

    if (!imagePath) {
      if (this.backgroundTexture) {
        this.backgroundTexture.dispose();
        this.backgroundTexture = null;
      }
      this.updateBlobBackgroundTextureForMode();
      return;
    }

    const url = imagePath;

    this.textureLoader.load(
      url,
      (texture) => {
        if (this.currentBackgroundImageUrl !== imagePath) {
          texture.dispose();
          return;
        }

        texture.colorSpace = SRGBColorSpace;
        texture.needsUpdate = true;

        if (this.backgroundTexture) {
          this.backgroundTexture.dispose();
        }

        this.backgroundTexture = texture;
        this.updateBlobBackgroundTextureForMode();
      },
      undefined,
      () => {
        if (this.currentBackgroundImageUrl === imagePath) {
          this.backgroundTexture = null;
          this.updateBlobBackgroundTextureForMode();
        }
      },
    );
  }

  refreshBlobImageTransparencyMode(): void {
    if (this.blobImageMode === 'none') return;
    this.updateBackgroundPlaneTransform();
  }

  private applyBackgroundState(): void {
    const state = this.backgroundState;

    if (this.blobImageMode === 'none') {
      this.blob.setGlassMode(false);
      this.disposeBackgroundPlane();
      this.applyStateToSceneBackground(state);
      return;
    }

    this.scene.background = null;
    const plane = this.ensureBackgroundPlane();
    const material = plane.material as MeshBasicMaterial;

    this.configureBackgroundPlaneMaterial(material);
    this.updateBackgroundPlaneTexture(state);

    material.opacity = state.opacity;
    material.needsUpdate = true;

    this.updateBackgroundPlaneTransform();
  }

  private applyStateToSceneBackground(state: BackgroundState): void {
    if (state.type === 'transparent') {
      this.scene.background = null;
      return;
    }

    if (state.type === 'solid' && state.color) {
      if (state.opacity >= 1) {
        this.scene.background = new Color(state.color);
      } else {
        this.scene.background = this.createSolidColorTexture(state.color, state.opacity);
      }
      return;
    }

    if (state.type === 'gradient' && state.colors) {
      this.scene.background = this.createGradientTexture(
        state.colors,
        state.direction ?? 'vertical',
        state.opacity,
      );
    }
  }

  private ensureBackgroundPlane(): Mesh {
    if (!this.backgroundPlane) {
      const geometry = new PlaneGeometry(200, 200);
      const material = new MeshBasicMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });
      material.stencilWrite = false;
      this.backgroundPlane = new Mesh(geometry, material);
      this.scene.add(this.backgroundPlane);
    }

    return this.backgroundPlane;
  }

  private configureBackgroundPlaneMaterial(material: MeshBasicMaterial): void {
    material.depthWrite = false;
    material.depthTest = false;
    material.transparent = true;
    material.stencilWrite = false;
    material.stencilFuncMask = 0xff;
    material.stencilWriteMask = 0xff;
    material.stencilFail = KeepStencilOp;
    material.stencilZFail = KeepStencilOp;
    material.stencilZPass = KeepStencilOp;

    if (this.blobImageMode === 'glass') {
      this.blob.setGlassMode(true);
      material.stencilFunc = NotEqualStencilFunc;
      material.stencilRef = 1;
      if (this.backgroundPlane) {
        this.backgroundPlane.renderOrder = 10;
      }
    } else {
      this.blob.setGlassMode(false);
      material.stencilFunc = AlwaysStencilFunc;
      material.stencilRef = 0;
      if (this.backgroundPlane) {
        this.backgroundPlane.renderOrder = -1;
      }
    }
  }

  private updateBackgroundPlaneTexture(state: BackgroundState): void {
    if (!this.backgroundPlane) return;

    const material = this.backgroundPlane.material as MeshBasicMaterial;

    if (this.backgroundPlaneTexture) {
      this.backgroundPlaneTexture.dispose();
      this.backgroundPlaneTexture = null;
    }

    if (state.type === 'solid' && state.color) {
      this.backgroundPlaneTexture = this.createSolidColorTexture(state.color, state.opacity);
    } else if (state.type === 'gradient' && state.colors) {
      this.backgroundPlaneTexture = this.createGradientTexture(
        state.colors,
        state.direction ?? 'vertical',
        state.opacity,
      );
    } else {
      material.map = null;
      return;
    }

    this.backgroundPlaneTexture.needsUpdate = true;
    material.map = this.backgroundPlaneTexture;
  }

  private mapConfigToBackgroundState(config?: SceneBackgroundConfig): BackgroundState {
    if (!config || !config.type || config.type === 'transparent') {
      return { ...DEFAULT_BACKGROUND_STATE, opacity: config?.opacity ?? 1 };
    }

    if (config.type === 'solid' && config.color) {
      const opacity = config.opacity ?? 1;
      return {
        type: 'solid',
        color: config.color,
        colors: [config.color],
        direction: 'vertical',
        opacity,
      };
    }

    if (config.type === 'gradient' && config.gradient) {
      const opacity = config.gradient.opacity ?? config.opacity ?? 1;
      return {
        type: 'gradient',
        colors: config.gradient.colors,
        direction: config.gradient.direction ?? 'vertical',
        opacity,
      };
    }

    return { ...DEFAULT_BACKGROUND_STATE };
  }

  private disposeBackgroundPlane(): void {
    if (!this.backgroundPlane) {
      if (this.backgroundPlaneTexture) {
        this.backgroundPlaneTexture.dispose();
        this.backgroundPlaneTexture = null;
      }
      return;
    }

    const material = this.backgroundPlane.material as MeshBasicMaterial;
    if (material.map) {
      material.map.dispose();
      material.map = null;
    }
    material.dispose();
    this.backgroundPlane.geometry.dispose();
    this.scene.remove(this.backgroundPlane);
    this.backgroundPlane = null;

    if (this.backgroundPlaneTexture) {
      this.backgroundPlaneTexture.dispose();
      this.backgroundPlaneTexture = null;
    }
  }

  private updateBlobBackgroundTextureForMode(): void {
    if (this.blobImageMode === 'overlay' && this.backgroundTexture) {
      this.blob.setBackgroundTexture(this.backgroundTexture);
    } else {
      this.blob.setBackgroundTexture(null);
    }
  }

  private updateBackgroundPlaneTransform(): void {
    if (!this.backgroundPlane) return;

    const cameraDirection = new Vector3();
    this.camera.getWorldDirection(cameraDirection);

    const planePosition = this.camera.position.clone().add(cameraDirection.multiplyScalar(50));
    this.backgroundPlane.position.copy(planePosition);
    this.backgroundPlane.quaternion.copy(this.camera.quaternion);
  }

  /**
   * Get current background type
   */
  getBackgroundType(): 'transparent' | 'color' | 'texture' {
    if (this.blobImageMode !== 'none') {
      if (this.backgroundState.type === 'solid') return 'color';
      if (this.backgroundState.type === 'gradient') return 'texture';
      return 'transparent';
    }

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
    direction: BackgroundDirection,
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
    } else if (direction === 'diagonal') {
      gradient = ctx.createLinearGradient(0, 0, 512, 512);
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

    this.blobImageMode = 'none';
    this.blob.setGlassMode(false);
    this.disposeBackgroundPlane();
    if (this.backgroundTexture) {
      this.backgroundTexture.dispose();
      this.backgroundTexture = null;
    }
    this.blob.setBackgroundTexture(null);

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
