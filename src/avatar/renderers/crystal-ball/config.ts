import type { CrystalBallOptionsConfig } from './types'

/**
 * Default configuration for the Crystal Ball renderer
 * Based on the Magical Marbles tutorial parameters
 */
export const defaultCrystalBallConfig: CrystalBallOptionsConfig = {
  volume: {
    iterations: 48,        // tutorial: 48
    depth: 0.6,            // tutorial: 0.6
    smoothing: 0.2,        // tutorial: 0.2
    noiseScale: 2.0,       // controls noise detail
    noiseOctaves: 4,
  },

  animation: {
    displacementSpeed: 0.071,   // tutorial: speed 0.071
    displacementStrength: 0.1,  // tutorial: displacement 0.1
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
        primary: '#6b5b95',    // Purple mystical
        secondary: '#feb236',  // Golden highlight
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
    default: 4.0,
  },
}
