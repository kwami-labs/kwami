let stylesInjected = false;

export function ensureGlassBaseStyles(): void {
  if (stylesInjected || typeof document === 'undefined') return;
  stylesInjected = true;

  const style = document.createElement('style');
  style.id = 'kwami-glass-styles';
  style.textContent = `
    :root {
      --kwami-scrollbar-track: rgba(15, 23, 42, 0.08);
      --kwami-scrollbar-thumb: rgba(148, 163, 184, 0.55);
      --kwami-scrollbar-thumb-hover: rgba(148, 163, 184, 0.75);
    }

    /* Modern default scrollbar styling (Firefox + WebKit) */
    * {
      scrollbar-width: thin;
      scrollbar-color: var(--kwami-scrollbar-thumb) var(--kwami-scrollbar-track);
    }

    *::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    *::-webkit-scrollbar-track {
      background: var(--kwami-scrollbar-track);
      border-radius: 999px;
    }

    *::-webkit-scrollbar-thumb {
      background: var(--kwami-scrollbar-thumb);
      border-radius: 999px;
      border: 2px solid transparent;
      background-clip: content-box;
    }

    *::-webkit-scrollbar-thumb:hover {
      background: var(--kwami-scrollbar-thumb-hover);
      background-clip: content-box;
    }

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

    /* Wallet list */
    .kwami-wallet-list {
      max-height: 320px;
      overflow: auto;
      padding-right: 6px;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }

    .kwami-glass-wallet-option {
      width: 100%;
      cursor: pointer;
      text-align: left;
      padding: 0.72rem 0.85rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.85rem;

      /* override button typography */
      text-transform: none;
      letter-spacing: normal;

      /* reset native button styles */
      appearance: none;
      -webkit-appearance: none;
      border: var(--glass-border-width, 1px) solid var(--glass-outline, rgba(148,163,184,0.2));
      background: color-mix(in srgb, var(--glass-surface, rgba(255,255,255,0.75)) 82%, transparent);
    }

    .kwami-glass-wallet-option:focus {
      outline: none;
    }

    .kwami-glass-wallet-option:focus-visible {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--glass-accent, #7c3aed) 45%, transparent);
    }

    .kwami-glass-wallet-option[disabled] {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .kwami-glass-wallet-option > * {
      position: relative;
      z-index: 1;
    }

    .kwami-wallet-option-icon {
      width: 34px;
      height: 34px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--glass-text);
      background: color-mix(in srgb, var(--glass-accent, #7c3aed) 18%, transparent);
      border: 1px solid color-mix(in srgb, var(--glass-accent, #7c3aed) 28%, transparent);
      box-shadow: 0 16px 40px color-mix(in srgb, var(--glass-accent, #7c3aed) 20%, transparent);
      flex: 0 0 auto;
    }

    .kwami-wallet-option-icon svg {
      width: 20px;
      height: 20px;
      display: block;
    }
    .kwami-wallet-option-name {
      font-weight: 750;
      font-size: 0.92rem;
      line-height: 1.15;
    }

    .kwami-wallet-option-subtitle {
      font-size: 0.68rem;
      opacity: 0.7;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .kwami-wallet-option-pill {
      flex: 0 0 auto;
      padding: 0.3rem 0.5rem;
      border-radius: 999px;
      font-size: 0.66rem;
      font-weight: 750;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      border: 1px solid var(--glass-outline, rgba(148,163,184,0.2));
      background: color-mix(in srgb, var(--glass-surface, rgba(255,255,255,0.75)) 70%, transparent);
    }

    .kwami-wallet-option-pill--primary {
      border-color: color-mix(in srgb, var(--glass-accent, #7c3aed) 45%, var(--glass-outline, rgba(148,163,184,0.2)));
      background: color-mix(in srgb, var(--glass-accent, #7c3aed) 18%, transparent);
    }
  `;
  document.head.appendChild(style);
}

