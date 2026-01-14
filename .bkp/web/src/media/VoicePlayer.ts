import { VOICE_FILES } from '../config/constants';
import { getMediaDisplayName } from '../utils/mediaUtils';
import { showSongTitle, hideSongTitle } from './SongTitleDisplay';
import {
  getAudioState,
  getKwamiInstance,
  removeVoiceEndedHandler,
  setMusicPlaying,
  setVoiceEndedHandler,
  setVoicePlaying,
  stopKwamiAudio
} from './AudioController';

let currentVoiceUrl: string | null = null;

function pickRandomVoiceUrl(): string | null {
  if (!VOICE_FILES.length) {
    return null;
  }

  if (VOICE_FILES.length === 1) {
    return VOICE_FILES[0];
  }

  let candidate: string | null = null;
  const attempts = new Set<string>();

  while (attempts.size < VOICE_FILES.length) {
    const next = VOICE_FILES[Math.floor(Math.random() * VOICE_FILES.length)];
    if (next !== currentVoiceUrl) {
      candidate = next;
      break;
    }
    attempts.add(next);
  }

  return candidate ?? VOICE_FILES[0];
}

export async function playRandomVoiceClip() {
  if (!VOICE_FILES.length) {
    console.warn('🎤 No voice files found in /voices/');
    return;
  }

  const kwami = getKwamiInstance();
  if (!kwami) {
    console.warn('🎤 Kwami instance not ready yet');
    return;
  }

  const nextUrl = pickRandomVoiceUrl();
  if (!nextUrl) {
    console.warn('🎤 Could not select a voice file to play');
    return;
  }

  currentVoiceUrl = nextUrl;
  stopKwamiAudio();

  try {
    kwami.body.audio.loadAudioSource(nextUrl);
    await kwami.body.audio.play();
    setVoicePlaying(true);
    setMusicPlaying(false);

    const voiceName = getMediaDisplayName(nextUrl);
    showSongTitle(voiceName, 'voice');

    const audioElement = kwami.body.audio.getAudioElement();
    removeVoiceEndedHandler(audioElement);

    const handler = () => {
      setVoicePlaying(false);
      hideSongTitle();
    };

    audioElement.addEventListener('ended', handler, { once: true });
    setVoiceEndedHandler(handler);
  } catch (error) {
    console.error('❌ Failed to play voice clip:', error);
    stopVoicePlayback();
  }
}

export async function toggleVoicePlayback() {
  if (getAudioState().isVoicePlaying) {
    stopVoicePlayback();
  } else {
    await playRandomVoiceClip();
  }
}

export function stopVoicePlayback() {
  if (!getAudioState().isVoicePlaying) {
    return;
  }
  stopKwamiAudio();
  setVoicePlaying(false);
  currentVoiceUrl = null;
}


