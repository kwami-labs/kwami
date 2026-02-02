export { Avatar } from './Avatar'
export { Scene } from './scene'
export { KwamiAudio } from './audio'
export { BlobXyz, BlobXyzPosition, defaultBlobXyzConfig, createSkin } from './renderers/blob-xyz'
export { Crystal, defaultCrystalConfig } from './renderers/crystal'
export { CrystalBall, defaultCrystalBallConfig } from './renderers/crystal-ball'
export * from './renderers/types'

// Re-export blob types for convenience
export type {
  BlobXyzConfig,
  BlobXyzOptions,
  BlobXyzSkinSelection,
  BlobXyzSkin,
  TricolorSubtype,
  TricolorSkinConfig,
  BlobXyzAudioEffects,
} from './renderers/blob-xyz/types'

// Re-export crystal types for convenience
export type {
  CrystalFormation,
  CoreStyle,
  CrystalFormationSelection,
  ShardConfig,
  CoreConfig,
  CrystalAudioEffects,
  CrystalConfig,
  CrystalOptions,
  FormationConfig,
} from './renderers/crystal/types'

// Re-export crystal ball types for convenience
export type {
  CrystalBallStyle,
  CrystalBallStyleSelection,
  VolumeConfig,
  CrystalBallAnimationConfig,
  CrystalBallAudioEffects,
  CrystalBallConfig as CrystalBallRendererConfig,
  CrystalBallOptions,
  CrystalBallOptionsConfig,
  StyleConfig as CrystalBallStyleConfig,
} from './renderers/crystal-ball/types'
