/**
 * Custom Cursor Light Manager with dual lights (fast + delayed)
 */

import type { ColorPalette } from '../config/colors';
import { hexToRgba } from '../config/colors';

export class CursorLight {
  private lightFast: HTMLElement | null = null;
  private lightSlow: HTMLElement | null = null;
  private isActive = false;
  private positionHistory: Array<{ x: number, y: number, timestamp: number }> = [];
  private readonly DELAY_MS = 3000; // 3 seconds delay for second light
  private currentPalette: ColorPalette | null = null;

  constructor() {
    this.lightFast = document.getElementById('cursor-light');
    
    // Create second, delayed light
    this.lightSlow = document.createElement('div');
    this.lightSlow.id = 'cursor-light-slow';
    this.lightSlow.style.cssText = `
      position: fixed;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity 0.5s ease;
      mix-blend-mode: screen;
    `;
    document.body.appendChild(this.lightSlow);
    
    if (this.lightFast) {
      this.init();
    }
  }

  private init() {
    // Track mouse movement
    document.addEventListener('mousemove', (e: MouseEvent) => {
      const now = Date.now();
      
      // Update fast light immediately
      if (this.lightFast) {
        this.lightFast.style.left = `${e.clientX}px`;
        this.lightFast.style.top = `${e.clientY}px`;
      }
      
      // Store position in history with timestamp
      this.positionHistory.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: now
      });
      
      // Clean up old positions (keep only last 5 seconds of history)
      const cutoffTime = now - 5000;
      this.positionHistory = this.positionHistory.filter(pos => pos.timestamp > cutoffTime);
      
      // Update delayed light position
      this.updateDelayedLight(now);
      
      // Activate lights on first movement
      if (!this.isActive) {
        this.isActive = true;
        if (this.lightFast) this.lightFast.classList.add('active');
        if (this.lightSlow) this.lightSlow.style.opacity = '1';
      }
    });

    // Hide when mouse leaves window
    document.addEventListener('mouseleave', () => {
      if (this.lightFast) {
        this.lightFast.classList.remove('active');
      }
      if (this.lightSlow) {
        this.lightSlow.style.opacity = '0';
      }
      this.isActive = false;
    });

    // Show when mouse enters window
    document.addEventListener('mouseenter', () => {
      if (this.isActive) {
        if (this.lightFast) this.lightFast.classList.add('active');
        if (this.lightSlow) this.lightSlow.style.opacity = '1';
      }
    });
  }

  private updateDelayedLight(currentTime: number) {
    // Find the position from 3 seconds ago
    const targetTime = currentTime - this.DELAY_MS;
    
    // Find the closest position in history to our target time
    let closestPos = null;
    let minDiff = Infinity;
    
    for (const pos of this.positionHistory) {
      const diff = Math.abs(pos.timestamp - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestPos = pos;
      }
    }
    
    // Update delayed light position
    if (closestPos && this.lightSlow) {
      this.lightSlow.style.left = `${closestPos.x}px`;
      this.lightSlow.style.top = `${closestPos.y}px`;
    }
  }

  public updateColors(palette: ColorPalette) {
    this.currentPalette = palette;

    // Update fast light (original multi-color gradient)
    if (this.lightFast) {
      this.lightFast.style.background = `radial-gradient(
        circle at center,
        ${hexToRgba(palette.primary, 0.25)} 0%,
        ${hexToRgba(palette.secondary, 0.15)} 25%,
        ${hexToRgba(palette.accent, 0.08)} 50%,
        transparent 70%
      )`;
    }

    // Update slow light (primary color only, bigger, more subtle)
    if (this.lightSlow) {
      this.lightSlow.style.background = `radial-gradient(
        circle at center,
        ${hexToRgba(palette.primary, 0.08)} 0%,
        ${hexToRgba(palette.primary, 0.04)} 30%,
        ${hexToRgba(palette.primary, 0.02)} 50%,
        transparent 80%
      )`;
    }
  }

  public destroy() {
    if (this.lightSlow && this.lightSlow.parentNode) {
      this.lightSlow.parentNode.removeChild(this.lightSlow);
    }
  }
}

