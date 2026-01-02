interface AudioState {
  audioInstance: HTMLAudioElement;
  frequencyData: Uint8Array;
  analyser: AnalyserNode | null;
  file: number;
  files: string[];
}

interface AudioActions {
  loadAudioSource(audioSrc: string): void;
  initializeAudio(): void;
  playAudio(): void;
  pauseAudio(): void;
  getFrequencyData(): void;
}

interface AudioStore extends AudioState, AudioActions {}
