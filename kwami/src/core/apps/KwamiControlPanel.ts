import type { BaseGlassProps } from '../../ui/types';
import { ensureGlassBaseStyles } from '../../ui/styleRegistry';
import { resolveGlassTheme } from '../../ui/theme';

/**
 * Kwami Control Panel
 * 
 * A comprehensive glassmorphic control panel for managing all Kwami configurations.
 * Features:
 * - Horizontal layout with mini blob preview in top-left
 * - Left sidebar menu for navigation
 * - Right content area that changes based on selection
 * - Body, Mind, and Soul configuration tabs
 * - Apps, Memory, Media, and Settings sections
 */

export interface KwamiControlPanelOptions extends BaseGlassProps {
  kwami?: any;
  onClose?: () => void;
}

type MenuSection = 'kwami' | 'apps' | 'memory' | 'media' | 'settings';
type KwamiTab = 'body' | 'mind' | 'soul';

export class KwamiControlPanel {
  private overlay: HTMLDivElement | null = null;
  private panel: HTMLDivElement | null = null;
  private leftSidebar: HTMLDivElement | null = null;
  private rightContent: HTMLDivElement | null = null;
  private miniCanvas: HTMLCanvasElement | null = null;
  private isVisible = false;
  
  private currentSection: MenuSection = 'kwami';
  private currentKwamiTab: KwamiTab = 'body';

  constructor(
    private options: KwamiControlPanelOptions = {}
  ) {
    if (typeof document !== 'undefined') {
      ensureGlassBaseStyles();
      this.injectStyles();
    }
  }

  show(x?: number, y?: number): void {
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
    this.overlay.className = 'kwami-control-panel-overlay';
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
    this.panel.className = 'kwami-control-panel';
    Object.assign(this.panel.style, {
      position: 'fixed',
      width: '1000px',
      height: '600px',
      borderRadius: '24px',
      border: `1px solid ${theme.palette.outline}`,
      background: theme.palette.surface,
      backdropFilter: 'blur(32px) saturate(180%)',
      boxShadow: theme.shadows.soft,
      display: 'flex',
      opacity: '0',
      transform: 'scale(0.95)',
      transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      overflow: 'hidden',
    });

    this.overlay.appendChild(this.panel);

    // Add click-outside to close
    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay) {
        this.hide();
      }
    });

    // Add escape key to close
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

    // Create left sidebar
    this.createLeftSidebar();
    
    // Create right content area
    this.createRightContent();

    if (this.leftSidebar && this.rightContent) {
      this.panel.appendChild(this.leftSidebar);
      this.panel.appendChild(this.rightContent);
    }
  }

  private createLeftSidebar(): void {
    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);
    
    this.leftSidebar = document.createElement('div');
    this.leftSidebar.className = 'kwami-control-sidebar';
    Object.assign(this.leftSidebar.style, {
      width: '200px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(0, 0, 0, 0.15)',
      borderRight: `1px solid ${theme.palette.outline}`,
      padding: '0',
    });

    // Mini Kwami preview at top
    const miniPreview = this.createMiniPreview();
    this.leftSidebar.appendChild(miniPreview);

    // Menu items
    const menuContainer = document.createElement('div');
    menuContainer.style.flex = '1';
    menuContainer.style.padding = '16px 12px';
    menuContainer.style.display = 'flex';
    menuContainer.style.flexDirection = 'column';
    menuContainer.style.gap = '6px';
    menuContainer.style.overflowY = 'auto';

    const menuItems: Array<{ id: MenuSection; icon: string; label: string }> = [
      { id: 'kwami', icon: '👻', label: 'KWAMI' },
      { id: 'apps', icon: '🧩', label: 'APPS' },
      { id: 'memory', icon: '🧠', label: 'MEMORY' },
      { id: 'media', icon: '🎬', label: 'MEDIA' },
      { id: 'settings', icon: '⚙️', label: 'SETTINGS' },
    ];

    menuItems.forEach(item => {
      const menuItem = this.createMenuItem(item.id, item.icon, item.label);
      menuContainer.appendChild(menuItem);
    });

    this.leftSidebar.appendChild(menuContainer);
  }

  private createMiniPreview(): HTMLDivElement {
    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);
    
    const container = document.createElement('div');
    container.className = 'kwami-mini-preview';
    Object.assign(container.style, {
      width: '100%',
      height: '180px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottom: `1px solid ${theme.palette.outline}`,
      background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)',
      cursor: 'pointer',
      transition: 'background 0.2s ease',
      position: 'relative',
    });

    // Add hover effect
    container.addEventListener('mouseenter', () => {
      container.style.background = 'linear-gradient(180deg, rgba(102, 126, 234, 0.15) 0%, rgba(0, 0, 0, 0.08) 100%)';
    });
    container.addEventListener('mouseleave', () => {
      container.style.background = 'linear-gradient(180deg, rgba(102, 126, 234, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)';
    });

    // Mini canvas for blob preview
    this.miniCanvas = document.createElement('canvas');
    this.miniCanvas.width = 120;
    this.miniCanvas.height = 120;
    this.miniCanvas.style.width = '120px';
    this.miniCanvas.style.height = '120px';
    container.appendChild(this.miniCanvas);

    // TODO: Render mini blob preview from main Kwami instance
    // For now, just show placeholder
    const ctx = this.miniCanvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(60, 60, 20, 60, 60, 60);
      gradient.addColorStop(0, 'rgba(102, 126, 234, 0.8)');
      gradient.addColorStop(1, 'rgba(102, 126, 234, 0.2)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(60, 60, 50, 0, Math.PI * 2);
      ctx.fill();
    }

    // Click to switch back to kwami view
    container.addEventListener('click', () => {
      this.switchSection('kwami');
    });

    return container;
  }

  private createMenuItem(id: MenuSection, icon: string, label: string): HTMLDivElement {
    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);
    const isActive = this.currentSection === id;
    
    const item = document.createElement('div');
    item.className = 'kwami-menu-item';
    Object.assign(item.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 12px',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      background: isActive ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
      border: isActive ? `1px solid rgba(102, 126, 234, 0.3)` : '1px solid transparent',
      fontWeight: isActive ? '600' : '500',
      fontSize: '11px',
      letterSpacing: '0.08em',
      color: isActive ? theme.palette.accent : theme.palette.muted,
    });

    const iconSpan = document.createElement('span');
    iconSpan.textContent = icon;
    iconSpan.style.fontSize = '16px';

    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;

    item.appendChild(iconSpan);
    item.appendChild(labelSpan);

    // Hover effects
    item.addEventListener('mouseenter', () => {
      if (!isActive) {
        item.style.background = 'rgba(255, 255, 255, 0.05)';
        item.style.transform = 'translateX(3px)';
      }
    });

    item.addEventListener('mouseleave', () => {
      if (!isActive) {
        item.style.background = 'transparent';
        item.style.transform = 'translateX(0)';
      }
    });

    // Click handler
    item.addEventListener('click', () => {
      this.switchSection(id);
    });

    return item;
  }

  private createRightContent(): void {
    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);
    
    this.rightContent = document.createElement('div');
    this.rightContent.className = 'kwami-control-content';
    Object.assign(this.rightContent.style, {
      flex: '1',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    });

    // Render content based on current section
    this.renderSectionContent();
  }

  private renderSectionContent(): void {
    if (!this.rightContent) return;

    this.rightContent.innerHTML = '';

    switch (this.currentSection) {
      case 'kwami':
        this.renderKwamiSection();
        break;
      case 'apps':
        this.renderPlaceholderSection('APPS', 'Connect your favorite apps and services');
        break;
      case 'memory':
        this.renderPlaceholderSection('MEMORY', 'Manage conversation history and context');
        break;
      case 'media':
        this.renderPlaceholderSection('MEDIA', 'Upload and manage media files');
        break;
      case 'settings':
        this.renderPlaceholderSection('SETTINGS', 'Configure global preferences');
        break;
    }
  }

  private renderKwamiSection(): void {
    if (!this.rightContent) return;

    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);

    // Close button (floating top-right)
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    Object.assign(closeBtn.style, {
      position: 'absolute',
      top: '16px',
      right: '20px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: 'none',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      cursor: 'pointer',
      fontSize: '18px',
      color: theme.palette.muted,
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '10',
    });
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'rgba(255, 60, 60, 0.15)';
      closeBtn.style.color = '#ff6b6b';
      closeBtn.style.transform = 'scale(1.1)';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'rgba(255, 255, 255, 0.05)';
      closeBtn.style.color = theme.palette.muted;
      closeBtn.style.transform = 'scale(1)';
    });
    closeBtn.addEventListener('click', () => this.hide());
    this.rightContent.appendChild(closeBtn);

    // Folder-style tab navigation
    const tabNav = document.createElement('div');
    Object.assign(tabNav.style, {
      display: 'flex',
      gap: '8px',
      padding: '20px 32px 0',
      position: 'relative',
    });

    const tabs: Array<{ id: KwamiTab; label: string; icon: string }> = [
      { id: 'body', label: 'Body', icon: '🧬' },
      { id: 'mind', label: 'Mind', icon: '🧠' },
      { id: 'soul', label: 'Soul', icon: '✨' },
    ];

    tabs.forEach(tab => {
      const tabBtn = this.createTabButton(tab.id, tab.icon, tab.label);
      tabNav.appendChild(tabBtn);
    });

    this.rightContent.appendChild(tabNav);

    // Tab content with border
    const tabContent = document.createElement('div');
    Object.assign(tabContent.style, {
      flex: '1',
      padding: '32px',
      overflowY: 'auto',
      border: `1px solid ${theme.palette.outline}`,
      borderRadius: '0 16px 16px 16px',
      marginTop: '-1px',
      marginLeft: '32px',
      marginRight: '32px',
      marginBottom: '32px',
      background: 'rgba(0, 0, 0, 0.15)',
      backdropFilter: 'blur(10px)',
    });

    tabContent.appendChild(this.renderTabContent());
    this.rightContent.appendChild(tabContent);
  }

  private createTabButton(id: KwamiTab, icon: string, label: string): HTMLButtonElement {
    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);
    const isActive = this.currentKwamiTab === id;

    const btn = document.createElement('button');
    Object.assign(btn.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '14px 28px',
      border: isActive ? `1px solid ${theme.palette.outline}` : '1px solid transparent',
      borderBottom: isActive ? 'none' : '1px solid transparent',
      borderRadius: '16px 16px 0 0',
      background: isActive ? 'rgba(0, 0, 0, 0.15)' : 'transparent',
      backdropFilter: isActive ? 'blur(10px)' : 'none',
      color: isActive ? '#FFFFFF' : theme.palette.muted,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: isActive ? '600' : '500',
      letterSpacing: '0.02em',
      transition: 'all 0.2s ease',
      position: 'relative',
      marginBottom: '-1px',
      zIndex: isActive ? '2' : '1',
    });

    const iconSpan = document.createElement('span');
    iconSpan.textContent = icon;
    Object.assign(iconSpan.style, {
      fontSize: '20px',
    });

    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;

    btn.appendChild(iconSpan);
    btn.appendChild(labelSpan);

    btn.addEventListener('mouseenter', () => {
      if (!isActive) {
        btn.style.background = 'rgba(255, 255, 255, 0.04)';
        btn.style.color = '#E0E0E0';
      }
    });

    btn.addEventListener('mouseleave', () => {
      if (!isActive) {
        btn.style.background = 'transparent';
        btn.style.color = theme.palette.muted;
      }
    });

    btn.addEventListener('click', () => {
      this.switchKwamiTab(id);
    });

    return btn;
  }

  private renderTabContent(): HTMLDivElement {
    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);
    
    const content = document.createElement('div');
    Object.assign(content.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    });

    const placeholder = document.createElement('div');
    Object.assign(placeholder.style, {
      padding: '40px',
      textAlign: 'center',
      color: theme.palette.muted,
    });

    const icon = document.createElement('div');
    icon.style.fontSize = '48px';
    icon.style.marginBottom = '16px';
    
    const text = document.createElement('div');
    text.style.fontSize = '14px';
    text.style.lineHeight = '1.6';

    switch (this.currentKwamiTab) {
      case 'body':
        icon.textContent = '🧬';
        text.innerHTML = '<strong>BODY Configuration</strong><br/>Controls for blob appearance, animations, and visual properties.<br/><br/>Coming soon...';
        break;
      case 'mind':
        icon.textContent = '🧠';
        text.innerHTML = '<strong>MIND Configuration</strong><br/>AI agent settings, voice, and conversation parameters.<br/><br/>Coming soon...';
        break;
      case 'soul':
        icon.textContent = '✨';
        text.innerHTML = '<strong>SOUL Configuration</strong><br/>Personality, behavior patterns, and character traits.<br/><br/>Coming soon...';
        break;
    }

    placeholder.appendChild(icon);
    placeholder.appendChild(text);
    content.appendChild(placeholder);

    return content;
  }

  private renderPlaceholderSection(title: string, description: string): void {
    if (!this.rightContent) return;

    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);

    const container = document.createElement('div');
    Object.assign(container.style, {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      textAlign: 'center',
    });

    const titleEl = document.createElement('h2');
    titleEl.textContent = title;
    Object.assign(titleEl.style, {
      margin: '0 0 12px 0',
      fontSize: '24px',
      fontWeight: '600',
      letterSpacing: '0.1em',
      color: theme.palette.text,
    });

    const desc = document.createElement('p');
    desc.textContent = description;
    Object.assign(desc.style, {
      margin: '0 0 24px 0',
      fontSize: '14px',
      color: theme.palette.muted,
      lineHeight: '1.6',
    });

    const comingSoon = document.createElement('div');
    comingSoon.textContent = 'Coming Soon';
    Object.assign(comingSoon.style, {
      padding: '12px 24px',
      borderRadius: '12px',
      background: 'rgba(102, 126, 234, 0.1)',
      border: `1px solid ${theme.palette.outline}`,
      color: theme.palette.accent,
      fontSize: '12px',
      fontWeight: '600',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    });

    container.appendChild(titleEl);
    container.appendChild(desc);
    container.appendChild(comingSoon);
    this.rightContent.appendChild(container);
  }

  private switchSection(section: MenuSection): void {
    this.currentSection = section;
    this.renderContent();
  }

  private switchKwamiTab(tab: KwamiTab): void {
    this.currentKwamiTab = tab;
    this.renderSectionContent();
  }

  private injectStyles(): void {
    if (typeof document === 'undefined') return;
    
    const styleId = 'kwami-control-panel-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .kwami-control-panel-overlay {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, "Helvetica Neue", sans-serif;
      }
      
      .kwami-control-panel * {
        box-sizing: border-box;
      }

      .kwami-control-content::-webkit-scrollbar,
      .kwami-control-sidebar::-webkit-scrollbar {
        width: 8px;
      }

      .kwami-control-content::-webkit-scrollbar-track,
      .kwami-control-sidebar::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
      }

      .kwami-control-content::-webkit-scrollbar-thumb,
      .kwami-control-sidebar::-webkit-scrollbar-thumb {
        background: rgba(102, 126, 234, 0.3);
        border-radius: 4px;
      }

      .kwami-control-content::-webkit-scrollbar-thumb:hover,
      .kwami-control-sidebar::-webkit-scrollbar-thumb:hover {
        background: rgba(102, 126, 234, 0.5);
      }
    `;
    document.head.appendChild(style);
  }

  dispose(): void {
    this.hide();
  }
}
