import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene as ThreeScene,
  DirectionalLight,
  AmbientLight,
  PCFSoftShadowMap,
  Color,
  CanvasTexture,
} from '../../../../node_modules/@types/three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { SceneConfig } from '../../../types';

/**
 * Scene - Manages the THREE.js scene configuration for Kwami
 */
export class Scene {
  public renderer: WebGLRenderer;
  public camera: PerspectiveCamera;
  public scene: ThreeScene;
  public lights: ReturnType<typeof createLights>;
  public controls: OrbitControls | null;

  constructor(canvas: HTMLCanvasElement, config?: SceneConfig) {
    this.renderer = createRenderer(canvas, config);
    this.camera = createCamera(canvas, config);
    this.scene = new ThreeScene();
    this.lights = createLights(config);

    applySceneBackground(this.scene, config);
    this.scene.add(this.lights.top);
    this.scene.add(this.lights.bottom);
    this.scene.add(this.lights.ambient);

    this.controls = config?.enableControls === true
      ? createControls(this.camera, this.renderer)
      : null;
  }
}

/**
 * Create and configure the WebGL renderer
 */
function createRenderer(
  canvas: HTMLCanvasElement,
  config?: SceneConfig,
): WebGLRenderer {
  const context = canvas.getContext('webgl2', {
    antialias: true,
    alpha: true,
    stencil: true,
  }) as WebGL2RenderingContext;

  const renderer = new WebGLRenderer({
    canvas,
    context,
    antialias: true,
    alpha: true,
  });

  renderer.autoClearStencil = true;

  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  if (config?.enableShadows !== false) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
  }

  return renderer;
}

/**
 * Create and configure the perspective camera
 */
function createCamera(
  canvas: HTMLCanvasElement,
  config?: SceneConfig,
): PerspectiveCamera {
  const fov = config?.fov || 100;
  const near = config?.near || 0.1;
  const far = config?.far || 1000;

  const camera = new PerspectiveCamera(
    fov,
    canvas.clientWidth / canvas.clientHeight,
    near,
    far,
  );

  const position = config?.cameraPosition || { x: 0, y: 6, z: 0 };
  camera.position.set(position.x, position.y, position.z);

  return camera;
}

/**
 * Create and configure scene lighting
 */
function createLights(config?: SceneConfig) {
  const intensity = config?.lightIntensity || {};
  const topIntensity = intensity.top ?? 0.7;
  const bottomIntensity = intensity.bottom ?? 0.4;
  const ambientIntensity = intensity.ambient ?? 1;

  const top = new DirectionalLight(0xFFFFFF, topIntensity);
  top.position.set(0, 500, 2000);
  top.castShadow = true;
  top.shadow.mapSize.width = 4048;
  top.shadow.mapSize.height = 4048;
  top.shadow.camera.near = 0;
  top.shadow.camera.far = 1000;
  top.shadow.camera.left = -200;
  top.shadow.camera.right = 200;
  top.shadow.camera.top = 200;
  top.shadow.camera.bottom = -200;

  const bottom = new DirectionalLight(0xFFFFFF, bottomIntensity);
  bottom.position.set(0, -500, 400);
  bottom.castShadow = true;
  bottom.shadow.mapSize.width = 5048;
  bottom.shadow.mapSize.height = 5048;
  bottom.shadow.camera.near = 0.5;
  bottom.shadow.camera.far = 1000;
  bottom.shadow.camera.left = -200;
  bottom.shadow.camera.right = 200;
  bottom.shadow.camera.top = 200;
  bottom.shadow.camera.bottom = -200;

  const ambient = new AmbientLight(0x798296, ambientIntensity);

  return { top, bottom, ambient };
}

/**
 * Create orbit controls for camera manipulation
 */
function createControls(
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = false;
  controls.target.set(0, 0, 0);
  controls.update();
  return controls;
}

/**
 * Apply background configuration to the scene
 */
function applySceneBackground(scene: ThreeScene, config?: SceneConfig) {
  const bgConfig = config?.background;

  if (!bgConfig || bgConfig.type === 'transparent') {
    // Transparent background (default)
    scene.background = null;
    return;
  }

  if (bgConfig.type === 'solid' && bgConfig.color) {
    // Solid color background
    scene.background = new Color(bgConfig.color);
    return;
  }

  if (bgConfig.type === 'gradient' && bgConfig.gradient) {
    // Gradient background using canvas texture
    const gradientTexture = createGradientTexture(
      bgConfig.gradient.colors,
      bgConfig.gradient.direction || 'vertical',
      bgConfig.gradient.opacity ?? bgConfig.opacity ?? 1,
      bgConfig.gradient.angle,
      bgConfig.gradient.stops,
    );
    scene.background = gradientTexture;
    return;
  }
}

/**
 * Create a gradient texture for scene background
 */
function createGradientTexture(
  colors: string[],
  direction: 'vertical' | 'horizontal' | 'radial' | 'diagonal',
  opacity: number = 1,
  angle?: number,
  stops?: number[],
): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.globalAlpha = opacity;

  let gradient: CanvasGradient;

  if (direction === 'radial') {
    gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 512);
  } else if (typeof angle === 'number' && Number.isFinite(angle)) {
    gradient = createLinearGradientWithAngle(ctx, angle);
  } else if (direction === 'horizontal') {
    gradient = ctx.createLinearGradient(0, 0, 512, 0);
  } else if (direction === 'diagonal') {
    gradient = ctx.createLinearGradient(0, 0, 512, 512);
  } else {
    // vertical (default)
    gradient = ctx.createLinearGradient(0, 0, 0, 512);
  }

  const normalizedStops = getStopsForGradient(colors.length, stops);
  normalizedStops.forEach((stop, index) => {
    gradient.addColorStop(Math.max(0, Math.min(1, stop)), colors[index]);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  return new CanvasTexture(canvas);
}

function createLinearGradientWithAngle(ctx: CanvasRenderingContext2D, angle: number): CanvasGradient {
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

function getStopsForGradient(count: number, stops?: number[]): number[] {
  if (count <= 0) return [0];
  const sanitized = sanitizeStops(count, stops);
  if (sanitized) return sanitized;

  if (count === 1) return [0];
  if (count === 2) return [0, 1];

  return Array.from({ length: count }, (_, index) => index / (count - 1));
}

function sanitizeStops(count: number, stops?: number[]): number[] | undefined {
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
