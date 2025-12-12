/**
 * Configuration and Constants
 * 
 * Centralized configuration for the Kwami Playground
 * All magic numbers and default values should be defined here
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface ColorSet {
  x: string;
  y: string;
  z: string;
}

export interface DefaultValuesConfig {
  spike: Vec3;
  amplitude: Vec3;
  time: Vec3;
  rotation: Vec3;
  colors: ColorSet;
  scale: number;
  resolution: number;
  shininess: number;
  lightIntensity: number;
  wireframe: boolean;
}

export interface BackgroundConfig {
  type: string;
  opacity: number;
  colors: string[];
  stops: number[];
  angle: number;
  style: string;
  image: string | null;
  video: string | null;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_VALUES: DefaultValuesConfig = {
  spike: { x: 0.2, y: 0.2, z: 0.2 },
  amplitude: { x: 0.8, y: 0.8, z: 0.8 },
  time: { x: 5, y: 5, z: 5 },
  rotation: { x: 0, y: 0, z: 0 },
  colors: { x: '#ff0066', y: '#00ff66', z: '#6600ff' },
  scale: 3.2,
  resolution: 180,
  shininess: 50,
  lightIntensity: 0,
  wireframe: false
};

export const DEFAULT_CAMERA_POSITION: Vec3 = {
  x: -0.9,
  y: 7.3,
  z: -1.8
};

export const DEFAULT_BACKGROUND: BackgroundConfig = {
  type: 'gradient',
  opacity: 1.0,
  colors: ['#667eea', '#764ba2', '#f093fb'],
  stops: [50, 100],
  angle: 90,
  style: 'linear',
  image: null,
  video: null
};

// ============================================================================
// SKIN CONFIGURATION
// ============================================================================

export const SKIN_COLLECTION_NAME: string = '3Colors';

export const SKIN_NAME_ALIASES: Record<string, string> = {
  'tricolor': 'tricolor',
  'tricolor2': 'tricolor2',
  'zebra': 'zebra',
  '3Colors-0-tricolor': 'tricolor',
  '3Colors-1-tricolor2': 'tricolor2',
  '3Colors-2-zebra': 'zebra'
};

export const SKIN_VARIANT_LABELS: Record<string, string> = {
  'tricolor': '3Colors - Poles',
  'tricolor2': '3Colors - Donut',
  'zebra': '3Colors - Vintage'
};

export const SKIN_RANDOMIZATION_TEMPLATE: string[] = [
  'tricolor',
  'tricolor2',
  'zebra',
  'tricolor',
  'tricolor2',
  'zebra'
];

// ============================================================================
// MEDIA ASSETS
// ============================================================================

export const BACKGROUND_IMAGES: readonly string[] = [
  '/img/bg/alaska.jpeg',
  '/img/bg/binary-reality.jpg',
  '/img/bg/black-candle.jpg',
  '/img/bg/black-hole.jpg',
  '/img/bg/black-sea.jpg',
  '/img/bg/black-windows.jpg',
  '/img/bg/black.jpg',
  '/img/bg/colors.jpeg',
  '/img/bg/galaxy.jpg',
  '/img/bg/galaxy2.jpg',
  '/img/bg/galaxy3.jpg',
  '/img/bg/galaxy4.jpg',
  '/img/bg/gargantua.jpg',
  '/img/bg/interstellar.png',
  '/img/bg/islan.jpg',
  '/img/bg/lake.jpg',
  '/img/bg/mountain.jpeg',
  '/img/bg/paisaje.jpg',
  '/img/bg/pik.jpg',
  '/img/bg/planet.jpg',
  '/img/bg/planet2.jpg',
  '/img/bg/planet3.jpg',
  '/img/bg/sahara.jpeg',
  '/img/bg/skinet.png',
  '/img/bg/skynet.png',
  '/img/bg/universe.jpg',
  '/img/bg/white-tree.jpg'
];

export const IMAGE_PRESETS = BACKGROUND_IMAGES.map(path => {
  const name = path.split('/').pop().split('.')[0].replace(/-/g, ' ');
  return { name: name.charAt(0).toUpperCase() + name.slice(1), value: path };
});

export const VIDEO_PRESETS = [
  { name: 'AI Loader (Black)', value: '/vid/bg/ai-loader-black.mp4' },
  { name: 'AI Loader (White)', value: '/vid/bg/ai-loader-white.mp4' },
  { name: 'Stars', value: '/vid/bg/stars.mp4' }
];

// Music playlist - empty by default in pg app
// Users can load their own audio files via the audio player
export const MUSIC_PLAYLIST: ReadonlyArray<{ name: string; url: string }> = [
  // Empty by default - music files not included in pg build
  // Use the "Load Audio" button (📂) in the audio player to add music
];

// ============================================================================
// AUDIO CONFIGURATION
// ============================================================================

export const AUDIO_DEFAULTS = {
  fftSize: 2048,
  smoothing: 0.35,
  reactivity: 1.90,
  sensitivity: 0.08,
  breathing: 0.04,
  bassSpike: 0.65,
  midSpike: 0.50,
  highSpike: 0.38,
  timeEnabled: false,
  midTime: 0.10,
  highTime: 0.18,
  ultraTime: 0.08
};

// ============================================================================
// INTERACTION CONFIGURATION
// ============================================================================

export const INTERACTION_DEFAULTS = {
  enabled: true,
  touchStrength: 1.0,
  touchDuration: 1100,
  maxTouches: 5,
  transitionSpeed: 0.05,
  thinkingDuration: 10
};

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  PERSONALITIES: 'kwami_saved_personalities',
  THEME: 'kwami_theme',
  APP_COLOR: 'kwami_app_color',
  GLASS_EFFECT: 'kwami_glass_effect',
  LAST_CONFIG: 'kwami_last_config'
};

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  GITHUB_REPO: 'alexcolls/kwami',
  GITHUB_API_URL: 'https://api.github.com/repos/alexcolls/kwami',
  ELEVENLABS_API_BASE: 'https://api.elevenlabs.io/v1'
};

// ============================================================================
// UI CONFIGURATION
// ============================================================================

export const UI_CONFIG = {
  SIDEBAR_TRANSITION_DURATION: 300, // milliseconds
  MESSAGE_AUTO_DISMISS: 5000, // milliseconds
  ERROR_AUTO_DISMISS: 8000, // milliseconds
  DEBOUNCE_DELAY: 16, // ~60fps
  MOBILE_BREAKPOINT: 768 // pixels
};

