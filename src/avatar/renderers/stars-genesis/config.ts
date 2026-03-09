import type {
  StarsGenesisPhysicsConfig,
  StarsGenesisVisualConfig,
  StarsGenesisFormationConfig,
  StarsGenesisAnimationConfig,
  StarsGenesisAudioEffects,
} from './types'

// =============================================================================
// STARS GENESIS DEFAULT CONFIGURATION
// =============================================================================

export const defaultStarsGenesisPhysics: StarsGenesisPhysicsConfig = {
  returnForce: 0.04,
  damping: 0.92,
  explosionForce: 10,
  explosionRadius: 2.5,
  leaderSpeed: 0.015,
  followDelay: 0.012,
  mouseInfluence: 1.5,
  mouseRepulsion: 0.4,
}

export const defaultStarsGenesisVisual: StarsGenesisVisualConfig = {
  color: '#ffffff',
  glowColor: '#88ccff',
  starSize: 0.6,      // Much smaller default
  sizeVariation: 0.5,
  opacity: 0.95,
  glowIntensity: 0.3,
  brightnessVariation: 0.25,
  sharpness: 0.7,         // Sharper stars
}

export const defaultStarsGenesisFormation: StarsGenesisFormationConfig = {
  type: 'sphere',
  radius: 2,
  density: 'uniform',
  noise: 0.03,
}

export const defaultStarsGenesisAnimation: StarsGenesisAnimationConfig = {
  enabled: true,
  breathing: {
    enabled: true,
    speed: 1.0,
    intensity: 0.15,
  },
  floating: {
    enabled: true,
    speed: 0.5,
    amplitude: 0.08,
  },
  rotation: {
    enabled: true,
    speedX: 0,
    speedY: 0.1,
    speedZ: 0,
  },
  wave: {
    enabled: false,
    speed: 1.5,
    amplitude: 0.1,
  },
  turbulence: {
    enabled: true,
    intensity: 0.02,
    speed: 1.0,
  },
}

export const defaultStarsGenesisAudioEffects: StarsGenesisAudioEffects = {
  enabled: true,
  reactivity: 1.5,        // Increased from 0.5
  bassInfluence: 1.0,     // Increased from 0.3
  midInfluence: 0.6,      // Increased from 0.2
  highInfluence: 0.8,     // Increased from 0.4
  smoothing: 0.7,         // Slightly less smoothing for faster response
  scalePulse: true,
  movementIntensity: 0.5,
}

export const defaultStarsGenesisConfig = {
  starCount: 6000,
  physics: defaultStarsGenesisPhysics,
  visual: defaultStarsGenesisVisual,
  formation: defaultStarsGenesisFormation,
  animation: defaultStarsGenesisAnimation,
  audioEffects: defaultStarsGenesisAudioEffects,
  scale: 1,
  transitionDuration: 800,
}

// =============================================================================
// PRESETS
// =============================================================================

export type StarsGenesisPreset = 'default' | 'dense' | 'sparse' | 'reactive' | 'calm' | 'energetic' | 'galaxy' | 'fireflies'

export const starsGenesisPresets: Record<StarsGenesisPreset, Partial<typeof defaultStarsGenesisConfig>> = {
  default: {},

  dense: {
    starCount: 12000,
    visual: {
      ...defaultStarsGenesisVisual,
      starSize: 0.4,
      opacity: 0.9,
    },
    animation: {
      ...defaultStarsGenesisAnimation,
      turbulence: { enabled: true, intensity: 0.015, speed: 0.8 },
    },
  },

  sparse: {
    starCount: 2500,
    visual: {
      ...defaultStarsGenesisVisual,
      starSize: 1.0,
      brightnessVariation: 0.4,
      glowIntensity: 0.5,
    },
    animation: {
      ...defaultStarsGenesisAnimation,
      floating: { enabled: true, speed: 0.3, amplitude: 0.15 },
    },
  },

  reactive: {
    starCount: 8000,
    audioEffects: {
      ...defaultStarsGenesisAudioEffects,
      reactivity: 2.5,
      bassInfluence: 1.5,
      highInfluence: 1.2,
      movementIntensity: 0.8,
      scalePulse: true,
    },
    physics: {
      ...defaultStarsGenesisPhysics,
      explosionForce: 15,
      returnForce: 0.06,
    },
  },

  calm: {
    starCount: 4000,
    audioEffects: {
      ...defaultStarsGenesisAudioEffects,
      reactivity: 0.5,
      smoothing: 0.9,
      movementIntensity: 0.2,
    },
    physics: {
      ...defaultStarsGenesisPhysics,
      damping: 0.96,
      returnForce: 0.02,
      leaderSpeed: 0.008,
    },
    animation: {
      ...defaultStarsGenesisAnimation,
      breathing: { enabled: true, speed: 0.5, intensity: 0.1 },
      rotation: { enabled: true, speedX: 0, speedY: 0.05, speedZ: 0 },
    },
  },

  energetic: {
    starCount: 10000,
    audioEffects: {
      ...defaultStarsGenesisAudioEffects,
      reactivity: 3.0,
      bassInfluence: 2.0,
      movementIntensity: 1.0,
    },
    physics: {
      ...defaultStarsGenesisPhysics,
      leaderSpeed: 0.025,
      explosionForce: 20,
    },
    animation: {
      ...defaultStarsGenesisAnimation,
      rotation: { enabled: true, speedX: 0.05, speedY: 0.15, speedZ: 0.02 },
      turbulence: { enabled: true, intensity: 0.04, speed: 1.5 },
    },
    visual: {
      ...defaultStarsGenesisVisual,
      glowIntensity: 0.5,
    },
  },

  galaxy: {
    starCount: 15000,
    formation: {
      type: 'disc',
      radius: 3,
      density: 'center-heavy',
      noise: 0.08,
    },
    visual: {
      ...defaultStarsGenesisVisual,
      starSize: 0.35,
      color: '#e8e8ff',
      glowColor: '#6688ff',
      glowIntensity: 0.4,
    },
    animation: {
      ...defaultStarsGenesisAnimation,
      rotation: { enabled: true, speedX: 0.02, speedY: 0.12, speedZ: 0 },
      turbulence: { enabled: true, intensity: 0.01, speed: 0.5 },
    },
  },

  fireflies: {
    starCount: 1500,
    formation: {
      type: 'cube',
      radius: 3,
      density: 'uniform',
      noise: 0.3,
    },
    visual: {
      ...defaultStarsGenesisVisual,
      starSize: 0.8,
      sizeVariation: 0.8,
      color: '#ffee88',
      glowColor: '#ffcc00',
      glowIntensity: 0.8,
      brightnessVariation: 0.6,
    },
    animation: {
      ...defaultStarsGenesisAnimation,
      breathing: { enabled: true, speed: 2.0, intensity: 0.4 },
      floating: { enabled: true, speed: 0.8, amplitude: 0.3 },
      turbulence: { enabled: true, intensity: 0.08, speed: 0.7 },
    },
    physics: {
      ...defaultStarsGenesisPhysics,
      returnForce: 0.01,
      damping: 0.98,
    },
  },
}
