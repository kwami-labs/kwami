import type { KwamiAudio } from '../../../body/Audio';
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
} from '../../../../types';
import type {
  MindProvider,
  MindProviderDependencies,
  MindConversationCallbacks,
  MindProviderSpeakOptions,
} from '../types';
import { logger } from '../../../../utils/logger';

/**
 * LiveKit API Provider - Backend API integration
 * 
 * This provider uses the Kwami backend API (Rust) as a proxy
 * to LiveKit services for token generation, room management,
 * and agent interactions.
 */
export class LiveKitAPIProvider implements MindProvider {
  readonly type = 'livekit-api' as const;
  
  private audio: KwamiAudio;
  private config: MindConfig;
  private ready: boolean = false;
  private conversationActive: boolean = false;
  private baseUrl: string;
  private apiKey?: string;
  
  // Room and connection state
  private currentRoom: string | null = null;
  private currentToken: string | null = null;
  private mediaStream: MediaStream | null = null;

  constructor(dependencies: MindProviderDependencies, config: MindConfig) {
    this.audio = dependencies.audio;
    this.config = config;
    this.baseUrl = config.livekitApi?.baseUrl || 'http://localhost:8080';
    this.apiKey = config.livekitApi?.apiKey;
  }

  async initialize(): Promise<void> {
    try {
      logger.info('[LiveKitAPIProvider] Initializing LiveKit API provider...');
      
      // Validate configuration
      if (!this.baseUrl) {
        throw new Error('Backend API base URL is required in config.livekitApi.baseUrl');
      }

      // Test connection to backend
      try {
        const response = await this.fetch('/health');
        if (!response.ok) {
          throw new Error(`Backend API health check failed: ${response.status}`);
        }
      } catch (error) {
        logger.warn('[LiveKitAPIProvider] Backend API health check failed, continuing anyway:', error);
      }
      
      this.ready = true;
      logger.info('[LiveKitAPIProvider] Initialized successfully');
    } catch (error) {
      logger.error('[LiveKitAPIProvider] Initialization failed:', error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  async speak(text: string, options?: MindProviderSpeakOptions): Promise<void> {
    if (!this.ready) {
      throw new Error('LiveKit API provider not initialized');
    }

    logger.info('[LiveKitAPIProvider] Speaking:', text);
    
    try {
      // TODO: Implement LiveKit TTS via backend API
      // For now, log that TTS is not yet implemented
      logger.warn('[LiveKitAPIProvider] TTS not yet implemented, text:', text);
    } catch (error) {
      logger.error('[LiveKitAPIProvider] Speak failed:', error);
      throw error;
    }
  }

  async startConversation(
    systemPrompt?: string,
    callbacks?: MindConversationCallbacks
  ): Promise<void> {
    if (!this.ready) {
      throw new Error('LiveKit API provider not initialized');
    }

    if (this.conversationActive) {
      logger.warn('[LiveKitAPIProvider] Conversation already active');
      return;
    }

    logger.info('[LiveKitAPIProvider] Starting conversation...');
    
    try {
      // 1. Create or join a room via backend API
      const roomName = this.config.livekit?.roomName || `kwami-${Date.now()}`;
      const participantName = this.config.livekit?.participantName || 'user';
      
      const roomResponse = await this.fetch('/api/livekit/rooms', {
        method: 'POST',
        body: JSON.stringify({
          name: roomName,
          empty_timeout: 300,
          max_participants: 10,
        }),
      });

      if (!roomResponse.ok) {
        throw new Error(`Failed to create room: ${roomResponse.status}`);
      }

      this.currentRoom = roomName;

      // 2. Get access token
      const tokenResponse = await this.fetch('/api/livekit/token', {
        method: 'POST',
        body: JSON.stringify({
          identity: participantName,
          room: roomName,
          can_publish: true,
          can_subscribe: true,
          can_publish_data: true,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Failed to get token: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      this.currentToken = tokenData.token;

      // 3. Connect to room (this would use LiveKit client SDK)
      // TODO: Implement actual LiveKit room connection
      
      this.conversationActive = true;
      logger.info('[LiveKitAPIProvider] Conversation started in room:', roomName);
      
      if (callbacks?.onTurnStart) {
        callbacks.onTurnStart();
      }
    } catch (error) {
      logger.error('[LiveKitAPIProvider] Failed to start conversation:', error);
      if (callbacks?.onError) {
        callbacks.onError(error as Error);
      }
      throw error;
    }
  }

  async stopConversation(): Promise<void> {
    if (!this.conversationActive) {
      return;
    }

    logger.info('[LiveKitAPIProvider] Stopping conversation...');
    
    try {
      // Disconnect from room
      if (this.currentRoom) {
        // TODO: Implement room disconnect
        this.currentRoom = null;
        this.currentToken = null;
      }
      
      this.conversationActive = false;
      logger.info('[LiveKitAPIProvider] Conversation stopped');
    } catch (error) {
      logger.error('[LiveKitAPIProvider] Failed to stop conversation:', error);
      throw error;
    }
  }

  isConversationActive(): boolean {
    return this.conversationActive;
  }

  sendConversationMessage(text: string): void {
    if (!this.conversationActive) {
      logger.warn('[LiveKitAPIProvider] Cannot send message - no active conversation');
      return;
    }

    logger.info('[LiveKitAPIProvider] Sending message:', text);
    
    // TODO: Send data message via LiveKit room
  }

  async listen(): Promise<MediaStream> {
    if (!this.ready) {
      throw new Error('LiveKit API provider not initialized');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaStream = stream;
      return stream;
    } catch (error) {
      logger.error('[LiveKitAPIProvider] Failed to access microphone:', error);
      throw error;
    }
  }

  stopListening(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  async getAvailableVoices(): Promise<any[]> {
    logger.warn('[LiveKitAPIProvider] getAvailableVoices not yet implemented');
    return [];
  }

  async generateSpeechBlob(text: string): Promise<Blob> {
    if (!this.ready) {
      throw new Error('LiveKit API provider not initialized');
    }

    logger.warn('[LiveKitAPIProvider] generateSpeechBlob not yet implemented');
    throw new Error('Not implemented');
  }

  async previewVoice(text?: string): Promise<void> {
    const previewText = text || 'Hello! This is a preview of my voice.';
    await this.speak(previewText);
  }

  async testMicrophone(): Promise<boolean> {
    try {
      const stream = await this.listen();
      this.stopListening();
      return true;
    } catch {
      return false;
    }
  }

  // Agent management via backend API
  async createAgent(config: CreateAgentRequest): Promise<AgentResponse> {
    const response = await this.fetch('/api/agents', {
      method: 'POST',
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`Failed to create agent: ${response.status}`);
    }

    return response.json();
  }

  async getAgent(agentId: string): Promise<AgentResponse> {
    const response = await this.fetch(`/api/agents/${agentId}`);

    if (!response.ok) {
      throw new Error(`Failed to get agent: ${response.status}`);
    }

    return response.json();
  }

  async listAgents(options?: ListAgentsOptions): Promise<ListAgentsResponse> {
    const params = new URLSearchParams();
    if (options?.page_size) params.set('page_size', options.page_size.toString());
    if (options?.page_token) params.set('page_token', options.page_token);

    const response = await this.fetch(`/api/agents?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to list agents: ${response.status}`);
    }

    return response.json();
  }

  async updateAgent(agentId: string, config: UpdateAgentRequest): Promise<AgentResponse> {
    const response = await this.fetch(`/api/agents/${agentId}`, {
      method: 'PATCH',
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`Failed to update agent: ${response.status}`);
    }

    return response.json();
  }

  async deleteAgent(agentId: string): Promise<void> {
    const response = await this.fetch(`/api/agents/${agentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete agent: ${response.status}`);
    }
  }

  async duplicateAgent(
    agentId: string,
    options?: DuplicateAgentRequest
  ): Promise<AgentResponse> {
    const response = await this.fetch(`/api/agents/${agentId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });

    if (!response.ok) {
      throw new Error(`Failed to duplicate agent: ${response.status}`);
    }

    return response.json();
  }

  async getAgentLink(agentId: string): Promise<AgentLinkResponse> {
    const response = await this.fetch(`/api/agents/${agentId}/link`);

    if (!response.ok) {
      throw new Error(`Failed to get agent link: ${response.status}`);
    }

    return response.json();
  }

  async simulateConversation(
    agentId: string,
    request: SimulateConversationRequest
  ): Promise<SimulateConversationResponse> {
    const response = await this.fetch(`/api/agents/${agentId}/simulate`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to simulate conversation: ${response.status}`);
    }

    return response.json();
  }

  async simulateConversationStream(
    agentId: string,
    request: SimulateConversationRequest,
    onChunk?: (chunk: any) => void
  ): Promise<void> {
    const response = await this.fetch(`/api/agents/${agentId}/simulate-stream`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to simulate conversation stream: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      if (onChunk) {
        onChunk(JSON.parse(chunk));
      }
    }
  }

  async calculateLLMUsage(
    agentId: string,
    request?: LLMUsageRequest
  ): Promise<LLMUsageResponse> {
    const response = await this.fetch(`/api/agents/${agentId}/usage`, {
      method: 'POST',
      body: JSON.stringify(request || {}),
    });

    if (!response.ok) {
      throw new Error(`Failed to calculate LLM usage: ${response.status}`);
    }

    return response.json();
  }

  async listConversations(
    options?: ListConversationsOptions
  ): Promise<ListConversationsResponse> {
    const params = new URLSearchParams();
    if (options?.page_size) params.set('page_size', options.page_size.toString());
    if (options?.page_token) params.set('page_token', options.page_token);
    if (options?.agent_id) params.set('agent_id', options.agent_id);
    if (options?.status) params.set('status', options.status);
    if (options?.sort_by) params.set('sort_by', options.sort_by);

    const response = await this.fetch(`/api/conversations?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to list conversations: ${response.status}`);
    }

    return response.json();
  }

  async getConversation(conversationId: string): Promise<ConversationResponse> {
    const response = await this.fetch(`/api/conversations/${conversationId}`);

    if (!response.ok) {
      throw new Error(`Failed to get conversation: ${response.status}`);
    }

    return response.json();
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const response = await this.fetch(`/api/conversations/${conversationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.status}`);
    }
  }

  async getConversationAudio(conversationId: string): Promise<Blob> {
    const response = await this.fetch(`/api/conversations/${conversationId}/audio`);

    if (!response.ok) {
      throw new Error(`Failed to get conversation audio: ${response.status}`);
    }

    return response.blob();
  }

  async sendConversationFeedback(
    conversationId: string,
    feedback: ConversationFeedbackRequest
  ): Promise<void> {
    const response = await this.fetch(`/api/conversations/${conversationId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback),
    });

    if (!response.ok) {
      throw new Error(`Failed to send conversation feedback: ${response.status}`);
    }
  }

  async getConversationToken(
    agentId: string,
    participantName?: string
  ): Promise<ConversationTokenResponse> {
    const response = await this.fetch(`/api/agents/${agentId}/token`, {
      method: 'POST',
      body: JSON.stringify({ participant_name: participantName }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get conversation token: ${response.status}`);
    }

    return response.json();
  }

  async getConversationSignedUrl(
    agentId: string,
    options?: ConversationSignedUrlOptions
  ): Promise<ConversationSignedUrlResponse> {
    const response = await this.fetch(`/api/agents/${agentId}/signed-url`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });

    if (!response.ok) {
      throw new Error(`Failed to get conversation signed URL: ${response.status}`);
    }

    return response.json();
  }

  updateConfig(config: MindConfig): void {
    this.config = { ...this.config, ...config };
    if (config.livekitApi?.baseUrl) {
      this.baseUrl = config.livekitApi.baseUrl;
    }
    if (config.livekitApi?.apiKey) {
      this.apiKey = config.livekitApi.apiKey;
    }
    logger.info('[LiveKitAPIProvider] Configuration updated');
  }

  dispose(): void {
    this.stopConversation();
    this.stopListening();
    this.ready = false;
    logger.info('[LiveKitAPIProvider] Disposed');
  }

  // Private helper methods
  private async fetch(path: string, options?: RequestInit): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    // Merge with any headers from options
    if (options?.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers[key] = value;
        }
      });
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }
}
