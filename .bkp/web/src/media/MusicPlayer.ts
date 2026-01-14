import { LOWPASS_CLOSED_FREQUENCY, LOWPASS_OPEN_FREQUENCY, MUSIC_FILES } from '../config/constants';
import { getMediaDisplayName } from '../utils/mediaUtils';
import { hideSongTitle, showSongTitle } from './SongTitleDisplay';
import {
  getAudioState,
  getKwamiInstance,
  onAudioStop,
  setLowpassState,
  setMusicPlaying,
  setVoicePlaying,
  stopKwamiAudio
} from './AudioController';

let currentMusicIndex = -1;
let lowpassReleaseHandle: number | null = null;

onAudioStop(() => {
  if (lowpassReleaseHandle !== null) {
    window.clearTimeout(lowpassReleaseHandle);
    lowpassReleaseHandle = null;
  }
});

export function isMusicPlaying() {
  return getAudioState().isMusicPlaying;
}

export async function playRandomMusic() {
  if (MUSIC_FILES.length === 0) {
    console.warn('⚠️ No music files available');
    return;
  }

  const kwami = getKwamiInstance();
  if (!kwami) {
    console.warn('⚠️ Kwami not initialized yet');
    return;
  }

  if (!kwami.body?.audio) {
    console.error('⚠️ Kwami audio system not available');
    return;
  }

  try {
    let newIndex;
    if (MUSIC_FILES.length === 1) {
      newIndex = 0;
    } else {
      do {
        newIndex = Math.floor(Math.random() * MUSIC_FILES.length);
      } while (newIndex === currentMusicIndex && MUSIC_FILES.length > 1);
    }

    currentMusicIndex = newIndex;
    const selectedSong = MUSIC_FILES[newIndex];
    const songName = getMediaDisplayName(selectedSong);

    showSongTitle(songName);

    const response = await fetch(selectedSong);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    await kwami.body.audio.loadAudio(arrayBuffer);

    kwami.body.audio.disableLowpassFilter();
    setLowpassState(false);
    await kwami.body.audio.play();

    setMusicPlaying(true);
    setVoicePlaying(false);
    setLowpassState(false);

    const audioElement = kwami.body.audio.getAudioElement();
    audioElement.addEventListener('ended', () => {
      setMusicPlaying(false);
      kwami.body.audio.disableLowpassFilter();
      setLowpassState(false);
      hideSongTitle();
    }, { once: true });

    audioElement.addEventListener('error', (e: Event) => {
      console.error('🎵 Audio element error:', e);
      setMusicPlaying(false);
    }, { once: true });
  } catch (error) {
    console.error('❌ Failed to play music:', error);
  }
}

export function getMusicState() {
  return {
    currentMusicIndex,
    ...getAudioState()
  };
}

export function getOpenLowpassFrequency(audio: any): number {
  const ctx = audio.getAudioContext?.();
  if (ctx) {
    return Math.min(LOWPASS_OPEN_FREQUENCY, ctx.sampleRate / 2 - 100);
  }
  return LOWPASS_OPEN_FREQUENCY;
}

export async function toggleMusicLowpass(forceState?: boolean) {
  const kwami = getKwamiInstance();
  const audio = kwami?.body?.audio;

  if (!kwami || !audio) {
    console.warn('🎚️ Lowpass toggle skipped - Kwami audio not ready');
    return;
  }

  if (!audio.isPlaying() && !getAudioState().isMusicPlaying) {
    console.warn('🎚️ Lowpass toggle skipped - no music playing');
    return;
  }

  const currentState = getAudioState().isLowpassFilterActive;
  const nextState = typeof forceState === 'boolean' ? forceState : !currentState;
  const transitionSeconds = 1.15;
  const openFrequency = getOpenLowpassFrequency(audio);

  if (lowpassReleaseHandle !== null) {
    window.clearTimeout(lowpassReleaseHandle);
    lowpassReleaseHandle = null;
  }

  if (nextState) {
    audio.enableLowpassFilter({ frequency: openFrequency, q: 0.95 });
    audio.setLowpassFrequency(LOWPASS_CLOSED_FREQUENCY, { transitionTime: transitionSeconds, q: 1.3 });
  } else {
    audio.setLowpassFrequency(openFrequency, { transitionTime: transitionSeconds, q: 0.95 });
    lowpassReleaseHandle = window.setTimeout(() => {
      audio.disableLowpassFilter();
      lowpassReleaseHandle = null;
    }, transitionSeconds * 1000 + 150);
  }

  setLowpassState(nextState);
  console.log(`🎚️ Lowpass filter ${nextState ? 'enabled' : 'disabled'} with smooth ramp`);
}

export function stopMusicPlayback() {
  stopKwamiAudio();
}


