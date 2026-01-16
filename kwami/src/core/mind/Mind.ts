import type { 
  MindConfig, 
  VoiceSettings, 
  AdvancedTTSOptions,
  ConversationalAISettings,
  STTConfig,
  PronunciationConfig,
  TTSOutputFormat,
  STTModel,
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
  MindProviderType,
} from '../../types';
import type { KwamiAudio } from '../body/Audio';
import { logger } from '../../utils/logger';
import { createMindProvider } from './providers/factory';
import type { MindConversationCallbacks, MindProvider } from './providers/types';

/**
 * KwamiMind orchestrates provider-specific voice & conversation capabilities.
 * All provider logic is encapsulated inside dedicated providers so this class
 * can remain provider-agnostic.
 */
export class KwamiMind {
  private provider: MindProvider;
  private audio: KwamiAudio;
  private pronunciationDictionary: Map<string, string> = new Map();
  public config: MindConfig;

  constructor(audio: KwamiAudio, config?: MindConfig) {
    this.audio = audio;
    this.config = config || {};
    this.provider = createMindProvider(this.config.provider, { audio }, this.config);
  }

  async initialize(): Promise<void> {
    await this.provider.initialize();
  }

  isReady(): boolean {
    return this.provider.isReady();
  }

  async speak(text: string, systemPrompt?: string): Promise<void> {
      const processedText = this.applyPronunciations(text);
    await this.provider.speak(processedText, { systemPrompt });
  }

  async startConversation(
    systemPrompt?: string, 
    callbacks?: MindConversationCallbacks
  ): Promise<void> {
    const resolvedPrompt = systemPrompt ?? this.getSystemPromptForConversation();
    await this.provider.startConversation(resolvedPrompt, callbacks);
  }

  async stopConversation(): Promise<void> {
    await this.provider.stopConversation();
  }

  isConversationActive(): boolean {
    return this.provider.isConversationActive();
  }

  sendConversationMessage(text: string): void {
    this.provider.sendConversationMessage(text);
  }

  async listen(): Promise<MediaStream> {
    return this.provider.listen();
  }

  stopListening(): void {
    this.provider.stopListening();
  }

  async getAvailableVoices(): Promise<any[]> {
    return this.provider.getAvailableVoices();
  }

  async generateSpeechBlob(text: string): Promise<Blob> {
    const processedText = this.applyPronunciations(text);
    return this.provider.generateSpeechBlob(processedText);
  }

  async previewVoice(text?: string): Promise<void> {
    const previewText = text || 'Hello! This is a preview of my voice. How do I sound?';
    await this.speak(previewText);
  }

  async testMicrophone(): Promise<boolean> {
    return this.provider.testMicrophone();
  }

  async createAgent(config: CreateAgentRequest): Promise<AgentResponse> {
    return this.provider.createAgent(config);
  }

  async getAgent(agentId: string): Promise<AgentResponse> {
    return this.provider.getAgent(agentId);
  }

  async listAgents(options?: ListAgentsOptions): Promise<ListAgentsResponse> {
    return this.provider.listAgents(options);
  }

  async updateAgent(agentId: string, config: UpdateAgentRequest): Promise<AgentResponse> {
    return this.provider.updateAgent(agentId, config);
  }

  async deleteAgent(agentId: string): Promise<void> {
    await this.provider.deleteAgent(agentId);
  }

  async duplicateAgent(
    agentId: string,
    options?: DuplicateAgentRequest
  ): Promise<AgentResponse> {
    return this.provider.duplicateAgent(agentId, options);
  }

  async getAgentLink(agentId: string): Promise<AgentLinkResponse> {
    return this.provider.getAgentLink(agentId);
  }

  async simulateConversation(
    agentId: string,
    request: SimulateConversationRequest
  ): Promise<SimulateConversationResponse> {
    return this.provider.simulateConversation(agentId, request);
  }

  async simulateConversationStream(
    agentId: string,
    request: SimulateConversationRequest,
    onChunk?: (chunk: any) => void
  ): Promise<void> {
    await this.provider.simulateConversationStream(agentId, request, onChunk);
  }

  async calculateLLMUsage(
    agentId: string,
    request?: LLMUsageRequest
  ): Promise<LLMUsageResponse> {
    return this.provider.calculateLLMUsage(agentId, request);
  }

  async listConversations(
    options?: ListConversationsOptions
  ): Promise<ListConversationsResponse> {
    return this.provider.listConversations(options);
  }

  async getConversation(conversationId: string): Promise<ConversationResponse> {
    return this.provider.getConversation(conversationId);
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.provider.deleteConversation(conversationId);
  }

  async getConversationAudio(conversationId: string): Promise<Blob> {
    return this.provider.getConversationAudio(conversationId);
  }

  async sendConversationFeedback(
    conversationId: string,
    feedback: ConversationFeedbackRequest
  ): Promise<void> {
    await this.provider.sendConversationFeedback(conversationId, feedback);
  }

  async getConversationToken(
    agentId: string,
    participantName?: string
  ): Promise<ConversationTokenResponse> {
    return this.provider.getConversationToken(agentId, participantName);
  }

  async getConversationSignedUrl(
    agentId: string,
    options?: ConversationSignedUrlOptions
  ): Promise<ConversationSignedUrlResponse> {
    return this.provider.getConversationSignedUrl(agentId, options);
  }

  async checkUsage(): Promise<{
    charactersUsed?: number;
    characterLimit?: number;
    remaining?: number;
  }> {
    logger.info('Usage tracking is provider-specific and not implemented yet.');
    return {
      charactersUsed: 0,
      characterLimit: 0,
      remaining: 0,
    };
  }

  setVoiceSettings(settings: Partial<VoiceSettings>): void {
    if (!this.config.voice) {
      this.config.voice = {};
    }
    this.config.voice.settings = {
      ...this.config.voice.settings,
      ...settings,
    };
    this.notifyProvider();
  }

  setVoiceId(voiceId: string): void {
    if (!this.config.voice) {
      this.config.voice = {};
    }
    this.config.voice.voiceId = voiceId;
    this.notifyProvider();
  }

  setModel(model: string): void {
    if (!this.config.voice) {
      this.config.voice = {};
    }
    this.config.voice.model = model;
    this.notifyProvider();
  }

  getConfig(): MindConfig {
    return { ...this.config };
  }

  setLanguage(language: string): void {
    this.config.language = language;
    this.notifyProvider();
  }

  getLanguage(): string | undefined {
    return this.config.language;
  }

  setAdvancedTTSOptions(options: Partial<AdvancedTTSOptions>): void {
    this.config.advancedTTS = {
      ...this.config.advancedTTS,
      ...options,
    };
    this.notifyProvider();
  }

  getAdvancedTTSOptions(): AdvancedTTSOptions | undefined {
    return this.config.advancedTTS;
  }

  setOutputFormat(format: TTSOutputFormat): void {
    if (!this.config.advancedTTS) {
      this.config.advancedTTS = {};
    }
    this.config.advancedTTS.outputFormat = format;
    this.notifyProvider();
  }

  setOptimizeStreamingLatency(optimize: boolean): void {
    if (!this.config.advancedTTS) {
      this.config.advancedTTS = {};
    }
    this.config.advancedTTS.optimizeStreamingLatency = optimize;
    this.notifyProvider();
  }

  setNextTextTimeout(timeout: number): void {
    if (!this.config.advancedTTS) {
      this.config.advancedTTS = {};
    }
    this.config.advancedTTS.nextTextTimeout = timeout;
    this.notifyProvider();
  }

  setConversationalSettings(settings: Partial<ConversationalAISettings>): void {
    this.config.conversational = {
      ...this.config.conversational,
      ...settings,
    };
    this.notifyProvider();
  }

  getConversationalSettings(): ConversationalAISettings | undefined {
    return this.config.conversational;
  }

  setAgentId(agentId: string): void {
    if (!this.config.conversational) {
      this.config.conversational = {};
    }
    this.config.conversational.agentId = agentId;
    this.notifyProvider();
  }

  setSTTConfig(config: Partial<STTConfig>): void {
    this.config.stt = {
      ...this.config.stt,
      ...config,
    };
    this.notifyProvider();
  }

  getSTTConfig(): STTConfig | undefined {
    return this.config.stt;
  }

  setSTTModel(model: STTModel): void {
    if (!this.config.stt) {
      this.config.stt = {};
    }
    this.config.stt.model = model;
    this.notifyProvider();
  }

  setAutomaticPunctuation(enable: boolean): void {
    if (!this.config.stt) {
      this.config.stt = {};
    }
    this.config.stt.automaticPunctuation = enable;
    this.notifyProvider();
  }

  setSpeakerDiarization(enable: boolean): void {
    if (!this.config.stt) {
      this.config.stt = {};
    }
    this.config.stt.speakerDiarization = enable;
    this.notifyProvider();
  }

  addPronunciation(word: string, pronunciation: string): void {
    this.pronunciationDictionary.set(word.toLowerCase(), pronunciation);
  }

  removePronunciation(word: string): void {
    this.pronunciationDictionary.delete(word.toLowerCase());
  }

  clearPronunciations(): void {
    this.pronunciationDictionary.clear();
  }

  getPronunciation(word: string): string | undefined {
    return this.pronunciationDictionary.get(word.toLowerCase());
  }

  getAllPronunciations(): Record<string, string> {
    const result: Record<string, string> = {};
    this.pronunciationDictionary.forEach((pronunciation, word) => {
      result[word] = pronunciation;
    });
    return result;
  }

  setPronunciationConfig(config: Partial<PronunciationConfig>): void {
    this.config.pronunciation = {
      ...this.config.pronunciation,
      ...config,
    };
    
    if (config.dictionary) {
      this.pronunciationDictionary.clear();
      if (config.dictionary instanceof Map) {
        this.pronunciationDictionary = new Map(config.dictionary);
      } else {
        Object.entries(config.dictionary).forEach(([word, pronunciation]) => {
          this.pronunciationDictionary.set(word.toLowerCase(), pronunciation);
        });
      }
    }
  }

  getPronunciationConfig(): PronunciationConfig | undefined {
    return this.config.pronunciation;
  }

  updateConfig(config: Partial<MindConfig>): void {
    const previousProvider = this.config.provider;
    this.config = {
      ...this.config,
      ...config,
      voice: {
        ...this.config.voice,
        ...config.voice,
        settings: {
          ...this.config.voice?.settings,
          ...config.voice?.settings,
        },
      },
      advancedTTS: {
        ...this.config.advancedTTS,
        ...config.advancedTTS,
      },
      conversational: {
        ...this.config.conversational,
        ...config.conversational,
      },
      stt: {
        ...this.config.stt,
        ...config.stt,
      },
      pronunciation: {
        ...this.config.pronunciation,
        ...config.pronunciation,
      },
    };

    if (config.provider && config.provider !== previousProvider) {
      this.provider.dispose();
      this.provider = createMindProvider(config.provider, { audio: this.audio }, this.config);
    } else {
      this.notifyProvider();
    }

    if (config.pronunciation?.dictionary) {
      this.setPronunciationConfig(config.pronunciation);
    }
  }

  exportConfig(): MindConfig {
    return {
      ...this.config,
      pronunciation: {
        ...this.config.pronunciation,
        dictionary: this.getAllPronunciations(),
      },
    };
  }

  importConfig(config: MindConfig): void {
    this.updateConfig(config);
  }

  applyVoicePreset(preset: 'natural' | 'expressive' | 'stable' | 'clear'): void {
    const presets: Record<string, VoiceSettings> = {
      natural: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: false,
      },
      expressive: {
        stability: 0.3,
        similarity_boost: 0.6,
        style: 0.5,
        use_speaker_boost: true,
      },
      stable: {
        stability: 0.8,
        similarity_boost: 0.85,
        style: 0.0,
        use_speaker_boost: true,
      },
      clear: {
        stability: 0.6,
        similarity_boost: 0.9,
        style: 0.1,
        use_speaker_boost: true,
      },
    };

    const settings = presets[preset];
    if (settings) {
      this.setVoiceSettings(settings);
    }
  }

  dispose(): void {
    this.provider.dispose();
    this.stopListening();
    this.pronunciationDictionary.clear();
  }

  private notifyProvider(): void {
    this.provider.updateConfig(this.config);
  }

  private applyPronunciations(text: string): string {
    if (this.pronunciationDictionary.size === 0) {
      return text;
    }

    let result = text;
    this.pronunciationDictionary.forEach((pronunciation, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      result = result.replace(regex, pronunciation);
    });

    return result;
  }

  private getSystemPromptForConversation(): string {
    if ((this.audio as any).parentKwami?.soul) {
      return (this.audio as any).parentKwami.soul.getSystemPrompt();
    }

    return `You are a helpful AI assistant. ${this.config.conversational?.firstMessage || ''}`.trim();
  }

  setProvider(provider: MindProviderType): void {
    if (provider === this.config.provider) {
      return;
    }

    this.updateConfig({ provider });
  }
}
