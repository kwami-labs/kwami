import { Component, ComponentProps } from '../../../core/Component';
import { injectComponentStyles } from '../../../utils/StyleUtils';
import { createIcon } from '../../../primitives/Icon';

export type ConsoleTab = 'body' | 'mind' | 'soul';

export interface TabBarProps extends ComponentProps {
  activeTab: ConsoleTab;
  onTabChange: (tab: ConsoleTab) => void;
  theme?: any;
}

const TABBAR_STYLES = `
  .kwami-console-tabbar {
    display: flex;
    gap: 2px;
    padding: 24px 32px 0 32px;
    position: relative;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .kwami-console-tab {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    transition: all 0.2s ease;
    overflow: hidden;
  }

  .kwami-console-tab:hover {
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.02);
  }

  .kwami-console-tab.is-active {
    color: #fff;
    font-weight: 600;
  }
  
  /* Active Indicator */
  .kwami-console-tab::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: #38bdf8;
    transform: scaleX(0);
    transition: transform 0.25s cubic-bezier(0.2, 0, 0, 1);
    box-shadow: 0 -2px 10px rgba(56, 189, 248, 0.5);
  }

  .kwami-console-tab.is-active::after {
    transform: scaleX(1);
  }

  /* Glow effect */
  .kwami-console-tab::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center bottom, rgba(56, 189, 248, 0.15) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  
  .kwami-console-tab.is-active::before {
    opacity: 1;
  }
`;

export class TabBar extends Component<TabBarProps> {
  private tabs: Map<ConsoleTab, HTMLButtonElement> = new Map();

  constructor(props: TabBarProps) {
    super('div', props);
    injectComponentStyles('TabBar', TABBAR_STYLES);
    this.init();
  }

  private init(): void {
    this.element.className = 'kwami-console-tabbar';
    this.renderTabs();
  }

  private renderTabs(): void {
    const tabConfigs: Array<{ id: ConsoleTab; label: string; icon: string }> = [
      { id: 'body', label: 'Body', icon: 'heroicons:beaker' },
      { id: 'mind', label: 'Mind', icon: 'heroicons:cpu-chip' },
      { id: 'soul', label: 'Soul', icon: 'heroicons:sparkles' },
    ];

    tabConfigs.forEach(config => {
      const tabBtn = this.createTab(config.id, config.icon, config.label);
      this.tabs.set(config.id, tabBtn);
      this.element.appendChild(tabBtn);
    });
  }

  private createTab(id: ConsoleTab, icon: string, label: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'kwami-console-tab';
    this.updateTabState(btn, id === this.props.activeTab);

    // Icon
    const iconElement = createIcon({
      name: icon,
      size: 'md',
    }).element;
    iconElement.style.color = 'inherit';

    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;

    btn.appendChild(iconElement);
    btn.appendChild(labelSpan);

    btn.addEventListener('click', () => {
      this.props.onTabChange(id);
    });

    return btn;
  }

  private updateTabState(btn: HTMLButtonElement, isActive: boolean): void {
    if (isActive) {
      btn.classList.add('is-active');
    } else {
      btn.classList.remove('is-active');
    }
  }

  public updateActiveTab(tab: ConsoleTab): void {
    const oldTab = this.props.activeTab;
    this.update({ activeTab: tab });

    const oldBtn = this.tabs.get(oldTab);
    if (oldBtn) this.updateTabState(oldBtn, false);

    const newBtn = this.tabs.get(tab);
    if (newBtn) this.updateTabState(newBtn, true);
  }

  public dispose(): void {
    this.destroy();
  }
}
