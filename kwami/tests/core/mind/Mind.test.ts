import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KwamiMind } from '../../../src/core/mind/Mind';
import { createMockAudioElement, createMockElevenLabsProvider } from '../../utils/test-helpers';
import type { MindConfig, VoiceSettings } from '../../../src/types';

// Mock the factory
vi.mock('../../../src/core/mind/providers/factory', () => ({
  createMindProvider: vi.fn(() => createMockElevenLabsProvider()),
}));

// Mock KwamiAudio
const createMockKwamiAudio = () => ({
  getAudioElement: vi.fn(() => createMockAudioElement()),
  play: vi.fn(),
  pause: vi.fn(),
  stop: vi.fn(),
  setVolume: vi.fn(),
  getVolume: vi.fn(() => 1),
  analyser: {
    getByteFrequencyData: vi.fn(),
    frequencyBinCount: 128,
  },
});

describe('KwamiMind', () => {
  let mockAudio: ReturnType<typeof createMockKwamiAudio>;
  const testConfig: MindConfig = { apiKey: 'test-api-key' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAudio = createMockKwamiAudio();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create instance with audio and default config', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      expect(mind).toBeInstanceOf(KwamiMind);
      expect(mind.config).toBeDefined();
    });

    it('should create instance with custom config', () => {
      const config: MindConfig = {
        apiKey: 'test-key',
        voice: {
          voiceId: 'test-voice',
        },
      };
      
      const mind = new KwamiMind(mockAudio as any, config);
      expect(mind.config.apiKey).toBe('test-key');
    });

    it('should initialize provider', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      expect(mind).toHaveProperty('config');
    });
  });

  describe('initialize', () => {
    it('should initialize provider', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      await mind.initialize();
      
      expect((mind as any).provider.initialize).toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      (mind as any).provider.initialize = vi.fn(() => Promise.reject(new Error('Init failed')));
      
      await expect(mind.initialize()).rejects.toThrow('Init failed');
    });
  });

  describe('isReady', () => {
    it('should return provider ready state', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      const result = mind.isReady();
      
      expect(typeof result).toBe('boolean');
      expect((mind as any).provider.isReady).toHaveBeenCalled();
    });
  });

  describe('speak', () => {
    it('should call provider speak with text', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      await mind.speak('Hello world');
      
      expect((mind as any).provider.speak).toHaveBeenCalledWith(
        'Hello world',
        expect.any(Object)
      );
    });

    it('should support system prompt', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      await mind.speak('Hello', 'You are helpful');
      
      expect((mind as any).provider.speak).toHaveBeenCalledWith(
        'Hello',
        expect.objectContaining({ systemPrompt: 'You are helpful' })
      );
    });

    it('should apply pronunciations', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.addPronunciation('API', 'A-P-I');
      
      await mind.speak('The API works');
      
      expect((mind as any).provider.speak).toHaveBeenCalledWith(
        'The A-P-I works',
        expect.any(Object)
      );
    });
  });

  describe('Conversation Management', () => {
    it('should start conversation', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      const callbacks = {
        onAgentResponse: vi.fn(),
        onUserTranscript: vi.fn(),
      };
      
      await mind.startConversation('System prompt', callbacks);
      
      expect((mind as any).provider.startConversation).toHaveBeenCalledWith(
        'System prompt',
        callbacks
      );
    });

    it('should stop conversation', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      await mind.stopConversation();
      
      expect((mind as any).provider.stopConversation).toHaveBeenCalled();
    });

    it('should check if conversation is active', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      const result = mind.isConversationActive();
      
      expect(typeof result).toBe('boolean');
      expect((mind as any).provider.isConversationActive).toHaveBeenCalled();
    });

    it('should send conversation message', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.sendConversationMessage('Hello');
      
      expect((mind as any).provider.sendConversationMessage).toHaveBeenCalledWith('Hello');
    });
  });

  describe('Listening', () => {
    it('should start listening', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      const stream = await mind.listen();
      
      expect(stream).toBeInstanceOf(MediaStream);
      expect((mind as any).provider.listen).toHaveBeenCalled();
    });

    it('should stop listening', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.stopListening();
      
      expect((mind as any).provider.stopListening).toHaveBeenCalled();
    });
  });

  describe('Voice Management', () => {
    it('should get available voices', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      const voices = await mind.getAvailableVoices();
      
      expect(Array.isArray(voices)).toBe(true);
      expect((mind as any).provider.getAvailableVoices).toHaveBeenCalled();
    });

    it('should set voice settings', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      const settings: VoiceSettings = {
        stability: 0.5,
        similarity_boost: 0.75,
      };
      
      mind.setVoiceSettings(settings);
      
      expect(mind.config.voice?.settings).toEqual(settings);
    });

    it('should set voice ID', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.setVoiceId('new-voice-id');
      
      expect(mind.config.voice?.voiceId).toBe('new-voice-id');
    });

    it('should set model', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.setModel('eleven_turbo_v2');
      
      expect(mind.config.voice?.model).toBe('eleven_turbo_v2');
    });

    it('should preview voice', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      await mind.previewVoice('Custom preview text');
      
      expect((mind as any).provider.speak).toHaveBeenCalledWith(
        'Custom preview text',
        expect.any(Object)
      );
    });

    it('should use default preview text', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      await mind.previewVoice();
      
      expect((mind as any).provider.speak).toHaveBeenCalledWith(
        expect.stringContaining('preview'),
        expect.any(Object)
      );
    });
  });

  describe('Speech Generation', () => {
    it('should generate speech blob', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      const blob = await mind.generateSpeechBlob('Test text');
      
      expect(blob).toBeInstanceOf(Blob);
      expect((mind as any).provider.generateSpeechBlob).toHaveBeenCalledWith('Test text');
    });

    it('should apply pronunciations to generated speech', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.addPronunciation('test', 'tee-est');
      
      await mind.generateSpeechBlob('This is a test');
      
      expect((mind as any).provider.generateSpeechBlob).toHaveBeenCalledWith(
        'This is a tee-est'
      );
    });
  });

  describe('Microphone Testing', () => {
    it('should test microphone', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      const result = await mind.testMicrophone();
      
      expect(typeof result).toBe('boolean');
      expect((mind as any).provider.testMicrophone).toHaveBeenCalled();
    });
  });

  describe('Configuration Management', () => {
    it('should get config', () => {
      const config: MindConfig = {
        apiKey: 'test',
        language: 'en',
      };
      
      const mind = new KwamiMind(mockAudio as any, config);
      const result = mind.getConfig();
      
      expect(result.apiKey).toBe('test');
      expect(result.language).toBe('en');
    });

    it('should set language', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.setLanguage('es');
      
      expect(mind.config.language).toBe('es');
    });

    it('should get language', () => {
      const mind = new KwamiMind(mockAudio as any, { language: 'fr' });
      expect(mind.getLanguage()).toBe('fr');
    });

    it('should update config', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.updateConfig({
        language: 'de',
        voice: { voiceId: 'new-voice' },
      });
      
      expect(mind.config.language).toBe('de');
      expect(mind.config.voice?.voiceId).toBe('new-voice');
    });

    it('should export config with pronunciations', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.addPronunciation('test', 'pronunciation');
      
      const exported = mind.exportConfig();
      
      expect(exported.pronunciation?.dictionary).toHaveProperty('test');
    });

    it('should import config', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      const config: MindConfig = {
        language: 'ja',
        voice: { voiceId: 'imported-voice' },
      };
      
      mind.importConfig(config);
      
      expect(mind.config.language).toBe('ja');
      expect(mind.config.voice?.voiceId).toBe('imported-voice');
    });
  });

  describe('Pronunciation Dictionary', () => {
    it('should add pronunciation', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.addPronunciation('SQL', 'sequel');
      
      expect(mind.getPronunciation('SQL')).toBe('sequel');
    });

    it('should be case-insensitive', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.addPronunciation('API', 'A-P-I');
      
      expect(mind.getPronunciation('api')).toBe('A-P-I');
      expect(mind.getPronunciation('API')).toBe('A-P-I');
      expect(mind.getPronunciation('Api')).toBe('A-P-I');
    });

    it('should remove pronunciation', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.addPronunciation('test', 'pronunciation');
      mind.removePronunciation('test');
      
      expect(mind.getPronunciation('test')).toBeUndefined();
    });

    it('should clear all pronunciations', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.addPronunciation('a', 'alpha');
      mind.addPronunciation('b', 'beta');
      mind.clearPronunciations();
      
      const all = mind.getAllPronunciations();
      expect(Object.keys(all).length).toBe(0);
    });

    it('should get all pronunciations', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.addPronunciation('a', 'alpha');
      mind.addPronunciation('b', 'beta');
      
      const all = mind.getAllPronunciations();
      
      expect(all.a).toBe('alpha');
      expect(all.b).toBe('beta');
    });

    it('should set pronunciation config', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.setPronunciationConfig({
        dictionary: {
          test: 'pronunciation',
          another: 'word',
        },
      });
      
      expect(mind.getPronunciation('test')).toBe('pronunciation');
      expect(mind.getPronunciation('another')).toBe('word');
    });
  });

  describe('Advanced TTS Options', () => {
    it('should set advanced TTS options', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.setAdvancedTTSOptions({
        outputFormat: 'mp3_44100_128',
        optimizeStreamingLatency: true,
      });
      
      expect(mind.config.advancedTTS?.outputFormat).toBe('mp3_44100_128');
      expect(mind.config.advancedTTS?.optimizeStreamingLatency).toBe(true);
    });

    it('should get advanced TTS options', () => {
      const mind = new KwamiMind(mockAudio as any, {
        advancedTTS: { outputFormat: 'pcm_16000' },
      });
      
      const options = mind.getAdvancedTTSOptions();
      expect(options?.outputFormat).toBe('pcm_16000');
    });

    it('should set output format', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.setOutputFormat('mp3_44100_192');
      
      expect(mind.config.advancedTTS?.outputFormat).toBe('mp3_44100_192');
    });

    it('should set optimize streaming latency', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.setOptimizeStreamingLatency(true);
      
      expect(mind.config.advancedTTS?.optimizeStreamingLatency).toBe(true);
    });

    it('should set next text timeout', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.setNextTextTimeout(500);
      
      expect(mind.config.advancedTTS?.nextTextTimeout).toBe(500);
    });
  });

  describe('Conversational Settings', () => {
    it('should set conversational settings', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.setConversationalSettings({
        agentId: 'test-agent',
        maxDuration: 300,
      });
      
      expect(mind.config.conversational?.agentId).toBe('test-agent');
      expect(mind.config.conversational?.maxDuration).toBe(300);
    });

    it('should get conversational settings', () => {
      const mind = new KwamiMind(mockAudio as any, {
        conversational: { agentId: 'agent-123' },
      });
      
      const settings = mind.getConversationalSettings();
      expect(settings?.agentId).toBe('agent-123');
    });

    it('should set agent ID', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.setAgentId('new-agent-id');
      
      expect(mind.config.conversational?.agentId).toBe('new-agent-id');
    });
  });

  describe('STT Configuration', () => {
    it('should set STT config', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.setSTTConfig({
        model: 'large',
        language: 'en',
      });
      
      expect(mind.config.stt?.model).toBe('large');
      expect(mind.config.stt?.language).toBe('en');
    });

    it('should get STT config', () => {
      const mind = new KwamiMind(mockAudio as any, {
        stt: { model: 'medium' },
      });
      
      const config = mind.getSTTConfig();
      expect(config?.model).toBe('medium');
    });

    it('should set STT model', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.setSTTModel('large');
      
      expect(mind.config.stt?.model).toBe('large');
    });

    it('should set automatic punctuation', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.setAutomaticPunctuation(true);
      
      expect(mind.config.stt?.automaticPunctuation).toBe(true);
    });

    it('should set speaker diarization', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.setSpeakerDiarization(true);
      
      expect(mind.config.stt?.speakerDiarization).toBe(true);
    });
  });

  describe('Voice Presets', () => {
    it('should apply natural preset', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.applyVoicePreset('natural');
      
      expect(mind.config.voice?.settings?.stability).toBe(0.5);
    });

    it('should apply expressive preset', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.applyVoicePreset('expressive');
      
      expect(mind.config.voice?.settings?.stability).toBe(0.3);
      expect(mind.config.voice?.settings?.style).toBe(0.5);
    });

    it('should apply stable preset', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.applyVoicePreset('stable');
      
      expect(mind.config.voice?.settings?.stability).toBe(0.8);
    });

    it('should apply clear preset', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.applyVoicePreset('clear');
      
      expect(mind.config.voice?.settings?.stability).toBe(0.6);
    });
  });

  describe('dispose', () => {
    it('should dispose provider and cleanup', () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      mind.addPronunciation('test', 'value');
      
      mind.dispose();
      
      expect((mind as any).provider.dispose).toHaveBeenCalled();
      expect((mind as any).provider.stopListening).toHaveBeenCalled();
    });
  });

  describe('Agent Management', () => {
    it('should create agent', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      const result = await mind.createAgent({ conversation_config: {} });
      
      expect(result.agent_id).toBeDefined();
      expect((mind as any).provider.createAgent).toHaveBeenCalled();
    });

    it('should get agent', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      const result = await mind.getAgent('test-agent');
      
      expect(result.agent_id).toBe('test-agent');
    });

    it('should list agents', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      const result = await mind.listAgents();
      
      expect(result.agents).toBeDefined();
      expect(Array.isArray(result.agents)).toBe(true);
    });

    it('should update agent', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      const result = await mind.updateAgent('test-agent', {});
      
      expect(result.agent_id).toBeDefined();
    });

    it('should delete agent', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      await expect(mind.deleteAgent('test-agent')).resolves.toBeUndefined();
    });

    it('should duplicate agent', async () => {
      const mind = new KwamiMind(mockAudio as any, testConfig);
      const result = await mind.duplicateAgent('test-agent', { new_name: 'Copy' });
      
      expect(result.agent_id).toBeDefined();
    });
  });

  describe('Conversation Analytics', () => {
    it('should list conversations', async () => {
      const mind = new KwamiMind(mockAudio as any, { apiKey: 'test-key' });
      const result = await mind.listConversations();
      
      expect(result.conversations).toBeDefined();
      expect(Array.isArray(result.conversations)).toBe(true);
    });

    it('should get conversation', async () => {
      const mind = new KwamiMind(mockAudio as any, { apiKey: 'test-key' });
      const result = await mind.getConversation('conv-id');
      
      expect(result.conversation_id).toBe('test-conv');
    });

    it('should delete conversation', async () => {
      const mind = new KwamiMind(mockAudio as any, { apiKey: 'test-key' });
      await expect(mind.deleteConversation('conv-id')).resolves.toBeUndefined();
    });
  });
});

