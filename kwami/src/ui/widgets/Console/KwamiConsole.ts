import type { BaseGlassProps } from '../../legacy/types';
import { ensureGlassBaseStyles } from '../../legacy/styleRegistry';
import { resolveGlassTheme } from '../../legacy/theme';
import { TabBar, type ConsoleTab } from './components/TabBar';
import { Sidebar, type SidebarSection } from './components/Sidebar';
import { MiniPreview } from './components/MiniPreview';
import { BodySection } from './sections/BodySection';
import { MindSection } from './sections/MindSection';
import { SoulSection } from './sections/SoulSection';
import { AppsSection } from './sections/AppsSection';
import { MemorySection } from './sections/MemorySection';
import { MediaSection } from './sections/MediaSection';
import { ThemeSection } from './sections/ThemeSection';
import { SettingsSection } from './sections/SettingsSection';

/**
 * Kwami Console
 * 
 * Main configuration interface for Kwami
 * Modular design with:
 * - Reusable components (TabBar, Sidebar, MiniPreview)
 * - Independent sections (Body, Mind, Soul, Apps, Memory, Media, Settings)
 */

export interface KwamiConsoleOptions extends BaseGlassProps {
  kwami?: any;
  onClose?: () => void;
}

export class KwamiConsole {
  private overlay: HTMLDivElement | null = null;
  private panel: HTMLDivElement | null = null;
  private isVisible = false;
  
  // Components
  private sidebar: Sidebar | null = null;
  private tabBar: TabBar | null = null;
  private miniPreview: MiniPreview | null = null;
  
  // State
  private currentSection: SidebarSection = 'kwami';
  private currentTab: ConsoleTab = 'body';
  
  // Content container
  private contentContainer: HTMLDivElement | null = null;

  constructor(private options: KwamiConsoleOptions = {}) {
    if (typeof document !== 'undefined') {
      ensureGlassBaseStyles();
      this.injectStyles();
    }
  }

  show(): void {
    if (typeof document === 'undefined') return;
    
    if (!this.panel) {
      this.createPanel();
    }

    if (!this.panel || !this.overlay) return;

    this.renderContent();

    // Center the panel on screen
    const panelWidth = 1000;
    const panelHeight = 600;
    const centerX = (window.innerWidth - panelWidth) / 2;
    const centerY = (window.innerHeight - panelHeight) / 2;

    this.panel.style.left = `${centerX}px`;
    this.panel.style.top = `${centerY}px`;

    document.body.appendChild(this.overlay);
    
    requestAnimationFrame(() => {
      if (!this.overlay || !this.panel) return;
      this.overlay.style.opacity = '1';
      this.overlay.style.pointerEvents = 'auto';
      this.panel.style.opacity = '1';
      this.panel.style.transform = 'scale(1)';
    });

    this.isVisible = true;
  }

  hide(): void {
    if (!this.isVisible || !this.overlay || !this.panel) return;
    
    this.overlay.style.opacity = '0';
    this.overlay.style.pointerEvents = 'none';
    this.panel.style.opacity = '0';
    this.panel.style.transform = 'scale(0.95)';
    this.isVisible = false;

    setTimeout(() => {
      if (this.overlay?.parentElement) {
        this.overlay.parentElement.removeChild(this.overlay);
      }
    }, 250);

    this.options.onClose?.();
  }

  private createPanel(): void {
    if (typeof document === 'undefined') return;

    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'kwami-console-overlay';
    Object.assign(this.overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '10000',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 0.25s ease',
      backdropFilter: 'blur(8px)',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    });

    // Create main panel
    this.panel = document.createElement('div');
    this.panel.className = 'kwami-console kwami-surface';
    Object.assign(this.panel.style, {
      position: 'fixed',
      width: '1000px',
      height: '600px',
      borderRadius: 'var(--kwami-radius-lg, 24px)',
      border: 'var(--kwami-border-width, 1px) solid var(--kwami-color-border, rgba(148, 163, 184, 0.2))',
      background: 'var(--kwami-color-surface, rgba(15, 23, 42, 0.8))',
      backdropFilter: 'blur(var(--kwami-blur, 32px)) saturate(var(--kwami-blur-saturation, 180%))',
      boxShadow: 'var(--kwami-shadow, 0 25px 70px rgba(6, 8, 20, 0.55))',
      display: 'flex',
      opacity: '0',
      transform: 'scale(0.95)',
      transition: 'opacity var(--kwami-duration, 300ms) var(--kwami-easing, ease), transform var(--kwami-duration, 300ms) cubic-bezier(0.34, 1.56, 0.64, 1)',
      overflow: 'hidden',
    });

    this.overlay.appendChild(this.panel);

    // Click-outside to close
    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay) {
        this.hide();
      }
    });

    // Escape key to close
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  private renderContent(): void {
    if (!this.panel) return;

    this.panel.innerHTML = '';

    // Create mini preview
    this.miniPreview = new MiniPreview({
      kwami: this.options.kwami,
      onClick: () => this.handleSectionChange('kwami'),
      theme: this.options.theme,
    });

    // Create sidebar
    this.sidebar = new Sidebar({
      activeSection: this.currentSection,
      onSectionChange: (section) => this.handleSectionChange(section),
      miniPreviewElement: this.miniPreview.getElement(),
      theme: this.options.theme,
    });

    // Create right content area
    const rightContent = document.createElement('div');
    rightContent.className = 'kwami-console-content';
    Object.assign(rightContent.style, {
      flex: '1',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    });

    // Add close button
    rightContent.appendChild(this.createCloseButton());

    // Add content based on current section
    if (this.currentSection === 'kwami') {
      // Render tabs
      this.tabBar = new TabBar({
        activeTab: this.currentTab,
        onTabChange: (tab) => this.handleTabChange(tab),
        theme: this.options.theme,
      });
      rightContent.appendChild(this.tabBar.getElement());
    }

    // Add content container
    this.contentContainer = this.createContentContainer();
    rightContent.appendChild(this.contentContainer);
    this.renderSectionContent();

    this.panel.appendChild(this.sidebar.getElement());
    this.panel.appendChild(rightContent);
  }

  private createCloseButton(): HTMLButtonElement {
    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.className = 'kwami-console-close';
    Object.assign(closeBtn.style, {
      position: 'absolute',
      top: 'var(--kwami-padding, 16px)',
      right: 'var(--kwami-padding-lg, 20px)',
      background: 'var(--kwami-color-surface-alt, rgba(255, 255, 255, 0.05))',
      border: 'none',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      cursor: 'pointer',
      fontSize: 'var(--kwami-font-size-lg, 18px)',
      color: 'var(--kwami-color-text-muted, rgba(226, 232, 240, 0.7))',
      transition: 'all var(--kwami-duration-fast, 150ms) var(--kwami-easing, ease)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '10',
    });

    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'var(--kwami-color-error, rgba(255, 60, 60, 0.15))';
      closeBtn.style.color = 'var(--kwami-color-error, #ff6b6b)';
      closeBtn.style.transform = 'scale(1.1)';
    });

    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'var(--kwami-color-surface-alt, rgba(255, 255, 255, 0.05))';
      closeBtn.style.color = 'var(--kwami-color-text-muted, rgba(226, 232, 240, 0.7))';
      closeBtn.style.transform = 'scale(1)';
    });

    closeBtn.addEventListener('click', () => this.hide());

    return closeBtn;
  }

  private createContentContainer(): HTMLDivElement {
    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);
    
    const container = document.createElement('div');
    container.className = 'kwami-console-content-container';
    Object.assign(container.style, {
      flex: '1',
      padding: 'var(--kwami-padding-xl, 32px)',
      overflowY: 'auto',
      border: 'var(--kwami-border-width, 1px) solid var(--kwami-color-border, rgba(148, 163, 184, 0.2))',
      borderRadius: '0 var(--kwami-radius, 16px) var(--kwami-radius, 16px) var(--kwami-radius, 16px)',
      marginTop: this.currentSection === 'kwami' ? '-1px' : 'var(--kwami-padding-lg, 20px)',
      marginLeft: 'var(--kwami-padding-xl, 32px)',
      marginRight: 'var(--kwami-padding-xl, 32px)',
      marginBottom: 'var(--kwami-padding-xl, 32px)',
      background: 'var(--kwami-color-background-alt, rgba(0, 0, 0, 0.15))',
      backdropFilter: 'blur(calc(var(--kwami-blur, 32px) * 0.3))',
    });

    return container;
  }

  private renderSectionContent(): void {
    if (!this.contentContainer) return;

    this.contentContainer.innerHTML = '';

    let section: any;

    switch (this.currentSection) {
      case 'kwami':
        // Render content based on active tab
        switch (this.currentTab) {
          case 'body':
            section = new BodySection({ kwami: this.options.kwami, theme: this.options.theme });
            break;
          case 'mind':
            section = new MindSection({ kwami: this.options.kwami, theme: this.options.theme });
            break;
          case 'soul':
            section = new SoulSection({ kwami: this.options.kwami, theme: this.options.theme });
            break;
        }
        break;
      case 'apps':
        section = new AppsSection({ kwami: this.options.kwami, theme: this.options.theme });
        break;
      case 'memory':
        section = new MemorySection({ kwami: this.options.kwami, theme: this.options.theme });
        break;
      case 'media':
        section = new MediaSection({ kwami: this.options.kwami, theme: this.options.theme });
        break;
      case 'theme':
        section = new ThemeSection({ kwami: this.options.kwami, theme: this.options.theme });
        break;
      case 'settings':
        section = new SettingsSection({ kwami: this.options.kwami, theme: this.options.theme });
        break;
    }

    if (section) {
      this.contentContainer.appendChild(section.getElement());
    }
  }

  private handleSectionChange(section: SidebarSection): void {
    this.currentSection = section;
    this.sidebar?.updateActiveSection(section);
    this.renderContent();
  }

  private handleTabChange(tab: ConsoleTab): void {
    this.currentTab = tab;
    this.tabBar?.updateActiveTab(tab);
    this.renderSectionContent();
  }

  private injectStyles(): void {
    if (typeof document === 'undefined') return;
    
    const styleId = 'kwami-console-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .kwami-console-overlay {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, "Helvetica Neue", sans-serif;
      }
      
      .kwami-console * {
        box-sizing: border-box;
      }

      .kwami-console-content-container::-webkit-scrollbar,
      .kwami-console-sidebar::-webkit-scrollbar {
        width: 8px;
      }

      .kwami-console-content-container::-webkit-scrollbar-track,
      .kwami-console-sidebar::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
      }

      .kwami-console-content-container::-webkit-scrollbar-thumb,
      .kwami-console-sidebar::-webkit-scrollbar-thumb {
        background: rgba(102, 126, 234, 0.3);
        border-radius: 4px;
      }

      .kwami-console-content-container::-webkit-scrollbar-thumb:hover,
      .kwami-console-sidebar::-webkit-scrollbar-thumb:hover {
        background: rgba(102, 126, 234, 0.5);
      }
    `;
    document.head.appendChild(style);
  }

  dispose(): void {
    this.hide();
    this.sidebar?.dispose();
    this.tabBar?.dispose();
    this.miniPreview?.dispose();
  }
}
