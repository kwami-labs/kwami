/**
 * Type Definitions
 * 
 * Centralized type definitions for Kwami Playground
 */

// ============================================================================
// BLOB TYPES
// ============================================================================

export interface BlobParams {
  // Noise frequency
  spikeX: number;
  spikeY: number;
  spikeZ: number;
  
  // Frequency amplitude
  amplitudeX: number;
  amplitudeY: number;
  amplitudeZ: number;
  
  // Animation speed
  timeX: number;
  timeY: number;
  timeZ: number;
  
  // Rotation
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  
  // Colors
  colorX: string;
  colorY: string;
  colorZ: string;
  
  // Material
  shininess: number;
  lightIntensity: number;
  resolution: number;
  wireframe: boolean;
  
  // Scale & Camera
  scale: number;
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  
  // Skin
  skinType: 'tricolor' | 'tricolor2' | 'zebra';
  
  // Blob texture
  blobMediaType: 'none' | 'image' | 'video';
  blobMediaSource: string | null;
  blobOpacity: number;
  blobImageTransparency: boolean;
  
  // Audio effects
  audioBassSpike: number;
  audioMidSpike: number;
  audioHighSpike: number;
  audioReactivity: number;
  audioSensitivity: number;
  audioBreathing: number;
  audioTimeEnabled: boolean;
  audioMidTime: number;
  audioHighTime: number;
  audioUltraTime: number;
  audioReactive: boolean;
  fftSize: number;
  smoothing: number;
  
  // Interaction
  clickInteraction: boolean;
  touchStrength: number;
  touchDuration: number;
  maxTouches: number;
  transitionSpeed: number;
  thinkingDuration: number;
}

export type BlobState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error' | 'minimized';

// ============================================================================
// BACKGROUND TYPES
// ============================================================================

export interface BackgroundConfig {
  // Gradient
  gradientEnabled: boolean;
  bgOpacity: number;
  bgGradientAngle: number;
  bgGradientStop1: number;
  bgGradientStop2: number;
  bgGradientStyle: 'linear' | 'radial' | 'random';
  bgColor1: string;
  bgColor2: string;
  bgColor3: string;
  
  // Media
  bgMediaType: 'none' | 'image' | 'video';
  bgMediaSource: string | null;
}

// ============================================================================
// PERSONALITY TYPES
// ============================================================================

export interface EmotionalTraits {
  happiness: number;
  energy: number;
  confidence: number;
  calmness: number;
  optimism: number;
  socialness: number;
  creativity: number;
  patience: number;
  empathy: number;
  curiosity: number;
}

export interface PersonalityConfig {
  name: string;
  personality: string;
  systemPrompt: string;
  traits: EmotionalTraits;
}

// ============================================================================
// AUDIO TYPES
// ============================================================================

export interface AudioTrack {
  name: string;
  url: string;
}

export interface AudioPlayerState {
  initialized: boolean;
  displayName: string;
  lastVolume: number;
  visible: boolean;
  playlist: AudioTrack[];
  currentIndex: number;
  isCustomTrack: boolean;
}

// ============================================================================
// SIDEBAR TYPES
// ============================================================================

export type SidebarSection = 'mind' | 'body' | 'soul';

export interface SidebarState {
  left: SidebarSection;
  right: SidebarSection;
  hidden: SidebarSection;
  menusCollapsed: boolean;
}

// ============================================================================
// THEME TYPES
// ============================================================================

export type Theme = 'light' | 'dark';

export interface ThemeState {
  current: Theme;
  initialized: boolean;
}

// ============================================================================
// COLOR PICKER TYPES
// ============================================================================

export interface ColorPickerState {
  currentColor: string;
  glassEffectEnabled: boolean;
  dropdownOpen: boolean;
}

// ============================================================================
// AGENT TYPES
// ============================================================================

export interface AgentConfig {
  name: string;
  prompt: string;
  firstMessage: string;
  llmModel: string;
  temperature: number;
  maxTokens: number;
  voiceId: string;
  ttsModel: string;
  stability: number;
  similarityBoost: number;
}

export interface Agent {
  agent_id: string;
  name: string;
  created_at: string;
  conversation_config: any;
}

export interface AgentManagerState {
  initialized: boolean;
  agents: Agent[];
  selectedAgent: Agent | null;
  apiKey: string | null;
  conversationActive: boolean;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface PlaygroundConfiguration {
  version: string;
  timestamp: string;
  blob: Partial<BlobParams>;
  background: Partial<BackgroundConfig>;
  personality: PersonalityConfig;
  theme: Theme;
}

// ============================================================================
// MEDIA TYPES
// ============================================================================

export interface MediaItem {
  type: 'image' | 'video';
  src: string;
  thumbnail?: string;
  name?: string;
}

export interface MediaCategory {
  name: string;
  items: MediaItem[];
}

// ============================================================================
// SKILL TYPES
// ============================================================================

export interface SkillAction {
  type: 'setParameter' | 'setState' | 'wait' | 'animate';
  target?: string;
  value?: any;
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface Skill {
  name: string;
  description: string;
  actions: SkillAction[];
  autoReverse?: boolean;
  reverseDuration?: number;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface KwamiEvent {
  type: string;
  timestamp: number;
  data?: any;
}

export type EventCallback = (event: KwamiEvent) => void;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> & {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

