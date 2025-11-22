/**
 * Template Loader
 * 
 * Loads all personality template YAML files and makes them available for the Soul system.
 * This file auto-imports all YAML templates in the templates directory.
 */

import type { SoulConfig } from '../../../types/index';

// Import all YAML templates
import friendlyYaml from './friendly.yaml?raw';
import playfulYaml from './playful.yaml?raw';
import professionalYaml from './professional.yaml?raw';
import mentorYaml from './mentor.yaml?raw';
import adventurerYaml from './adventurer.yaml?raw';
import coachYaml from './coach.yaml?raw';
import artisticYaml from './artistic.yaml?raw';
import storytellerYaml from './storyteller.yaml?raw';
import scientistYaml from './scientist.yaml?raw';
import detectiveYaml from './detective.yaml?raw';
import wittyYaml from './witty.yaml?raw';
import mysteriousYaml from './mysterious.yaml?raw';
import zenYaml from './zen.yaml?raw';
import empathicYaml from './empathic.yaml?raw';
import rebelYaml from './rebel.yaml?raw';
import grumpyYaml from './grumpy.yaml?raw';
import cynicalYaml from './cynical.yaml?raw';
import sarcasticYaml from './sarcastic.yaml?raw';
import melancholicYaml from './melancholic.yaml?raw';
import angryYaml from './angry.yaml?raw';

/**
 * Personality template type - all available personality names
 */
export type PersonalityTemplate = 
  // Core templates
  | 'friendly' | 'playful' | 'professional'
  // Creative & Inspiring
  | 'mentor' | 'adventurer' | 'coach' | 'artistic' | 'storyteller'
  // Analytical & Thoughtful
  | 'scientist' | 'detective' | 'witty' | 'mysterious'
  // Calm & Supportive
  | 'zen' | 'empathic'
  // Bold & Unconventional
  | 'rebel'
  // Challenging personalities
  | 'grumpy' | 'cynical' | 'sarcastic' | 'melancholic' | 'angry';

/**
 * Raw YAML template strings mapped by personality name
 */
export const personalityTemplates: Record<PersonalityTemplate, string> = {
  // Core templates
  friendly: friendlyYaml,
  playful: playfulYaml,
  professional: professionalYaml,
  // Creative & Inspiring
  mentor: mentorYaml,
  adventurer: adventurerYaml,
  coach: coachYaml,
  artistic: artisticYaml,
  storyteller: storytellerYaml,
  // Analytical & Thoughtful
  scientist: scientistYaml,
  detective: detectiveYaml,
  witty: wittyYaml,
  mysterious: mysteriousYaml,
  // Calm & Supportive
  zen: zenYaml,
  empathic: empathicYaml,
  // Bold & Unconventional
  rebel: rebelYaml,
  // Challenging personalities
  grumpy: grumpyYaml,
  cynical: cynicalYaml,
  sarcastic: sarcasticYaml,
  melancholic: melancholicYaml,
  angry: angryYaml,
};

/**
 * Get a list of all available personality template names
 */
export function getAvailablePersonalities(): PersonalityTemplate[] {
  return Object.keys(personalityTemplates) as PersonalityTemplate[];
}

/**
 * Get the raw YAML string for a personality template
 */
export function getPersonalityTemplate(name: PersonalityTemplate): string | undefined {
  return personalityTemplates[name];
}

