import { Component, ComponentProps } from '../../../core/Component';
import { injectComponentStyles } from '../../../utils/StyleUtils';
import { createIcon } from '../../../primitives/Icon';

export type SidebarSection = 'kwami' | 'apps' | 'memory' | 'media' | 'theme' | 'settings';

export interface SidebarProps extends ComponentProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  miniPreviewElement?: HTMLElement;
  theme?: any;
}

const SIDEBAR_STYLES = `
  .kwami-console-sidebar {
    width: 240px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.2);
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    padding: 0;
  }

  .kwami-sidebar-menu {
    flex: 1;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
  }

  .kwami-sidebar-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
    background: transparent;
    border: 1px solid transparent;
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.05em;
    user-select: none;
  }

  .kwami-sidebar-item:hover {
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.8);
    transform: translateX(4px);
  }

  .kwami-sidebar-item.is-active {
    background: rgba(56, 189, 248, 0.1);
    border-color: rgba(56, 189, 248, 0.2);
    color: #38bdf8;
    font-weight: 600;
    box-shadow: 0 0 20px -10px rgba(56, 189, 248, 0.3);
  }

  .kwami-sidebar-item.is-active .kwami-icon {
    filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.5));
  }
`;

export class Sidebar extends Component<SidebarProps> {
  private menuContainer!: HTMLDivElement;
  private menuItems: Map<SidebarSection, HTMLDivElement> = new Map();

  constructor(props: SidebarProps) {
    super('div', props);
    injectComponentStyles('Sidebar', SIDEBAR_STYLES);
    this.init();
  }

  private init(): void {
    this.element.className = 'kwami-console-sidebar';

    // Add mini preview if provided
    if (this.props.miniPreviewElement) {
      const previewContainer = document.createElement('div');
      previewContainer.style.padding = '24px 24px 0 24px';
      previewContainer.appendChild(this.props.miniPreviewElement);
      this.element.appendChild(previewContainer);
    }

    // Create menu container
    this.menuContainer = document.createElement('div');
    this.menuContainer.className = 'kwami-sidebar-menu';
    this.element.appendChild(this.menuContainer);

    this.renderMenu();
  }

  private renderMenu(): void {
    const menuConfigs: Array<{ id: SidebarSection; icon: string; label: string }> = [
      { id: 'kwami', icon: 'heroicons:sparkles', label: 'KWAMI' },
      { id: 'apps', icon: 'heroicons:puzzle-piece', label: 'APPS' },
      { id: 'memory', icon: 'heroicons:cpu-chip', label: 'MEMORY' },
      { id: 'media', icon: 'heroicons:film', label: 'MEDIA' },
      { id: 'theme', icon: 'heroicons:paint-brush', label: 'THEME' },
      { id: 'settings', icon: 'heroicons:cog-6-tooth', label: 'SETTINGS' },
    ];

    menuConfigs.forEach(config => {
      const menuItem = this.createMenuItem(config.id, config.icon, config.label);
      this.menuItems.set(config.id, menuItem);
      this.menuContainer.appendChild(menuItem);
    });
  }

  private createMenuItem(id: SidebarSection, icon: string, label: string): HTMLDivElement {
    const item = document.createElement('div');
    item.className = 'kwami-sidebar-item';
    this.updateItemState(item, id === this.props.activeSection);

    // Icon
    const iconElement = createIcon({
      name: icon,
      size: 'sm',
      // Color handles by CSS via currentColor / parent color
    }).element;

    // Explicit style override for the icon primitive if needed, 
    // but ideally we rely on CSS inheritance. 
    // Since createIcon likely sets inline styles, we might need to reset or manage them.
    // simpler: Let CSS handle color.
    iconElement.style.color = 'inherit';

    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;

    item.appendChild(iconElement);
    item.appendChild(labelSpan);

    item.addEventListener('click', () => {
      this.props.onSectionChange(id);
    });

    return item;
  }

  private updateItemState(item: HTMLDivElement, isActive: boolean): void {
    if (isActive) {
      item.classList.add('is-active');
    } else {
      item.classList.remove('is-active');
    }
  }

  public updateActiveSection(section: SidebarSection): void {
    const oldSection = this.props.activeSection;
    this.update({ activeSection: section });

    const oldItem = this.menuItems.get(oldSection);
    if (oldItem) this.updateItemState(oldItem, false);

    const newItem = this.menuItems.get(section);
    if (newItem) this.updateItemState(newItem, true);
  }

  public dispose(): void {
    this.destroy();
  }
}
