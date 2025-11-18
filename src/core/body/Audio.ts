import type { AudioConfig } from '../../types/index';

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
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private highpassFilter: BiquadFilterNode | null = null;
  private isHighpassEnabled = false;
  private highpassDefaults = {
    frequency: 1200,
    q: 0.85,
  };
  private lowpassFilters: BiquadFilterNode[] = [];
  private readonly maxLowpassStages = 3;
  private isLowpassEnabled = false;
  private lowpassDefaults = {
    frequency: 220,
    q: 0.85,
  };
  private clampLowpassFrequency(frequency: number): number {
    if (!this.audioContext) {
      return Math.max(10, frequency);
    }
    const nyquist = this.audioContext.sampleRate / 2;
    return Math.max(10, Math.min(frequency, nyquist));
  }
  public parentKwami: any; // Reference to parent Kwami instance for state management

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
      this.sourceNode = sourceNode;
      this.analyser = analyser;

      // Configure analyser for liquid, natural frequency response
      // Higher FFT size = better frequency resolution
      analyser.fftSize = 2048; // 1024 frequency bins
      // Lower smoothing = more responsive to quick changes
      analyser.smoothingTimeConstant = 0.35; // Faster response for natural dynamics
      // Min/max decibels for dynamic range
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;

      this.ensureHighpassFilter();
      this.ensureLowpassFilters();
      this.rebuildAudioGraph();

      this.frequencyData = new Uint8Array(analyser.frequencyBinCount);
    } catch (error) {
      console.warn('Failed to initialize Web Audio API:', error);
    }
  }

  private ensureHighpassFilter(): void {
    if (!this.audioContext || this.highpassFilter) {
      return;
    }

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = this.highpassDefaults.frequency;
    filter.Q.value = this.highpassDefaults.q;
    this.highpassFilter = filter;
  }

  private ensureLowpassFilters(): void {
    if (!this.audioContext) {
      return;
    }

    if (this.lowpassFilters.length === this.maxLowpassStages) {
      return;
    }

    while (this.lowpassFilters.length < this.maxLowpassStages) {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = this.lowpassDefaults.frequency;
      filter.Q.value = this.lowpassDefaults.q;
      this.lowpassFilters.push(filter);
    }
  }

  private rebuildAudioGraph(): void {
    if (!this.audioContext || !this.analyser || !this.sourceNode) {
      return;
    }

    try {
      this.sourceNode.disconnect();
    } catch {
      // Ignore disconnect errors when nodes aren't connected yet
    }

    if (this.highpassFilter) {
      try {
        this.highpassFilter.disconnect();
      } catch {
        // Ignore disconnect errors
      }
    }

    this.lowpassFilters.forEach(filter => {
      try {
        filter.disconnect();
      } catch {
        // Ignore disconnect errors
      }
    });

    try {
      this.analyser.disconnect();
    } catch {
      // Ignore disconnect errors
    }

    let currentNode: AudioNode = this.sourceNode;

    if (this.isHighpassEnabled && this.highpassFilter) {
      currentNode.connect(this.highpassFilter);
      currentNode = this.highpassFilter;
    }

    if (this.isLowpassEnabled && this.lowpassFilters.length > 0) {
      this.lowpassFilters.forEach(filter => {
        currentNode.connect(filter);
        currentNode = filter;
      });
    }

    currentNode.connect(this.analyser);

    this.analyser.connect(this.audioContext.destination);
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
      if (
        (this.highpassFilter && this.isHighpassEnabled)
        || (this.lowpassFilters.length > 0 && this.isLowpassEnabled)
      ) {
        this.rebuildAudioGraph();
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
   * Load an audio file from a File object (for file uploads)
   */
  async loadAudioFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('audio/')) {
        reject(new Error('Invalid audio file'));
        return;
      }

      const url = URL.createObjectURL(file);
      this.loadAudioSource(url);
      
      // Clean up the object URL after loading
      this.instance.addEventListener('loadeddata', () => {
        resolve();
      }, { once: true });
      
      this.instance.addEventListener('error', (e) => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load audio file'));
      }, { once: true });
    });
  }

  /**
   * Get current playback time in seconds
   */
  getCurrentTime(): number {
    return this.instance?.currentTime || 0;
  }

  /**
   * Set playback time in seconds
   */
  setCurrentTime(time: number): void {
    if (this.instance) {
      this.instance.currentTime = Math.max(0, Math.min(time, this.getDuration()));
    }
  }

  /**
   * Get audio duration in seconds
   */
  getDuration(): number {
    return this.instance?.duration || 0;
  }

  /**
   * Format time in MM:SS format
   */
  formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return this.instance ? !this.instance.paused : false;
  }

  /**
   * Toggle play/pause
   */
  async togglePlayPause(): Promise<void> {
    if (this.isPlaying()) {
      this.pause();
    } else {
      await this.play();
    }
  }

  /**
   * Set FFT size for frequency analysis
   */
  setFFTSize(size: 512 | 1024 | 2048 | 4096): void {
    if (this.analyser) {
      this.analyser.fftSize = size;
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    }
  }

  /**
   * Set smoothing time constant for frequency analysis
   */
  setSmoothingTimeConstant(value: number): void {
    if (this.analyser) {
      this.analyser.smoothingTimeConstant = Math.max(0, Math.min(1, value));
    }
  }

  /**
   * Enable a highpass filter for playback
   */
  enableHighpassFilter(settings?: { frequency?: number; q?: number }): void {
    if (settings?.frequency) {
      this.highpassDefaults.frequency = settings.frequency;
    }
    if (settings?.q) {
      this.highpassDefaults.q = settings.q;
    }

    if (!this.analyser || !this.audioContext || !this.sourceNode) {
      this.initialize();
    }

    this.ensureHighpassFilter();

    if (this.highpassFilter) {
      this.highpassFilter.frequency.value = this.highpassDefaults.frequency;
      this.highpassFilter.Q.value = this.highpassDefaults.q;
    }

    this.isHighpassEnabled = true;
    this.rebuildAudioGraph();
  }

  /**
   * Disable the highpass filter and revert to the dry signal
   */
  disableHighpassFilter(): void {
    if (!this.isHighpassEnabled) return;

    this.isHighpassEnabled = false;
    this.rebuildAudioGraph();
  }

  /**
   * Returns whether the highpass filter is currently active
   */
  isHighpassFilterEnabled(): boolean {
    return this.isHighpassEnabled;
  }

  /**
   * Enable a lowpass filter for playback
   */
  enableLowpassFilter(settings?: { frequency?: number; q?: number }): void {
    if (settings?.frequency) {
      this.lowpassDefaults.frequency = settings.frequency;
    }
    if (settings?.q) {
      this.lowpassDefaults.q = settings.q;
    }

    if (!this.analyser || !this.audioContext || !this.sourceNode) {
      this.initialize();
    }

    this.ensureLowpassFilters();

    if (this.lowpassFilters.length > 0) {
      const baseFreq = this.lowpassDefaults.frequency;
      const baseQ = this.lowpassDefaults.q;

      this.lowpassFilters.forEach((filter, index) => {
        const stageFreq = Math.max(10, baseFreq * Math.pow(0.6, index));
        const stageQ = baseQ + index * 0.35;
        filter.frequency.value = stageFreq;
        filter.Q.value = stageQ;
      });
    }

    this.isLowpassEnabled = true;
    this.rebuildAudioGraph();
  }

  /**
   * Disable the lowpass filter and revert to the dry/highpass chain
   */
  disableLowpassFilter(): void {
    if (!this.isLowpassEnabled) return;

    this.isLowpassEnabled = false;
    this.rebuildAudioGraph();
  }

  /**
   * Returns whether the lowpass filter is currently active
   */
  isLowpassFilterEnabled(): boolean {
    return this.isLowpassEnabled;
  }

  /**
   * Smoothly adjust the active lowpass filter frequency
   */
  setLowpassFrequency(
    frequency: number,
    options?: { q?: number; transitionTime?: number }
  ): void {
    if (!this.analyser || !this.audioContext || !this.sourceNode) {
      this.initialize();
    }

    this.ensureLowpassFilters();

    if (!this.lowpassFilters.length || !this.audioContext) {
      return;
    }

    if (!this.isLowpassEnabled) {
      this.isLowpassEnabled = true;
      this.rebuildAudioGraph();
    }

    const targetFrequency = this.clampLowpassFrequency(frequency);
    const baseQ = options?.q ?? this.lowpassDefaults.q;
    this.lowpassDefaults.frequency = targetFrequency;
    this.lowpassDefaults.q = baseQ;

    const transition = Math.max(0, options?.transitionTime ?? 0);
    const currentTime = this.audioContext.currentTime;

    this.lowpassFilters.forEach((filter, index) => {
      const stageFrequency = Math.max(10, targetFrequency * Math.pow(0.6, index));
      const stageQ = baseQ + index * 0.35;

      filter.frequency.cancelScheduledValues(currentTime);
      filter.Q.cancelScheduledValues(currentTime);

      if (transition > 0) {
        filter.frequency.setValueAtTime(filter.frequency.value, currentTime);
        filter.frequency.linearRampToValueAtTime(stageFrequency, currentTime + transition);
        filter.Q.setValueAtTime(filter.Q.value, currentTime);
        filter.Q.linearRampToValueAtTime(stageQ, currentTime + transition);
      } else {
        filter.frequency.value = stageFrequency;
        filter.Q.value = stageQ;
      }
    });
  }

  /**
   * Get the current base lowpass frequency target
   */
  getLowpassFrequency(): number {
    return this.lowpassDefaults.frequency;
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
      this.analyser.smoothingTimeConstant = 0.35;
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
    try {
      this.sourceNode?.disconnect();
    } catch {
      // ignore
    }
    try {
      this.highpassFilter?.disconnect();
    } catch {
      // ignore
    }
    this.lowpassFilters.forEach(filter => {
      try {
        filter.disconnect();
      } catch {
        // ignore
      }
    });
    this.highpassFilter = null;
    this.lowpassFilters = [];
    this.sourceNode = null;
    this.isHighpassEnabled = false;
    this.isLowpassEnabled = false;
    if (this.audioContext) {
      this.audioContext.close().catch(() => {
        // Ignore errors during cleanup
      });
    }
  }
}
