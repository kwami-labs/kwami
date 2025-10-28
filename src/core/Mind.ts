import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import type { MindConfig, VoiceSettings } from '../types/index';
import type { KwamiAudio } from './Audio';

/**
 * KwamiMind - Manages AI capabilities and voice interactions using ElevenLabs
 * 
 * The Mind handles all AI-powered features including:
 * - Voice synthesis (Text-to-Speech)
 * - Voice conversations (Voice Agent)
 * - Speech recognition integration
 * 
 * @example
 * ```typescript
 * const mind = new KwamiMind(audio, {
 *   apiKey: process.env.ELEVEN_LABS_KEY,
 *   voice: {
 *     voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam voice
 *     model: 'eleven_multilingual_v2'
 *   }
 * });
 * 
 * await mind.initialize();
 * await mind.speak('Hello, I am Kwami!');
 * ```
 */
export class KwamiMind {
  private client: ElevenLabsClient | null = null;
  private config: MindConfig;
  private audio: KwamiAudio;
  private isInitialized: boolean = false;
  private currentAudioStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;

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
      const voiceId = this.config.voice?.voiceId || 'pNInz6obpgDQGcFmaJgB'; // Default to Adam voice
      const model = this.config.voice?.model || 'eleven_multilingual_v2';
      
      // Get voice settings
      const voiceSettings = this.getVoiceSettings();

      // Generate speech audio
      const audioStream = await this.client.textToSpeech.convert(voiceId, {
        text,
        modelId: model,
        voiceSettings: voiceSettings,
      });

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
   * This enables real-time voice conversations with the agent
   * 
   * @param systemPrompt - System prompt defining the agent's personality and behavior
   * @returns Promise that resolves when conversation is ready
   */
  async startConversation(systemPrompt: string): Promise<void> {
    if (!this.client) {
      throw new Error('Mind not initialized. Call initialize() first or provide API key.');
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.currentAudioStream = stream;

      // Note: ElevenLabs Conversational AI would be initialized here
      // The current SDK version may require using their WebSocket API directly
      console.log('Conversation mode ready. System prompt:', systemPrompt);
      
      // TODO: Implement full conversational AI integration when available
      // This would involve:
      // 1. Setting up WebSocket connection to ElevenLabs
      // 2. Streaming microphone audio to the service
      // 3. Receiving and playing back agent responses
      // 4. Connecting agent audio output to KwamiAudio for visualization

    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  }

  /**
   * Stop the current conversation
   */
  async stopConversation(): Promise<void> {
    if (this.currentAudioStream) {
      this.currentAudioStream.getTracks().forEach(track => track.stop());
      this.currentAudioStream = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    this.audio.stop();
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
   * Cleanup and dispose resources
   */
  dispose(): void {
    this.stopListening();
    if (this.currentAudioStream) {
      this.currentAudioStream.getTracks().forEach(track => track.stop());
      this.currentAudioStream = null;
    }
  }
}
