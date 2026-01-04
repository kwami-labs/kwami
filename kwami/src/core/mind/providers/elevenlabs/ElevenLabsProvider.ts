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
  private audioWorkletNode: AudioWorkletNode | null = null;
  private conversationActive = false;
  private conversationCallbacks: MindConversationCallbacks = {};
  private nextStartTime = 0;
  private _audioNotReadyLogged = false;
  private conversationReady = false;

  // Negotiated at runtime via conversation_initiation_metadata
  private userInputAudioFormat: string | null = null;
  private agentOutputAudioFormat: string | null = null;
  private userInputSampleRate = 16000;
  private agentOutputSampleRate = 44100;

  // AudioWorklet processor code as a string to avoid external file dependencies
  private readonly audioProcessorCode = `
    class AudioProcessor extends AudioWorkletProcessor {
      constructor() {
        super();
        this.bufferSize = 4096;
        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
      }

      process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || !input.length) return true;
        
        const channel = input[0];
        for (let i = 0; i < channel.length; i++) {
          this.buffer[this.bufferIndex++] = channel[i];
          if (this.bufferIndex === this.bufferSize) {
            this.port.postMessage(this.buffer.slice());
            this.bufferIndex = 0;
          }
        }
        return true;
      }
    }
    registerProcessor('eleven-labs-processor', AudioProcessor);
  `;

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

    this.conversationActive = true;

    const agentId = this.config.conversational?.agentId;
    if (!agentId) {
      throw new Error('Agent ID is required. Please enter your ElevenLabs agent ID in the Mind menu.');
    }

    logger.info(`🤖 Starting conversation with Agent ID: ${agentId}`);

    try {
      this.conversationCallbacks = callbacks || {};
      this.conversationReady = false;
      this._audioNotReadyLogged = false;
      this.userInputAudioFormat = null;
      this.agentOutputAudioFormat = null;
      this.userInputSampleRate = 16000;
      this.agentOutputSampleRate = 44100;

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

      // Use default device sample rate for better playback quality; resample mic input as needed
      this.audioContext = new AudioContext();
      this.nextStartTime = 0;
      if (this.audioContext.state === 'suspended') {
        logger.info('🔊 Resuming suspended AudioContext...');
        await this.audioContext.resume();
      }

      // Initialize AudioWorklet
      const blob = new Blob([this.audioProcessorCode], { type: 'application/javascript' });
      const workletUrl = URL.createObjectURL(blob);
      await this.audioContext.audioWorklet.addModule(workletUrl);
      URL.revokeObjectURL(workletUrl);
      
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
      this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'eleven-labs-processor');
      
      this.mediaStreamSource.connect(this.audioWorkletNode);
      this.audioWorkletNode.connect(this.audioContext.destination);

      logger.info(`🎤 Audio initialized. Sample rate: ${this.audioContext.sampleRate}Hz`);
      this.conversationWebSocket = new WebSocket(this.signedUrl!);
      this.setupWebSocketHandlers();
      await this.waitForWebSocketConnection();

      // Required by ElevenLabs WS protocol to start client-side streaming
      this.conversationWebSocket.send(JSON.stringify({
        type: 'conversation_initiation_client_data',
      }));

      if (!this.conversationActive) {
        logger.warn('Conversation stopped or invalid state after connection setup');
        return;
      }

      // Setup Worklet message handler
      this.audioWorkletNode.port.onmessage = (event) => {
        this.handleAudioInput(event.data);
      };

      // Safety timeout: if we don't receive metadata event within 5 seconds, assume ready
      setTimeout(() => {
        if (!this.conversationReady && this.conversationActive) {
          logger.warn('⚠️ No conversation metadata received after 5s, forcing ready state');
          this.setConversationReady();
        }
      }, 5000);

      if (callbacks?.onAgentResponse) {
        callbacks.onAgentResponse(
          '🎙️ Conversation started! Speak naturally to talk with your AI agent through Kwami.'
        );
      }
      if (callbacks?.onTurnEnd) {
        callbacks.onTurnEnd();
      }

      console.log('🎤 Microphone active, WebSocket connected. You can now speak!');
    } catch (error) {
      console.error('Error starting conversation:', error);
      this.cleanupConversation();
      throw error;
    }
  }

  private setConversationReady(): void {
    this.conversationReady = true;
    console.log('✅ AUDIO STREAMING ENABLED - Ready to send microphone audio');
    console.log('State check:', {
      isReady: this.conversationReady,
      conversationActive: this.conversationActive,
      wsState: this.conversationWebSocket?.readyState,
      wsOpen: this.conversationWebSocket?.readyState === WebSocket.OPEN
    });
    logger.info('🎙️ Audio streaming enabled');
  }

  private isReadyToStream(): boolean {
    return this.conversationReady && this.conversationActive && this.conversationWebSocket?.readyState === WebSocket.OPEN;
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

    // ElevenLabs expects `user_message` for client-sent text events
    this.conversationWebSocket.send(
      JSON.stringify({
        type: 'user_message',
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
    console.log('🔑 Getting signed URL from ElevenLabs...');
    console.log('Agent ID:', agentId);
    console.log('API Key:', this.config.apiKey ? '✓ Present' : '✗ Missing');

    const signedUrlEndpoint = `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`;
    console.log('Requesting:', signedUrlEndpoint);

    const signedUrlResponse = await fetch(signedUrlEndpoint, {
      method: 'GET',
      headers: {
        'xi-api-key': this.config.apiKey!,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', signedUrlResponse.status);
    console.log('Response headers:', Object.fromEntries(signedUrlResponse.headers.entries()));

    if (!signedUrlResponse.ok) {
      let errorDetails = '';
      try {
        const errorJson = await signedUrlResponse.json();
        errorDetails = JSON.stringify(errorJson, null, 2);
      } catch {
        errorDetails = await signedUrlResponse.text();
      }

      console.error('Failed to get signed URL:', {
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
    console.log('Signed URL response:', JSON.stringify(signedUrlData, null, 2));

    const signedUrl = signedUrlData.signed_url || signedUrlData.url;

    if (!signedUrl) {
      console.error('No signed URL in response:', signedUrlData);
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
        console.log('✅ WebSocket connected successfully! State:', this.conversationWebSocket?.readyState);
        resolve();
      };

      this.conversationWebSocket!.onerror = (error) => {
        clearTimeout(timeout);
        logger.error('WebSocket error:', error);
        reject(new Error('Failed to connect to ElevenLabs conversation. Please check your agent is active.'));
      };
    });
  }

  private parsePcmSampleRate(format: unknown): number | null {
    if (typeof format !== 'string') {
      return null;
    }

    const match = /^pcm_(\d+)$/.exec(format.trim());
    if (!match) {
      return null;
    }

    const rate = Number(match[1]);
    return Number.isFinite(rate) ? rate : null;
  }

  private downsampleBuffer(buffer: Float32Array, inputRate: number, outputRate: number): Float32Array {
    if (inputRate === outputRate) return buffer;
    if (inputRate < outputRate) return buffer;

    const sampleRateRatio = inputRate / outputRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const offset = i * sampleRateRatio;
      const index = Math.floor(offset);
      const nextIndex = Math.min(buffer.length - 1, index + 1);
      const ratio = offset - index;
      
      // Linear interpolation
      result[i] = buffer[index] * (1 - ratio) + buffer[nextIndex] * ratio;
    }
    
    return result;
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
      // console.log('WebSocket message received:', {
      //   type: event.data instanceof ArrayBuffer ? 'binary' : 'text',
      //   size: event.data instanceof ArrayBuffer ? event.data.byteLength : event.data.length,
      // });

      let data = event.data;
      
      // Handle JSON message with audio_event
      if (typeof data === 'string') {
        try {
          const message = JSON.parse(data);
          
          if (message.type === 'audio') {
            const base64Audio = message.audio_event?.audio_base_64;
            if (base64Audio) {
              const binaryString = atob(base64Audio);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              console.log('🔊 Received audio event (base64), decoded size:', bytes.length);
              await this.handleAgentAudio(bytes.buffer);
            } else {
              console.warn('⚠️ Received audio message but no audio_base_64 content', message);
            }
            return;
          }
          
          console.log('📩 Received JSON message type:', message.type);
          if (message.type !== 'audio') {
             console.log('Full message:', message);
          }
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.log('Received text message:', data);
          this.conversationCallbacks.onAgentResponse?.(data);
        }
      } else if (data instanceof ArrayBuffer) {
        console.log('Received audio data, size:', data.byteLength);
        await this.handleAgentAudio(data);
      } else if (data instanceof Blob) {
        const arrayBuffer = await data.arrayBuffer();
        console.log('Received audio blob, converted size:', arrayBuffer.byteLength);
        await this.handleAgentAudio(arrayBuffer);
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
    if (!this.audioContext) return;

    try {
      // Create Float32 buffer for playback
      const int16Array = new Int16Array(audioData);
      const float32Array = new Float32Array(int16Array.length);
      
      for (let i = 0; i < int16Array.length; i++) {
        // Convert int16 to float32 (-1.0 to 1.0)
        float32Array[i] = int16Array[i] < 0 ? int16Array[i] / 0x8000 : int16Array[i] / 0x7FFF;
      }

      // Create AudioBuffer using negotiated output sample rate (e.g. pcm_44100)
      const outputRate = this.agentOutputSampleRate || 16000;
      const buffer = this.audioContext.createBuffer(1, float32Array.length, outputRate);
      buffer.getChannelData(0).set(float32Array);

      // Create source
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);

      // Schedule playback
      const currentTime = this.audioContext.currentTime;
      
      // If nextStartTime is behind current time (gap/latency), reset it
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }

      source.start(this.nextStartTime);
      
      // Advance next start time
      this.nextStartTime += buffer.duration;
    } catch (error) {
      logger.error('Error playing agent audio:', error);
    }
  }

  private handleAudioInput(float32Data: Float32Array): void {
    if (!this.isReadyToStream()) {
      // Only log first few times to avoid spam
      if (!this._audioNotReadyLogged) {
        console.warn('⚠️ Audio input received but conversation not ready to stream yet');
        this._audioNotReadyLogged = true;
      }
      return;
    }

    // Resample if necessary (e.g. 48kHz -> negotiated user input rate)
    let processedAudio = float32Data;
    const targetRate = this.userInputSampleRate || 16000;
    if (this.audioContext && this.audioContext.sampleRate !== targetRate) {
      processedAudio = this.downsampleBuffer(float32Data, this.audioContext.sampleRate, targetRate);
    }

    const pcm16 = this.float32ToPCM16(processedAudio);

    try {
      // Send base64 encoded audio in JSON
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));

      // Log every ~50th chunk to avoid spamming but confirm activity
      if (Math.random() < 0.02) {
        console.log(`🎤 Sending audio chunk: ${pcm16.byteLength} bytes (target ${this.userInputSampleRate}Hz)`);
      }

      // ElevenLabs expects `user_audio_chunk` as a top-level field (not `type: user_audio_chunk`)
      this.conversationWebSocket?.send(
        JSON.stringify({
          user_audio_chunk: {
            audio_base_64: base64Audio,
          },
        })
      );
    } catch (error) {
      console.error('Error sending audio data:', error);
    }
  }

  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'agent_response':
        const agentText = message.agent_response_event?.agent_response;
        logger.info('Agent response:', agentText);
        if (agentText) {
          this.conversationCallbacks.onAgentResponse?.(agentText);
        }
        break;

      case 'user_transcript':
        const transcript = message.user_transcription_event?.user_transcript;
        logger.info('User transcript:', transcript);
        if (transcript) {
          this.conversationCallbacks.onUserTranscript?.(transcript);
        }
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

      case 'conversation_initiation_metadata': {
        const meta = message.conversation_initiation_metadata_event;
        const conversationId = meta?.conversation_id;
        const userFmt = meta?.user_input_audio_format;
        const agentFmt = meta?.agent_output_audio_format;

        this.userInputAudioFormat = userFmt ?? null;
        this.agentOutputAudioFormat = agentFmt ?? null;

        // Formats come like "pcm_16000" / "pcm_44100"
        const userRate = this.parsePcmSampleRate(userFmt) ?? 16000;
        const agentRate = this.parsePcmSampleRate(agentFmt) ?? 44100;
        this.userInputSampleRate = userRate;
        this.agentOutputSampleRate = agentRate;

        console.log('🎛️ Conversation initialized:', {
          conversationId,
          user_input_audio_format: userFmt,
          agent_output_audio_format: agentFmt,
          userInputSampleRate: this.userInputSampleRate,
          agentOutputSampleRate: this.agentOutputSampleRate,
        });

        this.setConversationReady();

        if (this.conversationCallbacks.onAgentResponse) {
          this.conversationCallbacks.onAgentResponse('🎙️ Connected! Start speaking...');
        }
        break;
      }

      case 'ping': {
        const eventId = message.ping_event?.event_id;
        const delayMs = message.ping_event?.ping_ms ?? 0;

        // ElevenLabs expects pong to include the ping event_id, optionally delayed by ping_ms
        setTimeout(() => {
          if (this.conversationWebSocket?.readyState === WebSocket.OPEN && eventId !== undefined) {
            this.conversationWebSocket.send(JSON.stringify({ type: 'pong', event_id: eventId }));
          }
        }, delayMs);
        break;
      }

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

    if (this.audioWorkletNode) {
      this.audioWorkletNode.disconnect();
      this.audioWorkletNode.port.onmessage = null;
      this.audioWorkletNode = null;
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
    this.conversationReady = false;
    this._audioNotReadyLogged = false;
    this.conversationCallbacks = {};
    this.signedUrl = null;
  }
}
