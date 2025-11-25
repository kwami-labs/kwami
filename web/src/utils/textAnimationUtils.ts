/**
 * Utility functions for animated text effects
 */

/**
 * Wraps each character in a text string with a span element for character-by-character animation
 * @param text - The text to wrap
 * @param baseDelay - Base delay in seconds before animation starts (default: 0)
 * @param charDelay - Delay in seconds between each character (default: 0.015)
 * @returns HTML string with wrapped characters
 */
export function wrapTextWithAnimatedChars(
  text: string,
  baseDelay: number = 0,
  charDelay: number = 0.015
): string {
  const characters = Array.from(text);
  const spans = characters.map((char, index) => {
    const safeChar = char === ' ' ? '\u00A0' : char;
    const delay = baseDelay + index * charDelay;
    return `<span style="animation-delay: ${delay}s">${safeChar}</span>`;
  });
  return spans.join('');
}

/**
 * Applies character-by-character animation to an HTML element
 * @param element - The HTML element to animate
 * @param baseDelay - Base delay in seconds before animation starts (default: 0)
 * @param charDelay - Delay in seconds between each character (default: 0.015)
 */
export function applyCharacterAnimation(
  element: HTMLElement,
  baseDelay: number = 0,
  charDelay: number = 0.015
): void {
  const text = element.textContent || '';
  element.classList.add('animated-text-chars');
  element.innerHTML = wrapTextWithAnimatedChars(text, baseDelay, charDelay);
}

/**
 * Calculates the total animation duration for a text string
 * @param text - The text to calculate duration for
 * @param baseDelay - Base delay in seconds
 * @param charDelay - Delay in seconds between each character
 * @param gapAfter - Gap in seconds after the text finishes (default: 0.2)
 * @returns Total duration in seconds
 */
export function calculateAnimationDuration(
  text: string,
  baseDelay: number = 0,
  charDelay: number = 0.015,
  gapAfter: number = 0.2
): number {
  return baseDelay + text.length * charDelay + gapAfter;
}

