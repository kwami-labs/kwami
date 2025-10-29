import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import type { 
  MindConfig, 
  VoiceSettings, 
  AdvancedTTSOptions,
  ConversationalAISettings,
  STTConfig,
  PronunciationConfig,
  TTSOutputFormat,
  STTModel
} from '../types/index';
import type { KwamiAudio } from './Audio';

/**
 * KwamiMind - Manages AI capabilities and voice interactions using ElevenLabs
 * 
 * The Mind handles all AI-powered features including:
 * - Voice synthesis (Text-to-Speech) with full ElevenLabs API support
 * - Voice conversations (Voice Agent) with conversational AI
 * - Speech recognition integration with STT configuration
 * - Advanced TTS options (output formats, latency optimization)
 * - Custom pronunciation dictionary
 * - Real-time voice settings adjustment
 * 
 * @example
 * ```typescript
 * const mind = new KwamiMind(audio, {
 *   apiKey: process.env.ELEVEN_LABS_KEY,
 *   voice: {
 *     voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam voice
 *     model: 'eleven_multilingual_v2',
 *     settings: {
 *       stability: 0.5,
 *       similarity_boost: 0.75,
 *       style: 0.0,
 *       use_speaker_boost: true
 *     }
 *   },
 *   language: 'en',
 *   advancedTTS: {
 *     outputFormat: 'mp3_44100_128',
 *     optimizeStreamingLatency: false
 *   }
 * });
 * 
 * await mind.initialize();
 * await mind.speak('Hello, I am Kwami!');
 * ```
 */
export class KwamiMind {
  private client: ElevenLabsClient | null = null;
  public config: MindConfig;
  private audio: KwamiAudio;
  private isInitialized: boolean = false;
  private currentAudioStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private pronunciationDictionary: Map<string, string> = new Map();
  private conversationWindow: Window | null = null;
  private windowCheckInterval: any = null;
  
  // Conversational AI WebSocket properties
  private conversationWebSocket: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private conversationActive: boolean = false;
  private conversationCallbacks: {
    onAgentResponse?: (text: string) => void;
    onUserTranscript?: (text: string) => void;
    onError?: (error: Error) => void;
    onTurnStart?: () => void;
    onTurnEnd?: () => void;
  } = {};

  constructor(audio: KwamiAudio, config?: MindConfig) {
    this.audio = audio;
    this.config = config || {};
    
    // Get API key from config or environment
    const apiKey = this.config.apiKey || (typeof process !== 'undefined' && process.env?.ELEVEN_LABS_KEY);
    
    if (apiKey) {
      this.client = new ElevenLabsClient({ apiKey });
    }
  }

  /**
   * Initialize the Mind (prepare ElevenLabs client)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Create client if it doesn't exist and we have an API key
    if (!this.client && this.config.apiKey) {
      this.client = new ElevenLabsClient({ apiKey: this.config.apiKey });
    }

    if (!this.client) {
      throw new Error('ElevenLabs API key not provided. Set it in MindConfig or ELEVEN_LABS_KEY environment variable.');
    }

    this.isInitialized = true;
  }

  /**
   * Generate speech from text using ElevenLabs TTS
   * The audio will be played through the KwamiAudio system, making the blob animate
   * 
   * @param text - Text to synthesize into speech
   * @param systemPrompt - Optional system prompt to guide the voice agent's response
   * @returns Promise that resolves when speech starts playing
   */
  async speak(text: string, systemPrompt?: string): Promise<void> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      // Apply pronunciation replacements
      const processedText = this.applyPronunciations(text);
      
      const voiceId = this.config.voice?.voiceId || 'pNInz6obpgDQGcFmaJgB'; // Default to Adam voice
      const model = this.config.voice?.model || 'eleven_multilingual_v2';
      
      // Get voice settings
      const voiceSettings = this.getVoiceSettings();

      // Build request options
      const requestOptions: any = {
        text: processedText,
        modelId: model,
        voiceSettings: voiceSettings,
      };

      // Add advanced TTS options if configured
      if (this.config.advancedTTS) {
        if (this.config.advancedTTS.outputFormat) {
          requestOptions.output_format = this.config.advancedTTS.outputFormat;
        }
        if (this.config.advancedTTS.optimizeStreamingLatency !== undefined) {
          requestOptions.optimize_streaming_latency = this.config.advancedTTS.optimizeStreamingLatency;
        }
        if (this.config.advancedTTS.nextTextTimeout) {
          requestOptions.next_text_timeout = this.config.advancedTTS.nextTextTimeout;
        }
      }

      // Add language if configured
      if (this.config.language) {
        requestOptions.language_code = this.config.language;
      }

      // Generate speech audio
      const audioStream = await this.client.textToSpeech.convert(voiceId, requestOptions);

      // Convert the stream to an audio blob
      const chunks: Uint8Array[] = [];
      const reader = audioStream.getReader();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value as Uint8Array);
        }
      } finally {
        reader.releaseLock();
      }
      
      const audioBlob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Load and play the audio through KwamiAudio
      this.audio.loadAudioSource(audioUrl);
      await this.audio.play();

    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  }

  /**
   * Start a conversation using ElevenLabs Conversational AI
   * NOTE: This feature requires the ElevenLabs WebSocket API which may require
   * additional setup or a different SDK version. Currently in experimental phase.
   * 
   * @param systemPrompt - System prompt defining the agent's personality and behavior
   * @param callbacks - Optional callbacks for conversation events
   * @returns Promise that resolves when conversation is ready
   */
  async startConversation(
    systemPrompt?: string, 
    callbacks?: {
      onAgentResponse?: (text: string) => void;
      onUserTranscript?: (text: string) => void;
      onError?: (error: Error) => void;
      onTurnStart?: () => void;
      onTurnEnd?: () => void;
    }
  ): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('API key not provided. Cannot start conversation.');
    }

    if (this.conversationActive) {
      console.warn('Conversation already active. Stop current conversation first.');
      return;
    }

    const agentId = this.config.conversational?.agentId;
    if (!agentId) {
      throw new Error('Agent ID is required. Please enter your ElevenLabs agent ID in the Mind menu.');
    }

    console.log(`🤖 Starting real conversation with Agent ID: ${agentId}`);
    
    // ElevenLabs provides a share URL for each agent
    const shareUrl = `https://elevenlabs.io/app/conversational-ai/share/${agentId}`;
    
    try {
      // Store callbacks
      this.conversationCallbacks = callbacks || {};
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      this.currentAudioStream = stream;

      this.conversationActive = true;
      
      // Option 1: Try to embed in an iframe (if container exists)
      const embedContainer = document.getElementById('elevenlabs-embed-container');
      if (embedContainer && !document.getElementById('elevenlabs-conversation-iframe')) {
        const iframe = document.createElement('iframe');
        iframe.src = shareUrl;
        iframe.width = '100%';
        iframe.height = '600';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '12px';
        iframe.id = 'elevenlabs-conversation-iframe';
        iframe.allow = 'microphone';
        embedContainer.appendChild(iframe);
        
        console.log('✅ Embedded conversation started in iframe');
        
        // Notify callbacks
        if (callbacks?.onAgentResponse) {
          callbacks.onAgentResponse('AI agent loaded! Speak naturally to have a conversation.');
        }
        if (callbacks?.onTurnEnd) {
          callbacks.onTurnEnd();
        }
        
        // Stream already initialized earlier
        
        return; // Exit early if iframe works
      }
      
      // Option 2: Open in a popup window
      if (!this.conversationWindow || this.conversationWindow.closed) {
        this.conversationWindow = window.open(
          shareUrl,
          'ElevenLabs_Conversation',
          'width=400,height=600,resizable=yes,scrollbars=yes'
        );
        
        if (this.conversationWindow) {
          console.log('✅ Conversation window opened! Talk to your AI agent in the popup.');
          
          // Monitor window status
          this.windowCheckInterval = setInterval(() => {
            if (!this.conversationWindow || this.conversationWindow.closed) {
              clearInterval(this.windowCheckInterval);
              this.windowCheckInterval = null;
              this.stopConversation();
            }
          }, 1000);
          
          // Notify callbacks
          if (callbacks?.onAgentResponse) {
            callbacks.onAgentResponse('AI agent opened in a new window! Speak there to have a conversation.');
          }
          if (callbacks?.onTurnEnd) {
            callbacks.onTurnEnd();
          }
          
          // Keep microphone stream for visual feedback
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this.currentAudioStream = stream;
          
          return; // Exit early if popup works
        } else {
          console.warn('Could not open popup window. Check your popup blocker.');
        }
      }
      
      // Fallback: Provide instructions if neither option works
      
      // If we get here, provide manual instructions
      const fallbackUrl = `https://elevenlabs.io/app/conversational-ai/share/${agentId}`;
      console.log('🔗 Direct link to your AI agent:', fallbackUrl);
      console.log('Copy and paste this URL in a new tab to start the conversation.');
      
      // Stream already initialized earlier at the beginning
      
      if (callbacks?.onAgentResponse) {
        callbacks.onAgentResponse(`Open this link to talk to your AI agent: ${fallbackUrl}`);
      }
      if (callbacks?.onTurnEnd) {
        callbacks.onTurnEnd();
      }
      
      // FUTURE: When ElevenLabs WebSocket API is available, uncomment below:
      /*
      const agentId = this.config.conversational?.agentId;
      if (!agentId) {
        throw new Error('Agent ID required. Get one from ElevenLabs dashboard.');
      }

      // Connect to ElevenLabs WebSocket
      const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation`;
      this.conversationWebSocket = new WebSocket(wsUrl);
      // ... rest of WebSocket implementation
      */

    } catch (error) {
      console.error('Error starting conversation:', error);
      this.cleanupConversation();
      throw error;
    }
  }

  /**
   * Set up WebSocket event handlers for conversation
   */
  private setupWebSocketHandlers(): void {
    if (!this.conversationWebSocket) return;

    this.conversationWebSocket.onmessage = async (event) => {
      if (event.data instanceof ArrayBuffer) {
        // This is audio data from the agent
        await this.handleAgentAudio(event.data);
      } else {
        // This is a text message (JSON)
        try {
          const message = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      }
    };

    this.conversationWebSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.conversationCallbacks.onError?.(new Error('WebSocket connection error'));
      this.stopConversation();
    };

    this.conversationWebSocket.onclose = () => {
      console.log('WebSocket connection closed');
      this.conversationActive = false;
      this.cleanupConversation();
    };
  }

  /**
   * Handle WebSocket JSON messages
   */
  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'agent_response':
        // Agent has finished speaking, transcript available
        console.log('Agent response:', message.text);
        this.conversationCallbacks.onAgentResponse?.(message.text);
        break;
        
      case 'user_transcript':
        // User speech has been transcribed
        console.log('User transcript:', message.text);
        this.conversationCallbacks.onUserTranscript?.(message.text);
        break;
        
      case 'turn_start':
        // Agent is starting to speak
        console.log('Agent turn started');
        this.conversationCallbacks.onTurnStart?.();
        // Set blob to speaking state
        if (this.audio && (this.audio as any).parentKwami) {
          (this.audio as any).parentKwami.setState('speaking');
        }
        break;
        
      case 'turn_end':
        // Agent has finished speaking
        console.log('Agent turn ended');
        this.conversationCallbacks.onTurnEnd?.();
        // Set blob to listening state
        if (this.audio && (this.audio as any).parentKwami) {
          (this.audio as any).parentKwami.setState('listening');
        }
        break;
        
      case 'error':
        console.error('Conversation error:', message.error);
        this.conversationCallbacks.onError?.(new Error(message.error));
        break;
        
      case 'conversation_end':
        console.log('Conversation ended');
        this.stopConversation();
        break;
    }
  }

  /**
   * Handle audio data from the agent
   */
  private async handleAgentAudio(audioData: ArrayBuffer): Promise<void> {
    try {
      // Convert ArrayBuffer to Blob
      const audioBlob = new Blob([audioData], { type: 'audio/pcm' });
      
      // Create a URL for the audio blob
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Load and play through KwamiAudio for visualization
      this.audio.loadAudioSource(audioUrl);
      await this.audio.play();
      
      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(audioUrl), 5000);
    } catch (error) {
      console.error('Error playing agent audio:', error);
    }
  }

  /**
   * Start streaming microphone audio to WebSocket
   */
  private startAudioStreaming(): void {
    if (!this.scriptProcessor || !this.mediaStreamSource || !this.conversationWebSocket) {
      console.error('Audio streaming components not initialized');
      return;
    }

    // Process audio and send to WebSocket
    this.scriptProcessor.onaudioprocess = (event) => {
      if (!this.conversationActive || !this.conversationWebSocket || 
          this.conversationWebSocket.readyState !== WebSocket.OPEN) {
        return;
      }

      // Get audio data
      const inputData = event.inputBuffer.getChannelData(0);
      
      // Convert Float32Array to Int16Array for PCM16 format
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      
      // Send audio data to WebSocket
      this.conversationWebSocket.send(pcm16.buffer);
    };

    // Connect audio pipeline
    this.mediaStreamSource.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext!.destination);
    
    console.log('Audio streaming started');
  }

  /**
   * Get system prompt for conversation
   */
  private getSystemPromptForConversation(): string {
    // If Soul is available, use its system prompt
    if ((this.audio as any).parentKwami?.soul) {
      return (this.audio as any).parentKwami.soul.getSystemPrompt();
    }
    
    // Otherwise, build a default system prompt
    return `You are a helpful AI assistant. ${this.config.conversational?.firstMessage || ''}`;
  }

  /**
   * Clean up conversation resources
   */
  private cleanupConversation(): void {
    // Stop media recorder first
    if (this.mediaRecorder) {
      if (this.mediaRecorder.state === 'recording') {
        try {
          this.mediaRecorder.stop();
        } catch (e) {
          console.log('MediaRecorder already stopped');
        }
      }
      this.mediaRecorder = null;
    }
    
    // Stop audio streaming
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

    // Close WebSocket
    if (this.conversationWebSocket) {
      if (this.conversationWebSocket.readyState === WebSocket.OPEN) {
        this.conversationWebSocket.close();
      }
      this.conversationWebSocket = null;
    }

    // Stop microphone
    if (this.currentAudioStream) {
      this.currentAudioStream.getTracks().forEach(track => track.stop());
      this.currentAudioStream = null;
    }

    this.conversationActive = false;
    this.conversationCallbacks = {};
  }

  /**
   * Stop the current conversation
   */
  async stopConversation(): Promise<void> {
    if (!this.conversationActive) {
      console.log('No active conversation to stop');
      return;
    }

    console.log('Stopping conversation...');
    this.conversationActive = false; // Set this immediately to prevent further processing
    
    // Close conversation window if open
    if (this.conversationWindow && !this.conversationWindow.closed) {
      this.conversationWindow.close();
      this.conversationWindow = null;
    }
    
    // Clear window check interval
    if (this.windowCheckInterval) {
      clearInterval(this.windowCheckInterval);
      this.windowCheckInterval = null;
    }
    
    // Remove iframe if exists
    const iframe = document.getElementById('elevenlabs-conversation-iframe');
    if (iframe) {
      iframe.remove();
    }
    
    // Stop media recorder if active
    if (this.mediaRecorder) {
      if (this.mediaRecorder.state === 'recording') {
        try {
          this.mediaRecorder.stop();
        } catch (e) {
          console.log('MediaRecorder already stopped');
        }
      }
      this.mediaRecorder = null;
    }
    
    // Send end message if WebSocket is still open (for future use)
    if (this.conversationWebSocket && this.conversationWebSocket.readyState === WebSocket.OPEN) {
      this.conversationWebSocket.send(JSON.stringify({ type: 'end' }));
    }

    // Clean up resources
    this.cleanupConversation();
    
    // Stop audio playback
    this.audio.stop();
    
    // Reset blob state
    if ((this.audio as any).parentKwami) {
      (this.audio as any).parentKwami.setState('idle');
    }

    console.log('Conversation stopped');
  }

  /**
   * Check if a conversation is currently active
   * 
   * @returns True if conversation is active
   */
  isConversationActive(): boolean {
    return this.conversationActive;
  }

  /**
   * Send a text message during conversation (for hybrid mode)
   * 
   * @param text - Text to send to the agent
   */
  sendConversationMessage(text: string): void {
    if (!this.conversationActive || !this.conversationWebSocket || 
        this.conversationWebSocket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: conversation not active');
      return;
    }

    this.conversationWebSocket.send(JSON.stringify({
      type: 'user_text',
      text: text
    }));
  }

  /**
   * Start listening (capture microphone input)
   * This is used for speech-to-text or voice agent input
   * 
   * @returns Promise that resolves with the media stream
   */
  async listen(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.currentAudioStream = stream;
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  /**
   * Stop listening (stop microphone capture)
   */
  stopListening(): void {
    if (this.currentAudioStream) {
      this.currentAudioStream.getTracks().forEach(track => track.stop());
      this.currentAudioStream = null;
    }
  }

  /**
   * Get voice settings from configuration
   * @returns Voice settings object for ElevenLabs API
   */
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

  /**
   * Update voice settings
   * 
   * @param settings - New voice settings
   */
  setVoiceSettings(settings: Partial<VoiceSettings>): void {
    if (!this.config.voice) {
      this.config.voice = {};
    }
    this.config.voice.settings = {
      ...this.config.voice.settings,
      ...settings,
    };
  }

  /**
   * Set the voice ID to use for speech synthesis
   * 
   * @param voiceId - ElevenLabs voice ID
   */
  setVoiceId(voiceId: string): void {
    if (!this.config.voice) {
      this.config.voice = {};
    }
    this.config.voice.voiceId = voiceId;
  }

  /**
   * Set the model to use for speech synthesis
   * 
   * @param model - ElevenLabs model ID (e.g., 'eleven_multilingual_v2', 'eleven_turbo_v2')
   */
  setModel(model: string): void {
    if (!this.config.voice) {
      this.config.voice = {};
    }
    this.config.voice.model = model;
  }

  /**
   * Get the current configuration
   * 
   * @returns Current mind configuration
   */
  getConfig(): MindConfig {
    return { ...this.config };
  }

  /**
   * Check if the Mind is initialized
   * 
   * @returns True if initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.client !== null;
  }

  /**
   * List available voices from ElevenLabs
   * 
   * @returns Promise resolving to array of available voices
   */
  async getAvailableVoices(): Promise<any[]> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      const response = await this.client.voices.getAll();
      return response.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }

  /**
   * Generate speech and return as audio blob (without playing)
   * Useful for pre-generating audio or custom playback
   * 
   * @param text - Text to synthesize
   * @returns Promise resolving to audio blob
   */
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
        voiceSettings: voiceSettings,
      });

      const chunks: Uint8Array[] = [];
      const reader = audioStream.getReader();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value as Uint8Array);
        }
      } finally {
        reader.releaseLock();
      }
      
      return new Blob(chunks as BlobPart[], { type: 'audio/mpeg' });
    } catch (error) {
      console.error('Error generating speech blob:', error);
      throw error;
    }
  }

  /**
   * Set language for speech synthesis and recognition
   * 
   * @param language - Language code (e.g., 'en', 'es', 'fr')
   */
  setLanguage(language: string): void {
    this.config.language = language;
  }

  /**
   * Get current language
   * 
   * @returns Current language code
   */
  getLanguage(): string | undefined {
    return this.config.language;
  }

  /**
   * Set advanced TTS options
   * 
   * @param options - Advanced TTS configuration
   */
  setAdvancedTTSOptions(options: Partial<AdvancedTTSOptions>): void {
    this.config.advancedTTS = {
      ...this.config.advancedTTS,
      ...options,
    };
  }

  /**
   * Get advanced TTS options
   * 
   * @returns Current advanced TTS settings
   */
  getAdvancedTTSOptions(): AdvancedTTSOptions | undefined {
    return this.config.advancedTTS;
  }

  /**
   * Set output format for TTS
   * 
   * @param format - Output format (e.g., 'mp3_44100_128', 'pcm_16000')
   */
  setOutputFormat(format: TTSOutputFormat): void {
    if (!this.config.advancedTTS) {
      this.config.advancedTTS = {};
    }
    this.config.advancedTTS.outputFormat = format;
  }

  /**
   * Enable or disable streaming latency optimization
   * 
   * @param optimize - True to optimize for low latency
   */
  setOptimizeStreamingLatency(optimize: boolean): void {
    if (!this.config.advancedTTS) {
      this.config.advancedTTS = {};
    }
    this.config.advancedTTS.optimizeStreamingLatency = optimize;
  }

  /**
   * Set next text timeout
   * 
   * @param timeout - Timeout in milliseconds
   */
  setNextTextTimeout(timeout: number): void {
    if (!this.config.advancedTTS) {
      this.config.advancedTTS = {};
    }
    this.config.advancedTTS.nextTextTimeout = timeout;
  }

  /**
   * Set conversational AI settings
   * 
   * @param settings - Conversational AI configuration
   */
  setConversationalSettings(settings: Partial<ConversationalAISettings>): void {
    this.config.conversational = {
      ...this.config.conversational,
      ...settings,
    };
  }

  /**
   * Get conversational AI settings
   * 
   * @returns Current conversational settings
   */
  getConversationalSettings(): ConversationalAISettings | undefined {
    return this.config.conversational;
  }

  /**
   * Set agent ID for conversational AI
   * 
   * @param agentId - ElevenLabs agent ID
   */
  setAgentId(agentId: string): void {
    if (!this.config.conversational) {
      this.config.conversational = {};
    }
    this.config.conversational.agentId = agentId;
  }

  /**
   * Set STT (Speech-to-Text) configuration
   * 
   * @param config - STT configuration
   */
  setSTTConfig(config: Partial<STTConfig>): void {
    this.config.stt = {
      ...this.config.stt,
      ...config,
    };
  }

  /**
   * Get STT configuration
   * 
   * @returns Current STT settings
   */
  getSTTConfig(): STTConfig | undefined {
    return this.config.stt;
  }

  /**
   * Set STT model
   * 
   * @param model - STT model (base, small, medium, large)
   */
  setSTTModel(model: STTModel): void {
    if (!this.config.stt) {
      this.config.stt = {};
    }
    this.config.stt.model = model;
  }

  /**
   * Enable or disable automatic punctuation in STT
   * 
   * @param enable - True to enable automatic punctuation
   */
  setAutomaticPunctuation(enable: boolean): void {
    if (!this.config.stt) {
      this.config.stt = {};
    }
    this.config.stt.automaticPunctuation = enable;
  }

  /**
   * Enable or disable speaker diarization in STT
   * 
   * @param enable - True to enable speaker diarization
   */
  setSpeakerDiarization(enable: boolean): void {
    if (!this.config.stt) {
      this.config.stt = {};
    }
    this.config.stt.speakerDiarization = enable;
  }

  /**
   * Add a word to the pronunciation dictionary
   * 
   * @param word - Word to add
   * @param pronunciation - Phonetic pronunciation
   */
  addPronunciation(word: string, pronunciation: string): void {
    this.pronunciationDictionary.set(word.toLowerCase(), pronunciation);
  }

  /**
   * Remove a word from the pronunciation dictionary
   * 
   * @param word - Word to remove
   */
  removePronunciation(word: string): void {
    this.pronunciationDictionary.delete(word.toLowerCase());
  }

  /**
   * Clear all pronunciations from the dictionary
   */
  clearPronunciations(): void {
    this.pronunciationDictionary.clear();
  }

  /**
   * Get pronunciation for a specific word
   * 
   * @param word - Word to look up
   * @returns Pronunciation or undefined if not found
   */
  getPronunciation(word: string): string | undefined {
    return this.pronunciationDictionary.get(word.toLowerCase());
  }

  /**
   * Get all pronunciations as an object
   * 
   * @returns Object with word-pronunciation pairs
   */
  getAllPronunciations(): Record<string, string> {
    const result: Record<string, string> = {};
    this.pronunciationDictionary.forEach((pronunciation, word) => {
      result[word] = pronunciation;
    });
    return result;
  }

  /**
   * Set pronunciation configuration
   * 
   * @param config - Pronunciation configuration
   */
  setPronunciationConfig(config: Partial<PronunciationConfig>): void {
    this.config.pronunciation = {
      ...this.config.pronunciation,
      ...config,
    };
    
    // Update internal dictionary if provided
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

  /**
   * Get pronunciation configuration
   * 
   * @returns Current pronunciation settings
   */
  getPronunciationConfig(): PronunciationConfig | undefined {
    return this.config.pronunciation;
  }

  /**
   * Apply pronunciation replacements to text before synthesis
   * 
   * @param text - Original text
   * @returns Text with pronunciation replacements
   */
  private applyPronunciations(text: string): string {
    if (this.pronunciationDictionary.size === 0) {
      return text;
    }

    let result = text;
    this.pronunciationDictionary.forEach((pronunciation, word) => {
      // Use regex with word boundaries for whole word matching
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      result = result.replace(regex, pronunciation);
    });

    return result;
  }

  /**
   * Update the complete configuration
   * 
   * @param config - New configuration (merged with existing)
   */
  updateConfig(config: Partial<MindConfig>): void {
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
  }

  /**
   * Export complete configuration as JSON-serializable object
   * 
   * @returns Configuration object
   */
  exportConfig(): MindConfig {
    return {
      ...this.config,
      pronunciation: {
        ...this.config.pronunciation,
        dictionary: this.getAllPronunciations(),
      },
    };
  }

  /**
   * Import configuration from a JSON object
   * 
   * @param config - Configuration to import
   */
  importConfig(config: MindConfig): void {
    this.updateConfig(config);
    
    // Re-initialize pronunciation dictionary
    if (config.pronunciation?.dictionary) {
      this.setPronunciationConfig(config.pronunciation);
    }
  }

  /**
   * Cleanup and dispose resources
   */
  dispose(): void {
    this.stopListening();
    if (this.currentAudioStream) {
      this.currentAudioStream.getTracks().forEach(track => track.stop());
      this.currentAudioStream = null;
    }
    this.pronunciationDictionary.clear();
  }
}
