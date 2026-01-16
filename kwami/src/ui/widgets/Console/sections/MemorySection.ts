import { ComponentProps } from '../../../core/Component';
import { createIcon } from '../../../primitives/Icon';

export interface MemorySectionOptions extends ComponentProps {
  kwami?: any;
}

export class MemorySection {
  private container: HTMLDivElement;

  constructor(private options: MemorySectionOptions = {}) {
    this.container = this.createContainer();
    this.render();
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'kwami-console-memory-section';
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
    const icon = createIcon({ name: 'heroicons:cpu-chip', size: '48px', color: 'var(--kwami-color-text-muted)' }).element;
    iconContainer.appendChild(icon);

    const text = document.createElement('div');
    text.style.fontSize = '14px';
    text.style.lineHeight = '1.6';
    text.innerHTML = '<strong>MEMORY Configuration</strong><br/>Manage conversation history and context<br/><br/>Coming soon...';

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
