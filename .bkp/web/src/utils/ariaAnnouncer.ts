/**
 * ARIA Live Region Manager
 * Provides screen reader announcements for dynamic content changes
 */

type AriaLiveLevel = 'polite' | 'assertive' | 'off';

class AriaAnnouncer {
  private politeRegion: HTMLElement | null = null;
  private assertiveRegion: HTMLElement | null = null;
  private announcementQueue: Array<{ message: string; level: AriaLiveLevel }> = [];
  private isProcessing = false;

  constructor() {
    this.createLiveRegions();
  }

  /**
   * Creates ARIA live regions for announcements
   */
  private createLiveRegions(): void {
    // Polite region (for non-urgent updates)
    this.politeRegion = document.createElement('div');
    this.politeRegion.id = 'aria-live-polite';
    this.politeRegion.setAttribute('role', 'status');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    this.politeRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.politeRegion);

    // Assertive region (for urgent updates)
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.id = 'aria-live-assertive';
    this.assertiveRegion.setAttribute('role', 'alert');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.assertiveRegion);

    console.log('✅ ARIA live regions initialized');
  }

  /**
   * Announces a message to screen readers
   */
  public announce(message: string, level: AriaLiveLevel = 'polite'): void {
    if (!message || message.trim() === '') return;

    this.announcementQueue.push({ message, level });
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process the announcement queue
   */
  private async processQueue(): Promise<void> {
    if (this.announcementQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const { message, level } = this.announcementQueue.shift()!;

    const region = level === 'assertive' ? this.assertiveRegion : this.politeRegion;
    
    if (region) {
      // Clear previous message
      region.textContent = '';
      
      // Wait a tick to ensure screen readers detect the change
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Set new message
      region.textContent = message;
      
      // Wait for announcement to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Process next item
    this.processQueue();
  }

  /**
   * Announces section navigation
   */
  public announceSectionChange(sectionNumber: number, sectionTitle: string): void {
    this.announce(`Section ${sectionNumber}: ${sectionTitle}`, 'polite');
  }

  /**
   * Announces mode changes
   */
  public announceModeChange(mode: string): void {
    this.announce(`${mode} mode activated`, 'polite');
  }

  /**
   * Announces media playback
   */
  public announceMediaPlayback(mediaType: string, mediaName: string, action: 'playing' | 'paused' | 'stopped'): void {
    this.announce(`${mediaType} ${action}: ${mediaName}`, 'polite');
  }

  /**
   * Announces action button feedback
   */
  public announceAction(action: string): void {
    this.announce(action, 'polite');
  }

  /**
   * Announces errors
   */
  public announceError(errorMessage: string): void {
    this.announce(`Error: ${errorMessage}`, 'assertive');
  }

  /**
   * Announces loading states
   */
  public announceLoading(isLoading: boolean, context: string = ''): void {
    if (isLoading) {
      this.announce(`Loading ${context}...`, 'polite');
    } else {
      this.announce(`${context} loaded`, 'polite');
    }
  }

  /**
   * Destroy the announcer and clean up
   */
  public destroy(): void {
    if (this.politeRegion) {
      this.politeRegion.remove();
      this.politeRegion = null;
    }
    if (this.assertiveRegion) {
      this.assertiveRegion.remove();
      this.assertiveRegion = null;
    }
    this.announcementQueue = [];
  }
}

// Singleton instance
let announcerInstance: AriaAnnouncer | null = null;

/**
 * Get or create the ARIA announcer instance
 */
export function getAriaAnnouncer(): AriaAnnouncer {
  if (!announcerInstance) {
    announcerInstance = new AriaAnnouncer();
  }
  return announcerInstance;
}

/**
 * Convenience function to announce a message
 */
export function announce(message: string, level: AriaLiveLevel = 'polite'): void {
  getAriaAnnouncer().announce(message, level);
}

/**
 * Announce section change
 */
export function announceSectionChange(sectionNumber: number, sectionTitle: string): void {
  getAriaAnnouncer().announceSectionChange(sectionNumber, sectionTitle);
}

/**
 * Announce mode change
 */
export function announceModeChange(mode: string): void {
  getAriaAnnouncer().announceModeChange(mode);
}

/**
 * Announce media playback
 */
export function announceMediaPlayback(mediaType: string, mediaName: string, action: 'playing' | 'paused' | 'stopped'): void {
  getAriaAnnouncer().announceMediaPlayback(mediaType, mediaName, action);
}


