import { resolveGlassTheme } from '../../theme';
import type { BaseGlassProps } from '../../types';

export interface MediaSectionOptions extends BaseGlassProps {
  kwami?: any;
}

export class MediaSection {
  private container: HTMLDivElement;

  constructor(private options: MediaSectionOptions = {}) {
    this.container = this.createContainer();
    this.render();
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'kwami-console-media-section';
    Object.assign(container.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    });
    return container;
  }

  private render(): void {
    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);
    
    const placeholder = document.createElement('div');
    Object.assign(placeholder.style, {
      padding: '40px',
      textAlign: 'center',
      color: theme.palette.muted,
    });

    const icon = document.createElement('div');
    icon.textContent = '🎬';
    icon.style.fontSize = '48px';
    icon.style.marginBottom = '16px';

    const text = document.createElement('div');
    text.style.fontSize = '14px';
    text.style.lineHeight = '1.6';
    text.innerHTML = '<strong>MEDIA Configuration</strong><br/>Upload and manage media files<br/><br/>Coming soon...';

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
