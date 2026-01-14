/**
 * Window Controls
 * 
 * Creates and manages window control buttons (close, maximize, restore)
 */

export interface ControlButton {
  element: HTMLButtonElement;
  destroy: () => void;
}

export interface ControlsConfig {
  closable?: boolean;
  maximizable?: boolean;
  onClose?: () => void;
  onMaximize?: () => void;
  onRestore?: () => void;
}

function createControlButton(
  label: string,
  icon: string,
  onClick: () => void
): ControlButton {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = icon;
  button.setAttribute('aria-label', label);
  button.className = 'kwami-window-control';

  Object.assign(button.style, {
    border: 'var(--kwami-border-width) solid var(--kwami-color-border)',
    background: 'transparent',
    color: 'var(--kwami-color-text)',
    borderRadius: '4px',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    fontSize: 'var(--kwami-font-size-sm)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--kwami-duration) var(--kwami-easing)',
    flexShrink: '0',
  });

  button.addEventListener('mouseenter', () => {
    button.style.background = 'var(--kwami-color-surface-hover)';
  });
  button.addEventListener('mouseleave', () => {
    button.style.background = 'transparent';
  });

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  button.addEventListener('click', handleClick);

  return {
    element: button,
    destroy() {
      button.removeEventListener('click', handleClick);
    },
  };
}

export function createControls(config: ControlsConfig): {
  container: HTMLDivElement;
  maximizeButton?: ControlButton;
  closeButton?: ControlButton;
  destroy: () => void;
} {
  const container = document.createElement('div');
  container.className = 'kwami-window-controls';
  Object.assign(container.style, {
    display: 'flex',
    gap: 'var(--kwami-gap-sm)',
    alignItems: 'center',
  });

  const buttons: ControlButton[] = [];

  // Maximize/Restore button
  let maximizeButton: ControlButton | undefined;
  if (config.maximizable) {
    maximizeButton = createControlButton('Maximize', '□', () => {
      config.onMaximize?.();
    });
    container.appendChild(maximizeButton.element);
    buttons.push(maximizeButton);
  }

  // Close button
  let closeButton: ControlButton | undefined;
  if (config.closable) {
    closeButton = createControlButton('Close', '✕', () => {
      config.onClose?.();
    });
    // Style close button differently
    closeButton.element.addEventListener('mouseenter', () => {
      closeButton!.element.style.background = 'rgba(255, 75, 75, 0.2)';
      closeButton!.element.style.borderColor = 'rgba(255, 75, 75, 0.6)';
    });
    closeButton.element.addEventListener('mouseleave', () => {
      closeButton!.element.style.background = 'transparent';
      closeButton!.element.style.borderColor = 'var(--kwami-color-border)';
    });
    container.appendChild(closeButton.element);
    buttons.push(closeButton);
  }

  return {
    container,
    maximizeButton,
    closeButton,
    destroy() {
      buttons.forEach(btn => btn.destroy());
    },
  };
}

export function updateMaximizeButton(button: HTMLButtonElement, isMaximized: boolean) {
  button.textContent = isMaximized ? '⊡' : '□';
  button.setAttribute('aria-label', isMaximized ? 'Restore' : 'Maximize');
}
