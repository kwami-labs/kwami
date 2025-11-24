/**
 * Randomization Utilities
 * 
 * Functions for randomizing blob appearance and behavior
 */

import { randomColor, random, randomInt } from './helpers';

/**
 * Generate random spike values
 */
export function randomSpikes(): { x: number; y: number; z: number } {
  return {
    x: random(0.1, 2.0),
    y: random(0.1, 2.0),
    z: random(0.1, 2.0)
  };
}

/**
 * Generate random amplitude values
 */
export function randomAmplitudes(): { x: number; y: number; z: number } {
  return {
    x: random(0.5, 2.0),
    y: random(0.5, 2.0),
    z: random(0.5, 2.0)
  };
}

/**
 * Generate random time values (animation speed)
 */
export function randomTimes(): { x: number; y: number; z: number } {
  return {
    x: random(1, 10),
    y: random(1, 10),
    z: random(1, 10)
  };
}

/**
 * Generate random color palette
 */
export function randomColorPalette(): { x: string; y: string; z: string } {
  return {
    x: randomColor(),
    y: randomColor(),
    z: randomColor()
  };
}

/**
 * Generate random gradient colors
 */
export function randomGradientColors(): { color1: string; color2: string; color3: string } {
  return {
    color1: randomColor(),
    color2: randomColor(),
    color3: randomColor()
  };
}

/**
 * Generate random gradient angle
 */
export function randomGradientAngle(): number {
  return randomInt(0, 360);
}

/**
 * Generate random scale value
 */
export function randomScale(): number {
  return random(2.5, 4.5);
}

/**
 * Generate random camera position
 */
export function randomCameraPosition(): { x: number; y: number; z: number } {
  return {
    x: random(-5, 5),
    y: random(3, 10),
    z: random(-5, 5)
  };
}

/**
 * Generate random rotation values
 */
export function randomRotations(): { x: number; y: number; z: number } {
  return {
    x: random(0, 0.01),
    y: random(0, 0.01),
    z: random(0, 0.01)
  };
}

/**
 * Generate random resolution
 */
export function randomResolution(): number {
  return randomInt(120, 200);
}

/**
 * Generate random shininess
 */
export function randomShininess(): number {
  return randomInt(20, 100);
}

/**
 * Get random number in range
 */
export function randomInRange(min: number, max: number): number {
  return random(min, max);
}

/**
 * Get random integer in range
 */
export function randomIntInRange(min: number, max: number): number {
  return randomInt(min, max);
}

/**
 * Complete random blob configuration
 */
export function randomBlobConfig() {
  return {
    spikes: randomSpikes(),
    amplitudes: randomAmplitudes(),
    times: randomTimes(),
    colors: randomColorPalette(),
    rotations: randomRotations(),
    scale: randomScale(),
    resolution: randomResolution(),
    shininess: randomShininess()
  };
}

/**
 * Complete random background configuration
 */
export function randomBackgroundConfig() {
  return {
    gradientColors: randomGradientColors(),
    gradientAngle: randomGradientAngle()
  };
}

/**
 * Generate random preset name
 */
export function randomPresetName(): string {
  const adjectives = [
    'Cosmic', 'Ethereal', 'Mystic', 'Quantum', 'Neural',
    'Digital', 'Plasma', 'Radiant', 'Spectral', 'Vivid',
    'Dynamic', 'Fluid', 'Nebula', 'Aurora', 'Crystal'
  ];
  
  const nouns = [
    'Dream', 'Flow', 'Wave', 'Pulse', 'Bloom',
    'Drift', 'Spark', 'Glow', 'Burst', 'Swirl',
    'Echo', 'Vibe', 'Aura', 'Flux', 'Zen'
  ];
  
  const adj = adjectives[randomInt(0, adjectives.length - 1)];
  const noun = nouns[randomInt(0, nouns.length - 1)];
  
  return `${adj} ${noun}`;
}

/**
 * Random boolean with probability
 */
export function randomBool(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * Pick random item from array
 */
export function randomPick<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

/**
 * Generate random variance (for subtle randomization)
 */
export function randomVariance(base: number, variance: number): number {
  return base + random(-variance, variance);
}
