/**
 * Header Menu Manager
 * Manages the hamburger menu toggle for header buttons
 */

export class HeaderMenuManager {
  private hamburgerBtn: HTMLButtonElement;
  private rightHeader: HTMLElement | null;
  private isOpen: boolean = false;

  constructor() {
    this.rightHeader = document.querySelector('.right-header');
    if (!this.rightHeader) {
      console.warn('HeaderMenuManager: .right-header not found');
      return;
    }

    this.hamburgerBtn = this.createHamburgerButton();
    this.rightHeader.appendChild(this.hamburgerBtn);
    
    // Initially hide all buttons
    this.updateButtonsVisibility();
  }

  private createHamburgerButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'hamburger-menu-btn';
    button.setAttribute('aria-label', 'Toggle menu');
    button.setAttribute('aria-expanded', 'false');
    
    // Create hamburger icon with three lines
    const icon = document.createElement('span');
    icon.className = 'hamburger-icon';
    icon.innerHTML = `
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    `;
    
    button.appendChild(icon);
    
    button.addEventListener('click', () => {
      this.toggleMenu();
    });
    
    return button;
  }

  private toggleMenu(): void {
    this.isOpen = !this.isOpen;
    this.updateButtonsVisibility();
    
    // Update aria-expanded attribute
    this.hamburgerBtn.setAttribute('aria-expanded', this.isOpen.toString());
    
    // Toggle active class for animation (active = open = X icon)
    this.hamburgerBtn.classList.toggle('active', this.isOpen);
  }

  private updateButtonsVisibility(): void {
    if (!this.rightHeader) return;

    // Get all buttons except the hamburger itself
    const buttons = this.rightHeader.querySelectorAll('.header-btn, .header-theme-toggle, .language-switcher');
    
    buttons.forEach((button) => {
      const el = button as HTMLElement;
      if (this.isOpen) {
        el.classList.remove('header-hidden');
      } else {
        el.classList.add('header-hidden');
      }
    });
  }
}

