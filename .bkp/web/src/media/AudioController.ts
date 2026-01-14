import type { Kwami } from 'kwami';
import { hideSongTitle } from './SongTitleDisplay';

let isMusicPlaying = false;
let isVoicePlaying = false;
let isLowpassFilterActive = false;
let voiceEndedHandler: (() => void) | null = null;
const audioStopListeners: Array<() => void> = [];

export function getKwamiInstance(): Kwami | null {
  const scrollManager = (window as any).scrollManager;
  return scrollManager?.getKwami?.() ?? null;
}

export function getAudioState() {
  return {
    isMusicPlaying,
    isVoicePlaying,
    isLowpassFilterActive,
  };
}

export function setMusicPlaying(state: boolean) {
  isMusicPlaying = state;
}

export function setVoicePlaying(state: boolean) {
  isVoicePlaying = state;
}

export function setLowpassState(state: boolean) {
  isLowpassFilterActive = state;
}

export function setVoiceEndedHandler(handler: (() => void) | null) {
  voiceEndedHandler = handler;
}

export function removeVoiceEndedHandler(audioElement: HTMLAudioElement) {
  if (voiceEndedHandler) {
    audioElement.removeEventListener('ended', voiceEndedHandler);
    voiceEndedHandler = null;
  }
}

export function onAudioStop(callback: () => void) {
  audioStopListeners.push(callback);
}

/**
 * Stop any Kwami-managed audio (music or voice)
 */
export function stopKwamiAudio() {
  const kwami = getKwamiInstance();
  const audio = kwami?.body?.audio;

  if (!kwami || !audio) {
    isMusicPlaying = false;
    isVoicePlaying = false;
    isLowpassFilterActive = false;
    return;
  }

  removeVoiceEndedHandler(audio.getAudioElement());

  audio.disableLowpassFilter();
  audio.disableHighpassFilter();
  audio.pause();
  audio.setCurrentTime(0);

  isMusicPlaying = false;
  isVoicePlaying = false;
  isLowpassFilterActive = false;
  hideSongTitle();
  console.log('🛑 Audio stopped');

  audioStopListeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      console.warn('Audio stop listener failed', error);
    }
  });
}


