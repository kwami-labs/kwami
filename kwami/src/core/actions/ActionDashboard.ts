import { ActionManager } from './ActionManager';
import type { AnyActionDefinition } from './types';

interface ActionDashboardOptions {
  width?: number;
  height?: number;
}

interface ActionCardConfig {
  action: AnyActionDefinition;
  onExecute: (action: AnyActionDefinition) => void;
}

/**
 * ActionDashboard
 *
 * A larger glassmorphic command center for the Kwami canvas that appears
 * when the user right-clicks outside of the blob. Meant to showcase
 * available actions, quick toggles, and global capabilities.
 */
export class ActionDashboard {
  private overlay: HTMLDivElement | null = null;
  private panel: HTMLDivElement | null = null;
  private actionContainer: HTMLDivElement | null = null;
  private isVisible = false;
  private options: Required<ActionDashboardOptions>;

  constructor(private actionManager: ActionManager, options?: ActionDashboardOptions) {
    this.options = {
      width: options?.width ?? 420,
      height: options?.height ?? 460,
    };
    this.injectStyles();
  }

  /**
    * Show the dashboard near the cursor position
    */
  show(x: number, y: number): void {
    if (!this.overlay) {
      this.createElements();
    }

    this.renderActions();
    this.positionPanel(x, y);

    document.body.appendChild(this.overlay!);
    requestAnimationFrame(() => {
      if (!this.overlay || !this.panel) return;
      this.overlay.style.opacity = '1';
      this.overlay.style.pointerEvents = 'auto';
      this.panel.style.transform = 'translateY(0)';
      this.panel.style.opacity = '1';
    });

    this.isVisible = true;
  }

  /**
   * Hide the dashboard with a subtle fade-out
   */
  hide(): void {
    if (!this.overlay || !this.panel || !this.isVisible) return;

    this.overlay.style.opacity = '0';
    this.overlay.style.pointerEvents = 'none';
    this.panel.style.transform = 'translateY(16px)';
    this.panel.style.opacity = '0';

    setTimeout(() => {
      if (this.overlay && this.overlay.parentElement) {
        this.overlay.parentElement.removeChild(this.overlay);
      }
    }, 220);

    this.isVisible = false;
  }

  private createElements(): void {
    this.overlay = document.createElement('div');
    Object.assign(this.overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '9998',
      display: 'block',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 0.25s ease',
    });

    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay) {
        this.hide();
      }
    });

    const panel = document.createElement('div');
    this.panel = panel;
    Object.assign(panel.style, {
      position: 'absolute',
      width: `${this.options.width}px`,
      minHeight: `${this.options.height}px`,
      borderRadius: '24px',
      padding: '28px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      background:
        'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(90,105,255,0.12))',
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow:
        '0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(120, 140, 255, 0.15)',
      backdropFilter: 'blur(30px) saturate(180%)',
      WebkitBackdropFilter: 'blur(30px) saturate(180%)',
      color: '#f5f7ff',
      transform: 'translateY(16px)',
      opacity: '0',
      transition: 'transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.25s ease',
    });

    const header = document.createElement('div');
    Object.assign(header.style, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    });

    const titleWrapper = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = 'Command Dashboard';
    Object.assign(title.style, {
      margin: '0',
      fontSize: '1.4rem',
      fontWeight: '600',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    });

    const subtitle = document.createElement('p');
    subtitle.textContent = 'Orchestrate body, mind & soul from one place.';
    Object.assign(subtitle.style, {
      margin: '6px 0 0 0',
      color: 'rgba(255,255,255,0.7)',
      fontSize: '0.9rem',
      letterSpacing: '0.03em',
    });

    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.setAttribute('aria-label', 'Close dashboard');
    Object.assign(closeButton.style, {
      width: '36px',
      height: '36px',
      borderRadius: '999px',
      border: '1px solid rgba(255,255,255,0.2)',
      background: 'rgba(255,255,255,0.08)',
      color: '#fff',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, background 0.2s ease',
    });
    closeButton.addEventListener('click', () => this.hide());
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.transform = 'scale(1.05)';
      closeButton.style.background = 'rgba(255,255,255,0.2)';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.transform = 'scale(1)';
      closeButton.style.background = 'rgba(255,255,255,0.08)';
    });

    titleWrapper.appendChild(title);
    titleWrapper.appendChild(subtitle);
    header.appendChild(titleWrapper);
    header.appendChild(closeButton);

    const actionsLabel = document.createElement('div');
    actionsLabel.textContent = 'Quick Actions';
    Object.assign(actionsLabel.style, {
      fontSize: '0.85rem',
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.6)',
    });

    this.actionContainer = document.createElement('div');
    Object.assign(this.actionContainer.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '12px',
    });

    panel.appendChild(header);
    panel.appendChild(actionsLabel);
    panel.appendChild(this.actionContainer);
    this.overlay.appendChild(panel);
  }

  private renderActions(): void {
    if (!this.actionContainer) return;
    const actions = this.actionManager.getAllActions({ enabled: true });
    this.actionContainer.innerHTML = '';

    if (!actions.length) {
      const emptyState = document.createElement('div');
      emptyState.textContent = 'No actions available yet.';
      Object.assign(emptyState.style, {
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        padding: '24px 0',
      });
      this.actionContainer.appendChild(emptyState);
      return;
    }

    const featured = actions.slice(0, 8);
    featured.forEach((action) => {
      this.actionContainer!.appendChild(this.createActionCard({
        action,
        onExecute: async (selected) => {
          await this.actionManager.executeAction(selected.id, {
            context: { trigger: 'context-menu' },
          });
          this.hide();
        },
      }));
    });
  }

  private createActionCard({ action, onExecute }: ActionCardConfig): HTMLDivElement {
    const card = document.createElement('div');
    Object.assign(card.style, {
      padding: '16px',
      borderRadius: '18px',
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      cursor: action.enabled === false ? 'not-allowed' : 'pointer',
      opacity: action.enabled === false ? '0.5' : '1',
      transition: 'transform 0.2s ease, border 0.2s ease, background 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    });

    const title = document.createElement('div');
    title.textContent = action.name;
    Object.assign(title.style, {
      fontWeight: '600',
      letterSpacing: '0.03em',
      fontSize: '1rem',
    });

    const description = document.createElement('div');
    description.textContent = action.description || 'Execute this capability.';
    Object.assign(description.style, {
      fontSize: '0.85rem',
      color: 'rgba(255,255,255,0.7)',
      lineHeight: '1.4',
      flex: '1',
    });

    const footer = document.createElement('div');
    Object.assign(footer.style, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 'auto',
    });

    const category = document.createElement('span');
    category.textContent = action.category.toUpperCase();
    Object.assign(category.style, {
      fontSize: '0.7rem',
      letterSpacing: '0.2em',
      color: 'rgba(255,255,255,0.5)',
    });

    const invokeButton = document.createElement('button');
    invokeButton.textContent = 'Activate';
    Object.assign(invokeButton.style, {
      border: 'none',
      borderRadius: '999px',
      padding: '6px 16px',
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      background: 'linear-gradient(135deg, #7c6bff, #5de0ff)',
      color: '#0f0f1a',
      cursor: action.enabled === false ? 'not-allowed' : 'pointer',
      opacity: action.enabled === false ? '0.6' : '1',
      transition: 'opacity 0.2s ease, transform 0.2s ease',
    });

    if (action.enabled !== false) {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
        card.style.border = '1px solid rgba(255,255,255,0.25)';
        card.style.background = 'rgba(255,255,255,0.14)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.border = '1px solid rgba(255,255,255,0.1)';
        card.style.background = 'rgba(255,255,255,0.08)';
      });

      const execute = async () => {
        invokeButton.disabled = true;
        invokeButton.textContent = 'Running...';
        try {
          await onExecute(action);
        } catch (error) {
          console.error('Failed to run action', error);
        } finally {
          invokeButton.disabled = false;
          invokeButton.textContent = 'Activate';
        }
      };

      card.addEventListener('click', execute);
      invokeButton.addEventListener('click', (event) => {
        event.stopPropagation();
        execute();
      });
    }

    footer.appendChild(category);
    footer.appendChild(invokeButton);

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(footer);

    return card;
  }

  private positionPanel(x: number, y: number): void {
    if (!this.panel) return;
    const width = this.options.width;
    const height = this.options.height;

    const padding = 24;
    const clampedX = Math.min(
      Math.max(padding, x - width / 2),
      window.innerWidth - width - padding
    );
    const clampedY = Math.min(
      Math.max(padding, y - height / 2),
      window.innerHeight - height - padding
    );

    this.panel.style.left = `${clampedX}px`;
    this.panel.style.top = `${clampedY}px`;
  }

  private injectStyles(): void {
    if (typeof document === 'undefined') return;
    const styleId = 'kwami-dashboard-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes dashboardFadeIn {
        from {
          opacity: 0;
          transform: scale(0.98);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

