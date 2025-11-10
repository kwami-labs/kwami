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
  VideoTexture,
  SRGBColorSpace,
  AlwaysStencilFunc,
  NotEqualStencilFunc,
  KeepStencilOp,
  LinearFilter,
} from 'three';
import { KwamiAudio } from './Audio';
import { Blob } from '../blob/Blob.js';
import { setupScene } from '../scene/setup.js';
import type { BackgroundMediaFit, BodyConfig, BlobSkinType, SceneBackgroundConfig } from '../types/index';

type BackgroundDirection = 'vertical' | 'horizontal' | 'radial' | 'diagonal';
type BlobImageMode = 'none' | 'overlay' | 'glass';

type BackgroundMediaType = 'image' | 'video';

interface BackgroundState {
  type: 'transparent' | 'solid' | 'gradient';
  color?: string;
  colors?: string[];
  direction?: BackgroundDirection;
  angle?: number;
  stops?: number[];
  opacity: number;
  imageUrl?: string;
  imageFit?: BackgroundMediaFit;
  videoUrl?: string;
  videoFit?: BackgroundMediaFit;
  videoAutoplay?: boolean;
  videoLoop?: boolean;
  videoMuted?: boolean;
  videoPlaybackRate?: number;
}

interface BackgroundMediaState {
  type: BackgroundMediaType;
  opacity: number;
  imageUrl?: string;
  imageFit?: BackgroundMediaFit;
  videoUrl?: string;
  videoFit?: BackgroundMediaFit;
  videoAutoplay?: boolean;
  videoLoop?: boolean;
  videoMuted?: boolean;
  videoPlaybackRate?: number;
}

interface BackgroundGradientOptions {
  direction?: BackgroundDirection;
  angle?: number;
  stops?: number[];
  opacity?: number;
}

interface BackgroundImageOptions {
  fit?: BackgroundMediaFit;
  opacity?: number;
}

interface BackgroundVideoOptions extends BackgroundImageOptions {
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playbackRate?: number;
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

const MEDIA_PLANE_DISTANCE = 80;
const GRADIENT_PLANE_DISTANCE = 60;
const BACKGROUND_PLANE_BASE_SIZE = 200;

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
  private usingWindowResizeListener = false;
  private resizeRafId: number | null = null;
  private lastKnownSize = { width: 0, height: 0 };
  private readonly handleResize = () => this.scheduleResize();
  private resizeTransitionActive = false;
  private backgroundPlane: Mesh | null = null; // Gradient/overlay plane
  private backgroundPlaneTexture: Texture | null = null;
  private backgroundMediaPlane: Mesh | null = null;
  private backgroundMediaTexture: Texture | null = null;
  private blobImageMode: BlobImageMode = 'none';
  private backgroundTexture: Texture | null = null;
  // Blob surface media (independent from background overlay)
  private blobSurfaceTexture: Texture | null = null;
  private blobSurfaceVideoElement: HTMLVideoElement | null = null;
  private blobSurfaceVideoTexture: VideoTexture | null = null;
  private currentBlobSurfaceImageUrl: string | null = null;
  private currentBlobSurfaceVideoUrl: string | null = null;
  private currentBackgroundImageUrl: string | null = null;
  private currentMediaImageUrl: string | null = null;
  private currentVideoUrl: string | null = null;
  private backgroundVideoElement: HTMLVideoElement | null = null;
  private backgroundVideoTexture: VideoTexture | null = null;
  private backgroundMediaAspect: number | null = null;
  private backgroundMediaFit: BackgroundMediaFit = 'cover';
  private readonly textureLoader = new TextureLoader();
  private backgroundState: BackgroundState = { ...DEFAULT_BACKGROUND_STATE };
  private backgroundMediaState: BackgroundMediaState | null = null;

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
    const resizeTargets: Element[] = [this.canvas];
    const parentElement = this.canvas.parentElement;
    if (parentElement) resizeTargets.push(parentElement);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      resizeTargets.forEach((target) => this.resizeObserver?.observe(target));
    } else if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize);
      this.usingWindowResizeListener = true;
    } else {
      // Environments without ResizeObserver/window (e.g. SSR) will rely on manual calls
    }

    this.handleResize();
  }

  /**
   * Manually trigger a responsive resize of the viewport
   */
  refreshViewportSize(): void {
    // Mark that we're in a smooth transition (from sidebar toggle)
    this.resizeTransitionActive = true;
    this.handleResize();
    // Reset flag after a short delay
    setTimeout(() => {
      this.resizeTransitionActive = false;
    }, 350);
  }

  private scheduleResize(): void {
    if (typeof window === 'undefined') {
      this.applyResize();
      return;
    }

    if (this.resizeRafId !== null) {
      window.cancelAnimationFrame(this.resizeRafId);
    }

    this.resizeRafId = window.requestAnimationFrame(() => {
      this.resizeRafId = null;
      this.applyResize();
    });
  }

  private applyResize(): void {
    const parent = this.canvas.parentElement;
    const parentRect = parent?.getBoundingClientRect();
    let width = Math.round(parentRect?.width ?? this.canvas.clientWidth ?? 0);
    let height = Math.round(parentRect?.height ?? this.canvas.clientHeight ?? 0);

    if ((!width || !height)) {
      const canvasRect = this.canvas.getBoundingClientRect();
      if (!width) width = Math.round(canvasRect.width);
      if (!height) height = Math.round(canvasRect.height);
    }

    if ((!width || !height) && typeof window !== 'undefined') {
      if (!width) width = Math.round(window.innerWidth);
      if (!height) height = Math.round(window.innerHeight);
    }

    if (!width || !height) {
      return; // Cannot resize with zero dimensions
    }

    if (this.lastKnownSize.width === width && this.lastKnownSize.height === height) {
      return; // No changes detected
    }

    this.lastKnownSize = { width, height };

    // Update canvas dimensions
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Update renderer size
    const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height, false);

    // Update camera aspect ratio
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    // Preserve blob scale relative to viewport
    // The blob should maintain its visual size regardless of aspect ratio changes
    const currentScale = this.blob.getScale();
    this.blob.setScale(currentScale);
    
    // Update background plane transforms after resize
    this.updateBackgroundPlaneTransform();
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
    const { baseState, mediaState } = this.mapConfigToBackgroundState(config);
    this.backgroundState = baseState;
    this.backgroundMediaState = mediaState;
    if (!mediaState) {
      this.disposeVideoBackground();
      this.backgroundMediaAspect = null;
      this.backgroundMediaFit = 'cover';
    }
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

  setBackgroundImage(url: string, options: BackgroundImageOptions = {}): void {
    if (!url) {
      this.clearBackgroundMedia();
      return;
    }

    this.backgroundMediaState = {
      type: 'image',
      opacity: options.opacity ?? 1,
      imageUrl: url,
      imageFit: options.fit ?? 'cover',
    };
    this.applyBackgroundState();
  }

  setBackgroundVideo(url: string, options: BackgroundVideoOptions = {}): void {
    if (!url) {
      this.clearBackgroundMedia();
      return;
    }

    this.backgroundMediaState = {
      type: 'video',
      opacity: options.opacity ?? 1,
      videoUrl: url,
      videoFit: options.fit ?? 'cover',
      videoAutoplay: options.autoplay ?? true,
      videoLoop: options.loop ?? true,
      videoMuted: options.muted ?? true,
      videoPlaybackRate: options.playbackRate ?? 1,
    };
    this.applyBackgroundState();
  }

  clearBackgroundMedia(): void {
    this.backgroundMediaState = null;
    this.disposeBackgroundMediaPlane();
    this.backgroundMediaAspect = null;
    this.backgroundMediaFit = 'cover';
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
    const finalOpacity = options.opacity !== undefined ? options.opacity : this.backgroundState.opacity;
    const finalMode = options.mode ?? mode;
    const finalDirection = options.direction !== undefined ? options.direction : this.backgroundState.direction;
    const finalAngle = options.angle ?? this.backgroundState.angle;
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
    const requiresPlane = this.blobImageMode !== 'none' || this.backgroundMediaState !== null;
    if (!requiresPlane) return;
    this.updateBackgroundPlaneTransform();
  }

  private applyBackgroundState(): void {
    const state = this.backgroundState;
    const mediaState = this.backgroundMediaState;

    const hasMedia = mediaState !== null;
    const gradientOverlayActive = hasMedia && state.type !== 'transparent';
    const requiresGradientPlane = gradientOverlayActive || this.blobImageMode !== 'none';

    if (hasMedia) {
      const mediaPlane = this.ensureBackgroundMediaPlane();
      const mediaMaterial = mediaPlane.material as MeshBasicMaterial;
      this.configureMediaPlaneMaterial(mediaMaterial, mediaState!);
      this.updateMediaPlaneTexture(mediaState!, mediaMaterial);
      mediaPlane.visible = true;
    } else {
      this.disposeBackgroundMediaPlane();
    }

    if (requiresGradientPlane) {
      const gradientPlane = this.ensureBackgroundPlane();
      const gradientMaterial = gradientPlane.material as MeshBasicMaterial;
      this.configureGradientPlaneMaterial(gradientMaterial, this.blobImageMode !== 'none', gradientOverlayActive);
      this.updateGradientPlaneTexture(state, gradientMaterial, gradientOverlayActive);
      gradientMaterial.opacity = gradientOverlayActive ? state.opacity : 1;
      gradientMaterial.needsUpdate = true;
      gradientPlane.visible = gradientOverlayActive || this.blobImageMode !== 'none';
    } else {
      this.disposeBackgroundPlane();
    }

    if (!hasMedia && this.blobImageMode === 'none') {
      this.applyStateToSceneBackground(state);
    } else if (!hasMedia && this.blobImageMode !== 'none') {
      this.scene.background = null;
    } else {
      this.scene.background = null;
    }

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
      this.backgroundPlane.name = 'KwamiBackgroundPlane';
      this.scene.add(this.backgroundPlane);
    }

    return this.backgroundPlane;
  }

  private ensureBackgroundMediaPlane(): Mesh {
    if (!this.backgroundMediaPlane) {
      const geometry = new PlaneGeometry(200, 200);
      const material = new MeshBasicMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });
      material.stencilWrite = false;
      this.backgroundMediaPlane = new Mesh(geometry, material);
      this.backgroundMediaPlane.name = 'KwamiMediaPlane';
      this.scene.add(this.backgroundMediaPlane);
    }

    return this.backgroundMediaPlane;
  }

  private configureGradientPlaneMaterial(
    material: MeshBasicMaterial,
    enableBlobGlass: boolean,
    overlayActive: boolean,
  ): void {
    material.depthWrite = false;
    material.depthTest = true;
    material.transparent = overlayActive || enableBlobGlass;
    material.stencilFuncMask = 0xff;
    material.stencilWriteMask = 0x00;
    material.stencilFail = KeepStencilOp;
    material.stencilZFail = KeepStencilOp;
    material.stencilZPass = KeepStencilOp;

    if (enableBlobGlass && this.blobImageMode === 'glass') {
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
        this.backgroundPlane.renderOrder = overlayActive ? -500 : -1;
      }
    }
  }

  private configureMediaPlaneMaterial(material: MeshBasicMaterial, mediaState: BackgroundMediaState): void {
    material.depthWrite = true;
    material.depthTest = true;
    material.transparent = mediaState.opacity < 1;
    material.opacity = mediaState.opacity;
    material.stencilWrite = false;
    material.stencilFunc = AlwaysStencilFunc;
    material.stencilRef = 0;
    material.stencilFail = KeepStencilOp;
    material.stencilZFail = KeepStencilOp;
    material.stencilZPass = KeepStencilOp;

    if (this.backgroundMediaPlane) {
      this.backgroundMediaPlane.renderOrder = -1000;
    }
  }

  private updateGradientPlaneTexture(
    state: BackgroundState,
    material: MeshBasicMaterial,
    overlayActive: boolean,
  ): void {
    if (!this.backgroundPlane) return;

    if (state.type === 'solid' && state.color) {
      if (this.backgroundPlaneTexture) {
        this.backgroundPlaneTexture.dispose();
      }
      this.backgroundPlaneTexture = this.createSolidColorTexture(state.color, state.opacity);
      this.backgroundPlaneTexture.needsUpdate = true;
      material.map = this.backgroundPlaneTexture;
      material.needsUpdate = true;
      return;
    }

    if (state.type === 'gradient' && state.colors) {
      if (this.backgroundPlaneTexture) {
        this.backgroundPlaneTexture.dispose();
      }
      this.backgroundPlaneTexture = this.createGradientTexture(
        state.colors,
        state.direction ?? 'vertical',
        state.opacity,
        state.angle,
        state.stops,
      );
      this.backgroundPlaneTexture.needsUpdate = true;
      material.map = this.backgroundPlaneTexture;
      material.needsUpdate = true;
      return;
    }

    if (!overlayActive && this.blobImageMode === 'none') {
      if (material.map) {
        material.map.dispose();
      }
      material.map = null;
      material.needsUpdate = true;
    }
  }

  private updateMediaPlaneTexture(mediaState: BackgroundMediaState, material: MeshBasicMaterial): void {
    material.opacity = mediaState.opacity;
    material.transparent = mediaState.opacity < 1;

    if (mediaState.type !== 'video') {
      this.disposeVideoBackground();
    }

    if (mediaState.type === 'image' && mediaState.imageUrl) {
      this.backgroundMediaFit = mediaState.imageFit ?? 'cover';
      this.loadMediaImageTexture(mediaState.imageUrl, material);
      return;
    }

    if (mediaState.type === 'video' && mediaState.videoUrl) {
      this.backgroundMediaFit = mediaState.videoFit ?? 'cover';
      this.setupVideoBackground(mediaState, material);
      return;
    }

    if (material.map && material.map !== this.backgroundVideoTexture) {
      material.map.dispose();
    }
    material.map = null;
    material.needsUpdate = true;
  }

  private mapConfigToBackgroundState(
    config?: SceneBackgroundConfig,
  ): { baseState: BackgroundState; mediaState: BackgroundMediaState | null } {
    const defaultBase: BackgroundState = { ...DEFAULT_BACKGROUND_STATE, opacity: config?.opacity ?? 1 };
    let baseState: BackgroundState = defaultBase;
    let mediaState: BackgroundMediaState | null = null;

    if (!config || config.type === 'transparent') {
      return { baseState: defaultBase, mediaState: null };
    }

    if (config.type === 'solid' && config.color) {
      baseState = {
        type: 'solid',
        color: config.color,
        colors: [config.color],
        direction: 'vertical',
        opacity: config.opacity ?? 1,
      };
    }

    const gradientConfig =
      config.type === 'gradient'
        ? config.gradient
        : config.gradient && config.gradient.colors?.length
        ? config.gradient
        : undefined;

    if (gradientConfig) {
      const opacity = gradientConfig.opacity ?? config.opacity ?? 1;
      baseState = {
        type: 'gradient',
        colors: gradientConfig.colors,
        direction: gradientConfig.direction ?? 'vertical',
        angle: gradientConfig.angle,
        stops: this.sanitizeStops(gradientConfig.colors.length, gradientConfig.stops),
        opacity,
      };
    }

    const imageConfig = config.image;
    if (imageConfig?.url) {
      mediaState = {
        type: 'image',
        opacity: imageConfig.opacity ?? config.opacity ?? 1,
        imageUrl: imageConfig.url,
        imageFit: imageConfig.fit ?? 'cover',
      };
    }

    const videoConfig = config.video;
    if (videoConfig?.url) {
      mediaState = {
        type: 'video',
        opacity: videoConfig.opacity ?? config.opacity ?? 1,
        videoUrl: videoConfig.url,
        videoFit: videoConfig.fit ?? 'cover',
        videoAutoplay: videoConfig.autoplay ?? true,
        videoLoop: videoConfig.loop ?? true,
        videoMuted: videoConfig.muted ?? true,
        videoPlaybackRate: videoConfig.playbackRate ?? 1,
      };
    }

    return { baseState, mediaState };
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

  private disposeBackgroundMediaPlane(): void {
    if (!this.backgroundMediaPlane) {
      if (this.backgroundMediaTexture) {
        this.backgroundMediaTexture.dispose();
        this.backgroundMediaTexture = null;
      }
      this.disposeVideoBackground();
      this.backgroundMediaAspect = null;
      this.currentMediaImageUrl = null;
      return;
    }

    const material = this.backgroundMediaPlane.material as MeshBasicMaterial;
    if (material.map) {
      if (material.map !== this.backgroundVideoTexture) {
        material.map.dispose();
      }
      material.map = null;
    }
    material.dispose();
    this.backgroundMediaPlane.geometry.dispose();
    this.scene.remove(this.backgroundMediaPlane);
    this.backgroundMediaPlane = null;

    if (this.backgroundMediaTexture) {
      this.backgroundMediaTexture.dispose();
      this.backgroundMediaTexture = null;
    }

    this.disposeVideoBackground();
    this.backgroundMediaAspect = null;
    this.currentMediaImageUrl = null;
  }

  private updateBlobBackgroundTextureForMode(): void {
    if (this.blobImageMode === 'overlay' && this.backgroundTexture) {
      this.blob.setBackgroundTexture(this.backgroundTexture);
      return;
    }
    // Fall back to blob surface media if present
    if (this.blobSurfaceVideoTexture) {
      this.blob.setBackgroundTexture(this.blobSurfaceVideoTexture);
      return;
    }
    if (this.blobSurfaceTexture) {
      this.blob.setBackgroundTexture(this.blobSurfaceTexture);
      return;
    }
    this.blob.setBackgroundTexture(null);
  }

  private updateBackgroundPlaneTransform(): void {
    if (!this.backgroundPlane && !this.backgroundMediaPlane) return;

    const cameraDirection = new Vector3();
    this.camera.getWorldDirection(cameraDirection);

    const fovRadians = (this.camera.fov * Math.PI) / 180;
    
    // Add transition class during resize
    if (this.resizeTransitionActive) {
      if (this.backgroundPlane) {
        (this.backgroundPlane.material as MeshBasicMaterial).needsUpdate = true;
      }
      if (this.backgroundMediaPlane) {
        (this.backgroundMediaPlane.material as MeshBasicMaterial).needsUpdate = true;
      }
    }

    if (this.backgroundMediaPlane) {
      const mediaDirection = cameraDirection.clone().multiplyScalar(MEDIA_PLANE_DISTANCE);
      const mediaPosition = this.camera.position.clone().add(mediaDirection);
      this.backgroundMediaPlane.position.copy(mediaPosition);
      this.backgroundMediaPlane.quaternion.copy(this.camera.quaternion);

      // Add extra scale factor to ensure full coverage
      const scaleFactor = 1.5;
      const mediaViewportHeight = 2 * Math.tan(fovRadians / 2) * MEDIA_PLANE_DISTANCE * scaleFactor;
      const mediaViewportWidth = mediaViewportHeight * this.camera.aspect;

      let planeWidth = mediaViewportWidth;
      let planeHeight = mediaViewportHeight;

      if (this.backgroundMediaAspect) {
        const mediaAspect = this.backgroundMediaAspect;
        const viewportAspect = mediaViewportWidth / mediaViewportHeight;

        if (this.backgroundMediaFit === 'cover') {
          if (mediaAspect > viewportAspect) {
            planeWidth = mediaViewportHeight * mediaAspect;
            planeHeight = mediaViewportHeight;
          } else {
            planeWidth = mediaViewportWidth;
            planeHeight = mediaViewportWidth / mediaAspect;
          }
        } else if (this.backgroundMediaFit === 'contain') {
          if (mediaAspect > viewportAspect) {
            planeWidth = mediaViewportWidth;
            planeHeight = mediaViewportWidth / mediaAspect;
          } else {
            planeWidth = mediaViewportHeight * mediaAspect;
            planeHeight = mediaViewportHeight;
          }
        } else {
          planeWidth = mediaViewportWidth;
          planeHeight = mediaViewportHeight;
        }
      }

      this.backgroundMediaPlane.scale.set(
        planeWidth / BACKGROUND_PLANE_BASE_SIZE,
        planeHeight / BACKGROUND_PLANE_BASE_SIZE,
        1,
      );
    }

    if (this.backgroundPlane) {
      const gradientDirection = cameraDirection.clone().multiplyScalar(GRADIENT_PLANE_DISTANCE);
      const gradientPosition = this.camera.position.clone().add(gradientDirection);
      this.backgroundPlane.position.copy(gradientPosition);
      this.backgroundPlane.quaternion.copy(this.camera.quaternion);

      // Calculate the viewport size at the plane distance
      // Add extra scale factor to ensure full coverage even at edges
      const scaleFactor = 1.5; // Ensure full coverage
      const gradientViewportHeight = 2 * Math.tan(fovRadians / 2) * GRADIENT_PLANE_DISTANCE * scaleFactor;
      const gradientViewportWidth = gradientViewportHeight * this.camera.aspect;

      this.backgroundPlane.scale.set(
        gradientViewportWidth / BACKGROUND_PLANE_BASE_SIZE,
        gradientViewportHeight / BACKGROUND_PLANE_BASE_SIZE,
        1,
      );
    }
  }

  /**
   * Get current background type
   */
  getBackgroundType(): 'transparent' | 'color' | 'texture' {
    if (this.backgroundMediaState) {
      return 'texture';
    }

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
   * Load a texture for the background plane from an image URL
   * @private
   */
  private loadMediaImageTexture(url: string, material: MeshBasicMaterial): void {
    this.currentMediaImageUrl = url;

    if (material.map && material.map !== this.backgroundVideoTexture && material.map !== this.backgroundMediaTexture) {
      material.map.dispose();
    }
    material.map = null;
    material.needsUpdate = true;

    if (this.backgroundMediaTexture) {
      this.backgroundMediaTexture.dispose();
      this.backgroundMediaTexture = null;
    }

    this.textureLoader.load(
      url,
      (texture) => {
        if (this.currentMediaImageUrl !== url) {
          texture.dispose();
          return;
        }

        texture.colorSpace = SRGBColorSpace;
        texture.needsUpdate = true;

        if (this.backgroundMediaTexture) {
          this.backgroundMediaTexture.dispose();
        }

        this.backgroundMediaTexture = texture;
        this.backgroundMediaAspect = this.getTextureAspect(texture);

        material.map = texture;
        material.needsUpdate = true;

        this.updateBackgroundPlaneTransform();
      },
      undefined,
      (error) => {
        if (this.currentMediaImageUrl === url) {
          console.error('Failed to load background image:', error);
          if (this.backgroundMediaTexture) {
            this.backgroundMediaTexture.dispose();
            this.backgroundMediaTexture = null;
          }
          this.backgroundMediaAspect = null;
          material.map = null;
          material.needsUpdate = true;
        }
      },
    );
  }

  /**
   * Setup a video texture for the background plane
   * @private
   */
  private setupVideoBackground(mediaState: BackgroundMediaState, material: MeshBasicMaterial): void {
    const url = mediaState.videoUrl;
    if (!url) return;

    this.backgroundMediaFit = mediaState.videoFit ?? 'cover';

    if (this.currentVideoUrl === url && this.backgroundVideoTexture && this.backgroundVideoElement) {
      this.syncVideoPlaybackOptions(this.backgroundVideoElement, mediaState);
      material.map = this.backgroundVideoTexture;
      material.needsUpdate = true;
      this.backgroundMediaAspect = this.backgroundMediaAspect ?? this.getVideoAspect(this.backgroundVideoElement);
      this.updateBackgroundPlaneTransform();
      return;
    }

    this.disposeVideoBackground();

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = mediaState.videoMuted ?? true;
    video.loop = mediaState.videoLoop ?? true;
    video.autoplay = mediaState.videoAutoplay ?? true;
    video.playsInline = true;
    video.controls = false;
    video.preload = 'auto';
    video.src = url;
    video.playbackRate = mediaState.videoPlaybackRate ?? 1;

    this.currentVideoUrl = url;
    this.backgroundVideoElement = video;
    material.map = null;
    material.needsUpdate = true;

    const handleLoadedMetadata = () => {
      if (this.currentVideoUrl !== url || !this.backgroundVideoElement) {
        return;
      }

      const texture = new VideoTexture(video);
      texture.colorSpace = SRGBColorSpace;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.generateMipmaps = false;

      this.backgroundVideoTexture = texture;
      this.backgroundMediaAspect = this.getVideoAspect(video);

      material.map = texture;
      material.needsUpdate = true;

      this.updateBackgroundPlaneTransform();

      if (mediaState.videoAutoplay ?? true) {
        video.play().catch(() => {});
      }
    };

    const handleError = (event: Event) => {
      if (this.currentVideoUrl === url) {
        console.error('Failed to load background video:', event);
        this.disposeVideoBackground();
        material.map = null;
        material.needsUpdate = true;
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
    video.addEventListener('error', handleError, { once: true });

    video.load();

    if (video.autoplay) {
      video.play().catch(() => {});
    }
  }

  private syncVideoPlaybackOptions(video: HTMLVideoElement, mediaState: BackgroundMediaState): void {
    video.loop = mediaState.videoLoop ?? true;
    video.muted = mediaState.videoMuted ?? true;
    video.playbackRate = mediaState.videoPlaybackRate ?? 1;

    if (mediaState.videoAutoplay ?? true) {
      video.play().catch(() => {});
    }
  }

  private disposeVideoBackground(): void {
    if (this.backgroundVideoTexture) {
      const texture = this.backgroundVideoTexture;
      if (this.backgroundMediaPlane) {
        const material = this.backgroundMediaPlane.material as MeshBasicMaterial;
        if (material.map === texture) {
          material.map = null;
          material.needsUpdate = true;
        }
      }

      texture.dispose();
      this.backgroundVideoTexture = null;
    }

    if (this.backgroundVideoElement) {
      try {
        this.backgroundVideoElement.pause();
      } catch (error) {
        // Ignore pause errors
      }
      this.backgroundVideoElement.removeAttribute('src');
      this.backgroundVideoElement.load();
      this.backgroundVideoElement = null;
    }

    this.currentVideoUrl = null;
    this.backgroundMediaAspect = null;
  }

  private getTextureAspect(texture: Texture): number | null {
    const image: any = texture.image;
    if (!image) return null;

    if (typeof image.width === 'number' && typeof image.height === 'number' && image.height !== 0) {
      return image.width / image.height;
    }

    if (typeof image.videoWidth === 'number' && typeof image.videoHeight === 'number' && image.videoHeight !== 0) {
      return image.videoWidth / image.videoHeight;
    }

    return null;
  }

  private getVideoAspect(video: HTMLVideoElement): number | null {
    if (video.videoWidth && video.videoHeight) {
      return video.videoWidth / video.videoHeight;
    }
    return null;
  }

  /**
   * Cleanup and dispose all resources
   */
  // Set blob surface image (independent of background overlay)
  setBlobSurfaceImage(url: string | null): void {
    // Clear any existing surface video
    this.clearBlobSurfaceVideo();

    if (!url) {
      if (this.blobSurfaceTexture) {
        this.blobSurfaceTexture.dispose();
        this.blobSurfaceTexture = null;
      }
      this.currentBlobSurfaceImageUrl = null;
      this.updateBlobBackgroundTextureForMode();
      return;
    }

    this.currentBlobSurfaceImageUrl = url;
    this.textureLoader.load(
      url,
      (texture) => {
        if (this.currentBlobSurfaceImageUrl !== url) {
          texture.dispose();
          return;
        }
        texture.colorSpace = SRGBColorSpace;
        texture.needsUpdate = true;
        if (this.blobSurfaceTexture) this.blobSurfaceTexture.dispose();
        this.blobSurfaceTexture = texture;
        this.updateBlobBackgroundTextureForMode();
      },
      undefined,
      () => {
        if (this.currentBlobSurfaceImageUrl === url) {
          this.blobSurfaceTexture = null;
          this.updateBlobBackgroundTextureForMode();
        }
      },
    );
  }

  // Set blob surface video (independent of background overlay)
  setBlobSurfaceVideo(url: string | null, options: { loop?: boolean; muted?: boolean; autoplay?: boolean; playbackRate?: number } = {}): void {
    // Clear image
    if (this.blobSurfaceTexture) {
      this.blobSurfaceTexture.dispose();
      this.blobSurfaceTexture = null;
    }

    if (!url) {
      this.clearBlobSurfaceVideo();
      this.updateBlobBackgroundTextureForMode();
      return;
    }

    this.currentBlobSurfaceVideoUrl = url;
    // Reuse existing element if same URL
    if (this.blobSurfaceVideoElement && this.blobSurfaceVideoTexture && this.currentBlobSurfaceVideoUrl === url) {
      this.syncSurfaceVideoOptions(this.blobSurfaceVideoElement, options);
      this.updateBlobBackgroundTextureForMode();
      return;
    }

    this.clearBlobSurfaceVideo();

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = options.muted ?? true;
    video.loop = options.loop ?? true;
    video.autoplay = options.autoplay ?? true;
    video.playsInline = true;
    video.controls = false;
    video.preload = 'auto';
    video.src = url;
    video.playbackRate = options.playbackRate ?? 1;

    this.blobSurfaceVideoElement = video;

    const handleLoaded = () => {
      if (this.currentBlobSurfaceVideoUrl !== url || !this.blobSurfaceVideoElement) return;
      const tex = new VideoTexture(video);
      tex.colorSpace = SRGBColorSpace;
      tex.minFilter = LinearFilter;
      tex.magFilter = LinearFilter;
      tex.generateMipmaps = false;
      this.blobSurfaceVideoTexture = tex;
      this.updateBlobBackgroundTextureForMode();
      if (video.autoplay) video.play().catch(() => {});
    };

    const handleError = (e: Event) => {
      if (this.currentBlobSurfaceVideoUrl === url) {
        this.clearBlobSurfaceVideo();
        this.updateBlobBackgroundTextureForMode();
      }
    };

    video.addEventListener('loadedmetadata', handleLoaded, { once: true });
    video.addEventListener('error', handleError, { once: true });
    video.load();
    if (video.autoplay) video.play().catch(() => {});
  }

  clearBlobSurfaceMedia(): void {
    if (this.blobSurfaceTexture) {
      this.blobSurfaceTexture.dispose();
      this.blobSurfaceTexture = null;
    }
    this.clearBlobSurfaceVideo();
    this.currentBlobSurfaceImageUrl = null;
    this.updateBlobBackgroundTextureForMode();
  }

  private clearBlobSurfaceVideo(): void {
    if (this.blobSurfaceVideoTexture) {
      this.blobSurfaceVideoTexture.dispose();
      this.blobSurfaceVideoTexture = null;
    }
    if (this.blobSurfaceVideoElement) {
      try { this.blobSurfaceVideoElement.pause(); } catch {}
      this.blobSurfaceVideoElement.removeAttribute('src');
      this.blobSurfaceVideoElement.load();
      this.blobSurfaceVideoElement = null;
    }
    this.currentBlobSurfaceVideoUrl = null;
  }

  private syncSurfaceVideoOptions(video: HTMLVideoElement, options: { loop?: boolean; muted?: boolean; autoplay?: boolean; playbackRate?: number }): void {
    video.loop = options.loop ?? true;
    video.muted = options.muted ?? true;
    video.playbackRate = options.playbackRate ?? 1;
    if (options.autoplay ?? true) video.play().catch(() => {});
  }

  /**
   * Randomize the 3D blob surface texture
   * Randomly selects between image or video from the provided options
   * @param imageUrls - Array of image URLs to choose from
   * @param videoUrls - Array of video URLs to choose from
   * @returns Object with the selected type and URL
   */
  randomize3DTexture(imageUrls: string[], videoUrls: string[]): { type: 'image' | 'video' | 'none'; url: string | null } {
    const hasImages = imageUrls.length > 0;
    const hasVideos = videoUrls.length > 0;

    if (!hasImages && !hasVideos) {
      this.clearBlobSurfaceMedia();
      return { type: 'none', url: null };
    }

    // Randomly choose between image or video (50/50 chance)
    const useVideo = Math.random() < 0.5;

    if (useVideo && hasVideos) {
      const randomIndex = Math.floor(Math.random() * videoUrls.length);
      const selectedUrl = videoUrls[randomIndex];
      this.setBlobSurfaceVideo(selectedUrl, { autoplay: true, loop: true, muted: true });
      return { type: 'video', url: selectedUrl };
    } else if (hasImages) {
      const randomIndex = Math.floor(Math.random() * imageUrls.length);
      const selectedUrl = imageUrls[randomIndex];
      this.setBlobSurfaceImage(selectedUrl);
      return { type: 'image', url: selectedUrl };
    } else if (hasVideos) {
      // Fallback to video if image was chosen but not available
      const randomIndex = Math.floor(Math.random() * videoUrls.length);
      const selectedUrl = videoUrls[randomIndex];
      this.setBlobSurfaceVideo(selectedUrl, { autoplay: true, loop: true, muted: true });
      return { type: 'video', url: selectedUrl };
    }

    this.clearBlobSurfaceMedia();
    return { type: 'none', url: null };
  }

  /**
   * Randomize background media with glass transparency effect
   * Randomly selects a background image or video, enables glass mode, and sets random blob opacity
   * @param imageUrls - Array of background image URLs to choose from
   * @param videoUrls - Array of background video URLs to choose from
   * @returns Object with the selected background type, URL, and applied opacity
   */
  randomizeBackgroundWithGlass(imageUrls: string[], videoUrls: string[]): { backgroundType: 'image' | 'video' | 'none'; backgroundUrl: string | null; opacity: number } {
    const hasImages = imageUrls.length > 0;
    const hasVideos = videoUrls.length > 0;

    // Generate random opacity between 0 and 0.9
    const randomOpacity = Math.random() * 0.9;

    // If no media available, just randomize gradient and apply glass
    if (!hasImages && !hasVideos) {
      this.randomizeBackground();
      this.setBlobImageTransparencyMode(true, { mode: 'glass' });
      this.blob.setOpacity(randomOpacity);
      return { backgroundType: 'none', backgroundUrl: null, opacity: randomOpacity };
    }

    // Randomly choose between image or video (50/50 chance)
    const useVideo = Math.random() < 0.5;

    if (useVideo && hasVideos) {
      const randomIndex = Math.floor(Math.random() * videoUrls.length);
      const selectedUrl = videoUrls[randomIndex];
      this.setBackgroundVideo(selectedUrl, { opacity: 1, autoplay: true, loop: true, muted: true });
      this.setBlobImageTransparencyMode(true, { mode: 'glass' });
      this.blob.setOpacity(randomOpacity);
      return { backgroundType: 'video', backgroundUrl: selectedUrl, opacity: randomOpacity };
    } else if (hasImages) {
      const randomIndex = Math.floor(Math.random() * imageUrls.length);
      const selectedUrl = imageUrls[randomIndex];
      this.setBackgroundImage(selectedUrl, { opacity: 1 });
      this.setBlobImageTransparencyMode(true, { mode: 'glass' });
      this.blob.setOpacity(randomOpacity);
      return { backgroundType: 'image', backgroundUrl: selectedUrl, opacity: randomOpacity };
    } else if (hasVideos) {
      // Fallback to video if image was chosen but not available
      const randomIndex = Math.floor(Math.random() * videoUrls.length);
      const selectedUrl = videoUrls[randomIndex];
      this.setBackgroundVideo(selectedUrl, { opacity: 1, autoplay: true, loop: true, muted: true });
      this.setBlobImageTransparencyMode(true, { mode: 'glass' });
      this.blob.setOpacity(randomOpacity);
      return { backgroundType: 'video', backgroundUrl: selectedUrl, opacity: randomOpacity };
    }

    // Fallback
    this.randomizeBackground();
    this.setBlobImageTransparencyMode(true, { mode: 'glass' });
    this.blob.setOpacity(randomOpacity);
    return { backgroundType: 'none', backgroundUrl: null, opacity: randomOpacity };
  }

  dispose(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.usingWindowResizeListener && typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize);
      this.usingWindowResizeListener = false;
    }

    if (this.resizeRafId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.resizeRafId);
      this.resizeRafId = null;
    }

    this.blobImageMode = 'none';
    this.blob.setGlassMode(false);
    this.disposeBackgroundPlane();
    this.disposeBackgroundMediaPlane();
    if (this.backgroundTexture) {
      this.backgroundTexture.dispose();
      this.backgroundTexture = null;
    }
    this.blob.setBackgroundTexture(null);
    this.backgroundMediaState = null;

    // Dispose blob surface media
    if (this.blobSurfaceTexture) {
      this.blobSurfaceTexture.dispose();
      this.blobSurfaceTexture = null;
    }
    this.clearBlobSurfaceVideo();
    this.currentBlobSurfaceImageUrl = null;

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
