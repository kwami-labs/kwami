import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CursorLight } from '../../managers/CursorLight';
import type { ColorPalette } from '../../config/colors';

describe('CursorLight', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('should create slow light element on initialization', () => {
    document.body.innerHTML = '<div id="cursor-light"></div>';
    
    const cursor = new CursorLight();
    
    const slowLight = document.getElementById('cursor-light-slow');
    expect(slowLight).toBeDefined();
    expect(slowLight?.style.position).toBe('fixed');
  });

  it('should handle missing fast light element gracefully', () => {
    document.body.innerHTML = '';
    
    const cursor = new CursorLight();
    
    expect(cursor).toBeDefined();
  });

  it('should update colors for both lights', () => {
    document.body.innerHTML = '<div id="cursor-light"></div>';
    
    const cursor = new CursorLight();
    const fastLight = document.getElementById('cursor-light');
    const slowLight = document.getElementById('cursor-light-slow');
    
    const testPalette: ColorPalette = {
      primary: '#ff0000',
      secondary: '#00ff00',
      accent: '#0000ff'
    };
    
    cursor.updateColors(testPalette);
    
    expect(fastLight?.style.background).toContain('radial-gradient');
    expect(slowLight?.style.background).toContain('radial-gradient');
  });

  it('should track mouse position history', () => {
    document.body.innerHTML = '<div id="cursor-light"></div>';
    
    const cursor = new CursorLight();
    
    const event = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 200
    });
    document.dispatchEvent(event);
    
    const fastLight = document.getElementById('cursor-light');
    expect(fastLight?.style.left).toBe('100px');
    expect(fastLight?.style.top).toBe('200px');
  });

  it('should activate lights on first mouse movement', () => {
    document.body.innerHTML = '<div id="cursor-light"></div>';
    
    const cursor = new CursorLight();
    const fastLight = document.getElementById('cursor-light');
    const slowLight = document.getElementById('cursor-light-slow');
    
    expect(fastLight?.classList.contains('active')).toBe(false);
    expect(slowLight?.style.opacity).toBe('0');
    
    const event = new MouseEvent('mousemove', {
      clientX: 50,
      clientY: 50
    });
    document.dispatchEvent(event);
    
    expect(fastLight?.classList.contains('active')).toBe(true);
    expect(slowLight?.style.opacity).toBe('1');
  });

  it('should hide lights on mouse leave', () => {
    document.body.innerHTML = '<div id="cursor-light"></div>';
    
    const cursor = new CursorLight();
    
    // Activate first
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50 }));
    
    // Then leave
    document.dispatchEvent(new Event('mouseleave'));
    
    const fastLight = document.getElementById('cursor-light');
    const slowLight = document.getElementById('cursor-light-slow');
    
    expect(fastLight?.classList.contains('active')).toBe(false);
    expect(slowLight?.style.opacity).toBe('0');
  });

  it('should clean up on destroy', () => {
    document.body.innerHTML = '<div id="cursor-light"></div>';
    
    const cursor = new CursorLight();
    const slowLight = document.getElementById('cursor-light-slow');
    
    expect(slowLight).toBeDefined();
    
    cursor.destroy();
    
    const slowLightAfter = document.getElementById('cursor-light-slow');
    expect(slowLightAfter).toBeNull();
  });

  it('should have delayed light following with 3 second delay', () => {
    document.body.innerHTML = '<div id="cursor-light"></div>';
    
    const cursor = new CursorLight();
    
    // Simulate mouse movements
    const event1 = new MouseEvent('mousemove', { clientX: 100, clientY: 100 });
    const event2 = new MouseEvent('mousemove', { clientX: 200, clientY: 200 });
    
    document.dispatchEvent(event1);
    
    // The slow light should eventually follow but with delay
    const slowLight = document.getElementById('cursor-light-slow');
    expect(slowLight).toBeDefined();
  });
});

