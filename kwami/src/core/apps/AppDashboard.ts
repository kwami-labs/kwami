import type { AppConnectorButton } from '../../apps/registry';
import { ensureGlassBaseStyles } from '../../ui/styleRegistry';
import { resolveGlassTheme } from '../../ui/theme';
import type { BaseGlassProps } from '../../ui/types';

export interface AppDashboardOptions extends BaseGlassProps {
  width?: number;
  height?: number;
  header?: string;
  subheading?: string;
}

export class AppDashboard {
  private overlay: HTMLDivElement | null = null;
  private panel: HTMLDivElement | null = null;
  private isVisible = false;

  constructor(
    private connectors: AppConnectorButton[],
    private context: { kwami?: any } = {},
    private options: AppDashboardOptions = {},
  ) {
    if (typeof document !== 'undefined') {
      ensureGlassBaseStyles();
    }
  }

  show(x: number, y: number): void {
    if (typeof document === 'undefined') return;
    if (!this.panel) {
      this.createPanel();
    }

    if (!this.panel || !this.overlay) return;

    this.renderContent();

    const { width = 420 } = this.options;
    const padding = 24;
    const panelRect = { width, height: this.panel.offsetHeight || 480 };
    const clampedX = Math.max(padding, Math.min(window.innerWidth - panelRect.width - padding, x - panelRect.width / 2));
    const clampedY = Math.max(padding, Math.min(window.innerHeight - panelRect.height - padding, y - panelRect.height / 2));

    this.panel.style.left = `${clampedX}px`;
    this.panel.style.top = `${clampedY}px`;

    document.body.appendChild(this.overlay);
    requestAnimationFrame(() => {
      if (!this.overlay || !this.panel) return;
      this.overlay.style.opacity = '1';
      this.overlay.style.pointerEvents = 'auto';
      this.panel.style.opacity = '1';
      this.panel.style.transform = 'translateY(0)';
    });

    this.isVisible = true;
  }

  hide(): void {
    if (!this.isVisible || !this.overlay || !this.panel) return;
    this.overlay.style.opacity = '0';
    this.overlay.style.pointerEvents = 'none';
    this.panel.style.opacity = '0';
    this.panel.style.transform = 'translateY(16px)';
    this.isVisible = false;

    setTimeout(() => {
      if (this.overlay?.parentElement) {
        this.overlay.parentElement.removeChild(this.overlay);
      }
    }, 220);
  }

  private createPanel(): void {
    if (typeof document === 'undefined') return;

    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);

    this.overlay = document.createElement('div');
    Object.assign(this.overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '10000',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 0.2s ease',
    });

    if (this.options?.appearance?.blur) {
      this.overlay.style.backdropFilter = this.options.appearance.blur;
    }

    if (this.options?.className) {
      this.overlay.className = this.options.className;
    }

    this.panel = document.createElement('div');
    const width = this.options.width ?? 420;
    const height = this.options.height ?? undefined;
    this.panel.style.position = 'absolute';
    this.panel.style.width = `${width}px`;
    if (height) {
      this.panel.style.height = `${height}px`;
    }
    this.panel.style.padding = this.options.appearance?.padding ?? '1.5rem';
    this.panel.style.borderRadius = this.options.appearance?.borderRadius ?? '24px';
    this.panel.style.border = this.options.appearance?.borderWidth
      ? `${this.options.appearance.borderWidth} solid ${theme.palette.outline}`
      : `1px solid ${theme.palette.outline}`;
    this.panel.style.background = theme.palette.surface;
    this.panel.style.backdropFilter = this.options.appearance?.blur ?? 'blur(24px) saturate(180%)';
    this.panel.style.boxShadow = theme.shadows.soft;
    this.panel.style.color = theme.palette.text;
    this.panel.style.display = 'flex';
    this.panel.style.flexDirection = 'column';
    this.panel.style.gap = '1rem';
    this.panel.style.opacity = '0';
    this.panel.style.transform = 'translateY(16px)';
    this.panel.style.transition = 'transform 0.25s ease, opacity 0.25s ease';

    this.overlay.appendChild(this.panel);

    if (this.options.theme?.mode === 'dark') {
      this.panel.classList.add('kwami-theme-dark');
    }

    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay) {
        this.hide();
      }
    });
  }

  private renderContent(): void {
    if (!this.panel) return;

    this.panel.innerHTML = '';

    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.flexDirection = 'column';
    header.style.gap = '0.35rem';

    const title = document.createElement('h3');
    title.textContent = this.options.header ?? 'Apps & Connectors';
    title.style.fontSize = '1.1rem';
    title.style.fontWeight = '600';
    title.style.margin = '0';
    title.style.letterSpacing = '0.1em';
    title.style.textTransform = 'uppercase';

    const subtitle = document.createElement('p');
    subtitle.textContent =
      this.options.subheading ?? 'Link your favorite workflows, dashboards, and no-code apps to your Kwami.';
    subtitle.style.margin = '0';
    subtitle.style.fontSize = '0.88rem';
    subtitle.style.color = theme.palette.muted;

    header.appendChild(title);
    header.appendChild(subtitle);
    this.panel.appendChild(header);

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
    grid.style.gap = '0.9rem';
    grid.style.marginTop = '0.75rem';

    this.connectors.forEach((connector) => {
      grid.appendChild(this.renderConnectorCard(connector, theme));
    });

    this.panel.appendChild(grid);
  }

  private renderConnectorCard(connector: AppConnectorButton, theme: ReturnType<typeof resolveGlassTheme>): HTMLElement {
    const card = document.createElement('div');
    card.style.position = 'relative';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.padding = '1rem';
    card.style.borderRadius = '20px';
    card.style.background = theme.palette.surfaceSecondary;
    card.style.border = `1px solid ${theme.palette.outline}`;
    card.style.backdropFilter = 'blur(20px)';
    card.style.boxShadow = theme.shadows.soft;
    card.style.minHeight = '165px';
    card.style.overflow = 'hidden';
    card.style.gap = '0.65rem';

    if (connector.accent) {
      card.style.border = 'none';
      card.style.background = connector.accent;
      card.style.color = '#060812';
    }

    const iconBadge = document.createElement('div');
    iconBadge.textContent = connector.icon ?? '🧩';
    iconBadge.style.width = '44px';
    iconBadge.style.height = '44px';
    iconBadge.style.borderRadius = '12px';
    iconBadge.style.display = 'flex';
    iconBadge.style.alignItems = 'center';
    iconBadge.style.justifyContent = 'center';
    iconBadge.style.fontSize = '1.4rem';
    iconBadge.style.background = connector.accent
      ? 'rgba(255,255,255,0.2)'
      : 'rgba(255,255,255,0.08)';
    iconBadge.style.boxShadow = 'inset 0 0 25px rgba(255,255,255,0.25)';

    const title = document.createElement('h4');
    title.textContent = connector.name;
    title.style.margin = '0';
    title.style.fontSize = '1rem';
    title.style.letterSpacing = '0.05em';

    const description = document.createElement('p');
    description.textContent = connector.description;
    description.style.margin = '0';
    description.style.fontSize = '0.85rem';
    description.style.color = connector.accent ? 'rgba(15,15,15,0.8)' : theme.palette.muted;
    description.style.flex = '1';

    const footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.justifyContent = 'space-between';
    footer.style.alignItems = 'center';
    footer.style.marginTop = 'auto';

    const docsLink = document.createElement('button');
    docsLink.type = 'button';
    docsLink.textContent = connector.actionLabel ?? 'Launch';
    docsLink.style.borderRadius = '999px';
    docsLink.style.border = 'none';
    docsLink.style.padding = '0.45rem 0.95rem';
    docsLink.style.fontSize = '0.75rem';
    docsLink.style.textTransform = 'uppercase';
    docsLink.style.letterSpacing = '0.12em';
    docsLink.style.cursor = 'pointer';
    docsLink.style.background = connector.accent
      ? 'rgba(255,255,255,0.9)'
      : theme.palette.accent;
    docsLink.style.color = connector.accent ? '#0f172a' : '#060812';
    docsLink.style.boxShadow = connector.accent
      ? '0 10px 30px rgba(15, 15, 20, 0.2)'
      : '0 10px 30px rgba(60, 70, 120, 0.4)';

    docsLink.addEventListener('click', (event) => {
      event.stopPropagation();
      this.launchConnector(connector);
    });

    card.addEventListener('click', () => this.launchConnector(connector));

    footer.appendChild(docsLink);

    card.appendChild(iconBadge);
    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(footer);

    return card;
  }

  private launchConnector(connector: AppConnectorButton): void {
    if (connector.onLaunch) {
      try {
        const result = connector.onLaunch({ kwami: this.context.kwami });
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(`[Kwami] Connector ${connector.id} failed`, error);
          });
        }
      } catch (error) {
        console.error(`[Kwami] Connector ${connector.id} failed`, error);
      }
      return;
    }

    if (connector.docsUrl && typeof window !== 'undefined') {
      window.open(connector.docsUrl, '_blank', 'noopener,noreferrer');
    }
  }
}
