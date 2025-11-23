/**
 * Unit Tests for Randomizers
 */

import { describe, it, expect } from 'vitest';
import {
  randomizeBlobParams,
  randomGradientColors,
  randomPaletteColors,
  randomGradientConfig,
  randomBackgroundImage,
  random3DTexture,
  randomAudioParams,
  randomCameraPosition,
  randomInteractionParams,
  randomCompleteConfig
} from '../../src/utils/randomizers';

describe('Randomizers', () => {
  describe('Blob Randomization', () => {
    it('should generate valid blob parameters', () => {
      const params = randomizeBlobParams();
      
      expect(params).toHaveProperty('spike');
      expect(params).toHaveProperty('amplitude');
      expect(params).toHaveProperty('time');
      expect(params).toHaveProperty('rotation');
      expect(params).toHaveProperty('colors');
      expect(params).toHaveProperty('scale');
      expect(params).toHaveProperty('shininess');
      expect(params).toHaveProperty('lightIntensity');
      
      expect(params.scale).toBeGreaterThanOrEqual(3);
      expect(params.scale).toBeLessThanOrEqual(8);
    });
    
    it('should generate valid spike values', () => {
      const params = randomizeBlobParams();
      
      expect(params.spike.x).toBeGreaterThanOrEqual(0);
      expect(params.spike.x).toBeLessThanOrEqual(20);
      expect(params.spike.y).toBeGreaterThanOrEqual(0);
      expect(params.spike.y).toBeLessThanOrEqual(20);
      expect(params.spike.z).toBeGreaterThanOrEqual(0);
      expect(params.spike.z).toBeLessThanOrEqual(20);
    });
  });
  
  describe('Color Randomization', () => {
    it('should generate gradient colors', () => {
      const colors = randomGradientColors(3);
      
      expect(colors).toHaveLength(3);
      colors.forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
    
    it('should generate palette colors', () => {
      const palette = randomPaletteColors();
      
      expect(palette).toHaveProperty('x');
      expect(palette).toHaveProperty('y');
      expect(palette).toHaveProperty('z');
      
      expect(palette.x).toMatch(/^#[0-9A-F]{6}$/i);
      expect(palette.y).toMatch(/^#[0-9A-F]{6}$/i);
      expect(palette.z).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
  
  describe('Background Randomization', () => {
    it('should generate gradient config', () => {
      const config = randomGradientConfig();
      
      expect(config).toHaveProperty('style');
      expect(config).toHaveProperty('colors');
      expect(config).toHaveProperty('angle');
      expect(config).toHaveProperty('stops');
      expect(config).toHaveProperty('opacity');
      
      expect(['linear', 'radial']).toContain(config.style);
      expect(config.angle).toBeGreaterThanOrEqual(0);
      expect(config.angle).toBeLessThan(360);
      expect(config.opacity).toBeGreaterThanOrEqual(0.8);
      expect(config.opacity).toBeLessThanOrEqual(1);
    });
    
    it('should select random background image', () => {
      const image = randomBackgroundImage();
      expect(image).toMatch(/^\/img\/bg\//);
    });
  });
  
  describe('Audio Randomization', () => {
    it('should generate valid audio parameters', () => {
      const params = randomAudioParams();
      
      expect(params).toHaveProperty('bassSpike');
      expect(params).toHaveProperty('midSpike');
      expect(params).toHaveProperty('highSpike');
      expect(params).toHaveProperty('reactivity');
      expect(params).toHaveProperty('sensitivity');
      expect(params).toHaveProperty('breathing');
      
      expect(params.bassSpike).toBeGreaterThanOrEqual(0);
      expect(params.bassSpike).toBeLessThanOrEqual(1);
      expect(params.reactivity).toBeGreaterThanOrEqual(0.5);
      expect(params.reactivity).toBeLessThanOrEqual(3);
    });
  });
  
  describe('Camera Randomization', () => {
    it('should generate valid camera position', () => {
      const position = randomCameraPosition();
      
      expect(position).toHaveProperty('x');
      expect(position).toHaveProperty('y');
      expect(position).toHaveProperty('z');
      
      expect(position.x).toBeGreaterThanOrEqual(-20);
      expect(position.x).toBeLessThanOrEqual(20);
      expect(position.y).toBeGreaterThanOrEqual(-20);
      expect(position.y).toBeLessThanOrEqual(20);
    });
  });
  
  describe('Complete Configuration', () => {
    it('should generate complete random config', () => {
      const config = randomCompleteConfig();
      
      expect(config).toHaveProperty('blob');
      expect(config).toHaveProperty('background');
      expect(config).toHaveProperty('audio');
      expect(config).toHaveProperty('camera');
      expect(config).toHaveProperty('interaction');
      
      expect(config.blob).toHaveProperty('scale');
      expect(config.background).toHaveProperty('colors');
      expect(config.audio).toHaveProperty('reactivity');
      expect(config.camera).toHaveProperty('x');
      expect(config.interaction).toHaveProperty('touchStrength');
    });
  });
});

