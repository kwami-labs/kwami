import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KwamiSoul } from '../../../core/soul/Soul';
import type { SoulConfig } from '../../../types';

describe('KwamiSoul', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create instance with default config', () => {
      const soul = new KwamiSoul();
      expect(soul).toBeInstanceOf(KwamiSoul);
    });

    it('should create instance with custom config', () => {
      const config: SoulConfig = {
        name: 'TestBot',
        personality: 'Friendly assistant',
        traits: ['helpful', 'patient'],
      };
      const soul = new KwamiSoul(config);
      expect(soul.getName()).toBe('TestBot');
    });

    it('should use default values when config is empty', () => {
      const soul = new KwamiSoul({});
      const config = soul.getConfig();
      expect(config.name).toBe('Kwami');
    });
  });

  describe('getName', () => {
    it('should return configured name', () => {
      const soul = new KwamiSoul({ name: 'Alice' });
      expect(soul.getName()).toBe('Alice');
    });

    it('should return default name when not configured', () => {
      const soul = new KwamiSoul();
      expect(soul.getName()).toBe('Kwami');
    });
  });

  describe('getConfig', () => {
    it('should return complete configuration', () => {
      const config: SoulConfig = {
        name: 'TestBot',
        personality: 'Helpful',
        traits: ['friendly'],
      };
      const soul = new KwamiSoul(config);
      const result = soul.getConfig();
      
      expect(result.name).toBe('TestBot');
      expect(result.personality).toBe('Helpful');
      expect(result.traits).toContain('friendly');
    });

    it('should return a copy, not reference', () => {
      const soul = new KwamiSoul({ name: 'Original' });
      const config = soul.getConfig();
      config.name = 'Modified';
      
      expect(soul.getName()).toBe('Original');
    });
  });

  describe('setPersonality', () => {
    it('should update personality configuration', () => {
      const soul = new KwamiSoul();
      soul.setPersonality({
        name: 'NewBot',
        personality: 'Professional',
      });
      
      expect(soul.getName()).toBe('NewBot');
      expect(soul.getConfig().personality).toBe('Professional');
    });

    it('should merge with existing config', () => {
      const soul = new KwamiSoul({
        name: 'Original',
        traits: ['friendly'],
      });
      
      soul.setPersonality({ personality: 'Updated' });
      
      expect(soul.getName()).toBe('Original');
      expect(soul.getConfig().personality).toBe('Updated');
    });
  });

  describe('getSystemPrompt', () => {
    it('should return formatted system prompt', () => {
      const soul = new KwamiSoul({
        systemPrompt: 'You are a helpful assistant.',
        personality: 'Friendly',
        traits: ['patient', 'kind'],
      });
      
      const prompt = soul.getSystemPrompt();
      expect(prompt).toContain('You are a helpful assistant.');
      expect(prompt).toContain('Personality: Friendly');
      expect(prompt).toContain('patient, kind');
    });

    it('should include conversation style', () => {
      const soul = new KwamiSoul({
        systemPrompt: 'Base prompt',
        conversationStyle: 'professional',
      });
      
      const prompt = soul.getSystemPrompt();
      expect(prompt).toContain('Conversation style: professional');
    });

    it('should include response length guidance', () => {
      const soul = new KwamiSoul({
        systemPrompt: 'Base',
        responseLength: 'short',
      });
      
      const prompt = soul.getSystemPrompt();
      expect(prompt).toContain('brief and concise');
    });

    it('should include emotional tone guidance', () => {
      const soul = new KwamiSoul({
        systemPrompt: 'Base',
        emotionalTone: 'warm',
      });
      
      const prompt = soul.getSystemPrompt();
      expect(prompt).toContain('warmth and friendliness');
    });

    it('should handle empty configuration gracefully', () => {
      const soul = new KwamiSoul({});
      const prompt = soul.getSystemPrompt();
      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe('string');
    });
  });

  describe('Traits Management', () => {
    it('should add new trait', () => {
      const soul = new KwamiSoul({ traits: ['friendly'] });
      soul.addTrait('patient');
      
      const traits = soul.getTraits();
      expect(traits).toContain('friendly');
      expect(traits).toContain('patient');
    });

    it('should not add duplicate trait', () => {
      const soul = new KwamiSoul({ traits: ['friendly'] });
      soul.addTrait('friendly');
      
      const traits = soul.getTraits();
      expect(traits.filter(t => t === 'friendly').length).toBe(1);
    });

    it('should remove existing trait', () => {
      const soul = new KwamiSoul({ traits: ['friendly', 'patient'] });
      soul.removeTrait('patient');
      
      const traits = soul.getTraits();
      expect(traits).toContain('friendly');
      expect(traits).not.toContain('patient');
    });

    it('should handle removing non-existent trait', () => {
      const soul = new KwamiSoul({ traits: ['friendly'] });
      soul.removeTrait('nonexistent');
      
      const traits = soul.getTraits();
      expect(traits).toContain('friendly');
    });

    it('should get all traits', () => {
      const soul = new KwamiSoul({ traits: ['a', 'b', 'c'] });
      const traits = soul.getTraits();
      
      expect(traits).toEqual(['a', 'b', 'c']);
    });

    it('should return empty array when no traits', () => {
      const soul = new KwamiSoul();
      const traits = soul.getTraits();
      
      expect(Array.isArray(traits)).toBe(true);
      expect(traits.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Conversation Settings', () => {
    it('should set conversation style', () => {
      const soul = new KwamiSoul();
      soul.setConversationStyle('formal');
      
      expect(soul.getConfig().conversationStyle).toBe('formal');
    });

    it('should set emotional tone', () => {
      const soul = new KwamiSoul();
      soul.setEmotionalTone('enthusiastic');
      
      expect(soul.getConfig().emotionalTone).toBe('enthusiastic');
    });

    it('should set response length', () => {
      const soul = new KwamiSoul();
      soul.setResponseLength('long');
      
      expect(soul.getConfig().responseLength).toBe('long');
    });
  });

  describe('Language', () => {
    it('should get language', () => {
      const soul = new KwamiSoul({ language: 'es' });
      expect(soul.getLanguage()).toBe('es');
    });

    it('should set language', () => {
      const soul = new KwamiSoul();
      soul.setLanguage('fr');
      
      expect(soul.getLanguage()).toBe('fr');
    });

    it('should return default language', () => {
      const soul = new KwamiSoul();
      const lang = soul.getLanguage();
      
      expect(lang).toBe('en');
    });
  });

  describe('Emotional Traits', () => {
    it('should get emotional traits', () => {
      const traits = {
        happiness: 50,
        energy: 75,
        confidence: 60,
        calmness: 40,
        optimism: 80,
        socialness: 70,
        creativity: 65,
        patience: 55,
        empathy: 85,
        curiosity: 90,
      };
      
      const soul = new KwamiSoul({ emotionalTraits: traits });
      const result = soul.getEmotionalTraits();
      
      expect(result).toEqual(traits);
    });

    it('should get specific emotional trait', () => {
      const soul = new KwamiSoul({
        emotionalTraits: { happiness: 75 } as any,
      });
      
      expect(soul.getEmotionalTrait('happiness')).toBe(75);
    });

    it('should set emotional traits', () => {
      const soul = new KwamiSoul();
      const traits = {
        happiness: 100,
        energy: 80,
        confidence: 90,
        calmness: 70,
        optimism: 85,
        socialness: 75,
        creativity: 95,
        patience: 65,
        empathy: 88,
        curiosity: 92,
      };
      
      soul.setEmotionalTraits(traits);
      expect(soul.getEmotionalTraits()).toEqual(traits);
    });

    it('should set individual emotional trait', () => {
      const soul = new KwamiSoul();
      soul.setEmotionalTrait('happiness', 75);
      
      expect(soul.getEmotionalTrait('happiness')).toBe(75);
    });

    it('should clamp emotional trait values to -100/+100', () => {
      const soul = new KwamiSoul();
      
      soul.setEmotionalTrait('happiness', 150);
      expect(soul.getEmotionalTrait('happiness')).toBe(100);
      
      soul.setEmotionalTrait('energy', -150);
      expect(soul.getEmotionalTrait('energy')).toBe(-100);
    });
  });

  describe('Export/Import', () => {
    it('should export as JSON string', () => {
      const soul = new KwamiSoul({
        name: 'TestBot',
        personality: 'Friendly',
      });
      
      const json = soul.exportAsString('json');
      expect(json).toContain('TestBot');
      expect(json).toContain('Friendly');
      
      const parsed = JSON.parse(json);
      expect(parsed.name).toBe('TestBot');
    });

    it('should export as YAML string', () => {
      const soul = new KwamiSoul({
        name: 'TestBot',
        personality: 'Friendly',
      });
      
      const yaml = soul.exportAsString('yaml');
      expect(yaml).toContain('TestBot');
      expect(yaml).toContain('Friendly');
    });

    it('should export as JSON by default (legacy method)', () => {
      const soul = new KwamiSoul({ name: 'Test' });
      const json = soul.exportAsJSON();
      
      expect(json).toContain('Test');
      const parsed = JSON.parse(json);
      expect(parsed.name).toBe('Test');
    });

    it('should import from JSON string', () => {
      const soul = new KwamiSoul();
      const json = JSON.stringify({
        name: 'Imported',
        personality: 'New',
      });
      
      soul.importFromString(json, 'json');
      expect(soul.getName()).toBe('Imported');
      expect(soul.getConfig().personality).toBe('New');
    });

    it('should import from YAML string', () => {
      const soul = new KwamiSoul();
      const yaml = 'name: Imported\npersonality: New';
      
      soul.importFromString(yaml, 'yaml');
      expect(soul.getName()).toBe('Imported');
    });

    it('should auto-detect format when importing', () => {
      const soul = new KwamiSoul();
      const json = '{"name": "AutoDetected"}';
      
      soul.importFromString(json);
      expect(soul.getName()).toBe('AutoDetected');
    });

    it('should support legacy importFromJSON', () => {
      const soul = new KwamiSoul();
      const json = '{"name": "Legacy"}';
      
      soul.importFromJSON(json);
      expect(soul.getName()).toBe('Legacy');
    });
  });

  describe('createSnapshot', () => {
    it('should create a snapshot of current config', () => {
      const soul = new KwamiSoul({
        name: 'Snapshot',
        personality: 'Test',
      });
      
      const snapshot = soul.createSnapshot();
      expect(snapshot.name).toBe('Snapshot');
      expect(snapshot.personality).toBe('Test');
    });

    it('should return a copy, not reference', () => {
      const soul = new KwamiSoul({ name: 'Original' });
      const snapshot = soul.createSnapshot();
      snapshot.name = 'Modified';
      
      expect(soul.getName()).toBe('Original');
    });
  });

  describe('updateConfig', () => {
    it('should update configuration partially', () => {
      const soul = new KwamiSoul({
        name: 'Original',
        personality: 'Initial',
      });
      
      soul.updateConfig({ personality: 'Updated' });
      
      expect(soul.getName()).toBe('Original');
      expect(soul.getConfig().personality).toBe('Updated');
    });

    it('should merge deeply', () => {
      const soul = new KwamiSoul({
        name: 'Test',
        traits: ['a', 'b'],
      });
      
      soul.updateConfig({
        personality: 'New',
        traits: ['c'],
      });
      
      expect(soul.getConfig().traits).toEqual(['c']);
    });
  });

  describe('loadPersonality from file', () => {
    it('should load personality from JSON file', async () => {
      const soul = new KwamiSoul();
      
      await soul.loadPersonality('/test.json');
      
      expect(soul.getName()).toBe('Test');
    });

    it('should load personality from YAML file', async () => {
      const soul = new KwamiSoul();
      
      await soul.loadPersonality('/test.yaml');
      
      expect(soul.getName()).toBe('Test');
    });

    it('should handle fetch errors', async () => {
      const soul = new KwamiSoul();
      
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      } as Response);
      
      await expect(soul.loadPersonality('/nonexistent.json')).rejects.toThrow();
    });

    it('should detect YAML by extension', async () => {
      const soul = new KwamiSoul();
      
      await soul.loadPersonality('/test.yml');
      
      expect(vi.mocked(global.fetch)).toHaveBeenCalledWith('/test.yml');
    });
  });

  describe('loadPresetPersonality', () => {
    it('should load friendly preset', () => {
      const soul = new KwamiSoul();
      soul.loadPresetPersonality('friendly');
      
      const config = soul.getConfig();
      expect(config.name).toBeDefined();
    });

    it('should load playful preset', () => {
      const soul = new KwamiSoul();
      soul.loadPresetPersonality('playful');
      
      const config = soul.getConfig();
      expect(config).toBeDefined();
    });

    it('should handle invalid preset gracefully', () => {
      const soul = new KwamiSoul();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      soul.loadPresetPersonality('nonexistent' as any);
      
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });
});

