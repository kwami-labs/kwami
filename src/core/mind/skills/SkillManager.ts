import type { Kwami } from '../../Kwami';
import type {
  SkillDefinition,
  SkillActionUnion,
  SkillContext,
  SkillExecutionResult,
  SkillRegistryEntry,
  PositionAction,
  ScaleAction,
  ColorsAction,
  SpikesAction,
  TimeAction,
  RotationAction,
  CameraAction,
  SkinAction,
  BackgroundAction,
  SoulTraitAction,
  SpeakAction,
  WaitAction,
  SequenceAction,
  PositionPreset,
} from './types';

/**
 * SkillManager - Manages and executes Kwami skills
 * 
 * Allows loading skills from YAML/JSON files or registering them
 * programmatically via API. Skills control Kwami's behavior and appearance.
 */
export class SkillManager {
  private kwami: Kwami;
  private registry: Map<string, SkillRegistryEntry> = new Map();
  private activeSkills: Map<string, SkillContext> = new Map();
  private positionPresets: Record<PositionPreset, { x: number; y: number; z: number }>;

  constructor(kwami: Kwami) {
    this.kwami = kwami;
    
    // Define position presets (relative to canvas)
    this.positionPresets = {
      'top-left': { x: -0.7, y: 0.7, z: -2 },
      'top-center': { x: 0, y: 0.7, z: -2 },
      'top-right': { x: 0.7, y: 0.7, z: -2 },
      'center-left': { x: -0.7, y: 0, z: -2 },
      'center': { x: 0, y: 0, z: -2 },
      'center-right': { x: 0.7, y: 0, z: -2 },
      'bottom-left': { x: -0.7, y: -0.7, z: -2 },
      'bottom-center': { x: 0, y: -0.7, z: -2 },
      'bottom-right': { x: 0.7, y: -0.7, z: -2 },
    };
  }

  /**
   * Register a skill from a definition object
   */
  registerSkill(definition: SkillDefinition, source: 'file' | 'api' | 'inline' = 'api'): void {
    const entry: SkillRegistryEntry = {
      definition,
      source,
      loadedAt: new Date(),
    };
    
    this.registry.set(definition.id, entry);
    console.log(`[SkillManager] Registered skill: ${definition.name} (${definition.id})`);
  }

  /**
   * Load skill from YAML/JSON string
   */
  loadSkillFromString(content: string, format: 'yaml' | 'json' = 'json'): void {
    try {
      let definition: SkillDefinition;
      
      if (format === 'json') {
        definition = JSON.parse(content);
      } else {
        // For YAML, you'd need a YAML parser like js-yaml
        // For now, we'll throw an error
        throw new Error('YAML parsing not yet implemented. Please use JSON or install js-yaml.');
      }
      
      this.registerSkill(definition, 'file');
    } catch (error) {
      console.error('[SkillManager] Failed to load skill:', error);
      throw error;
    }
  }

  /**
   * Load skill from URL
   */
  async loadSkillFromUrl(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const content = await response.text();
      
      const format = url.endsWith('.yaml') || url.endsWith('.yml') ? 'yaml' : 'json';
      this.loadSkillFromString(content, format);
    } catch (error) {
      console.error('[SkillManager] Failed to load skill from URL:', error);
      throw error;
    }
  }

  /**
   * Get skill by ID
   */
  getSkill(id: string): SkillDefinition | undefined {
    return this.registry.get(id)?.definition;
  }

  /**
   * Get all registered skills
   */
  getAllSkills(): SkillDefinition[] {
    return Array.from(this.registry.values()).map(entry => entry.definition);
  }

  /**
   * Execute a skill by ID
   */
  async executeSkill(id: string, params?: Record<string, any>): Promise<SkillExecutionResult> {
    const startTime = Date.now();
    const entry = this.registry.get(id);
    
    if (!entry) {
      return {
        success: false,
        skillId: id,
        duration: 0,
        error: `Skill not found: ${id}`,
      };
    }

    const { definition } = entry;
    
    try {
      console.log(`[SkillManager] Executing skill: ${definition.name}`);
      
      // Create execution context
      const context: SkillContext = {
        skillId: id,
        startTime,
        params,
        originalState: this.captureCurrentState(),
      };
      
      this.activeSkills.set(id, context);
      
      // Execute all actions
      await this.executeActions(definition.actions, context);
      
      // Handle auto-reverse
      if (definition.autoReverse) {
        const delay = definition.reverseDelay || 0;
        if (delay > 0) {
          await this.wait(delay);
        }
        await this.reverseSkill(id);
      }
      
      this.activeSkills.delete(id);
      
      const duration = Date.now() - startTime;
      console.log(`[SkillManager] Skill completed: ${definition.name} (${duration}ms)`);
      
      return {
        success: true,
        skillId: id,
        duration,
      };
    } catch (error) {
      this.activeSkills.delete(id);
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        skillId: id,
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Execute an array of actions
   */
  private async executeActions(actions: SkillActionUnion[], context: SkillContext): Promise<void> {
    for (const action of actions) {
      await this.executeAction(action, context);
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: SkillActionUnion, context: SkillContext): Promise<void> {
    const duration = action.duration || 0;
    
    switch (action.type) {
      case 'body.position':
        await this.executePositionAction(action as PositionAction, duration);
        break;
      
      case 'body.scale':
        await this.executeScaleAction(action as ScaleAction, duration);
        break;
      
      case 'body.colors':
        await this.executeColorsAction(action as ColorsAction, duration);
        break;
      
      case 'body.spikes':
        await this.executeSpikesAction(action as SpikesAction);
        break;
      
      case 'body.time':
        await this.executeTimeAction(action as TimeAction);
        break;
      
      case 'body.rotation':
        await this.executeRotationAction(action as RotationAction);
        break;
      
      case 'body.camera':
        await this.executeCameraAction(action as CameraAction, duration);
        break;
      
      case 'body.skin':
        await this.executeSkinAction(action as SkinAction);
        break;
      
      case 'body.background':
        await this.executeBackgroundAction(action as BackgroundAction);
        break;
      
      case 'soul.trait':
        await this.executeSoulTraitAction(action as SoulTraitAction);
        break;
      
      case 'mind.speak':
        await this.executeSpeakAction(action as SpeakAction);
        break;
      
      case 'wait':
        await this.executeWaitAction(action as WaitAction);
        break;
      
      case 'sequence':
        await this.executeSequenceAction(action as SequenceAction, context);
        break;
      
      default:
        console.warn('[SkillManager] Unknown action type:', (action as any).type);
    }
  }

  /**
   * Position action - Move Kwami to a specific location
   */
  private async executePositionAction(action: PositionAction, duration: number): Promise<void> {
    let targetX: number, targetY: number, targetZ: number;
    
    if (action.preset) {
      const preset = this.positionPresets[action.preset];
      targetX = preset.x;
      targetY = preset.y;
      targetZ = preset.z;
    } else {
      targetX = action.x ?? 0;
      targetY = action.y ?? 0;
      targetZ = action.z ?? -2;
    }
    
    // Animate position change
    if (duration > 0) {
      await this.animateCameraPosition(targetX, targetY, targetZ, duration, action.easing);
    } else {
      this.kwami.body.setCameraPosition(targetX, targetY, targetZ);
    }
  }

  /**
   * Scale action - Change Kwami's size
   */
  private async executeScaleAction(action: ScaleAction, duration: number): Promise<void> {
    let targetScale: number;
    
    if (action.preset) {
      const scalePresets: Record<string, number> = {
        'mini': 2,
        'small': 3,
        'normal': 4,
        'large': 6,
        'huge': 8,
      };
      targetScale = scalePresets[action.preset] || 4;
    } else {
      targetScale = action.value;
    }
    
    // Animate scale change
    if (duration > 0) {
      await this.animateScale(targetScale, duration, action.easing);
    } else {
      this.kwami.body.blob.setScale(targetScale);
    }
  }

  /**
   * Colors action - Change blob colors
   */
  private async executeColorsAction(action: ColorsAction, duration: number): Promise<void> {
    const currentColors = this.kwami.body.blob.colors;
    const newColors = {
      x: action.primary || currentColors.x,
      y: action.secondary || currentColors.y,
      z: action.accent || currentColors.z,
    };
    
    this.kwami.body.blob.setColors(newColors.x, newColors.y, newColors.z);
    
    // Note: Color changes are instant in current implementation
    // Could be enhanced with color interpolation for smooth transitions
    if (duration > 0) {
      await this.wait(duration);
    }
  }

  /**
   * Spikes action - Change blob noise frequency
   */
  private async executeSpikesAction(action: SpikesAction): Promise<void> {
    const x = action.x ?? 0.2;
    const y = action.y ?? 0.2;
    const z = action.z ?? 0.2;
    this.kwami.body.blob.setSpikes(x, y, z);
  }

  /**
   * Time action - Change animation speed
   */
  private async executeTimeAction(action: TimeAction): Promise<void> {
    const x = action.x ?? 1.0;
    const y = action.y ?? 1.0;
    const z = action.z ?? 1.0;
    this.kwami.body.blob.setTime(x, y, z);
  }

  /**
   * Rotation action - Change auto-rotation
   */
  private async executeRotationAction(action: RotationAction): Promise<void> {
    const x = action.x ?? 0;
    const y = action.y ?? 0;
    const z = action.z ?? 0;
    this.kwami.body.blob.setRotation(x, y, z);
  }

  /**
   * Camera action - Change camera position
   */
  private async executeCameraAction(action: CameraAction, duration: number): Promise<void> {
    const currentPos = this.kwami.body.getCameraPosition();
    const x = action.x ?? currentPos.x;
    const y = action.y ?? currentPos.y;
    const z = action.z ?? currentPos.z;
    
    if (duration > 0) {
      await this.animateCameraPosition(x, y, z, duration, action.easing);
    } else {
      this.kwami.body.setCameraPosition(x, y, z);
    }
  }

  /**
   * Skin action - Change blob skin/material
   */
  private async executeSkinAction(action: SkinAction): Promise<void> {
    this.kwami.body.blob.setSkin(action.skin);
  }

  /**
   * Background action - Change background
   */
  private async executeBackgroundAction(action: BackgroundAction): Promise<void> {
    if (action.colors && action.colors.length >= 2) {
      // Create gradient background
      this.kwami.body.setBackgroundGradient(action.colors, {
        direction: action.gradient?.style === 'radial' ? 'radial' : 'vertical',
        angle: action.gradient?.angle,
      });
    }
    
    if (action.image) {
      this.kwami.body.setBackgroundImage(action.image);
    }
    
    if (action.video) {
      this.kwami.body.setBackgroundVideo(action.video, { autoplay: true, loop: true, muted: true });
    }
  }

  /**
   * Soul trait action - Change personality trait
   */
  private async executeSoulTraitAction(action: SoulTraitAction): Promise<void> {
    this.kwami.soul.setEmotionalTrait(action.trait, action.value);
  }

  /**
   * Speak action - Make Kwami speak
   */
  private async executeSpeakAction(action: SpeakAction): Promise<void> {
    await this.kwami.mind.speak(action.text, action.systemPrompt);
  }

  /**
   * Wait action - Pause execution
   */
  private async executeWaitAction(action: WaitAction): Promise<void> {
    await this.wait(action.duration);
  }

  /**
   * Sequence action - Execute multiple actions
   */
  private async executeSequenceAction(action: SequenceAction, context: SkillContext): Promise<void> {
    if (action.parallel) {
      // Execute all actions simultaneously
      await Promise.all(action.actions.map(a => this.executeAction(a, context)));
    } else {
      // Execute actions in sequence
      await this.executeActions(action.actions, context);
    }
  }

  /**
   * Reverse a skill (restore original state)
   */
  private async reverseSkill(id: string): Promise<void> {
    const context = this.activeSkills.get(id);
    if (!context || !context.originalState) {
      console.warn('[SkillManager] Cannot reverse skill: no context or original state');
      return;
    }
    
    const state = context.originalState;
    
    // Restore camera position
    if (state.cameraPosition) {
      const pos = state.cameraPosition as { x: number; y: number; z: number };
      await this.animateCameraPosition(pos.x, pos.y, pos.z, 500, 'ease-in-out');
    }
    
    // Restore scale
    if (state.scale !== undefined) {
      await this.animateScale(state.scale as number, 500, 'ease-in-out');
    }
    
    // Restore colors
    if (state.colors) {
      const colors = state.colors as { x: string; y: string; z: string };
      this.kwami.body.blob.setColors(colors.x, colors.y, colors.z);
    }
  }

  /**
   * Capture current state for reversal
   */
  private captureCurrentState(): Record<string, any> {
    return {
      cameraPosition: this.kwami.body.getCameraPosition(),
      scale: this.kwami.body.blob.baseScale,
      colors: { ...this.kwami.body.blob.colors },
    };
  }

  /**
   * Animate camera position
   */
  private async animateCameraPosition(
    targetX: number,
    targetY: number,
    targetZ: number,
    duration: number,
    easing: string = 'ease-in-out'
  ): Promise<void> {
    const startPos = this.kwami.body.getCameraPosition();
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = this.applyEasing(progress, easing);
        
        this.kwami.body.setCameraPosition(
          startPos.x + (targetX - startPos.x) * easedProgress,
          startPos.y + (targetY - startPos.y) * easedProgress,
          startPos.z + (targetZ - startPos.z) * easedProgress
        );
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }

  /**
   * Animate scale
   */
  private async animateScale(
    targetScale: number,
    duration: number,
    easing: string = 'ease-in-out'
  ): Promise<void> {
    const startScale = this.kwami.body.blob.baseScale;
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = this.applyEasing(progress, easing);
        
        const currentScale = startScale + (targetScale - startScale) * easedProgress;
        this.kwami.body.blob.setScale(currentScale);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }

  /**
   * Apply easing function to progress value
   */
  private applyEasing(t: number, easing: string): number {
    switch (easing) {
      case 'linear':
        return t;
      case 'ease-in':
        return t * t;
      case 'ease-out':
        return t * (2 - t);
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      case 'bounce':
        if (t < 0.5) {
          return 8 * t * t * t * t;
        } else {
          const f = t - 1;
          return 1 + 8 * f * f * f * f;
        }
      default:
        return t;
    }
  }

  /**
   * Wait for a specified duration
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Unregister a skill
   */
  unregisterSkill(id: string): boolean {
    return this.registry.delete(id);
  }

  /**
   * Clear all registered skills
   */
  clearSkills(): void {
    this.registry.clear();
    console.log('[SkillManager] All skills cleared');
  }

  /**
   * Get skill statistics
   */
  getStats(): {
    totalSkills: number;
    activeSkills: number;
    skillsBySource: Record<string, number>;
  } {
    const skillsBySource: Record<string, number> = {};
    
    for (const entry of this.registry.values()) {
      skillsBySource[entry.source] = (skillsBySource[entry.source] || 0) + 1;
    }
    
    return {
      totalSkills: this.registry.size,
      activeSkills: this.activeSkills.size,
      skillsBySource,
    };
  }
}
