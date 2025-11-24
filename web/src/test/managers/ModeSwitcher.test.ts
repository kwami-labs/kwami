import { describe, it, expect, beforeEach } from 'vitest';
import { ModeSwitcher } from '../../managers/ModeSwitcher';

describe('ModeSwitcher', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should initialize with default mode as voice', () => {
    document.body.innerHTML = `
      <div class="mode-switcher">
        <button class="mode-btn" data-mode="voice">Voice</button>
        <button class="mode-btn" data-mode="music">Music</button>
        <button class="mode-btn" data-mode="video">Video</button>
      </div>
    `;

    const switcher = new ModeSwitcher();
    expect(switcher.getMode()).toBe('voice');
  });

  it('should handle missing DOM elements gracefully', () => {
    document.body.innerHTML = '<div>No switcher</div>';
    const switcher = new ModeSwitcher();
    expect(switcher).toBeDefined();
  });

  it('should change mode on button click', () => {
    document.body.innerHTML = `
      <div class="mode-switcher">
        <button class="mode-btn" data-mode="voice">Voice</button>
        <button class="mode-btn" data-mode="music">Music</button>
        <button class="mode-btn" data-mode="video">Video</button>
      </div>
    `;

    const switcher = new ModeSwitcher();
    const musicBtn = document.querySelector('[data-mode="music"]') as HTMLElement;
    
    musicBtn.click();
    
    expect(switcher.getMode()).toBe('music');
  });

  it('should update active class on buttons', () => {
    document.body.innerHTML = `
      <div class="mode-switcher">
        <button class="mode-btn" data-mode="voice">Voice</button>
        <button class="mode-btn" data-mode="music">Music</button>
        <button class="mode-btn" data-mode="video">Video</button>
      </div>
    `;

    const switcher = new ModeSwitcher();
    const musicBtn = document.querySelector('[data-mode="music"]') as HTMLElement;
    const voiceBtn = document.querySelector('[data-mode="voice"]') as HTMLElement;
    
    musicBtn.click();
    
    expect(musicBtn.classList.contains('active')).toBe(true);
    expect(voiceBtn.classList.contains('active')).toBe(false);
  });

  it('should update data-active attribute on switcher', () => {
    document.body.innerHTML = `
      <div class="mode-switcher">
        <button class="mode-btn" data-mode="voice">Voice</button>
        <button class="mode-btn" data-mode="music">Music</button>
        <button class="mode-btn" data-mode="video">Video</button>
      </div>
    `;

    const switcher = new ModeSwitcher();
    const switcherElement = document.querySelector('.mode-switcher') as HTMLElement;
    const videoBtn = document.querySelector('[data-mode="video"]') as HTMLElement;
    
    videoBtn.click();
    
    expect(switcherElement.getAttribute('data-active')).toBe('video');
  });

  it('should handle all three modes', () => {
    document.body.innerHTML = `
      <div class="mode-switcher">
        <button class="mode-btn" data-mode="voice">Voice</button>
        <button class="mode-btn" data-mode="music">Music</button>
        <button class="mode-btn" data-mode="video">Video</button>
      </div>
    `;

    const switcher = new ModeSwitcher();
    
    expect(switcher.getMode()).toBe('voice');
    
    (document.querySelector('[data-mode="music"]') as HTMLElement).click();
    expect(switcher.getMode()).toBe('music');
    
    (document.querySelector('[data-mode="video"]') as HTMLElement).click();
    expect(switcher.getMode()).toBe('video');
    
    (document.querySelector('[data-mode="voice"]') as HTMLElement).click();
    expect(switcher.getMode()).toBe('voice');
  });
});

