import type { AnyActionDefinition } from '../soul/actions/types';

/**
 * Context Menu for Kwami Body
 * 
 * Displays a right-click menu on the blob with available actions
 * Features glassmorphic design with dark/light theme support
 */

export interface ContextMenuOptions {
  onActionSelect: (actionId: string) => void;
  getActions: () => AnyActionDefinition[];
  parentElement?: HTMLElement;
  theme?: 'light' | 'dark' | 'auto';
}

export class ContextMenu {
  private menuElement: HTMLDivElement | null = null;
  private options: ContextMenuOptions;
  private isVisible = false;
  private currentTheme: 'light' | 'dark' = 'dark';

  constructor(options: ContextMenuOptions) {
    this.options = options;
    this.detectTheme();
  }

  /**
   * Detect system theme preference
   */
  private detectTheme(): void {
    if (this.options.theme && this.options.theme !== 'auto') {
      this.currentTheme = this.options.theme;
      return;
    }

    // Auto-detect from system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme = prefersDark ? 'dark' : 'light';
    }
  }

  /**
   * Show the context menu at specified coordinates
   */
  show(x: number, y: number): void {
    // Hide any existing menu
    this.hide();

    // Get actions from ActionManager
    const actions = this.options.getActions();
    if (actions.length === 0) {
      return;
    }

    // Create menu element
    this.menuElement = this.createMenuElement(actions);
    
    // Add to DOM first (needed for size calculation)
    const parent = this.options.parentElement || document.body;
    parent.appendChild(this.menuElement);
    
    // Position the menu after adding to DOM
    this.positionMenu(x, y);

    this.isVisible = true;

    // Add click-outside listener
    setTimeout(() => {
      document.addEventListener('click', this.handleClickOutside);
      document.addEventListener('contextmenu', this.handleClickOutside);
    }, 0);
  }

  /**
   * Hide the context menu
   */
  hide(): void {
    if (this.menuElement) {
      this.menuElement.remove();
      this.menuElement = null;
    }
    this.isVisible = false;
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('contextmenu', this.handleClickOutside);
  }

  /**
   * Check if menu is currently visible
   */
  getIsVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Create the menu DOM element
   */
  private createMenuElement(actions: AnyActionDefinition[]): HTMLDivElement {
    const menu = document.createElement('div');
    menu.className = `kwami-context-menu kwami-context-menu--${this.currentTheme}`;
    
    const isDark = this.currentTheme === 'dark';
    
    // Glassmorphic design with theme support
    const styles = {
      // Base styles
      position: 'fixed',
      zIndex: '10000',
      borderRadius: '16px',
      padding: '6px',
      minWidth: '220px',
      maxWidth: '320px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, "Helvetica Neue", sans-serif',
      fontSize: '13px',
      userSelect: 'none',
      
      // Glassmorphic effect
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      
      // Theme-specific colors
      backgroundColor: isDark 
        ? 'rgba(17, 17, 27, 0.75)' 
        : 'rgba(255, 255, 255, 0.75)',
      
      color: isDark ? '#e8e8e8' : '#1a1a1a',
      
      // Border
      border: isDark 
        ? '1px solid rgba(255, 255, 255, 0.08)' 
        : '1px solid rgba(0, 0, 0, 0.06)',
      
      // Shadow
      boxShadow: isDark
        ? '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 0.5px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        : '0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 0.5px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      
      // Animation
      animation: 'kwamiMenuFadeIn 0.15s ease-out',
    };
    
    Object.assign(menu.style, styles);
    
    // Add CSS animation
    this.injectStyles();

    // Group actions
    const grouped = this.groupActions(actions);

    // Create menu items
    Object.entries(grouped).forEach(([groupName, groupActions], groupIndex) => {
      // Add separator between groups
      if (groupIndex > 0) {
        const separator = document.createElement('div');
        Object.assign(separator.style, {
          height: '1px',
          backgroundColor: isDark 
            ? 'rgba(255, 255, 255, 0.06)' 
            : 'rgba(0, 0, 0, 0.06)',
          margin: '6px 8px',
        });
        menu.appendChild(separator);
      }

      // Add group label if not default group
      if (groupName !== 'default') {
        const label = document.createElement('div');
        label.textContent = groupName.charAt(0).toUpperCase() + groupName.slice(1);
        Object.assign(label.style, {
          fontSize: '10px',
          color: isDark 
            ? 'rgba(255, 255, 255, 0.4)' 
            : 'rgba(0, 0, 0, 0.4)',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          padding: '6px 14px 3px',
          fontWeight: '600',
        });
        menu.appendChild(label);
      }

      // Add action items
      groupActions.forEach((action) => {
        const item = this.createMenuItem(action);
        menu.appendChild(item);
      });
    });

    return menu;
  }

  /**
   * Create a single menu item
   */
  private createMenuItem(action: AnyActionDefinition): HTMLDivElement {
    const item = document.createElement('div');
    item.className = 'kwami-context-menu-item';
    const isDark = this.currentTheme === 'dark';
    
    // Extract text without emoji from label
    const label = action.ui?.menuLabel || action.name;
    const cleanLabel = this.extractTextFromLabel(label);
    
    item.textContent = cleanLabel;
    
    const baseStyles = {
      padding: '9px 14px',
      cursor: 'pointer',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      fontSize: '13px',
      fontWeight: '500',
      letterSpacing: '-0.01em',
      margin: '2px 0',
    };
    
    if (action.enabled === false) {
      Object.assign(item.style, {
        ...baseStyles,
        opacity: '0.4',
        cursor: 'not-allowed',
        pointerEvents: 'none',
      });
    } else {
      Object.assign(item.style, {
        ...baseStyles,
        color: isDark ? '#e8e8e8' : '#1a1a1a',
      });
      
      // Hover effect
      item.addEventListener('mouseenter', () => {
        Object.assign(item.style, {
          backgroundColor: isDark 
            ? 'rgba(255, 255, 255, 0.08)' 
            : 'rgba(0, 0, 0, 0.04)',
          transform: 'translateX(2px)',
        });
      });

      item.addEventListener('mouseleave', () => {
        Object.assign(item.style, {
          backgroundColor: 'transparent',
          transform: 'translateX(0)',
        });
      });

      // Active effect
      item.addEventListener('mousedown', () => {
        item.style.transform = 'scale(0.98) translateX(2px)';
      });

      item.addEventListener('mouseup', () => {
        item.style.transform = 'translateX(2px)';
      });
    }

    // Click handler
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      if (action.enabled !== false) {
        this.options.onActionSelect(action.id);
        this.hide();
      }
    });

    return item;
  }

  /**
   * Extract text without emoji from label
   */
  private extractTextFromLabel(label: string): string {
    // Remove emoji and extra spaces
    return label
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emoji
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Remove misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Remove dingbats
      .trim();
  }

  /**
   * Group actions by menu group
   */
  private groupActions(actions: AnyActionDefinition[]): Record<string, AnyActionDefinition[]> {
    const grouped: Record<string, AnyActionDefinition[]> = {};
    
    actions.forEach((action) => {
      const group = action.ui?.menuGroup || 'default';
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(action);
    });

    return grouped;
  }

  /**
   * Inject CSS animations
   */
  private injectStyles(): void {
    if (typeof document === 'undefined') return;
    
    const styleId = 'kwami-context-menu-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes kwamiMenuFadeIn {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(-5px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      
      .kwami-context-menu {
        will-change: transform, opacity;
      }
      
      .kwami-context-menu * {
        box-sizing: border-box;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Position the menu to avoid going off-screen
   */
  private positionMenu(x: number, y: number): void {
    if (!this.menuElement) return;

    // Initial position
    this.menuElement.style.left = `${x}px`;
    this.menuElement.style.top = `${y}px`;

    // Get menu dimensions
    const rect = this.menuElement.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Adjust horizontal position if off-screen
    if (rect.right > windowWidth) {
      this.menuElement.style.left = `${x - rect.width}px`;
    }

    // Adjust vertical position if off-screen
    if (rect.bottom > windowHeight) {
      this.menuElement.style.top = `${y - rect.height}px`;
    }

    // Ensure minimum margins
    const minMargin = 10;
    const finalRect = this.menuElement.getBoundingClientRect();
    
    if (finalRect.left < minMargin) {
      this.menuElement.style.left = `${minMargin}px`;
    }
    if (finalRect.top < minMargin) {
      this.menuElement.style.top = `${minMargin}px`;
    }
  }

  /**
   * Handle clicks outside the menu
   */
  private handleClickOutside = (e: MouseEvent): void => {
    if (this.menuElement && !this.menuElement.contains(e.target as Node)) {
      this.hide();
    }
  };

  /**
   * Dispose the context menu
   */
  dispose(): void {
    this.hide();
  }
}

