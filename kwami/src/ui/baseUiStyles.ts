let baseUiStylesInjected = false;

/**
 * Injects framework-agnostic base UI styles (buttons, inputs, badges, alerts, cards, etc).
 *
 * - Opt-in: nothing is injected unless you call this.
 * - Framework agnostic: consumers just use the `kwami-*` class contract.
 * - Themeable via CSS variables; supports Tailwind-style `dark` class out of the box.
 */
export function ensureBaseUiStyles(): void {
  if (baseUiStylesInjected || typeof document === 'undefined') return;

  baseUiStylesInjected = true;

  const style = document.createElement('style');
  style.id = 'kwami-base-ui-styles';
  style.textContent = `
    :root {
      --kwami-ui-bg: #ffffff;
      --kwami-ui-surface: #ffffff;
      --kwami-ui-surface-2: #f8fafc;
      --kwami-ui-border: rgba(15, 23, 42, 0.12);
      --kwami-ui-text: #0f172a;
      --kwami-ui-muted: rgba(15, 23, 42, 0.62);
      --kwami-ui-shadow: 0 10px 35px rgba(15, 23, 42, 0.12);
      --kwami-ui-ring: rgba(124, 58, 237, 0.45);

      --kwami-ui-primary: #7c3aed;
      --kwami-ui-green: #16a34a;
      --kwami-ui-red: #dc2626;
      --kwami-ui-gray: #64748b;
    }

    /* Tailwind-style dark mode support (opt-in by adding class="dark" on a parent) */
    .dark {
      --kwami-ui-bg: #030712;
      --kwami-ui-surface: rgba(15, 18, 35, 0.92);
      --kwami-ui-surface-2: rgba(17, 24, 39, 0.8);
      --kwami-ui-border: rgba(148, 163, 184, 0.18);
      --kwami-ui-text: #f8fafc;
      --kwami-ui-muted: rgba(226, 232, 240, 0.7);
      --kwami-ui-shadow: 0 18px 55px rgba(0, 0, 0, 0.45);
      --kwami-ui-ring: rgba(56, 189, 248, 0.35);

      --kwami-ui-primary: #8b5cf6;
      --kwami-ui-green: #22c55e;
      --kwami-ui-red: #ef4444;
      --kwami-ui-gray: #94a3b8;
    }

    /* Accent selection (used by buttons/badges/alerts) */
    .kwami-color-primary { --kwami-ui-accent: var(--kwami-ui-primary); }
    .kwami-color-green { --kwami-ui-accent: var(--kwami-ui-green); }
    .kwami-color-red { --kwami-ui-accent: var(--kwami-ui-red); }
    .kwami-color-gray { --kwami-ui-accent: var(--kwami-ui-gray); }

    .kwami-sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* Spinner utility */
    .kwami-spin {
      animation: kwami-spin 0.85s linear infinite;
    }
    @keyframes kwami-spin {
      to { transform: rotate(360deg); }
    }

    /* Container */
    .kwami-container {
      max-width: 80rem;
      margin-left: auto;
      margin-right: auto;
      padding-left: 1rem;
      padding-right: 1rem;
    }
    @media (min-width: 640px) {
      .kwami-container { padding-left: 1.5rem; padding-right: 1.5rem; }
    }
    @media (min-width: 1024px) {
      .kwami-container { padding-left: 2rem; padding-right: 2rem; }
    }

    /* Card */
    .kwami-card {
      background: var(--kwami-ui-surface);
      color: var(--kwami-ui-text);
      border: 1px solid var(--kwami-ui-border);
      border-radius: 0.75rem;
      box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04);
      overflow: hidden;
    }
    .kwami-card__section {
      padding: 1.25rem;
    }
    .kwami-card__section--header {
      border-bottom: 1px solid var(--kwami-ui-border);
    }
    .kwami-card__section--footer {
      border-top: 1px solid var(--kwami-ui-border);
    }

    /* Button */
    .kwami-btn {
      --kwami-ui-accent: var(--kwami-ui-primary);

      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;

      font-weight: 600;
      border-radius: 0.5rem;
      border: 1px solid transparent;
      cursor: pointer;
      user-select: none;
      text-decoration: none;

      transition: transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
    }

    .kwami-btn:focus { outline: none; }
    .kwami-btn:focus-visible {
      box-shadow: 0 0 0 3px var(--kwami-ui-ring);
    }

    .kwami-btn--xs { padding: 0.35rem 0.6rem; font-size: 0.75rem; }
    .kwami-btn--sm { padding: 0.45rem 0.75rem; font-size: 0.825rem; }
    .kwami-btn--md { padding: 0.6rem 0.95rem; font-size: 0.875rem; }
    .kwami-btn--lg { padding: 0.75rem 1.25rem; font-size: 1rem; }
    .kwami-btn--xl { padding: 0.9rem 1.5rem; font-size: 1rem; }

    /* Icon-only button (square) */
    .kwami-btn--icon {
      padding: 0.55rem;
      line-height: 0;
      width: 2.25rem;
      height: 2.25rem;
    }

    .kwami-btn--block { width: 100%; }

    .kwami-btn:disabled,
    .kwami-btn[aria-disabled="true"] {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
    }

    .kwami-btn--solid {
      background: var(--kwami-ui-accent);
      color: white;
    }
    .kwami-btn--solid:hover:not(:disabled):not([aria-disabled="true"]) {
      filter: brightness(1.05);
      transform: translateY(-1px);
    }

    .kwami-btn--outline {
      background: transparent;
      border-color: color-mix(in srgb, var(--kwami-ui-accent) 60%, var(--kwami-ui-border));
      color: var(--kwami-ui-accent);
    }
    .kwami-btn--outline:hover:not(:disabled):not([aria-disabled="true"]) {
      background: color-mix(in srgb, var(--kwami-ui-accent) 12%, transparent);
    }

    .kwami-btn--soft {
      background: color-mix(in srgb, var(--kwami-ui-accent) 14%, transparent);
      border-color: color-mix(in srgb, var(--kwami-ui-accent) 22%, var(--kwami-ui-border));
      color: color-mix(in srgb, var(--kwami-ui-accent) 85%, var(--kwami-ui-text));
    }
    .kwami-btn--soft:hover:not(:disabled):not([aria-disabled="true"]) {
      background: color-mix(in srgb, var(--kwami-ui-accent) 18%, transparent);
    }

    .kwami-btn--ghost {
      background: transparent;
      border-color: transparent;
      color: var(--kwami-ui-muted);
    }
    .kwami-btn--ghost:hover:not(:disabled):not([aria-disabled="true"]) {
      background: color-mix(in srgb, var(--kwami-ui-border) 40%, transparent);
      color: var(--kwami-ui-text);
    }

    .kwami-btn--link {
      background: transparent;
      border-color: transparent;
      padding: 0;
      color: var(--kwami-ui-accent);
      text-decoration: underline;
      text-underline-offset: 0.2em;
    }
    .kwami-btn--link:hover:not(:disabled):not([aria-disabled="true"]) {
      filter: brightness(1.1);
      transform: none;
    }

    /* Input / textarea */
    .kwami-input {
      width: 100%;
      display: block;
      background: var(--kwami-ui-surface);
      color: var(--kwami-ui-text);
      border: 1px solid var(--kwami-ui-border);
      border-radius: 0.5rem;
      padding: 0.55rem 0.75rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04);
      transition: box-shadow 0.15s ease, border-color 0.15s ease;
    }
    .kwami-input::placeholder {
      color: color-mix(in srgb, var(--kwami-ui-muted) 70%, transparent);
    }
    .kwami-input:focus { outline: none; }
    .kwami-input:focus-visible {
      box-shadow: 0 0 0 3px var(--kwami-ui-ring);
      border-color: color-mix(in srgb, var(--kwami-ui-ring) 55%, var(--kwami-ui-border));
    }
    .kwami-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    textarea.kwami-input {
      min-height: 3.25rem;
      resize: vertical;
    }

    /* Form group */
    .kwami-form-group { display: block; }
    .kwami-form-group__label {
      display: block;
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 600;
      color: color-mix(in srgb, var(--kwami-ui-text) 88%, transparent);
    }
    .kwami-form-group__required { color: var(--kwami-ui-red); }
    .kwami-form-group__control { margin-top: 0.5rem; }
    .kwami-form-group__help {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: var(--kwami-ui-muted);
    }

    /* Badge */
    .kwami-badge {
      --kwami-ui-accent: var(--kwami-ui-primary);
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 0.25rem 0.55rem;
      font-size: 0.75rem;
      line-height: 1rem;
      font-weight: 700;
      border: 1px solid color-mix(in srgb, var(--kwami-ui-accent) 28%, var(--kwami-ui-border));
      background: color-mix(in srgb, var(--kwami-ui-accent) 12%, transparent);
      color: color-mix(in srgb, var(--kwami-ui-accent) 82%, var(--kwami-ui-text));
    }

    /* Alert */
    .kwami-alert {
      --kwami-ui-accent: var(--kwami-ui-gray);
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      padding: 1rem;
      border-radius: 0.75rem;
      border: 1px solid color-mix(in srgb, var(--kwami-ui-accent) 24%, var(--kwami-ui-border));
      background: color-mix(in srgb, var(--kwami-ui-accent) 10%, transparent);
      color: var(--kwami-ui-text);
    }
    .kwami-alert__icon {
      flex: 0 0 auto;
      width: 1.25rem;
      height: 1.25rem;
      color: color-mix(in srgb, var(--kwami-ui-accent) 80%, var(--kwami-ui-text));
      margin-top: 0.05rem;
    }
    .kwami-alert__title {
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 700;
      color: color-mix(in srgb, var(--kwami-ui-accent) 75%, var(--kwami-ui-text));
    }
    .kwami-alert__desc {
      margin-top: 0.25rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: color-mix(in srgb, var(--kwami-ui-text) 82%, transparent);
    }
    .kwami-alert__close {
      margin-left: auto;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.15rem;
      color: color-mix(in srgb, var(--kwami-ui-accent) 80%, var(--kwami-ui-text));
      border-radius: 0.4rem;
    }
    .kwami-alert__close:focus { outline: none; }
    .kwami-alert__close:focus-visible { box-shadow: 0 0 0 3px var(--kwami-ui-ring); }
    .kwami-alert__close:hover { background: color-mix(in srgb, var(--kwami-ui-border) 40%, transparent); }
  `;

  document.head.appendChild(style);
}


