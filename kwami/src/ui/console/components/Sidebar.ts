import { resolveGlassTheme } from '../../theme';
import type { BaseGlassProps } from '../../types';
import { createIcon } from '../../components/Icon';

export type SidebarSection = 'kwami' | 'apps' | 'memory' | 'media' | 'settings';

export interface SidebarOptions extends BaseGlassProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  miniPreviewElement?: HTMLDivElement;
}

export class Sidebar {
  private container: HTMLDivElement;
  private menuItems: Map<SidebarSection, HTMLDivElement> = new Map();

  constructor(private options: SidebarOptions) {
    this.container = this.createContainer();
    this.render();
  }

  private createContainer(): HTMLDivElement {
    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);
    
    const container = document.createElement('div');
    container.className = 'kwami-console-sidebar';
    Object.assign(container.style, {
      width: '200px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(0, 0, 0, 0.15)',
      borderRight: `1px solid ${theme.palette.outline}`,
      padding: '0',
    });

    return container;
  }

  private render(): void {
    // Add mini preview if provided
    if (this.options.miniPreviewElement) {
      this.container.appendChild(this.options.miniPreviewElement);
    }

    // Create menu container
    const menuContainer = document.createElement('div');
    menuContainer.style.flex = '1';
    menuContainer.style.padding = '16px 12px';
    menuContainer.style.display = 'flex';
    menuContainer.style.flexDirection = 'column';
    menuContainer.style.gap = '6px';
    menuContainer.style.overflowY = 'auto';

    const menuConfigs: Array<{ id: SidebarSection; icon: string; label: string }> = [
      { id: 'kwami', icon: 'heroicons:sparkles', label: 'KWAMI' },
      { id: 'apps', icon: 'heroicons:puzzle-piece', label: 'APPS' },
      { id: 'memory', icon: 'heroicons:cpu-chip', label: 'MEMORY' },
      { id: 'media', icon: 'heroicons:film', label: 'MEDIA' },
      { id: 'settings', icon: 'heroicons:cog-6-tooth', label: 'SETTINGS' },
    ];

    menuConfigs.forEach(config => {
      const menuItem = this.createMenuItem(config.id, config.icon, config.label);
      this.menuItems.set(config.id, menuItem);
      menuContainer.appendChild(menuItem);
    });

    this.container.appendChild(menuContainer);
  }

  private createMenuItem(id: SidebarSection, icon: string, label: string): HTMLDivElement {
    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);
    const isActive = this.options.activeSection === id;
    
    const item = document.createElement('div');
    item.className = 'kwami-sidebar-item';
    Object.assign(item.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 12px',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      background: isActive ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
      border: isActive ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid transparent',
      fontWeight: isActive ? '600' : '500',
      fontSize: '11px',
      letterSpacing: '0.08em',
      color: isActive ? theme.palette.accent : theme.palette.muted,
    });

    const iconElement = createIcon({ name: icon, size: 'sm', color: isActive ? theme.palette.accent : theme.palette.muted }).element;

    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;

    item.appendChild(iconElement);
    item.appendChild(labelSpan);

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

    item.addEventListener('click', () => {
      this.options.onSectionChange(id);
    });

    return item;
  }

  getElement(): HTMLDivElement {
    return this.container;
  }

  updateActiveSection(section: SidebarSection): void {
    this.options.activeSection = section;
    // Re-render menu items
    const menuContainer = this.container.querySelector('.kwami-sidebar-item')?.parentElement;
    if (menuContainer) {
      menuContainer.innerHTML = '';
      this.menuItems.clear();
      
      const menuConfigs: Array<{ id: SidebarSection; icon: string; label: string }> = [
        { id: 'kwami', icon: 'heroicons:sparkles', label: 'KWAMI' },
        { id: 'apps', icon: 'heroicons:puzzle-piece', label: 'APPS' },
        { id: 'memory', icon: 'heroicons:cpu-chip', label: 'MEMORY' },
        { id: 'media', icon: 'heroicons:film', label: 'MEDIA' },
        { id: 'settings', icon: 'heroicons:cog-6-tooth', label: 'SETTINGS' },
      ];

      menuConfigs.forEach(config => {
        const menuItem = this.createMenuItem(config.id, config.icon, config.label);
        this.menuItems.set(config.id, menuItem);
        menuContainer.appendChild(menuItem);
      });
    }
  }

  dispose(): void {
    this.container.remove();
    this.menuItems.clear();
  }
}
