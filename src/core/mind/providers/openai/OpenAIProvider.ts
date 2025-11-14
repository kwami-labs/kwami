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
  OpenAIProviderConfig,
} from '../../../../types';
import type {
  MindProvider,
  MindProviderDependencies,
  MindConversationCallbacks,
  MindProviderSpeakOptions,
} from '../types';

/**
 * Experimental OpenAI provider that focuses on text-to-speech playback via the
 * `/v1/audio/speech` endpoint. Realtime streaming / agent management APIs are
 * not yet wired up, but the class conforms to the MindProvider contract so the
 * rest of the system can switch providers without code changes.
 */
export class OpenAIProvider implements MindProvider {
  readonly type = 'openai';

  private audio: KwamiAudio;
  private config: MindConfig;
  private conversationActive = false;
  private currentAudioStream: MediaStream | null = null;
  private isInitialized = false;
  private conversationCallbacks: MindConversationCallbacks = {};

  constructor(dependencies: MindProviderDependencies, config: MindConfig) {
    this.audio = dependencies.audio;
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (!this.getApiKey()) {
      throw new Error('OpenAI API key not provided. Set it in MindConfig.apiKey or MindConfig.openai.apiKey.');
    }

    this.isInitialized = true;
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  async speak(text: string, _options?: MindProviderSpeakOptions): Promise<void> {
    const audioBlob = await this.generateSpeechBlob(text);
    const audioUrl = URL.createObjectURL(audioBlob);
    this.audio.loadAudioSource(audioUrl);
    await this.audio.play();
    setTimeout(() => URL.revokeObjectURL(audioUrl), 30_000);
  }

  async startConversation(_systemPrompt?: string, _callbacks?: MindConversationCallbacks): Promise<void> {
    this.notSupported('OpenAI Realtime conversation streaming');
  }

  async stopConversation(): Promise<void> {
    if (!this.conversationActive) {
      return;
    }
    this.conversationActive = false;
    this.conversationCallbacks = {};
    this.stopListening();
  }

  isConversationActive(): boolean {
    return this.conversationActive;
  }

  sendConversationMessage(_text: string): void {
    console.warn('[OpenAIProvider] Conversation messaging is not available yet.');
  }

  async listen(): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.currentAudioStream = stream;
    return stream;
  }

  stopListening(): void {
    if (this.currentAudioStream) {
      this.currentAudioStream.getTracks().forEach((track) => track.stop());
      this.currentAudioStream = null;
    }
  }

  async getAvailableVoices(): Promise<any[]> {
    return [
      { id: 'alloy', name: 'Alloy' },
      { id: 'verse', name: 'Verse' },
      { id: 'aria', name: 'Aria' },
      { id: 'sol', name: 'Sol' },
    ];
  }

  async generateSpeechBlob(text: string): Promise<Blob> {
    if (!text) {
      throw new Error('Cannot synthesize empty text.');
    }

    const response = await fetch(this.getSpeechEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getApiKey()}`,
      },
      body: JSON.stringify({
        model: this.getSpeechModel(),
        voice: this.getVoice(),
        input: text,
        format: this.getSpeechFormat(),
      }),
    });

    if (!response.ok) {
      throw new Error(await this.extractError(response, 'Failed to synthesize speech with OpenAI.'));
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Blob([arrayBuffer], { type: this.getMimeType() });
  }

  async previewVoice(text?: string): Promise<void> {
    await this.speak(text || 'Hello! This is my OpenAI voice.');
  }

  async testMicrophone(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error('[OpenAIProvider] Microphone test failed:', error);
      return false;
    }
  }

  async createAgent(_config: CreateAgentRequest): Promise<AgentResponse> {
    return this.notSupported('OpenAI agent creation');
  }

  async getAgent(_agentId: string): Promise<AgentResponse> {
    return this.notSupported('OpenAI agent retrieval');
  }

  async listAgents(_options?: ListAgentsOptions): Promise<ListAgentsResponse> {
    return this.notSupported('OpenAI agent listing');
  }

  async updateAgent(_agentId: string, _config: UpdateAgentRequest): Promise<AgentResponse> {
    return this.notSupported('OpenAI agent update');
  }

  async deleteAgent(_agentId: string): Promise<void> {
    this.notSupported('OpenAI agent deletion');
  }

  async duplicateAgent(
    _agentId: string,
    _options?: DuplicateAgentRequest
  ): Promise<AgentResponse> {
    return this.notSupported('OpenAI agent duplication');
  }

  async getAgentLink(_agentId: string): Promise<AgentLinkResponse> {
    return this.notSupported('OpenAI agent share links');
  }

  async simulateConversation(
    _agentId: string,
    _request: SimulateConversationRequest
  ): Promise<SimulateConversationResponse> {
    return this.notSupported('OpenAI conversation simulation');
  }

  async simulateConversationStream(
    _agentId: string,
    _request: SimulateConversationRequest,
    _onChunk?: (chunk: any) => void
  ): Promise<void> {
    this.notSupported('OpenAI streaming conversation simulation');
  }

  async calculateLLMUsage(
    _agentId: string,
    _request?: LLMUsageRequest
  ): Promise<LLMUsageResponse> {
    return this.notSupported('OpenAI LLM usage calculation');
  }

  async listConversations(
    _options?: ListConversationsOptions
  ): Promise<ListConversationsResponse> {
    return this.notSupported('OpenAI conversation listing');
  }

  async getConversation(_conversationId: string): Promise<ConversationResponse> {
    return this.notSupported('OpenAI conversation retrieval');
  }

  async deleteConversation(_conversationId: string): Promise<void> {
    this.notSupported('OpenAI conversation deletion');
  }

  async getConversationAudio(_conversationId: string): Promise<Blob> {
    return this.notSupported('OpenAI conversation audio download');
  }

  async sendConversationFeedback(
    _conversationId: string,
    _feedback: ConversationFeedbackRequest
  ): Promise<void> {
    this.notSupported('OpenAI conversation feedback');
  }

  async getConversationToken(
    _agentId: string,
    _participantName?: string
  ): Promise<ConversationTokenResponse> {
    return this.notSupported('OpenAI conversation tokens');
  }

  async getConversationSignedUrl(
    _agentId: string,
    _options?: ConversationSignedUrlOptions
  ): Promise<ConversationSignedUrlResponse> {
    return this.notSupported('OpenAI signed conversation URLs');
  }

  dispose(): void {
    this.stopListening();
    this.conversationCallbacks = {};
    this.conversationActive = false;
  }

  updateConfig(config: MindConfig): void {
    this.config = config;
  }

  private get openai(): OpenAIProviderConfig | undefined {
    return this.config.openai;
  }

  private getApiKey(): string {
    const key = this.openai?.apiKey || this.config.apiKey;
    if (!key) {
      throw new Error('OpenAI API key not provided.');
    }
    return key;
  }

  private getSpeechEndpoint(): string {
    const baseUrl = (this.openai?.baseUrl || 'https://api.openai.com').replace(/\/$/, '');
    return `${baseUrl}/v1/audio/speech`;
  }

  private getSpeechModel(): string {
    return (
      this.openai?.speech?.model ||
      this.config.voice?.model ||
      'gpt-4o-mini-tts'
    );
  }

  private getVoice(): string {
    return (
      this.openai?.speech?.voice ||
      this.config.voice?.voiceId ||
      'alloy'
    );
  }

  private getSpeechFormat(): 'mp3' | 'wav' | 'pcm' {
    const format =
      this.openai?.speech?.format ||
      (this.config.advancedTTS?.outputFormat?.includes('pcm')
        ? 'pcm'
        : 'mp3');
    if (format === 'wav' || format === 'pcm') {
      return format;
    }
    return 'mp3';
  }

  private getMimeType(): string {
    const format = this.getSpeechFormat();
    if (format === 'wav') return 'audio/wav';
    if (format === 'pcm') return 'audio/pcm';
    return 'audio/mpeg';
  }

  private async extractError(response: Response, fallback: string): Promise<string> {
    try {
      const data = await response.json();
      if (data?.error?.message) {
        return data.error.message;
      }
      return JSON.stringify(data);
    } catch {
      return `${fallback} (${response.status} ${response.statusText})`;
    }
  }

  private notSupported<T = never>(feature: string): T {
    throw new Error(`[OpenAIProvider] ${feature} is not supported yet.`);
  }
}
