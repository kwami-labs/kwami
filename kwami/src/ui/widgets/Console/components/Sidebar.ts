import { resolveGlassTheme } from '../../../legacy/theme';
import type { BaseGlassProps } from '../../../legacy/types';
import { createIcon } from '../../../primitives/Icon';

export type SidebarSection = 'kwami' | 'apps' | 'memory' | 'media' | 'theme' | 'settings';

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
      background: 'var(--kwami-color-background-alt, rgba(0, 0, 0, 0.15))',
      borderRight: 'var(--kwami-border-width, 1px) solid var(--kwami-color-border, rgba(148, 163, 184, 0.2))',
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
      { id: 'theme', icon: 'heroicons:paint-brush', label: 'THEME' },
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
      gap: 'var(--kwami-gap-sm, 10px)',
      padding: 'var(--kwami-padding-sm, 10px) var(--kwami-padding, 12px)',
      borderRadius: 'var(--kwami-radius-sm, 12px)',
      cursor: 'pointer',
      transition: 'all var(--kwami-duration-fast, 150ms) var(--kwami-easing, ease)',
      background: isActive ? 'color-mix(in srgb, var(--kwami-color-accent, #38bdf8) 15%, transparent)' : 'transparent',
      border: 'var(--kwami-border-width, 1px) solid ' + (isActive ? 'color-mix(in srgb, var(--kwami-color-accent, #38bdf8) 30%, transparent)' : 'transparent'),
      fontWeight: isActive ? 'var(--kwami-font-weight-semibold, 600)' : 'var(--kwami-font-weight-medium, 500)',
      fontSize: 'var(--kwami-font-size-xs, 11px)',
      letterSpacing: '0.08em',
      color: isActive ? 'var(--kwami-color-accent, #38bdf8)' : 'var(--kwami-color-text-muted, rgba(226, 232, 240, 0.7))',
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
        { id: 'theme', icon: 'heroicons:paint-brush', label: 'THEME' },
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
