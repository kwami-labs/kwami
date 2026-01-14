/**
 * Unit Tests for Randomizers
 */

import { describe, it, expect } from 'vitest';
import {
  randomBlobConfig,
  randomGradientColors,
  randomColorPalette,
  randomBackgroundConfig,
  randomCameraPosition,
} from '../../src/utils/randomizers';

describe('Randomizers', () => {
  describe('Blob Randomization', () => {
    it('should generate valid blob parameters', () => {
      const params = randomBlobConfig();
      
      expect(params).toHaveProperty('spikes');
      expect(params).toHaveProperty('amplitudes');
      expect(params).toHaveProperty('times');
      expect(params).toHaveProperty('rotations');
      expect(params).toHaveProperty('colors');
      expect(params).toHaveProperty('scale');
      expect(params).toHaveProperty('shininess');
      
      expect(params.scale).toBeGreaterThanOrEqual(2.5);
      expect(params.scale).toBeLessThanOrEqual(4.5);
    });
    
    it('should generate valid spike values', () => {
      const params = randomBlobConfig();
      
      expect(params.spikes.x).toBeGreaterThanOrEqual(0.1);
      expect(params.spikes.x).toBeLessThanOrEqual(2.0);
      expect(params.spikes.y).toBeGreaterThanOrEqual(0.1);
      expect(params.spikes.y).toBeLessThanOrEqual(2.0);
      expect(params.spikes.z).toBeGreaterThanOrEqual(0.1);
      expect(params.spikes.z).toBeLessThanOrEqual(2.0);
    });
  });
  
  describe('Color Randomization', () => {
    it('should generate gradient colors', () => {
      const colors = randomGradientColors();
      
      expect(colors).toHaveProperty('color1');
      expect(colors).toHaveProperty('color2');
      expect(colors).toHaveProperty('color3');
      expect(colors.color1).toMatch(/^#[0-9A-F]{6}$/i);
    });
    
    it('should generate palette colors', () => {
      const palette = randomColorPalette();
      
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
      const config = randomBackgroundConfig();
      
      expect(config).toHaveProperty('gradientColors');
      expect(config).toHaveProperty('gradientAngle');
      
      expect(config.gradientAngle).toBeGreaterThanOrEqual(0);
      expect(config.gradientAngle).toBeLessThan(360);
    });
  });
  
  describe('Camera Randomization', () => {
    it('should generate valid camera position', () => {
      const position = randomCameraPosition();
      
      expect(position).toHaveProperty('x');
      expect(position).toHaveProperty('y');
      expect(position).toHaveProperty('z');
      
      expect(position.x).toBeGreaterThanOrEqual(-5);
      expect(position.x).toBeLessThanOrEqual(5);
      expect(position.y).toBeGreaterThanOrEqual(3);
      expect(position.y).toBeLessThanOrEqual(10);
    });
  });
});

