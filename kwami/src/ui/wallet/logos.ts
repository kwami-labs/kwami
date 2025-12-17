const svgAttrs = `width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"`;

function phantom(): string {
  return `
  <svg ${svgAttrs}>
    <path d="M12 4c-4 0-7 3-7 7 0 2 1 4 2 5 1 1 2 1 3 1 1 0 2-1 2-2 0 1 1 2 2 2 1 0 2 0 3-1 1-1 2-3 2-5 0-4-3-7-7-7z" fill="currentColor" opacity="0.92"/>
    <circle cx="9" cy="11" r="1" fill="#0b1220" opacity="0.9"/>
    <circle cx="15" cy="11" r="1" fill="#0b1220" opacity="0.9"/>
  </svg>`;
}

function solflare(): string {
  return `
  <svg ${svgAttrs}>
    <path d="M12 3c2 2 3 4 2 6-1 2-3 3-3 5 0 2 2 3 4 3 3 0 4-2 5-4 0 5-4 8-8 8-5 0-8-4-8-8 0-4 2-6 5-8 2-1 3-2 3-4z" fill="currentColor" opacity="0.92"/>
  </svg>`;
}

function backpack(): string {
  return `
  <svg ${svgAttrs}>
    <path d="M8 7c0-2 2-4 4-4s4 2 4 4v1h1c2 0 3 2 3 4v6c0 2-2 4-4 4H8c-2 0-4-2-4-4v-6c0-2 1-4 3-4h1V7zm2 1h4V7c0-1-1-2-2-2s-2 1-2 2v1zm-2 3c-1 0-2 1-2 2v5c0 1 1 2 2 2h8c1 0 2-1 2-2v-5c0-1-1-2-2-2H8z" fill="currentColor" opacity="0.92"/>
    <path d="M9 14h6" stroke="#0b1220" stroke-width="2" stroke-linecap="round" opacity="0.85"/>
  </svg>`;
}

function glow(): string {
  return `
  <svg ${svgAttrs}>
    <path d="M12 4c4 0 7 3 7 7s-3 7-7 7c-1 0-2 0-3-1l-3 1 1-3c-1-1-1-2-1-3 0-4 3-7 7-7z" fill="currentColor" opacity="0.92"/>
    <path d="M12 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" fill="#0b1220" opacity="0.85"/>
  </svg>`;
}

function slope(): string {
  return `
  <svg ${svgAttrs}>
    <path d="M5 18 11 6h3L8 18H5zm6 0 6-12h2l-6 12h-2z" fill="currentColor" opacity="0.92"/>
  </svg>`;
}

function ledger(): string {
  return `
  <svg ${svgAttrs}>
    <path d="M6 4H4C3 4 2 5 2 6v2h2V6h2V4zm14 0h-2v2h2v2h2V6c0-1-1-2-2-2zM4 18H2v2c0 1 1 2 2 2h2v-2H4v-2zm18 0h-2v2h-2v2h2c1 0 2-1 2-2v-2z" fill="currentColor" opacity="0.92"/>
    <path d="M8 8h8v8H8V8z" fill="currentColor" opacity="0.55"/>
  </svg>`;
}

function trezor(): string {
  return `
  <svg ${svgAttrs}>
    <path d="M12 3c2 0 4 2 4 4v1h1c2 0 3 1 3 3v7c0 2-1 3-3 3H7c-2 0-3-1-3-3v-7c0-2 1-3 3-3h1V7c0-2 2-4 4-4zm-2 5h4V7c0-1-1-2-2-2s-2 1-2 2v1z" fill="currentColor" opacity="0.92"/>
    <path d="M12 14a2 2 0 0 1 1 4v1h-2v-1a2 2 0 0 1 1-4z" fill="#0b1220" opacity="0.85"/>
  </svg>`;
}

export function getWalletLogoSvg(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes('phantom')) return phantom();
  if (n.includes('solflare')) return solflare();
  if (n.includes('backpack')) return backpack();
  if (n.includes('glow')) return glow();
  if (n.includes('slope')) return slope();
  if (n.includes('ledger')) return ledger();
  if (n.includes('trezor')) return trezor();
  return null;
}

export function getWalletKindFallback(name: string): 'browser' | 'hardware' {
  const n = name.toLowerCase();
  if (n.includes('ledger') || n.includes('trezor')) return 'hardware';
  return 'browser';
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/g).filter(Boolean);
  const head = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
  return head || name.slice(0, 2).toUpperCase();
}
