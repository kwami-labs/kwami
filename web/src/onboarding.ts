/**
 * Interactive Onboarding & Quick Actions
 * 
 * Provides guided tours, command palette, and feature discovery
 */

import { trackEvent } from './analytics';

interface TourStep {
  target: string;
  title: string;
  content: string;
  icon: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface QuickAction {
  id: string;
  icon: string;
  title: string;
  description: string;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
}

export class OnboardingTour {
  private steps: TourStep[] = [];
  private currentStep: number = 0;
  private isActive: boolean = false;
  private overlay?: HTMLElement;
  private spotlight?: HTMLElement;
  private card?: HTMLElement;

  constructor() {
    this.initTourSteps();
  }

  /**
   * Initialize tour steps
   */
  private initTourSteps(): void {
    this.steps = [
      {
        target: '.content-right',
        title: 'Meet Your Kwami',
        content: 'This is your interactive 3D blob! Double-click to randomize colors, or just watch it dance.',
        icon: '👋',
        position: 'left',
      },
      {
        target: '.bottom-tabs',
        title: 'Choose Your Mode',
        content: 'Switch between Voice, Music, and Video modes. Each mode changes how Kwami responds to interactions.',
        icon: '🎵',
        position: 'top',
      },
      {
        target: '.sidebar-navigation',
        title: 'Navigate Sections',
        content: 'Click these spheres to jump between sections, or use arrow keys (↑↓) for keyboard navigation.',
        icon: '🎯',
        position: 'right',
      },
      {
        target: '.share-container',
        title: 'Share the Love',
        content: 'Love Kwami? Share it with your friends on social media or copy the link!',
        icon: '🔗',
        position: 'right',
      },
      {
        target: '.theme-switcher',
        title: 'Customize Your Theme',
        content: 'Pick your favorite color theme! Try them all and find your style.',
        icon: '🎨',
        position: 'left',
      },
      {
        target: '.github-stars',
        title: 'Star on GitHub',
        content: 'Like what you see? Give us a star on GitHub to show your support!',
        icon: '⭐',
        position: 'bottom',
      },
    ];
  }

  /**
   * Start the tour
   */
  public start(): void {
    if (this.isActive) return;

    // Check if user has seen tour
    const hasSeenTour = localStorage.getItem('kwami-tour-completed');
    if (hasSeenTour) {
      console.log('User has already seen the tour');
      return;
    }

    this.isActive = true;
    this.currentStep = 0;
    this.createOverlay();
    this.showStep(0);
    trackEvent('onboarding', 'tour_started', 'step_0');
  }

  /**
   * Create overlay
   */
  private createOverlay(): void {
    this.overlay = document.createElement('div');
    this.overlay.className = 'onboarding-overlay';
    this.overlay.innerHTML = '<div class="onboarding-backdrop"></div>';
    document.body.appendChild(this.overlay);

    // Create spotlight
    this.spotlight = document.createElement('div');
    this.spotlight.className = 'onboarding-spotlight';
    this.overlay.appendChild(this.spotlight);

    // Create card
    this.card = document.createElement('div');
    this.card.className = 'tour-card';
    this.overlay.appendChild(this.card);

    // Activate
    setTimeout(() => {
      this.overlay?.classList.add('active');
    }, 10);
  }

  /**
   * Show specific step
   */
  private showStep(stepIndex: number): void {
    if (stepIndex < 0 || stepIndex >= this.steps.length) return;

    const step = this.steps[stepIndex];
    const target = document.querySelector(step.target) as HTMLElement;

    if (!target || !this.spotlight || !this.card) return;

    // Position spotlight
    const rect = target.getBoundingClientRect();
    this.spotlight.style.top = `${rect.top - 10}px`;
    this.spotlight.style.left = `${rect.left - 10}px`;
    this.spotlight.style.width = `${rect.width + 20}px`;
    this.spotlight.style.height = `${rect.height + 20}px`;

    // Position card
    this.positionCard(rect, step.position || 'bottom');

    // Update card content
    this.updateCard(step, stepIndex);

    // Scroll into view
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /**
   * Position card relative to target
   */
  private positionCard(rect: DOMRect, position: string): void {
    if (!this.card) return;

    const padding = 20;
    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top - this.card.offsetHeight - padding;
        left = rect.left + rect.width / 2 - this.card.offsetWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - this.card.offsetWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - this.card.offsetHeight / 2;
        left = rect.left - this.card.offsetWidth - padding;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - this.card.offsetHeight / 2;
        left = rect.right + padding;
        break;
    }

    // Keep within viewport
    top = Math.max(20, Math.min(top, window.innerHeight - this.card.offsetHeight - 20));
    left = Math.max(20, Math.min(left, window.innerWidth - this.card.offsetWidth - 20));

    this.card.style.top = `${top}px`;
    this.card.style.left = `${left}px`;
  }

  /**
   * Update card content
   */
  private updateCard(step: TourStep, stepIndex: number): void {
    if (!this.card) return;

    const isLast = stepIndex === this.steps.length - 1;
    const progressDots = this.steps.map((_, i) => 
      `<div class="tour-progress-dot ${i === stepIndex ? 'active' : ''}"></div>`
    ).join('');

    this.card.innerHTML = `
      <div class="tour-card-header">
        <div class="tour-card-icon">${step.icon}</div>
        <div>
          <div class="tour-card-step">Step ${stepIndex + 1} of ${this.steps.length}</div>
          <h3 class="tour-card-title">${step.title}</h3>
        </div>
      </div>
      
      <div class="tour-card-content">${step.content}</div>
      
      <div class="tour-card-actions">
        ${stepIndex > 0 ? '<button class="tour-button tour-button-secondary" id="tour-prev">← Back</button>' : ''}
        <button class="tour-button tour-button-primary" id="tour-next">
          ${isLast ? 'Finish Tour 🎉' : 'Next →'}
        </button>
        <div class="tour-progress">${progressDots}</div>
      </div>
    `;

    // Attach event listeners
    const nextBtn = this.card.querySelector('#tour-next');
    nextBtn?.addEventListener('click', () => {
      if (isLast) {
        this.finish();
      } else {
        this.next();
      }
    });

    const prevBtn = this.card.querySelector('#tour-prev');
    prevBtn?.addEventListener('click', () => this.previous());
  }

  /**
   * Go to next step
   */
  public next(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.showStep(this.currentStep);
      trackEvent('onboarding', 'tour_next', `step_${this.currentStep}`);
    }
  }

  /**
   * Go to previous step
   */
  public previous(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.showStep(this.currentStep);
      trackEvent('onboarding', 'tour_previous', `step_${this.currentStep}`);
    }
  }

  /**
   * Skip tour
   */
  public skip(): void {
    this.finish();
    trackEvent('onboarding', 'tour_skipped', `step_${this.currentStep}`);
  }

  /**
   * Finish tour
   */
  public finish(): void {
    this.isActive = false;
    this.overlay?.remove();
    this.overlay = undefined;
    this.spotlight = undefined;
    this.card = undefined;

    // Mark as completed
    localStorage.setItem('kwami-tour-completed', 'true');
    trackEvent('onboarding', 'tour_completed', 'success');

    console.log('🎉 Tour completed!');
  }

  /**
   * Reset tour (for testing)
   */
  public reset(): void {
    localStorage.removeItem('kwami-tour-completed');
    console.log('Tour reset');
  }
}

export class QuickActions {
  private actions: QuickAction[] = [];
  private isVisible: boolean = false;
  private container?: HTMLElement;
  private input?: HTMLInputElement;
  private selectedIndex: number = 0;

  constructor() {
    this.initActions();
    this.createUI();
    this.setupKeyboardShortcuts();
  }

  /**
   * Initialize quick actions
   */
  private initActions(): void {
    this.actions = [
      {
        id: 'jump-top',
        icon: '🔝',
        title: 'Jump to Top',
        description: 'Go to the first section',
        shortcut: 'G',
        action: () => this.jumpToSection(0),
        keywords: ['top', 'start', 'beginning', 'first'],
      },
      {
        id: 'jump-end',
        icon: '🔚',
        title: 'Jump to End',
        description: 'Go to the last section',
        shortcut: 'E',
        action: () => this.jumpToSection(21),
        keywords: ['end', 'bottom', 'last'],
      },
      {
        id: 'randomize-blob',
        icon: '🎲',
        title: 'Randomize Blob',
        description: 'Generate new blob colors',
        shortcut: 'R',
        action: () => this.randomizeBlob(),
        keywords: ['random', 'blob', 'colors', 'shuffle'],
      },
      {
        id: 'share',
        icon: '🔗',
        title: 'Share Kwami',
        description: 'Share on social media',
        action: () => {
          const social = (window as any).socialFeatures;
          if (social) social.showShareModal();
        },
        keywords: ['share', 'social', 'link'],
      },
      {
        id: 'shortcuts',
        icon: '⌨️',
        title: 'Keyboard Shortcuts',
        description: 'View all shortcuts',
        shortcut: '?',
        action: () => {
          const overlay = document.getElementById('keyboard-shortcuts-overlay');
          overlay?.classList.toggle('show');
        },
        keywords: ['keyboard', 'shortcuts', 'help', 'keys'],
      },
      {
        id: 'theme',
        icon: '🎨',
        title: 'Change Theme',
        description: 'Cycle through themes',
        action: () => {
          const theme = (window as any).themeManager;
          if (theme) theme.nextTheme();
        },
        keywords: ['theme', 'color', 'style'],
      },
      {
        id: 'voice-mode',
        icon: '🎤',
        title: 'Voice Mode',
        description: 'Switch to voice mode',
        shortcut: 'V',
        action: () => this.switchTab('voice'),
        keywords: ['voice', 'audio', 'speak'],
      },
      {
        id: 'music-mode',
        icon: '🎵',
        title: 'Music Mode',
        description: 'Switch to music mode',
        shortcut: 'M',
        action: () => this.switchTab('music'),
        keywords: ['music', 'audio', 'sound'],
      },
      {
        id: 'video-mode',
        icon: '🎬',
        title: 'Video Mode',
        description: 'Switch to video mode',
        shortcut: 'D',
        action: () => this.switchTab('video'),
        keywords: ['video', 'visual', 'display'],
      },
      {
        id: 'github',
        icon: '⭐',
        title: 'Star on GitHub',
        description: 'Open GitHub repository',
        action: () => {
          window.open('https://github.com/alexcolls/kwami', '_blank');
        },
        keywords: ['github', 'star', 'repository', 'code'],
      },
      {
        id: 'playground',
        icon: '🎮',
        title: 'Open Playground',
        description: 'Try Kwami playground',
        action: () => {
          window.open('https://pg.kwami.io', '_blank');
        },
        keywords: ['playground', 'demo', 'try', 'test'],
      },
      {
        id: 'candy',
        icon: '🍬',
        title: 'Mint NFT',
        description: 'Mint a Kwami NFT',
        action: () => {
          window.open('https://candy.kwami.io', '_blank');
        },
        keywords: ['nft', 'mint', 'candy', 'create'],
      },
    ];
  }

  /**
   * Create UI
   */
  private createUI(): void {
    this.container = document.createElement('div');
    this.container.className = 'quick-actions';
    this.container.id = 'quick-actions';

    this.container.innerHTML = `
      <div class="quick-actions-backdrop"></div>
      <div class="quick-actions-container">
        <div class="quick-actions-search">
          <input 
            type="text" 
            class="quick-actions-input" 
            placeholder="Type a command or search..." 
            autocomplete="off"
            id="quick-actions-input"
          />
        </div>
        <div class="quick-actions-list" id="quick-actions-list"></div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.input = document.getElementById('quick-actions-input') as HTMLInputElement;
    
    // Search
    this.input?.addEventListener('input', () => this.handleSearch());

    // Keyboard navigation
    this.input?.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Close on backdrop click
    this.container.querySelector('.quick-actions-backdrop')?.addEventListener('click', () => {
      this.hide();
    });
  }

  /**
   * Setup keyboard shortcuts
   */
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K or Cmd/Ctrl + P
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'p')) {
        e.preventDefault();
        this.toggle();
      }

      // Escape to close
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  /**
   * Show quick actions
   */
  public show(): void {
    if (this.isVisible) return;

    this.isVisible = true;
    this.container?.classList.add('show');
    this.selectedIndex = 0;
    
    // Focus input
    setTimeout(() => {
      this.input?.focus();
      this.renderActions(this.actions);
    }, 10);

    trackEvent('quick_actions', 'opened', 'command_palette');
  }

  /**
   * Hide quick actions
   */
  public hide(): void {
    if (!this.isVisible) return;

    this.isVisible = false;
    this.container?.classList.remove('show');
    
    if (this.input) {
      this.input.value = '';
    }

    trackEvent('quick_actions', 'closed', 'command_palette');
  }

  /**
   * Toggle visibility
   */
  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Handle search
   */
  private handleSearch(): void {
    const query = this.input?.value.toLowerCase() || '';
    
    if (!query) {
      this.renderActions(this.actions);
      return;
    }

    const filtered = this.actions.filter((action) => {
      const titleMatch = action.title.toLowerCase().includes(query);
      const descMatch = action.description.toLowerCase().includes(query);
      const keywordMatch = action.keywords?.some(k => k.includes(query));
      return titleMatch || descMatch || keywordMatch;
    });

    this.selectedIndex = 0;
    this.renderActions(filtered);
  }

  /**
   * Render actions list
   */
  private renderActions(actions: QuickAction[]): void {
    const list = document.getElementById('quick-actions-list');
    if (!list) return;

    if (actions.length === 0) {
      list.innerHTML = '<div style="padding: 40px; text-align: center; color: rgba(255,255,255,0.5);">No results found</div>';
      return;
    }

    list.innerHTML = actions.map((action, index) => `
      <div class="quick-action-item ${index === this.selectedIndex ? 'selected' : ''}" data-index="${index}">
        <div class="quick-action-icon">${action.icon}</div>
        <div class="quick-action-content">
          <div class="quick-action-title">${action.title}</div>
          <div class="quick-action-description">${action.description}</div>
        </div>
        ${action.shortcut ? `<div class="quick-action-shortcut">${action.shortcut}</div>` : ''}
      </div>
    `).join('');

    // Add click handlers
    list.querySelectorAll('.quick-action-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.executeAction(actions[index]);
      });
    });
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyDown(e: KeyboardEvent): void {
    const list = document.getElementById('quick-actions-list');
    const items = Array.from(list?.querySelectorAll('.quick-action-item') || []);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedIndex = (this.selectedIndex + 1) % items.length;
      this.updateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
      this.updateSelection();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const query = this.input?.value.toLowerCase() || '';
      const filtered = query ? this.actions.filter(a => 
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.keywords?.some(k => k.includes(query))
      ) : this.actions;
      
      if (filtered[this.selectedIndex]) {
        this.executeAction(filtered[this.selectedIndex]);
      }
    }
  }

  /**
   * Update selection visual
   */
  private updateSelection(): void {
    const items = document.querySelectorAll('.quick-action-item');
    items.forEach((item, index) => {
      item.classList.toggle('selected', index === this.selectedIndex);
    });

    // Scroll into view
    const selected = items[this.selectedIndex];
    selected?.scrollIntoView({ block: 'nearest' });
  }

  /**
   * Execute action
   */
  private executeAction(action: QuickAction): void {
    this.hide();
    action.action();
    trackEvent('quick_actions', 'executed', action.id);
  }

  /**
   * Helper: Jump to section
   */
  private jumpToSection(section: number): void {
    const scrollManager = (window as any).scrollManager;
    if (scrollManager) {
      scrollManager.scrollToSection(section);
    }
  }

  /**
   * Helper: Randomize blob
   */
  private randomizeBlob(): void {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const event = new MouseEvent('dblclick', { bubbles: true });
      canvas.dispatchEvent(event);
    }
  }

  /**
   * Helper: Switch tab
   */
  private switchTab(tab: string): void {
    const tabBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`) as HTMLButtonElement;
    tabBtn?.click();
  }
}

/**
 * Initialize onboarding
 */
export function initOnboarding(): OnboardingTour {
  return new OnboardingTour();
}

/**
 * Initialize quick actions
 */
export function initQuickActions(): QuickActions {
  return new QuickActions();
}

