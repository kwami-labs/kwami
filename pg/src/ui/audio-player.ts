/**
 * Audio Player
 *
 * Initializes the in-page audio player UI and wires it to Kwami's audio system.
 */

import { audioPlayerState } from '../core/state-manager.js';
import { updateStatus, showError } from './messages.js';
import { createMediaLoaderUI } from '../media-loader-ui.js';

let endedHandlerRef: (() => void) | null = null;

function getKwamiAudio() {
  return (window as any).kwami?.body?.audio;
}

export function openAudioLoaderModal(): void {
  const modal = document.getElementById('audio-loader-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

export function closeAudioLoaderModal(): void {
  const modal = document.getElementById('audio-loader-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

export function initializeAudioPlayer(): void {
  if (audioPlayerState.initialized) {
    return;
  }

  const audioPlayerContainer = document.getElementById('audio-player');
  if (!audioPlayerContainer) {
    console.warn('Audio player container missing; skipping initialization');
    return;
  }

  const toggleButton = document.getElementById('audio-toggle-btn');
  const closeButton = document.getElementById('audio-close-btn');

  const setAudioPlayerVisibility = (visible: boolean) => {
    audioPlayerState.visible = visible;
    audioPlayerContainer.classList.toggle('hidden', !visible);
    toggleButton?.classList.toggle('hidden', visible);

    if (toggleButton) {
      toggleButton.setAttribute('aria-expanded', String(visible));
      toggleButton.setAttribute('aria-pressed', String(visible));
      const label = visible ? 'Hide audio player' : 'Show audio player';
      toggleButton.setAttribute('aria-label', label);
      toggleButton.setAttribute('title', label);
    }
  };

  setAudioPlayerVisibility(Boolean(audioPlayerState.visible));

  toggleButton?.addEventListener('click', () => setAudioPlayerVisibility(true));
  closeButton?.addEventListener('click', () => setAudioPlayerVisibility(false));

  const uploadButton = document.getElementById('upload-audio-btn');
  const playPauseButton = document.getElementById('play-pause-btn') as HTMLButtonElement | null;
  const prevButton = document.getElementById('prev-track-btn') as HTMLButtonElement | null;
  const nextButton = document.getElementById('next-track-btn') as HTMLButtonElement | null;
  const volumeSlider = document.getElementById('volume-slider') as HTMLInputElement | null;
  const volumeIcon = document.getElementById('volume-icon');
  const audioName = document.getElementById('audio-name');
  const audioTime = document.getElementById('audio-time');

  if (
    !uploadButton ||
    !playPauseButton ||
    !prevButton ||
    !nextButton ||
    !volumeSlider ||
    !volumeIcon ||
    !audioName ||
    !audioTime
  ) {
    console.warn('Audio player elements missing; skipping initialization');
    return;
  }

  const kwamiAudio = getKwamiAudio();
  const audioElement: HTMLAudioElement | undefined = kwamiAudio?.getAudioElement?.();

  if (!kwamiAudio || !audioElement) {
    console.warn('Kwami audio instance not available; skipping audio player initialization');
    return;
  }

  const deriveNameFromSrc = (src: string) => {
    if (!src) return '';

    if (audioPlayerState.displayName && audioPlayerState.displayName !== 'No audio loaded') {
      return audioPlayerState.displayName;
    }

    if (src.startsWith('blob:')) {
      return 'Uploaded Audio';
    }

    try {
      const url = new URL(src, window.location.href);
      const pathname = url.pathname || '';
      const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
      return filename ? decodeURIComponent(filename) : url.host || 'Audio Track';
    } catch {
      const sanitized = src.split('?')[0];
      const filename = sanitized.substring(sanitized.lastIndexOf('/') + 1);
      return filename || 'Audio Track';
    }
  };

  const setDisplayName = (name: string) => {
    audioPlayerState.displayName = name;
    audioName.textContent = name;
  };

  const updateTimeDisplay = () => {
    const current = kwamiAudio.formatTime(kwamiAudio.getCurrentTime());
    const duration = kwamiAudio.formatTime(kwamiAudio.getDuration());
    audioTime.textContent = `${current} / ${duration}`;
  };

  const updatePlayPauseState = () => {
    const hasSource = Boolean(audioElement.src);
    playPauseButton.disabled = !hasSource;

    if (kwamiAudio.isPlaying()) {
      playPauseButton.textContent = '⏸';
      playPauseButton.title = 'Pause';
    } else {
      playPauseButton.textContent = '▶️';
      playPauseButton.title = hasSource ? 'Play' : 'No audio loaded';
    }
  };

  const updateVolumeUI = (volume: number) => {
    const normalized = Math.max(0, Math.min(1, Number.isFinite(volume) ? volume : 0));
    volumeSlider.value = String(Math.round(normalized * 100));

    let icon = '🔊';
    if (normalized === 0) icon = '🔇';
    else if (normalized < 0.34) icon = '🔈';
    else if (normalized < 0.67) icon = '🔉';

    volumeIcon.textContent = icon;
  };

  playPauseButton.addEventListener('click', async () => {
    if (playPauseButton.disabled) return;

    try {
      await kwamiAudio.togglePlayPause();
    } catch (error) {
      console.error('Failed to toggle audio playback:', error);
      showError('Unable to play audio. Please check the file format.');
    }
  });

  volumeSlider.addEventListener('input', (event) => {
    const value = Number((event.target as HTMLInputElement | null)?.value ?? 80);
    const volume = Math.max(0, Math.min(100, value)) / 100;
    kwamiAudio.setVolume(volume);

    if (volume > 0) {
      audioPlayerState.lastVolume = volume;
    }

    updateVolumeUI(volume);
  });

  volumeIcon.addEventListener('click', () => {
    if (audioElement.volume === 0) {
      const restoreVolume = audioPlayerState.lastVolume || 0.8;
      kwamiAudio.setVolume(restoreVolume);
      updateVolumeUI(restoreVolume);
    } else {
      audioPlayerState.lastVolume = audioElement.volume;
      kwamiAudio.setVolume(0);
      updateVolumeUI(0);
    }
  });

  audioElement.addEventListener('timeupdate', updateTimeDisplay);
  audioElement.addEventListener('loadedmetadata', updateTimeDisplay);
  audioElement.addEventListener('play', updatePlayPauseState);
  audioElement.addEventListener('pause', updatePlayPauseState);
  audioElement.addEventListener('volumechange', () => {
    const volume = audioElement.volume;
    if (volume > 0) {
      audioPlayerState.lastVolume = volume;
    }
    updateVolumeUI(volume);
  });
  audioElement.addEventListener('error', (event) => {
    console.error('Audio element error:', event);
    showError('Audio playback error occurred.');
    updatePlayPauseState();
  });

  // No built-in music in pg by default.
  audioPlayerState.playlist = [];

  const updateNavigationButtons = () => {
    // Disable prev/next if playing custom track
    if (audioPlayerState.isCustomTrack) {
      prevButton.disabled = true;
      nextButton.disabled = true;
    } else {
      prevButton.disabled = audioPlayerState.currentIndex <= 0;
      nextButton.disabled = audioPlayerState.currentIndex >= audioPlayerState.playlist.length - 1;
    }
  };

  const loadCustomTrack = async (url: string, name?: string) => {
    try {
      kwamiAudio.loadAudioSource(url);
      audioPlayerState.isCustomTrack = true;
      setDisplayName(name || 'Custom Audio');
      updateNavigationButtons();
      updatePlayPauseState();
      updateStatus(`🎵 Loaded: ${name || 'Custom Audio'}`);
    } catch (error) {
      console.error('Failed to load custom track:', error);
      showError('Failed to load audio. Please try another file or URL.');
    }
  };

  // Autoplay-next handler: keep a stable reference so we can replace safely.
  if (endedHandlerRef) {
    audioElement.removeEventListener('ended', endedHandlerRef);
  }
  endedHandlerRef = () => {
    // If we're using an empty playlist, just rewind.
    kwamiAudio.setCurrentTime(0);
    updateTimeDisplay();
    updatePlayPauseState();
  };
  audioElement.addEventListener('ended', endedHandlerRef);

  // Upload button opens modal
  uploadButton.addEventListener('click', () => {
    openAudioLoaderModal();
  });

  // Initialize Audio Media Loader
  const audioMediaLoaderContainer = document.getElementById('audio-media-loader');
  if (audioMediaLoaderContainer && !audioMediaLoaderContainer.hasChildNodes()) {
    const audioMediaLoader = createMediaLoaderUI({
      type: 'audio',
      label: 'Audio Track',
      presets: [],
      showPresets: false,
      onLoad: (url) => {
        const filename = url.split('/').pop()?.split('?')[0] || 'Audio';
        const name = filename.length > 30 ? filename.substring(0, 27) + '...' : filename;
        loadCustomTrack(url, name);
        closeAudioLoaderModal();
      },
      onError: (error) => {
        showError(`Failed to load audio: ${error.message}`);
      },
    });
    audioMediaLoaderContainer.appendChild(audioMediaLoader);
  }

  const initialName = deriveNameFromSrc(audioElement.src);
  setDisplayName(initialName || 'No audio loaded');
  updateTimeDisplay();
  updatePlayPauseState();
  updateNavigationButtons();

  const sliderInitialValue = Number(volumeSlider.value ?? 80);
  let initialVolume = Math.max(0, Math.min(100, sliderInitialValue)) / 100;
  if (!Number.isFinite(initialVolume)) {
    initialVolume = 0.8;
  }

  kwamiAudio.setVolume(initialVolume);
  audioPlayerState.lastVolume = initialVolume;
  updateVolumeUI(initialVolume);

  audioPlayerState.initialized = true;
  console.log('[Audio Player] Audio player initialized');
}

// Window exports for inline HTML handlers
(window as any).openAudioLoaderModal = openAudioLoaderModal;
(window as any).closeAudioLoaderModal = closeAudioLoaderModal;
