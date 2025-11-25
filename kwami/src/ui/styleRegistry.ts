let stylesInjected = false;

export function ensureGlassBaseStyles(): void {
  if (stylesInjected || typeof document === 'undefined') return;
  stylesInjected = true;

  const style = document.createElement('style');
  style.id = 'kwami-glass-styles';
  style.textContent = `
    .kwami-glass-surface {
      position: relative;
      background: var(--glass-surface, rgba(255,255,255,0.78));
      border-radius: var(--glass-radius, 20px);
      border: var(--glass-border-width, 1px) solid var(--glass-outline, rgba(15,23,42,0.12));
      backdrop-filter: var(--glass-blur, blur(20px) saturate(180%));
      -webkit-backdrop-filter: var(--glass-blur, blur(20px) saturate(180%));
      box-shadow: var(--glass-shadow, 0 25px 60px rgba(15,23,42,0.15));
      color: var(--glass-text, #0f172a);
      transition: background 0.25s ease, border 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
    }

    .kwami-glass-surface::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      opacity: 0;
      background: radial-gradient(circle at 20% 20%, var(--glass-glow, rgba(124,58,237,0.18)), transparent 55%);
      transition: opacity 0.3s ease;
      z-index: 0;
    }

    .kwami-glass-surface:hover::after {
      opacity: 1;
    }

    .kwami-glass-button {
      font-family: 'Inter', 'SF Pro Display', system-ui, -apple-system, BlinkMacSystemFont;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      border: none;
      outline: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      padding: 0.65rem 1.4rem;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      color: var(--glass-text);
      background: var(--glass-surface);
      border-radius: var(--glass-radius, 999px);
      border: var(--glass-border-width, 1px) solid var(--glass-outline);
      box-shadow: var(--glass-shadow);
      transition: transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease, background 0.2s ease;
    }

    .kwami-glass-button::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, transparent 0%, var(--glass-accent, rgba(124,58,237,0.25)) 50%, transparent 100%);
      opacity: 0;
      transition: opacity 0.2s ease;
      z-index: 0;
    }

    .kwami-glass-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 25px 50px rgba(0,0,0,0.2);
    }

    .kwami-glass-button:hover::after {
      opacity: 0.6;
    }

    .kwami-glass-button > span {
      position: relative;
      z-index: 1;
    }

    .kwami-glass-popover {
      min-width: 280px;
      max-width: 420px;
      padding: var(--glass-padding, 1.25rem);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `;
  document.head.appendChild(style);
}

