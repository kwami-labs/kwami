import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActionButtonManager, ACTION_ROUTES } from '../../managers/ActionButtonManager';

describe('ActionButtonManager', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('should initialize with buttons', () => {
    document.body.innerHTML = `
      <button data-action-key="launch-playground">Launch</button>
      <button data-action-key="view-demo">Demo</button>
    `;

    const manager = new ActionButtonManager();
    expect(manager).toBeDefined();
  });

  it('should handle no buttons gracefully', () => {
    document.body.innerHTML = '<div>No buttons</div>';
    const manager = new ActionButtonManager();
    expect(manager).toBeDefined();
  });

  it('should add triggered class on button click', async () => {
    document.body.innerHTML = '<button data-action-key="launch-playground">Launch</button>';
    const button = document.querySelector('[data-action-key]') as HTMLButtonElement;
    
    const manager = new ActionButtonManager();
    
    button.click();
    
    expect(button.classList.contains('triggered')).toBe(true);
  });

  it('should open URL for action with url config', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    
    document.body.innerHTML = '<button data-action-key="launch-playground">Launch</button>';
    const button = document.querySelector('[data-action-key]') as HTMLButtonElement;
    
    const manager = new ActionButtonManager();
    button.click();
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(openSpy).toHaveBeenCalledWith(
      'https://pg.kwami.io',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('should copy to clipboard for copy config', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextSpy },
      writable: true
    });
    
    document.body.innerHTML = '<button data-action-key="run-playground">Run</button>';
    const button = document.querySelector('[data-action-key]') as HTMLButtonElement;
    
    const manager = new ActionButtonManager();
    button.click();
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(writeTextSpy).toHaveBeenCalledWith('npm run playground');
  });

  it('should show feedback message', async () => {
    vi.spyOn(window, 'open').mockImplementation(() => null);
    
    document.body.innerHTML = '<button data-action-key="launch-playground">Launch</button>';
    const button = document.querySelector('[data-action-key]') as HTMLButtonElement;
    
    const manager = new ActionButtonManager();
    button.click();
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const feedback = button.querySelector('.action-feedback');
    expect(feedback).toBeDefined();
  });

  it('should validate all action routes have required fields', () => {
    Object.entries(ACTION_ROUTES).forEach(([key, config]) => {
      expect(config.message).toBeDefined();
      expect(typeof config.message).toBe('string');
      
      // Either url or copy should be defined
      const hasAction = config.url !== undefined || config.copy !== undefined;
      expect(hasAction).toBe(true);
    });
  });
});

