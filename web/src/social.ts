/**
 * Social Features Module
 * 
 * Provides share buttons, GitHub stars counter, and social proof elements
 */

import { trackEvent, trackOutboundLink } from './analytics';

export class SocialFeatures {
  private githubRepo: string = 'alexcolls/kwami';
  private githubStars: number = 0;
  private shareUrl: string = 'https://kwami.io';
  private shareTitle: string = 'Kwami - Interactive 3D AI Companion';
  private shareText: string = 'Check out Kwami - Create engaging AI companions with voice, music, and 3D visuals!';

  constructor() {
    this.init();
  }

  /**
   * Initialize social features
   */
  private async init(): Promise<void> {
    console.log('🌐 Initializing social features...');

    // Create share buttons
    this.createShareButtons();

    // Create GitHub stars badge
    this.createGitHubStars();

    // Fetch GitHub stats
    await this.fetchGitHubStats();

    // Create scroll progress
    this.createScrollProgress();

    // Setup share modal
    this.setupShareModal();

    console.log('✅ Social features initialized');
  }

  /**
   * Create share buttons
   */
  private createShareButtons(): void {
    const container = document.createElement('div');
    container.className = 'share-container';
    container.setAttribute('role', 'complementary');
    container.setAttribute('aria-label', 'Share on social media');

    const buttons = [
      {
        id: 'twitter',
        icon: '𝕏',
        tooltip: 'Share on Twitter',
        url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(this.shareText)}&url=${encodeURIComponent(this.shareUrl)}`,
      },
      {
        id: 'facebook',
        icon: '📘',
        tooltip: 'Share on Facebook',
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.shareUrl)}`,
      },
      {
        id: 'linkedin',
        icon: '💼',
        tooltip: 'Share on LinkedIn',
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.shareUrl)}`,
      },
      {
        id: 'reddit',
        icon: '🤖',
        tooltip: 'Share on Reddit',
        url: `https://reddit.com/submit?url=${encodeURIComponent(this.shareUrl)}&title=${encodeURIComponent(this.shareTitle)}`,
      },
      {
        id: 'copy',
        icon: '🔗',
        tooltip: 'Copy link',
        url: '',
      },
    ];

    buttons.forEach((button) => {
      const btn = document.createElement('a');
      btn.className = `share-button ${button.id}`;
      btn.innerHTML = button.icon;
      btn.setAttribute('data-tooltip', button.tooltip);
      btn.setAttribute('aria-label', button.tooltip);
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');

      if (button.id === 'copy') {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.copyLink();
        });
      } else {
        btn.href = button.url;
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.addEventListener('click', () => {
          trackEvent('share', 'social', button.id);
          trackOutboundLink(button.url, `share_${button.id}`);
        });
      }

      container.appendChild(btn);
    });

    document.body.appendChild(container);
  }

  /**
   * Copy link to clipboard
   */
  private async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.shareUrl);
      
      // Visual feedback
      const copyButton = document.querySelector('.share-button.copy');
      if (copyButton) {
        copyButton.classList.add('copied');
        setTimeout(() => {
          copyButton.classList.remove('copied');
        }, 2000);
      }

      trackEvent('share', 'copy_link', 'success');
    } catch (error) {
      console.error('Failed to copy link:', error);
      trackEvent('share', 'copy_link', 'error');
      
      // Fallback: Show modal with link
      this.showShareModal();
    }
  }

  /**
   * Create GitHub stars badge
   */
  private createGitHubStars(): void {
    const container = document.createElement('div');
    container.className = 'github-stars';

    const badge = document.createElement('a');
    badge.className = 'github-stars-badge';
    badge.href = `https://github.com/${this.githubRepo}`;
    badge.target = '_blank';
    badge.rel = 'noopener noreferrer';
    badge.setAttribute('aria-label', 'Star on GitHub');
    
    badge.innerHTML = `
      <span class="github-stars-icon" aria-hidden="true">⭐</span>
      <span class="github-stars-count loading">0</span>
      <span>Star</span>
    `;

    badge.addEventListener('click', () => {
      trackEvent('click', 'github', 'star_button');
      trackOutboundLink(badge.href, 'github_star');
    });

    container.appendChild(badge);
    document.body.appendChild(container);
  }

  /**
   * Fetch GitHub repository stats
   */
  private async fetchGitHubStats(): Promise<void> {
    try {
      const response = await fetch(`https://api.github.com/repos/${this.githubRepo}`);
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      this.githubStars = data.stargazers_count || 0;

      // Update badge
      const countElement = document.querySelector('.github-stars-count');
      if (countElement) {
        countElement.classList.remove('loading');
        countElement.textContent = this.formatNumber(this.githubStars);
      }

      console.log(`⭐ GitHub stars: ${this.githubStars}`);
      trackEvent('github', 'stats_loaded', 'stars', this.githubStars);
    } catch (error) {
      console.error('Failed to fetch GitHub stats:', error);
      
      // Show fallback
      const countElement = document.querySelector('.github-stars-count');
      if (countElement) {
        countElement.classList.remove('loading');
        countElement.textContent = '—';
      }
    }
  }

  /**
   * Format number (e.g., 1234 -> 1.2k)
   */
  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  /**
   * Create scroll progress indicator
   */
  private createScrollProgress(): void {
    const container = document.createElement('div');
    container.className = 'scroll-progress';
    container.setAttribute('role', 'progressbar');
    container.setAttribute('aria-label', 'Page scroll progress');
    container.setAttribute('aria-valuenow', '0');
    container.setAttribute('aria-valuemin', '0');
    container.setAttribute('aria-valuemax', '100');

    const bar = document.createElement('div');
    bar.className = 'scroll-progress-bar';
    container.appendChild(bar);

    document.body.appendChild(container);

    // Update on scroll
    const updateProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;

      bar.style.width = `${progress}%`;
      container.setAttribute('aria-valuenow', Math.round(progress).toString());
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /**
   * Setup share modal
   */
  private setupShareModal(): void {
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.id = 'share-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'share-modal-title');
    modal.setAttribute('aria-modal', 'true');

    modal.innerHTML = `
      <div class="share-modal-content">
        <h2 id="share-modal-title" class="share-modal-title">Share Kwami</h2>
        
        <div class="share-modal-buttons">
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(this.shareText)}&url=${encodeURIComponent(this.shareUrl)}" 
             target="_blank" 
             rel="noopener noreferrer"
             class="share-modal-button twitter">
            <span class="share-modal-button-icon">𝕏</span>
            <span>Twitter</span>
          </a>
          
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.shareUrl)}" 
             target="_blank" 
             rel="noopener noreferrer"
             class="share-modal-button facebook">
            <span class="share-modal-button-icon">📘</span>
            <span>Facebook</span>
          </a>
          
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.shareUrl)}" 
             target="_blank" 
             rel="noopener noreferrer"
             class="share-modal-button linkedin">
            <span class="share-modal-button-icon">💼</span>
            <span>LinkedIn</span>
          </a>
          
          <a href="https://reddit.com/submit?url=${encodeURIComponent(this.shareUrl)}&title=${encodeURIComponent(this.shareTitle)}" 
             target="_blank" 
             rel="noopener noreferrer"
             class="share-modal-button reddit">
            <span class="share-modal-button-icon">🤖</span>
            <span>Reddit</span>
          </a>
        </div>
        
        <div class="share-modal-link">
          <input type="text" 
                 class="share-modal-input" 
                 value="${this.shareUrl}" 
                 readonly 
                 aria-label="Share URL">
          <button class="share-modal-copy" id="share-modal-copy-btn">
            Copy
          </button>
        </div>
        
        <button class="share-modal-close" id="share-modal-close-btn">
          Close
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal
    const closeBtn = modal.querySelector('#share-modal-close-btn');
    closeBtn?.addEventListener('click', () => this.hideShareModal());

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideShareModal();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        this.hideShareModal();
      }
    });

    // Copy button
    const copyBtn = modal.querySelector('#share-modal-copy-btn');
    const input = modal.querySelector('.share-modal-input') as HTMLInputElement;
    
    copyBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(this.shareUrl);
        (copyBtn as HTMLButtonElement).textContent = '✓ Copied!';
        (copyBtn as HTMLElement).classList.add('copied');
        
        setTimeout(() => {
          (copyBtn as HTMLButtonElement).textContent = 'Copy';
          (copyBtn as HTMLElement).classList.remove('copied');
        }, 2000);

        trackEvent('share', 'copy_link', 'modal');
      } catch (error) {
        // Fallback: select text
        input.select();
        document.execCommand('copy');
      }
    });

    // Track social clicks
    const socialButtons = modal.querySelectorAll('.share-modal-button');
    socialButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const platform = button.className.split(' ').find(c => 
          ['twitter', 'facebook', 'linkedin', 'reddit'].includes(c)
        );
        trackEvent('share', 'social', `modal_${platform}`);
      });
    });
  }

  /**
   * Show share modal
   */
  public showShareModal(): void {
    const modal = document.getElementById('share-modal');
    if (modal) {
      modal.classList.add('show');
      
      // Focus first button
      const firstButton = modal.querySelector('.share-modal-button') as HTMLElement;
      firstButton?.focus();

      trackEvent('modal', 'share', 'opened');
    }
  }

  /**
   * Hide share modal
   */
  public hideShareModal(): void {
    const modal = document.getElementById('share-modal');
    if (modal) {
      modal.classList.remove('show');
      trackEvent('modal', 'share', 'closed');
    }
  }

  /**
   * Get GitHub stars count
   */
  public getGitHubStars(): number {
    return this.githubStars;
  }

  /**
   * Trigger native share (if available)
   */
  public async nativeShare(): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share({
          title: this.shareTitle,
          text: this.shareText,
          url: this.shareUrl,
        });
        trackEvent('share', 'native', 'success');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Native share failed:', error);
          trackEvent('share', 'native', 'error');
        }
      }
    } else {
      // Fallback to share modal
      this.showShareModal();
    }
  }
}

/**
 * Initialize social features
 */
export function initSocialFeatures(): SocialFeatures {
  return new SocialFeatures();
}

/**
 * Share on specific platform
 */
export function shareOn(platform: 'twitter' | 'facebook' | 'linkedin' | 'reddit'): void {
  const urls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out Kwami!')}&url=${encodeURIComponent('https://kwami.io')}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://kwami.io')}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://kwami.io')}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent('https://kwami.io')}&title=${encodeURIComponent('Kwami - Interactive 3D AI Companion')}`,
  };

  window.open(urls[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
  trackEvent('share', 'social', platform);
}

