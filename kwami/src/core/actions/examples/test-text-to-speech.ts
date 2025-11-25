/**
 * Text to Speech Action - Usage Examples
 * 
 * This file demonstrates how to use the new text-to-speech action
 * with the native browser Speech Synthesis API.
 * 
 * The text-to-speech action integrates with Kwami's audio system to animate
 * the blob while speaking, creating a visual effect as if the blob is talking.
 */

import { ActionManager } from '../ActionManager';

/**
 * Example 1: Basic text-to-speech with default settings
 * The blob will animate as if speaking while the text is spoken
 */
export async function exampleBasicTTS(actionManager: ActionManager) {
  console.log('Example 1: Basic TTS with Blob Animation');
  
  const result = await actionManager.executeAction('text-to-speech', {
    params: {
      text: 'Hello world, I am Kwami!',
      rate: 1,
      pitch: 1,
    },
  });
  
  console.log('Result:', result);
  console.log('Note: The blob animated during speech!');
}

/**
 * Example 2: Fast speech
 */
export async function exampleFastSpeech(actionManager: ActionManager) {
  console.log('Example 2: Fast Speech');
  
  const result = await actionManager.executeAction('text-to-speech', {
    params: {
      text: 'This is a fast speech example',
      rate: 2,
      pitch: 1,
    },
  });
  
  console.log('Result:', result);
}

/**
 * Example 3: Slow speech with low pitch
 */
export async function exampleSlowSpeech(actionManager: ActionManager) {
  console.log('Example 3: Slow Speech with Low Pitch');
  
  const result = await actionManager.executeAction('text-to-speech', {
    params: {
      text: 'This is a slow speech example with low pitch',
      rate: 0.5,
      pitch: 0.5,
    },
  });
  
  console.log('Result:', result);
}

/**
 * Example 4: High pitch speech
 */
export async function exampleHighPitch(actionManager: ActionManager) {
  console.log('Example 4: High Pitch Speech');
  
  const result = await actionManager.executeAction('text-to-speech', {
    params: {
      text: 'This is a high pitch example',
      rate: 1,
      pitch: 2,
    },
  });
  
  console.log('Result:', result);
}

/**
 * Example 5: Interactive prompt (no params provided)
 * User will be prompted to enter text
 */
export async function exampleInteractive(actionManager: ActionManager) {
  console.log('Example 5: Interactive Prompt');
  
  // When no text is provided, user will be prompted
  const result = await actionManager.executeAction('text-to-speech', {
    params: {},
  });
  
  console.log('Result:', result);
}

/**
 * Example 6: With specific voice
 */
export async function exampleWithVoice(actionManager: ActionManager) {
  console.log('Example 6: With Specific Voice');
  
  // Get available voices
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const voices = window.speechSynthesis.getVoices();
    console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
    
    // Use the first English voice if available
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    
    if (englishVoice) {
      const result = await actionManager.executeAction('text-to-speech', {
        params: {
          text: 'This is spoken with a specific voice',
          rate: 1,
          pitch: 1,
          voice: englishVoice.name,
        },
      });
      
      console.log('Result:', result);
    }
  }
}

/**
 * Example 7: Run all examples in sequence
 */
export async function runAllExamples(actionManager: ActionManager) {
  console.log('Running all Text-to-Speech examples...\n');
  
  await exampleBasicTTS(actionManager);
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
  
  await exampleFastSpeech(actionManager);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await exampleSlowSpeech(actionManager);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await exampleHighPitch(actionManager);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await exampleWithVoice(actionManager);
  
  console.log('\nAll examples completed!');
}

/**
 * Direct usage without ActionManager
 * This shows how the Speech Synthesis API is used under the hood
 * Note: Direct usage won't trigger blob animation - use ActionManager for full integration
 */
export function directUsageExample() {
  console.log('Direct usage example (without ActionManager)');
  console.warn('⚠️ Direct usage will NOT animate the blob. Use ActionManager instead.');
  
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.error('Speech Synthesis API not supported');
    return;
  }
  
  const utter = new SpeechSynthesisUtterance('Hello world');
  utter.rate = 1;
  utter.pitch = 1;
  
  utter.onend = () => {
    console.log('Speech finished');
  };
  
  utter.onerror = (event) => {
    console.error('Speech error:', event.error);
  };
  
  window.speechSynthesis.speak(utter);
}

/**
 * Example 8: Observe blob state changes during speech
 */
export async function exampleWithStateObservation(actionManager: ActionManager, kwami: any) {
  console.log('Example 8: Observe Kwami State During Speech');
  
  // Log initial state
  console.log('Initial state:', kwami?.state || 'unknown');
  
  // Execute TTS
  const promise = actionManager.executeAction('text-to-speech', {
    params: {
      text: 'Watch the blob animate as I speak this sentence!',
      rate: 1,
      pitch: 1,
    },
  });
  
  // Check state during speech (should be 'speaking')
  setTimeout(() => {
    console.log('State during speech:', kwami?.state || 'unknown');
  }, 500);
  
  await promise;
  
  // Check state after speech (should be 'idle')
  setTimeout(() => {
    console.log('State after speech:', kwami?.state || 'unknown');
  }, 100);
}

