/**
 * Theme Mode Manager
 * Manages dark/light mode across the entire application
 */

export type ThemeMode = 'dark' | 'light';

export class ThemeModeManager {
  private static instance: ThemeModeManager | null = null;
  private static readonly STORAGE_KEY = 'kwami_theme_mode';
  private isDarkMode: boolean = true; // Default to dark mode
  private buttons: HTMLElement[] = [];

  private constructor() {
    this.loadThemeMode();
  }

  public static getInstance(): ThemeModeManager {
    if (!ThemeModeManager.instance) {
      ThemeModeManager.instance = new ThemeModeManager();
    }
    return ThemeModeManager.instance;
  }

  public loadThemeMode(): void {
    const savedMode = localStorage.getItem(ThemeModeManager.STORAGE_KEY);
    this.isDarkMode = savedMode === 'light' ? false : true; // Default to dark
    this.applyThemeMode();
  }

  public saveThemeMode(): void {
    localStorage.setItem(ThemeModeManager.STORAGE_KEY, this.isDarkMode ? 'dark' : 'light');
  }

  public applyThemeMode(): void {
    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme-mode', 'dark');
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.setAttribute('data-theme-mode', 'light');
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    }
  }

  public toggleThemeMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyThemeMode();
    this.saveThemeMode();
    this.updateAllButtons();
    console.log(`🌓 Theme mode: ${this.isDarkMode ? 'dark' : 'light'}`);
  }

  public isDark(): boolean {
    return this.isDarkMode;
  }

  public registerButton(button: HTMLElement): void {
    this.buttons.push(button);
    this.updateButton(button);
  }

  private updateAllButtons(): void {
    this.buttons.forEach(button => this.updateButton(button));
  }

  private updateButton(button: HTMLElement): void {
    const icon = button.querySelector('.theme-toggle-icon');
    if (icon) {
      icon.textContent = this.isDarkMode ? '☀️' : '🌙';
    }
  }

  public createThemeToggleButton(className: string = 'theme-toggle'): HTMLElement {
    const button = document.createElement('button');
    button.className = className;
    button.setAttribute('aria-label', 'Toggle dark/light mode');
    
    const icon = document.createElement('span');
    icon.className = 'theme-toggle-icon';
    icon.textContent = this.isDarkMode ? '☀️' : '🌙';
    
    button.appendChild(icon);
    
    button.addEventListener('click', () => {
      this.toggleThemeMode();
    });
    
    this.registerButton(button);
    
    return button;
  }
}

// Export convenience function
export function getThemeModeManager(): ThemeModeManager {
  return ThemeModeManager.getInstance();
}

