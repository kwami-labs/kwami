import type { KwamiAudio } from '../../body/Audio';
import type {
  MindConfig,
  CreateAgentRequest,
  UpdateAgentRequest,
  ListAgentsOptions,
  ListAgentsResponse,
  DuplicateAgentRequest,
  AgentResponse,
  SimulateConversationRequest,
  SimulateConversationResponse,
  LLMUsageRequest,
  LLMUsageResponse,
  AgentLinkResponse,
  ConversationResponse,
  ListConversationsOptions,
  ListConversationsResponse,
  ConversationFeedbackRequest,
  ConversationTokenResponse,
  ConversationSignedUrlOptions,
  ConversationSignedUrlResponse,
} from '../../../types';

export type MindProviderType =
  | 'elevenlabs'
  | 'openai'
  | 'vapi'
  | 'retell'
  | 'bland'
  | 'synthflow';

export interface MindConversationCallbacks {
  onAgentResponse?: (text: string) => void;
  onUserTranscript?: (text: string) => void;
  onError?: (error: Error) => void;
  onTurnStart?: () => void;
  onTurnEnd?: () => void;
}

export interface MindProviderSpeakOptions {
  systemPrompt?: string;
}

export interface MindProviderDependencies {
  audio: KwamiAudio;
}

export interface MindProvider {
  readonly type: MindProviderType;
  initialize(): Promise<void>;
  isReady(): boolean;
  speak(text: string, options?: MindProviderSpeakOptions): Promise<void>;
  startConversation(
    systemPrompt?: string,
    callbacks?: MindConversationCallbacks
  ): Promise<void>;
  stopConversation(): Promise<void>;
  isConversationActive(): boolean;
  sendConversationMessage(text: string): void;
  listen(): Promise<MediaStream>;
  stopListening(): void;
  getAvailableVoices(): Promise<any[]>;
  generateSpeechBlob(text: string): Promise<Blob>;
  previewVoice(text?: string): Promise<void>;
  testMicrophone(): Promise<boolean>;
  createAgent(config: CreateAgentRequest): Promise<AgentResponse>;
  getAgent(agentId: string): Promise<AgentResponse>;
  listAgents(options?: ListAgentsOptions): Promise<ListAgentsResponse>;
  updateAgent(agentId: string, config: UpdateAgentRequest): Promise<AgentResponse>;
  deleteAgent(agentId: string): Promise<void>;
  duplicateAgent(
    agentId: string,
    options?: DuplicateAgentRequest
  ): Promise<AgentResponse>;
  getAgentLink(agentId: string): Promise<AgentLinkResponse>;
  simulateConversation(
    agentId: string,
    request: SimulateConversationRequest
  ): Promise<SimulateConversationResponse>;
  simulateConversationStream(
    agentId: string,
    request: SimulateConversationRequest,
    onChunk?: (chunk: any) => void
  ): Promise<void>;
  calculateLLMUsage(
    agentId: string,
    request?: LLMUsageRequest
  ): Promise<LLMUsageResponse>;
  listConversations(options?: ListConversationsOptions): Promise<ListConversationsResponse>;
  getConversation(conversationId: string): Promise<ConversationResponse>;
  deleteConversation(conversationId: string): Promise<void>;
  getConversationAudio(conversationId: string): Promise<Blob>;
  sendConversationFeedback(
    conversationId: string,
    feedback: ConversationFeedbackRequest
  ): Promise<void>;
  getConversationToken(
    agentId: string,
    participantName?: string
  ): Promise<ConversationTokenResponse>;
  getConversationSignedUrl(
    agentId: string,
    options?: ConversationSignedUrlOptions
  ): Promise<ConversationSignedUrlResponse>;
  dispose(): void;
  updateConfig(config: MindConfig): void;
}

