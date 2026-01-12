import { resolveGlassTheme } from '../../theme';
import type { BaseGlassProps } from '../../types';

export type ConsoleTab = 'body' | 'mind' | 'soul';

export interface TabBarOptions extends BaseGlassProps {
  activeTab: ConsoleTab;
  onTabChange: (tab: ConsoleTab) => void;
}

export class TabBar {
  private container: HTMLDivElement;
  private tabs: Map<ConsoleTab, HTMLButtonElement> = new Map();

  constructor(private options: TabBarOptions) {
    this.container = this.createContainer();
    this.renderTabs();
  }

  private createContainer(): HTMLDivElement {
    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);
    
    const container = document.createElement('div');
    container.className = 'kwami-console-tabbar';
    Object.assign(container.style, {
      display: 'flex',
      gap: '8px',
      padding: '20px 32px 0',
      position: 'relative',
    });

    return container;
  }

  private renderTabs(): void {
    const tabConfigs: Array<{ id: ConsoleTab; label: string; icon: string }> = [
      { id: 'body', label: 'Body', icon: '🧬' },
      { id: 'mind', label: 'Mind', icon: '🧠' },
      { id: 'soul', label: 'Soul', icon: '✨' },
    ];

    tabConfigs.forEach(config => {
      const tabBtn = this.createTab(config.id, config.icon, config.label);
      this.tabs.set(config.id, tabBtn);
      this.container.appendChild(tabBtn);
    });
  }

  private createTab(id: ConsoleTab, icon: string, label: string): HTMLButtonElement {
    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);
    const isActive = this.options.activeTab === id;

    const btn = document.createElement('button');
    btn.className = 'kwami-console-tab';
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
    iconSpan.style.fontSize = '20px';

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
      this.options.onTabChange(id);
    });

    return btn;
  }

  getElement(): HTMLDivElement {
    return this.container;
  }

  updateActiveTab(tab: ConsoleTab): void {
    this.options.activeTab = tab;
    // Re-render tabs with new active state
    this.container.innerHTML = '';
    this.tabs.clear();
    this.renderTabs();
  }

  dispose(): void {
    this.container.remove();
    this.tabs.clear();
  }
}
