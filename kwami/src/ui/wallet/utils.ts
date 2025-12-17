export function truncateAddress(address: string, head = 4, tail = 4): string {
  if (!address) return '';
  if (address.length <= head + tail + 3) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

export function formatSol(sol: number, digits = 3): string {
  if (!Number.isFinite(sol)) return '0';
  return sol.toFixed(digits);
}

export function createText(value: string, options?: { muted?: boolean; mono?: boolean }): HTMLSpanElement {
  const span = document.createElement('span');
  span.textContent = value;
  if (options?.muted) {
    span.style.opacity = '0.72';
  }
  if (options?.mono) {
    span.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
    span.style.letterSpacing = '0.02em';
  }
  return span;
}

export function createRow(label: string, valueNode: Node): HTMLDivElement {
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.alignItems = 'center';
  row.style.justifyContent = 'space-between';
  row.style.gap = '0.75rem';

  const left = createText(label, { muted: true });
  left.style.fontSize = '0.78rem';
  left.style.textTransform = 'uppercase';
  left.style.letterSpacing = '0.12em';

  const right = document.createElement('div');
  right.style.display = 'flex';
  right.style.alignItems = 'center';
  right.style.justifyContent = 'flex-end';
  right.style.gap = '0.5rem';
  right.appendChild(valueNode);

  row.appendChild(left);
  row.appendChild(right);
  return row;
}

export function createDivider(): HTMLDivElement {
  const divider = document.createElement('div');
  divider.style.height = '1px';
  divider.style.width = '100%';
  divider.style.background = 'rgba(148,163,184,0.22)';
  divider.style.margin = '0.5rem 0';
  return divider;
}
