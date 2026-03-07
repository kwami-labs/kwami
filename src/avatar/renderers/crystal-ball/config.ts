import type { CrystalBallOptionsConfig } from './types'

/**
 * Default configuration for the Crystal Ball renderer
 * Quality controls FBM octaves: 1=fast, 2=balanced, 3=detailed, 4=maximum beauty
 */
export const defaultCrystalBallConfig: CrystalBallOptionsConfig = {
  volume: {
    iterations: 32,        // more iterations for better depth
    depth: 0.6,            // tutorial default: 0.6
    smoothing: 0.3,        // shell boundary smoothness
    noiseScale: 2.5,       // procedural noise scale
    noiseOctaves: 2,       // (legacy)
    quality: 3,            // FBM octaves: 1=fast, 2=balanced, 3=detailed, 4=max
  },

  animation: {
    displacementSpeed: 0.08,    // animation speed
    displacementStrength: 0.25, // displacement intensity
    rotationSpeed: { x: 0, y: 0.001, z: 0 },
    pulseSpeed: 1.0,
    pulseIntensity: 0.02,
  },

  audioEffects: {
    bassDisplacement: 0.5,
    midColorBoost: 0.3,
    highGlowBoost: 0.4,
    reactivity: 1.0,
    smoothing: 0.85,
    enabled: true,
  },

  styles: {
    mystical: {
      colors: {
        primary: '#000000',    // BLACK - critical for depth effect!
        secondary: '#00ffaa',  // Bright cyan (tutorial default)
      },
      volume: {
        noiseScale: 2.5,
        smoothing: 0.35,
      },
      animation: {
        displacementSpeed: 0.12,
        displacementStrength: 0.35,
      },
      roughness: 0.1,
      metalness: 0.0,
      envMapIntensity: 0.8,
    },

    nebula: {
      colors: {
        primary: '#0d47a1',    // Deep space blue
        secondary: '#e040fb',  // Nebula pink
      },
      volume: {
        noiseScale: 3.0,
        iterations: 40,
        smoothing: 0.4,
      },
      animation: {
        displacementSpeed: 0.08,
        displacementStrength: 0.5,
      },
      roughness: 0.05,
      metalness: 0.1,
      envMapIntensity: 0.6,
    },

    earth: {
      colors: {
        primary: '#1b5e20',    // Forest green
        secondary: '#4fc3f7',  // Ocean blue
      },
      volume: {
        noiseScale: 2.0,
        iterations: 28,
        smoothing: 0.25,
      },
      animation: {
        displacementSpeed: 0.1,
        displacementStrength: 0.3,
      },
      roughness: 0.15,
      metalness: 0.0,
      envMapIntensity: 0.7,
    },

    fire: {
      colors: {
        primary: '#ff5722',    // Deep orange
        secondary: '#ffeb3b',  // Bright yellow
      },
      volume: {
        noiseScale: 3.5,
        iterations: 36,
        smoothing: 0.2,
      },
      animation: {
        displacementSpeed: 0.25,
        displacementStrength: 0.6,
      },
      roughness: 0.08,
      metalness: 0.2,
      envMapIntensity: 0.5,
    },

    ocean: {
      colors: {
        primary: '#006064',    // Deep teal
        secondary: '#80deea',  // Light cyan
      },
      volume: {
        noiseScale: 2.2,
        iterations: 32,
        smoothing: 0.45,
      },
      animation: {
        displacementSpeed: 0.06,
        displacementStrength: 0.4,
      },
      roughness: 0.05,
      metalness: 0.0,
      envMapIntensity: 0.9,
    },
  },

  scale: {
    min: 1.0,
    max: 8.0,
    default: 3.0,
  },
}
