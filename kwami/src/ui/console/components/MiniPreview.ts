import { resolveGlassTheme } from '../../theme';
import type { BaseGlassProps } from '../../types';

export interface MiniPreviewOptions extends BaseGlassProps {
  onClick?: () => void;
  kwami?: any; // Reference to Kwami instance for live preview
}

export class MiniPreview {
  private container: HTMLDivElement;
  private canvas: HTMLCanvasElement;

  constructor(private options: MiniPreviewOptions = {}) {
    this.container = this.createContainer();
    this.canvas = this.createCanvas();
    this.container.appendChild(this.canvas);
    this.renderPlaceholder();
  }

  private createContainer(): HTMLDivElement {
    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);
    
    const container = document.createElement('div');
    container.className = 'kwami-mini-preview';
    Object.assign(container.style, {
      width: '100%',
      height: '180px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottom: `1px solid ${theme.palette.outline}`,
      background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)',
      cursor: 'pointer',
      transition: 'background 0.2s ease',
      position: 'relative',
    });

    // Hover effect
    container.addEventListener('mouseenter', () => {
      container.style.background = 'linear-gradient(180deg, rgba(102, 126, 234, 0.15) 0%, rgba(0, 0, 0, 0.08) 100%)';
    });
    
    container.addEventListener('mouseleave', () => {
      container.style.background = 'linear-gradient(180deg, rgba(102, 126, 234, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)';
    });

    // Click handler
    if (this.options.onClick) {
      container.addEventListener('click', this.options.onClick);
    }

    return container;
  }

  private createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    canvas.style.width = '120px';
    canvas.style.height = '120px';
    return canvas;
  }

  private renderPlaceholder(): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    // Draw gradient blob placeholder
    const gradient = ctx.createRadialGradient(60, 60, 20, 60, 60, 60);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.8)');
    gradient.addColorStop(1, 'rgba(102, 126, 234, 0.2)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(60, 60, 50, 0, Math.PI * 2);
    ctx.fill();
  }

  getElement(): HTMLDivElement {
    return this.container;
  }

  // TODO: Implement live blob preview from main Kwami instance
  updatePreview(): void {
    // Future: render actual blob preview
    if (this.options.kwami) {
      // Can hook into Kwami instance to render live preview
    }
  }

  dispose(): void {
    this.container.remove();
  }
}
