/**
 * ElevenLabs Conversational AI Agents - Complete Type Definitions
 * Based on the official ElevenLabs API v1 specification
 * https://elevenlabs.io/docs/api-reference/agents/create
 */

// ==================== ASR (Automatic Speech Recognition) ====================

export type ASRQuality = 'high' | 'low';
export type ASRProvider = 'elevenlabs' | 'scribe_realtime';
export type ASRInputFormat = 
  | 'pcm_8000'
  | 'pcm_16000'
  | 'pcm_22050'
  | 'pcm_24000'
  | 'pcm_44100'
  | 'pcm_48000'
  | 'ulaw_8000';

export interface ASRConversationalConfig {
  quality?: ASRQuality;
  provider?: ASRProvider;
  user_input_audio_format?: ASRInputFormat;
  keywords?: string[]; // Boost recognition of specific words/phrases
}

// ==================== Turn Management ====================

export type TurnEagerness = 'patient' | 'normal' | 'eager';

export interface SoftTimeoutConfig {
  timeout_seconds?: number;
  message?: string; // What agent says when soft timeout is reached
}

export interface TurnConfig {
  turn_timeout?: number; // Max seconds agent waits for user to speak
  initial_wait_time?: number; // Delay before agent starts speaking
  silence_end_call_timeout?: number; // End call after this many seconds of silence
  soft_timeout_config?: SoftTimeoutConfig;
  turn_eagerness?: TurnEagerness; // How quickly agent interrupts
}

// ==================== TTS (Text-to-Speech) ====================

export type TTSConversationalModel = 
  | 'eleven_turbo_v2'
  | 'eleven_turbo_v2_5'
  | 'eleven_flash_v2'
  | 'eleven_flash_v2_5'
  | 'eleven_multilingual_v2';

export type TTSModelFamily = 'turbo' | 'flash' | 'multilingual';

export type TTSOptimizeStreamingLatency = '0' | '1' | '2' | '3' | '4';

export type TTSOutputFormat = 
  | 'pcm_8000'
  | 'pcm_16000'
  | 'pcm_22050'
  | 'pcm_24000'
  | 'pcm_44100'
  | 'pcm_48000'
  | 'ulaw_8000';

export type TextNormalisationType = 'system_prompt' | 'elevenlabs';

export interface SupportedVoice {
  label: string; // Display name for the voice
  voice_id: string; // ElevenLabs voice ID
  description?: string | null;
  language?: string | null;
  model_family?: TTSModelFamily | null;
  optimize_streaming_latency?: TTSOptimizeStreamingLatency | null;
  stability?: number | null; // 0-1
  speed?: number | null; // 0.25-4.0
  similarity_boost?: number | null; // 0-1
}

export interface PronunciationDictionaryVersionLocator {
  pronunciation_dictionary_id: string;
  version_id?: string | null;
}

export interface TTSConversationalConfig {
  model_id?: TTSConversationalModel;
  voice_id: string;
  supported_voices?: SupportedVoice[]; // Additional voices available during conversation
  agent_output_audio_format?: TTSOutputFormat;
  optimize_streaming_latency?: TTSOptimizeStreamingLatency;
  stability?: number; // 0-1
  speed?: number; // 0.25-4.0
  similarity_boost?: number; // 0-1
  text_normalisation_type?: TextNormalisationType;
  pronunciation_dictionary_locators?: PronunciationDictionaryVersionLocator[];
}

// ==================== Conversation Configuration ====================

export type ClientEvent = 
  | 'conversation_initiation_metadata'
  | 'asr_initiation_metadata'
  | 'ping'
  | 'audio'
  | 'interruption'
  | 'user_transcript'
  | 'tentative_user_transcript'
  | 'agent_response'
  | 'agent_response_correction'
  | 'client_tool_call'
  | 'mcp_tool_call'
  | 'mcp_connection_status'
  | 'agent_tool_request'
  | 'agent_tool_response'
  | 'vad_score'
  | 'agent_chat_response_part'
  | 'internal_turn_probability'
  | 'internal_tentative_agent_response';

export interface ConversationConfig {
  text_only?: boolean; // Text-only mode (no voice)
  max_duration_seconds?: number; // Maximum conversation duration
  client_events?: ClientEvent[]; // Which events to send to client
}

// ==================== VAD (Voice Activity Detection) ====================

export interface VADConfig {
  enabled?: boolean;
  sensitivity?: number; // 0-1, higher = more sensitive
}

// ==================== LLM Configuration ====================

export type LLMProvider = 
  | 'gpt-4o-mini'
  | 'gpt-4o'
  | 'gpt-4'
  | 'gpt-4-turbo'
  | 'gpt-4.1'
  | 'gpt-4.1-mini'
  | 'gpt-4.1-nano'
  | 'gpt-5'
  | 'gpt-5.1'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022';

export interface PromptConfig {
  prompt?: string; // System prompt for the agent
  llm?: LLMProvider; // LLM model to use
  temperature?: number; // 0-1, controls randomness
  max_tokens?: number; // Maximum tokens in response
  tools?: ToolConfig[]; // Tools available to the agent
  knowledge_base?: KnowledgeBaseLocator[]; // Knowledge bases to use
}

// ==================== Tools ====================

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  enum?: string[]; // For string types with limited values
  items?: ToolParameter; // For array types
  properties?: Record<string, ToolParameter>; // For object types
}

export interface ToolConfig {
  name: string;
  description: string;
  parameters?: ToolParameter[];
  url?: string; // Webhook URL for tool execution
}

export interface ToolLocator {
  tool_id: string;
}

// ==================== Knowledge Base ====================

export interface KnowledgeBaseLocator {
  knowledge_base_id: string;
  type?: 'document' | 'url' | 'text';
}

export interface KnowledgeBaseDocument {
  name: string;
  content: string;
  metadata?: Record<string, any>;
}

// ==================== Workflow ====================

export interface Position {
  x: number;
  y: number;
}

export interface WorkflowEdge {
  source: string; // Source node ID
  target: string; // Target node ID
  condition?: string; // Optional condition for traversal
  label?: string;
}

export type WorkflowNodeType = 
  | 'start'
  | 'end'
  | 'override_agent'
  | 'standalone_agent'
  | 'tool'
  | 'phone_number';

export interface BaseWorkflowNode {
  id: string;
  type: WorkflowNodeType;
  position: Position;
  label?: string;
  edge_order?: string[]; // Order of outgoing edges
}

export interface StartNode extends BaseWorkflowNode {
  type: 'start';
}

export interface EndNode extends BaseWorkflowNode {
  type: 'end';
}

export interface OverrideAgentNode extends BaseWorkflowNode {
  type: 'override_agent';
  conversation_config?: Partial<ConversationalConfigAPIModel>;
  additional_prompt?: string;
  additional_knowledge_base?: KnowledgeBaseLocator[];
  additional_tool_ids?: string[];
}

export interface StandaloneAgentNode extends BaseWorkflowNode {
  type: 'standalone_agent';
  agent_id: string; // Reference to another agent
  delay_ms?: number;
  transfer_message?: string | null;
  enable_transferred_agent_first_message?: boolean;
}

export interface ToolNode extends BaseWorkflowNode {
  type: 'tool';
  tools: ToolLocator[];
}

export interface PhoneNumberNode extends BaseWorkflowNode {
  type: 'phone_number';
  phone_number: string;
}

export type WorkflowNode = 
  | StartNode
  | EndNode
  | OverrideAgentNode
  | StandaloneAgentNode
  | ToolNode
  | PhoneNumberNode;

export interface AgentWorkflow {
  edges: Record<string, WorkflowEdge>;
  nodes: Record<string, WorkflowNode>;
}

// ==================== Language Presets ====================

export interface LanguagePreset {
  asr?: Partial<ASRConversationalConfig>;
  tts?: Partial<TTSConversationalConfig>;
  agent?: {
    language?: string;
    first_message?: string;
  };
}

// ==================== Agent Configuration (Complete) ====================

export interface AgentConfigAPIModel {
  prompt?: PromptConfig;
  first_message?: string;
  language?: string;
}

export interface ConversationalConfigAPIModel {
  asr?: ASRConversationalConfig;
  turn?: TurnConfig;
  tts?: TTSConversationalConfig;
  conversation?: ConversationConfig;
  language_presets?: Record<string, LanguagePreset>; // ISO language code -> preset
  vad?: VADConfig;
  agent?: AgentConfigAPIModel;
}

export interface PlatformSettings {
  // Widget settings
  widget?: {
    color?: string;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    avatar_url?: string;
  };
  
  // Telephony settings
  telephony?: {
    provider?: string;
    number?: string;
    sip_uri?: string;
  };
  
  // Custom integrations
  integrations?: Record<string, any>;
}

export interface SecretConfig {
  name: string;
  value: string;
}

// ==================== API Request/Response Types ====================

export interface CreateAgentRequestFull {
  conversation_config: ConversationalConfigAPIModel;
  platform_settings?: PlatformSettings | null;
  workflow?: AgentWorkflow;
  name?: string | null;
  tags?: string[] | null;
  secrets?: SecretConfig[];
}

export interface UpdateAgentRequestFull {
  conversation_config?: Partial<ConversationalConfigAPIModel>;
  platform_settings?: PlatformSettings | null;
  workflow?: Partial<AgentWorkflow>;
  name?: string | null;
  tags?: string[] | null;
  secrets?: SecretConfig[];
}

export interface AgentResponseFull {
  agent_id: string;
  name?: string | null;
  tags?: string[] | null;
  created_at?: string;
  updated_at?: string;
  conversation_config?: ConversationalConfigAPIModel;
  platform_settings?: PlatformSettings | null;
  workflow?: AgentWorkflow;
  secrets?: Array<{ name: string }>; // Values are never returned
}

// ==================== Override Configurations ====================

// For runtime overrides during conversations
export interface ASRConversationalConfigOverride {
  keywords?: string[];
}

export interface SoftTimeoutConfigOverride {
  message?: string | null;
}

export interface TurnConfigOverride {
  soft_timeout_config?: SoftTimeoutConfigOverride | null;
}

export interface TTSConversationalConfigOverride {
  voice_id?: string | null;
  stability?: number | null;
  speed?: number | null;
  similarity_boost?: number | null;
}

export interface ConversationConfigOverride {
  text_only?: boolean | null;
}

export interface AgentConfigOverride {
  prompt?: {
    prompt?: string | null;
    temperature?: number | null;
    max_tokens?: number | null;
  } | null;
  first_message?: string | null;
  language?: string | null;
}

export interface ConversationalConfigOverride {
  asr?: ASRConversationalConfigOverride | null;
  turn?: TurnConfigOverride | null;
  tts?: TTSConversationalConfigOverride | null;
  conversation?: ConversationConfigOverride | null;
  agent?: AgentConfigOverride | null;
}

// ==================== Helper Types ====================

export interface AgentConfigBuilder {
  // Fluent API for building agent configurations
  withPrompt(prompt: string): this;
  withLLM(model: LLMProvider): this;
  withTemperature(temp: number): this;
  withMaxTokens(tokens: number): this;
  withVoice(voiceId: string, settings?: Partial<TTSConversationalConfig>): this;
  withASR(config: Partial<ASRConversationalConfig>): this;
  withTurnConfig(config: Partial<TurnConfig>): this;
  withTools(tools: ToolConfig[]): this;
  withKnowledgeBase(kbs: KnowledgeBaseLocator[]): this;
  withFirstMessage(message: string): this;
  withLanguage(lang: string): this;
  withMaxDuration(seconds: number): this;
  withClientEvents(events: ClientEvent[]): this;
  withWorkflow(workflow: AgentWorkflow): this;
  withPlatformSettings(settings: PlatformSettings): this;
  withSecrets(secrets: SecretConfig[]): this;
  withName(name: string): this;
  withTags(tags: string[]): this;
  build(): CreateAgentRequestFull;
}

// ==================== Validation Types ====================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

