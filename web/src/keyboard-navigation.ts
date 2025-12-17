/**
 * Keyboard Navigation Module
 * 
 * Provides comprehensive keyboard navigation support for the Kwami website.
 * Handles arrow keys, shortcuts, focus management, and accessibility features.
 */

import { trackEvent } from './analytics';

export class KeyboardNavigation {
  private currentSection: number = 0;
  private totalSections: number = 22;
  private isShortcutsVisible: boolean = false;
  private keyboardHintShown: boolean = false;

  constructor() {
    this.init();
  }

  /**
   * Initialize keyboard navigation
   */
  private init(): void {
    // Detect keyboard usage
    this.detectKeyboardUsage();
    
    // Setup keyboard shortcuts
    this.setupShortcuts();
    
    // Setup arrow key navigation
    this.setupArrowKeys();
    
    // Setup tab navigation
    this.setupTabNavigation();
    
    // Create keyboard shortcuts overlay
    this.createShortcutsOverlay();
    
    // Create live region for announcements
    this.createLiveRegion();
    
    // Show keyboard hint on first tab
    this.setupKeyboardHint();
    
    console.log('✅ Keyboard navigation initialized');
  }

  /**
   * Detect when user is using keyboard
   */
  private detectKeyboardUsage(): void {
    let isUsingKeyboard = false;

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        isUsingKeyboard = true;
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      isUsingKeyboard = false;
      document.body.classList.remove('keyboard-navigation');
    });
  }

  /**
   * Setup keyboard shortcuts
   */
  private setupShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd/Ctrl + K: Show keyboard shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.toggleShortcuts();
        trackEvent('keyboard_shortcut', 'navigation', 'show_shortcuts');
      }

      // Escape: Close keyboard shortcuts or reset
      if (e.key === 'Escape') {
        if (this.isShortcutsVisible) {
          this.toggleShortcuts();
        }
      }

      // Number keys 0-9: Jump to section
      if (e.key >= '0' && e.key <= '9' && !e.metaKey && !e.ctrlKey) {
        const section = parseInt(e.key);
        if (section < this.totalSections) {
          this.jumpToSection(section);
          trackEvent('keyboard_shortcut', 'navigation', `jump_to_section_${section}`);
        }
      }

      // G: Go to top
      if (e.key === 'g' || e.key === 'G') {
        this.jumpToSection(0);
        trackEvent('keyboard_shortcut', 'navigation', 'go_to_top');
      }

      // E: Go to end
      if (e.key === 'e' || e.key === 'E') {
        this.jumpToSection(this.totalSections - 1);
        trackEvent('keyboard_shortcut', 'navigation', 'go_to_end');
      }

      // Space: Pause/Play media
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        this.toggleMedia();
        trackEvent('keyboard_shortcut', 'media', 'toggle_play_pause');
      }


      // R: Randomize blob
      if (e.key === 'r' || e.key === 'R') {
        this.randomizeBlob();
        trackEvent('keyboard_shortcut', 'blob', 'randomize');
      }

      // ?: Show help
      if (e.key === '?' && e.shiftKey) {
        this.toggleShortcuts();
        trackEvent('keyboard_shortcut', 'navigation', 'show_help');
      }
    });
  }

  /**
   * Setup arrow key navigation
   */
  private setupArrowKeys(): void {
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Up/Down arrows: Navigate sections
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateSection('up');
        trackEvent('keyboard_navigation', 'arrow', 'up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigateSection('down');
        trackEvent('keyboard_navigation', 'arrow', 'down');
      }

    });
  }

  /**
   * Setup tab key navigation enhancements
   */
  private setupTabNavigation(): void {
    // Improve focus visibility
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      
      // Announce to screen readers
      if (target.hasAttribute('aria-label')) {
        this.announce(target.getAttribute('aria-label')!);
      }
      
      // Ensure focused element is visible
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    });
  }

  /**
   * Navigate between sections
   */
  private navigateSection(direction: 'up' | 'down'): void {
    if (direction === 'up' && this.currentSection > 0) {
      this.currentSection--;
    } else if (direction === 'down' && this.currentSection < this.totalSections - 1) {
      this.currentSection++;
    }

    this.jumpToSection(this.currentSection);
  }

  /**
   * Jump to specific section
   */
  private jumpToSection(section: number): void {
    this.currentSection = section;
    
    // Scroll to section
    const scrollManager = (window as any).scrollManager;
    if (scrollManager) {
      scrollManager.scrollToSection(section);
    }

    // Click corresponding sphere
    const sphere = document.querySelector(`.sphere[data-section="${section}"]`) as HTMLElement;
    if (sphere) {
      sphere.focus();
    }

    // Announce to screen readers
    const sectionElement = document.querySelector(`[data-section="${section}"]`);
    const title = sectionElement?.querySelector('h1, h2')?.textContent || `Section ${section}`;
    this.announce(`Navigated to: ${title}`);
  }


  /**
   * Toggle media playback
   */
  private toggleMedia(): void {
    // This would integrate with existing media controls
    const audioElement = document.querySelector('audio') as HTMLAudioElement;
    const videoElement = document.querySelector('video') as HTMLVideoElement;

    if (audioElement && !audioElement.paused) {
      audioElement.pause();
      this.announce('Media paused');
    } else if (videoElement && !videoElement.paused) {
      videoElement.pause();
      this.announce('Media paused');
    } else if (audioElement) {
      audioElement.play();
      this.announce('Media playing');
    } else if (videoElement) {
      videoElement.play();
      this.announce('Media playing');
    }
  }

  /**
   * Randomize blob
   */
  private randomizeBlob(): void {
    // Trigger double-click on canvas
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const event = new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
      });
      canvas.dispatchEvent(event);
      this.announce('Blob randomized');
    }
  }

  /**
   * Toggle keyboard shortcuts overlay
   */
  private toggleShortcuts(): void {
    this.isShortcutsVisible = !this.isShortcutsVisible;
    const overlay = document.getElementById('keyboard-shortcuts-overlay');
    
    if (overlay) {
      overlay.classList.toggle('show', this.isShortcutsVisible);
      
      if (this.isShortcutsVisible) {
        // Focus first element in overlay
        const closeBtn = overlay.querySelector('.close-btn') as HTMLButtonElement;
        if (closeBtn) {
          closeBtn.focus();
        }
      }
    }
  }

  /**
   * Create keyboard shortcuts overlay
   */
  private createShortcutsOverlay(): void {
    const overlay = document.createElement('div');
    overlay.id = 'keyboard-shortcuts-overlay';
    overlay.className = 'keyboard-shortcuts';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-labelledby', 'shortcuts-title');
    overlay.setAttribute('aria-modal', 'true');
    
    overlay.innerHTML = `
      <h2 id="shortcuts-title">⌨️ Keyboard Shortcuts</h2>
      <ul>
        <li>
          <span>Navigate sections</span>
          <div><kbd>↑</kbd> <kbd>↓</kbd></div>
        </li>
        <li>
          <span>Switch tabs</span>
          <div><kbd>←</kbd> <kbd>→</kbd></div>
        </li>
        <li>
          <span>Jump to section</span>
          <div><kbd>0</kbd> - <kbd>9</kbd></div>
        </li>
        <li>
          <span>Go to top</span>
          <div><kbd>G</kbd></div>
        </li>
        <li>
          <span>Go to end</span>
          <div><kbd>E</kbd></div>
        </li>
        <li>
          <span>Voice tab</span>
          <div><kbd>V</kbd></div>
        </li>
        <li>
          <span>Music tab</span>
          <div><kbd>M</kbd></div>
        </li>
        <li>
          <span>Video tab</span>
          <div><kbd>D</kbd></div>
        </li>
        <li>
          <span>Randomize blob</span>
          <div><kbd>R</kbd></div>
        </li>
        <li>
          <span>Toggle media</span>
          <div><kbd>Space</kbd></div>
        </li>
        <li>
          <span>Show shortcuts</span>
          <div><kbd>Cmd/Ctrl</kbd> + <kbd>K</kbd> or <kbd>?</kbd></div>
        </li>
        <li>
          <span>Close/Cancel</span>
          <div><kbd>Esc</kbd></div>
        </li>
      </ul>
      <button class="close-btn" onclick="document.getElementById('keyboard-shortcuts-overlay').classList.remove('show')">Close</button>
    `;

    document.body.appendChild(overlay);

    // Close on escape
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggleShortcuts();
      }
    });

    // Close on background click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.toggleShortcuts();
      }
    });
  }

  /**
   * Create live region for announcements
   */
  private createLiveRegion(): void {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'live-region';
    liveRegion.className = 'section-announcer';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    
    document.body.appendChild(liveRegion);
  }

  /**
   * Announce to screen readers
   */
  private announce(message: string): void {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      
      // Clear after 1 second
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  /**
   * Setup keyboard hint
   */
  private setupKeyboardHint(): void {
    if (this.keyboardHintShown) return;

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && !this.keyboardHintShown) {
        this.showKeyboardHint();
        this.keyboardHintShown = true;
      }
    }, { once: true });
  }

  /**
   * Show keyboard hint
   */
  private showKeyboardHint(): void {
    const hint = document.createElement('div');
    hint.className = 'keyboard-hint show';
    hint.textContent = 'Press Cmd/Ctrl+K for keyboard shortcuts';
    hint.setAttribute('role', 'status');
    hint.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(hint);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      hint.classList.remove('show');
      setTimeout(() => hint.remove(), 300);
    }, 5000);
  }

  /**
   * Get current section
   */
  public getCurrentSection(): number {
    return this.currentSection;
  }

  /**
   * Set current section
   */
  public setCurrentSection(section: number): void {
    this.currentSection = section;
  }
}

/**
 * Initialize keyboard navigation
 */
export function initKeyboardNavigation(): KeyboardNavigation {
  return new KeyboardNavigation();
}

