/**
 * Randomization Utilities
 * 
 * Functions for generating random values for blob customization
 */

import { randomColor, randomChoice, shuffleArray } from './helpers.js';
import { SKIN_RANDOMIZATION_TEMPLATE, BACKGROUND_IMAGES } from '../core/config.js';

// Skin randomization queue
let skinRandomizationQueue = [...SKIN_RANDOMIZATION_TEMPLATE];

/**
 * Refill the skin randomization queue
 */
function refillSkinRandomizationQueue() {
  skinRandomizationQueue = shuffleArray([...SKIN_RANDOMIZATION_TEMPLATE]);
}

/**
 * Get next randomized skin from queue
 * @returns {string} Skin name
 */
export function getNextRandomizedSkin() {
  if (skinRandomizationQueue.length === 0) {
    refillSkinRandomizationQueue();
  }
  return skinRandomizationQueue.pop();
}

/**
 * Generate random blob parameters
 * @returns {Object} Random blob configuration
 */
export function randomizeBlobParams() {
  const randomValue = (min, max, decimals = 1) => {
    const value = Math.random() * (max - min) + min;
    return parseFloat(value.toFixed(decimals));
  };

  return {
    spike: {
      x: randomValue(0, 20),
      y: randomValue(0, 20),
      z: randomValue(0, 20)
    },
    amplitude: {
      x: randomValue(0, 5),
      y: randomValue(0, 5),
      z: randomValue(0, 5)
    },
    time: {
      x: randomValue(0, 25),
      y: randomValue(0, 25),
      z: randomValue(0, 25)
    },
    rotation: {
      x: randomValue(0, 0.01, 3),
      y: randomValue(0, 0.01, 3),
      z: randomValue(0, 0.01, 3)
    },
    colors: {
      x: randomColor(),
      y: randomColor(),
      z: randomColor()
    },
    scale: randomValue(3, 8),
    shininess: randomValue(1, 200),
    lightIntensity: randomValue(0, 5)
  };
}

/**
 * Generate random gradient colors
 * @param {number} count - Number of colors to generate
 * @returns {string[]} Array of hex colors
 */
export function randomGradientColors(count = 3) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(randomColor());
  }
  return colors;
}

/**
 * Generate random palette colors for blob
 * @returns {Object} Random color palette
 */
export function randomPaletteColors() {
  return {
    x: randomColor(),
    y: randomColor(),
    z: randomColor()
  };
}

/**
 * Generate random gradient configuration
 * @returns {Object} Random gradient config
 */
export function randomGradientConfig() {
  const styles = ['linear', 'radial'];
  const colors = randomGradientColors(3);
  
  return {
    style: randomChoice(styles),
    colors,
    angle: Math.floor(Math.random() * 360),
    stops: [
      Math.floor(Math.random() * 50),
      50 + Math.floor(Math.random() * 50)
    ],
    opacity: 0.8 + Math.random() * 0.2
  };
}

/**
 * Select random background image
 * @returns {string} Random image path
 */
export function randomBackgroundImage() {
  return randomChoice(BACKGROUND_IMAGES);
}

/**
 * Generate random background with glass effect
 * @returns {Object} Random background configuration
 */
export function randomBackgroundWithGlass() {
  const useImage = Math.random() > 0.5;
  
  if (useImage) {
    return {
      type: 'image',
      image: randomBackgroundImage(),
      opacity: 0.3 + Math.random() * 0.4,
      glassEffect: true
    };
  } else {
    return {
      type: 'gradient',
      ...randomGradientConfig(),
      opacity: 0.5 + Math.random() * 0.3,
      glassEffect: true
    };
  }
}

/**
 * Generate random 3D texture parameters
 * @returns {Object} Random texture configuration
 */
export function random3DTexture() {
  const useMedia = Math.random() > 0.7;
  
  if (!useMedia) {
    return {
      type: 'color',
      colors: randomPaletteColors()
    };
  }
  
  const mediaType = Math.random() > 0.5 ? 'image' : 'video';
  
  return {
    type: mediaType,
    opacity: 0.5 + Math.random() * 0.5,
    transparency: Math.random() > 0.5
  };
}

/**
 * Generate random audio reactivity parameters
 * @returns {Object} Random audio configuration
 */
export function randomAudioParams() {
  const randomValue = (min, max, decimals = 2) => {
    const value = Math.random() * (max - min) + min;
    return parseFloat(value.toFixed(decimals));
  };

  return {
    bassSpike: randomValue(0, 1),
    midSpike: randomValue(0, 1),
    highSpike: randomValue(0, 1),
    reactivity: randomValue(0.5, 3),
    sensitivity: randomValue(0.01, 0.3),
    breathing: randomValue(0, 0.1)
  };
}

/**
 * Generate random camera position
 * @returns {Object} Random camera position
 */
export function randomCameraPosition() {
  const randomValue = (min, max) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(1));
  };

  return {
    x: randomValue(-20, 20),
    y: randomValue(-20, 20),
    z: randomValue(-20, 30)
  };
}

/**
 * Generate random interaction parameters
 * @returns {Object} Random interaction configuration
 */
export function randomInteractionParams() {
  return {
    touchStrength: 0.5 + Math.random() * 1.5,
    touchDuration: 500 + Math.floor(Math.random() * 2500),
    maxTouches: 1 + Math.floor(Math.random() * 10),
    transitionSpeed: 0.01 + Math.random() * 0.19,
    thinkingDuration: 3 + Math.floor(Math.random() * 27)
  };
}

/**
 * Generate complete random configuration
 * @returns {Object} Complete random configuration
 */
export function randomCompleteConfig() {
  return {
    blob: randomizeBlobParams(),
    background: randomGradientConfig(),
    audio: randomAudioParams(),
    camera: randomCameraPosition(),
    interaction: randomInteractionParams()
  };
}

