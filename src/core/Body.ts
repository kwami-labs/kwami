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
  angle?: number;
  stops?: number[];
  opacity: number;
}

interface BackgroundGradientOptions {
  direction?: BackgroundDirection;
  angle?: number;
  stops?: number[];
  opacity?: number;
}

interface BlobImageTransparencyOptions {
  colors?: string[];
  type?: 'gradient' | 'solid';
  direction?: BackgroundDirection;
  angle?: number;
  stops?: number[];
  opacity?: number;
  mode?: 'overlay' | 'glass';
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
   * Randomize the blob appearance while maintaining current skin
   * This randomizes geometry, colors, and animation parameters
   */
  randomizeBlob(): void {
    const currentSkin = this.blob.currentSkin;
    const currentScale = this.blob.getScale();
    
    // Randomize the blob
    this.blob.setRandomBlob();
    
    // Restore scale and skin
    this.blob.setScale(currentScale);
    this.blob.setSkin(currentSkin);
  }

  /**
   * Reset blob to default values
   */
  resetBlobToDefaults(): void {
    const defaults = {
      spikes: { x: 0.2, y: 0.2, z: 0.2 },
      time: { x: 1, y: 1, z: 1 },
      rotation: { x: 0, y: 0, z: 0 },
      colors: { x: '#ff0066', y: '#00ff66', z: '#6600ff' },
      scale: 4.0,
      resolution: 180,
      shininess: 50,
      wireframe: false,
      skin: 'tricolor' as BlobSkinType,
      opacity: 1
    };

    this.blob.setSpikes(defaults.spikes.x, defaults.spikes.y, defaults.spikes.z);
    this.blob.setTime(defaults.time.x, defaults.time.y, defaults.time.z);
    this.blob.setRotation(defaults.rotation.x, defaults.rotation.y, defaults.rotation.z);
    this.blob.setColors(defaults.colors.x, defaults.colors.y, defaults.colors.z);
    this.blob.setScale(defaults.scale);
    this.blob.setResolution(defaults.resolution);
    this.blob.setShininess(defaults.shininess);
    this.blob.setWireframe(defaults.wireframe);
    this.blob.setSkin(defaults.skin);
    this.blob.setOpacity(defaults.opacity);
  }

  /**
   * Reset camera to default position
   */
  resetCameraPosition(): void {
    const defaultPosition = { x: -0.9, y: 7.3, z: -1.8 };
    this.camera.position.set(defaultPosition.x, defaultPosition.y, defaultPosition.z);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Set camera position
   */
  setCameraPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Get camera position
   */
  getCameraPosition(): { x: number; y: number; z: number } {
    return {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z
    };
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
    optionsOrDirection?: BackgroundGradientOptions | BackgroundDirection | number,
    opacityOrOptions?: number | BackgroundGradientOptions,
  ): void {
    let direction: BackgroundDirection = 'vertical';
    let angle: number | undefined;
    let stops: number[] | undefined;
    let opacity = 1;

    const mergeOptions = (options?: BackgroundGradientOptions | null) => {
      if (!options) return;
      if (options.direction) direction = options.direction;
      if (typeof options.angle === 'number' && Number.isFinite(options.angle)) {
        angle = options.angle;
      }
      if (Array.isArray(options.stops)) {
        stops = options.stops.slice();
      }
      if (typeof options.opacity === 'number' && Number.isFinite(options.opacity)) {
        opacity = options.opacity;
      }
    };

    if (typeof optionsOrDirection === 'string') {
      direction = optionsOrDirection;
    } else if (typeof optionsOrDirection === 'number') {
      opacity = optionsOrDirection;
    } else if (optionsOrDirection && typeof optionsOrDirection === 'object') {
      mergeOptions(optionsOrDirection);
    }

    if (typeof opacityOrOptions === 'number') {
      opacity = opacityOrOptions;
    } else if (opacityOrOptions && typeof opacityOrOptions === 'object') {
      mergeOptions(opacityOrOptions);
    }

    const sanitizedStops = this.sanitizeStops(colors.length, stops);

    this.backgroundState = {
      type: 'gradient',
      colors,
      direction,
      angle,
      stops: sanitizedStops,
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
   * Randomize background with random colors and gradient settings
   */
  randomizeBackground(): void {
    const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const colors = [randomColor(), randomColor(), randomColor()];
    const angle = Math.floor(Math.random() * 361);
    const stop1 = Math.floor(Math.random() * 51);
    const stop2 = 50 + Math.floor(Math.random() * 51);
    
    // Randomly choose between linear, radial, or random (3 spheres)
    const styles = ['linear', 'radial', 'random'];
    const style = styles[Math.floor(Math.random() * styles.length)];
    
    if (style === 'random') {
      // Create 3 color spheres placed randomly in the background
      this.setBackgroundSpheres(colors);
    } else if (style === 'radial') {
      // Use radial gradient
      this.setBackgroundGradient(colors, { direction: 'radial', stops: [0, stop1 / 100, stop2 / 100] });
    } else {
      // Use linear gradient with random angle
      this.setBackgroundGradient(colors, { angle, stops: [0, stop1 / 100, stop2 / 100] });
    }
  }

  /**
   * Create a background with 3 randomly placed color spheres
   * @param colors - Array of 3 colors for the spheres
   */
  setBackgroundSpheres(colors: string[]): void {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Fill with a base color (first color with low opacity)
    ctx.fillStyle = colors[0];
    ctx.globalAlpha = 0.3;
    ctx.fillRect(0, 0, 512, 512);
    ctx.globalAlpha = 1.0;
    
    // Create 3 radial gradients at random positions
    for (let i = 0; i < 3; i++) {
      const color = colors[i % colors.length];
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 150 + Math.random() * 200; // Random size between 150-350
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, color + '80'); // Semi-transparent
      gradient.addColorStop(1, color + '00'); // Fully transparent
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
    }
    
    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    this.backgroundState = {
      type: 'gradient',
      colors,
      direction: 'vertical',
      opacity: 1,
    };
    
    // Apply the custom texture directly to the scene
    if (this.blobImageMode === 'none') {
      this.scene.background = texture;
    }
  }

  /**
   * Set background opacity
   */
  setBackgroundOpacity(opacity: number): void {
    this.backgroundState.opacity = Math.max(0, Math.min(1, opacity));
    this.applyBackgroundState();
  }

  /**
   * Get current background opacity
   */
  getBackgroundOpacity(): number {
    return this.backgroundState.opacity;
  }

  /**
   * Configure blob transparency modes (overlay/glass window)
   */
  setBlobImageTransparencyMode(
    enabled: boolean,
    optionsOrColors?: BlobImageTransparencyOptions | string[],
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

    let options: BlobImageTransparencyOptions = {};

    if (Array.isArray(optionsOrColors)) {
      options = {
        colors: optionsOrColors,
        type,
        direction,
        opacity,
        mode,
      };
    } else if (optionsOrColors && typeof optionsOrColors === 'object') {
      options = { ...optionsOrColors };
      options.type = options.type ?? type;
      options.direction = options.direction ?? direction;
      if (options.opacity === undefined) options.opacity = opacity;
      options.mode = options.mode ?? mode;
    } else {
      options = { type, direction, opacity, mode };
    }

    const finalType = options.type ?? 'gradient';
    const finalColors = options.colors;
    const finalOpacity = options.opacity ?? opacity;
    const finalMode = options.mode ?? mode;
    const finalDirection = options.direction ?? direction;
    const finalAngle = options.angle;
    const finalStops = options.stops;

    if (finalType === 'solid' && finalColors && finalColors.length > 0) {
      this.backgroundState = {
        type: 'solid',
        color: finalColors[0],
        colors: [finalColors[0]],
        direction: 'vertical',
        opacity: finalOpacity,
      };
    } else if (finalType === 'gradient' && finalColors && finalColors.length > 0) {
      this.backgroundState = {
        type: 'gradient',
        colors: finalColors,
        direction: finalDirection,
        angle: finalAngle ?? this.backgroundState.angle,
        stops: this.sanitizeStops(finalColors.length, finalStops),
        opacity: finalOpacity,
      };
    } else {
      this.backgroundState = {
        ...this.backgroundState,
        opacity: finalOpacity,
        direction: finalDirection ?? this.backgroundState.direction,
        angle: finalAngle ?? this.backgroundState.angle,
        stops: finalStops
          ? this.sanitizeStops(this.backgroundState.colors?.length ?? 0, finalStops)
          : this.backgroundState.stops,
      };
    }

    this.blobImageMode = finalMode;
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
        state.angle,
        state.stops,
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
    material.stencilFuncMask = 0xff;
    material.stencilWriteMask = 0x00;
    material.stencilFail = KeepStencilOp;
    material.stencilZFail = KeepStencilOp;
    material.stencilZPass = KeepStencilOp;

    if (this.blobImageMode === 'glass') {
      this.blob.setGlassMode(true);
      material.stencilWrite = true;
      material.stencilFunc = NotEqualStencilFunc;
      material.stencilRef = 1;
      if (this.backgroundPlane) {
        this.backgroundPlane.renderOrder = 10;
      }
    } else {
      this.blob.setGlassMode(false);
      material.stencilWrite = false;
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
        state.angle,
        state.stops,
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
        angle: config.gradient.angle,
        stops: this.sanitizeStops(config.gradient.colors.length, config.gradient.stops),
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
    opacity: number = 1,
    angle?: number,
    stops?: number[],
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
    } else if (typeof angle === 'number' && Number.isFinite(angle)) {
      gradient = this.createLinearGradientWithAngle(ctx, angle);
    } else if (direction === 'horizontal') {
      gradient = ctx.createLinearGradient(0, 0, 512, 0);
    } else if (direction === 'diagonal') {
      gradient = ctx.createLinearGradient(0, 0, 512, 512);
    } else {
      // vertical (default)
      gradient = ctx.createLinearGradient(0, 0, 0, 512);
    }
    
    const normalizedStops = this.getStopsForGradient(colors.length, stops);
    normalizedStops.forEach((stop, index) => {
      gradient.addColorStop(Math.max(0, Math.min(1, stop)), colors[index]);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    return new CanvasTexture(canvas);
  }

  private createLinearGradientWithAngle(ctx: CanvasRenderingContext2D, angle: number): CanvasGradient {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const radians = ((angle % 360) - 90) * (Math.PI / 180);
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const x0 = halfWidth - cos * halfWidth;
    const y0 = halfHeight - sin * halfHeight;
    const x1 = halfWidth + cos * halfWidth;
    const y1 = halfHeight + sin * halfHeight;

    return ctx.createLinearGradient(x0, y0, x1, y1);
  }

  private getStopsForGradient(count: number, stops?: number[]): number[] {
    if (count <= 0) return [0];
    const sanitized = this.sanitizeStops(count, stops);
    if (sanitized) return sanitized;

    if (count === 1) return [0];
    if (count === 2) return [0, 1];

    return Array.from({ length: count }, (_, index) => index / (count - 1));
  }

  private sanitizeStops(count: number, stops?: number[]): number[] | undefined {
    if (!Array.isArray(stops) || stops.length !== count || count <= 0) {
      return undefined;
    }

    const sanitized = stops.map((stop, index) => {
      const numeric = Number(stop);
      if (!Number.isFinite(numeric)) {
        return count > 1 ? index / (count - 1) : 0;
      }
      return Math.max(0, Math.min(1, numeric));
    });

    for (let i = 1; i < sanitized.length; i++) {
      if (sanitized[i] < sanitized[i - 1]) {
        sanitized[i] = sanitized[i - 1];
      }
    }

    return sanitized;
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
