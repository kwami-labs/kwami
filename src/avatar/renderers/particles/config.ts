import type {
  ParticlesPhysicsConfig,
  ParticlesVisualConfig,
  ParticlesFormationConfig,
  ParticlesAnimationConfig,
  ParticlesAudioEffects,
} from './types'

// =============================================================================
// PARTICLES DEFAULT CONFIGURATION
// =============================================================================

export const defaultParticlesPhysics: ParticlesPhysicsConfig = {
  returnForce: 0.04,
  damping: 0.92,
  explosionForce: 10,
  explosionRadius: 2.5,
  leaderSpeed: 0.015,
  followDelay: 0.012,
  mouseInfluence: 1.5,
  mouseRepulsion: 0.4,
}

export const defaultParticlesVisual: ParticlesVisualConfig = {
  color: '#ffffff',
  glowColor: '#88ccff',
  particleSize: 0.6,      // Much smaller default
  sizeVariation: 0.5,
  opacity: 0.95,
  glowIntensity: 0.3,
  brightnessVariation: 0.25,
  sharpness: 0.7,         // Sharper particles
}

export const defaultParticlesFormation: ParticlesFormationConfig = {
  type: 'sphere',
  radius: 2,
  density: 'uniform',
  noise: 0.03,
}

export const defaultParticlesAnimation: ParticlesAnimationConfig = {
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

export const defaultParticlesAudioEffects: ParticlesAudioEffects = {
  enabled: true,
  reactivity: 1.5,        // Increased from 0.5
  bassInfluence: 1.0,     // Increased from 0.3
  midInfluence: 0.6,      // Increased from 0.2
  highInfluence: 0.8,     // Increased from 0.4
  smoothing: 0.7,         // Slightly less smoothing for faster response
  scalePulse: true,
  movementIntensity: 0.5,
}

export const defaultParticlesConfig = {
  particleCount: 6000,
  physics: defaultParticlesPhysics,
  visual: defaultParticlesVisual,
  formation: defaultParticlesFormation,
  animation: defaultParticlesAnimation,
  audioEffects: defaultParticlesAudioEffects,
  scale: 1,
  transitionDuration: 800,
}

// =============================================================================
// PRESETS
// =============================================================================

export type ParticlesPreset = 'default' | 'dense' | 'sparse' | 'reactive' | 'calm' | 'energetic' | 'galaxy' | 'fireflies'

export const particlesPresets: Record<ParticlesPreset, Partial<typeof defaultParticlesConfig>> = {
  default: {},
  
  dense: {
    particleCount: 12000,
    visual: {
      ...defaultParticlesVisual,
      particleSize: 0.4,
      opacity: 0.9,
    },
    animation: {
      ...defaultParticlesAnimation,
      turbulence: { enabled: true, intensity: 0.015, speed: 0.8 },
    },
  },
  
  sparse: {
    particleCount: 2500,
    visual: {
      ...defaultParticlesVisual,
      particleSize: 1.0,
      brightnessVariation: 0.4,
      glowIntensity: 0.5,
    },
    animation: {
      ...defaultParticlesAnimation,
      floating: { enabled: true, speed: 0.3, amplitude: 0.15 },
    },
  },
  
  reactive: {
    particleCount: 8000,
    audioEffects: {
      ...defaultParticlesAudioEffects,
      reactivity: 2.5,
      bassInfluence: 1.5,
      highInfluence: 1.2,
      movementIntensity: 0.8,
      scalePulse: true,
    },
    physics: {
      ...defaultParticlesPhysics,
      explosionForce: 15,
      returnForce: 0.06,
    },
  },
  
  calm: {
    particleCount: 4000,
    audioEffects: {
      ...defaultParticlesAudioEffects,
      reactivity: 0.5,
      smoothing: 0.9,
      movementIntensity: 0.2,
    },
    physics: {
      ...defaultParticlesPhysics,
      damping: 0.96,
      returnForce: 0.02,
      leaderSpeed: 0.008,
    },
    animation: {
      ...defaultParticlesAnimation,
      breathing: { enabled: true, speed: 0.5, intensity: 0.1 },
      rotation: { enabled: true, speedX: 0, speedY: 0.05, speedZ: 0 },
    },
  },
  
  energetic: {
    particleCount: 10000,
    audioEffects: {
      ...defaultParticlesAudioEffects,
      reactivity: 3.0,
      bassInfluence: 2.0,
      movementIntensity: 1.0,
    },
    physics: {
      ...defaultParticlesPhysics,
      leaderSpeed: 0.025,
      explosionForce: 20,
    },
    animation: {
      ...defaultParticlesAnimation,
      rotation: { enabled: true, speedX: 0.05, speedY: 0.15, speedZ: 0.02 },
      turbulence: { enabled: true, intensity: 0.04, speed: 1.5 },
    },
    visual: {
      ...defaultParticlesVisual,
      glowIntensity: 0.5,
    },
  },
  
  galaxy: {
    particleCount: 15000,
    formation: {
      type: 'disc',
      radius: 3,
      density: 'center-heavy',
      noise: 0.08,
    },
    visual: {
      ...defaultParticlesVisual,
      particleSize: 0.35,
      color: '#e8e8ff',
      glowColor: '#6688ff',
      glowIntensity: 0.4,
    },
    animation: {
      ...defaultParticlesAnimation,
      rotation: { enabled: true, speedX: 0.02, speedY: 0.12, speedZ: 0 },
      turbulence: { enabled: true, intensity: 0.01, speed: 0.5 },
    },
  },
  
  fireflies: {
    particleCount: 1500,
    formation: {
      type: 'cube',
      radius: 3,
      density: 'uniform',
      noise: 0.3,
    },
    visual: {
      ...defaultParticlesVisual,
      particleSize: 0.8,
      sizeVariation: 0.8,
      color: '#ffee88',
      glowColor: '#ffcc00',
      glowIntensity: 0.8,
      brightnessVariation: 0.6,
    },
    animation: {
      ...defaultParticlesAnimation,
      breathing: { enabled: true, speed: 2.0, intensity: 0.4 },
      floating: { enabled: true, speed: 0.8, amplitude: 0.3 },
      turbulence: { enabled: true, intensity: 0.08, speed: 0.7 },
    },
    physics: {
      ...defaultParticlesPhysics,
      returnForce: 0.01,
      damping: 0.98,
    },
  },
}
