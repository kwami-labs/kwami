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
export type BackgroundMediaFit = 'cover' | 'contain' | 'stretch';

export interface SceneBackgroundConfig {
  type?: 'transparent' | 'solid' | 'gradient' | 'image' | 'video';
  color?: string; // For solid background
  opacity?: number; // Opacity for solid/gradient background
  gradient?: {
    colors: string[]; // Array of hex colors
    direction?: 'vertical' | 'horizontal' | 'radial' | 'diagonal';
    opacity?: number;
    angle?: number; // Angle in degrees for linear gradients
    stops?: number[]; // Normalized stop positions (0-1) matching colors length
  };
  image?: {
    url: string;
    fit?: BackgroundMediaFit;
    opacity?: number;
  };
  video?: {
    url: string;
    fit?: BackgroundMediaFit;
    opacity?: number;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    playbackRate?: number;
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
  customUrl?: string; // Custom URL for the agent (overrides automatic URL generation)
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

// ==================== ElevenLabs Agents API Types ====================

/**
 * Agent configuration for creating or updating an agent
 */
export interface AgentConfig {
  name?: string;
  prompt?: {
    prompt?: string;
    llm?: string;
    tools?: any[];
    temperature?: number;
    max_tokens?: number;
  };
  first_message?: string;
  language?: string;
  tts?: {
    model_id?: string;
    voice_id?: string;
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  stt?: {
    model?: string;
    language?: string;
  };
  conversation_config?: {
    max_duration_seconds?: number;
    client_events?: string[];
  };
  platform_settings?: any;
  secrets?: Array<{
    name: string;
    value: string;
  }>;
}

/**
 * Agent response from API
 */
export interface AgentResponse {
  agent_id: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
  conversation_config?: any;
  prompt?: any;
  tts?: any;
  stt?: any;
  platform_settings?: any;
}

/**
 * Request to create a new agent
 */
export interface CreateAgentRequest {
  conversation_config?: {
    agent?: {
      prompt?: {
        prompt?: string;
        llm?: string;
        temperature?: number;
        max_tokens?: number;
        tools?: any[];
      };
      first_message?: string;
      language?: string;
    };
    tts?: {
      model_id?: string;
      voice_id?: string;
      agent_output_audio_format?: string;
      stability?: number;
      similarity_boost?: number;
      style?: number;
      use_speaker_boost?: boolean;
    };
    asr?: {
      quality?: 'high' | 'low';
      provider?: string;
      user_input_audio_format?: string;
    };
    client_events?: string[];
  };
  platform_settings?: any;
  secrets?: Array<{
    name: string;
    value: string;
  }>;
}

/**
 * Request to update an existing agent
 */
export interface UpdateAgentRequest {
  conversation_config?: {
    agent?: {
      prompt?: {
        prompt?: string;
        llm?: string;
        temperature?: number;
        max_tokens?: number;
        tools?: any[];
      };
      first_message?: string;
      language?: string;
    };
    tts?: {
      model_id?: string;
      voice_id?: string;
      stability?: number;
      similarity_boost?: number;
      style?: number;
      use_speaker_boost?: boolean;
    };
    asr?: {
      quality?: 'high' | 'low';
      provider?: string;
    };
    client_events?: string[];
  };
  platform_settings?: any;
  secrets?: Array<{
    name: string;
    value: string;
  }>;
}

/**
 * List agents request options
 */
export interface ListAgentsOptions {
  page_size?: number;
  page_token?: string;
}

/**
 * List agents response with pagination
 */
export interface ListAgentsResponse {
  agents: AgentResponse[];
  next_page_token?: string;
  has_more?: boolean;
}

/**
 * Request to duplicate an agent
 */
export interface DuplicateAgentRequest {
  new_name?: string;
  new_agent_share_link_enabled?: boolean;
}

/**
 * Conversation message for simulation
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  message: string;
}

/**
 * Request to simulate a conversation
 */
export interface SimulateConversationRequest {
  conversation_history?: ConversationMessage[];
  model_overrides?: {
    prompt?: {
      prompt?: string;
      llm?: string;
      temperature?: number;
    };
  };
}

/**
 * Response from simulated conversation
 */
export interface SimulateConversationResponse {
  status: 'success' | 'error';
  agent_response?: string;
  metadata?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    latency_ms?: number;
  };
  error?: string;
}

/**
 * Request to calculate LLM usage
 */
export interface LLMUsageRequest {
  prompt_tokens?: number;
  conversation_turns?: number;
  average_user_message_length?: number;
  model_overrides?: {
    llm?: string;
  };
}

/**
 * Response with LLM usage calculation
 */
export interface LLMUsageResponse {
  estimated_prompt_tokens: number;
  estimated_completion_tokens: number;
  estimated_total_tokens: number;
  estimated_cost_usd?: number;
  model_used?: string;
}

/**
 * Agent link response
 */
export interface AgentLinkResponse {
  link_url: string;
  agent_id: string;
  enabled: boolean;
  created_at?: string;
}

// ============================================================================
// CONVERSATIONS API TYPES
// ============================================================================

/**
 * Conversation transcript entry
 */
export interface ConversationTranscript {
  role: 'user' | 'agent';
  time_in_call_secs: number;
  message: string;
}

/**
 * Conversation metadata
 */
export interface ConversationMetadata {
  start_time_unix_secs: number;
  call_duration_secs: number;
  end_time_unix_secs?: number;
  total_tokens?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  cost_usd?: number;
}

/**
 * Conversation analysis results
 */
export interface ConversationAnalysis {
  sentiment?: 'positive' | 'neutral' | 'negative';
  topics?: string[];
  summary?: string;
  action_items?: string[];
  key_points?: string[];
}

/**
 * Conversation response
 */
export interface ConversationResponse {
  agent_id: string;
  conversation_id: string;
  status: 'initiated' | 'in-progress' | 'processing' | 'done' | 'failed';
  transcript: ConversationTranscript[];
  metadata: ConversationMetadata;
  has_audio: boolean;
  has_user_audio: boolean;
  has_response_audio: boolean;
  user_id?: string | null;
  analysis?: ConversationAnalysis | null;
  conversation_initiation_client_data?: Record<string, any> | null;
}

/**
 * Options for listing conversations
 */
export interface ListConversationsOptions {
  agent_id?: string;
  status?: 'initiated' | 'in-progress' | 'processing' | 'done' | 'failed';
  page_size?: number;
  page_token?: string;
  sort_by?: 'created_at' | 'updated_at' | 'duration';
  sort_order?: 'asc' | 'desc';
}

/**
 * List conversations response
 */
export interface ListConversationsResponse {
  conversations: ConversationResponse[];
  has_more: boolean;
  next_page_token?: string;
  total_count?: number;
}

/**
 * Conversation feedback request
 */
export interface ConversationFeedbackRequest {
  feedback: 'like' | 'dislike';
  comment?: string;
  tags?: string[];
}

/**
 * WebRTC token response
 */
export interface ConversationTokenResponse {
  token: string;
  expires_at?: number;
}

/**
 * Options for getting signed URL
 */
export interface ConversationSignedUrlOptions {
  include_conversation_id?: boolean;
}

/**
 * Signed URL response
 */
export interface ConversationSignedUrlResponse {
  signed_url: string;
  conversation_id?: string;
}
