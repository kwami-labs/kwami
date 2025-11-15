import { Kwami } from '../index.ts';
import { createMediaLoaderUI } from './media-loader-ui.js';

window.kwami = null;

// Sidebar management: Mind, Body, Soul rotating system
const sidebarState = {
  left: 'mind',  // Initially Mind is on the left
  right: 'body', // Initially Body is on the right
  hidden: 'soul' // Initially Soul is hidden
};

const sectionLabels = {
  mind: '🧠 Mind >',
  body: '🧬 Body >',
  soul: '✨ Soul >'
};

let menusCollapsed = false;

function applySidebarVisibility() {
  const leftSidebar = document.getElementById('left-sidebar');
  const rightSidebar = document.getElementById('right-sidebar');

  [leftSidebar, rightSidebar].forEach((sidebar) => {
    if (!sidebar) return;
    sidebar.classList.toggle('hidden', menusCollapsed);
    sidebar.setAttribute('aria-hidden', menusCollapsed ? 'true' : 'false');
  });
}

function updateMenuToggleButton() {
  const icon = document.getElementById('menu-toggle-icon');
  const toggleButton = document.getElementById('menu-toggle-btn');

  if (icon) {
    icon.textContent = menusCollapsed ? '☰' : '✕';
  }

  if (toggleButton) {
    toggleButton.setAttribute('aria-expanded', String(!menusCollapsed));
    toggleButton.setAttribute('aria-pressed', String(!menusCollapsed));
    toggleButton.setAttribute('title', menusCollapsed ? 'Show Sidebars' : 'Hide Sidebars');
  }
}

window.toggleMenus = function() {
  // Pause resize detection to prevent re-renders during transition
  window.kwami?.body?.pauseResizeDetection?.();
  
  // Toggle the collapsed state
  menusCollapsed = !menusCollapsed;
  applySidebarVisibility();
  updateMenuToggleButton();
  
  const duration = 300; // match CSS transition (0.3s)
  
  // After transition completes, resume resize detection
  setTimeout(() => {
    window.kwami?.body?.resumeResizeDetection?.();
  }, duration);
};

const audioPlayerState = {
  initialized: false,
  displayName: 'No audio loaded',
  lastVolume: 0.8,
  visible: false, // Start hidden
  playlist: [], // Array of audio tracks
  currentIndex: 0, // Current track index
  isCustomTrack: false // Whether current track is from upload/URL
};

// Build music playlist from assets
const MUSIC_PLAYLIST = [
  { name: 'Track 1', url: 'assets/aud/music/0.mp3' },
  { name: 'Track 2', url: 'assets/aud/music/1.mp3' },
  { name: 'Track 3', url: 'assets/aud/music/2.mp3' },
  { name: 'Track 4', url: 'assets/aud/music/3.mp3' },
  { name: 'Track 5', url: 'assets/aud/music/4.mp3' },
  { name: 'Track 6', url: 'assets/aud/music/5.mp3' },
  { name: 'Track 7', url: 'assets/aud/music/6.mp3' },
  { name: 'Track 8', url: 'assets/aud/music/7.mp3' },
  { name: 'Track 9', url: 'assets/aud/music/8.mp3' },
  { name: 'Track 10', url: 'assets/aud/music/9.mp3' },
  { name: 'Track 11', url: 'assets/aud/music/10.mp3' }
];

const githubStarState = {
  initialized: false,
  lastFetchedAt: 0,
};

function getKwamiAudio() {
  return window.kwami?.body?.audio;
}

function initializeAudioPlayer() {
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

  const setAudioPlayerVisibility = (visible) => {
    audioPlayerState.visible = visible;
    audioPlayerContainer.classList.toggle('hidden', !visible);
    toggleButton.classList.toggle('hidden', visible);

    if (toggleButton) {
      toggleButton.setAttribute('aria-expanded', String(visible));
      toggleButton.setAttribute('aria-pressed', String(visible));
      const label = visible ? 'Hide audio player' : 'Show audio player';
      toggleButton.setAttribute('aria-label', label);
      toggleButton.setAttribute('title', label);
    }
  };

  setAudioPlayerVisibility(audioPlayerState.visible);

  // Headphones button opens the player
  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      setAudioPlayerVisibility(true);
    });
  } else {
    console.warn('Audio toggle button missing; audio player visibility toggle unavailable');
  }

  // Close button (X) inside player closes it
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      setAudioPlayerVisibility(false);
    });
  } else {
    console.warn('Audio close button missing');
  }

  const uploadButton = document.getElementById('upload-audio-btn');
  const playPauseButton = document.getElementById('play-pause-btn');
  const prevButton = document.getElementById('prev-track-btn');
  const nextButton = document.getElementById('next-track-btn');
  const volumeSlider = document.getElementById('volume-slider');
  const volumeIcon = document.getElementById('volume-icon');
  const audioName = document.getElementById('audio-name');
  const audioTime = document.getElementById('audio-time');

  if (!uploadButton || !playPauseButton || !prevButton || !nextButton || !volumeSlider || !volumeIcon || !audioName || !audioTime) {
    console.warn('Audio player elements missing; skipping initialization');
    return;
  }

  const kwamiAudio = getKwamiAudio();
  const audioElement = kwamiAudio?.getAudioElement?.();

  if (!kwamiAudio || !audioElement) {
    console.warn('Kwami audio instance not available; skipping audio player initialization');
    return;
  }

  const deriveNameFromSrc = (src) => {
    if (!src) {
      return '';
    }

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
    } catch (error) {
      const sanitized = src.split('?')[0];
      const filename = sanitized.substring(sanitized.lastIndexOf('/') + 1);
      return filename || 'Audio Track';
    }
  };

  const setDisplayName = (name) => {
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

  const updateVolumeUI = (volume) => {
    const normalized = Math.max(0, Math.min(1, Number.isFinite(volume) ? volume : 0));
    volumeSlider.value = String(Math.round(normalized * 100));

    let icon = '🔊';
    if (normalized === 0) {
      icon = '🔇';
    } else if (normalized < 0.34) {
      icon = '🔈';
    } else if (normalized < 0.67) {
      icon = '🔉';
    }

    volumeIcon.textContent = icon;
  };

  // Upload button handler will be replaced below with modal opener

  playPauseButton.addEventListener('click', async () => {
    if (playPauseButton.disabled) {
      return;
    }

    try {
      await kwamiAudio.togglePlayPause();
    } catch (error) {
      console.error('Failed to toggle audio playback:', error);
      showError('Unable to play audio. Please check the file format.');
    }
  });

  volumeSlider.addEventListener('input', (event) => {
    const sliderValue = Number(event.target?.value ?? 80);
    const volume = Math.max(0, Math.min(100, sliderValue)) / 100;
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
  audioElement.addEventListener('ended', () => {
    kwamiAudio.setCurrentTime(0);
    updateTimeDisplay();
    updatePlayPauseState();
  });
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

  // Initialize playlist
  audioPlayerState.playlist = [...MUSIC_PLAYLIST];

  // Playlist navigation functions
  const loadTrack = async (index) => {
    if (index < 0 || index >= audioPlayerState.playlist.length) {
      return;
    }

    audioPlayerState.currentIndex = index;
    audioPlayerState.isCustomTrack = false;
    const track = audioPlayerState.playlist[index];

    try {
      await kwamiAudio.loadAudioFile(track.url);
      setDisplayName(track.name);
      updateNavigationButtons();
      updatePlayPauseState();
      console.log(`[Audio Player] Loaded: ${track.name}`);
    } catch (error) {
      console.error('Failed to load track:', error);
      setDisplayName('Error loading track');
      showError(`Failed to load ${track.name}`);
    }
  };

  const loadCustomTrack = async (url, name) => {
    try {
      await kwamiAudio.loadAudioFile(url);
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

  const updateNavigationButtons = () => {
    if (!prevButton || !nextButton) return;

    // Disable prev/next if playing custom track
    if (audioPlayerState.isCustomTrack) {
      prevButton.disabled = true;
      nextButton.disabled = true;
    } else {
      prevButton.disabled = audioPlayerState.currentIndex <= 0;
      nextButton.disabled = audioPlayerState.currentIndex >= audioPlayerState.playlist.length - 1;
    }
  };

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (audioPlayerState.currentIndex > 0) {
        loadTrack(audioPlayerState.currentIndex - 1);
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (audioPlayerState.currentIndex < audioPlayerState.playlist.length - 1) {
        loadTrack(audioPlayerState.currentIndex + 1);
      }
    });
  }

  // Auto-play next track when current ends (override previous ended handler)
  audioElement.removeEventListener('ended', audioElement._endedHandler);
  const endedHandler = () => {
    if (!audioPlayerState.isCustomTrack && audioPlayerState.currentIndex < audioPlayerState.playlist.length - 1) {
      loadTrack(audioPlayerState.currentIndex + 1);
      // Auto-play next track
      setTimeout(() => {
        kwamiAudio.play();
      }, 500);
    } else {
      kwamiAudio.setCurrentTime(0);
      updateTimeDisplay();
      updatePlayPauseState();
    }
  };
  audioElement._endedHandler = endedHandler;
  audioElement.addEventListener('ended', endedHandler);

  // Make upload button open modal
  uploadButton.removeAllListeners = () => {
    const clone = uploadButton.cloneNode(true);
    uploadButton.parentNode.replaceChild(clone, uploadButton);
    return clone;
  };
  const newUploadButton = uploadButton.removeAllListeners();
  newUploadButton.addEventListener('click', () => {
    openAudioLoaderModal();
  });

  // Initialize Audio Media Loader
  const audioMediaLoaderContainer = document.getElementById('audio-media-loader');
  if (audioMediaLoaderContainer && !audioMediaLoaderContainer.hasChildNodes()) {
    const audioMediaLoader = createMediaLoaderUI({
      type: 'audio',
      label: 'Audio Track',
      presets: [], // No presets for audio (using playlist instead)
      showPresets: false,
      onLoad: (url, source) => {
        const filename = url.split('/').pop().split('?')[0];
        const name = filename.length > 30 ? filename.substring(0, 27) + '...' : filename;
        loadCustomTrack(url, name);
        closeAudioLoaderModal();
      },
      onError: (error) => {
        showError(`Failed to load audio: ${error.message}`);
      }
    });
    audioMediaLoaderContainer.appendChild(audioMediaLoader);
  }

  // Load a random track on initialization
  const randomIndex = Math.floor(Math.random() * audioPlayerState.playlist.length);
  loadTrack(randomIndex);

  const initialName = deriveNameFromSrc(audioElement.src);
  setDisplayName(initialName || 'Loading playlist...');
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
  console.log('[Audio Player] Audio player initialized with playlist');
}

// Modal functions for audio loader
window.openAudioLoaderModal = function() {
  const modal = document.getElementById('audio-loader-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
};

window.closeAudioLoaderModal = function() {
  const modal = document.getElementById('audio-loader-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
};

async function fetchGitHubStars() {
  const now = Date.now();
  if (now - githubStarState.lastFetchedAt < 5 * 60 * 1000) {
    // Skip refetching within 5 minutes
    return;
  }

  const starCountElement = document.getElementById('star-count');
  if (!starCountElement) {
    console.warn('Star count element not found; skipping fetch');
    return;
  }

  starCountElement.textContent = '…';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch('https://api.github.com/repos/alexcolls/kwami', {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'kwami-playground',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`);
    }

    const data = await response.json();
    const stars = data?.stargazers_count;

    if (typeof stars === 'number' && Number.isFinite(stars)) {
      starCountElement.textContent = stars.toLocaleString();
      githubStarState.lastFetchedAt = now;
    } else {
      throw new Error('Invalid star count in response');
    }
  } catch (error) {
    console.warn('Failed to fetch GitHub stars:', error);
    starCountElement.textContent = 'N/A';
    starCountElement.title = 'Unable to fetch star count';
  } finally {
    clearTimeout(timeoutId);
  }
}

function initializeGitHubStarButton() {
  if (githubStarState.initialized) {
    return;
  }

  const starButton = document.getElementById('github-star-btn');
  const starCountElement = document.getElementById('star-count');

  if (!starButton || !starCountElement) {
    console.warn('GitHub star button elements missing; skipping initialization');
    return;
  }

  starButton.addEventListener('mouseenter', fetchGitHubStars, { once: true });
  starButton.addEventListener('focus', fetchGitHubStars, { once: true });
  fetchGitHubStars().catch(() => {
    // Errors handled inside fetchGitHubStars
  });

  githubStarState.initialized = true;
}

// Theme management
const themeState = {
  initialized: false,
  current: 'light'
};

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    themeState.current = 'dark';
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
      icon.textContent = '☀️';
    }
  } else {
    document.body.classList.remove('dark-mode');
    themeState.current = 'light';
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
      icon.textContent = '🌙';
    }
  }
  
  // Save preference to localStorage
  try {
    localStorage.setItem('kwami-theme', theme);
  } catch (error) {
    console.warn('Failed to save theme preference:', error);
  }
}

function toggleTheme() {
  const newTheme = themeState.current === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

function initializeThemeToggle() {
  if (themeState.initialized) {
    return;
  }

  const themeToggleButton = document.getElementById('theme-toggle-btn');
  if (!themeToggleButton) {
    console.warn('Theme toggle button not found; skipping initialization');
    return;
  }

  // Load saved theme preference or detect system preference
  let savedTheme = 'light';
  try {
    savedTheme = localStorage.getItem('kwami-theme');
  } catch (error) {
    console.warn('Failed to load theme preference:', error);
  }

  // If no saved theme, check system preference
  if (!savedTheme) {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    savedTheme = prefersDark ? 'dark' : 'light';
  }

  // Apply the initial theme
  applyTheme(savedTheme);

  // Add click listener
  themeToggleButton.addEventListener('click', toggleTheme);

  // Listen for system theme changes
  if (window.matchMedia) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      try {
        const hasSavedPreference = localStorage.getItem('kwami-theme');
        if (!hasSavedPreference) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      } catch (error) {
        // Ignore localStorage errors
      }
    });
  }

  themeState.initialized = true;
}

// Initialize sidebars
function initializeSidebars() {
  renderSidebar('left', sidebarState.left);
  renderSidebar('right', sidebarState.right);
  updateSwapButtons();
}

// Render a section into a sidebar
function renderSidebar(side, section) {
  const template = document.getElementById(`${section}-template`);
  const content = template.content.cloneNode(true);
  const container = document.getElementById(`${side}-content`);
  
  // Clear existing content
  container.innerHTML = '';
  
  // Append new content
  container.appendChild(content);
  
  // Re-initialize event listeners for the new content if needed
  if (side === 'left' && section === 'mind') {
    // Mind section specific initialization will happen after Kwami is created
  }
  if (side === 'right' && section === 'body') {
    // Body section specific initialization will happen after Kwami is created
  }
}

// Swap left sidebar
window.swapLeftSidebar = function() {
  // Current: left shows X, right shows Y, hidden is Z
  // After: left shows Z (hidden), right shows Y (same), hidden is X (was left)
  const newLeft = sidebarState.hidden;
  const newHidden = sidebarState.left;
  
  sidebarState.left = newLeft;
  sidebarState.hidden = newHidden;
  
  renderSidebar('left', sidebarState.left);
  updateSwapButtons();
  
  // Re-initialize controls if needed
  setTimeout(() => {
    if (window.kwami) {
      if (sidebarState.left === 'body') {
        initializeBodyControls();
        initializeBackgroundControls();
        initializeCameraControls();
      } else if (sidebarState.left === 'soul') {
        initializeSoulControls();
      } else if (sidebarState.left === 'mind') {
        initializeMindControls();
      }
    }
  }, 100);
};

// Swap right sidebar
window.swapRightSidebar = function() {
  // Current: left shows X, right shows Y, hidden is Z
  // After: left shows X (same), right shows Z (hidden), hidden is Y (was right)
  const newRight = sidebarState.hidden;
  const newHidden = sidebarState.right;
  
  sidebarState.right = newRight;
  sidebarState.hidden = newHidden;
  
  renderSidebar('right', sidebarState.right);
  updateSwapButtons();
  
  // Re-initialize controls if needed
  setTimeout(() => {
    if (window.kwami) {
      if (sidebarState.right === 'body') {
        initializeBodyControls();
        initializeBackgroundControls();
        initializeCameraControls();
      } else if (sidebarState.right === 'soul') {
        initializeSoulControls();
      } else if (sidebarState.right === 'mind') {
        initializeMindControls();
      }
    }
  }, 100);
};

// Update swap button labels
function updateSwapButtons() {
  const leftBtn = document.getElementById('left-swap-text');
  const rightBtn = document.getElementById('right-swap-text');
  
  if (leftBtn) {
    leftBtn.textContent = `${sectionLabels[sidebarState.hidden]}`;
  }
  if (rightBtn) {
    rightBtn.textContent = `${sectionLabels[sidebarState.hidden]}`;
  }
}

// Initialize Soul controls with current values
function initializeSoulControls() {
  if (!window.kwami || !window.kwami.soul) return;
  
  const nameInput = document.getElementById('soul-name');
  const personalityInput = document.getElementById('soul-personality');
  const systemPromptInput = document.getElementById('soul-system-prompt');
  const nameDisplay = document.getElementById('personality-name');
  
  // Populate with current values
  if (nameInput && window.kwami.soul.config.name) {
    nameInput.value = window.kwami.soul.config.name;
  }
  if (personalityInput && window.kwami.soul.config.personality) {
    personalityInput.value = window.kwami.soul.config.personality;
  }
  if (systemPromptInput && window.kwami.soul.config.systemPrompt) {
    systemPromptInput.value = window.kwami.soul.config.systemPrompt;
  }
  if (nameDisplay && window.kwami.soul.config.name) {
    nameDisplay.textContent = window.kwami.soul.config.name;
  }
}

// Soul configuration function
// Auto-update Soul configuration as user types (debounced)
let soulUpdateTimeout;
window.autoUpdateSoul = function() {
  clearTimeout(soulUpdateTimeout);
  soulUpdateTimeout = setTimeout(() => {
    if (!window.kwami || !window.kwami.soul) return;
    
    const name = document.getElementById('soul-name')?.value || 'Kwami';
    const personality = document.getElementById('soul-personality')?.value || '';
    const systemPrompt = document.getElementById('soul-system-prompt')?.value || '';
    
    window.kwami.soul.updateConfig({
      name,
      personality,
      systemPrompt
    });
    
    // Update display
    const nameDisplay = document.getElementById('personality-name');
    if (nameDisplay) nameDisplay.textContent = name;
  }, 300);
};

// Default values for body parameters
const DEFAULT_VALUES = {
  spikes: { x: 0.2, y: 0.2, z: 0.2 },
  time: { x: 1, y: 1, z: 1 },
  rotation: { x: 0, y: 0, z: 0 },
  colors: { x: '#ff0066', y: '#00ff66', z: '#6600ff' },
  scale: 4.0,
  resolution: 180,
  shininess: 50,
  wireframe: false,
  skin: 'tricolor',
  opacity: 1,
};

const SKIN_COLLECTION_NAME = '3Colors';

const SKIN_NAME_ALIASES = {
  tricolor: 'tricolor',
  tricolor2: 'tricolor2',
  zebra: 'zebra',
  donut: 'tricolor2',
  poles: 'tricolor',
  vintage: 'zebra',
  '3colors': 'tricolor',
  '3colors-poles': 'tricolor',
  '3colors-donut': 'tricolor2',
  '3colors-vintage': 'zebra',
};

const SKIN_VARIANT_LABELS = {
  tricolor: 'Poles',
  tricolor2: 'Donut',
  zebra: 'Vintage',
};

const SKIN_RANDOMIZATION_TEMPLATE = [
  'tricolor2',
  'tricolor2',
  'tricolor2',
  'tricolor2',
  'tricolor2',
  'tricolor',
  'tricolor',
  'tricolor',
  'tricolor',
  'zebra',
];

let skinRandomizationQueue = [];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function refillSkinRandomizationQueue() {
  skinRandomizationQueue = shuffleArray([...SKIN_RANDOMIZATION_TEMPLATE]);
}

function getCanonicalSkinName(rawSkin) {
  if (!rawSkin) {
    return 'tricolor';
  }

  const key = String(rawSkin).toLowerCase();
  return SKIN_NAME_ALIASES[key] || 'tricolor';
}

function getSkinDisplayName(rawSkin) {
  const canonical = getCanonicalSkinName(rawSkin);
  const variantLabel = SKIN_VARIANT_LABELS[canonical] || canonical;
  return `${SKIN_COLLECTION_NAME} - ${variantLabel}`;
}

function applySkinToBlob(rawSkin) {
  const canonical = getCanonicalSkinName(rawSkin);
  const blob = window.kwami?.body?.blob;
  if (!blob) {
    return null;
  }

  blob.setSkin(canonical);

  const skinSelect = document.getElementById('skin-type');
  if (skinSelect) {
    skinSelect.value = canonical;
  }

  return canonical;
}

function getNextRandomizedSkin() {
  if (skinRandomizationQueue.length === 0) {
    refillSkinRandomizationQueue();
  }

  return skinRandomizationQueue.shift() || 'tricolor';
}

refillSkinRandomizationQueue();

// Default background settings
const DEFAULT_BACKGROUND = {
  colors: ['#667eea', '#764ba2', '#f093fb'],
  opacity: 1.0,
  angle: 90,
  stops: [0, 0.5, 1],
  style: 'linear',
};

const BACKGROUND_IMAGES = [
  'playground/assets/img/bg/alaska.jpeg',
  'playground/assets/img/bg/binary-reality.jpg',
  'playground/assets/img/bg/black-candle.jpg',
  'playground/assets/img/bg/black-hole.jpg',
  'playground/assets/img/bg/black-sea.jpg',
  'playground/assets/img/bg/black-windows.jpg',
  'playground/assets/img/bg/black.jpg',
  'playground/assets/img/bg/colors.jpeg',
  'playground/assets/img/bg/galaxy.jpg',
  'playground/assets/img/bg/galaxy2.jpg',
  'playground/assets/img/bg/galaxy3.jpg',
  'playground/assets/img/bg/galaxy4.jpg',
  'playground/assets/img/bg/gargantua.jpg',
  'playground/assets/img/bg/interstellar.png',
  'playground/assets/img/bg/islan.jpg',
  'playground/assets/img/bg/lake.jpg',
  'playground/assets/img/bg/mountain.jpeg',
  'playground/assets/img/bg/paisaje.jpg',
  'playground/assets/img/bg/pik.jpg',
  'playground/assets/img/bg/planet.jpg',
  'playground/assets/img/bg/planet2.jpg',
  'playground/assets/img/bg/planet3.jpg',
  'playground/assets/img/bg/sahara.jpeg',
  'playground/assets/img/bg/skinet.png',
  'playground/assets/img/bg/skynet.png',
  'playground/assets/img/bg/universe.jpg',
  'playground/assets/img/bg/white-tree.jpg'
];

const imageModules = import.meta.glob('../playground/assets/img/bg/*', {
  query: '?url',
  import: 'default',
  eager: true,
});
const videoModules = import.meta.glob('../playground/assets/vid/bg/*', {
  query: '?url',
  import: 'default',
  eager: true,
});

function buildAssetMap(modules) {
  const map = {};
  Object.entries(modules).forEach(([path, url]) => {
    const normalized = path.replace(/^\.\.\//, '');
    const filename = normalized.split('/').pop();
    map[path] = url;
    map[normalized] = url;
    if (filename) {
      map[filename] = url;
    }
  });
  return map;
}

const IMAGE_ASSET_MAP = buildAssetMap(imageModules);
const VIDEO_ASSET_MAP = buildAssetMap(videoModules);

// Counter for background randomization clicks
let backgroundRandomizeClickCount = 0;

// Remember previous blob opacity when enabling glass (to restore on disable)
let prevBlobOpacityForGlass = null;
let currentBackgroundImage = '';
let currentBackgroundVideo = '';
let currentMediaType = 'none';
let gradientOverlayOptIn = false;

// Default camera position
const DEFAULT_CAMERA_POSITION = {
  x: -0.9,
  y: 7.3,
  z: -1.8
};

// ============================================================================
// Background Functions (defined early for initialization)
// ============================================================================

function randomizeGradientLayout({ updateInputs = false } = {}) {
  const angle = Math.floor(Math.random() * 361);
  const stop1Percent = Math.floor(Math.random() * 81) + 10;
  const stop2PercentRaw = Math.floor(Math.random() * (101 - stop1Percent)) + stop1Percent;
  const stop2Percent = Math.min(stop2PercentRaw, 100);

  if (updateInputs) {
    const angleSlider = document.getElementById('bg-gradient-angle');
    if (angleSlider) angleSlider.value = String(angle);
    updateValueDisplay('bg-gradient-angle-value', angle, 0);

    const stop1Slider = document.getElementById('bg-gradient-stop1');
    if (stop1Slider) stop1Slider.value = String(stop1Percent);
    updateValueDisplay('bg-gradient-stop1-value', stop1Percent, 0);

    const stop2Slider = document.getElementById('bg-gradient-stop2');
    if (stop2Slider) stop2Slider.value = String(stop2Percent);
    updateValueDisplay('bg-gradient-stop2-value', stop2Percent, 0);
  }

  return {
    angle,
    stop1Percent,
    stop2Percent,
    stops: [0, stop1Percent / 100, stop2Percent / 100],
  };
}

function resolveAsset(map, rawValue) {
  if (!rawValue) return null;

  const variants = [rawValue];
  variants.push(rawValue.replace(/^\.\/+/, ''));
  variants.push(rawValue.replace(/^\/+/, ''));
  variants.push(rawValue.replace(/^\.\.\//, ''));

  const filename = rawValue.split('/').pop();
  if (filename) {
    variants.push(filename);
  }

  for (const candidate of variants) {
    if (map[candidate]) {
      return map[candidate];
    }
  }

  return null;
}

function resolveMediaPath(value) {
  if (!value) return '';
  if (/^(https?:)?\/\//i.test(value)) {
    return value;
  }

  const imageAsset = resolveAsset(IMAGE_ASSET_MAP, value);
  if (imageAsset) return imageAsset;

  const videoAsset = resolveAsset(VIDEO_ASSET_MAP, value);
  if (videoAsset) return videoAsset;

  return value;
}

function getMediaOptions(type) {
  if (type === 'video') {
    return VIDEO_PRESETS.map(preset => preset.value);
  } else {
    return IMAGE_PRESETS.map(preset => preset.value);
  }
}

function updateMediaTabs(activeType) {
  const tabs = document.querySelectorAll('#bg-media-tabs .media-tab');
  tabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.media === activeType);
  });
}

function showMediaControls(activeType) {
  const imageControls = document.getElementById('media-image-controls');
  const videoControls = document.getElementById('media-video-controls');
  if (imageControls) imageControls.style.display = activeType === 'image' ? 'block' : 'none';
  if (videoControls) videoControls.style.display = activeType === 'video' ? 'block' : 'none';
}

function getBackgroundElements() {
  return {
    mediaContainer: document.getElementById('background-media'),
    videoElement: document.getElementById('background-media-video'),
    gradientElement: document.getElementById('background-gradient'),
  };
}

function syncGradientOverlayState() {
  const body = window.kwami?.body;
  if (!body || typeof body.setGradientOverlayEnabled !== 'function') {
    return;
  }
  const wantsOverlay = gradientOverlayOptIn && currentMediaType !== 'none';
  body.setGradientOverlayEnabled(wantsOverlay);
}

function generateRandomSpheresTexture(colors) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  ctx.fillStyle = colors[0];
  ctx.globalAlpha = 0.35;
  ctx.fillRect(0, 0, 512, 512);
  ctx.globalAlpha = 1;

  for (let i = 0; i < 3; i++) {
    const color = colors[i % colors.length];
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const radius = 150 + Math.random() * 200;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.45, `${color}90`);
    gradient.addColorStop(1, `${color}00`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
  }

  return canvas.toDataURL('image/png');
}

function updateGradientOverlay({ colors, stops, angle, style, opacity }) {
  const { gradientElement } = getBackgroundElements();
  if (!gradientElement) return;

  if (!colors || opacity <= 0) {
    gradientElement.style.opacity = '0';
    gradientElement.style.backgroundImage = 'none';
    gradientElement.style.display = 'none';
    return;
  }

  let backgroundImage = '';
  const percentStops = Array.isArray(stops)
    ? stops.map((stop, index) => {
        if (!Number.isFinite(stop)) {
          return index === 0 ? 0 : index === 1 ? 50 : 100;
        }
        return Math.round(Math.max(0, Math.min(1, stop)) * 100);
      })
    : [0, 50, 100];

  if (style === 'random') {
    const dataUrl = generateRandomSpheresTexture(colors);
    if (dataUrl) {
      backgroundImage = `url(${dataUrl})`;
    } else {
      backgroundImage = `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`;
    }
  } else if (style === 'radial') {
    backgroundImage = `radial-gradient(circle, ${colors[0]} ${percentStops[0]}%, ${colors[1]} ${percentStops[1]}%, ${colors[2]} ${percentStops[2]}%)`;
  } else {
    backgroundImage = `linear-gradient(${angle}deg, ${colors[0]} ${percentStops[0]}%, ${colors[1]} ${percentStops[1]}%, ${colors[2]} ${percentStops[2]}%)`;
  }

  gradientElement.style.backgroundImage = backgroundImage;
  gradientElement.style.opacity = `${opacity}`;
  gradientElement.style.display = 'block';
}

function setBackgroundImage(imageValue, { silent = false } = {}) {
  const resolved = imageValue ? resolveMediaPath(imageValue) : '';

  if (window.kwami && window.kwami.body) {
    // Hide DOM overlays; use Three.js planes
    const { mediaContainer, gradientElement } = getBackgroundElements();
    if (mediaContainer) mediaContainer.style.display = 'none';
    if (gradientElement) gradientElement.style.display = 'none';

    if (resolved) {
      window.kwami.body.setBackgroundImage(resolved, { opacity: 1 });
      currentBackgroundImage = imageValue || '';
      currentBackgroundVideo = '';
      if (!silent) updateStatus('🖼️ Background image applied!');
    } else {
      window.kwami.body.clearBackgroundMedia();
      currentBackgroundImage = '';
      if (!silent) updateStatus('Background image removed');
    }
  }
}

function setBackgroundVideo(videoValue, { silent = false } = {}) {
  const resolved = videoValue ? resolveMediaPath(videoValue) : '';

  if (window.kwami && window.kwami.body) {
    const { mediaContainer, gradientElement } = getBackgroundElements();
    if (mediaContainer) mediaContainer.style.display = 'none';
    if (gradientElement) gradientElement.style.display = 'none';

    if (resolved) {
      window.kwami.body.setBackgroundVideo(resolved, { opacity: 1, autoplay: true, loop: true, muted: true });
      currentBackgroundVideo = videoValue || '';
      currentBackgroundImage = '';
      if (!silent) updateStatus('🎞️ Background video applied!');
    } else {
      window.kwami.body.clearBackgroundMedia();
      currentBackgroundVideo = '';
      if (!silent) updateStatus('Background video removed');
    }
  }
}

function setMediaType(type, { silent = false } = {}) {
  currentMediaType = type;
  updateMediaTabs(type);
  showMediaControls(type);

  if (type === 'none') {
    const imageSelect = document.getElementById('bg-media-image');
    if (imageSelect) imageSelect.value = '';
    const videoSelect = document.getElementById('bg-media-video');
    if (videoSelect) videoSelect.value = '';
    setBackgroundVideo('', { silent: true });
    setBackgroundImage('', { silent: true });
    if (!silent) updateStatus('🧹 Background media cleared');
  } else if (type === 'image') {
    const videoSelect = document.getElementById('bg-media-video');
    if (videoSelect) videoSelect.value = '';
    setBackgroundVideo('', { silent: true });
    const imageSelect = document.getElementById('bg-media-image');
    const selected = imageSelect?.value;
    if (selected) {
      setBackgroundImage(selected, { silent: true });
    } else {
      setBackgroundImage('', { silent: true });
    }
  } else if (type === 'video') {
    const imageSelect = document.getElementById('bg-media-image');
    if (imageSelect) imageSelect.value = '';
    setBackgroundImage('', { silent: true });
    const videoSelect = document.getElementById('bg-media-video');
    const selected = videoSelect?.value;
    if (selected) {
      setBackgroundVideo(selected, { silent: true });
    } else {
      setBackgroundVideo('', { silent: true });
    }
  }

  syncGradientOverlayState();
}

window.randomizeGradientColors = function() {
  // Generate random colors only
  const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const colors = [randomColor(), randomColor(), randomColor()];

  // Update color pickers in UI
  const c1 = document.getElementById('bg-color-1'); if (c1) c1.value = colors[0];
  const c2 = document.getElementById('bg-color-2'); if (c2) c2.value = colors[1];
  const c3 = document.getElementById('bg-color-3'); if (c3) c3.value = colors[2];

  // Apply the new colors
  applyBackground();

  updateStatus('🎨 Gradient colors randomized!');
};

window.randomizePaletteColors = function() {
  // Generate random colors for palette only
  const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const colors = [randomColor(), randomColor(), randomColor()];

  // Update color pickers in UI
  const colorX = document.getElementById('color-x');
  const colorY = document.getElementById('color-y');
  const colorZ = document.getElementById('color-z');

  if (colorX) {
    colorX.value = colors[0];
    colorX.dispatchEvent(new Event('input', { bubbles: true }));
  }
  if (colorY) {
    colorY.value = colors[1];
    colorY.dispatchEvent(new Event('input', { bubbles: true }));
  }
  if (colorZ) {
    colorZ.value = colors[2];
    colorZ.dispatchEvent(new Event('input', { bubbles: true }));
  }

  updateStatus('🎨 Palette colors randomized!');
};

window.randomizeBackground = function() {
  // Generate random colors
  const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const colors = [randomColor(), randomColor(), randomColor()];

  backgroundRandomizeClickCount++;

  // Update color pickers in UI
  const c1 = document.getElementById('bg-color-1'); if (c1) c1.value = colors[0];
  const c2 = document.getElementById('bg-color-2'); if (c2) c2.value = colors[1];
  const c3 = document.getElementById('bg-color-3'); if (c3) c3.value = colors[2];

  // Randomize gradient layout and write values to inputs
  const layout = randomizeGradientLayout({ updateInputs: true });

  // Choose between linear or radial (omit unsupported 'random' style here)
  const styles = ['linear', 'radial'];
  const selectedStyle = styles[Math.floor(Math.random() * styles.length)];

  // Update the gradient style selector in UI
  const gradientStyleSelect = document.getElementById('bg-gradient-style');
  if (gradientStyleSelect) {
    gradientStyleSelect.value = selectedStyle;
  }

  // Randomly adjust opacity every 3rd click
  let opacityStr;
  if (backgroundRandomizeClickCount % 3 === 0) {
    opacityStr = (Math.random() * 0.6 + 0.3).toFixed(2);
  } else {
    opacityStr = '1.00';
  }

  const opacitySlider = document.getElementById('bg-opacity');
  if (opacitySlider) opacitySlider.value = opacityStr;
  updateValueDisplay('bg-opacity-value', opacityStr, 2);

  // Apply using the same pathway as manual controls (ensures DOM overlay/scene sync)
  applyBackground();

  updateStatus(`🎲 ${selectedStyle === 'radial' ? 'Radial' : 'Linear'} gradient randomized!`);
};

window.randomizeMediaSelection = function(type) {
  const options = getMediaOptions(type);
  if (!options.length) {
    updateStatus(type === 'image'
      ? '⚠️ Add image assets to randomize the background.'
      : '⚠️ Add video sources to randomize the background.');
    return;
  }

  const value = options[Math.floor(Math.random() * options.length)];

  if (type === 'image') {
    setMediaType('image');
    setBackgroundImage(value);
  } else {
    setMediaType('video');
    setBackgroundVideo(value);
  }
};

window.clearMediaSelection = function(type) {
  if (type === 'image') {
    setBackgroundImage('');
  } else if (type === 'video') {
    setBackgroundVideo('');
  }
  setMediaType('none');
};

window.uploadMediaFile = function(type) {
  // Create file input element
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = type === 'image' ? 'image/*' : 'video/*';
  
  input.onchange = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    const isValidType = type === 'image' 
      ? file.type.startsWith('image/')
      : file.type.startsWith('video/');
    
    if (!isValidType) {
      updateStatus(`⚠️ Please select a valid ${type} file.`);
      return;
    }
    
    // Create object URL for the file
    const fileURL = URL.createObjectURL(file);
    
    // Apply the uploaded file
    if (type === 'image') {
      const imageSelect = document.getElementById('bg-media-image');
      if (imageSelect) imageSelect.value = '';
      setMediaType('image');
      setBackgroundImage(fileURL);
      updateStatus(`🖼️ Uploaded image applied: ${file.name}`);
    } else if (type === 'video') {
      const videoSelect = document.getElementById('bg-media-video');
      if (videoSelect) videoSelect.value = '';
      setMediaType('video');
      setBackgroundVideo(fileURL);
      updateStatus(`🎥 Uploaded video applied: ${file.name}`);
    }
  };
  
  // Trigger file picker
  input.click();
};

// Blob Texture Functions (independent from background)
let currentBlobMediaType = 'none';

function getBlobMediaOptions(type) {
  if (type === 'video') {
    return VIDEO_PRESETS.map(preset => preset.value);
  } else {
    return IMAGE_PRESETS.map(preset => preset.value);
  }
}

function updateBlobMediaTabs(activeType) {
  const tabs = document.querySelectorAll('#blob-media-tabs .media-tab');
  tabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.media === activeType);
  });
}

function showBlobMediaControls(activeType) {
  const imageControls = document.getElementById('blob-media-image-controls');
  const videoControls = document.getElementById('blob-media-video-controls');
  if (imageControls) imageControls.style.display = activeType === 'image' ? 'block' : 'none';
  if (videoControls) videoControls.style.display = activeType === 'video' ? 'block' : 'none';
}

function setBlobMediaType(type) {
  currentBlobMediaType = type;
  updateBlobMediaTabs(type);
  showBlobMediaControls(type);

  if (type === 'none') {
    const imageSelect = document.getElementById('blob-media-image');
    if (imageSelect) imageSelect.value = '';
    const videoSelect = document.getElementById('blob-media-video');
    if (videoSelect) videoSelect.value = '';
    // TODO: Clear blob texture when implemented in core
    updateStatus('🧽 Blob texture cleared');
    return;
  }
}

window.randomizeBlobMedia = function(type) {
  const options = getBlobMediaOptions(type);
  if (!options.length) {
    updateStatus(type === 'image'
      ? '⚠️ No image options available for blob texture.'
      : '⚠️ No video options available for blob texture.');
    return;
  }

  const value = options[Math.floor(Math.random() * options.length)];
  const resolved = resolveMediaPath(value);

  if (type === 'image') {
    setBlobMediaType('image');
    window.kwami?.body?.setBlobSurfaceImage(resolved);
    updateStatus(`🖼️ Blob texture: ${value.split('/').pop()}`);
  } else {
    setBlobMediaType('video');
    window.kwami?.body?.setBlobSurfaceVideo(resolved, { autoplay: true, loop: true, muted: true });
    updateStatus(`🎥 Blob video texture: ${value.split('/').pop()}`);
  }
};

window.clearBlobMedia = function(type) {
  setBlobMediaType('none');
  window.kwami?.body?.clearBlobSurfaceMedia?.();
};

// Randomize 3D Texture (blob surface)
window.randomize3DTexture = function() {
  if (!window.kwami || !window.kwami.body) {
    showError('Kwami not initialized yet!');
    return;
  }

  // Gather all available blob texture options
  const imageOptions = getBlobMediaOptions('image');
  const videoOptions = getBlobMediaOptions('video');

  // Resolve paths
  const imageUrls = imageOptions.map(option => resolveMediaPath(option)).filter(url => url);
  const videoUrls = videoOptions.map(option => resolveMediaPath(option)).filter(url => url);

  if (imageUrls.length === 0 && videoUrls.length === 0) {
    updateStatus('⚠️ No texture options available. Add images or videos to blob texture section.');
    return;
  }

  // Call core library method
  const result = window.kwami.body.randomize3DTexture(imageUrls, videoUrls);

  // Update UI based on result
  if (result.type === 'image') {
    setBlobMediaType('image');
    const filename = result.url ? result.url.split('/').pop() : 'texture';
    updateStatus(`🎲 Random 3D texture applied: ${filename}`);
  } else if (result.type === 'video') {
    setBlobMediaType('video');
    const filename = result.url ? result.url.split('/').pop() : 'texture';
    updateStatus(`🎲 Random 3D video texture applied: ${filename}`);
  } else {
    setBlobMediaType('none');
    updateStatus('🧹 Blob texture cleared');
  }
};

// Randomize Background with Glass Effect
window.randomizeBackgroundWithGlass = function() {
  if (!window.kwami || !window.kwami.body) {
    showError('Kwami not initialized yet!');
    return;
  }

  // Gather all available background media options
  const imageOptions = getMediaOptions('image');
  const videoOptions = getMediaOptions('video');

  // Resolve paths
  const imageUrls = imageOptions.map(option => resolveMediaPath(option)).filter(url => url);
  const videoUrls = videoOptions.map(option => resolveMediaPath(option)).filter(url => url);

  // Call core library method
  const result = window.kwami.body.randomizeBackgroundWithGlass(imageUrls, videoUrls);

  // Update UI based on result
  if (result.backgroundType === 'image') {
    setMediaType('image', { silent: true });
    const filename = result.backgroundUrl ? result.backgroundUrl.split('/').pop() : 'image';
    updateStatus(`🪟 Glass effect with ${filename} (opacity: ${(result.opacity * 100).toFixed(0)}%)`);
  } else if (result.backgroundType === 'video') {
    setMediaType('video', { silent: true });
    const filename = result.backgroundUrl ? result.backgroundUrl.split('/').pop() : 'video';
    updateStatus(`🪟 Glass effect with ${filename} (opacity: ${(result.opacity * 100).toFixed(0)}%)`);
  } else {
    // No media, just gradient with glass
    setMediaType('none', { silent: true });
    updateStatus(`🪟 Glass effect with random gradient (opacity: ${(result.opacity * 100).toFixed(0)}%)`);
  }

  // Update glass transparency checkbox
  const glassCheckbox = document.getElementById('blob-image-transparency');
  if (glassCheckbox) glassCheckbox.checked = true;

  // Update blob opacity slider
  const opacitySlider = document.getElementById('blob-opacity');
  if (opacitySlider) opacitySlider.value = result.opacity.toFixed(2);
  updateValueDisplay('blob-opacity-value', result.opacity, 2);
};

function applyBackground({ skipGradientOverlayOptIn = false } = {}) {
  const gradientEnabled = document.getElementById('bg-gradient-enabled')?.checked ?? true;
  const opacity = parseFloat(document.getElementById('bg-opacity')?.value ?? DEFAULT_BACKGROUND.opacity);

  const colors = [
    document.getElementById('bg-color-1')?.value ?? DEFAULT_BACKGROUND.colors[0],
    document.getElementById('bg-color-2')?.value ?? DEFAULT_BACKGROUND.colors[1],
    document.getElementById('bg-color-3')?.value ?? DEFAULT_BACKGROUND.colors[2],
  ];

  const angleDegrees = parseFloat(document.getElementById('bg-gradient-angle')?.value ?? DEFAULT_BACKGROUND.angle);
  const stop1PercentRaw = parseFloat(document.getElementById('bg-gradient-stop1')?.value ?? DEFAULT_BACKGROUND.stops[1] * 100);
  const stop2PercentRaw = parseFloat(document.getElementById('bg-gradient-stop2')?.value ?? DEFAULT_BACKGROUND.stops[2] * 100);

  const stop1Percent = Math.max(0, Math.min(100, Number.isFinite(stop1PercentRaw) ? stop1PercentRaw : DEFAULT_BACKGROUND.stops[1] * 100));
  const stop2Percent = Math.max(stop1Percent, Math.min(100, Number.isFinite(stop2PercentRaw) ? stop2PercentRaw : DEFAULT_BACKGROUND.stops[2] * 100));
  const percentStops = [0, stop1Percent, stop2Percent];
  const normalizedStops = percentStops.map((stop) => Math.max(0, Math.min(100, stop)) / 100);

  const gradientStyle = document.getElementById('bg-gradient-style')?.value ?? DEFAULT_BACKGROUND.style;

  if (!skipGradientOverlayOptIn) {
    gradientOverlayOptIn = true;
  }

  const body = window.kwami?.body;
  if (body) {
    syncGradientOverlayState();

    if (!gradientEnabled) {
      // Gradient disabled - hide it
      body.setBackgroundOpacity(0);
      const { gradientElement } = getBackgroundElements();
      if (gradientElement) {
        gradientElement.style.display = 'none';
      }
      return;
    }

    if (gradientStyle === 'random') {
      body.setBackgroundSpheres(colors);
      body.setBackgroundOpacity(opacity);
    } else {
      const gradientOptions = {
        stops: normalizedStops,
        opacity,
      };
      if (gradientStyle === 'radial') {
        gradientOptions.direction = 'radial';
      } else {
        gradientOptions.angle = angleDegrees;
      }
      body.setBackgroundGradient(colors, gradientOptions);
    }

    const { gradientElement } = getBackgroundElements();
    if (gradientElement) {
      gradientElement.style.display = 'none';
    }
    return;
  }

  const { gradientElement, mediaContainer } = getBackgroundElements();
  if (mediaContainer) mediaContainer.style.display = 'none';
  if (gradientElement) {
    if (!gradientEnabled) {
      // Gradient disabled - hide it
      gradientElement.style.display = 'none';
      gradientElement.style.opacity = '0';
      gradientElement.style.backgroundImage = 'none';
      return;
    }

    let backgroundImage = '';

    if (gradientStyle === 'radial') {
      backgroundImage = `radial-gradient(circle, ${colors[0]} ${percentStops[0]}%, ${colors[1]} ${percentStops[1]}%, ${colors[2]} ${percentStops[2]}%)`;
    } else {
      backgroundImage = `linear-gradient(${angleDegrees}deg, ${colors[0]} ${percentStops[0]}%, ${colors[1]} ${percentStops[1]}%, ${colors[2]} ${percentStops[2]}%)`;
    }

    gradientElement.style.backgroundImage = backgroundImage;
    gradientElement.style.opacity = `${opacity}`;
    gradientElement.style.display = 'block';
  }
}

window.resetBackground = function() {

  const colorInputs = [
    document.getElementById('bg-color-1'),
    document.getElementById('bg-color-2'),
    document.getElementById('bg-color-3'),
  ];
  colorInputs.forEach((input, index) => {
    if (input) input.value = DEFAULT_BACKGROUND.colors[index];
  });

  const angleSlider = document.getElementById('bg-gradient-angle');
  if (angleSlider) angleSlider.value = String(DEFAULT_BACKGROUND.angle);
  updateValueDisplay('bg-gradient-angle-value', DEFAULT_BACKGROUND.angle, 0);

  const stop1Slider = document.getElementById('bg-gradient-stop1');
  if (stop1Slider) stop1Slider.value = String(DEFAULT_BACKGROUND.stops[1] * 100);
  updateValueDisplay('bg-gradient-stop1-value', DEFAULT_BACKGROUND.stops[1] * 100, 0);

  const stop2Slider = document.getElementById('bg-gradient-stop2');
  if (stop2Slider) stop2Slider.value = String(DEFAULT_BACKGROUND.stops[2] * 100);
  updateValueDisplay('bg-gradient-stop2-value', DEFAULT_BACKGROUND.stops[2] * 100, 0);

  const gradientStyleSelect = document.getElementById('bg-gradient-style');
  if (gradientStyleSelect) gradientStyleSelect.value = DEFAULT_BACKGROUND.style;

  const opacitySlider = document.getElementById('bg-opacity');
  if (opacitySlider) opacitySlider.value = DEFAULT_BACKGROUND.opacity;
  updateValueDisplay('bg-opacity-value', DEFAULT_BACKGROUND.opacity, 2);

  setMediaType('none', { silent: true });
  gradientOverlayOptIn = false;
  syncGradientOverlayState();
  applyBackground({ skipGradientOverlayOptIn: true });
  updateStatus('🔄 Background reset to defaults!');
};

function initializeBackgroundControls() {
  // Glass transparency toggle (blob as window through gradient)
  const glassCheckbox = document.getElementById('blob-image-transparency');
  if (glassCheckbox) {
    glassCheckbox.addEventListener('change', (e) => {
      if (!window.kwami || !window.kwami.body) return;

      // Read current blob opacity
      const currentBlobOpacity = window.kwami.body.blob.getOpacity?.() ?? 1;

      if (e.target.checked) {
        // Do NOT change gradient configuration; only enable glass mode
        window.kwami.body.setBlobImageTransparencyMode(true, { mode: 'glass' });

        // If blob opacity was 1, drop to 0.8 for nicer glass effect and remember to restore later
        if (currentBlobOpacity >= 1) {
          prevBlobOpacityForGlass = currentBlobOpacity;
          window.kwami.body.blob.setOpacity(0.8);
          const blobOpacitySlider = document.getElementById('blob-opacity');
          if (blobOpacitySlider) blobOpacitySlider.value = '0.80';
          updateValueDisplay('blob-opacity-value', 0.8, 2);
        }
        updateStatus('🪟 Glass transparency enabled');
      } else {
        // Disable glass mode without touching gradient params
        window.kwami.body.setBlobImageTransparencyMode(false);

        // Restore previous blob opacity if we changed it
        if (prevBlobOpacityForGlass !== null) {
          window.kwami.body.blob.setOpacity(prevBlobOpacityForGlass);
          const blobOpacitySlider = document.getElementById('blob-opacity');
          if (blobOpacitySlider) blobOpacitySlider.value = String(prevBlobOpacityForGlass);
          updateValueDisplay('blob-opacity-value', prevBlobOpacityForGlass, 2);
          prevBlobOpacityForGlass = null;
        }
        updateStatus('🎨 Glass transparency disabled');
      }
    });
  }

  // Gradient enable/disable checkbox
  const gradientEnabledCheckbox = document.getElementById('bg-gradient-enabled');
  if (gradientEnabledCheckbox) {
    gradientEnabledCheckbox.addEventListener('change', (e) => {
      const controlsContainer = document.getElementById('gradient-controls-container');
      if (controlsContainer) {
        if (e.target.checked) {
          controlsContainer.classList.remove('gradient-controls-disabled');
        } else {
          controlsContainer.classList.add('gradient-controls-disabled');
        }
      }
      applyBackground();
    });
  }

  const bgOpacitySlider = document.getElementById('bg-opacity');
  if (bgOpacitySlider) {
    bgOpacitySlider.addEventListener('input', (e) => {
      updateValueDisplay('bg-opacity-value', e.target.value, 2);
      applyBackground();
    });
  }

  // Blob opacity slider - simple opacity control
  const blobOpacitySlider = document.getElementById('blob-opacity');
  if (blobOpacitySlider) {
    blobOpacitySlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      updateValueDisplay('blob-opacity-value', value, 2);
      
      const kwamiBlob = window.kwami?.body?.blob;
      if (kwamiBlob && typeof kwamiBlob.setOpacity === 'function') {
        kwamiBlob.setOpacity(value);
      }
    });
  }

  ['1', '2', '3'].forEach((num) => {
    const colorPicker = document.getElementById(`bg-color-${num}`);
    if (colorPicker) {
      colorPicker.addEventListener('input', applyBackground);
    }
  });

  const gradientStyleSelect = document.getElementById('bg-gradient-style');
  if (gradientStyleSelect) {
    gradientStyleSelect.addEventListener('change', (e) => {
      applyBackground();
    });
  }

  const angleSlider = document.getElementById('bg-gradient-angle');
  if (angleSlider) {
    angleSlider.addEventListener('input', (e) => {
      updateValueDisplay('bg-gradient-angle-value', e.target.value, 0);
      applyBackground();
    });
  }

  const stop1Slider = document.getElementById('bg-gradient-stop1');
  if (stop1Slider) {
    stop1Slider.addEventListener('input', (e) => {
      const value = Math.min(100, Math.max(0, parseFloat(e.target.value)));
      stop1Slider.value = String(value);
      updateValueDisplay('bg-gradient-stop1-value', value, 0);
      applyBackground();
    });
  }

  const stop2Slider = document.getElementById('bg-gradient-stop2');
  if (stop2Slider) {
    stop2Slider.addEventListener('input', (e) => {
      const value = Math.min(100, Math.max(0, parseFloat(e.target.value)));
      stop2Slider.value = String(value);
      updateValueDisplay('bg-gradient-stop2-value', value, 0);
      applyBackground();
    });
  }

  const mediaTabs = document.querySelectorAll('#bg-media-tabs .media-tab');
  mediaTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setMediaType(tab.dataset.media);
    });
  });

  const imageSelect = document.getElementById('bg-media-image');
  if (imageSelect) {
    imageSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        setMediaType('image');
        setBackgroundImage(e.target.value);
      } else if (currentMediaType === 'image') {
        clearMediaSelection('image');
      }
    });
  }

  const videoSelect = document.getElementById('bg-media-video');
  if (videoSelect) {
    videoSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        setMediaType('video');
        setBackgroundVideo(e.target.value);
      } else if (currentMediaType === 'video') {
        clearMediaSelection('video');
      }
    });
  }

  const defaultAngle = DEFAULT_BACKGROUND.angle;
  const defaultStop1Percent = Math.round(DEFAULT_BACKGROUND.stops[1] * 100);
  const defaultStop2Percent = Math.round(DEFAULT_BACKGROUND.stops[2] * 100);

  const color1Input = document.getElementById('bg-color-1');
  const color2Input = document.getElementById('bg-color-2');
  const color3Input = document.getElementById('bg-color-3');
  if (color1Input) color1Input.value = DEFAULT_BACKGROUND.colors[0];
  if (color2Input) color2Input.value = DEFAULT_BACKGROUND.colors[1];
  if (color3Input) color3Input.value = DEFAULT_BACKGROUND.colors[2];

  if (angleSlider) {
    angleSlider.value = String(defaultAngle);
    updateValueDisplay('bg-gradient-angle-value', defaultAngle, 0);
  }
  if (stop1Slider) {
    stop1Slider.value = String(defaultStop1Percent);
    updateValueDisplay('bg-gradient-stop1-value', defaultStop1Percent, 0);
  }
  if (stop2Slider) {
    stop2Slider.value = String(defaultStop2Percent);
    updateValueDisplay('bg-gradient-stop2-value', defaultStop2Percent, 0);
  }

  if (gradientStyleSelect) {
    gradientStyleSelect.value = DEFAULT_BACKGROUND.style;
  }
  if (bgOpacitySlider) {
    bgOpacitySlider.value = DEFAULT_BACKGROUND.opacity.toString();
    updateValueDisplay('bg-opacity-value', DEFAULT_BACKGROUND.opacity, 2);
  }

  setMediaType('none', { silent: true });
  applyBackground({ skipGradientOverlayOptIn: true });
}

// Initialize sidebars first
initializeSidebars();
applySidebarVisibility();
updateMenuToggleButton();
initializeGitHubStarButton();
initializeThemeToggle();

// Initialize Mind controls since Mind is on the left by default
setTimeout(() => {
  if (sidebarState.left === 'mind') {
    initializeMindControls();
  }
}, 100);

// Initialize Kwami
const canvas = document.getElementById('kwami-canvas');

try {
  window.kwami = new Kwami(canvas, {
    body: {
      initialSkin: 'Poles', // 3Colors collection default variant
      blob: {
        resolution: 180,
        colors: {
          x: '#ff0066',
          y: '#00ff66',
          z: '#6600ff'
        }
      },
      scene: {
        cameraPosition: { x: -0.9, y: 7.3, z: -1.8 }
      }
    }
  });
  
  window.kwami.body.setBackgroundTransparent();
  window.kwami.body.clearBackgroundMedia?.();
  
  // Set initial scale after initialization
  window.kwami.body.blob.setScale(DEFAULT_VALUES.scale);

  // Update version display dynamically
  const versionDisplay = document.getElementById('version-display');
  if (versionDisplay) {
    versionDisplay.textContent = `v${Kwami.getVersion()}`;
  }

  initializeAudioPlayer();

  // Create conversation callbacks for blob interaction
  const conversationCallbacks = {
    onAgentResponse: (text) => {
      // Don't update status for connection messages
      if (!text.includes('🎙️ Connected') && !text.includes('🎙️ Conversation started')) {
        updateStatus('🤖 Agent is speaking...');
      }
      const transcriptDiv = document.getElementById('conversation-transcript');
      if (transcriptDiv) {
        const entry = document.createElement('div');
        entry.style.cssText = 'margin: 5px 0; padding: 5px; background: #e3e8ff; border-radius: 4px;';
        entry.innerHTML = `<strong>🤖 Agent:</strong> ${text}`;
        transcriptDiv.appendChild(entry);
        transcriptDiv.scrollTop = transcriptDiv.scrollHeight;
        transcriptDiv.style.display = 'block';
      }
    },
    onUserTranscript: (text) => {
      const transcriptDiv = document.getElementById('conversation-transcript');
      if (transcriptDiv) {
        const entry = document.createElement('div');
        entry.style.cssText = 'margin: 5px 0; padding: 5px; background: #fff; border-radius: 4px;';
        entry.innerHTML = `<strong>👤 You:</strong> ${text}`;
        transcriptDiv.appendChild(entry);
        transcriptDiv.scrollTop = transcriptDiv.scrollHeight;
        transcriptDiv.style.display = 'block';
      }
    },
    onTurnStart: () => {
      updateStatus('🎙️ Agent is speaking...');
      // Ensure blob is in speaking state for proper animation
      if (window.kwami) {
        window.kwami.setState('speaking');
      }
    },
    onTurnEnd: () => {
      updateStatus('👂 Listening for your response...');
      // Return to listening state
      if (window.kwami) {
        window.kwami.setState('listening');
      }
    },
    onError: (error) => {
      showError('Conversation error: ' + error.message);
      stopConversation();
    }
  };
  
  // Store callbacks globally for reuse
  window.conversationCallbacks = conversationCallbacks;
  
  // Enable click interaction by default (includes double-click for conversations)
  window.kwami.enableBlobInteraction(conversationCallbacks);

  // Initialize skills system
  initializeSkills();

  // Initialize body controls event listeners
  initializeBodyControls();
  
  // Initialize background controls
  initializeBackgroundControls();

  // Initialize camera position controls
  initializeCameraControls();

  // Randomize blob on page load (but keep scale at 4)
  window.kwami.body.blob.setRandomBlob();
  window.kwami.body.blob.setScale(4.0);
  
  // Set camera to default position (don't randomize)
  const camera = window.kwami.body.getCamera();
  camera.position.set(DEFAULT_CAMERA_POSITION.x, DEFAULT_CAMERA_POSITION.y, DEFAULT_CAMERA_POSITION.z);
  camera.lookAt(0, 0, 0);
  
  // Update camera UI
  document.getElementById('camera-x').value = DEFAULT_CAMERA_POSITION.x;
  document.getElementById('camera-y').value = DEFAULT_CAMERA_POSITION.y;
  document.getElementById('camera-z').value = DEFAULT_CAMERA_POSITION.z;
  updateValueDisplay('camera-x-value', DEFAULT_CAMERA_POSITION.x, 1);
  updateValueDisplay('camera-y-value', DEFAULT_CAMERA_POSITION.y, 1);
  updateValueDisplay('camera-z-value', DEFAULT_CAMERA_POSITION.z, 1);
  
  // Set random background image (this will make the scene transparent)
  const randomImage = BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)];
  const imageSelect = document.getElementById('bg-media-image');
  if (imageSelect) {
    imageSelect.value = randomImage;
  }
  setMediaType('image', { silent: true });
  setBackgroundImage(randomImage, { silent: true });
  
  // Also randomize gradient colors in UI (but don't apply yet since image is showing)
  const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  document.getElementById('bg-color-1').value = randomColor();
  document.getElementById('bg-color-2').value = randomColor();
  document.getElementById('bg-color-3').value = randomColor();
  
  // Update all UI controls to reflect random blob state
  updateAllControlsFromBlob();

  updateStatus('✅ Kwami initialized with random appearance!');
  updateStateIndicator(window.kwami.getState());
} catch (error) {
  showError('Failed to initialize Kwami: ' + error.message);
}

// ============================================================================
// Mind Functions (ElevenLabs AI Agent Configuration)
// ============================================================================

// Global mind configuration storage
window.mindConfig = {
  voiceSettings: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true
  },
  pronunciationDict: {},
  outputFormat: 'mp3_44100_128',
  optimizeLatency: false
};

// Initialize Mind
window.initializeMind = async function() {
  const apiKey = document.getElementById('api-key').value.trim();
  const agentId = document.getElementById('agent-id').value.trim();
  let voiceId = document.getElementById('voice-id').value.trim();
  
  // Check if custom voice ID is selected
  if (voiceId === 'custom') {
    voiceId = document.getElementById('custom-voice-id').value.trim();
    if (!voiceId) {
      showError('Please enter a custom voice ID');
      return;
    }
  }

  if (!apiKey) {
    showError('Please enter your ElevenLabs API Key');
    return;
  }
  
  if (!agentId) {
    showError('Please enter your ElevenLabs Agent ID for conversations');
    return;
  }

  try {
    updateStatus('🔄 Initializing Mind with WebSocket support...');
    
    // Update Mind configuration
    window.kwami.mind.setVoiceId(voiceId);
    window.kwami.mind.config.apiKey = apiKey;
    window.kwami.mind.config.conversational = {
      agentId: agentId,
      firstMessage: 'Hello! How can I help you today?'
    };
    
    // Apply model
    const model = document.getElementById('voice-model').value;
    window.kwami.mind.setModel(model);
    
    // Apply initial voice settings
    applyVoiceSettings();
    
    await window.kwami.mind.initialize();
    
    // Enable all Mind buttons
    document.getElementById('speak-btn').disabled = false;
    document.getElementById('preview-btn').disabled = false;
    document.getElementById('test-mic-btn').disabled = false;
    document.getElementById('start-conversation-btn').disabled = false;
    document.getElementById('init-btn').textContent = '✅ Mind Ready';
    document.getElementById('init-btn').disabled = true;
    
    // Add conversation-ready class to indicate double-click is available
    const canvasContainer = document.getElementById('canvas-container');
    const canvas = document.getElementById('kwami-canvas');
    if (canvasContainer) canvasContainer.classList.add('conversation-ready');
    if (canvas) canvas.classList.add('conversation-ready');
    
    updateStatus('✅ Mind initialized! Ready to speak. Double-click Kwami to start conversation.');
  } catch (error) {
    showError('Failed to initialize Mind: ' + error.message);
  }
};

// Apply Voice Settings
window.applyVoiceSettings = function() {
  if (!window.kwami || !window.kwami.mind) return;
  
  const settings = {
    stability: parseFloat(document.getElementById('voice-stability').value),
    similarity_boost: parseFloat(document.getElementById('voice-similarity').value),
    style: parseFloat(document.getElementById('voice-style').value),
    use_speaker_boost: document.getElementById('voice-speaker-boost').checked
  };
  
  window.mindConfig.voiceSettings = settings;
  window.kwami.mind.setVoiceSettings(settings);
  
  updateStatus('✅ Voice settings applied!');
};

// Load Available Voices from ElevenLabs
window.loadAvailableVoices = async function() {
  if (!window.kwami || !window.kwami.mind || !window.kwami.mind.isReady()) {
    showError('Please initialize Mind first');
    return;
  }
  
  try {
    updateStatus('🔄 Loading available voices...');
    
    const voices = await window.kwami.mind.getAvailableVoices();
    
    const voicesList = document.getElementById('user-voices');
    voicesList.innerHTML = '';
    
    voices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.voice_id;
      option.textContent = `${voice.name} (${voice.category || 'Custom'})`;
      voicesList.appendChild(option);
    });
    
    document.getElementById('available-voices-list').style.display = 'block';
    updateStatus(`✅ Loaded ${voices.length} voices!`);
  } catch (error) {
    showError('Failed to load voices: ' + error.message);
  }
};

// Select User Voice
window.selectUserVoice = function() {
  const voicesList = document.getElementById('user-voices');
  const selectedVoiceId = voicesList.value;
  
  if (!selectedVoiceId) {
    showError('Please select a voice');
    return;
  }
  
  // Update the voice ID in the main dropdown
  const voiceSelect = document.getElementById('voice-id');
  voiceSelect.value = 'custom';
  document.getElementById('custom-voice-id').value = selectedVoiceId;
  document.getElementById('custom-voice-container').style.display = 'block';
  
  // Apply the new voice
  if (window.kwami && window.kwami.mind) {
    window.kwami.mind.setVoiceId(selectedVoiceId);
  }
  
  const selectedText = voicesList.options[voicesList.selectedIndex].text;
  updateStatus(`✅ Voice changed to: ${selectedText}`);
};

// Apply Voice Preset
window.applyVoicePreset = function(preset) {
  const presets = {
    natural: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    },
    expressive: {
      stability: 0.3,
      similarity_boost: 0.8,
      style: 0.4,
      use_speaker_boost: true
    },
    stable: {
      stability: 0.8,
      similarity_boost: 0.7,
      style: 0.0,
      use_speaker_boost: true
    },
    clear: {
      stability: 0.7,
      similarity_boost: 0.9,
      style: 0.0,
      use_speaker_boost: true
    }
  };
  
  const settings = presets[preset];
  if (!settings) return;
  
  // Update UI
  document.getElementById('voice-stability').value = settings.stability;
  document.getElementById('voice-similarity').value = settings.similarity_boost;
  document.getElementById('voice-style').value = settings.style;
  document.getElementById('voice-speaker-boost').checked = settings.use_speaker_boost;
  
  updateValueDisplay('voice-stability-value', settings.stability, 2);
  updateValueDisplay('voice-similarity-value', settings.similarity_boost, 2);
  updateValueDisplay('voice-style-value', settings.style, 2);
  
  // Apply settings
  applyVoiceSettings();
  
  const presetNames = {
    natural: 'Natural',
    expressive: 'Expressive',
    stable: 'Stable',
    clear: 'Clear & Crisp'
  };
  
  updateStatus(`✅ Applied ${presetNames[preset]} preset!`);
};

// Alternative implementation using library method
window.applyVoicePresetV2 = function(preset) {
  if (window.kwami && window.kwami.mind) {
    window.kwami.mind.applyVoicePreset(preset);
    updateStatus(`✅ Applied ${preset} voice preset`);
  }
};

// Preview Voice
window.previewVoice = async function() {
  const previewText = "Hello! This is a preview of my voice. How do I sound?";
  
  try {
    updateStatus('🎤 Generating preview...');
    document.getElementById('preview-btn').disabled = true;
    
    await window.kwami.speak(previewText);
    
    updateStatus('✅ Preview complete!');
    document.getElementById('preview-btn').disabled = false;
  } catch (error) {
    showError('Failed to preview voice: ' + error.message);
    document.getElementById('preview-btn').disabled = false;
  }
};

// Conversation toggle state sync
function updateConversationButtonState(isActive) {
  const startBtn = document.getElementById('start-conversation-btn');
  const stopBtn = document.getElementById('stop-conversation-btn');
  
  if (startBtn && stopBtn) {
    if (isActive) {
      startBtn.style.display = 'none';
      stopBtn.style.display = 'block';
      stopBtn.disabled = false;
    } else {
      startBtn.style.display = 'block';
      startBtn.disabled = false;
      stopBtn.style.display = 'none';
    }
  }
}

// Toggle Conversation (used by both button and double-click)
window.toggleConversation = async function() {
  if (!window.kwami) return;
  
  if (window.kwami.isConversationActive()) {
    await stopConversation();
  } else {
    await startConversation();
  }
};

// Start Conversation
window.startConversation = async function() {
  if (!window.kwami || !window.kwami.mind || !window.kwami.mind.isReady()) {
    showError('Please initialize Mind first');
    return;
  }
  
  const agentId = document.getElementById('agent-id').value.trim();
  if (!agentId) {
    showError('Please enter an Agent ID for conversational AI');
    return;
  }
  
  const firstMessage = document.getElementById('conversation-first-message').value.trim();
  const maxDuration = parseInt(document.getElementById('conversation-max-duration').value) || 300;
  const allowInterruption = document.getElementById('conversation-interruption').checked;
  
  try {
    updateStatus('🔄 Starting WebSocket conversation...');
    updateConversationButtonState(false); // Disable buttons during start
    
    // Update conversation config
    window.kwami.mind.config.conversational = {
      agentId: agentId,
      firstMessage: firstMessage || 'Hello! How can I help you today?',
      maxDuration: maxDuration,
      allowInterruption: allowInterruption
    };
    
    // Create transcript display area if it doesn't exist
    let transcriptArea = document.getElementById('conversation-transcript');
    if (!transcriptArea) {
      const conversationSection = document.querySelector('.section:has(#agent-id)');
      if (conversationSection) {
        transcriptArea = document.createElement('div');
        transcriptArea.id = 'conversation-transcript';
        transcriptArea.style.cssText = 'margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 8px; max-height: 200px; overflow-y: auto; font-size: 12px; display: none;';
        transcriptArea.innerHTML = '<div style="color: #888; margin-bottom: 5px;">📝 Conversation Transcript:</div>';
        conversationSection.appendChild(transcriptArea);
      }
    }
    
    // Use the global conversation callbacks or create if needed
    const callbacks = window.conversationCallbacks || {
      onAgentResponse: (text) => {
        console.log('Agent:', text);
        
        // Update status message
        const statusMessage = document.getElementById('conversation-status-message');
        if (statusMessage) {
          // Format multi-line messages properly
          const formattedText = text.replace(/\n/g, '<br>');
          statusMessage.innerHTML = formattedText;
        }
        
        if (transcriptArea) {
          const entry = document.createElement('div');
          entry.style.cssText = 'margin: 5px 0; padding: 5px; background: #e3e8ff; border-radius: 4px;';
          entry.innerHTML = `<strong>🤖 Agent:</strong> ${text}`;
          transcriptArea.appendChild(entry);
          transcriptArea.scrollTop = transcriptArea.scrollHeight;
          transcriptArea.style.display = 'block';
        }
      },
      onUserTranscript: (text) => {
        console.log('User:', text);
        if (transcriptArea) {
          const entry = document.createElement('div');
          entry.style.cssText = 'margin: 5px 0; padding: 5px; background: #fff; border-radius: 4px;';
          entry.innerHTML = `<strong>👤 You:</strong> ${text}`;
          transcriptArea.appendChild(entry);
          transcriptArea.scrollTop = transcriptArea.scrollHeight;
          transcriptArea.style.display = 'block';
        }
      },
      onTurnStart: () => {
        updateStatus('🎙️ Agent is speaking...');
      },
      onTurnEnd: () => {
        updateStatus('👂 Listening for your response...');
      },
      onError: (error) => {
        showError('Conversation error: ' + error.message);
        stopConversation();
      }
    };
    
    // Update the transcript area reference if needed
    if (transcriptArea) {
      callbacks.transcriptArea = transcriptArea;
    }
    
    // Start conversation with callbacks
    await window.kwami.startConversation(callbacks);
    
    updateConversationButtonState(true);
    
    // Show conversation status
    const statusContainer = document.getElementById('conversation-status-container');
    const statusMessage = document.getElementById('conversation-status-message');
    if (statusContainer && statusMessage) {
      statusContainer.style.display = 'block';
      statusMessage.innerHTML = '🎙️ Conversation active - Speak naturally, your voice is being captured!';
    }
    
    updateStatus('✅ Conversation started! Speak to interact with the agent. (Double-click Kwami to stop)');
  } catch (error) {
    showError('Failed to start conversation: ' + error.message);
    updateConversationButtonState(false);
  }
};

// Stop Conversation
window.stopConversation = async function() {
  if (!window.kwami) return;
  
  try {
    updateStatus('🔄 Stopping conversation...');
    
    // Use Kwami's stopConversation which properly sets state to idle
    await window.kwami.stopConversation();
    
    // Hide status container
    const statusContainer = document.getElementById('conversation-status-container');
    if (statusContainer) {
      statusContainer.style.display = 'none';
    }
    
    updateConversationButtonState(false);
    updateStatus('✅ Conversation stopped. (Double-click Kwami to start again)');
  } catch (error) {
    showError('Failed to stop conversation: ' + error.message);
  }
};

// Test Microphone
window.testMicrophone = async function() {
  if (!window.kwami || !window.kwami.mind) {
    showError('Please initialize Mind first');
    return;
  }
  
  try {
    updateStatus('🎤 Testing microphone...');
    
    const stream = await window.kwami.mind.listen();
    
    document.getElementById('mic-status').style.display = 'block';
    document.getElementById('mic-status-text').textContent = 'Active';
    document.getElementById('mic-status-text').style.color = '#4CAF50';
    
    updateStatus('✅ Microphone is working!');
    
    // Stop listening after 3 seconds
    setTimeout(() => {
      window.kwami.mind.stopListening();
      document.getElementById('mic-status-text').textContent = 'Test complete';
      document.getElementById('mic-status-text').style.color = '#888';
    }, 3000);
  } catch (error) {
    document.getElementById('mic-status').style.display = 'block';
    document.getElementById('mic-status-text').textContent = 'Failed';
    document.getElementById('mic-status-text').style.color = '#f44336';
    showError('Microphone test failed: ' + error.message);
  }
};

// Apply Pronunciation Rules
window.applyPronunciation = function() {
  const dictText = document.getElementById('pronunciation-dict').value.trim();
  
  if (!dictText) {
    updateStatus('ℹ️ No pronunciation rules to apply');
    return;
  }
  
  const lines = dictText.split('\n');
  const dict = {};
  
  lines.forEach(line => {
    const [word, pronunciation] = line.split(':').map(s => s.trim());
    if (word && pronunciation) {
      dict[word] = pronunciation;
    }
  });
  
  window.mindConfig.pronunciationDict = dict;
  
  updateStatus(`✅ Applied ${Object.keys(dict).length} pronunciation rules!`);
};

// Check API Usage
window.checkUsage = async function() {
  if (!window.kwami || !window.kwami.mind || !window.kwami.mind.isReady()) {
    showError('Please initialize Mind first');
    return;
  }
  
  try {
    updateStatus('🔄 Checking API usage...');
    
    // Note: This would require additional ElevenLabs API endpoint
    // For now, show placeholder
    document.getElementById('usage-info').style.display = 'block';
    document.getElementById('usage-characters').textContent = 'N/A';
    document.getElementById('usage-limit').textContent = 'N/A';
    document.getElementById('usage-remaining').textContent = 'N/A';
    
    updateStatus('ℹ️ Usage API endpoint requires additional implementation');
  } catch (error) {
    showError('Failed to check usage: ' + error.message);
  }
};

// Export Mind Configuration
window.exportMindConfig = function() {
  const config = {
    voiceId: document.getElementById('voice-id').value,
    model: document.getElementById('voice-model').value,
    language: document.getElementById('voice-language').value,
    voiceSettings: {
      stability: parseFloat(document.getElementById('voice-stability').value),
      similarity_boost: parseFloat(document.getElementById('voice-similarity').value),
      style: parseFloat(document.getElementById('voice-style').value),
      use_speaker_boost: document.getElementById('voice-speaker-boost').checked
    },
    advancedSettings: {
      outputFormat: document.getElementById('tts-output-format').value,
      optimizeLatency: document.getElementById('tts-optimize-latency').checked,
      nextTextTimeout: parseInt(document.getElementById('tts-next-text').value)
    },
    conversational: {
      agentId: document.getElementById('agent-id').value,
      firstMessage: document.getElementById('conversation-first-message').value,
      maxDuration: parseInt(document.getElementById('conversation-max-duration').value),
      allowInterruption: document.getElementById('conversation-interruption').checked
    },
    stt: {
      model: document.getElementById('stt-model').value,
      punctuation: document.getElementById('stt-punctuation').checked,
      diarization: document.getElementById('stt-diarization').checked
    },
    pronunciation: {
      dictionary: document.getElementById('pronunciation-dict').value,
      usePhonemes: document.getElementById('use-phonemes').checked
    }
  };
  
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `kwami-mind-config-${Date.now()}.json`;
  link.click();
  
  setTimeout(() => URL.revokeObjectURL(link.href), 100);
  
  updateStatus('💾 Mind configuration exported!');
};

// Import Mind Configuration
window.importMindConfig = function() {
  const fileInput = document.getElementById('mind-config-import');
  fileInput.click();
};

// Initialize Mind controls event listeners
function initializeMindControls() {
  // Voice ID dropdown change handler
  const voiceIdSelect = document.getElementById('voice-id');
  if (voiceIdSelect) {
    voiceIdSelect.addEventListener('change', (e) => {
      const customContainer = document.getElementById('custom-voice-container');
      if (e.target.value === 'custom') {
        customContainer.style.display = 'block';
      } else {
        customContainer.style.display = 'none';
        if (window.kwami && window.kwami.mind) {
          window.kwami.mind.setVoiceId(e.target.value);
        }
      }
    });
  }
  
  // Voice stability slider
  const voiceStability = document.getElementById('voice-stability');
  if (voiceStability) {
    voiceStability.addEventListener('input', (e) => {
      updateValueDisplay('voice-stability-value', e.target.value, 2);
    });
  }
  
  // Voice similarity slider
  const voiceSimilarity = document.getElementById('voice-similarity');
  if (voiceSimilarity) {
    voiceSimilarity.addEventListener('input', (e) => {
      updateValueDisplay('voice-similarity-value', e.target.value, 2);
    });
  }
  
  // Voice style slider
  const voiceStyle = document.getElementById('voice-style');
  if (voiceStyle) {
    voiceStyle.addEventListener('input', (e) => {
      updateValueDisplay('voice-style-value', e.target.value, 2);
    });
  }
  
  // TTS next text timeout slider
  const ttsNextText = document.getElementById('tts-next-text');
  if (ttsNextText) {
    ttsNextText.addEventListener('input', (e) => {
      updateValueDisplay('tts-next-text-value', e.target.value, 0);
    });
  }
  
  // Model change handler
  const voiceModel = document.getElementById('voice-model');
  if (voiceModel) {
    voiceModel.addEventListener('change', (e) => {
      if (window.kwami && window.kwami.mind) {
        window.kwami.mind.setModel(e.target.value);
        updateStatus(`Model changed to: ${e.target.options[e.target.selectedIndex].text}`);
      }
    });
  }
  
  // Config import file handler
  const configImport = document.getElementById('mind-config-import');
  if (configImport) {
    configImport.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const config = JSON.parse(text);
        
        // Apply imported configuration
        if (config.voiceId) document.getElementById('voice-id').value = config.voiceId;
        if (config.model) document.getElementById('voice-model').value = config.model;
        if (config.language) document.getElementById('voice-language').value = config.language;
        
        if (config.voiceSettings) {
          document.getElementById('voice-stability').value = config.voiceSettings.stability;
          document.getElementById('voice-similarity').value = config.voiceSettings.similarity_boost;
          document.getElementById('voice-style').value = config.voiceSettings.style;
          document.getElementById('voice-speaker-boost').checked = config.voiceSettings.use_speaker_boost;
          
          updateValueDisplay('voice-stability-value', config.voiceSettings.stability, 2);
          updateValueDisplay('voice-similarity-value', config.voiceSettings.similarity_boost, 2);
          updateValueDisplay('voice-style-value', config.voiceSettings.style, 2);
        }
        
        if (config.advancedSettings) {
          document.getElementById('tts-output-format').value = config.advancedSettings.outputFormat;
          document.getElementById('tts-optimize-latency').checked = config.advancedSettings.optimizeLatency;
          document.getElementById('tts-next-text').value = config.advancedSettings.nextTextTimeout;
          updateValueDisplay('tts-next-text-value', config.advancedSettings.nextTextTimeout, 0);
        }
        
        if (config.conversational) {
          document.getElementById('agent-id').value = config.conversational.agentId || '';
          document.getElementById('conversation-first-message').value = config.conversational.firstMessage || '';
          document.getElementById('conversation-max-duration').value = config.conversational.maxDuration || 300;
          document.getElementById('conversation-interruption').checked = config.conversational.allowInterruption || false;
        }
        
        if (config.stt) {
          document.getElementById('stt-model').value = config.stt.model || 'base';
          document.getElementById('stt-punctuation').checked = config.stt.punctuation !== false;
          document.getElementById('stt-diarization').checked = config.stt.diarization || false;
        }
        
        if (config.pronunciation) {
          document.getElementById('pronunciation-dict').value = config.pronunciation.dictionary || '';
          document.getElementById('use-phonemes').checked = config.pronunciation.usePhonemes || false;
        }
        
        updateStatus('✅ Mind configuration imported!');
      } catch (error) {
        showError('Failed to import configuration: ' + error.message);
      }
    });
  }
}

// Load Personality
window.loadPersonality = async function(type) {
  try {
    updateStatus(`🔄 Loading ${type} personality...`);
    
    // Use the library's preset method instead of loading JSON files
    window.kwami.soul.loadPresetPersonality(type);
    
    const config = window.kwami.soul.getConfig();
    
    // Update all Soul UI fields
    updateSoulUIFromConfig(config);
    
    // Update emotional trait sliders from loaded personality
    updateEmotionalTraitSliders();
    
    updateStatus(`✅ Loaded ${config.name} personality!`);
  } catch (error) {
    showError('Failed to load personality: ' + error.message);
  }
};

// Update emotional trait value display and auto-apply
window.updateEmotionalTrait = function(trait, value) {
  const valueDisplay = document.getElementById(`${trait}-value`);
  if (valueDisplay) {
    valueDisplay.textContent = value;
  }
  
  // Auto-apply the trait change
  if (window.kwami && window.kwami.soul) {
    window.kwami.soul.setEmotionalTrait(trait, parseInt(value));
  }
};

// Note: Emotional traits are now auto-applied as sliders change
// This function is kept for backward compatibility but may not be needed
window.applyEmotionalTraits = function() {
  if (!window.kwami || !window.kwami.soul) {
    showError('Soul not initialized');
    return;
  }

  try {
    const emotionalTraits = {
      happiness: parseInt(document.getElementById('happiness-slider')?.value || 0),
      energy: parseInt(document.getElementById('energy-slider')?.value || 0),
      confidence: parseInt(document.getElementById('confidence-slider')?.value || 0),
      calmness: parseInt(document.getElementById('calmness-slider')?.value || 0),
      optimism: parseInt(document.getElementById('optimism-slider')?.value || 0),
      socialness: parseInt(document.getElementById('socialness-slider')?.value || 0),
      creativity: parseInt(document.getElementById('creativity-slider')?.value || 0),
      patience: parseInt(document.getElementById('patience-slider')?.value || 0),
      empathy: parseInt(document.getElementById('empathy-slider')?.value || 0),
      curiosity: parseInt(document.getElementById('curiosity-slider')?.value || 0)
    };

    window.kwami.soul.setEmotionalTraits(emotionalTraits);
    updateStatus('✅ Emotional traits applied!');
  } catch (error) {
    showError('Failed to apply emotional traits: ' + error.message);
  }
};

// Reset all emotional traits to neutral (0)
window.resetEmotionalTraits = function() {
  const traits = ['happiness', 'energy', 'confidence', 'calmness', 'optimism', 
                  'socialness', 'creativity', 'patience', 'empathy', 'curiosity'];
  
  traits.forEach(trait => {
    const slider = document.getElementById(`${trait}-slider`);
    const valueDisplay = document.getElementById(`${trait}-value`);
    
    if (slider) slider.value = 0;
    if (valueDisplay) valueDisplay.textContent = '0';
  });

  if (window.kwami && window.kwami.soul) {
    window.kwami.soul.setEmotionalTraits({
      happiness: 0,
      energy: 0,
      confidence: 0,
      calmness: 0,
      optimism: 0,
      socialness: 0,
      creativity: 0,
      patience: 0,
      empathy: 0,
      curiosity: 0
    });
  }

  updateStatus('🔄 Emotional traits reset to neutral');
};

// Update sliders to match current Soul emotional traits
function updateEmotionalTraitSliders() {
  if (!window.kwami || !window.kwami.soul) return;

  const traits = window.kwami.soul.getEmotionalTraits();
  if (!traits) return;

  const traitNames = ['happiness', 'energy', 'confidence', 'calmness', 'optimism', 
                      'socialness', 'creativity', 'patience', 'empathy', 'curiosity'];
  
  traitNames.forEach(traitName => {
    const value = traits[traitName] || 0;
    const slider = document.getElementById(`${traitName}-slider`);
    const valueDisplay = document.getElementById(`${traitName}-value`);
    
    if (slider) slider.value = value;
    if (valueDisplay) valueDisplay.textContent = value;
  });
}

// Speak
window.speak = async function() {
  const text = document.getElementById('speak-text').value.trim();
  
  if (!text) {
    showError('Please enter text to speak');
    return;
  }

  try {
    updateStatus('🗣️ Speaking...');
    document.getElementById('speak-btn').disabled = true;
    
    await window.kwami.speak(text);
    
    // Wait for the audio to finish playing
    const audioElement = window.kwami.body.audio.getAudioElement();
    
    // Check if audio is still playing
    if (!audioElement.paused && !audioElement.ended) {
      await new Promise((resolve) => {
        // Fallback timeout in case something goes wrong (5 minutes max)
        const timeoutId = setTimeout(() => {
          resolve();
        }, 300000);
        
        const onEnded = () => {
          clearTimeout(timeoutId);
          resolve();
        };
        
        const onError = () => {
          clearTimeout(timeoutId);
          resolve();
        };
        
        audioElement.addEventListener('ended', onEnded, { once: true });
        audioElement.addEventListener('error', onError, { once: true });
      });
    }
    
    updateStatus('✅ Speech complete!');
    document.getElementById('speak-btn').disabled = false;
  } catch (error) {
    showError('Failed to speak: ' + error.message);
    document.getElementById('speak-btn').disabled = false;
  }
};

// Export GLB
window.exportGLB = function() {
  if (window.kwami && window.kwami.body) {
    window.kwami.body.exportAsGLB();
    updateStatus('💾 Downloading GLB file...');
  } else {
    showError('Kwami not initialized yet!');
  }
};

// Randomize Blob
window.randomizeBlob = function() {
  if (window.kwami && window.kwami.body) {
    window.kwami.body.randomizeBlob();
    const appliedSkin = applySkinToBlob(getNextRandomizedSkin());
    updateAllControlsFromBlob();
    const skinLabel = appliedSkin ? getSkinDisplayName(appliedSkin) : getSkinDisplayName('tricolor');
    updateStatus(`🎲 Blob randomized! 🎨 Skin: ${skinLabel}`);
  }
};

// Reset to Defaults
window.resetToDefaults = function() {
  if (window.kwami && window.kwami.body) {
    // Reset blob to defaults
    window.kwami.body.resetBlobToDefaults();
  
  // Reset camera position
    window.kwami.body.resetCameraPosition();
    
    // Update camera UI
    const pos = window.kwami.body.getCameraPosition();
    document.getElementById('camera-x').value = pos.x;
    document.getElementById('camera-y').value = pos.y;
    document.getElementById('camera-z').value = pos.z;
    updateValueDisplay('camera-x-value', pos.x, 1);
    updateValueDisplay('camera-y-value', pos.y, 1);
    updateValueDisplay('camera-z-value', pos.z, 1);
  
  // Update UI
  updateAllControlsFromBlob();
  updateStatus('🔄 Reset to defaults!');
  }
};

// Export Scene as GLB
window.exportScene = async function() {
  try {
    updateStatus('📦 Preparing export...');
    
    // Import GLTFExporter dynamically from esm.sh (properly resolves dependencies)
    const { GLTFExporter } = await import('https://esm.sh/three@0.160.0/examples/jsm/exporters/GLTFExporter.js');
    
    const exporter = new GLTFExporter();
    const scene = window.kwami.body.getScene();
    
    // Parse the entire scene with animations
    exporter.parse(
      scene,
      (result) => {
        // Create blob and download
        const blob = new Blob([result], { type: 'model/gltf-binary' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `kwami-scene-${Date.now()}.glb`;
        link.click();
        
        // Cleanup
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
        
        updateStatus('✅ Scene exported as GLB!');
      },
      (error) => {
        console.error('Export error:', error);
        updateStatus('❌ Export failed: ' + error.message);
      },
      {
        binary: true,
        animations: [], // Include animations if any
        includeCustomExtensions: true,
      }
    );
  } catch (error) {
    console.error('Failed to export scene:', error);
    updateStatus('❌ Export failed: ' + error.message);
  }
};

// Helper function to format value display
function formatValue(value, decimals = 1) {
  return Number(value).toFixed(decimals);
}

// Update value display helper
function updateValueDisplay(id, value, decimals = 1) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = formatValue(value, decimals);
  }
}

// Update all controls from current blob state
function updateAllControlsFromBlob() {
  if (!window.kwami) return;
  
  const blob = window.kwami.body.blob;
  const spikes = blob.getSpikes();
  const amplitude = blob.getAmplitude();
  const time = blob.getTime();
  const rotation = blob.getRotation();
  const colors = blob.getColors();
  const scale = blob.getScale();
  const wireframe = blob.getWireframe();
  const skin = blob.getCurrentSkin();
  const shininess = blob.getShininess();
  
  // Update spikes
  ['x', 'y', 'z'].forEach(axis => {
    const slider = document.getElementById(`spike-${axis}`);
    const display = document.getElementById(`spike-${axis}-value`);
    if (slider && display) {
      slider.value = spikes[axis];
      display.textContent = formatValue(spikes[axis], 1);
    }
  });
  
  // Update amplitude
  ['x', 'y', 'z'].forEach(axis => {
    const slider = document.getElementById(`amplitude-${axis}`);
    const display = document.getElementById(`amplitude-${axis}-value`);
    if (slider && display) {
      slider.value = amplitude[axis];
      display.textContent = formatValue(amplitude[axis], 1);
    }
  });
  
  // Update time
  ['x', 'y', 'z'].forEach(axis => {
    const slider = document.getElementById(`time-${axis}`);
    const display = document.getElementById(`time-${axis}-value`);
    if (slider && display) {
      slider.value = time[axis];
      display.textContent = formatValue(time[axis], 1);
    }
  });
  
  // Update rotation
  ['x', 'y', 'z'].forEach(axis => {
    const slider = document.getElementById(`rotation-${axis}`);
    const display = document.getElementById(`rotation-${axis}-value`);
    if (slider && display) {
      slider.value = rotation[axis];
      display.textContent = formatValue(rotation[axis], 3);
    }
  });
  
  // Update colors
  ['x', 'y', 'z'].forEach(axis => {
    const colorPicker = document.getElementById(`color-${axis}`);
    if (colorPicker) {
      colorPicker.value = colors[axis];
    }
  });

  const opacitySlider = document.getElementById('blob-opacity');
  if (opacitySlider) {
    const opacityDisplay = document.getElementById('blob-opacity-value');
    const opacity = blob.getOpacity();
    opacitySlider.value = opacity.toString();
    if (opacityDisplay) {
      opacityDisplay.textContent = formatValue(opacity, 2);
    }
  }

  const camera = window.kwami.body.getCamera();
  const cameraXSlider = document.getElementById('camera-x');
  if (cameraXSlider) {
    cameraXSlider.value = camera.position.x.toString();
    updateValueDisplay('camera-x-value', camera.position.x, 1);
  }
  const cameraYSlider = document.getElementById('camera-y');
  if (cameraYSlider) {
    cameraYSlider.value = camera.position.y.toString();
    updateValueDisplay('camera-y-value', camera.position.y, 1);
  }
  const cameraZSlider = document.getElementById('camera-z');
  if (cameraZSlider) {
    cameraZSlider.value = camera.position.z.toString();
    updateValueDisplay('camera-z-value', camera.position.z, 1);
  }
  
  // Update scale
  const scaleSlider = document.getElementById('scale');
  const scaleDisplay = document.getElementById('scale-value');
  if (scaleSlider && scaleDisplay) {
    scaleSlider.value = scale;
    scaleDisplay.textContent = formatValue(scale, 1);
  }
  
  // Update shininess
  const shininessSlider = document.getElementById('shininess');
  const shininessDisplay = document.getElementById('shininess-value');
  if (shininessSlider && shininessDisplay) {
    shininessSlider.value = shininess;
    shininessDisplay.textContent = formatValue(shininess, 0);
  }
  const lightIntensitySlider = document.getElementById('light-intensity');
  if (lightIntensitySlider) {
    lightIntensitySlider.value = blob.lightIntensity.toString();
    updateValueDisplay('light-intensity-value', blob.lightIntensity, 1);
  }
  
  // Update wireframe
  const wireframeCheckbox = document.getElementById('wireframe');
  if (wireframeCheckbox) {
    wireframeCheckbox.checked = wireframe;
  }
  
  // Update skin
  const skinSelect = document.getElementById('skin-type');
  if (skinSelect) {
    skinSelect.value = skin;
  }

  const touchStrengthSlider = document.getElementById('touch-strength');
  if (touchStrengthSlider) {
    touchStrengthSlider.value = blob.touchStrength.toString();
    updateValueDisplay('touch-strength-value', blob.touchStrength, 1);
  }

  const touchDurationSlider = document.getElementById('touch-duration');
  if (touchDurationSlider) {
    const durationSeconds = blob.touchDuration;
    touchDurationSlider.value = durationSeconds.toString();
    updateValueDisplay('touch-duration-value', durationSeconds, 0);
  }

  const maxTouchesSlider = document.getElementById('max-touches');
  if (maxTouchesSlider) {
    maxTouchesSlider.value = blob.maxTouchPoints.toString();
    updateValueDisplay('max-touches-value', blob.maxTouchPoints, 0);
  }

  const audioConfig = blob.audioEffects;
  window.audioEffects = {
    ...window.audioEffects,
    bassSpike: audioConfig.bassSpike,
    midSpike: audioConfig.midSpike,
    highSpike: audioConfig.highSpike,
    midTime: audioConfig.midTime,
    highTime: audioConfig.highTime,
    ultraTime: audioConfig.ultraTime,
    enabled: audioConfig.enabled,
    timeEnabled: audioConfig.timeEnabled,
    reactivity: audioConfig.reactivity ?? 1.9,
    sensitivity: audioConfig.sensitivity ?? 0.075,
    breathing: audioConfig.breathing ?? 0.035,
  };
  const bassSlider = document.getElementById('audio-bass-spike');
  if (bassSlider) {
    bassSlider.value = audioConfig.bassSpike.toString();
    updateValueDisplay('audio-bass-spike-value', audioConfig.bassSpike, 2);
  }
  const midSlider = document.getElementById('audio-mid-spike');
  if (midSlider) {
    midSlider.value = audioConfig.midSpike.toString();
    updateValueDisplay('audio-mid-spike-value', audioConfig.midSpike, 2);
  }
  const highSlider = document.getElementById('audio-high-spike');
  if (highSlider) {
    highSlider.value = audioConfig.highSpike.toString();
    updateValueDisplay('audio-high-spike-value', audioConfig.highSpike, 2);
  }
  const reactivitySlider = document.getElementById('audio-reactivity');
  if (reactivitySlider) {
    const reactivityValue = audioConfig.reactivity ?? window.audioEffects.reactivity;
    reactivitySlider.value = reactivityValue.toString();
    updateValueDisplay('audio-reactivity-value', reactivityValue, 2);
  }
  const sensitivitySlider = document.getElementById('audio-sensitivity');
  if (sensitivitySlider) {
    const sensitivityValue = audioConfig.sensitivity ?? window.audioEffects.sensitivity;
    sensitivitySlider.value = sensitivityValue.toString();
    updateValueDisplay('audio-sensitivity-value', sensitivityValue, 2);
  }
  const breathingSlider = document.getElementById('audio-breathing');
  if (breathingSlider) {
    const breathingValue = audioConfig.breathing ?? window.audioEffects.breathing;
    breathingSlider.value = breathingValue.toString();
    updateValueDisplay('audio-breathing-value', breathingValue, 2);
  }
  const midTimeSlider = document.getElementById('audio-mid-time');
  if (midTimeSlider) {
    midTimeSlider.value = audioConfig.midTime.toString();
    updateValueDisplay('audio-mid-time-value', audioConfig.midTime, 1);
  }
  const highTimeSlider = document.getElementById('audio-high-time');
  if (highTimeSlider) {
    highTimeSlider.value = audioConfig.highTime.toString();
    updateValueDisplay('audio-high-time-value', audioConfig.highTime, 1);
  }
  const ultraTimeSlider = document.getElementById('audio-ultra-time');
  if (ultraTimeSlider) {
    ultraTimeSlider.value = audioConfig.ultraTime.toString();
    updateValueDisplay('audio-ultra-time-value', audioConfig.ultraTime, 1);
  }
  const audioReactiveToggle = document.getElementById('audio-reactive');
  if (audioReactiveToggle) {
    audioReactiveToggle.checked = audioConfig.enabled;
  }
  const audioTimeToggle = document.getElementById('audio-time-enabled');
  if (audioTimeToggle) {
    audioTimeToggle.checked = audioConfig.timeEnabled;
  }
}

// Initialize body controls event listeners
function initializeBodyControls() {
  if (!window.kwami) return;
  
  const blob = window.kwami.body.blob;
  
  // Spikes sliders
  ['x', 'y', 'z'].forEach(axis => {
    const slider = document.getElementById(`spike-${axis}`);
    if (slider) {
      slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        const spikes = blob.getSpikes();
        spikes[axis] = value;
        blob.setSpikes(spikes.x, spikes.y, spikes.z);
        updateValueDisplay(`spike-${axis}-value`, value, 1);
      });
    }
  });
  
  // Amplitude sliders
  ['x', 'y', 'z'].forEach(axis => {
    const slider = document.getElementById(`amplitude-${axis}`);
    if (slider) {
      slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        const amplitude = blob.getAmplitude();
        amplitude[axis] = value;
        blob.setAmplitude(amplitude.x, amplitude.y, amplitude.z);
        updateValueDisplay(`amplitude-${axis}-value`, value, 1);
      });
    }
  });
  
  // Time sliders
  ['x', 'y', 'z'].forEach(axis => {
    const slider = document.getElementById(`time-${axis}`);
    if (slider) {
      slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        const time = blob.getTime();
        time[axis] = value;
        blob.setTime(time.x, time.y, time.z);
        updateValueDisplay(`time-${axis}-value`, value, 1);
      });
    }
  });
  
  // Rotation sliders
  ['x', 'y', 'z'].forEach(axis => {
    const slider = document.getElementById(`rotation-${axis}`);
    if (slider) {
      slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        const rotation = blob.getRotation();
        rotation[axis] = value;
        blob.setRotation(rotation.x, rotation.y, rotation.z);
        updateValueDisplay(`rotation-${axis}-value`, value, 3);
      });
    }
  });
  
  // Color pickers
  ['x', 'y', 'z'].forEach(axis => {
    const colorPicker = document.getElementById(`color-${axis}`);
    if (colorPicker) {
      colorPicker.addEventListener('input', (e) => {
        const value = e.target.value;
        const colors = blob.getColors();
        colors[axis] = value;
        blob.setColors(colors.x, colors.y, colors.z);
      });
    }
  });

  // Note: blob-opacity slider is handled in initializeBackgroundControls()
  
  // Scale slider
  const scaleSlider = document.getElementById('scale');
  if (scaleSlider) {
    scaleSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      console.log('Setting scale to:', value);
      blob.setScale(value);
      console.log('Scale is now:', blob.getScale());
      updateValueDisplay('scale-value', value, 1);
    });
  } else {
    console.error('Scale slider not found!');
  }
  
  // Resolution slider
  const resolutionSlider = document.getElementById('resolution');
  if (resolutionSlider) {
    resolutionSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      blob.setResolution(value);
      updateValueDisplay('resolution-value', value, 0);
    });
  }
  
  // Shininess slider
  const shininessSlider = document.getElementById('shininess');
  if (shininessSlider) {
    shininessSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      blob.setShininess(value);
      updateValueDisplay('shininess-value', value, 0);
    });
  }
  
  // Light intensity slider
  const lightIntensitySlider = document.getElementById('light-intensity');
  if (lightIntensitySlider) {
    lightIntensitySlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      blob.setLightIntensity(value);
      updateValueDisplay('light-intensity-value', value, 1);
    });
  }
  
  // Wireframe checkbox
  const wireframeCheckbox = document.getElementById('wireframe');
  if (wireframeCheckbox) {
    wireframeCheckbox.addEventListener('change', (e) => {
      blob.setWireframe(e.target.checked);
    });
  }

  // Click interaction checkbox
  const clickInteractionCheckbox = document.getElementById('click-interaction');
  if (clickInteractionCheckbox) {
    clickInteractionCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        window.kwami.enableBlobInteraction(window.conversationCallbacks);
        updateStatus('👆 Click interaction enabled - Click the blob! Double-click to start/stop conversation');
      } else {
        window.kwami.disableBlobInteraction();
        updateStatus('🚫 Click interaction disabled');
      }
    });
  }
  
  // Skin type selector
  const skinSelect = document.getElementById('skin-type');
  if (skinSelect) {
    skinSelect.addEventListener('change', (e) => {
      const appliedSkin = applySkinToBlob(e.target.value);
      updateAllControlsFromBlob();
      const skinLabel = appliedSkin ? getSkinDisplayName(appliedSkin) : getSkinDisplayName('tricolor');
      updateStatus(`👕 Changed to ${skinLabel} skin`);
    });
  }
  
  // Touch strength slider
  const touchStrengthSlider = document.getElementById('touch-strength');
  if (touchStrengthSlider) {
    touchStrengthSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      blob.touchStrength = value;
      updateValueDisplay('touch-strength-value', value, 1);
    });
  }
  
  // Touch duration slider
  const touchDurationSlider = document.getElementById('touch-duration');
  if (touchDurationSlider) {
    touchDurationSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      blob.touchDuration = value;
      updateValueDisplay('touch-duration-value', value, 0);
    });
  }
  
  // Max touches slider
  const maxTouchesSlider = document.getElementById('max-touches');
  if (maxTouchesSlider) {
    maxTouchesSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      blob.maxTouchPoints = value;
      updateValueDisplay('max-touches-value', value, 0);
    });
  }
  
  // Transition speed slider
  const transitionSpeedSlider = document.getElementById('transition-speed');
  if (transitionSpeedSlider) {
    transitionSpeedSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      blob.transitionSpeed = value;
      updateValueDisplay('transition-speed-value', value, 2);
    });
  }
  
  // Thinking duration slider
  const thinkingDurationSlider = document.getElementById('thinking-duration');
  if (thinkingDurationSlider) {
    thinkingDurationSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      blob.thinkingDuration = value * 1000; // Convert to milliseconds
      updateValueDisplay('thinking-duration-value', value, 0);
    });
  }

  // Blob Media Tabs (independent from background)
  const blobMediaTabs = document.querySelectorAll('#blob-media-tabs .media-tab');
  blobMediaTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setBlobMediaType(tab.dataset.media);
    });
  });

  // Initialize blob media to none
  setBlobMediaType('none');
}

// Helper functions (exposed globally for agent management)
window.updateStatus = function updateStatus(message) {
  const status = document.getElementById('status');
  status.textContent = message;
  
  // Auto-clear status messages after 5 seconds
  if (message) {
    setTimeout(() => {
      if (status.textContent === message) {
        status.textContent = '';
      }
    }, 5000);
  }
}

window.showError = function showError(message) {
  const error = document.getElementById('error');
  error.textContent = message;
  
  // Auto-clear error messages after 8 seconds
  if (message) {
    setTimeout(() => {
      if (error.textContent === message) {
        error.textContent = '';
      }
    }, 8000);
  }
}

function updateStateIndicator(state) {
  const indicator = document.getElementById('state-indicator');
  const stateText = document.getElementById('state-text');
  
  // Only update if elements exist (they're commented out in HTML currently)
  if (indicator && stateText) {
    indicator.className = 'state-indicator state-' + state;
    stateText.textContent = state.toUpperCase();
  }
}

// Legacy background block removed

function initializeCameraControls() {
  const camera = window.kwami.body.getCamera();
  
  const cameraXSlider = document.getElementById('camera-x');
  if (cameraXSlider) {
    cameraXSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      camera.position.x = value;
      camera.lookAt(0, 0, 0);
      updateValueDisplay('camera-x-value', value, 1);
      if (window.kwami?.body?.isBlobImageTransparencyMode?.()) {
        window.kwami.body.refreshBlobImageTransparencyMode();
      }
    });
  }
  
  const cameraYSlider = document.getElementById('camera-y');
  if (cameraYSlider) {
    cameraYSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      camera.position.y = value;
      camera.lookAt(0, 0, 0);
      updateValueDisplay('camera-y-value', value, 1);
      if (window.kwami?.body?.isBlobImageTransparencyMode?.()) {
        window.kwami.body.refreshBlobImageTransparencyMode();
      }
    });
  }
  
  const cameraZSlider = document.getElementById('camera-z');
  if (cameraZSlider) {
    cameraZSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      camera.position.z = value;
      camera.lookAt(0, 0, 0);
      updateValueDisplay('camera-z-value', value, 1);
      if (window.kwami?.body?.isBlobImageTransparencyMode?.()) {
        window.kwami.body.refreshBlobImageTransparencyMode();
      }
    });
  }
  
  if (cameraXSlider) {
    cameraXSlider.value = camera.position.x.toString();
      updateValueDisplay('camera-x-value', camera.position.x, 1);
    }
  if (cameraYSlider) {
    cameraYSlider.value = camera.position.y.toString();
      updateValueDisplay('camera-y-value', camera.position.y, 1);
    }
  if (cameraZSlider) {
    cameraZSlider.value = camera.position.z.toString();
      updateValueDisplay('camera-z-value', camera.position.z, 1);
    }
}

// Initialize agent management slider listeners
if (typeof setupAgentSliderListeners === 'function') {
  setupAgentSliderListeners();
}

// Initialize emotional trait sliders when Kwami is ready
setTimeout(() => {
  if (window.kwami && window.kwami.soul) {
    updateEmotionalTraitSliders();
    loadSavedPersonalitiesIntoSelector();
  }
}, 500);

// LocalStorage key for saved personalities
const STORAGE_KEY = 'kwami_saved_personalities';

// Load personality from selector
window.loadPersonalityFromSelector = function() {
  const selector = document.getElementById('personality-selector');
  if (!selector) return;
  
  const value = selector.value;
  if (!value) return;
  
  // Check if it's a built-in template
  const builtInTemplates = [
    // Core templates
    'friendly', 'playful', 'professional',
    // Creative & Inspiring
    'mentor', 'adventurer', 'coach', 'artistic', 'storyteller',
    // Analytical & Thoughtful
    'scientist', 'detective', 'witty', 'mysterious',
    // Calm & Supportive
    'zen', 'empathic',
    // Bold & Unconventional
    'rebel',
    // Challenging personalities
    'grumpy', 'cynical', 'sarcastic', 'melancholic', 'angry'
  ];
  
  if (builtInTemplates.includes(value)) {
    window.loadPersonality(value);
    return;
  }
  
  // Load from localStorage
  loadSavedPersonality(value);
};

// Save current personality configuration
window.savePersonalityConfig = function() {
  if (!window.kwami || !window.kwami.soul) {
    showError('Soul not initialized');
    return;
  }
  
  const nameInput = document.getElementById('save-config-name');
  const name = nameInput?.value.trim();
  
  if (!name) {
    showError('Please enter a name for this personality');
    return;
  }
  
  try {
    // Get current configuration
    const config = window.kwami.soul.createSnapshot();
    
    // Get existing saved personalities
    const saved = getSavedPersonalities();
    
    // Add or update this personality
    saved[name] = config;
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    
    // Update selector
    loadSavedPersonalitiesIntoSelector();
    
    // Clear input
    if (nameInput) nameInput.value = '';
    
    updateStatus(`💾 Saved personality: ${name}`);
  } catch (error) {
    showError('Failed to save personality: ' + error.message);
  }
};

// Load a saved personality from localStorage
function loadSavedPersonality(name) {
  try {
    const saved = getSavedPersonalities();
    const config = saved[name];
    
    if (!config) {
      showError(`Personality "${name}" not found`);
      return;
    }
    
    // Load the configuration
    if (window.kwami && window.kwami.soul) {
      window.kwami.soul.setPersonality(config);
      
      // Update UI
      updateSoulUIFromConfig(config);
      updateEmotionalTraitSliders();
      
      updateStatus(`✅ Loaded saved personality: ${name}`);
    }
  } catch (error) {
    showError('Failed to load personality: ' + error.message);
  }
}

// Delete selected saved personality
window.deleteSavedPersonality = function() {
  const selector = document.getElementById('personality-selector');
  if (!selector) return;
  
  const value = selector.value;
  if (!value || ['friendly', 'professional', 'playful'].includes(value)) {
    showError('Please select a saved personality to delete');
    return;
  }
  
  if (!confirm(`Delete personality "${value}"?`)) {
    return;
  }
  
  try {
    const saved = getSavedPersonalities();
    delete saved[value];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    
    // Reset selector
    selector.value = '';
    
    // Reload saved personalities in selector
    loadSavedPersonalitiesIntoSelector();
    
    updateStatus(`🗑️ Deleted personality: ${value}`);
  } catch (error) {
    showError('Failed to delete personality: ' + error.message);
  }
};

// Get all saved personalities from localStorage
function getSavedPersonalities() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Error reading saved personalities:', error);
    return {};
  }
}

// Load saved personalities into the selector dropdown
function loadSavedPersonalitiesIntoSelector() {
  const group = document.getElementById('saved-personalities-group');
  if (!group) return;
  
  // Clear existing options
  group.innerHTML = '';
  
  const saved = getSavedPersonalities();
  const names = Object.keys(saved);
  
  if (names.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = '(No saved personalities)';
    option.disabled = true;
    group.appendChild(option);
    return;
  }
  
  // Add saved personalities
  names.sort().forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = `💾 ${name}`;
    group.appendChild(option);
  });
}

// Update Soul UI fields from configuration
function updateSoulUIFromConfig(config) {
  const nameInput = document.getElementById('soul-name');
  const personalityInput = document.getElementById('soul-personality');
  const systemPromptInput = document.getElementById('soul-system-prompt');
  const nameDisplay = document.getElementById('personality-name');
  
  if (nameInput) nameInput.value = config.name || 'Kwami';
  if (personalityInput) personalityInput.value = config.personality || '';
  if (systemPromptInput) systemPromptInput.value = config.systemPrompt || '';
  if (nameDisplay) nameDisplay.textContent = config.name || 'Kwami';
}

// ========================================
// Skills System Functions
// ========================================

// Skill definitions
const skillDefinitions = {
  'minimize-top-right': {
    name: 'Minimize to Top Right',
    description: 'Minimizes Kwami and moves it to the top-right corner',
    actions: 2,
    autoReverse: false
  },
  'rainbow-transition': {
    name: 'Rainbow Transition',
    description: 'Cycles through rainbow colors with smooth transitions',
    actions: 7,
    autoReverse: false
  },
  'energetic-mode': {
    name: 'Energetic Mode',
    description: 'High-energy mode with faster movements and vibrant colors',
    actions: 5,
    autoReverse: true
  },
  'calm-meditation': {
    name: 'Calm Meditation',
    description: 'Calming mode with slow movements and soothing colors',
    actions: 6,
    autoReverse: false
  },
  'focus-session': {
    name: 'Focus Session',
    description: 'Pomodoro-style focus mode with greeting and minimization',
    actions: 5,
    autoReverse: false
  },
  'party-mode': {
    name: 'Party Mode',
    description: 'Celebration mode with rapid color changes and energetic movement',
    actions: 10,
    autoReverse: false
  }
};

let skillsExecutedCount = 0;

// Initialize skills when Kwami is loaded
async function initializeSkills() {
  if (!kwami || !kwami.skills) {
    console.error('Kwami skills not available');
    return;
  }

  try {
    // Load all predefined skills from templates
    const skillIds = Object.keys(skillDefinitions);
    for (const skillId of skillIds) {
      try {
        await kwami.skills.loadSkillFromUrl(`/src/core/mind/skills/templates/${skillId}.json`);
        console.log(`[Skills] Loaded skill: ${skillId}`);
      } catch (error) {
        console.warn(`[Skills] Failed to load skill ${skillId}:`, error);
      }
    }

    // Update stats
    updateSkillStats();
  } catch (error) {
    console.error('[Skills] Failed to initialize skills:', error);
  }
}

// Handle skill selection change
window.addEventListener('DOMContentLoaded', () => {
  const skillSelector = document.getElementById('skill-selector');
  if (skillSelector) {
    skillSelector.addEventListener('change', function() {
      const selectedSkill = this.value;
      const executeBtn = document.getElementById('execute-skill-btn');
      const descriptionDiv = document.getElementById('skill-description');
      
      if (selectedSkill && skillDefinitions[selectedSkill]) {
        // Show description
        const skill = skillDefinitions[selectedSkill];
        document.getElementById('skill-description-name').textContent = skill.name;
        document.getElementById('skill-description-text').textContent = skill.description;
        document.getElementById('skill-description-actions').textContent = skill.actions;
        document.getElementById('skill-description-reverse').textContent = skill.autoReverse ? 'Yes' : 'No';
        descriptionDiv.style.display = 'block';
        
        // Enable execute button
        if (executeBtn) executeBtn.disabled = false;
      } else {
        descriptionDiv.style.display = 'none';
        if (executeBtn) executeBtn.disabled = true;
      }
    });
  }
});

// Execute selected skill
window.executeSelectedSkill = async function() {
  const skillSelector = document.getElementById('skill-selector');
  const selectedSkill = skillSelector?.value;
  
  if (!selectedSkill) {
    updateStatus('⚠️ Please select a skill first');
    return;
  }

  if (!kwami || !kwami.skills) {
    updateError('Kwami skills not available. Please refresh the page.');
    return;
  }

  try {
    updateStatus(`⏳ Executing skill: ${skillDefinitions[selectedSkill]?.name || selectedSkill}...`);
    
    const startTime = Date.now();
    const result = await kwami.skills.executeSkill(selectedSkill);
    const duration = Date.now() - startTime;
    
    if (result.success) {
      // Show success message
      const statusDiv = document.getElementById('skill-execution-status');
      const messageSpan = document.getElementById('skill-execution-message');
      const durationSpan = document.getElementById('skill-execution-duration');
      
      if (statusDiv && messageSpan && durationSpan) {
        messageSpan.textContent = `✅ Skill executed successfully`;
        durationSpan.textContent = `${duration}ms`;
        statusDiv.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
          statusDiv.style.display = 'none';
        }, 5000);
      }
      
      updateStatus(`✅ Skill completed: ${skillDefinitions[selectedSkill]?.name || selectedSkill}`);
      
      // Update stats
      skillsExecutedCount++;
      updateSkillStats();
    } else {
      updateError(`❌ Skill execution failed: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('[Skills] Execution error:', error);
    updateError(`❌ Failed to execute skill: ${error.message}`);
  }
};

// Quick skill actions
window.quickSkillMinimize = async function() {
  if (!kwami) return;
  
  const skill = {
    id: 'quick-minimize',
    name: 'Quick Minimize',
    description: 'Quick minimize action',
    version: '1.0.0',
    actions: [
      {
        type: 'body.scale',
        preset: 'mini',
        duration: 600,
        easing: 'ease-in-out'
      },
      {
        type: 'body.position',
        preset: 'bottom-right',
        duration: 600,
        easing: 'ease-in-out'
      }
    ]
  };
  
  kwami.skills.registerSkill(skill);
  await kwami.skills.executeSkill('quick-minimize');
  skillsExecutedCount++;
  updateSkillStats();
  updateStatus('✅ Kwami minimized');
};

window.quickSkillCenter = async function() {
  if (!kwami) return;
  
  const skill = {
    id: 'quick-center',
    name: 'Quick Center',
    description: 'Center Kwami',
    version: '1.0.0',
    actions: [
      {
        type: 'body.scale',
        preset: 'normal',
        duration: 600,
        easing: 'ease-in-out'
      },
      {
        type: 'body.position',
        preset: 'center',
        duration: 600,
        easing: 'ease-in-out'
      }
    ]
  };
  
  kwami.skills.registerSkill(skill);
  await kwami.skills.executeSkill('quick-center');
  skillsExecutedCount++;
  updateSkillStats();
  updateStatus('✅ Kwami centered');
};

window.quickSkillEnergize = async function() {
  if (!kwami) return;
  
  const skill = {
    id: 'quick-energize',
    name: 'Quick Energize',
    description: 'Energize Kwami',
    version: '1.0.0',
    actions: [
      {
        type: 'sequence',
        parallel: true,
        actions: [
          {
            type: 'body.colors',
            primary: '#ff6b35',
            secondary: '#f7931e',
            accent: '#fdc300',
            duration: 500
          },
          {
            type: 'body.spikes',
            x: 0.8,
            y: 0.8,
            z: 0.8
          },
          {
            type: 'body.time',
            x: 3.0,
            y: 3.0,
            z: 3.0
          }
        ]
      }
    ]
  };
  
  kwami.skills.registerSkill(skill);
  await kwami.skills.executeSkill('quick-energize');
  skillsExecutedCount++;
  updateSkillStats();
  updateStatus('⚡ Kwami energized');
};

window.quickSkillCalm = async function() {
  if (!kwami) return;
  
  const skill = {
    id: 'quick-calm',
    name: 'Quick Calm',
    description: 'Calm Kwami',
    version: '1.0.0',
    actions: [
      {
        type: 'sequence',
        parallel: true,
        actions: [
          {
            type: 'body.colors',
            primary: '#3a86ff',
            secondary: '#8338ec',
            accent: '#b8b8ff',
            duration: 1000
          },
          {
            type: 'body.spikes',
            x: 0.1,
            y: 0.1,
            z: 0.1
          },
          {
            type: 'body.time',
            x: 0.3,
            y: 0.3,
            z: 0.3
          }
        ]
      }
    ]
  };
  
  kwami.skills.registerSkill(skill);
  await kwami.skills.executeSkill('quick-calm');
  skillsExecutedCount++;
  updateSkillStats();
  updateStatus('🧘 Kwami calmed');
};

window.quickSkillParty = async function() {
  if (!kwami) return;
  
  try {
    await kwami.skills.executeSkill('party-mode');
    skillsExecutedCount++;
    updateSkillStats();
    updateStatus('🎉 Party mode activated!');
  } catch (error) {
    updateError('Failed to activate party mode');
  }
};

window.quickSkillReset = async function() {
  if (!kwami) return;
  
  const skill = {
    id: 'quick-reset',
    name: 'Quick Reset',
    description: 'Reset to defaults',
    version: '1.0.0',
    actions: [
      {
        type: 'sequence',
        parallel: true,
        actions: [
          {
            type: 'body.scale',
            preset: 'normal',
            duration: 800,
            easing: 'ease-in-out'
          },
          {
            type: 'body.position',
            preset: 'center',
            duration: 800,
            easing: 'ease-in-out'
          },
          {
            type: 'body.spikes',
            x: 0.2,
            y: 0.2,
            z: 0.2
          },
          {
            type: 'body.time',
            x: 1.0,
            y: 1.0,
            z: 1.0
          },
          {
            type: 'body.rotation',
            x: 0,
            y: 0,
            z: 0
          }
        ]
      }
    ]
  };
  
  kwami.skills.registerSkill(skill);
  await kwami.skills.executeSkill('quick-reset');
  skillsExecutedCount++;
  updateSkillStats();
  updateStatus('🔄 Kwami reset to defaults');
};

// Load custom skill from URL
window.loadCustomSkill = async function() {
  const urlInput = document.getElementById('custom-skill-url');
  const url = urlInput?.value.trim();
  
  if (!url) {
    updateStatus('⚠️ Please enter a skill URL');
    return;
  }

  if (!kwami || !kwami.skills) {
    updateError('Kwami skills not available');
    return;
  }

  try {
    updateStatus('⏳ Loading skill from URL...');
    await kwami.skills.loadSkillFromUrl(url);
    updateStatus('✅ Custom skill loaded successfully');
    updateSkillStats();
    
    // Clear input
    if (urlInput) urlInput.value = '';
  } catch (error) {
    console.error('[Skills] Failed to load custom skill:', error);
    updateError(`❌ Failed to load skill: ${error.message}`);
  }
};

// Load skill from file
window.loadSkillFromFile = async function(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!kwami || !kwami.skills) {
    updateError('Kwami skills not available');
    return;
  }

  try {
    updateStatus('⏳ Loading skill from file...');
    
    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        const content = e.target.result;
        kwami.skills.loadSkillFromString(content, 'json');
        updateStatus(`✅ Loaded skill from ${file.name}`);
        updateSkillStats();
      } catch (error) {
        console.error('[Skills] Failed to parse skill file:', error);
        updateError(`❌ Invalid skill file: ${error.message}`);
      }
    };
    
    reader.readAsText(file);
  } catch (error) {
    console.error('[Skills] Failed to load skill file:', error);
    updateError(`❌ Failed to load file: ${error.message}`);
  }
};

// Update skill statistics
function updateSkillStats() {
  const totalEl = document.getElementById('skills-total');
  const executedEl = document.getElementById('skills-executed');
  
  if (kwami && kwami.skills) {
    const stats = kwami.skills.getStats();
    if (totalEl) totalEl.textContent = stats.totalSkills;
  }
  
  if (executedEl) executedEl.textContent = skillsExecutedCount;
}

// ========================================
// Media Loader Integration
// ========================================

// Image presets for backgrounds and blob textures
const IMAGE_PRESETS = [
  { name: 'Alaska', value: 'playground/assets/img/bg/alaska.jpeg' },
  { name: 'Binary Reality', value: 'playground/assets/img/bg/binary-reality.jpg' },
  { name: 'Black Candle', value: 'playground/assets/img/bg/black-candle.jpg' },
  { name: 'Black Hole', value: 'playground/assets/img/bg/black-hole.jpg' },
  { name: 'Black Sea', value: 'playground/assets/img/bg/black-sea.jpg' },
  { name: 'Black Windows', value: 'playground/assets/img/bg/black-windows.jpg' },
  { name: 'Black', value: 'playground/assets/img/bg/black.jpg' },
  { name: 'Colors', value: 'playground/assets/img/bg/colors.jpeg' },
  { name: 'Galaxy', value: 'playground/assets/img/bg/galaxy.jpg' },
  { name: 'Galaxy 2', value: 'playground/assets/img/bg/galaxy2.jpg' },
  { name: 'Galaxy 3', value: 'playground/assets/img/bg/galaxy3.jpg' },
  { name: 'Galaxy 4', value: 'playground/assets/img/bg/galaxy4.jpg' },
  { name: 'Gargantua', value: 'playground/assets/img/bg/gargantua.jpg' },
  { name: 'Interstellar', value: 'playground/assets/img/bg/interstellar.png' },
  { name: 'Island', value: 'playground/assets/img/bg/islan.jpg' },
  { name: 'Lake', value: 'playground/assets/img/bg/lake.jpg' },
  { name: 'Mountain', value: 'playground/assets/img/bg/mountain.jpeg' },
  { name: 'Paisaje', value: 'playground/assets/img/bg/paisaje.jpg' },
  { name: 'Pik', value: 'playground/assets/img/bg/pik.jpg' },
  { name: 'Planet', value: 'playground/assets/img/bg/planet.jpg' },
  { name: 'Planet 2', value: 'playground/assets/img/bg/planet2.jpg' },
  { name: 'Planet 3', value: 'playground/assets/img/bg/planet3.jpg' },
  { name: 'Sahara', value: 'playground/assets/img/bg/sahara.jpeg' },
  { name: 'Skinet', value: 'playground/assets/img/bg/skinet.png' },
  { name: 'Skynet', value: 'playground/assets/img/bg/skynet.png' },
  { name: 'Universe', value: 'playground/assets/img/bg/universe.jpg' },
  { name: 'White Tree', value: 'playground/assets/img/bg/white-tree.jpg' }
];

// Video presets
const VIDEO_PRESETS = [
  // Local videos
  { name: 'Stars (Local)', value: 'playground/assets/vid/bg/stars.mp4' },

  // Pexels videos - Space & Abstract
  { name: 'Cosmic Nebula 1', value: 'https://videos.pexels.com/video-files/6394054/6394054-uhd_2732_1366_24fps.mp4' },
  { name: 'Galaxy Swirl', value: 'https://videos.pexels.com/video-files/1448735/1448735-uhd_2732_1440_24fps.mp4' },
  { name: 'Abstract Waves 1', value: 'https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4' },
  { name: 'Smoke Art 1', value: 'https://videos.pexels.com/video-files/8820216/8820216-uhd_2560_1440_25fps.mp4' },
  { name: 'Liquid Gold', value: 'https://videos.pexels.com/video-files/4763824/4763824-uhd_2560_1440_24fps.mp4' },
  { name: 'Abstract Flow 1', value: 'https://videos.pexels.com/video-files/5946371/5946371-uhd_2560_1440_30fps.mp4' },
  { name: 'Particle Storm', value: 'https://videos.pexels.com/video-files/3214448/3214448-uhd_2560_1440_25fps.mp4' },
  { name: 'Digital Waves', value: 'https://videos.pexels.com/video-files/2098989/2098989-uhd_2560_1440_30fps.mp4' },
  { name: 'Smoke Art 2', value: 'https://videos.pexels.com/video-files/4205697/4205697-uhd_2560_1440_30fps.mp4' },
  { name: 'Fluid Motion 1', value: 'https://videos.pexels.com/video-files/4125029/4125029-uhd_2560_1440_24fps.mp4' },
  
  // Pexels videos - Colorful Abstract
  { name: 'Rainbow Smoke', value: 'https://videos.pexels.com/video-files/4873244/4873244-uhd_2560_1440_25fps.mp4' },
  { name: 'Ink in Water 1', value: 'https://videos.pexels.com/video-files/4927963/4927963-uhd_2732_1440_30fps.mp4' },
  { name: 'Neon Lights 1', value: 'https://videos.pexels.com/video-files/5173766/5173766-uhd_2560_1440_30fps.mp4' },
  { name: 'Abstract Colors 1', value: 'https://videos.pexels.com/video-files/5581999/5581999-uhd_2560_1440_30fps.mp4' },
  { name: 'Plasma Effect', value: 'https://videos.pexels.com/video-files/6212548/6212548-uhd_2560_1440_25fps.mp4' },
  { name: 'Bokeh Lights 1', value: 'https://videos.pexels.com/video-files/1851190/1851190-uhd_2560_1440_25fps.mp4' },
  { name: 'Neon Glow', value: 'https://videos.pexels.com/video-files/2611250/2611250-uhd_2560_1440_30fps.mp4' },
  { name: 'Light Rays 1', value: 'https://videos.pexels.com/video-files/5155396/5155396-uhd_2560_1440_30fps.mp4' },
  { name: 'Abstract Gradient 1', value: 'https://videos.pexels.com/video-files/5453622/5453622-uhd_2560_1440_24fps.mp4' },
  { name: 'Color Smoke 1', value: 'https://videos.pexels.com/video-files/5382333/5382333-uhd_2560_1440_30fps.mp4' },
  
  // Pexels videos - Energy & Motion
  { name: 'Energy Field 1', value: 'https://videos.pexels.com/video-files/9341381/9341381-uhd_2560_1440_24fps.mp4' },
  { name: 'Particle Flow 1', value: 'https://videos.pexels.com/video-files/5167233/5167233-uhd_2560_1440_30fps.mp4' },
  { name: 'Abstract Motion 1', value: 'https://videos.pexels.com/video-files/5170522/5170522-uhd_2560_1440_30fps.mp4' },
  { name: 'Fluid Motion 2', value: 'https://videos.pexels.com/video-files/4182916/4182916-uhd_2560_1440_30fps.mp4' },
  { name: 'Cosmic Energy', value: 'https://videos.pexels.com/video-files/10477097/10477097-uhd_2560_1440_24fps.mp4' },
  { name: 'Abstract Flow 2', value: 'https://videos.pexels.com/video-files/19145265/19145265-uhd_2560_1440_24fps.mp4' },
  { name: 'Bokeh Lights 2', value: 'https://videos.pexels.com/video-files/856857/856857-uhd_2732_1440_30fps.mp4' },
  { name: 'Light Show 1', value: 'https://videos.pexels.com/video-files/855835/855835-hd_1920_1080_30fps.mp4' },
  { name: 'Neon Lights 2', value: 'https://videos.pexels.com/video-files/3141208/3141208-uhd_2560_1440_25fps.mp4' },
  { name: 'Neon Lights 3', value: 'https://videos.pexels.com/video-files/3141209/3141209-uhd_2560_1440_25fps.mp4' },
  
  // Pexels videos - Dark & Mystical
  { name: 'Dark Waves', value: 'https://videos.pexels.com/video-files/3059861/3059861-uhd_2560_1440_25fps.mp4' },
  { name: 'Black Smoke', value: 'https://videos.pexels.com/video-files/2715412/2715412-uhd_2560_1440_30fps.mp4' },
  { name: 'Ink Bloom', value: 'https://videos.pexels.com/video-files/5649204/5649204-uhd_2560_1440_25fps.mp4' },
  { name: 'Dark Glow', value: 'https://videos.pexels.com/video-files/854999/854999-uhd_2560_1440_30fps.mp4' },
  { name: 'Mystic Flow', value: 'https://videos.pexels.com/video-files/6051402/6051402-uhd_2560_1440_25fps.mp4' },
  { name: 'Abstract Waves 2', value: 'https://videos.pexels.com/video-files/3571195/3571195-uhd_2560_1440_30fps.mp4' },
  { name: 'Smoke Art 3', value: 'https://videos.pexels.com/video-files/4205790/4205790-uhd_1920_1440_30fps.mp4' },
  { name: 'Dark Energy', value: 'https://videos.pexels.com/video-files/10490756/10490756-uhd_2560_1440_30fps.mp4' },
  { name: 'Black Ink', value: 'https://videos.pexels.com/video-files/2334654/2334654-uhd_2560_1440_30fps.mp4' },
  { name: 'Shadow Flow', value: 'https://videos.pexels.com/video-files/2110771/2110771-uhd_2560_1440_30fps.mp4' },
  
  // Pexels videos - Organic & Natural
  { name: 'Ink in Water 2', value: 'https://videos.pexels.com/video-files/2711116/2711116-uhd_2560_1440_24fps.mp4' },
  { name: 'Color Diffusion 1', value: 'https://videos.pexels.com/video-files/2063228/2063228-uhd_2560_1440_24fps.mp4' },
  { name: 'Liquid Art 1', value: 'https://videos.pexels.com/video-files/4259460/4259460-uhd_2560_1440_25fps.mp4' },
  { name: 'Fluid Dynamics 1', value: 'https://videos.pexels.com/video-files/4125031/4125031-uhd_2560_1440_24fps.mp4' },
  { name: 'Ink Spread 1', value: 'https://videos.pexels.com/video-files/5796436/5796436-uhd_2560_1440_30fps.mp4' },
  { name: 'Color Mix 1', value: 'https://videos.pexels.com/video-files/4423694/4423694-uhd_2560_1440_30fps.mp4' },
  { name: 'Liquid Color 1', value: 'https://videos.pexels.com/video-files/5828446/5828446-uhd_2560_1440_24fps.mp4' },
  { name: 'Ink Flow 1', value: 'https://videos.pexels.com/video-files/2856781/2856781-uhd_2560_1440_30fps.mp4' },
  { name: 'Abstract Paint 1', value: 'https://videos.pexels.com/video-files/5396819/5396819-uhd_2560_1440_30fps.mp4' },
  { name: 'Abstract Paint 2', value: 'https://videos.pexels.com/video-files/5396826/5396826-uhd_2560_1440_30fps.mp4' },
  
  // Pexels videos - Vibrant & Dynamic
  { name: 'Color Burst 1', value: 'https://videos.pexels.com/video-files/5538822/5538822-uhd_2560_1440_30fps.mp4' },
  { name: 'Abstract Paint 3', value: 'https://videos.pexels.com/video-files/5396825/5396825-uhd_2560_1440_30fps.mp4' },
  { name: 'Color Explosion', value: 'https://videos.pexels.com/video-files/7031954/7031954-uhd_2560_1440_24fps.mp4' },
  { name: 'Vibrant Flow 1', value: 'https://videos.pexels.com/video-files/3108007/3108007-uhd_2560_1440_25fps.mp4' },
  { name: 'Dynamic Abstract 1', value: 'https://videos.pexels.com/video-files/3130182/3130182-uhd_2560_1440_30fps.mp4' },
  { name: 'Color Dance 1', value: 'https://videos.pexels.com/video-files/3129576/3129576-uhd_2560_1440_30fps.mp4' },
  { name: 'Psychedelic 1', value: 'https://videos.pexels.com/video-files/10755266/10755266-hd_2560_1440_30fps.mp4' },
  { name: 'Color Wave 1', value: 'https://videos.pexels.com/video-files/3129902/3129902-uhd_2560_1440_25fps.mp4' },
  { name: 'Abstract Blend 1', value: 'https://videos.pexels.com/video-files/3129785/3129785-uhd_2560_1440_25fps.mp4' },
  { name: 'Gradient Flow 1', value: 'https://videos.pexels.com/video-files/6804117/6804117-uhd_2732_1440_25fps.mp4' },
  
  // Pexels videos - Ethereal & Dreamy
  { name: 'Ethereal Glow 1', value: 'https://videos.pexels.com/video-files/5925291/5925291-uhd_2560_1440_24fps.mp4' },
  { name: 'Dreamy Smoke 1', value: 'https://videos.pexels.com/video-files/8721932/8721932-uhd_2732_1440_25fps.mp4' },
  { name: 'Soft Motion 1', value: 'https://videos.pexels.com/video-files/10532470/10532470-uhd_2560_1440_30fps.mp4' },
  { name: 'Ambient Flow 1', value: 'https://videos.pexels.com/video-files/14003675/14003675-uhd_2560_1440_60fps.mp4' },
  { name: 'Gentle Waves 1', value: 'https://videos.pexels.com/video-files/11274330/11274330-uhd_2560_1440_25fps.mp4' },
  { name: 'Dreamy Smoke 2', value: 'https://videos.pexels.com/video-files/8720758/8720758-uhd_2732_1440_25fps.mp4' },
  { name: 'Soft Glow 1', value: 'https://videos.pexels.com/video-files/6346224/6346224-uhd_2732_1440_25fps.mp4' },
  { name: 'Ethereal Motion 1', value: 'https://videos.pexels.com/video-files/8379231/8379231-uhd_2560_1440_25fps.mp4' },
  { name: 'Pastel Flow 1', value: 'https://videos.pexels.com/video-files/3094026/3094026-uhd_2560_1440_30fps.mp4' },
  { name: 'Misty Abstract 1', value: 'https://videos.pexels.com/video-files/3089895/3089895-uhd_2560_1440_30fps.mp4' }
];

/**
 * Initialize Media Loader UI components
 * Creates the media loader UI for all media upload areas
 */
function initializeMediaLoaders() {
  // Background Image Loader
  const bgImageContainer = document.getElementById('bg-image-loader');
  if (bgImageContainer && !bgImageContainer.hasChildNodes()) {
    const bgImageLoader = createMediaLoaderUI({
      type: 'image',
      label: 'Background Image',
      presets: IMAGE_PRESETS,
      showPresets: true,
      onLoad: (url, source) => {
        const resolved = resolveMediaPath(url);
        setMediaType('image');
        setBackgroundImage(resolved);
        updateStatus(`🖼️ Background image loaded from ${source}`);
      },
      onError: (error) => {
        updateError(`Failed to load background image: ${error.message}`);
      }
    });
    bgImageContainer.appendChild(bgImageLoader);
  }

  // Background Video Loader
  const bgVideoContainer = document.getElementById('bg-video-loader');
  if (bgVideoContainer && !bgVideoContainer.hasChildNodes()) {
    const bgVideoLoader = createMediaLoaderUI({
      type: 'video',
      label: 'Background Video',
      presets: VIDEO_PRESETS,
      showPresets: true,
      onLoad: (url, source) => {
        const resolved = resolveMediaPath(url);
        setMediaType('video');
        setBackgroundVideo(resolved);
        updateStatus(`🎥 Background video loaded from ${source}`);
      },
      onError: (error) => {
        updateError(`Failed to load background video: ${error.message}`);
      }
    });
    bgVideoContainer.appendChild(bgVideoLoader);
  }

  // Blob Texture Image Loader
  const blobImageContainer = document.getElementById('blob-image-loader');
  if (blobImageContainer && !blobImageContainer.hasChildNodes()) {
    const blobImageLoader = createMediaLoaderUI({
      type: 'image',
      label: 'Blob Texture Image',
      presets: IMAGE_PRESETS,
      showPresets: true,
      onLoad: (url, source) => {
        const resolved = resolveMediaPath(url);
        setBlobMediaType('image');
        window.kwami?.body?.setBlobSurfaceImage(resolved);
        updateStatus(`🖼️ Blob texture loaded from ${source}`);
      },
      onError: (error) => {
        updateError(`Failed to load blob texture: ${error.message}`);
      }
    });
    blobImageContainer.appendChild(blobImageLoader);
  }

  // Blob Texture Video Loader
  const blobVideoContainer = document.getElementById('blob-video-loader');
  if (blobVideoContainer && !blobVideoContainer.hasChildNodes()) {
    const blobVideoLoader = createMediaLoaderUI({
      type: 'video',
      label: 'Blob Texture Video',
      presets: VIDEO_PRESETS,
      showPresets: true,
      onLoad: (url, source) => {
        const resolved = resolveMediaPath(url);
        setBlobMediaType('video');
        window.kwami?.body?.setBlobSurfaceVideo(resolved, { autoplay: true, loop: true, muted: true });
        updateStatus(`🎥 Blob video texture loaded from ${source}`);
      },
      onError: (error) => {
        updateError(`Failed to load blob video texture: ${error.message}`);
      }
    });
    blobVideoContainer.appendChild(blobVideoLoader);
  }

  console.log('[MediaLoader] Media loader UI components initialized');
}

// Initialize media loaders when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMediaLoaders);
} else {
  initializeMediaLoaders();
}

// Export for external use
window.initializeMediaLoaders = initializeMediaLoaders;
