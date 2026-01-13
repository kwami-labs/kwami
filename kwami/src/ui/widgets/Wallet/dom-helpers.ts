import type { GlassContent } from '../legacy/types';

export function renderContent(slot: GlassContent, target: HTMLElement): void {
  if (typeof slot === 'string') {
    target.textContent = slot;
    return;
  }
  if (slot instanceof Node) {
    target.innerHTML = '';
    target.appendChild(slot);
    return;
  }
  if (Array.isArray(slot)) {
    target.innerHTML = '';
    slot.forEach((node) => node && target.appendChild(node));
    return;
  }
  if (typeof slot === 'function') {
    const result = slot();
    renderContent(result, target);
  }
}

export function createInlineSpinner(sizePx = 14): HTMLSpanElement {
  const spinner = document.createElement('span');
  spinner.style.width = `${sizePx}px`;
  spinner.style.height = `${sizePx}px`;
  spinner.style.borderRadius = '999px';
  spinner.style.display = 'inline-block';
  spinner.style.border = '2px solid rgba(148,163,184,0.35)';
  spinner.style.borderTopColor = 'rgba(148,163,184,0.95)';
  spinner.style.animation = 'kwami-spin 0.85s linear infinite';

  // Ensure keyframes exist once.
  const id = 'kwami-wallet-spinner-style';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `@keyframes kwami-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }

  return spinner;
}

export function asClickableValue(node: Node, onClick: (anchor: HTMLElement) => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'kwami-wallet-value-button';
  btn.style.background = 'transparent';
  btn.style.border = 'none';
  btn.style.padding = '0';
  btn.style.margin = '0';
  btn.style.cursor = 'pointer';
  btn.style.color = 'inherit';
  btn.style.font = 'inherit';
  btn.style.display = 'inline-flex';
  btn.style.alignItems = 'center';
  btn.style.gap = '0.35rem';
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(btn);
  });
  btn.appendChild(node);
  return btn;
}
