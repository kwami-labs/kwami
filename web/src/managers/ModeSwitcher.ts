/**
 * Handles the bottom mode switcher buttons (voice / music / video)
 */
export class ModeSwitcher {
  private currentMode: 'voice' | 'music' | 'video' = 'voice';
  private switcher: HTMLElement | null = null;
  private buttons: NodeListOf<HTMLElement> | null = null;

  constructor() {
    this.switcher = document.querySelector('.mode-switcher');
    this.buttons = document.querySelectorAll('.mode-btn');

    if (this.switcher && this.buttons) {
      this.init();
    }
  }

  public getMode() {
    return this.currentMode;
  }

  private init() {
    this.switcher!.setAttribute('data-active', this.currentMode);

    this.buttons!.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode') as 'voice' | 'music' | 'video';
        this.setMode(mode);
      });
    });
  }

  private setMode(mode: 'voice' | 'music' | 'video') {
    this.currentMode = mode;
    this.switcher!.setAttribute('data-active', mode);

    this.buttons!.forEach(btn => {
      if (btn.getAttribute('data-mode') === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    console.log(`Mode switched to: ${mode}`);
  }
}


