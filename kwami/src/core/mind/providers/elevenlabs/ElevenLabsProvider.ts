import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import type { KwamiAudio } from '../../../body/Audio';
import type {
  MindConfig,
  AdvancedTTSOptions,
  ConversationalAISettings,
  VoiceSettings,
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
  MindProviderSpeakOptions,
  MindConversationCallbacks,
} from '../types';
import { logger } from '../../../../utils/logger';
import { ToolsAPI } from '../../apis/ToolsAPI';
import { KnowledgeBaseAPI } from '../../apis/KnowledgeBaseAPI';

export class ElevenLabsProvider implements MindProvider {
  readonly type = 'elevenlabs';

  private client: ElevenLabsClient | null = null;
  private config: MindConfig;
  private audio: KwamiAudio;
  private isInitialized = false;
  private currentAudioStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;

  // API instances for advanced features
  public tools: ToolsAPI | null = null;
  public knowledgeBase: KnowledgeBaseAPI | null = null;

  // Conversational AI WebSocket properties
  private conversationWebSocket: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private conversationActive = false;
  private conversationCallbacks: MindConversationCallbacks = {};

  constructor(dependencies: MindProviderDependencies, config: MindConfig) {
    this.audio = dependencies.audio;
    this.config = config;

    if (this.config.apiKey) {
      this.client = new ElevenLabsClient({ apiKey: this.config.apiKey });
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (!this.client && this.config.apiKey) {
      this.client = new ElevenLabsClient({ apiKey: this.config.apiKey });
    }

    if (!this.client) {
      throw new Error(
        'ElevenLabs API key not provided. Set it in MindConfig or ELEVEN_LABS_KEY environment variable.'
      );
    }

    // Initialize API instances
    if (this.config.apiKey) {
      this.tools = new ToolsAPI(this.config.apiKey);
      this.knowledgeBase = new KnowledgeBaseAPI(this.config.apiKey);
    }

    this.isInitialized = true;
  }

  isReady(): boolean {
    return this.isInitialized && this.client !== null;
  }

  async speak(text: string, options?: MindProviderSpeakOptions): Promise<void> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      const voiceId = this.config.voice?.voiceId || 'pNInz6obpgDQGcFmaJgB';
      const model = this.config.voice?.model || 'eleven_multilingual_v2';
      const voiceSettings = this.getVoiceSettings();

      const requestOptions: any = {
        text,
        modelId: model,
        voiceSettings,
      };

      this.applyAdvancedTTSOptions(requestOptions);

      if (this.config.language) {
        requestOptions.language_code = this.config.language;
      }

      if (options?.systemPrompt) {
        requestOptions.system_prompt = options.systemPrompt;
      }

      const audioStream = await this.client.textToSpeech.convert(voiceId, requestOptions);
      const audioBlob = await this.streamToBlob(audioStream, 'audio/mpeg');
      const audioUrl = URL.createObjectURL(audioBlob);

      this.audio.loadAudioSource(audioUrl);
      await this.audio.play();
    } catch (error) {
      logger.error('Error generating speech:', error);
      throw error;
    }
  }

  async startConversation(
    systemPrompt?: string,
    callbacks?: MindConversationCallbacks
  ): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('API key not provided. Cannot start conversation.');
    }

    if (this.conversationActive) {
      logger.warn('Conversation already active. Stop current conversation first.');
      return;
    }

    const agentId = this.config.conversational?.agentId;
    if (!agentId) {
      throw new Error('Agent ID is required. Please enter your ElevenLabs agent ID in the Mind menu.');
    }

    logger.info(`🤖 Starting conversation with Agent ID: ${agentId}`);

    try {
      this.conversationCallbacks = callbacks || {};
      await this.ensureSignedConversation(agentId);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });
      this.currentAudioStream = stream;

      this.audioContext = new AudioContext({ sampleRate: 16000 });
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
      const scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
      this.mediaStreamSource.connect(scriptProcessor);
      scriptProcessor.connect(this.audioContext.destination);

      this.conversationWebSocket = new WebSocket(this.signedUrl!);
      this.setupWebSocketHandlers();

      await this.waitForWebSocketConnection();

      let audioPacketCount = 0;
      let isConversationReady = false;
      (this as any).audioProcessor = scriptProcessor;

      scriptProcessor.onaudioprocess = (event) => {
        if (
          !isConversationReady ||
          !this.conversationActive ||
          !this.conversationWebSocket ||
          this.conversationWebSocket.readyState !== WebSocket.OPEN
        ) {
          return;
        }

        const float32 = event.inputBuffer.getChannelData(0);
        const pcm16 = this.float32ToPCM16(float32);

        try {
          this.conversationWebSocket.send(pcm16.buffer);
          audioPacketCount++;

          if (audioPacketCount % 100 === 0) {
            logger.info(`Sent ${audioPacketCount} audio packets (${pcm16.byteLength} bytes each)`);
          }
        } catch (error) {
          logger.error('Error sending audio data:', error);
        }
      };

      (this as any).setConversationReady = () => {
        isConversationReady = true;
        logger.info('🎤 Audio streaming enabled');
      };

      this.conversationActive = true;

      if (callbacks?.onAgentResponse) {
        callbacks.onAgentResponse(
          '🎙️ Conversation started! Speak naturally to talk with your AI agent through Kwami.'
        );
      }
      if (callbacks?.onTurnEnd) {
        callbacks.onTurnEnd();
      }

      logger.info('🎤 Microphone active, WebSocket connected. You can now speak!');
    } catch (error) {
      logger.error('Error starting conversation:', error);
      this.cleanupConversation();
      throw error;
    }
  }

  async stopConversation(): Promise<void> {
    if (!this.conversationActive) {
      logger.info('No active conversation to stop');
      return;
    }

    logger.info('Stopping conversation...');
    this.conversationActive = false;

    const iframe = document.getElementById('elevenlabs-conversation-iframe');
    if (iframe) {
      iframe.remove();
    }

    if (this.mediaRecorder) {
      if (this.mediaRecorder.state === 'recording') {
        try {
          this.mediaRecorder.stop();
        } catch {
          logger.info('MediaRecorder already stopped');
        }
      }
      this.mediaRecorder = null;
    }

    if (this.conversationWebSocket && this.conversationWebSocket.readyState === WebSocket.OPEN) {
      this.conversationWebSocket.send(JSON.stringify({ type: 'end' }));
    }

    this.cleanupConversation();
    this.audio.stop();

    if ((this.audio as any).parentKwami) {
      (this.audio as any).parentKwami.setState('idle');
    }

    logger.info('Conversation stopped');
  }

  isConversationActive(): boolean {
    return this.conversationActive;
  }

  sendConversationMessage(text: string): void {
    if (
      !this.conversationActive ||
      !this.conversationWebSocket ||
      this.conversationWebSocket.readyState !== WebSocket.OPEN
    ) {
      logger.error('Cannot send message: conversation not active');
      return;
    }

    this.conversationWebSocket.send(
      JSON.stringify({
        type: 'user_text',
        text,
      })
    );
  }

  async listen(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.currentAudioStream = stream;
      return stream;
    } catch (error) {
      logger.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stopListening(): void {
    if (this.currentAudioStream) {
      this.currentAudioStream.getTracks().forEach((track) => track.stop());
      this.currentAudioStream = null;
    }
  }

  async getAvailableVoices(): Promise<any[]> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      const response = await this.client.voices.getAll();
      return response.voices || [];
    } catch (error) {
      logger.error('Error fetching voices:', error);
      throw error;
    }
  }

  async generateSpeechBlob(text: string): Promise<Blob> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      const voiceId = this.config.voice?.voiceId || 'pNInz6obpgDQGcFmaJgB';
      const model = this.config.voice?.model || 'eleven_multilingual_v2';
      const voiceSettings = this.getVoiceSettings();

      const audioStream = await this.client.textToSpeech.convert(voiceId, {
        text,
        modelId: model,
        voiceSettings,
      });

      return this.streamToBlob(audioStream, 'audio/mpeg');
    } catch (error) {
      logger.error('Error generating speech blob:', error);
      throw error;
    }
  }

  async previewVoice(text?: string): Promise<void> {
    const previewText = text || 'Hello! This is a preview of my voice. How do I sound?';
    await this.speak(previewText);
  }

  async testMicrophone(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      logger.error('Microphone test failed:', error);
      return false;
    }
  }

  async createAgent(config: CreateAgentRequest): Promise<AgentResponse> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      logger.info('📝 Creating new agent...');
      const response = await this.client.conversationalAi.agents.create(config as any);
      logger.info('✅ Agent created successfully:', (response as any).agentId);
      return response as unknown as AgentResponse;
    } catch (error) {
      logger.error('Error creating agent:', error);
      throw error;
    }
  }

  async getAgent(agentId: string): Promise<AgentResponse> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      logger.info('🔍 Fetching agent:', agentId);
      const response = await this.client.conversationalAi.agents.get(agentId);
      return response as unknown as AgentResponse;
    } catch (error) {
      logger.error('Error fetching agent:', error);
      throw error;
    }
  }

  async listAgents(options?: ListAgentsOptions): Promise<ListAgentsResponse> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      logger.info('📋 Listing agents...');
      const response = await this.client.conversationalAi.agents.list(options as any);
      return response as unknown as ListAgentsResponse;
    } catch (error) {
      logger.error('Error listing agents:', error);
      throw error;
    }
  }

  async updateAgent(agentId: string, config: UpdateAgentRequest): Promise<AgentResponse> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      logger.info('✏️ Updating agent:', agentId);
      const response = await this.client.conversationalAi.agents.update(agentId, config as any);
      logger.info('✅ Agent updated successfully');
      return response as unknown as AgentResponse;
    } catch (error) {
      logger.error('Error updating agent:', error);
      throw error;
    }
  }

  async deleteAgent(agentId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      logger.info('🗑️ Deleting agent:', agentId);
      await this.client.conversationalAi.agents.delete(agentId);
      logger.info('✅ Agent deleted successfully');
    } catch (error) {
      logger.error('Error deleting agent:', error);
      throw error;
    }
  }

  async duplicateAgent(
    agentId: string,
    options?: DuplicateAgentRequest
  ): Promise<AgentResponse> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      logger.info('📋 Duplicating agent:', agentId);
      const response = await this.client.conversationalAi.agents.duplicate(agentId, options as any);
      logger.info('✅ Agent duplicated:', (response as any).agentId);
      return response as unknown as AgentResponse;
    } catch (error) {
      logger.error('Error duplicating agent:', error);
      throw error;
    }
  }

  async getAgentLink(agentId: string): Promise<AgentLinkResponse> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      logger.info('🔗 Fetching agent link:', agentId);
      const response = await this.client.conversationalAi.agents.link.get(agentId);
      return response as unknown as AgentLinkResponse;
    } catch (error) {
      logger.error('Error fetching agent link:', error);
      throw error;
    }
  }

  async simulateConversation(
    agentId: string,
    request: SimulateConversationRequest
  ): Promise<SimulateConversationResponse> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      logger.info('🎭 Simulating conversation with agent:', agentId);
      const response = await this.client.conversationalAi.agents.simulateConversation(agentId, request as any);
      return response as unknown as SimulateConversationResponse;
    } catch (error) {
      logger.error('Error simulating conversation:', error);
      throw error;
    }
  }

  async simulateConversationStream(
    agentId: string,
    request: SimulateConversationRequest,
    onChunk?: (chunk: any) => void
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      logger.info('🎭 Simulating streaming conversation with agent:', agentId);
      await this.client.conversationalAi.agents.simulateConversationStream(agentId, request as any);
      if (onChunk) {
        logger.warn('Streaming chunk handler is not implemented in ElevenLabs SDK wrapper yet.');
      }
      logger.info('✅ Conversation stream completed');
    } catch (error) {
      logger.error('Error simulating conversation stream:', error);
      throw error;
    }
  }

  async calculateLLMUsage(
    agentId: string,
    request?: LLMUsageRequest
  ): Promise<LLMUsageResponse> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      logger.info('💰 Calculating LLM usage for agent:', agentId);
      const response = await this.client.conversationalAi.agents.llmUsage.calculate(agentId, request as any);
      return response as unknown as LLMUsageResponse;
    } catch (error) {
      logger.error('Error calculating LLM usage:', error);
      throw error;
    }
  }

  async listConversations(options?: ListConversationsOptions): Promise<ListConversationsResponse> {
    if (!this.config.apiKey) {
      throw new Error('API key not provided.');
    }

    try {
      logger.info('📋 Listing conversations...');

      const queryParams = new URLSearchParams();
      if (options?.agent_id) queryParams.append('agent_id', options.agent_id);
      if (options?.status) queryParams.append('status', options.status);
      if (options?.page_size) queryParams.append('page_size', options.page_size.toString());
      if (options?.page_token) queryParams.append('page_token', options.page_token);
      if (options?.sort_by) queryParams.append('sort_by', options.sort_by);
      if (options?.sort_order) queryParams.append('sort_order', options.sort_order);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations?${queryParams}`,
        {
          headers: {
            'xi-api-key': this.config.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to list conversations: ${response.statusText}`);
      }

      const data = await response.json();
      return data as ListConversationsResponse;
    } catch (error) {
      logger.error('Error listing conversations:', error);
      throw error;
    }
  }

  async getConversation(conversationId: string): Promise<ConversationResponse> {
    if (!this.config.apiKey) {
      throw new Error('API key not provided.');
    }

    try {
      logger.info('🔍 Fetching conversation:', conversationId);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
        {
          headers: {
            'xi-api-key': this.config.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get conversation: ${response.statusText}`);
      }

      const data = await response.json();
      return data as ConversationResponse;
    } catch (error) {
      logger.error('Error fetching conversation:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('API key not provided.');
    }

    try {
      logger.info('🗑️ Deleting conversation:', conversationId);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
        {
          method: 'DELETE',
          headers: {
            'xi-api-key': this.config.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete conversation: ${response.statusText}`);
      }

      logger.info('✅ Conversation deleted successfully');
    } catch (error) {
      logger.error('Error deleting conversation:', error);
      throw error;
    }
  }

  async getConversationAudio(conversationId: string): Promise<Blob> {
    if (!this.config.apiKey) {
      throw new Error('API key not provided.');
    }

    try {
      logger.info('🎵 Downloading conversation audio:', conversationId);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/audio`,
        {
          headers: {
            'xi-api-key': this.config.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get conversation audio: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      logger.info('✅ Audio downloaded:', audioBlob.size, 'bytes');
      return audioBlob;
    } catch (error) {
      logger.error('Error fetching conversation audio:', error);
      throw error;
    }
  }

  async sendConversationFeedback(
    conversationId: string,
    feedback: ConversationFeedbackRequest
  ): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('API key not provided.');
    }

    try {
      logger.info('💭 Sending feedback for conversation:', conversationId);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/feedback`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.config.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedback),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send feedback: ${response.statusText}`);
      }

      logger.info('✅ Feedback submitted successfully');
    } catch (error) {
      logger.error('Error sending feedback:', error);
      throw error;
    }
  }

  async getConversationToken(
    agentId: string,
    participantName?: string
  ): Promise<ConversationTokenResponse> {
    if (!this.config.apiKey) {
      throw new Error('API key not provided.');
    }

    try {
      logger.info('🔐 Getting WebRTC token for agent:', agentId);

      const queryParams = new URLSearchParams({ agent_id: agentId });
      if (participantName) {
        queryParams.append('participant_name', participantName);
      }

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/token?${queryParams}`,
        {
          headers: {
            'xi-api-key': this.config.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get conversation token: ${response.statusText}`);
      }

      const data = await response.json();
      logger.info('✅ WebRTC token obtained');
      return data as ConversationTokenResponse;
    } catch (error) {
      logger.error('Error getting conversation token:', error);
      throw error;
    }
  }

  async getConversationSignedUrl(
    agentId: string,
    options?: ConversationSignedUrlOptions
  ): Promise<ConversationSignedUrlResponse> {
    if (!this.config.apiKey) {
      throw new Error('API key not provided.');
    }

    try {
      logger.info('🔗 Getting signed URL for agent:', agentId);

      const queryParams = new URLSearchParams({ agent_id: agentId });
      if (options?.include_conversation_id) {
        queryParams.append('include_conversation_id', 'true');
      }

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?${queryParams}`,
        {
          headers: {
            'xi-api-key': this.config.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.statusText}`);
      }

      const data = await response.json();
      logger.info('✅ Signed URL obtained');
      return data as ConversationSignedUrlResponse;
    } catch (error) {
      logger.error('Error getting signed URL:', error);
      throw error;
    }
  }

  dispose(): void {
    this.stopListening();
    if (this.currentAudioStream) {
      this.currentAudioStream.getTracks().forEach((track) => track.stop());
      this.currentAudioStream = null;
    }
    this.cleanupConversation();
  }

  updateConfig(config: MindConfig): void {
    this.config = config;
    if (!this.client && config.apiKey) {
      this.client = new ElevenLabsClient({ apiKey: config.apiKey });
    }
    
    // Update API instances
    if (config.apiKey) {
      this.tools = new ToolsAPI(config.apiKey);
      this.knowledgeBase = new KnowledgeBaseAPI(config.apiKey);
    }
  }

  // Helpers

  private signedUrl: string | null = null;

  private async ensureSignedConversation(agentId: string): Promise<void> {
    logger.info('🔑 Getting signed URL from ElevenLabs...');
    logger.info('Agent ID:', agentId);
    logger.info('API Key:', this.config.apiKey ? '✓ Present' : '✗ Missing');

    const signedUrlEndpoint = `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`;
    logger.info('Requesting:', signedUrlEndpoint);

    const signedUrlResponse = await fetch(signedUrlEndpoint, {
      method: 'GET',
      headers: {
        'xi-api-key': this.config.apiKey!,
        'Content-Type': 'application/json',
      },
    });

    logger.info('Response status:', signedUrlResponse.status);
    logger.info('Response headers:', Object.fromEntries(signedUrlResponse.headers.entries()));

    if (!signedUrlResponse.ok) {
      let errorDetails = '';
      try {
        const errorJson = await signedUrlResponse.json();
        errorDetails = JSON.stringify(errorJson, null, 2);
      } catch {
        errorDetails = await signedUrlResponse.text();
      }

      logger.error('Failed to get signed URL:', {
        status: signedUrlResponse.status,
        statusText: signedUrlResponse.statusText,
        error: errorDetails,
      });

      if (signedUrlResponse.status === 404) {
        throw new Error(`Agent not found: ${agentId}. Please check your agent ID is correct.`);
      } else if (signedUrlResponse.status === 401) {
        throw new Error('Invalid API key. Please check your ElevenLabs API key.');
      } else if (signedUrlResponse.status === 403) {
        throw new Error('Access forbidden. Check your agent permissions and API key.');
      }

      throw new Error(`Failed to get signed URL: ${signedUrlResponse.status} - ${errorDetails}`);
    }

    const signedUrlData = await signedUrlResponse.json();
    logger.info('Signed URL response:', JSON.stringify(signedUrlData, null, 2));

    const signedUrl = signedUrlData.signed_url || signedUrlData.url;

    if (!signedUrl) {
      logger.error('No signed URL in response:', signedUrlData);
      throw new Error('No signed URL received from ElevenLabs. Response: ' + JSON.stringify(signedUrlData));
    }

    this.signedUrl = signedUrl;
  }

  private async waitForWebSocketConnection(): Promise<void> {
    if (!this.conversationWebSocket) {
      throw new Error('WebSocket not initialized');
    }

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, 10000);

      this.conversationWebSocket!.onopen = () => {
        clearTimeout(timeout);
        logger.info('✅ WebSocket connected successfully!');
        resolve();
      };

      this.conversationWebSocket!.onerror = (error) => {
        clearTimeout(timeout);
        logger.error('WebSocket error:', error);
        reject(new Error('Failed to connect to ElevenLabs conversation. Please check your agent is active.'));
      };
    });
  }

  private float32ToPCM16(float32: Float32Array): Int16Array {
    const length = float32.length;
    const pcm16 = new Int16Array(length);

    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, float32[i]));
      pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }

    return pcm16;
  }

  private pcm16ToWav(pcmData: ArrayBuffer): Blob {
    const pcm16 = new Int16Array(pcmData);
    const length = pcm16.length * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);

    const writeString = (offset: number, value: string) => {
      for (let i = 0; i < value.length; i++) {
        view.setUint8(offset + i, value.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');

    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 16000, true);
    view.setUint32(28, 16000 * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);

    writeString(36, 'data');
    view.setUint32(40, length, true);

    const outputData = new Int16Array(arrayBuffer, 44);
    outputData.set(pcm16);

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  private async streamToBlob(stream: ReadableStream, mimeType: string): Promise<Blob> {
    const chunks: Uint8Array[] = [];
    const reader = stream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value as Uint8Array);
      }
    } finally {
      reader.releaseLock();
    }

    return new Blob(chunks as BlobPart[], { type: mimeType });
  }

  private applyAdvancedTTSOptions(requestOptions: Record<string, any>): void {
    const options = this.config.advancedTTS;
    if (!options) {
      return;
    }

    if (options.outputFormat) {
      requestOptions.output_format = options.outputFormat;
    }
    if (options.optimizeStreamingLatency !== undefined) {
      requestOptions.optimize_streaming_latency = options.optimizeStreamingLatency;
    }
    if (options.nextTextTimeout) {
      requestOptions.next_text_timeout = options.nextTextTimeout;
    }
  }

  private getVoiceSettings(): VoiceSettings {
    const defaultSettings: VoiceSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true,
    };

    return {
      ...defaultSettings,
      ...this.config.voice?.settings,
    };
  }

  private setupWebSocketHandlers(): void {
    if (!this.conversationWebSocket) return;

    this.conversationWebSocket.onmessage = async (event) => {
      logger.info('WebSocket message received:', {
        type: event.data instanceof ArrayBuffer ? 'binary' : 'text',
        size: event.data instanceof ArrayBuffer ? event.data.byteLength : event.data.length,
      });

      if (event.data instanceof ArrayBuffer) {
        logger.info('Received audio data, size:', event.data.byteLength);
        await this.handleAgentAudio(event.data);
      } else if (event.data instanceof Blob) {
        const arrayBuffer = await event.data.arrayBuffer();
        logger.info('Received audio blob, converted size:', arrayBuffer.byteLength);
        await this.handleAgentAudio(arrayBuffer);
      } else {
        try {
          const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          logger.info('Received JSON message:', message);
          this.handleWebSocketMessage(message);
        } catch (error) {
          logger.info('Received text message:', event.data);
          if (typeof event.data === 'string') {
            this.conversationCallbacks.onAgentResponse?.(event.data);
          }
        }
      }
    };

    this.conversationWebSocket.onerror = (error) => {
      logger.error('WebSocket error:', error);
      this.conversationCallbacks.onError?.(new Error('WebSocket connection error'));
      this.stopConversation();
    };

    this.conversationWebSocket.onclose = (event) => {
      logger.info('WebSocket connection closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });

      let closeReason = 'Unknown reason';
      switch (event.code) {
        case 1000:
          closeReason = 'Normal closure';
          break;
        case 1001:
          closeReason = 'Going away';
          break;
        case 1002:
          closeReason = 'Protocol error';
          break;
        case 1003:
          closeReason = 'Unsupported data';
          break;
        case 1006:
          closeReason = 'Abnormal closure (no close frame)';
          break;
        case 1007:
          closeReason = 'Invalid frame payload data';
          break;
        case 1008:
          closeReason = 'Policy violation';
          break;
        case 1009:
          closeReason = 'Message too big';
          break;
        case 1010:
          closeReason = 'Mandatory extension';
          break;
        case 1011:
          closeReason = 'Internal server error';
          break;
        case 4000:
          closeReason = 'Bad request';
          break;
        case 4001:
          closeReason = 'Unauthorized';
          break;
        case 4002:
          closeReason = 'Bad gateway';
          break;
        case 4003:
          closeReason = 'Forbidden';
          break;
        case 4004:
          closeReason = 'Not found';
          break;
        case 4008:
          closeReason = 'Request timeout';
          break;
        case 4009:
          closeReason = 'Conflict';
          break;
      }

      logger.error(`WebSocket closed: ${closeReason} (${event.code})`);
      if (event.reason) {
        logger.error('Close reason from server:', event.reason);
      }

      this.conversationActive = false;
      this.cleanupConversation();

      if (this.conversationCallbacks.onError) {
        this.conversationCallbacks.onError(new Error(`Connection closed: ${closeReason}`));
      }
    };
  }

  private async handleAgentAudio(audioData: ArrayBuffer): Promise<void> {
    try {
      const wavBlob = this.pcm16ToWav(audioData);
      const audioUrl = URL.createObjectURL(wavBlob);

      this.audio.loadAudioSource(audioUrl);
      await this.audio.play();

      setTimeout(() => URL.revokeObjectURL(audioUrl), 10000);
    } catch (error) {
      logger.error('Error playing agent audio:', error);
    }
  }

  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'agent_response':
        logger.info('Agent response:', message.text);
        this.conversationCallbacks.onAgentResponse?.(message.text);
        break;

      case 'user_transcript':
        logger.info('User transcript:', message.text);
        this.conversationCallbacks.onUserTranscript?.(message.text);
        break;

      case 'turn_start':
        logger.info('Agent turn started');
        this.conversationCallbacks.onTurnStart?.();
        if (this.audio && (this.audio as any).parentKwami) {
          (this.audio as any).parentKwami.setState('speaking');
        }
        break;

      case 'turn_end':
        logger.info('Agent turn ended');
        this.conversationCallbacks.onTurnEnd?.();
        if (this.audio && (this.audio as any).parentKwami) {
          (this.audio as any).parentKwami.setState('listening');
        }
        break;

      case 'error':
        logger.error('Conversation error:', message.error);
        this.conversationCallbacks.onError?.(new Error(message.error));
        break;

      case 'conversation_end':
        logger.info('Conversation ended');
        this.stopConversation();
        break;

      case 'conversation_initiation_metadata':
        logger.info('✅ Conversation initialized:', {
          conversationId: message.conversation_initiation_metadata_event?.conversation_id,
          audioFormat: message.conversation_initiation_metadata_event?.user_input_audio_format,
          agentFormat: message.conversation_initiation_metadata_event?.agent_output_audio_format,
        });

        if ((this as any).setConversationReady) {
          (this as any).setConversationReady();
        }

        if (this.conversationCallbacks.onAgentResponse) {
          this.conversationCallbacks.onAgentResponse('🎙️ Connected! Start speaking...');
        }
        break;

      case 'ping':
        if (this.conversationWebSocket?.readyState === WebSocket.OPEN) {
          this.conversationWebSocket.send(JSON.stringify({ type: 'pong' }));
        }
        break;

      default:
        logger.info('Unhandled message type:', message.type, message);
    }
  }

  private cleanupConversation(): void {
    if (this.mediaRecorder) {
      if (this.mediaRecorder.state === 'recording') {
        try {
          this.mediaRecorder.stop();
        } catch {
          logger.info('MediaRecorder already stopped');
        }
      }
      this.mediaRecorder = null;
    }

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor.onaudioprocess = null;
      this.scriptProcessor = null;
    }

    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
      this.mediaStreamSource = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.conversationWebSocket) {
      if (this.conversationWebSocket.readyState === WebSocket.OPEN) {
        this.conversationWebSocket.close();
      }
      this.conversationWebSocket = null;
    }

    if (this.currentAudioStream) {
      this.currentAudioStream.getTracks().forEach((track) => track.stop());
      this.currentAudioStream = null;
    }

    this.conversationActive = false;
    this.conversationCallbacks = {};
    this.signedUrl = null;
  }
}
