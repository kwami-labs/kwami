export { OrbitalShards } from './OrbitalShards'
export { defaultOrbitalShardsConfig } from './config'
export {
  createCoreGeometry,
  createCoreGlowGeometry,
  createPrismGeometry,
  createOctahedronShard,
  createTetrahedronShard,
  getShardGeometry,
  generateOrbitalPositions,
  createParticlePositions,
} from './geometry'
export {
  createShardMaterial,
  createCoreMaterial,
  createGlowMaterial,
  createCrystalMaterials,
} from './materials'
export {
  analyzeAudio,
  smoothAudioLevels,
  animateShards,
  animateCore,
  animateOrbitalShards,
} from './animation'

// Re-export types
export type {
  OrbitalShardsFormation,
  CoreStyle,
  OrbitalShardsFormationSelection,
  ShardConfig,
  CoreConfig,
  OrbitalShardsAudioEffects,
  OrbitalShardsConfig,
  OrbitalShardsOptions,
  OrbitalShardsOptionsConfig,
  FormationConfig,
} from './types'

export type {
  ShardState,
  AudioLevels,
} from './animation'
