/**
 * Skill System Types
 * 
 * Defines the structure for Kwami skills that can be loaded from YAML/JSON
 * or created programmatically to control Kwami's behavior and appearance.
 */

/**
 * Action types that can be executed by skills
 */
export type SkillActionType = 
  | 'body.position'
  | 'body.scale'
  | 'body.colors'
  | 'body.spikes'
  | 'body.time'
  | 'body.rotation'
  | 'body.camera'
  | 'body.skin'
  | 'body.background'
  | 'body.blob.texture'
  | 'body.blob.opacity'
  | 'soul.trait'
  | 'soul.personality'
  | 'mind.speak'
  | 'wait'
  | 'sequence';

/**
 * Position presets for common screen locations
 */
export type PositionPreset = 
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

import type { BlobSkinSelection } from '../../../types';

/**
 * Base action interface
 */
export interface SkillAction {
  type: SkillActionType;
  duration?: number; // Animation duration in ms
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
}

/**
 * Position action - Move Kwami to a specific position
 */
export interface PositionAction extends SkillAction {
  type: 'body.position';
  preset?: PositionPreset;
  x?: number; // Custom X position (-1 to 1, relative to canvas)
  y?: number; // Custom Y position (-1 to 1, relative to canvas)
  z?: number; // Custom Z position
}

/**
 * Scale action - Change Kwami's size
 */
export interface ScaleAction extends SkillAction {
  type: 'body.scale';
  value?: number; // Scale multiplier (0.1 to 10)
  preset?: 'mini' | 'small' | 'normal' | 'large' | 'huge';
}

/**
 * Colors action - Change blob colors
 */
export interface ColorsAction extends SkillAction {
  type: 'body.colors';
  primary?: string;
  secondary?: string;
  accent?: string;
}

/**
 * Spikes action - Change blob noise frequency
 */
export interface SpikesAction extends SkillAction {
  type: 'body.spikes';
  x?: number;
  y?: number;
  z?: number;
}

/**
 * Time action - Change animation speed
 */
export interface TimeAction extends SkillAction {
  type: 'body.time';
  x?: number;
  y?: number;
  z?: number;
}

/**
 * Rotation action - Change auto-rotation
 */
export interface RotationAction extends SkillAction {
  type: 'body.rotation';
  x?: number;
  y?: number;
  z?: number;
}

/**
 * Camera action - Change camera position
 */
export interface CameraAction extends SkillAction {
  type: 'body.camera';
  x?: number;
  y?: number;
  z?: number;
}

/**
 * Skin action - Change blob skin/material
 */
export interface SkinAction extends SkillAction {
  type: 'body.skin';
  skin: BlobSkinSelection;
}

/**
 * Background action - Change background
 */
export interface BackgroundAction extends SkillAction {
  type: 'body.background';
  colors?: string[];
  image?: string;
  video?: string;
  gradient?: {
    angle: number;
    style: 'linear' | 'radial';
  };
}

/**
 * Soul trait action - Change personality trait
 */
export interface SoulTraitAction extends SkillAction {
  type: 'soul.trait';
  trait: 'happiness' | 'energy' | 'confidence' | 'calmness' | 'optimism' | 'socialness' | 'creativity' | 'patience' | 'empathy' | 'curiosity';
  value: number; // -100 to 100
}

/**
 * Mind speak action - Make Kwami speak
 */
export interface SpeakAction extends SkillAction {
  type: 'mind.speak';
  text: string;
  systemPrompt?: string;
}

/**
 * Wait action - Pause execution
 */
export interface WaitAction extends SkillAction {
  type: 'wait';
  duration: number; // milliseconds
}

/**
 * Sequence action - Execute multiple actions in order
 */
export interface SequenceAction extends SkillAction {
  type: 'sequence';
  actions: SkillActionUnion[];
  parallel?: boolean; // Execute all actions simultaneously
}

/**
 * Union of all action types
 */
export type SkillActionUnion = 
  | PositionAction
  | ScaleAction
  | ColorsAction
  | SpikesAction
  | TimeAction
  | RotationAction
  | CameraAction
  | SkinAction
  | BackgroundAction
  | SoulTraitAction
  | SpeakAction
  | WaitAction
  | SequenceAction;

/**
 * Skill trigger types
 */
export type SkillTrigger = 
  | 'manual' // Triggered by API call
  | 'conversation-start'
  | 'conversation-end'
  | 'state-change'
  | 'time-interval'
  | 'audio-start'
  | 'audio-end';

/**
 * Skill condition
 */
export interface SkillCondition {
  type: 'state' | 'time' | 'custom';
  operator: 'equals' | 'not-equals' | 'greater-than' | 'less-than';
  value: any;
}

/**
 * Complete skill definition
 */
export interface SkillDefinition {
  // Metadata
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  tags?: string[];

  // Execution
  trigger?: SkillTrigger;
  conditions?: SkillCondition[];
  actions: SkillActionUnion[];

  // Options
  autoReverse?: boolean; // Automatically reverse the skill after execution
  reverseDelay?: number; // Delay before reversing (ms)
  loop?: boolean; // Loop the skill
  loopCount?: number; // Number of times to loop (undefined = infinite)
}

/**
 * Skill execution context
 */
export interface SkillContext {
  skillId: string;
  startTime: number;
  params?: Record<string, any>;
  originalState?: Record<string, any>; // Store original values for reversal
}

/**
 * Skill execution result
 */
export interface SkillExecutionResult {
  success: boolean;
  skillId: string;
  duration: number;
  error?: string;
}

/**
 * Skill registry entry
 */
export interface SkillRegistryEntry {
  definition: SkillDefinition;
  source: 'file' | 'api' | 'inline';
  filePath?: string;
  loadedAt: Date;
}

