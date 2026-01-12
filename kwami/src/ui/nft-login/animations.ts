import type { AvatarPosition } from './types';

export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
}

/**
 * Get position coordinates for avatar based on position type.
 */
export function getAvatarCoordinates(position: AvatarPosition, size: number): { top?: string; right?: string; bottom?: string; left?: string } {
  const offset = '20px';
  
  switch (position) {
    case 'top-left':
      return { top: offset, left: offset };
    case 'top-right':
      return { top: offset, right: offset };
    case 'bottom-left':
      return { bottom: offset, left: offset };
    case 'bottom-right':
      return { bottom: offset, right: offset };
  }
}

/**
 * Animate an element from its current position to a target position.
 */
export function animateToPosition(
  element: HTMLElement,
  targetX: number,
  targetY: number,
  config: AnimationConfig = {}
): Promise<void> {
  const { duration = 600, easing = 'cubic-bezier(0.4, 0, 0.2, 1)', delay = 0 } = config;

  return new Promise((resolve) => {
    const rect = element.getBoundingClientRect();
    const deltaX = targetX - rect.left;
    const deltaY = targetY - rect.top;

    element.style.transition = `transform ${duration}ms ${easing} ${delay}ms`;
    element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    setTimeout(() => {
      resolve();
    }, duration + delay);
  });
}

/**
 * Animate element to corner position based on avatar position.
 */
export function animateToCorner(
  element: HTMLElement,
  position: AvatarPosition,
  size: number,
  config: AnimationConfig = {}
): Promise<void> {
  const coords = getAvatarCoordinates(position, size);
  
  let targetX = 0;
  let targetY = 0;

  if (coords.left) {
    targetX = parseInt(coords.left);
  } else if (coords.right) {
    targetX = window.innerWidth - parseInt(coords.right) - size;
  }

  if (coords.top) {
    targetY = parseInt(coords.top);
  } else if (coords.bottom) {
    targetY = window.innerHeight - parseInt(coords.bottom) - size;
  }

  return animateToPosition(element, targetX, targetY, config);
}

/**
 * Fade in an element.
 */
export function fadeIn(element: HTMLElement, config: AnimationConfig = {}): Promise<void> {
  const { duration = 300, easing = 'ease-in', delay = 0 } = config;

  return new Promise((resolve) => {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ${easing} ${delay}ms`;

    // Force reflow
    void element.offsetHeight;

    element.style.opacity = '1';

    setTimeout(() => {
      resolve();
    }, duration + delay);
  });
}

/**
 * Fade out an element.
 */
export function fadeOut(element: HTMLElement, config: AnimationConfig = {}): Promise<void> {
  const { duration = 300, easing = 'ease-out', delay = 0 } = config;

  return new Promise((resolve) => {
    element.style.transition = `opacity ${duration}ms ${easing} ${delay}ms`;
    element.style.opacity = '0';

    setTimeout(() => {
      resolve();
    }, duration + delay);
  });
}

/**
 * Scale animation.
 */
export function scale(
  element: HTMLElement,
  from: number,
  to: number,
  config: AnimationConfig = {}
): Promise<void> {
  const { duration = 300, easing = 'cubic-bezier(0.4, 0, 0.2, 1)', delay = 0 } = config;

  return new Promise((resolve) => {
    element.style.transform = `scale(${from})`;
    element.style.transition = `transform ${duration}ms ${easing} ${delay}ms`;

    // Force reflow
    void element.offsetHeight;

    element.style.transform = `scale(${to})`;

    setTimeout(() => {
      resolve();
    }, duration + delay);
  });
}
