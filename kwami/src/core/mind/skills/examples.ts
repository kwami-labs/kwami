/**
 * Kwami Skills System - Usage Examples
 * 
 * This file contains practical examples of using the Skills system
 * to program Kwami's behavior programmatically or through JSON files.
 */

import type { Kwami } from '../../Kwami';
import type { SkillDefinition } from './types';
import { logger } from '../../../utils/logger';

/**
 * Example 1: Execute a predefined skill
 */
export async function example1_ExecutePredefinedSkill(kwami: Kwami) {
  // Execute a skill that was loaded from templates
  await kwami.skills.executeSkill('minimize-top-right');
}

/**
 * Example 2: Create and execute a custom skill programmatically
 */
export async function example2_CreateCustomSkill(kwami: Kwami) {
  const customSkill: SkillDefinition = {
    id: 'my-greeting',
    name: 'Greeting Sequence',
    description: 'Kwami introduces itself with visual effects',
    version: '1.5.8',
    actions: [
      {
        type: 'mind.speak',
        text: 'Hello! I\'m Kwami, your AI companion.'
      },
      {
        type: 'wait',
        duration: 1000
      },
      {
        type: 'sequence',
        parallel: true,
        actions: [
          {
            type: 'body.scale',
            preset: 'large',
            duration: 1000,
            easing: 'bounce'
          },
          {
            type: 'body.colors',
            primary: '#667eea',
            secondary: '#764ba2',
            accent: '#f093fb',
            duration: 1000
          }
        ]
      }
    ]
  };

  // Register and execute the skill
  kwami.skills.registerSkill(customSkill);
  await kwami.skills.executeSkill('my-greeting');
}

/**
 * Example 3: Load skill from URL
 */
export async function example3_LoadFromURL(kwami: Kwami) {
  await kwami.skills.loadSkillFromUrl('/skills/party-mode.json');
  await kwami.skills.executeSkill('party-mode');
}

/**
 * Example 4: Create a focus mode skill
 */
export async function example4_FocusMode(kwami: Kwami) {
  const focusSkill: SkillDefinition = {
    id: 'focus-mode',
    name: 'Focus Mode',
    description: 'Minimizes and moves to corner for focused work',
    version: '1.5.8',
    autoReverse: true,
    reverseDelay: 25 * 60 * 1000, // 25 minutes (Pomodoro)
    actions: [
      {
        type: 'sequence',
        actions: [
          {
            type: 'mind.speak',
            text: 'Starting focus mode. I\'ll be in the corner if you need me. Good luck!'
          },
          {
            type: 'wait',
            duration: 2000
          },
          {
            type: 'sequence',
            parallel: true,
            actions: [
              {
                type: 'body.scale',
                preset: 'mini',
                duration: 800,
                easing: 'ease-in-out'
              },
              {
                type: 'body.position',
                preset: 'bottom-right',
                duration: 800,
                easing: 'ease-in-out'
              },
              {
                type: 'body.colors',
                primary: '#3a86ff',
                secondary: '#8338ec',
                accent: '#b8b8ff',
                duration: 800
              },
              {
                type: 'body.time',
                x: 0.3,
                y: 0.3,
                z: 0.3
              }
            ]
          }
        ]
      }
    ]
  };

  kwami.skills.registerSkill(focusSkill);
  await kwami.skills.executeSkill('focus-mode');
}

/**
 * Example 5: Create a celebration skill
 */
export async function example5_Celebration(kwami: Kwami) {
  const celebrationSkill: SkillDefinition = {
    id: 'celebration',
    name: 'Celebration',
    description: 'Celebrates success with visual effects',
    version: '1.5.8',
    actions: [
      {
        type: 'sequence',
        actions: [
          {
            type: 'mind.speak',
            text: 'Congratulations! 🎉'
          },
          {
            type: 'sequence',
            parallel: true,
            actions: [
              {
                type: 'body.scale',
                preset: 'huge',
                duration: 500,
                easing: 'bounce'
              },
              {
                type: 'body.rotation',
                x: 0.01,
                y: 0.01,
                z: 0.01
              },
              {
                type: 'soul.trait',
                trait: 'happiness',
                value: 100
              },
              {
                type: 'soul.trait',
                trait: 'energy',
                value: 90
              }
            ]
          },
          // Rainbow color cycle
          {
            type: 'body.colors',
            primary: '#ff0000',
            secondary: '#ff7700',
            accent: '#ffff00',
            duration: 300
          },
          {
            type: 'body.colors',
            primary: '#00ff00',
            secondary: '#00ff77',
            accent: '#00ffff',
            duration: 300
          },
          {
            type: 'body.colors',
            primary: '#0000ff',
            secondary: '#7700ff',
            accent: '#ff00ff',
            duration: 300
          },
          {
            type: 'wait',
            duration: 1000
          },
          // Return to normal
          {
            type: 'sequence',
            parallel: true,
            actions: [
              {
                type: 'body.scale',
                preset: 'normal',
                duration: 500,
                easing: 'ease-out'
              },
              {
                type: 'body.rotation',
                x: 0,
                y: 0,
                z: 0
              }
            ]
          }
        ]
      }
    ]
  };

  kwami.skills.registerSkill(celebrationSkill);
  await kwami.skills.executeSkill('celebration');
}

/**
 * Example 6: Create a meditation skill with breathing animation
 */
export async function example6_Meditation(kwami: Kwami) {
  const meditationSkill: SkillDefinition = {
    id: 'meditation',
    name: 'Guided Meditation',
    description: 'Calming meditation mode with breathing animation',
    version: '1.5.8',
    actions: [
      {
        type: 'sequence',
        actions: [
          {
            type: 'mind.speak',
            text: 'Let\'s take a moment to breathe together.'
          },
          {
            type: 'wait',
            duration: 2000
          },
          // Set calm environment
          {
            type: 'sequence',
            parallel: true,
            actions: [
              {
                type: 'body.colors',
                primary: '#3a86ff',
                secondary: '#8338ec',
                accent: '#b8b8ff',
                duration: 2000
              },
              {
                type: 'body.spikes',
                x: 0.05,
                y: 0.05,
                z: 0.05
              },
              {
                type: 'body.time',
                x: 0.2,
                y: 0.2,
                z: 0.2
              },
              {
                type: 'soul.trait',
                trait: 'calmness',
                value: 100
              }
            ]
          },
          // Breathing cycle
          {
            type: 'mind.speak',
            text: 'Breathe in...'
          },
          {
            type: 'body.scale',
            value: 5,
            duration: 4000,
            easing: 'ease-in-out'
          },
          {
            type: 'wait',
            duration: 1000
          },
          {
            type: 'mind.speak',
            text: 'And breathe out...'
          },
          {
            type: 'body.scale',
            value: 3,
            duration: 4000,
            easing: 'ease-in-out'
          }
        ]
      }
    ]
  };

  kwami.skills.registerSkill(meditationSkill);
  await kwami.skills.executeSkill('meditation');
}

/**
 * Example 7: Get all registered skills
 */
export function example7_ListSkills(kwami: Kwami) {
  const skills = kwami.skills.getAllSkills();
  logger.info('Registered skills:', skills.map(s => s.name));
  
  // Get statistics
  const stats = kwami.skills.getStats();
  logger.info('Skill statistics:', stats);
}

/**
 * Example 8: Load skill from JSON string
 */
export function example8_LoadFromString(kwami: Kwami) {
  const skillJson = JSON.stringify({
    id: 'simple-wave',
    name: 'Simple Wave',
    description: 'Makes Kwami wave with a color change',
    version: '1.5.8',
    actions: [
      {
        type: 'mind.speak',
        text: 'Hello there!'
      },
      {
        type: 'body.rotation',
        x: 0.005,
        y: 0.005,
        z: 0
      },
      {
        type: 'wait',
        duration: 2000
      },
      {
        type: 'body.rotation',
        x: 0,
        y: 0,
        z: 0
      }
    ]
  });

  kwami.skills.loadSkillFromString(skillJson, 'json');
}

