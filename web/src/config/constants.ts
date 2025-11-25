/**
 * Application Constants
 */

// Video files from public/video/ directory
// Also supports YouTube URLs
export const VIDEO_FILES = [
  '/video/BLACKPINK - \u2018Shut Down\u2019 MV.mp4',
  '/video/BLACKPINK - \u2018\uB6F0\uC5B4(JUMP)\u2019 MV.mp4',
  // YouTube videos
  'https://www.youtube.com/watch?v=DRFHklnN-SM', // Jazz
  'https://www.youtube.com/watch?v=POe9SOEKotk', // BLACKPINK - Shut Down
  'https://www.youtube.com/watch?v=7lTqB6lcHjY', // BLACKPINK - JUMP
];

// Music files from public/music/ directory
export const MUSIC_FILES = [
  '/music/Tove Lo - Habits (Stay High) - Hippie Sabotage Remix.mp3',
  '/music/Alexiane - A Million on My Soul (From Valerian and the City of a Thousand Planets).mp3',
  '/music/Benson Boone - Beautiful Things (Live from the 67th GRAMMY Awards).mp3',
  '/music/RagnBone Man - Human (Official Video).mp3',
  '/music/Sigma ft Paloma Faith - Changing (Official Video).mp3',
  "/music/BLACKPINK - 'Pink Venom' MV.mp3",
  "/music/BLACKPINK - 'Shut Down' MV.mp3",
  "/music/BLACKPINK - '뛰어(JUMP)' MV.mp3",
  '/music/Dennis Lloyd - GFY (Official Video).mp3',
  '/music/Eladio Carrion - Branzino.mp3',
  '/music/OTYKEN - STORM (Official Music Video).mp3',
];

// Voice files from public/voices/ directory - for random voice playback
// Page-specific voice files are handled by PageAudioManager
export const VOICE_FILES: string[] = [];

// Playground URL
export const PLAYGROUND_URL = 'https://pg.kwami.io';

// RTL Languages
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

// Lowpass filter settings
export const LOWPASS_OPEN_FREQUENCY = 18000;
export const LOWPASS_CLOSED_FREQUENCY = 420;

// Animation timing
export const RANDOM_UPDATE_INTERVAL = 2000; // ms

// Sidebar animation timing
export const SIDE_TRANSITION_MS = 350;
export const WAVE_ANIMATION_MS = 520;
export const WAVE_DELAY_MS = 70;

// Blob settings
export const BLOB_SCALE_MOBILE = 4.5;
export const BLOB_SCALE_DESKTOP = 5.5;
export const BLOB_OPACITY_MOBILE = 0.8;
export const BLOB_OPACITY_DESKTOP = 1.0;

// Mobile breakpoint
export const MOBILE_BREAKPOINT = 1024; // px

