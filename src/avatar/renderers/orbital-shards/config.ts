import type { OrbitalShardsOptionsConfig } from './types'

/**
 * Default OrbitalShards configuration
 */
export const defaultOrbitalShardsConfig: OrbitalShardsOptionsConfig = {
  shards: {
    count: 24,
    sizeRange: [0.15, 0.45],
    orbitRadius: [1.8, 3.5],
    rotationSpeed: 0.8,
    opacityRange: [0.6, 0.95],
  },

  core: {
    size: 0.8,
    glowIntensity: 1.2,
    pulseSpeed: 0.5,
    innerColor: '#ffffff',
    outerColor: '#00ffff',
  },

  audioEffects: {
    bassOrbitBoost: 0.4,
    midRotationBoost: 0.6,
    highGlowBoost: 0.8,
    reactivity: 1.5,
    smoothing: 0.15,
    enabled: true,
  },

  formations: {
    constellation: {
      orbitPattern: 'random',
      shardShape: 'prism',
      coreVisible: true,
      particleDensity: 0.8,
      colors: {
        primary: '#00e5ff',
        secondary: '#7c4dff',
        accent: '#ff4081',
      },
    },
    helix: {
      orbitPattern: 'spiral',
      shardShape: 'octahedron',
      coreVisible: true,
      particleDensity: 0.6,
      colors: {
        primary: '#76ff03',
        secondary: '#ffea00',
        accent: '#ff6d00',
      },
    },
    vortex: {
      orbitPattern: 'rings',
      shardShape: 'tetrahedron',
      coreVisible: true,
      particleDensity: 1.0,
      colors: {
        primary: '#e040fb',
        secondary: '#536dfe',
        accent: '#18ffff',
      },
    },
  },

  scale: {
    min: 0.5,
    max: 3.0,
    default: 1.0,
  },
}
