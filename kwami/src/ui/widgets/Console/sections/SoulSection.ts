import { ComponentProps } from '../../../core/Component';

export interface SoulSectionOptions extends ComponentProps {
  kwami?: any;
}

export class SoulSection {
  private container: HTMLDivElement;

  constructor(private options: SoulSectionOptions = {}) {
    this.container = this.createContainer();
    this.render();
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'kwami-console-soul-section';
    Object.assign(container.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    });
    return container;
  }

  private render(): void {
    const placeholder = document.createElement('div');
    Object.assign(placeholder.style, {
      padding: '40px',
      textAlign: 'center',
      color: 'var(--kwami-color-text-muted)',
    });

    const icon = document.createElement('div');
    icon.textContent = '✨';
    icon.style.fontSize = '48px';
    icon.style.marginBottom = '16px';

    const text = document.createElement('div');
    text.style.fontSize = '14px';
    text.style.lineHeight = '1.6';
    text.innerHTML = '<strong>SOUL Configuration</strong><br/>Personality, behavior patterns, and character traits<br/><br/>Coming soon...';

    placeholder.appendChild(icon);
    placeholder.appendChild(text);
    this.container.appendChild(placeholder);
  }

  getElement(): HTMLDivElement {
    return this.container;
  }

  dispose(): void {
    this.container.remove();
  }
}
