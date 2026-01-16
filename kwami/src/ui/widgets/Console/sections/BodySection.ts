import { ComponentProps } from '../../../core/Component';
import { createIcon } from '../../../primitives/Icon';

export interface BodySectionOptions extends ComponentProps {
  kwami?: any;
}

export class BodySection {
  private container: HTMLDivElement;

  constructor(private options: BodySectionOptions = {}) {
    this.container = this.createContainer();
    this.render();
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'kwami-console-body-section';
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

    const iconContainer = document.createElement('div');
    iconContainer.style.fontSize = '48px';
    iconContainer.style.marginBottom = '16px';
    const icon = createIcon({ name: 'heroicons:beaker', size: '48px', color: 'var(--kwami-color-text-muted)' }).element;
    iconContainer.appendChild(icon);

    const text = document.createElement('div');
    text.style.fontSize = '14px';
    text.style.lineHeight = '1.6';
    text.innerHTML = '<strong>BODY Configuration</strong><br/>Controls for blob appearance, animations, and visual properties.<br/><br/>Coming soon...';

    placeholder.appendChild(iconContainer);
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
