export { Avatar } from './Avatar'
export { Scene } from './scene'
export { KwamiAudio } from './audio'
export { BlobXyz, BlobXyzPosition, defaultBlobXyzConfig, createSkin } from './renderers/blob-xyz'
export { OrbitalShards, defaultOrbitalShardsConfig } from './renderers/orbital-shards'
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

// Re-export orbital shards types for convenience
export type {
  OrbitalShardsFormation,
  CoreStyle,
  OrbitalShardsFormationSelection,
  ShardConfig,
  CoreConfig,
  OrbitalShardsAudioEffects,
  OrbitalShardsConfig,
  OrbitalShardsOptions,
  FormationConfig,
} from './renderers/orbital-shards/types'

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
