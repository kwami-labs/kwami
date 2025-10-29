import {
  Mesh,
  Color,
  PointLight,
  Vector2,
  Vector3,
  Raycaster,
  Texture,
  type ShaderMaterial,
} from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { createBlobGeometry } from './geometry';
import { animateBlob } from './animation';
import { createSkin } from './skins';
import { defaultBlobConfig } from './config';
import {
  getRandomBetween,
  getRandomBoolean,
  getRandomHexColor,
  genDNA,
} from '../utils/randoms';
import type { BlobOptions, BlobSkinType } from '../types';

/**
 * Blob - The 3D visual body of Kwami
 * A morphing sphere that reacts to audio and can have different skins
 */
export class Blob {
  private mesh: Mesh;
  private config = defaultBlobConfig;
  public currentSkin: BlobSkinType;
  private skins: Map<BlobSkinType, ShaderMaterial> = new Map();
  private animationFrameId: number | null = null;

  // Tricolor lights
  private lights: { x: PointLight; y: PointLight; z: PointLight } | null = null;
  public lightIntensity = 0; // 0 = off, higher values = brighter

  // Touch interaction
  private touchPoints: Array<{
    position: Vector3;
    strength: number;
    startTime: number;
    duration: number;
  }> = [];
  private clickEnabled = false;
  
  // Touch configuration
  public touchStrength = 1.0;
  public touchDuration = 1100;
  public maxTouchPoints = 5;
  
  // Listening mode (inverts spikes)
  public isListening = false;
  private listeningTransition = 0; // 0 to 1
  
  // Thinking mode (random chaotic animation)
  public isThinking = false;
  private thinkingTimeout: number | null = null;
  private thinkingStartTime: number = 0;
  private thinkingTransition = 0; // 0 to 1
  public thinkingDuration = 10000; // milliseconds
  
  // State transition speed (how fast to blend between states)
  public transitionSpeed = 0.05; // 5% per frame (~1 second at 60fps)

  // Animation parameters
  public spikes = { x: 0.2, y: 0.2, z: 0.2 };
  public time = { x: 1, y: 1, z: 1 };
  public rotation = { x: 0, y: 0, z: 0 };
  
  // Audio effect parameters (configurable from playground)
  public audioEffects = {
    bassSpike: 0.45,
    midSpike: 0.35,
    highSpike: 0.30,
    midTime: 0.2,
    highTime: 0.3,
    ultraTime: 0.15,
    enabled: true,
    timeEnabled: false  // Disabled by default to prevent chaotic movement
  };
  public colors = { x: '#ff0000', y: '#00ff00', z: '#0000ff' };
  public opacity = 1;
  public baseScale = 1.0; // User-defined base scale
  public dna = '';
  private backgroundTexture: Texture | null = null;

  constructor(private options: BlobOptions) {
    this.currentSkin = options.skin || 'tricolor';

    // Initialize skins
    this.initializeSkins();

    // Apply initial colors and opacity from configuration
    const activeSkinConfig
      = this.currentSkin === 'tricolor'
        ? this.config.skins.tricolor
        : this.currentSkin === 'tricolor2'
          ? this.config.skins.tricolor2 || this.config.skins.tricolor
          : this.config.skins.zebra;

    if ('color1' in activeSkinConfig) {
      this.setColors(activeSkinConfig.color1, activeSkinConfig.color2, activeSkinConfig.color3);
    }

    this.opacity = activeSkinConfig.opacity ?? 1;
    this.updateMaterialOpacity(this.opacity);

    // Create geometry
    const geometry = createBlobGeometry(
      options.resolution || this.config.resolution.default,
    );

    // Create mesh with initial skin
    const material = this.skins.get(this.currentSkin)!;
    this.mesh = new Mesh(geometry, material);
    this.updateMaterialOpacity(this.opacity);

    // Apply initial configuration
    if (options.spikes) this.spikes = options.spikes;
    if (options.time) this.time = options.time;
    if (options.rotation) this.rotation = options.rotation;

    // Start animation loop
    this.startAnimation();
  }

  /**
   * Initialize all available skins
   */
  private initializeSkins(): void {
    const tricolorConfig = this.config.skins.tricolor;
    const tricolor2Config = this.config.skins.tricolor2 || tricolorConfig;
    const zebraConfig = this.config.skins.zebra;

    const tricolorMaterial = createSkin('tricolor', tricolorConfig);
    this.applyBackgroundTextureToMaterial(tricolorMaterial);
    this.skins.set('tricolor', tricolorMaterial);

    const tricolor2Material = createSkin('tricolor2', tricolor2Config);
    this.applyBackgroundTextureToMaterial(tricolor2Material);
    this.skins.set('tricolor2', tricolor2Material);

    const zebraMaterial = createSkin('zebra', {
      ...zebraConfig,
      color1: zebraConfig.color1 ?? tricolorConfig.color1,
      color2: zebraConfig.color2 ?? tricolorConfig.color2,
      color3: zebraConfig.color3 ?? tricolorConfig.color3,
    });
    this.applyBackgroundTextureToMaterial(zebraMaterial);
    this.skins.set('zebra', zebraMaterial);
  }

  private applyBackgroundTextureToMaterial(material: ShaderMaterial): void {
    if (!material.uniforms) return;

    if (Object.prototype.hasOwnProperty.call(material.uniforms, 'backgroundTexture')) {
      material.uniforms.backgroundTexture.value = this.backgroundTexture;
    }

    if (Object.prototype.hasOwnProperty.call(material.uniforms, 'useBackgroundTexture')) {
      material.uniforms.useBackgroundTexture.value = Boolean(this.backgroundTexture);
    }

    material.needsUpdate = true;
  }

  private applyBackgroundTextureToAllSkins(): void {
    this.skins.forEach((material) => this.applyBackgroundTextureToMaterial(material));

    if (this.mesh) {
      this.applyBackgroundTextureToMaterial(this.mesh.material as ShaderMaterial);
    }
  }

  public setBackgroundTexture(texture: Texture | null): void {
    this.backgroundTexture = texture;
    this.applyBackgroundTextureToAllSkins();
  }

  /**
   * Start the animation loop
   */
  private startAnimation(): void {
    const animate = () => {
      // Update state transitions smoothly
      // Listening transition
      if (this.isListening) {
        this.listeningTransition = Math.min(1, this.listeningTransition + this.transitionSpeed);
      } else {
        this.listeningTransition = Math.max(0, this.listeningTransition - this.transitionSpeed);
      }
      
      // Thinking transition
      if (this.isThinking) {
        this.thinkingTransition = Math.min(1, this.thinkingTransition + this.transitionSpeed);
      } else {
        this.thinkingTransition = Math.max(0, this.thinkingTransition - this.transitionSpeed);
      }
      
      const analyser = this.options.audio.getAnalyser();
      if (analyser) {
        const frequencyData = this.options.audio.getFrequencyData() as Uint8Array<ArrayBuffer>;
        
        // Calculate thinking progress if in thinking mode
        const thinkingProgress = this.isThinking 
          ? (Date.now() - this.thinkingStartTime) / this.thinkingDuration // 0 to 1 over duration
          : 0;
        
        animateBlob(
          this.mesh,
          frequencyData,
          analyser,
          this.spikes.x,
          this.spikes.y,
          this.spikes.z,
          this.time.x,
          this.time.y,
          this.time.z,
          this.baseScale,
          this.touchPoints,
          this.listeningTransition,
          this.thinkingTransition,
          thinkingProgress,
          this.audioEffects,
        );
      }

      // Clean up expired touch points
      const currentTime = Date.now();
      this.touchPoints = this.touchPoints.filter(
        tp => (currentTime - tp.startTime) < tp.duration
      );

      // Apply rotation
      this.mesh.rotation.x += this.rotation.x;
      this.mesh.rotation.y += this.rotation.y;
      this.mesh.rotation.z += this.rotation.z;

      // Render
      this.options.renderer.render(this.options.scene, this.options.camera);
      this.options.onAfterRender?.();

      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Stop the animation loop
   */
  private stopAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Get the THREE.js mesh
   */
  getMesh(): Mesh {
    return this.mesh;
  }

  /**
   * Change the blob's skin
   */
  setSkin(skin: BlobSkinType): void {
    const material = this.skins.get(skin);
    if (material) {
      // Save current shininess and wireframe before switching
      const currentMaterial = this.mesh.material as ShaderMaterial;
      const currentShininess = currentMaterial.uniforms?.shininess?.value || 50;
      const currentWireframe = currentMaterial.wireframe;
      
      this.currentSkin = skin;
      this.mesh.material = material;
      this.applyBackgroundTextureToMaterial(material);

      if ((material as ShaderMaterial).uniforms?.opacity) {
        (material as ShaderMaterial).uniforms.opacity.value = this.opacity;
      }
      this.updateMaterialOpacity(this.opacity);
      
      // Apply current colors to the new material
      this.setColor('x', this.colors.x);
      this.setColor('y', this.colors.y);
      this.setColor('z', this.colors.z);
      
      // Apply current shininess to the new material
      if (material.uniforms.shininess) {
        material.uniforms.shininess.value = currentShininess;
      }
      
      // Apply current wireframe state to the new material
      material.wireframe = currentWireframe;
    }
  }

  /**
   * Get current skin type
   */
  getCurrentSkin(): BlobSkinType {
    return this.currentSkin;
  }

  /**
   * Get spike values
   */
  getSpikes(): { x: number; y: number; z: number } {
    return { ...this.spikes };
  }

  /**
   * Set spike values for noise frequency
   */
  setSpikes(x: number, y: number, z: number): void {
    this.spikes = { x, y, z };
  }

  /**
   * Get time values
   */
  getTime(): { x: number; y: number; z: number } {
    return { ...this.time };
  }

  /**
   * Set time values for animation speed
   */
  setTime(x: number, y: number, z: number): void {
    this.time = { x, y, z };
  }

  /**
   * Get rotation values
   */
  getRotation(): { x: number; y: number; z: number } {
    return { ...this.rotation };
  }

  /**
   * Set rotation speed
   */
  setRotation(x: number, y: number, z: number): void {
    this.rotation = { x, y, z };
  }

  /**
   * Get colors
   */
  getColors(): { x: string; y: string; z: string } {
    return { ...this.colors };
  }

  /**
   * Set colors (for tricolor skin)
   */
  setColors(x: string, y: string, z: string): void {
    this.setColor('x', x);
    this.setColor('y', y);
    this.setColor('z', z);
  }

  /**
   * Set a single color by axis
   */
  setColor(axis: 'x' | 'y' | 'z', color: string): void {
    this.colors[axis] = color;
    const uniformMap = { x: '_color1', y: '_color2', z: '_color3' };
    
    // Update all skins that use colors
    const tricolorMaterial = this.skins.get('tricolor') as ShaderMaterial;
    const tricolor2Material = this.skins.get('tricolor2') as ShaderMaterial;
    const zebraMaterial = this.skins.get('zebra') as ShaderMaterial;
    
    if (tricolorMaterial && tricolorMaterial.uniforms[uniformMap[axis]]) {
      tricolorMaterial.uniforms[uniformMap[axis]].value = new Color(color);
    }
    if (tricolor2Material && tricolor2Material.uniforms[uniformMap[axis]]) {
      tricolor2Material.uniforms[uniformMap[axis]].value = new Color(color);
    }
    if (zebraMaterial && zebraMaterial.uniforms[uniformMap[axis]]) {
      zebraMaterial.uniforms[uniformMap[axis]].value = new Color(color);
    }
    
    // Update light colors if lights are active
    this.updateLightColors();
  }

  getOpacity(): number {
    return this.opacity;
  }

  setOpacity(value: number): void {
    const clamped = Math.max(0, Math.min(1, value));
    this.opacity = clamped;
    this.updateMaterialOpacity(clamped);
  }

  private updateMaterialOpacity(value: number): void {
    const isTransparent = value < 0.999;

    this.skins.forEach((material) => {
      const shader = material as ShaderMaterial;
      if (shader.uniforms?.opacity) {
        shader.uniforms.opacity.value = value;
      }
      shader.transparent = isTransparent;
      shader.depthWrite = !isTransparent;
      shader.opacity = value;
      shader.needsUpdate = true;
    });

    if (this.mesh) {
      const meshMaterial = this.mesh.material as ShaderMaterial;
      if (meshMaterial.uniforms?.opacity) {
        meshMaterial.uniforms.opacity.value = value;
      }
      meshMaterial.transparent = isTransparent;
      meshMaterial.depthWrite = !isTransparent;
      meshMaterial.opacity = value;
      meshMaterial.needsUpdate = true;
    }
  }

  /**
   * Set mesh resolution (number of segments)
   */
  setResolution(resolution: number): void {
    const geometry = createBlobGeometry(resolution);
    this.mesh.geometry.dispose();
    this.mesh.geometry = geometry;
  }

  /**
   * Get scale value
   */
  getScale(): number {
    return this.baseScale;
  }

  /**
   * Set scale (uniform scaling on all axes)
   */
  setScale(scale: number): void {
    console.log('Blob.setScale called with:', scale);
    this.baseScale = scale;
    console.log('Base scale set to:', this.baseScale);
  }

  /**
   * Get wireframe mode
   */
  getWireframe(): boolean {
    return (this.mesh.material as ShaderMaterial).wireframe;
  }

  /**
   * Set wireframe mode
   */
  setWireframe(wireframe: boolean): void {
    (this.mesh.material as ShaderMaterial).wireframe = wireframe;
  }

  /**
   * Get shininess value
   */
  getShininess(): number {
    const material = this.mesh.material as ShaderMaterial;
    return material.uniforms.shininess?.value || 0;
  }

  /**
   * Set shininess (for specular highlights)
   */
  setShininess(value: number): void {
    const material = this.mesh.material as ShaderMaterial;
    if (material.uniforms.shininess) {
      material.uniforms.shininess.value = value;
    }
  }

  /**
   * Set light intensity (0 = off)
   */
  setLightIntensity(intensity: number): void {
    this.lightIntensity = intensity;
    
    if (intensity > 0) {
      // Create lights if they don't exist
      if (!this.lights) {
        this.initializeLights();
      }
      // Update light intensities
      if (this.lights) {
        this.lights.x.intensity = intensity;
        this.lights.y.intensity = intensity;
        this.lights.z.intensity = intensity;
      }
    } else {
      // Turn off lights by setting intensity to 0
      if (this.lights) {
        this.lights.x.intensity = 0;
        this.lights.y.intensity = 0;
        this.lights.z.intensity = 0;
      }
    }
  }

  /**
   * Initialize tricolor lights
   */
  private initializeLights(): void {
    // Create three point lights with the blob's colors
    const lightX = new PointLight(new Color(this.colors.x).getHex(), this.lightIntensity, 10);
    const lightY = new PointLight(new Color(this.colors.y).getHex(), this.lightIntensity, 10);
    const lightZ = new PointLight(new Color(this.colors.z).getHex(), this.lightIntensity, 10);
    
    // Position lights around the blob
    lightX.position.set(3, 0, 0);
    lightY.position.set(0, 3, 0);
    lightZ.position.set(0, 0, 3);
    
    // Add lights to the scene
    this.options.scene.add(lightX);
    this.options.scene.add(lightY);
    this.options.scene.add(lightZ);
    
    this.lights = { x: lightX, y: lightY, z: lightZ };
  }

  /**
   * Update light colors when blob colors change
   */
  private updateLightColors(): void {
    if (this.lights) {
      this.lights.x.color.setHex(new Color(this.colors.x).getHex());
      this.lights.y.color.setHex(new Color(this.colors.y).getHex());
      this.lights.z.color.setHex(new Color(this.colors.z).getHex());
    }
  }

  /**
   * Generate random blob appearance
   */
  setRandomBlob(): void {
    this.dna = genDNA();

    // Random spikes
    this.spikes = {
      x: getRandomBetween(
        this.config.spikes.rMin,
        this.config.spikes.rMax,
        this.config.spikes.digits,
      ),
      y: getRandomBetween(
        this.config.spikes.rMin,
        this.config.spikes.rMax,
        this.config.spikes.digits,
      ),
      z: getRandomBetween(
        this.config.spikes.rMin,
        this.config.spikes.rMax,
        this.config.spikes.digits,
      ),
    };

    // Random time
    this.time = {
      x: getRandomBetween(0.5, 10, 1),
      y: getRandomBetween(0.5, 10, 1),
      z: getRandomBetween(0.5, 10, 1),
    };

    // Random rotation
    if (getRandomBoolean()) {
      this.rotation = {
        x: getRandomBetween(0, 0.01, 3),
        y: getRandomBetween(0, 0.01, 3),
        z: getRandomBetween(0, 0.01, 3),
      };
    } else {
      this.rotation = { x: 0, y: 0, z: 0 };
    }

    // Random resolution
    const resolution = getRandomBetween(
      this.config.resolution.min,
      this.config.resolution.max,
    );
    this.setResolution(resolution);

    // Random colors
    this.setColors(
      getRandomHexColor(),
      getRandomHexColor(),
      getRandomHexColor(),
    );

    // Random scale
    this.setScale(getRandomBetween(3.5, 8, 1));

    // Random shininess
    this.setShininess(getRandomBetween(1, 200, 1));

    // Random wireframe
    this.setWireframe(getRandomBoolean(0.1));
  }

  /**
   * Export blob as GLTF file
   */
  exportGLTF(): void {
    const exporter = new GLTFExporter();

    exporter.parse(
      this.options.scene,
      (result) => {
        const blobData = new globalThis.Blob([result as ArrayBuffer], {
          type: 'model/gltf-binary',
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blobData);
        link.download = 'kwami-blob.glb';
        link.click();
      },
      (error) => {
        console.error('Failed to export GLTF:', error);
      },
      { binary: true },
    );
  }

  /**
   * Enable click interaction on the blob
   */
  enableClickInteraction(): void {
    if (this.clickEnabled) return;
    this.clickEnabled = true;

    const canvas = this.options.renderer.domElement;
    const raycaster = new Raycaster();
    const mouse = new Vector2();

    const handleClick = (event: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update the raycaster
      raycaster.setFromCamera(mouse, this.options.camera);

      // Check for intersections
      const intersects = raycaster.intersectObject(this.mesh);
      
      if (intersects.length > 0) {
        const intersect = intersects[0];
        if (intersect.point) {
          // Convert world position to local position
          const localPoint = this.mesh.worldToLocal(intersect.point.clone());
          
          // Limit to maximum active touch points to prevent over-stacking
          if (this.touchPoints.length >= this.maxTouchPoints) {
            this.touchPoints.shift(); // Remove oldest touch point
          }
          
          // Add touch point with smooth decay
          this.touchPoints.push({
            position: localPoint,
            strength: this.touchStrength,
            startTime: Date.now(),
            duration: this.touchDuration,
          });
        }
      }
    };

    // Handle double-click for listening mode
    const handleDoubleClick = async (event: MouseEvent) => {
      event.preventDefault();
      
      // Calculate mouse position
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update the raycaster
      raycaster.setFromCamera(mouse, this.options.camera);

      // Check for intersections
      const intersects = raycaster.intersectObject(this.mesh);
      
      if (intersects.length > 0) {
        // Toggle listening mode
        if (this.isListening) {
          this.stopListening();
        } else {
          await this.startListening();
        }
      }
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('dblclick', handleDoubleClick);
    
    // Store the handlers for cleanup
    (this as any)._clickHandler = handleClick;
    (this as any)._dblClickHandler = handleDoubleClick;
  }

  /**
   * Disable click interaction
   */
  disableClickInteraction(): void {
    if (!this.clickEnabled) return;
    this.clickEnabled = false;

    const canvas = this.options.renderer.domElement;
    const clickHandler = (this as any)._clickHandler;
    const dblClickHandler = (this as any)._dblClickHandler;
    
    if (clickHandler) {
      canvas.removeEventListener('click', clickHandler);
      delete (this as any)._clickHandler;
    }
    
    if (dblClickHandler) {
      canvas.removeEventListener('dblclick', dblClickHandler);
      delete (this as any)._dblClickHandler;
    }
    
    // Stop listening if active
    if (this.isListening) {
      this.stopListening();
    }
    
    // Clear any active touch points
    this.touchPoints = [];
  }

  /**
   * Start listening to microphone input (inverts spikes)
   */
  async startListening(): Promise<void> {
    try {
      await this.options.audio.startMicrophoneListening();
      this.isListening = true;
      console.log('🎤 Started listening to microphone');
    } catch (error) {
      console.error('Failed to start listening:', error);
      throw error;
    }
  }

  /**
   * Stop listening to microphone input
   */
  stopListening(): void {
    this.options.audio.stopMicrophoneListening();
    this.isListening = false;
    console.log('🔇 Stopped listening to microphone');
  }

  /**
   * Start thinking mode (random chaotic animation)
   */
  startThinking(): void {
    // Clear any existing timeout
    if (this.thinkingTimeout !== null) {
      clearTimeout(this.thinkingTimeout);
    }
    
    this.isThinking = true;
    this.thinkingStartTime = Date.now();
    console.log(`🤔 Started thinking mode (${this.thinkingDuration / 1000}s)`);
    
    // Auto-stop after duration
    this.thinkingTimeout = window.setTimeout(() => {
      this.stopThinking();
    }, this.thinkingDuration);
  }

  /**
   * Stop thinking mode
   */
  stopThinking(): void {
    if (this.thinkingTimeout !== null) {
      clearTimeout(this.thinkingTimeout);
      this.thinkingTimeout = null;
    }
    
    this.isThinking = false;
    console.log('💭 Stopped thinking mode');
  }

  /**
   * Cleanup and dispose resources
   */
  dispose(): void {
    this.disableClickInteraction();
    this.stopThinking();
    this.stopAnimation();
    this.mesh.geometry.dispose();

    // Dispose all skin materials
    this.skins.forEach(material => material.dispose());
    this.skins.clear();
    if (this.backgroundTexture) {
      this.backgroundTexture.dispose();
      this.backgroundTexture = null;
    }
    
    // Remove lights from scene
    if (this.lights) {
      this.options.scene.remove(this.lights.x);
      this.options.scene.remove(this.lights.y);
      this.options.scene.remove(this.lights.z);
      this.lights = null;
    }
  }
}
