import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
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
  ConversationSignedUrlResponse
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
    
    // Get API key from config
    // Note: For browser environments, the API key must be provided via config
    // Environment variables are only available in Node.js environments
    const apiKey = this.config.apiKey;
    
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

    console.log(`🤖 Starting conversation with Agent ID: ${agentId}`);
    
    try {
      // Store callbacks
      this.conversationCallbacks = callbacks || {};
      
      // First, get a signed URL for the WebSocket connection
      console.log('🔑 Getting signed URL from ElevenLabs...');
      console.log('Agent ID:', agentId);
      console.log('API Key:', this.config.apiKey ? '✓ Present' : '✗ Missing');
      
      const signedUrlEndpoint = `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`;
      console.log('Requesting:', signedUrlEndpoint);
      
      const signedUrlResponse = await fetch(signedUrlEndpoint, {
        method: 'GET',
        headers: {
          'xi-api-key': this.config.apiKey!,
          'Content-Type': 'application/json'
        }
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
          error: errorDetails
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
      
      console.log('✅ Got signed URL, requesting microphone access...');
      
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
      
      // Set up audio context for processing
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
      
      // Create script processor for audio chunks
      const scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
      this.mediaStreamSource.connect(scriptProcessor);
      scriptProcessor.connect(this.audioContext.destination);
      
      // Connect to the signed WebSocket URL
      console.log('🔌 Connecting to ElevenLabs conversation WebSocket...');
      this.conversationWebSocket = new WebSocket(signedUrl);
      
      // Set up WebSocket event handlers
      this.setupWebSocketHandlers();
      
      // Wait for WebSocket to open
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 10000);
        
        this.conversationWebSocket!.onopen = () => {
          clearTimeout(timeout);
          console.log('✅ WebSocket connected successfully!');
          
          // The conversation should start automatically once connected
          // No need to send initialization - the signed URL handles auth
          
          resolve();
        };
        
        this.conversationWebSocket!.onerror = (error) => {
          clearTimeout(timeout);
          console.error('WebSocket error:', error);
          reject(new Error('Failed to connect to ElevenLabs conversation. Please check your agent is active.'));
        };
      });
      
      // Don't start streaming immediately - wait for initialization
      let audioPacketCount = 0;
      let isConversationReady = false;
      
      // Store the script processor for later
      (this as any).audioProcessor = scriptProcessor;
      
      scriptProcessor.onaudioprocess = (event) => {
        // Only send audio after conversation is initialized
        if (!isConversationReady || !this.conversationActive || !this.conversationWebSocket || 
            this.conversationWebSocket.readyState !== WebSocket.OPEN) {
          return;
        }
        
        // Convert Float32Array to PCM16
        const float32 = event.inputBuffer.getChannelData(0);
        const pcm16 = this.float32ToPCM16(float32);
        
        // Send audio data as binary
        try {
          this.conversationWebSocket.send(pcm16.buffer);
          audioPacketCount++;
          
          // Log every 100th packet to avoid spam
          if (audioPacketCount % 100 === 0) {
            console.log(`Sent ${audioPacketCount} audio packets (${pcm16.byteLength} bytes each)`);
          }
        } catch (error) {
          console.error('Error sending audio data:', error);
        }
      };
      
      // Mark conversation as ready after WebSocket connects and initialization
      // This will be set to true when we receive the conversation_initiation_metadata message
      (this as any).setConversationReady = () => {
        isConversationReady = true;
        console.log('🎤 Audio streaming enabled');
      };
      
      this.conversationActive = true;
      
      // Notify success
      if (callbacks?.onAgentResponse) {
        callbacks.onAgentResponse('🎙️ Conversation started! Speak naturally to talk with your AI agent through Kwami.');
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

  /**
   * Convert Float32Array audio to PCM16 format for WebSocket transmission
   */
  private float32ToPCM16(float32: Float32Array): Int16Array {
    const length = float32.length;
    const pcm16 = new Int16Array(length);
    
    for (let i = 0; i < length; i++) {
      // Clamp the float value between -1 and 1
      let sample = Math.max(-1, Math.min(1, float32[i]));
      // Convert to 16-bit PCM
      pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    
    return pcm16;
  }
  
  /**
   * Convert PCM16 audio data to WAV format for playback
   */
  private pcm16ToWav(pcmData: ArrayBuffer): Blob {
    const pcm16 = new Int16Array(pcmData);
    const length = pcm16.length * 2; // 2 bytes per sample
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    // RIFF chunk descriptor
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    
    // fmt sub-chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (PCM)
    view.setUint16(22, 1, true); // NumChannels (mono)
    view.setUint32(24, 16000, true); // SampleRate
    view.setUint32(28, 16000 * 2, true); // ByteRate
    view.setUint16(32, 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample
    
    // data sub-chunk
    writeString(36, 'data');
    view.setUint32(40, length, true);
    
    // Copy PCM data
    const outputData = new Int16Array(arrayBuffer, 44);
    outputData.set(pcm16);
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }
  
  /**
   * Set up WebSocket event handlers for conversation
   */
  private setupWebSocketHandlers(): void {
    if (!this.conversationWebSocket) return;

    this.conversationWebSocket.onmessage = async (event) => {
      // Log all incoming messages for debugging
      console.log('WebSocket message received:', {
        type: event.data instanceof ArrayBuffer ? 'binary' : 'text',
        size: event.data instanceof ArrayBuffer ? event.data.byteLength : event.data.length
      });
      
      if (event.data instanceof ArrayBuffer) {
        // This is audio data from the agent
        console.log('Received audio data, size:', event.data.byteLength);
        await this.handleAgentAudio(event.data);
      } else if (event.data instanceof Blob) {
        // Convert Blob to ArrayBuffer if needed
        const arrayBuffer = await event.data.arrayBuffer();
        console.log('Received audio blob, converted size:', arrayBuffer.byteLength);
        await this.handleAgentAudio(arrayBuffer);
      } else {
        // This is a text message (JSON)
        try {
          const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          console.log('Received JSON message:', message);
          this.handleWebSocketMessage(message);
        } catch (error) {
          // Might be a string message that's not JSON
          console.log('Received text message:', event.data);
          // Check if it's a simple text response
          if (typeof event.data === 'string') {
            this.conversationCallbacks.onAgentResponse?.(event.data);
          }
        }
      }
    };

    this.conversationWebSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.conversationCallbacks.onError?.(new Error('WebSocket connection error'));
      this.stopConversation();
    };

    this.conversationWebSocket.onclose = (event) => {
      console.log('WebSocket connection closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      
      // Interpret close codes
      let closeReason = 'Unknown reason';
      switch (event.code) {
        case 1000: closeReason = 'Normal closure'; break;
        case 1001: closeReason = 'Going away'; break;
        case 1002: closeReason = 'Protocol error'; break;
        case 1003: closeReason = 'Unsupported data'; break;
        case 1006: closeReason = 'Abnormal closure (no close frame)'; break;
        case 1007: closeReason = 'Invalid frame payload data'; break;
        case 1008: closeReason = 'Policy violation'; break;
        case 1009: closeReason = 'Message too big'; break;
        case 1010: closeReason = 'Mandatory extension'; break;
        case 1011: closeReason = 'Internal server error'; break;
        case 4000: closeReason = 'Bad request'; break;
        case 4001: closeReason = 'Unauthorized'; break;
        case 4002: closeReason = 'Bad gateway'; break;
        case 4003: closeReason = 'Forbidden'; break;
        case 4004: closeReason = 'Not found'; break;
        case 4008: closeReason = 'Request timeout'; break;
        case 4009: closeReason = 'Conflict'; break;
      }
      
      console.error(`WebSocket closed: ${closeReason} (${event.code})`);
      if (event.reason) {
        console.error('Close reason from server:', event.reason);
      }
      
      this.conversationActive = false;
      this.cleanupConversation();
      
      // Notify callbacks about the closure
      if (this.conversationCallbacks.onError) {
        this.conversationCallbacks.onError(new Error(`Connection closed: ${closeReason}`));
      }
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
        
      case 'conversation_initiation_metadata':
        // Conversation initialized successfully
        console.log('✅ Conversation initialized:', {
          conversationId: message.conversation_initiation_metadata_event?.conversation_id,
          audioFormat: message.conversation_initiation_metadata_event?.user_input_audio_format,
          agentFormat: message.conversation_initiation_metadata_event?.agent_output_audio_format
        });
        
        // Enable audio streaming now that conversation is ready
        if ((this as any).setConversationReady) {
          (this as any).setConversationReady();
        }
        
        // Conversation is ready
        if (this.conversationCallbacks.onAgentResponse) {
          this.conversationCallbacks.onAgentResponse('🎙️ Connected! Start speaking...');
        }
        break;
        
      case 'ping':
        // Keep-alive ping from server
        if (this.conversationWebSocket?.readyState === WebSocket.OPEN) {
          this.conversationWebSocket.send(JSON.stringify({ type: 'pong' }));
        }
        break;
        
      default:
        console.log('Unhandled message type:', message.type, message);
    }
  }

  /**
   * Handle audio data from the agent
   */
  private async handleAgentAudio(audioData: ArrayBuffer): Promise<void> {
    try {
      // Convert PCM audio data to playable format
      // ElevenLabs sends audio as PCM16, we need to convert to WAV for playback
      const wavBlob = this.pcm16ToWav(audioData);
      const audioUrl = URL.createObjectURL(wavBlob);
      
      // Load and play through KwamiAudio for visualization
      this.audio.loadAudioSource(audioUrl);
      await this.audio.play();
      
      // Clean up the URL after playback
      setTimeout(() => URL.revokeObjectURL(audioUrl), 10000);
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
   * Apply a voice preset for quick configuration
   * 
   * @param preset - Preset name: 'natural', 'expressive', 'stable', 'clear'
   */
  applyVoicePreset(preset: 'natural' | 'expressive' | 'stable' | 'clear'): void {
    const presets = {
      natural: {
        stability: 0.50,
        similarity_boost: 0.75,
        style: 0.00,
        use_speaker_boost: false
      },
      expressive: {
        stability: 0.30,
        similarity_boost: 0.60,
        style: 0.50,
        use_speaker_boost: true
      },
      stable: {
        stability: 0.80,
        similarity_boost: 0.85,
        style: 0.00,
        use_speaker_boost: true
      },
      clear: {
        stability: 0.60,
        similarity_boost: 0.90,
        style: 0.10,
        use_speaker_boost: true
      }
    };

    const settings = presets[preset];
    if (settings) {
      this.setVoiceSettings(settings);
    }
  }

  /**
   * Preview voice with a sample text
   * 
   * @param text - Optional custom text to preview, defaults to a sample
   * @returns Promise that resolves when preview starts playing
   */
  async previewVoice(text?: string): Promise<void> {
    const previewText = text || "Hello! This is a preview of my voice. How do I sound?";
    await this.speak(previewText);
  }

  /**
   * Test microphone access
   * 
   * @returns Promise that resolves with true if microphone is accessible
   */
  async testMicrophone(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately after testing
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone test failed:', error);
      return false;
    }
  }

  /**
   * Check API usage (stub for future implementation)
   * Note: ElevenLabs API usage checking requires additional API endpoints
   * 
   * @returns Promise with usage information
   */
  async checkUsage(): Promise<{ charactersUsed?: number; characterLimit?: number; remaining?: number }> {
    // This would require additional ElevenLabs API endpoints for usage tracking
    // For now, return a stub response
    console.log('API usage checking not yet implemented in ElevenLabs SDK');
    return {
      charactersUsed: 0,
      characterLimit: 0,
      remaining: 0
    };
  }

  // ==================== ElevenLabs Agents API ====================

  /**
   * Create a new conversational AI agent
   * 
   * This method creates a fully configured agent with TTS, ASR, and LLM capabilities.
   * The agent can be used for voice conversations via WebSocket connections.
   * 
   * @param config - Agent configuration including prompt, voice, and conversation settings
   * @returns Promise resolving to the created agent's details including agent_id
   * 
   * @example
   * ```typescript
   * const agent = await mind.createAgent({
   *   conversation_config: {
   *     agent: {
   *       prompt: {
   *         prompt: "You are a helpful AI assistant.",
   *         llm: "gpt-4",
   *         temperature: 0.7
   *       },
   *       first_message: "Hello! How can I help you today?",
   *       language: "en"
   *     },
   *     tts: {
   *       model_id: "eleven_turbo_v2",
   *       voice_id: "pNInz6obpgDQGcFmaJgB",
   *       stability: 0.5,
   *       similarity_boost: 0.75
   *     }
   *   }
   * });
   * console.log('Agent created:', agent.agent_id);
   * ```
   */
  async createAgent(config: CreateAgentRequest): Promise<AgentResponse> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      console.log('📝 Creating new agent...');
      const response = await this.client.conversationalAi.agents.create(config as any);
      console.log('✅ Agent created successfully:', response.agent_id);
      return response as unknown as AgentResponse;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  }

  /**
   * Retrieve details of a specific agent
   * 
   * @param agentId - The unique identifier of the agent
   * @returns Promise resolving to the agent's complete configuration and details
   * 
   * @example
   * ```typescript
   * const agent = await mind.getAgent('agent_3701k3ttaq12ewp8b7qv5rfyszkz');
   * console.log('Agent name:', agent.name);
   * console.log('Created at:', agent.created_at);
   * ```
   */
  async getAgent(agentId: string): Promise<AgentResponse> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      console.log('🔍 Fetching agent:', agentId);
      const response = await this.client.conversationalAi.agents.get(agentId);
      return response as unknown as AgentResponse;
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw error;
    }
  }

  /**
   * List all agents with optional pagination
   * 
   * @param options - Optional pagination parameters (page_size, page_token)
   * @returns Promise resolving to list of agents with pagination metadata
   * 
   * @example
   * ```typescript
   * // Get first page
   * const result = await mind.listAgents({ page_size: 10 });
   * console.log('Found agents:', result.agents.length);
   * 
   * // Get next page if available
   * if (result.has_more) {
   *   const nextPage = await mind.listAgents({ 
   *     page_size: 10,
   *     page_token: result.next_page_token 
   *   });
   * }
   * ```
   */
  async listAgents(options?: ListAgentsOptions): Promise<ListAgentsResponse> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      console.log('📋 Listing agents...');
      const response = await this.client.conversationalAi.agents.list(options as any);
      return response as unknown as ListAgentsResponse;
    } catch (error) {
      console.error('Error listing agents:', error);
      throw error;
    }
  }

  /**
   * Update an existing agent's configuration
   * 
   * You can update any aspect of the agent including prompt, voice settings,
   * and conversation configuration. Only provided fields will be updated.
   * 
   * @param agentId - The unique identifier of the agent to update
   * @param config - Updated agent configuration (partial update supported)
   * @returns Promise resolving to the updated agent details
   * 
   * @example
   * ```typescript
   * const updated = await mind.updateAgent('agent_3701k3ttaq12ewp8b7qv5rfyszkz', {
   *   conversation_config: {
   *     agent: {
   *       first_message: "Hi there! What can I do for you?"
   *     },
   *     tts: {
   *       stability: 0.7,
   *       similarity_boost: 0.8
   *     }
   *   }
   * });
   * console.log('Agent updated successfully');
   * ```
   */
  async updateAgent(agentId: string, config: UpdateAgentRequest): Promise<AgentResponse> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      console.log('✏️ Updating agent:', agentId);
      const response = await this.client.conversationalAi.agents.update(agentId, config as any);
      console.log('✅ Agent updated successfully');
      return response as unknown as AgentResponse;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  }

  /**
   * Delete an agent permanently
   * 
   * ⚠️ Warning: This action cannot be undone. The agent and all its configurations
   * will be permanently deleted.
   * 
   * @param agentId - The unique identifier of the agent to delete
   * @returns Promise that resolves when the agent is deleted
   * 
   * @example
   * ```typescript
   * await mind.deleteAgent('agent_3701k3ttaq12ewp8b7qv5rfyszkz');
   * console.log('Agent deleted successfully');
   * ```
   */
  async deleteAgent(agentId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      console.log('🗑️ Deleting agent:', agentId);
      await this.client.conversationalAi.agents.delete(agentId);
      console.log('✅ Agent deleted successfully');
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  }

  /**
   * Duplicate an existing agent with optional modifications
   * 
   * Creates a copy of an agent, optionally with a new name. Useful for creating
   * variations of existing agents or testing different configurations.
   * 
   * @param agentId - The unique identifier of the agent to duplicate
   * @param options - Optional configuration for the duplicated agent
   * @returns Promise resolving to the newly created agent's details
   * 
   * @example
   * ```typescript
   * const duplicate = await mind.duplicateAgent(
   *   'agent_3701k3ttaq12ewp8b7qv5rfyszkz',
   *   { new_name: 'My Agent Copy' }
   * );
   * console.log('Duplicated agent:', duplicate.agent_id);
   * ```
   */
  async duplicateAgent(agentId: string, options?: DuplicateAgentRequest): Promise<AgentResponse> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      console.log('📋 Duplicating agent:', agentId);
      const response = await this.client.conversationalAi.agents.duplicate(agentId, options as any);
      console.log('✅ Agent duplicated:', response.agent_id);
      return response as unknown as AgentResponse;
    } catch (error) {
      console.error('Error duplicating agent:', error);
      throw error;
    }
  }

  /**
   * Get a shareable link for an agent
   * 
   * Retrieves the public URL that can be shared to allow others to interact
   * with the agent via web interface.
   * 
   * @param agentId - The unique identifier of the agent
   * @returns Promise resolving to the agent link details
   * 
   * @example
   * ```typescript
   * const link = await mind.getAgentLink('agent_3701k3ttaq12ewp8b7qv5rfyszkz');
   * console.log('Share this link:', link.link_url);
   * console.log('Link enabled:', link.enabled);
   * ```
   */
  async getAgentLink(agentId: string): Promise<AgentLinkResponse> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      console.log('🔗 Fetching agent link:', agentId);
      const response = await this.client.conversationalAi.agents.link.get(agentId);
      return response as unknown as AgentLinkResponse;
    } catch (error) {
      console.error('Error fetching agent link:', error);
      throw error;
    }
  }

  /**
   * Simulate a conversation with an agent (non-streaming)
   * 
   * Test your agent by simulating a conversation without real-time audio.
   * Useful for testing agent responses, debugging prompts, and validating behavior.
   * 
   * @param agentId - The unique identifier of the agent
   * @param request - Simulation configuration including conversation history
   * @returns Promise resolving to the agent's response and metadata
   * 
   * @example
   * ```typescript
   * const result = await mind.simulateConversation(
   *   'agent_3701k3ttaq12ewp8b7qv5rfyszkz',
   *   {
   *     conversation_history: [
   *       { role: 'user', message: 'What is the weather like?' },
   *       { role: 'assistant', message: 'I don\'t have access to weather data.' },
   *       { role: 'user', message: 'Tell me a joke instead.' }
   *     ]
   *   }
   * );
   * console.log('Agent response:', result.agent_response);
   * console.log('Tokens used:', result.metadata?.total_tokens);
   * ```
   */
  async simulateConversation(
    agentId: string, 
    request: SimulateConversationRequest
  ): Promise<SimulateConversationResponse> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      console.log('🎭 Simulating conversation with agent:', agentId);
      const response = await this.client.conversationalAi.agents.simulateConversation(
        agentId, 
        request as any
      );
      return response as unknown as SimulateConversationResponse;
    } catch (error) {
      console.error('Error simulating conversation:', error);
      throw error;
    }
  }

  /**
   * Simulate a conversation with streaming responses
   * 
   * Similar to simulateConversation but streams the response in real-time,
   * providing a more realistic testing experience.
   * 
   * @param agentId - The unique identifier of the agent
   * @param request - Simulation configuration
   * @param onChunk - Callback function called for each chunk of the response
   * @returns Promise that resolves when streaming completes
   * 
   * @example
   * ```typescript
   * await mind.simulateConversationStream(
   *   'agent_3701k3ttaq12ewp8b7qv5rfyszkz',
   *   {
   *     conversation_history: [
   *       { role: 'user', message: 'Tell me a story.' }
   *     ]
   *   },
   *   (chunk) => {
   *     console.log('Received chunk:', chunk);
   *     // Update UI with streaming response
   *   }
   * );
   * ```
   */
  async simulateConversationStream(
    agentId: string,
    request: SimulateConversationRequest,
    onChunk?: (chunk: any) => void
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      console.log('🎭 Simulating streaming conversation with agent:', agentId);
      await this.client.conversationalAi.agents.simulateConversationStream(
        agentId,
        request as any
      );
      // Note: The SDK's stream handling would need to be implemented based on their actual API
      // This is a placeholder for the streaming logic
      console.log('✅ Conversation stream completed');
    } catch (error) {
      console.error('Error simulating conversation stream:', error);
      throw error;
    }
  }

  /**
   * Calculate expected LLM token usage and costs
   * 
   * Estimate the token usage and associated costs before deploying or using an agent.
   * Helps with budgeting and understanding resource requirements.
   * 
   * @param agentId - The unique identifier of the agent
   * @param request - Usage calculation parameters
   * @returns Promise resolving to estimated token usage and costs
   * 
   * @example
   * ```typescript
   * const usage = await mind.calculateLLMUsage(
   *   'agent_3701k3ttaq12ewp8b7qv5rfyszkz',
   *   {
   *     conversation_turns: 10,
   *     average_user_message_length: 50
   *   }
   * );
   * console.log('Estimated tokens:', usage.estimated_total_tokens);
   * console.log('Estimated cost:', usage.estimated_cost_usd);
   * ```
   */
  async calculateLLMUsage(
    agentId: string,
    request?: LLMUsageRequest
  ): Promise<LLMUsageResponse> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      console.log('💰 Calculating LLM usage for agent:', agentId);
      const response = await this.client.conversationalAi.agents.llmUsage.calculate(
        agentId,
        request as any
      );
      return response as unknown as LLMUsageResponse;
    } catch (error) {
      console.error('Error calculating LLM usage:', error);
      throw error;
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
