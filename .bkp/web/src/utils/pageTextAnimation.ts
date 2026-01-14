/**
 * Page text animation initializer
 * Applies character-by-character animation to page titles and descriptions
 * Animation sequence: number → title (letter by letter) → description (letter by letter) → button (fade in)
 */

import { applyCharacterAnimation, calculateAnimationDuration } from './textAnimationUtils';

// Typing sound effect
let typingAudio: HTMLAudioElement | null = null;
let typingAudioTimeout: number | null = null;

/**
 * Plays the typing sound effect and stops it after a specified duration
 * @param duration - Duration in seconds after which to stop the audio
 */
function playTypingSound(duration: number): void {
  try {
    if (!typingAudio) {
      typingAudio = new Audio('/fx/typing.mp3');
      typingAudio.loop = true; // Loop the typing sound
      typingAudio.volume = 0.3;
    }
    
    // Clear any existing timeout
    if (typingAudioTimeout !== null) {
      clearTimeout(typingAudioTimeout);
      typingAudioTimeout = null;
    }
    
    // Reset and play
    typingAudio.currentTime = 0;
    typingAudio.play().catch(err => {
      console.warn('Could not play typing sound:', err);
    });
    
    // Stop the audio after the animation completes
    typingAudioTimeout = window.setTimeout(() => {
      if (typingAudio) {
        typingAudio.pause();
        typingAudio.currentTime = 0;
      }
      typingAudioTimeout = null;
    }, duration * 1000);
  } catch (err) {
    console.warn('Error initializing typing sound:', err);
  }
}

/**
 * Animates a single section's text elements
 */
export function animatePageSection(sectionIndex: number): void {
  console.log(`🎨 Animating section ${sectionIndex}...`);
  
  const section = document.querySelector(`.text-section[data-section="${sectionIndex}"]`) as HTMLElement;
  if (!section) {
    console.warn(`Section ${sectionIndex} not found`);
    return;
  }
  
  // Get section number - no animation, just visible immediately
  const sectionNumber = section.querySelector('.section-number') as HTMLElement;
  if (sectionNumber) {
    sectionNumber.style.opacity = '1';
  }
  
  // Get title (h1 or h2 with gradient-text span)
  const titleElement = section.querySelector('h1 .gradient-text, h2 .gradient-text') as HTMLElement;
  
  // Get main description
  const descriptionElement = section.querySelector('.main-description') as HTMLElement;
  
  // Get button container
  const buttonContainer = section.querySelector('.section-action') as HTMLElement;
  
  // Reset elements if they were already animated
  if (titleElement) {
    // Remove existing animation
    titleElement.classList.remove('animated-text-chars');
    const oldSpans = titleElement.querySelectorAll('span');
    if (oldSpans.length > 0) {
      const originalText = Array.from(oldSpans).map(s => s.textContent).join('');
      titleElement.textContent = originalText;
    }
  }
  
  if (descriptionElement) {
    descriptionElement.classList.remove('animated-text-chars');
    const oldSpans = descriptionElement.querySelectorAll('span');
    if (oldSpans.length > 0) {
      const originalText = Array.from(oldSpans).map(s => s.textContent).join('');
      descriptionElement.textContent = originalText;
    }
  }
  
  if (buttonContainer) {
    buttonContainer.style.opacity = '0';
    buttonContainer.style.transform = 'translateY(10px)';
  }
  
  // Start with title animation immediately (no initial delay)
  let cumulativeDelay = 0;
  let totalAnimationDuration = 0;
  
  if (titleElement) {
    // Apply animation to title
    applyCharacterAnimation(titleElement, cumulativeDelay, 0.025);
    // Update cumulative delay for next element
    const titleText = titleElement.textContent || '';
    cumulativeDelay = calculateAnimationDuration(titleText, cumulativeDelay, 0.025, 0.1);
  }
  
  if (descriptionElement) {
    // Apply animation to description after title completes
    applyCharacterAnimation(descriptionElement, cumulativeDelay, 0.015);
    // Update cumulative delay for button
    const descText = descriptionElement.textContent || '';
    // Calculate when the last letter finishes (without the gap)
    const descEndTime = cumulativeDelay + (descText.length * 0.015) + 0.6; // 0.6s for the character animation itself
    totalAnimationDuration = descEndTime;
    cumulativeDelay = calculateAnimationDuration(descText, cumulativeDelay, 0.015, 0.2);
  }
  
  // Play typing sound for the exact duration of the animation
  playTypingSound(totalAnimationDuration);
  
  if (buttonContainer) {
    // Button fades in gently after description completes
    buttonContainer.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    // Trigger fade-in after description completes
    setTimeout(() => {
      buttonContainer.style.opacity = '1';
      buttonContainer.style.transform = 'translateY(0)';
    }, cumulativeDelay * 1000);
  }
}

/**
 * Initializes character-by-character animation for all page sections
 */
export function initPageTextAnimations(): void {
  console.log('🎨 Initializing page text animations...');
  
  // Animate the first page (page 0)
  animatePageSection(0);
  
  console.log('✅ Page text animations initialized');
}

/**
 * Re-applies animations when language changes
 */
export function refreshPageTextAnimations(currentSection: number = 0): void {
  console.log(`🔄 Refreshing page text animations for section ${currentSection}...`);
  
  // Remove existing animated spans from all sections
  const animatedElements = document.querySelectorAll('.animated-text-chars');
  animatedElements.forEach((element) => {
    element.classList.remove('animated-text-chars');
    // Reset to plain text (will be re-animated)
    const spans = element.querySelectorAll('span');
    if (spans.length > 0) {
      const text = Array.from(spans).map(span => span.textContent).join('');
      element.textContent = text;
    }
  });
  
  // Re-apply animations to the current section
  setTimeout(() => {
    animatePageSection(currentSection);
  }, 50);
}

