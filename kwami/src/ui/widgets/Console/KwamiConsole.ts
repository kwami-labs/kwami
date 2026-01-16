import { Component, ComponentProps } from '../../core/Component';
import { injectComponentStyles } from '../../utils/StyleUtils';
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

const CONSOLE_STYLES = `
  .kwami-console-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background-color: rgba(0, 0, 0, 0.4); /* Fallback */
    background-color: color-mix(in srgb, var(--kwami-color-background) 40%, transparent);
    backdrop-filter: blur(4px);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--kwami-duration) var(--kwami-easing-enter);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .kwami-console-overlay.is-visible {
    opacity: 1;
    pointer-events: auto;
  }

  .kwami-console {
    width: 1000px;
    height: 600px;
    background: var(--kwami-color-surface);
    backdrop-filter: blur(var(--kwami-blur)) saturate(var(--kwami-blur-saturation));
    -webkit-backdrop-filter: blur(var(--kwami-blur)) saturate(var(--kwami-blur-saturation));
    border: var(--kwami-border-width) solid var(--kwami-color-border);
    border-radius: var(--kwami-radius-lg);
    box-shadow: var(--kwami-shadow-xl);
    display: flex;
    overflow: hidden;
    opacity: 0;
    transform: scale(0.96) translateY(10px);
    transition: all var(--kwami-duration-slow) var(--kwami-easing-enter);
    color: var(--kwami-color-text);
  }

  .kwami-console-overlay.is-visible .kwami-console {
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  .kwami-console-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    background: transparent;
  }

  .kwami-console-close {
    position: absolute;
    top: var(--kwami-padding-md);
    right: var(--kwami-padding-md);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: var(--kwami-color-surface-hover);
    color: var(--kwami-color-text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--kwami-duration-fast) var(--kwami-easing);
    z-index: 20;
    font-family: var(--kwami-font-family);
  }

  .kwami-console-close:hover {
    background: var(--kwami-color-error);
    color: var(--kwami-color-text-inverse);
    transform: scale(1.05);
  }

  .kwami-console-content-container {
    flex: 1;
    overflow-y: auto;
    padding: var(--kwami-padding-xl);
    margin: 0 var(--kwami-padding-xl) var(--kwami-padding-xl) var(--kwami-padding-xl);
    background: var(--kwami-color-surface-alt);
    border: 1px solid var(--kwami-color-border);
    border-radius: 0 var(--kwami-radius) var(--kwami-radius) var(--kwami-radius);
    position: relative;
  }
  
  /* Section specific margin adjustments */
  .kwami-console-content-container[data-section="kwami"] {
    margin-top: -1px; /* Connect with tabs */
    border-top-left-radius: 0;
  }
  
  .kwami-console-content-container:not([data-section="kwami"]) {
    margin-top: var(--kwami-gap);
    border-radius: var(--kwami-radius);
  }
`;

export interface KwamiConsoleProps extends ComponentProps {
  kwami?: any;
  theme?: any;
  onClose?: () => void;
}

export class KwamiConsole extends Component<KwamiConsoleProps> {
  private overlay!: HTMLDivElement;
  private consolePanel!: HTMLDivElement;
  private contentContainer!: HTMLDivElement;
  private sidebarContainer!: HTMLDivElement;
  private rightContent!: HTMLDivElement;

  // Components
  private sidebar: Sidebar | null = null;
  private tabBar: TabBar | null = null;
  private miniPreview: MiniPreview | null = null;

  // State
  private currentSection: SidebarSection = 'kwami';
  private currentTab: ConsoleTab = 'body';
  private isVisible = false;

  constructor(props: KwamiConsoleProps = {}) {
    super('div', props);
    injectComponentStyles('KwamiConsole', CONSOLE_STYLES);
    this.init();
  }

  private init(): void {
    // Structure: Overlay -> Panel -> [Sidebar, Content]
    this.element.className = 'kwami-console-overlay';

    // The main panel
    this.consolePanel = document.createElement('div');
    this.consolePanel.className = 'kwami-console';
    this.element.appendChild(this.consolePanel);

    // Stop propagation on panel click
    this.consolePanel.addEventListener('click', (e) => e.stopPropagation());

    // Close on overlay click
    this.element.addEventListener('click', () => this.hide());

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) this.hide();
    });

    this.renderLayout();
  }

  private renderLayout(): void {
    // 1. Sidebar Container
    this.sidebarContainer = document.createElement('div');
    this.consolePanel.appendChild(this.sidebarContainer);

    // Start Mini Preview
    // Note: Legacy components - wrapping them for now
    this.miniPreview = new MiniPreview({
      kwami: this.props.kwami,
      onClick: () => this.handleSectionChange('kwami'),
      theme: this.props.theme,
    });

    // Sidebar
    this.sidebar = new Sidebar({
      activeSection: this.currentSection,
      onSectionChange: (s) => this.handleSectionChange(s),
      miniPreviewElement: this.miniPreview.getElement(),
      theme: this.props.theme,
    });
    this.sidebarContainer.appendChild(this.sidebar.getElement());

    // 2. Right Content
    this.rightContent = document.createElement('div');
    this.rightContent.className = 'kwami-console-content';
    this.consolePanel.appendChild(this.rightContent);

    // Close Button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'kwami-console-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.hide());
    this.rightContent.appendChild(closeBtn);

    // Tab Bar Container (Placeholder)
    // We'll append the tab bar here if the section is 'kwami'

    // Content Container
    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'kwami-console-content-container';
    this.rightContent.appendChild(this.contentContainer);

    this.renderCurrentView();
  }

  private renderCurrentView(): void {
    // Update Tab Bar visibility
    if (this.currentSection === 'kwami') {
      if (!this.tabBar) {
        this.tabBar = new TabBar({
          activeTab: this.currentTab,
          onTabChange: (t) => this.handleTabChange(t),
          theme: this.props.theme,
        });
        // Insert before content container
        this.rightContent.insertBefore(this.tabBar.getElement(), this.contentContainer);
      }
    } else {
      if (this.tabBar) {
        this.tabBar.dispose(); // Remove from DOM
        this.tabBar = null;
      }
    }

    // Update Content Container Look
    this.contentContainer.setAttribute('data-section', this.currentSection);

    // Render Section Content
    this.contentContainer.innerHTML = '';
    let section: any;

    const commonProps = { kwami: this.props.kwami, theme: this.props.theme };

    switch (this.currentSection) {
      case 'kwami':
        switch (this.currentTab) {
          case 'body': section = new BodySection(commonProps); break;
          case 'mind': section = new MindSection(commonProps); break;
          case 'soul': section = new SoulSection(commonProps); break;
        }
        break;
      case 'apps': section = new AppsSection(commonProps); break;
      case 'memory': section = new MemorySection(commonProps); break;
      case 'media': section = new MediaSection(commonProps); break;
      case 'theme': section = new ThemeSection(commonProps); break;
      case 'settings': section = new SettingsSection(commonProps); break;
    }

    if (section && section.getElement) {
      this.contentContainer.appendChild(section.getElement());
    }
  }

  private handleSectionChange(section: SidebarSection): void {
    if (this.currentSection === section) return;
    this.currentSection = section;
    this.sidebar?.updateActiveSection(section);
    this.renderCurrentView();
  }

  private handleTabChange(tab: ConsoleTab): void {
    if (this.currentTab === tab) return;
    this.currentTab = tab;
    this.tabBar?.updateActiveTab(tab);
    this.renderCurrentView();
  }

  // Public API
  public show(): void {
    if (this.isVisible) return;

    document.body.appendChild(this.element);

    // Force reflow
    this.element.offsetHeight;

    this.element.classList.add('is-visible');
    this.isVisible = true;
  }

  public hide(): void {
    if (!this.isVisible) return;

    this.element.classList.remove('is-visible');
    this.isVisible = false;

    setTimeout(() => {
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      this.props.onClose?.();
    }, 300); // Match transition duration
  }

  public dispose(): void {
    this.hide();
    this.sidebar?.dispose();
    this.tabBar?.dispose();
    this.miniPreview?.dispose();
  }
}
