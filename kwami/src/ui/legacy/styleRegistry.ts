/**
 * Legacy Glass Styles Registry
 * 
 * This now works alongside the new theme system.
 * Components using the new theme API (CSS variables) will automatically
 * inherit from the global theme. Legacy glass components continue to work.
 */

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
      /* Default/fixed glow location (used by popovers, buttons, etc.) */
      background: radial-gradient(circle at 20% 20%, var(--glass-glow, rgba(124,58,237,0.18)), transparent 55%);
      transition: opacity 0.3s ease;
      z-index: 0;
    }

    /* GlassCard: cursor-follow glow (opt-in via class) */
    .kwami-glass-card--cursorGlow::after {
      background: radial-gradient(
        circle at var(--glass-hover-x, 20%) var(--glass-hover-y, 20%),
        var(--glass-glow, rgba(124,58,237,0.18)),
        transparent 55%
      );
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

    .kwami-glass-card {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .kwami-glass-card__header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.75rem;
      padding: var(--glass-padding, 1.25rem);
      padding-bottom: 0.95rem;
    }

    .kwami-glass-card__title {
      font-size: 1.05rem;
      font-weight: 750;
      letter-spacing: 0.01em;
      color: var(--glass-text, #0f172a);
      min-width: 0;
    }

    .kwami-glass-card__headerRight {
      font-size: 0.78rem;
      font-weight: 650;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: color-mix(in srgb, var(--glass-text, #0f172a) 65%, transparent);
      flex: 0 0 auto;
      white-space: nowrap;
    }

    .kwami-glass-card__body {
      padding: var(--glass-padding, 1.25rem);
      padding-top: 0;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      min-height: 0;
    }

    .kwami-glass-card__footer {
      padding: var(--glass-padding, 1.25rem);
      padding-top: 0;
      font-size: 0.85rem;
      color: color-mix(in srgb, var(--glass-text, #0f172a) 70%, transparent);
    }

    /* Wallet popover: no bottom padding */
    .kwami-wallet-popover {
      padding-bottom: 0 !important;
    }

    /* Wallet list */
    .kwami-wallet-list {
      /* Taller popover list; still capped by viewport */
      max-height: min(620px, calc(100vh - 220px));
      overflow: auto;
      padding-right: 6px;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;


      background: transparent;
      border: none;
      border-radius: 0;
      padding: 0;

      scrollbar-color: var(--kwami-scrollbar-thumb) transparent;
    }

    .kwami-wallet-list::-webkit-scrollbar-track {
      background: transparent;
    }
      letter-spacing: 0.12em;
      text-transform: uppercase;
      opacity: 0.65;
      padding: 0.35rem 0.1rem 0.15rem;
    }

    .kwami-wallet-list::-webkit-scrollbar-track {
      background: transparent;
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

      /* keep options visually aligned with the popover surface (avoid darker tiles) */
      background: color-mix(in srgb, var(--glass-surface, rgba(255,255,255,0.75)) 94%, transparent);
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

  // Make the GlassCard hover glow follow the cursor position.
  // (Other glass surfaces keep the fixed glow location.)
  const updateHoverVars = (el: HTMLElement, clientX: number, clientY: number) => {
    const rect = el.getBoundingClientRect();
    const x = rect.width > 0 ? ((clientX - rect.left) / rect.width) * 100 : 20;
    const y = rect.height > 0 ? ((clientY - rect.top) / rect.height) * 100 : 20;
    const clamp = (n: number) => Math.max(0, Math.min(100, n));
    el.style.setProperty('--glass-hover-x', `${clamp(x)}%`);
    el.style.setProperty('--glass-hover-y', `${clamp(y)}%`);
  };

  document.addEventListener(
    'pointermove',
    (event) => {
      const target = event.target as Element | null;
      const card = target?.closest?.('.kwami-glass-card--cursorGlow') as HTMLElement | null;
      if (!card) return;
      updateHoverVars(card, event.clientX, event.clientY);
    },
    { passive: true },
  );

  document.addEventListener(
    'pointerout',
    (event) => {
      const target = event.target as Element | null;
      const card = target?.closest?.('.kwami-glass-card--cursorGlow') as HTMLElement | null;
      if (!card) return;

      // If we are moving to another child inside the same card, keep the glow.
      const related = (event as PointerEvent).relatedTarget as Element | null;
      if (related && card.contains(related)) return;

      card.style.removeProperty('--glass-hover-x');
      card.style.removeProperty('--glass-hover-y');
    },
    { passive: true },
  );
}

/**
 * Migration Note:
 * 
 * This file provides legacy glass-specific styles using --glass-* CSS variables.
 * New components should use the theme system (core/theme/) which provides
 * --kwami-* CSS variables that are fully customizable by end users.
 * 
 * Legacy components using --glass-* variables will continue to work, but won't
 * benefit from runtime theme customization.
 * 
 * To migrate a component:
 * 1. Replace --glass-* variables with --kwami-* equivalents
 * 2. Use semantic classes (.kwami-button, .kwami-card, .kwami-surface)
 * 3. Remove inline style.setProperty() calls
 * 4. Let the theme engine handle all styling
 * 
 * Example:
 * Old: background: var(--glass-surface)
 * New: background: var(--kwami-color-surface)
 */

