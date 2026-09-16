import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger, redact, REDACTED } from '../../src/utils/logger';

afterEach(() => {
  vi.restoreAllMocks();
  logger.setLevel('info');
  logger.setPrefix('[Kwami]');
});

describe('logger levels', () => {
  it('suppresses everything below the configured level', () => {
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    logger.setLevel('warn');
    logger.debug('d');
    logger.info('i');
    logger.warn('w');

    expect(debug).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledOnce();
  });

  it('lets everything through at debug', () => {
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});

    logger.setLevel('debug');
    logger.debug('d');

    expect(debug).toHaveBeenCalledWith('[Kwami]', 'd');
  });

  it('always emits errors, even at the error level', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.setLevel('error');
    logger.error('boom', { code: 500 });

    expect(error).toHaveBeenCalledWith('[Kwami]', 'boom', { code: 500 });
  });
});

describe('logger prefix', () => {
  it('uses the configured prefix on every line', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    logger.setPrefix('[Luna]');
    logger.info('hello');

    expect(info).toHaveBeenCalledWith('[Luna]', 'hello');
  });
});

describe('logger redaction', () => {
  // Defends CVE-class bug: `LiveKitPipeline.sendVoiceConfig()` logged the whole voice config —
  // including `llm.apiKey`, `tts.apiKey`, `realtime.apiKey` and `stt.extra.apiKey` — at the
  // default `info` level, printing provider credentials to the console of every embedding app
  // on every connect and every live voice update. Redaction lives in the logger rather than at
  // the call site so a future `logger.info(config)` cannot reintroduce it.
  const voiceConfig = {
    llm: { provider: 'openai', model: 'gpt-4o', apiKey: 'sk-test-LEAK-llm', maxTokens: 512 },
    tts: { provider: 'cartesia', voice: 'nova', apiKey: 'sk-test-LEAK-tts' },
    stt: { provider: 'deepgram', extra: { apiKey: 'sk-test-LEAK-stt' } },
    realtime: { provider: 'openai', apiKey: 'sk-test-LEAK-realtime' },
  };

  it('masks credentials at every log level', () => {
    const spies = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };

    logger.setLevel('debug');
    logger.debug('sending config', voiceConfig);
    logger.info('sending config', voiceConfig);
    logger.warn('sending config', voiceConfig);
    logger.error('sending config', voiceConfig);

    for (const spy of Object.values(spies)) {
      expect(spy).toHaveBeenCalledOnce();
      expect(JSON.stringify(spy.mock.calls[0])).not.toContain('sk-test-LEAK');
    }
  });

  it('replaces the secret with a marker rather than dropping the key', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    logger.info(voiceConfig);

    expect(info).toHaveBeenCalledWith('[Kwami]', {
      llm: { provider: 'openai', model: 'gpt-4o', apiKey: REDACTED, maxTokens: 512 },
      tts: { provider: 'cartesia', voice: 'nova', apiKey: REDACTED },
      stt: { provider: 'deepgram', extra: { apiKey: REDACTED } },
      realtime: { provider: 'openai', apiKey: REDACTED },
    });
  });

  it('does not mutate the caller object', () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const config = { llm: { apiKey: 'sk-live-keep-me' } };

    logger.info(config);

    expect(config.llm.apiKey).toBe('sk-live-keep-me');
  });

  it('leaves token-shaped metric fields alone', () => {
    // A substring rule on `token` would mask all three of these. They are ordinary
    // voice-pipeline fields and a log without them is harder to debug, not safer.
    expect(redact({ maxTokens: 512, maxResponseTokens: 128, tokenEndpoint: '/api/token' })).toEqual(
      {
        maxTokens: 512,
        maxResponseTokens: 128,
        tokenEndpoint: '/api/token',
      },
    );
  });

  it('matches a sensitive key regardless of casing or separators', () => {
    expect(
      redact({ api_key: 'a', 'API-KEY': 'b', apiKey: 'c', authToken: 'd', token: 'e' }),
    ).toEqual({
      api_key: REDACTED,
      'API-KEY': REDACTED,
      apiKey: REDACTED,
      authToken: REDACTED,
      token: REDACTED,
    });
  });

  it('walks arrays and nested structures', () => {
    expect(redact({ tools: [{ name: 'search', secret: 's' }] })).toEqual({
      tools: [{ name: 'search', secret: REDACTED }],
    });
  });

  it('survives a cycle instead of overflowing the stack', () => {
    const cyclic: Record<string, unknown> = { apiKey: 'k' };
    cyclic.self = cyclic;

    expect(redact(cyclic)).toEqual({ apiKey: REDACTED, self: '[circular]' });
  });

  it('passes non-plain objects through untouched so the console can still render them', () => {
    const error = new Error('boom');

    expect(redact(error)).toBe(error);
  });
});
