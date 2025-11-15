import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Kwami } from '../../core/Kwami';
import { createMockCanvas } from '../utils/test-helpers';
import type { KwamiConfig } from '../../types';

// Mock all core modules
vi.mock('../../src/core/body/Body', () => ({
  KwamiBody: vi.fn(function() {
    return {
      audio: {
        play: vi.fn(),
        pause: vi.fn(),
        stop: vi.fn(),
        getAudioElement: vi.fn(() => ({
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      },
      blob: {
        setSpikes: vi.fn(),
        setTime: vi.fn(),
        setRandomBlob: vi.fn(),
      },
      scene: {
        render: vi.fn(),
      },
      dispose: vi.fn(),
      enableBlobInteraction: vi.fn(),
      disableBlobInteraction: vi.fn(),
    };
  }),
}));

vi.mock('../../src/core/mind/Mind', () => ({
  KwamiMind: vi.fn(function() {
    return {
      initialize: vi.fn(() => Promise.resolve()),
      speak: vi.fn(() => Promise.resolve()),
      listen: vi.fn(() => Promise.resolve()),
      startConversation: vi.fn(() => Promise.resolve()),
      stopConversation: vi.fn(() => Promise.resolve()),
      isConversationActive: vi.fn(() => false),
      sendConversationMessage: vi.fn(),
    };
  }),
}));

vi.mock('../../src/core/soul/Soul', () => ({
  KwamiSoul: vi.fn(function() {
    return {
      getSystemPrompt: vi.fn(() => 'Test system prompt'),
      getName: vi.fn(() => 'TestKwami'),
    };
  }),
}));

vi.mock('../../src/core/mind/skills/SkillManager', () => ({
  SkillManager: vi.fn(function() {
    return {
      register: vi.fn(),
      execute: vi.fn(),
    };
  }),
}));

describe('Kwami', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    vi.clearAllMocks();
    canvas = createMockCanvas();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create Kwami instance with canvas', () => {
      const kwami = new Kwami(canvas);
      expect(kwami).toBeInstanceOf(Kwami);
      expect(kwami.body).toBeDefined();
      expect(kwami.mind).toBeDefined();
      expect(kwami.soul).toBeDefined();
      expect(kwami.skills).toBeDefined();
    });

    it('should create instance with config', () => {
      const config: KwamiConfig = {
        body: {
          audioFiles: ['/audio/track1.mp3'],
        },
        mind: {
          apiKey: 'test-key',
        },
        soul: {
          name: 'CustomKwami',
        },
      };
      
      const kwami = new Kwami(canvas, config);
      expect(kwami).toBeInstanceOf(Kwami);
    });

    it('should initialize all components', () => {
      const kwami = new Kwami(canvas);
      
      expect(kwami.body).toBeDefined();
      expect(kwami.mind).toBeDefined();
      expect(kwami.soul).toBeDefined();
      expect(kwami.skills).toBeDefined();
    });

    it('should set audio parent reference', () => {
      const kwami = new Kwami(canvas);
      expect(kwami.body.audio.parentKwami).toBe(kwami);
    });
  });

  describe('Version', () => {
    it('should return version string', () => {
      const version = Kwami.getVersion();
      expect(typeof version).toBe('string');
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('State Management', () => {
    it('should get initial state', () => {
      const kwami = new Kwami(canvas);
      const state = kwami.getState();
      
      expect(state).toBe('idle');
    });

    it('should set state to listening', () => {
      const kwami = new Kwami(canvas);
      kwami.setState('listening');
      
      expect(kwami.getState()).toBe('listening');
      expect(kwami.body.blob.setSpikes).toHaveBeenCalled();
    });

    it('should set state to thinking', () => {
      const kwami = new Kwami(canvas);
      kwami.setState('thinking');
      
      expect(kwami.getState()).toBe('thinking');
      expect(kwami.body.blob.setTime).toHaveBeenCalled();
    });

    it('should set state to speaking', () => {
      const kwami = new Kwami(canvas);
      kwami.setState('speaking');
      
      expect(kwami.getState()).toBe('speaking');
      expect(kwami.body.blob.setSpikes).toHaveBeenCalled();
    });

    it('should set state to idle', () => {
      const kwami = new Kwami(canvas);
      kwami.setState('idle');
      
      expect(kwami.getState()).toBe('idle');
      expect(kwami.body.blob.setSpikes).toHaveBeenCalled();
    });

    it('should adjust blob animation based on state', () => {
      const kwami = new Kwami(canvas);
      
      kwami.setState('listening');
      expect(kwami.body.blob.setSpikes).toHaveBeenCalledWith(0.4, 0.4, 0.4);
      
      kwami.setState('thinking');
      expect(kwami.body.blob.setSpikes).toHaveBeenCalledWith(0.15, 0.15, 0.15);
      
      kwami.setState('speaking');
      expect(kwami.body.blob.setSpikes).toHaveBeenCalledWith(0.3, 0.3, 0.3);
    });
  });

  describe('listen', () => {
    it('should start listening', async () => {
      const kwami = new Kwami(canvas);
      await kwami.listen();
      
      expect(kwami.getState()).toBe('listening');
      expect(kwami.mind.listen).toHaveBeenCalled();
    });

    it('should handle listen errors', async () => {
      const kwami = new Kwami(canvas);
      vi.mocked(kwami.mind.listen).mockRejectedValue(new Error('Listen failed'));
      
      await expect(kwami.listen()).rejects.toThrow('Listen failed');
      expect(kwami.getState()).toBe('idle');
    });
  });

  describe('think', () => {
    it('should set thinking state', () => {
      const kwami = new Kwami(canvas);
      kwami.think();
      
      expect(kwami.getState()).toBe('thinking');
    });
  });

  describe('speak', () => {
    it('should speak text', async () => {
      const kwami = new Kwami(canvas);
      await kwami.speak('Hello world');
      
      expect(kwami.mind.speak).toHaveBeenCalledWith(
        'Hello world',
        expect.any(String)
      );
    });

    it('should use soul system prompt', async () => {
      const kwami = new Kwami(canvas);
      await kwami.speak('Test');
      
      expect(kwami.soul.getSystemPrompt).toHaveBeenCalled();
    });

    it('should return to idle when speech ends', async () => {
      const kwami = new Kwami(canvas);
      let endedHandler: (() => void) | undefined;
      
      vi.mocked(kwami.body.audio.getAudioElement).mockReturnValue({
        addEventListener: vi.fn((event, handler) => {
          if (event === 'ended') {
            endedHandler = handler as () => void;
          }
        }),
      } as any);
      
      await kwami.speak('Test');
      
      // Simulate audio ended
      endedHandler?.();
      
      expect(kwami.getState()).toBe('idle');
    });

    it('should handle speak errors', async () => {
      const kwami = new Kwami(canvas);
      vi.mocked(kwami.mind.speak).mockRejectedValue(new Error('Speak failed'));
      
      await expect(kwami.speak('Test')).rejects.toThrow('Speak failed');
      expect(kwami.getState()).toBe('idle');
    });
  });

  describe('Conversation Management', () => {
    it('should start conversation', async () => {
      const kwami = new Kwami(canvas);
      const callbacks = {
        onAgentResponse: vi.fn(),
        onUserTranscript: vi.fn(),
      };
      
      await kwami.startConversation(callbacks);
      
      expect(kwami.mind.initialize).toHaveBeenCalled();
      expect(kwami.mind.startConversation).toHaveBeenCalled();
      expect(kwami.getState()).toBe('listening');
    });

    it('should enhance callbacks with state management', async () => {
      const kwami = new Kwami(canvas);
      const onTurnStart = vi.fn();
      const onTurnEnd = vi.fn();
      
      await kwami.startConversation({ onTurnStart, onTurnEnd });
      
      const callArgs = vi.mocked(kwami.mind.startConversation).mock.calls[0];
      const enhancedCallbacks = callArgs[1];
      
      // Test enhanced callbacks
      enhancedCallbacks?.onTurnStart?.();
      expect(kwami.getState()).toBe('speaking');
      expect(onTurnStart).toHaveBeenCalled();
      
      enhancedCallbacks?.onTurnEnd?.();
      expect(kwami.getState()).toBe('listening');
      expect(onTurnEnd).toHaveBeenCalled();
    });

    it('should handle conversation start errors', async () => {
      const kwami = new Kwami(canvas);
      vi.mocked(kwami.mind.startConversation).mockRejectedValue(
        new Error('Conversation failed')
      );
      
      await expect(kwami.startConversation()).rejects.toThrow('Conversation failed');
      expect(kwami.getState()).toBe('idle');
    });

    it('should stop conversation', async () => {
      const kwami = new Kwami(canvas);
      await kwami.stopConversation();
      
      expect(kwami.mind.stopConversation).toHaveBeenCalled();
      expect(kwami.getState()).toBe('idle');
    });

    it('should check if conversation is active', () => {
      const kwami = new Kwami(canvas);
      const isActive = kwami.isConversationActive();
      
      expect(typeof isActive).toBe('boolean');
      expect(kwami.mind.isConversationActive).toHaveBeenCalled();
    });

    it('should send conversation message', () => {
      const kwami = new Kwami(canvas);
      kwami.sendConversationMessage('Hello');
      
      expect(kwami.mind.sendConversationMessage).toHaveBeenCalledWith('Hello');
    });
  });

  describe('Blob Interaction', () => {
    it('should enable blob interaction', () => {
      const kwami = new Kwami(canvas);
      kwami.enableBlobInteraction();
      
      expect(kwami.body.enableBlobInteraction).toHaveBeenCalled();
    });

    it('should toggle conversation on double-click', async () => {
      const kwami = new Kwami(canvas);
      
      let doubleClickHandler: (() => void) | undefined;
      vi.mocked(kwami.body.enableBlobInteraction).mockImplementation((handler) => {
        doubleClickHandler = handler;
      });
      
      kwami.enableBlobInteraction();
      
      // Simulate double-click
      await doubleClickHandler?.();
      
      expect(kwami.mind.startConversation).toHaveBeenCalled();
    });

    it('should stop conversation on double-click when active', async () => {
      const kwami = new Kwami(canvas);
      vi.mocked(kwami.mind.isConversationActive).mockReturnValue(true);
      
      let doubleClickHandler: (() => void) | undefined;
      vi.mocked(kwami.body.enableBlobInteraction).mockImplementation((handler) => {
        doubleClickHandler = handler;
      });
      
      kwami.enableBlobInteraction();
      
      // Simulate double-click
      await doubleClickHandler?.();
      
      expect(kwami.mind.stopConversation).toHaveBeenCalled();
    });

    it('should disable blob interaction', () => {
      const kwami = new Kwami(canvas);
      kwami.disableBlobInteraction();
      
      expect(kwami.body.disableBlobInteraction).toHaveBeenCalled();
    });

    it('should pass conversation callbacks to interaction', () => {
      const kwami = new Kwami(canvas);
      const callbacks = { onAgentResponse: vi.fn() };
      
      kwami.enableBlobInteraction(callbacks);
      
      expect(kwami.body.enableBlobInteraction).toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    it('should dispose all resources', () => {
      const kwami = new Kwami(canvas);
      kwami.dispose();
      
      expect(kwami.body.dispose).toHaveBeenCalled();
    });

    it('should stop conversation before disposal', async () => {
      const kwami = new Kwami(canvas);
      vi.mocked(kwami.mind.isConversationActive).mockReturnValue(true);
      
      kwami.dispose();
      
      expect(kwami.mind.stopConversation).toHaveBeenCalled();
    });

    it('should handle disposal when no conversation active', () => {
      const kwami = new Kwami(canvas);
      vi.mocked(kwami.mind.isConversationActive).mockReturnValue(false);
      
      expect(() => kwami.dispose()).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should coordinate state changes across components', async () => {
      const kwami = new Kwami(canvas);
      
      kwami.setState('listening');
      expect(kwami.body.blob.setSpikes).toHaveBeenCalled();
      
      kwami.setState('speaking');
      expect(kwami.body.blob.setSpikes).toHaveBeenCalledTimes(2);
    });

    it('should pass soul configuration to mind', async () => {
      const kwami = new Kwami(canvas);
      await kwami.speak('Test');
      
      expect(kwami.soul.getSystemPrompt).toHaveBeenCalled();
      expect(kwami.mind.speak).toHaveBeenCalledWith(
        'Test',
        expect.any(String)
      );
    });
  });
});

