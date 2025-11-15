/**
 * @kwami - A 3D Interactive AI Companion Library
 *
 * Kwami is a reusable library for creating interactive 3D AI companions
 * with visual (blob), audio, and AI capabilities.
 *
 * @example
 * ```typescript
 * import { Kwami } from '@kwami';
 *
 * const canvas = document.querySelector('canvas');
 * const kwami = new Kwami(canvas, {
 *   body: {
 *     audioFiles: ['/audio/track1.mp3'],
 *     initialSkin: 'tricolor'
 *   }
 * });
 *
 * // Play audio
 * kwami.body.audio.play();
 *
 * // Randomize appearance
 * kwami.body.blob.setRandomBlob();
 * ```
 */

// Main exports
export { Kwami } from './src/core/Kwami';
export { KwamiBody } from './src/core/body/Body';
export { KwamiAudio } from './src/core/body/Audio';
export { KwamiMind } from './src/core/mind/Mind';
export { KwamiSoul } from './src/core/soul/Soul';
export { Blob } from './src/core/body/blob/Blob';

// Utilities
export * from './src/utils/randoms';
export { default as SpeechSynthesisRecorder } from './src/utils/recorder';

// Scene setup
export { Scene } from './src/core/body/scene/Scene';

// Skins
export { createSkin, createTricolorSkin, createZebraSkin } from './src/core/body/blob/skins';

// Configuration
export { defaultBlobConfig } from './src/core/body/blob/config';

// Types
export type {
  KwamiConfig,
  KwamiState,
  BodyConfig,
  AudioConfig,
  SceneConfig,
  BlobConfig,
  BlobSkinType,
  BlobOptions,
  MindConfig,
  SoulConfig,
  VoiceSettings,
  TricolorSkinConfig,
  ZebraSkinConfig,
  EventHandler,
  EventHandlers,
} from './src/types';

// Soul personality templates
export type { PersonalityTemplate } from './src/core/soul/templates/loader';
export { getAvailablePersonalities, getPersonalityTemplate } from './src/core/soul/templates/loader';

// Default export
export { Kwami as default } from './src/core/Kwami';
