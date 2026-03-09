// =============================================================================
// VOICE CONFIGURATION TYPES
// Complete LiveKit Agents voice pipeline configuration
// =============================================================================

// -----------------------------------------------------------------------------
// Voice Activity Detection (VAD)
// -----------------------------------------------------------------------------

/** VAD Provider options */
export type VADProvider = 'silero'

/** VAD Configuration */
export interface VADConfig {
  /** VAD provider (default: silero) */
  provider?: VADProvider
  /** Minimum speech duration to trigger detection (seconds) */
  minSpeechDuration?: number
  /** Minimum silence duration before considering speech ended (seconds) */
  minSilenceDuration?: number
  /** Speech probability threshold (0-1) */
  threshold?: number
  /** Sample rate for VAD processing */
  sampleRate?: number
  /** Whether VAD is enabled */
  enabled?: boolean
}

// -----------------------------------------------------------------------------
// Speech-to-Text (STT)
// -----------------------------------------------------------------------------

/** STT Provider options - LiveKit Inference */
export type STTInferenceProvider = 
  | 'assemblyai'
  | 'cartesia' 
  | 'deepgram'
  | 'elevenlabs'
  | 'auto'

/** STT Plugin Provider options */
export type STTPluginProvider =
  | 'openai'
  | 'google'
  | 'azure'
  | 'aws'
  | 'groq'
  | 'whisper'

export type STTProvider = STTInferenceProvider | STTPluginProvider

/** STT Model options per provider */
export interface STTModelOptions {
  // AssemblyAI
  assemblyai?: 'universal-streaming' | 'universal-streaming-multilingual'
  // Deepgram
  deepgram?: 'flux' | 'nova-3' | 'nova-3-medical' | 'nova-2' | 'nova-2-medical' | 'nova-2-conversational-ai' | 'nova-2-phonecall'
  // Cartesia
  cartesia?: 'ink-whisper'
  // ElevenLabs
  elevenlabs?: 'scribe-v2-realtime'
  // OpenAI Plugin
  openai?: 'whisper-1' | 'whisper-large-v3'
}

/** Language codes supported by LiveKit Inference */
export type STTLanguage = 
  | 'en' | 'en-US' | 'en-GB' | 'en-AU' | 'en-CA' | 'en-IN' | 'en-IE' | 'en-NZ'
  | 'es' | 'es-419' | 'es-MX'
  | 'fr' | 'fr-CA'
  | 'de' | 'de-CH'
  | 'pt' | 'pt-BR' | 'pt-PT'
  | 'zh' | 'zh-CN' | 'zh-TW' | 'zh-HK' | 'zh-Hans' | 'zh-Hant'
  | 'ja' | 'ko' | 'ko-KR' | 'ru' | 'ar' | 'it' | 'nl' | 'nl-BE' | 'pl' | 'tr'
  | 'vi' | 'th' | 'th-TH' | 'sv' | 'sv-SE' | 'da' | 'da-DK' | 'no' | 'fi'
  | 'he' | 'hi' | 'id' | 'ms' | 'uk' | 'cs' | 'ro' | 'hu' | 'el' | 'bg'
  | 'hr' | 'sk' | 'sl' | 'sr' | 'lt' | 'lv' | 'et' | 'ta' | 'te' | 'ml'
  | 'kn' | 'bn' | 'gu' | 'mr' | 'pa' | 'ur' | 'fa' | 'sw' | 'am'
  | 'multi' // Multilingual automatic detection

/** STT Configuration */
export interface STTConfig {
  /** STT provider */
  provider?: STTProvider
  /** Model name (provider-specific) */
  model?: string
  /** Language code */
  language?: STTLanguage
  /** Use LiveKit Inference (vs plugin) */
  useInference?: boolean
  /** Custom vocabulary words */
  customVocabulary?: string[]
  /** Enable punctuation */
  punctuate?: boolean
  /** Enable profanity filter */
  profanityFilter?: boolean
  /** Enable diarization (speaker identification) */
  diarization?: boolean
  /** Additional provider-specific options */
  extra?: Record<string, unknown>
}

// -----------------------------------------------------------------------------
// Large Language Model (LLM)
// -----------------------------------------------------------------------------

/** LLM Provider options - LiveKit Inference */
export type LLMInferenceProvider = 
  | 'openai'
  | 'gemini'
  | 'deepseek'
  | 'kimi'

/** LLM Plugin Provider options */
export type LLMPluginProvider =
  | 'anthropic'
  | 'groq'
  | 'azure'
  | 'aws'
  | 'mistral'
  | 'ollama'
  | 'together'
  | 'fireworks'
  | 'cerebras'
  | 'perplexity'
  | 'xai'

export type LLMProvider = LLMInferenceProvider | LLMPluginProvider

/** OpenAI model options */
export type OpenAIModel = 
  | 'gpt-4o' | 'gpt-4o-mini'
  | 'gpt-4.1' | 'gpt-4.1-mini' | 'gpt-4.1-nano'
  | 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano'
  | 'gpt-5.1' | 'gpt-5.2'

/** Gemini model options */
export type GeminiModel =
  | 'gemini-3-pro' | 'gemini-3-flash'
  | 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.5-flash-lite'
  | 'gemini-2.0-flash' | 'gemini-2.0-flash-lite'

/** LLM Configuration */
export interface LLMConfig {
  /** LLM provider */
  provider?: LLMProvider
  /** Model name */
  model?: string
  /** Temperature (0-2, default: 0.7) */
  temperature?: number
  /** Maximum tokens in response */
  maxTokens?: number
  /** Use LiveKit Inference (vs plugin) */
  useInference?: boolean
  /** Top P sampling */
  topP?: number
  /** Frequency penalty (-2 to 2) */
  frequencyPenalty?: number
  /** Presence penalty (-2 to 2) */
  presencePenalty?: number
  /** Stop sequences */
  stop?: string[]
  /** Reasoning effort (for supported models) */
  reasoningEffort?: 'low' | 'medium' | 'high'
  /** API key (for plugin usage) */
  apiKey?: string
  /** Base URL (for custom endpoints) */
  baseUrl?: string
  /** Additional provider-specific options */
  extra?: Record<string, unknown>
}

// -----------------------------------------------------------------------------
// Text-to-Speech (TTS)
// -----------------------------------------------------------------------------

/** TTS Provider options - LiveKit Inference */
export type TTSInferenceProvider = 
  | 'cartesia'
  | 'deepgram'
  | 'elevenlabs'
  | 'inworld'
  | 'rime'

/** TTS Plugin Provider options */
export type TTSPluginProvider =
  | 'openai'
  | 'azure'
  | 'aws'
  | 'google'
  | 'groq'
  | 'hume'
  | 'lmnt'
  | 'minimax'
  | 'neuphonic'
  | 'resemble'
  | 'speechify'

export type TTSProvider = TTSInferenceProvider | TTSPluginProvider

/** TTS Model options per provider */
export interface TTSModelOptions {
  cartesia?: 'sonic-3' | 'sonic-english' | 'sonic-multilingual'
  deepgram?: 'aura-2' | 'aura'
  elevenlabs?: 'eleven_turbo_v2_5' | 'eleven_turbo_v2' | 'eleven_multilingual_v2'
  rime?: 'arcana' | 'mist'
  inworld?: 'inworld-tts-1'
  openai?: 'tts-1' | 'tts-1-hd'
}

/** Preset voice options with common voice IDs */
export interface PresetVoice {
  provider: TTSProvider
  model: string
  voiceId: string
  name: string
  language: string
  gender: 'male' | 'female' | 'neutral'
}

/** TTS Configuration */
export interface TTSConfig {
  /** TTS provider */
  provider?: TTSProvider
  /** Model name */
  model?: string
  /** Voice ID (provider-specific) */
  voice?: string
  /** Use LiveKit Inference (vs plugin) */
  useInference?: boolean
  /** Speaking speed (0.5-2.0, default: 1.0) */
  speed?: number
  /** Pitch adjustment (-1 to 1) */
  pitch?: number
  /** Volume adjustment (0-1) */
  volume?: number
  /** Output format */
  outputFormat?: 'pcm' | 'mp3' | 'opus' | 'wav'
  /** Sample rate */
  sampleRate?: 16000 | 22050 | 24000 | 44100 | 48000
  /** API key (for plugin usage) */
  apiKey?: string
  /** Additional provider-specific options */
  extra?: Record<string, unknown>
}

// -----------------------------------------------------------------------------
// Realtime Models (Speech-to-Speech)
// -----------------------------------------------------------------------------

/** Realtime model providers */
export type RealtimeProvider = 
  | 'openai'
  | 'gemini'
  | 'azure'
  | 'nova-sonic'
  | 'ultravox'
  | 'xai'

/** Realtime model modalities */
export type RealtimeModality = 'text' | 'audio'

/** Realtime model configuration */
export interface RealtimeConfig {
  /** Realtime model provider */
  provider?: RealtimeProvider
  /** Model name */
  model?: string
  /** Voice for speech output */
  voice?: string
  /** Output modalities */
  modalities?: RealtimeModality[]
  /** Temperature */
  temperature?: number
  /** Maximum response tokens */
  maxResponseTokens?: number
  /** Turn detection settings */
  turnDetection?: {
    type?: 'server_vad' | 'none'
    threshold?: number
    silenceDuration?: number
    prefixPadding?: number
  }
  /** API key */
  apiKey?: string
  /** Additional options */
  extra?: Record<string, unknown>
}

// -----------------------------------------------------------------------------
// Voice Enhancements
// -----------------------------------------------------------------------------

/** Turn detection configuration */
export interface TurnDetectionConfig {
  /** Enable turn detection */
  enabled?: boolean
  /** Turn detection mode */
  mode?: 'vad' | 'stt' | 'model' | 'manual'
  /** Turn detector model type */
  model?: 'english' | 'multilingual'
  /** Minimum endpointing delay (seconds) */
  minEndpointingDelay?: number
  /** Maximum endpointing delay (seconds) */
  maxEndpointingDelay?: number
  /** Allow user interruptions */
  allowInterruptions?: boolean
  /** Minimum interruption duration (seconds) */
  minInterruptionDuration?: number
  /** Minimum words to consider interruption */
  minInterruptionWords?: number
}

/** Noise cancellation configuration */
export interface NoiseCancellationConfig {
  /** Enable noise cancellation */
  enabled?: boolean
  /** Noise cancellation mode */
  mode?: 'bvc' | 'krisp' | 'default'
  /** Suppression level (0-1) */
  level?: number
}

/** Voice enhancements configuration */
export interface VoiceEnhancementsConfig {
  /** Turn detection settings */
  turnDetection?: TurnDetectionConfig
  /** Noise cancellation settings */
  noiseCancellation?: NoiseCancellationConfig
  /** Echo cancellation */
  echoCancellation?: boolean
  /** Auto gain control */
  autoGainControl?: boolean
  /** Preemptive generation (start generating before turn ends) */
  preemptiveGeneration?: boolean
}

// -----------------------------------------------------------------------------
// Latency & Metrics
// -----------------------------------------------------------------------------

/** Latency metrics for voice pipeline */
export interface VoiceLatencyMetrics {
  /** STT latency in milliseconds */
  stt?: number
  /** End of turn detection latency in milliseconds */
  endOfTurn?: number
  /** LLM latency (time to first token) in milliseconds */
  llm?: number
  /** TTS latency in milliseconds */
  tts?: number
  /** Overall latency in milliseconds */
  overall?: number
  /** Timestamp of measurement */
  timestamp?: number
}

/** Voice pipeline metrics */
export interface VoicePipelineMetrics {
  /** Current latency metrics */
  latency: VoiceLatencyMetrics
  /** Number of turns completed */
  turnsCompleted: number
  /** Number of interruptions */
  interruptions: number
  /** Total speaking time (agent) in ms */
  agentSpeakingTime: number
  /** Total speaking time (user) in ms */
  userSpeakingTime: number
  /** Session start time */
  sessionStart: number
}

// -----------------------------------------------------------------------------
// Complete Voice Pipeline Configuration
// -----------------------------------------------------------------------------

/** Pipeline type */
export type VoicePipelineType = 'stt-llm-tts' | 'realtime' | 'hybrid'

/** Complete voice pipeline configuration */
export interface VoicePipelineConfig {
  /** Pipeline type */
  type?: VoicePipelineType
  
  /** Voice Activity Detection */
  vad?: VADConfig
  
  /** Speech-to-Text */
  stt?: STTConfig
  
  /** Large Language Model */
  llm?: LLMConfig
  
  /** Text-to-Speech */
  tts?: TTSConfig
  
  /** Realtime model (alternative to STT+LLM+TTS) */
  realtime?: RealtimeConfig
  
  /** Voice enhancements */
  enhancements?: VoiceEnhancementsConfig
  
  /** Enable metrics collection */
  collectMetrics?: boolean
  
  /** Metrics callback */
  onMetrics?: (metrics: VoicePipelineMetrics) => void
}

// -----------------------------------------------------------------------------
// Preset Configurations
// -----------------------------------------------------------------------------

/** Common voice pipeline presets */
export type VoicePipelinePreset = 
  | 'fast'           // Optimized for speed
  | 'quality'        // Optimized for quality
  | 'balanced'       // Balance of speed and quality
  | 'realtime'       // Use realtime model
  | 'multilingual'   // Optimized for multiple languages

/** Get preset configuration */
export function getVoicePipelinePreset(preset: VoicePipelinePreset): Partial<VoicePipelineConfig> {
  switch (preset) {
    case 'fast':
      return {
        type: 'stt-llm-tts',
        stt: { provider: 'deepgram', model: 'nova-3', useInference: true },
        llm: { provider: 'openai', model: 'gpt-4.1-mini', useInference: true },
        tts: { provider: 'cartesia', model: 'sonic-3', useInference: true },
        enhancements: { preemptiveGeneration: true }
      }
    case 'quality':
      return {
        type: 'stt-llm-tts',
        stt: { provider: 'assemblyai', model: 'universal-streaming', useInference: true },
        llm: { provider: 'openai', model: 'gpt-4o', useInference: true },
        tts: { provider: 'elevenlabs', model: 'eleven_turbo_v2_5', useInference: true },
      }
    case 'balanced':
      return {
        type: 'stt-llm-tts',
        stt: { provider: 'deepgram', model: 'nova-3', useInference: true },
        llm: { provider: 'openai', model: 'gpt-4.1-mini', useInference: true },
        tts: { provider: 'cartesia', model: 'sonic-3', useInference: true },
      }
    case 'realtime':
      return {
        type: 'realtime',
        realtime: { provider: 'openai', modalities: ['text', 'audio'] },
      }
    case 'multilingual':
      return {
        type: 'stt-llm-tts',
        stt: { provider: 'deepgram', model: 'nova-3', language: 'multi', useInference: true },
        llm: { provider: 'openai', model: 'gpt-4.1-mini', useInference: true },
        tts: { provider: 'elevenlabs', model: 'eleven_multilingual_v2', useInference: true },
        enhancements: { turnDetection: { model: 'multilingual' } }
      }
    default:
      return {}
  }
}

// -----------------------------------------------------------------------------
// Voice Descriptor Builders
// -----------------------------------------------------------------------------

/**
 * Build a LiveKit Inference model descriptor string
 * @example buildSTTDescriptor('deepgram', 'nova-3', 'en') => 'deepgram/nova-3:en'
 */
export function buildSTTDescriptor(provider: STTProvider, model: string, language?: STTLanguage): string {
  if (language) {
    return `${provider}/${model}:${language}`
  }
  return `${provider}/${model}`
}

/**
 * Build a TTS descriptor string
 * @example buildTTSDescriptor('cartesia', 'sonic-3', 'voice-id') => 'cartesia/sonic-3:voice-id'
 */
export function buildTTSDescriptor(provider: TTSProvider, model: string, voice?: string): string {
  if (voice) {
    return `${provider}/${model}:${voice}`
  }
  return `${provider}/${model}`
}

/**
 * Build an LLM descriptor string
 * @example buildLLMDescriptor('openai', 'gpt-4.1-mini') => 'openai/gpt-4.1-mini'
 */
export function buildLLMDescriptor(provider: LLMProvider, model: string): string {
  return `${provider}/${model}`
}

// -----------------------------------------------------------------------------
// Preset Voices
// -----------------------------------------------------------------------------

/** Curated list of high-quality voices */
export const PRESET_VOICES: PresetVoice[] = [
  // Cartesia
  { provider: 'cartesia', model: 'sonic-3', voiceId: 'a167e0f3-df7e-4d52-a9c3-f949145efdab', name: 'Blake', language: 'en', gender: 'male' },
  { provider: 'cartesia', model: 'sonic-3', voiceId: '5c5ad5e7-1020-476b-8b91-fdcbe9cc313c', name: 'Daniela', language: 'es', gender: 'female' },
  { provider: 'cartesia', model: 'sonic-3', voiceId: '9626c31c-bec5-4cca-baa8-f8ba9e84c8bc', name: 'Jacqueline', language: 'en', gender: 'female' },
  { provider: 'cartesia', model: 'sonic-3', voiceId: 'f31cc6a7-c1e8-4764-980c-60a361443dd1', name: 'Robyn', language: 'en', gender: 'female' },
  // Deepgram
  { provider: 'deepgram', model: 'aura-2', voiceId: 'apollo', name: 'Apollo', language: 'en-US', gender: 'male' },
  { provider: 'deepgram', model: 'aura-2', voiceId: 'athena', name: 'Athena', language: 'en-US', gender: 'female' },
  { provider: 'deepgram', model: 'aura-2', voiceId: 'odysseus', name: 'Odysseus', language: 'en-US', gender: 'male' },
  { provider: 'deepgram', model: 'aura-2', voiceId: 'theia', name: 'Theia', language: 'en-AU', gender: 'female' },
  // ElevenLabs
  { provider: 'elevenlabs', model: 'eleven_turbo_v2_5', voiceId: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', language: 'en-GB', gender: 'female' },
  { provider: 'elevenlabs', model: 'eleven_turbo_v2_5', voiceId: 'iP95p4xoKVk53GoZ742B', name: 'Chris', language: 'en-US', gender: 'male' },
  { provider: 'elevenlabs', model: 'eleven_turbo_v2_5', voiceId: 'cjVigY5qzO86Huf0OWal', name: 'Eric', language: 'es-MX', gender: 'male' },
  { provider: 'elevenlabs', model: 'eleven_turbo_v2_5', voiceId: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', language: 'en-US', gender: 'female' },
  // Rime
  { provider: 'rime', model: 'arcana', voiceId: 'astra', name: 'Astra', language: 'en-US', gender: 'female' },
  { provider: 'rime', model: 'arcana', voiceId: 'celeste', name: 'Celeste', language: 'en-US', gender: 'female' },
  { provider: 'rime', model: 'arcana', voiceId: 'luna', name: 'Luna', language: 'en-US', gender: 'female' },
  { provider: 'rime', model: 'arcana', voiceId: 'ursa', name: 'Ursa', language: 'en-US', gender: 'male' },
  // Inworld
  { provider: 'inworld', model: 'inworld-tts-1', voiceId: 'Ashley', name: 'Ashley', language: 'en-US', gender: 'female' },
  { provider: 'inworld', model: 'inworld-tts-1', voiceId: 'Diego', name: 'Diego', language: 'es-MX', gender: 'male' },
  { provider: 'inworld', model: 'inworld-tts-1', voiceId: 'Edward', name: 'Edward', language: 'en-US', gender: 'male' },
  { provider: 'inworld', model: 'inworld-tts-1', voiceId: 'Olivia', name: 'Olivia', language: 'en-GB', gender: 'female' },
]

/** Find a preset voice by name */
export function findPresetVoice(name: string): PresetVoice | undefined {
  return PRESET_VOICES.find(v => v.name.toLowerCase() === name.toLowerCase())
}

/** Filter preset voices */
export function filterPresetVoices(filter: { 
  provider?: TTSProvider
  language?: string
  gender?: 'male' | 'female' | 'neutral' 
}): PresetVoice[] {
  return PRESET_VOICES.filter(v => {
    if (filter.provider && v.provider !== filter.provider) return false
    if (filter.language && !v.language.startsWith(filter.language)) return false
    if (filter.gender && v.gender !== filter.gender) return false
    return true
  })
}
