import type { Scene, PerspectiveCamera, WebGLRenderer } from 'three';
import type { KwamiAudio } from '../core/Audio';

/**
 * Kwami states representing different modes of operation
 */
export type KwamiState = 'idle' | 'listening' | 'thinking' | 'speaking';

/**
 * Available skin types for the blob
 */
export type BlobSkinType = 'tricolor' | 'tricolor2' | 'zebra';

/**
 * Audio configuration options
 */
export interface AudioConfig {
  preload?: 'auto' | 'metadata' | 'none';
  autoInitialize?: boolean;
  volume?: number;
}

/**
 * Scene background configuration
 */
export interface SceneBackgroundConfig {
  type?: 'transparent' | 'solid' | 'gradient';
  color?: string; // For solid background
  opacity?: number; // Opacity for solid/gradient background
  gradient?: {
    colors: string[]; // Array of hex colors
    direction?: 'vertical' | 'horizontal' | 'radial' | 'diagonal';
    opacity?: number;
    angle?: number; // Angle in degrees for linear gradients
    stops?: number[]; // Normalized stop positions (0-1) matching colors length
  };
}

/**
 * Scene configuration options
 */
export interface SceneConfig {
  fov?: number;
  near?: number;
  far?: number;
  cameraPosition?: { x: number; y: number; z: number };
  lightIntensity?: {
    top?: number;
    bottom?: number;
    ambient?: number;
  };
  enableShadows?: boolean;
  enableControls?: boolean;
  background?: SceneBackgroundConfig;
}

/**
 * Blob configuration options
 */
export interface BlobConfig {
  resolution?: number;
  spikes?: { x: number; y: number; z: number };
  time?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  colors?: { x: string; y: string; z: string };
  shininess?: number;
  wireframe?: boolean;
}

/**
 * Body configuration options
 */
export interface BodyConfig {
  audioFiles?: string[];
  audio?: AudioConfig;
  scene?: SceneConfig;
  blob?: BlobConfig;
  initialSkin?: BlobSkinType;
}

/**
 * ElevenLabs Voice Settings Configuration
 */
export interface VoiceSettings {
  stability?: number; // 0-1: Controls expressiveness vs consistency
  similarity_boost?: number; // 0-1: Enhances voice clarity
  style?: number; // 0-1: Adds expressiveness (use with caution)
  use_speaker_boost?: boolean; // Enhanced clarity option
}

/**
 * TTS Output Format Options
 */
export type TTSOutputFormat = 
  | 'mp3_44100_128'  // MP3 - 44.1kHz, 128kbps (Recommended)
  | 'mp3_44100_64'   // MP3 - 44.1kHz, 64kbps (Smaller size)
  | 'mp3_44100_192'  // MP3 - 44.1kHz, 192kbps (High quality)
  | 'pcm_16000'      // PCM - 16kHz (Low latency)
  | 'pcm_22050'      // PCM - 22.05kHz (Balanced)
  | 'pcm_24000'      // PCM - 24kHz (Good quality)
  | 'pcm_44100';     // PCM - 44.1kHz (CD quality)

/**
 * STT Model Options
 */
export type STTModel = 'base' | 'small' | 'medium' | 'large';

/**
 * Advanced TTS Options
 */
export interface AdvancedTTSOptions {
  outputFormat?: TTSOutputFormat; // Audio output format
  optimizeStreamingLatency?: boolean; // Reduces delay for real-time applications
  nextTextTimeout?: number; // Wait time before processing next chunk (ms)
}

/**
 * Conversational AI Settings
 */
export interface ConversationalAISettings {
  agentId?: string; // ElevenLabs agent ID
  firstMessage?: string; // Agent's opening greeting
  maxDuration?: number; // Maximum conversation length (seconds)
  allowInterruption?: boolean; // Let users interrupt the agent mid-speech
}

/**
 * Speech-to-Text Configuration
 */
export interface STTConfig {
  model?: STTModel; // STT model selection
  language?: string; // Language code (e.g., 'en', 'es', 'fr')
  automaticPunctuation?: boolean; // Add punctuation automatically
  speakerDiarization?: boolean; // Identify different speakers
}

/**
 * Pronunciation Dictionary Entry
 */
export interface PronunciationEntry {
  word: string;
  pronunciation: string;
}

/**
 * Pronunciation Configuration
 */
export interface PronunciationConfig {
  dictionary?: Map<string, string> | Record<string, string>; // Custom pronunciations
  useIPAPhonemes?: boolean; // Use International Phonetic Alphabet
}

/**
 * AI Mind configuration for ElevenLabs Voice Agent
 */
export interface MindConfig {
  // Authentication
  apiKey?: string; // ElevenLabs API key (or from env)
  
  // Voice configuration
  voice?: {
    voiceId?: string; // Specific voice ID from ElevenLabs
    model?: string; // e.g., 'eleven_multilingual_v2', 'eleven_turbo_v2', 'eleven_turbo_v2_5'
    settings?: VoiceSettings; // Fine-tuning parameters
  };
  
  // Language and behavior
  language?: string; // Primary language (e.g., 'en', 'es', 'fr')
  
  // Advanced TTS options
  advancedTTS?: AdvancedTTSOptions;
  
  // Conversational AI
  conversational?: ConversationalAISettings;
  
  // Speech-to-Text
  stt?: STTConfig;
  
  // Pronunciation
  pronunciation?: PronunciationConfig;
  
  // Legacy/additional AI configuration
  llm?: {
    model: string;
    provider: string;
    temperature?: number;
    maxTokens?: number;
  };
}

/**
 * AI Soul (personality) configuration
 */
export interface SoulConfig {
  name?: string; // Kwami's identifier/name
  personality?: string; // Overall personality description
  systemPrompt?: string; // Base AI instructions for behavior
  traits?: string[]; // Array of personality characteristics
  language?: string; // Preferred communication language
  conversationStyle?: string; // Tone and style guidelines (e.g., 'friendly', 'professional')
  responseLength?: 'short' | 'medium' | 'long'; // Preferred response verbosity
  emotionalTone?: 'neutral' | 'warm' | 'enthusiastic' | 'calm'; // Emotional expression level
}

/**
 * Main Kwami configuration
 */
export interface KwamiConfig {
  body?: BodyConfig;
  mind?: MindConfig;
  soul?: SoulConfig;
}

/**
 * Blob constructor options
 */
export interface BlobOptions {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  audio: KwamiAudio;
  skin: BlobSkinType;
  resolution?: number;
  spikes?: { x: number; y: number; z: number };
  time?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  onAfterRender?: () => void;
}

/**
 * Skin material uniforms
 */
export interface SkinUniforms {
  lightPosition: { value: any };
  shininess: { value: number };
  specular_color: { value: any };
  [key: string]: any;
}

/**
 * Tricolor skin configuration
 */
export interface TricolorSkinConfig {
  wireframe: boolean;
  lightPosition: { x: number; y: number; z: number };
  shininess: number;
  color1: string;
  color2: string;
  color3: string;
  opacity: number;
}

/**
 * Zebra skin configuration
 */
export interface ZebraSkinConfig {
  wireframe: boolean;
  lightPosition: { x: number; y: number; z: number };
  shininess: number;
  opacity: number;
  color1: string;
  color2: string;
  color3: string;
}

/**
 * Blob options configuration
 */
export interface BlobOptionsConfig {
  spikes: {
    min: number;
    max: number;
    step: number;
    digits: number;
    rMin: number;
    rMax: number;
    default: number;
  };
  speed: {
    min: number;
    max: number;
    default: number;
  };
  processing: {
    min: number;
    max: number;
    default: number;
  };
  resolution: {
    min: number;
    max: number;
    default: number;
    step: number;
  };
  skins: {
    tricolor: TricolorSkinConfig;
    tricolor2: TricolorSkinConfig;
    zebra: ZebraSkinConfig;
  };
}

/**
 * Event handler type
 */
export type EventHandler = () => void;

/**
 * Event handlers map
 */
export interface EventHandlers {
  onClick?: EventHandler;
  onDoubleClick?: EventHandler;
  onHover?: EventHandler;
  onPress?: EventHandler;
  [key: string]: EventHandler | undefined;
}
