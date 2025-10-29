import type { AudioConfig } from '../types/index';

/**
 * KwamiAudio - Manages audio playback and frequency analysis for Kwami
 * Handles audio files, speech synthesis, and provides real-time frequency data
 */
export class KwamiAudio {
  private instance: HTMLAudioElement;
  private files: string[];
  private currentFileIndex: number = 0;
  private frequencyData: Uint8Array;
  private analyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  private streamSource: MediaStreamAudioSourceNode | null = null;

  constructor(audioFiles: string[] = [], config?: AudioConfig) {
    this.files = audioFiles;
    const initialFile = audioFiles[this.currentFileIndex];
    this.instance = new Audio(initialFile || undefined);
    this.instance.preload = config?.preload || 'auto';
    this.instance.crossOrigin = 'anonymous';
    this.frequencyData = new Uint8Array();

    if (config?.autoInitialize !== false) {
      this.initialize();
    }
  }

  /**
   * Initialize the Web Audio API analyser
   */
  private initialize(): void {
    if (!this.instance || this.analyser) {
      return;
    }

    try {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      this.audioContext = audioContext;

      const sourceNode = audioContext.createMediaElementSource(this.instance);
      const analyser = audioContext.createAnalyser();
      this.analyser = analyser;

      // Configure analyser for liquid, natural frequency response
      // Higher FFT size = better frequency resolution
      analyser.fftSize = 2048; // 1024 frequency bins
      // Lower smoothing = more responsive to quick changes
      analyser.smoothingTimeConstant = 0.7; // 0-1 (0 = no smoothing, 1 = max)
      // Min/max decibels for dynamic range
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;

      sourceNode.connect(analyser);
      analyser.connect(audioContext.destination);

      this.frequencyData = new Uint8Array(analyser.frequencyBinCount);
    } catch (error) {
      console.warn('Failed to initialize Web Audio API:', error);
    }
  }

  /**
   * Play the current audio track
   */
  async play(): Promise<void> {
    if (!this.instance) return;

    if (!this.analyser) {
      this.initialize();
    }

    if (this.audioContext?.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Failed to resume AudioContext:', error);
      }
    }

    try {
      await this.instance.play();
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  /**
   * Pause the current audio track
   */
  pause(): void {
    this.instance?.pause();
  }

  /**
   * Stop playback and reset to beginning
   */
  stop(): void {
    if (this.instance) {
      this.instance.pause();
      this.instance.currentTime = 0;
    }
  }

  /**
   * Play the next audio track in the playlist
   */
  next(): void {
    this.currentFileIndex = (this.currentFileIndex + 1) % this.files.length;
    const nextFile = this.files[this.currentFileIndex];
    if (nextFile) {
      this.loadAudioSource(nextFile);
      this.play();
    }
  }

  /**
   * Play the previous audio track in the playlist
   */
  previous(): void {
    this.currentFileIndex = this.currentFileIndex === 0
      ? this.files.length - 1
      : this.currentFileIndex - 1;
    const prevFile = this.files[this.currentFileIndex];
    if (prevFile) {
      this.loadAudioSource(prevFile);
      this.play();
    }
  }

  /**
   * Load audio from URL
   */
  loadAudioSource(audioSrc: string): void {
    if (this.instance) {
      this.instance.src = audioSrc;
    }
  }

  /**
   * Load audio from ArrayBuffer (uploaded files)
   */
  async loadAudio(arrayBuffer: ArrayBuffer): Promise<void> {
    try {
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const audioURL = URL.createObjectURL(blob);
      
      this.loadAudioSource(audioURL);
      
      // Reinitialize audio context if needed
      if (!this.analyser) {
        this.initialize();
      }
    } catch (error) {
      console.error('Failed to load audio from ArrayBuffer:', error);
      throw error;
    }
  }

  /**
   * Load audio from base64 string
   */
  loadAudioFromBase64(base64Audio: string): void {
    try {
      const byteCharacters = atob(base64Audio);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mp3' });
      const audioURL = URL.createObjectURL(blob);

      this.loadAudioSource(audioURL);
    } catch (error) {
      console.error('Failed to load audio from base64:', error);
    }
  }

  /**
   * Get real-time frequency data for audio visualization
   */
  getFrequencyData(): Uint8Array {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(this.frequencyData as Uint8Array<ArrayBuffer>);
    }
    return this.frequencyData;
  }

  /**
   * Get the analyser node for direct access
   */
  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  /**
   * Get the audio context
   */
  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  /**
   * Get current audio element for direct manipulation
   */
  getAudioElement(): HTMLAudioElement {
    return this.instance;
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    if (this.instance) {
      this.instance.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.instance?.volume || 0;
  }

  /**
   * Connect a MediaStream (e.g., from ElevenLabs) to the audio analyzer
   * This allows real-time audio visualization from streamed sources
   * 
   * @param stream - MediaStream to connect
   * @returns Promise that resolves when stream is connected
   */
  async connectMediaStream(stream: MediaStream): Promise<void> {
    if (!this.audioContext) {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContext();
    }

    // Resume audio context if suspended
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Disconnect previous stream source if exists
    if (this.streamSource) {
      this.streamSource.disconnect();
    }

    // Create analyzer if not exists
    if (!this.analyser && this.audioContext) {
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.7;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;
      this.analyser.connect(this.audioContext.destination);
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    }

    // Create source from media stream and connect to analyzer
    if (this.audioContext && this.analyser) {
      this.streamSource = this.audioContext.createMediaStreamSource(stream);
      this.streamSource.connect(this.analyser);
    }
  }

  /**
   * Disconnect the current MediaStream
   */
  disconnectMediaStream(): void {
    if (this.streamSource) {
      this.streamSource.disconnect();
      this.streamSource = null;
    }
  }

  /**
   * Check if a MediaStream is currently connected
   * 
   * @returns True if a stream is connected
   */
  isStreamConnected(): boolean {
    return this.streamSource !== null;
  }

  /**
   * Start listening to microphone input
   * @returns Promise that resolves when microphone is active
   */
  async startMicrophoneListening(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      await this.connectMediaStream(stream);
    } catch (error) {
      console.error('Failed to access microphone:', error);
      throw error;
    }
  }

  /**
   * Stop listening to microphone input
   */
  stopMicrophoneListening(): void {
    if (this.streamSource && this.streamSource.mediaStream) {
      // Stop all tracks in the media stream
      this.streamSource.mediaStream.getTracks().forEach(track => track.stop());
    }
    this.disconnectMediaStream();
  }

  /**
   * Cleanup and dispose resources
   */
  dispose(): void {
    this.pause();
    this.stopMicrophoneListening();
    if (this.audioContext) {
      this.audioContext.close().catch(() => {
        // Ignore errors during cleanup
      });
    }
  }
}
