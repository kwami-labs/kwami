// Black Hole Renderer - Cosmic Event Horizon Effect

export { BlackHole } from './BlackHole'
export { getDefaultBlackHoleConfig, colorSchemePresets, getColorsForScheme, getEffectsForScheme } from './config'
export {
  createDiskUniforms,
  createDiskMaterial,
  createStarUniforms,
  createStarMaterial,
  createEventHorizonUniforms,
  createEventHorizonMaterial,
  createLensingUniforms,
  lensingShader,
  updateDiskColors,
} from './materials'
export type {
  BlackHoleColorScheme,
  BlackHoleColorSchemeSelection,
  BlackHoleCoreConfig,
  BlackHoleDiskConfig,
  BlackHoleDiskColors,
  BlackHoleStarsConfig,
  BlackHoleAnimationConfig,
  BlackHoleEffectsConfig,
  BlackHoleAudioEffects,
  BlackHoleConfig,
  BlackHoleOptions,
  ColorSchemePreset,
  DiskShaderUniforms,
  StarShaderUniforms,
  EventHorizonShaderUniforms,
  LensingShaderUniforms,
} from './types'
