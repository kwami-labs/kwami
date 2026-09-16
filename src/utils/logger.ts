/**
 * Simple logger utility for Kwami
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  level: LogLevel
  prefix: string
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

/**
 * Keys whose values are masked before anything reaches the console.
 *
 * Matched on the key NORMALIZED to lowercase with `_`, `-` and spaces stripped, so `apiKey`,
 * `api_key` and `API-KEY` all hit the same entry. Matching is exact on that normalized form,
 * deliberately: a substring rule on `token` would also mask `maxTokens`, `maxResponseTokens`
 * and `tokenEndpoint`, which are ordinary voice-pipeline fields worth seeing in a log.
 *
 * This exists because the voice config carries provider credentials — `llm.apiKey`,
 * `tts.apiKey`, `realtime.apiKey`, `stt.extra.apiKey` — and that whole object used to be
 * logged verbatim on every connect and every live update, at the default level.
 */
const SENSITIVE_KEYS: ReadonlySet<string> = new Set([
  'apikey',
  'apisecret',
  'secret',
  'clientsecret',
  'token',
  'accesstoken',
  'refreshtoken',
  'authtoken',
  'idtoken',
  'sessiontoken',
  'bearertoken',
  'password',
  'passphrase',
  'privatekey',
  'credential',
  'credentials',
  'authorization',
])

export const REDACTED = '[redacted]'

/** Bounds the walk so a deep or hostile structure cannot stall a log call. */
const MAX_REDACT_DEPTH = 8

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key.toLowerCase().replace(/[_\-\s]/g, ''))
}

/**
 * A plain object is one whose prototype is `Object.prototype` or `null`. Class instances,
 * `Error`s, `Date`s, DOM nodes and `MediaStream`s are left alone — cloning them would destroy
 * the representation the console renders them with, and none of them is a credential carrier
 * in this codebase.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false
  const proto: unknown = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

/**
 * Deep-copy `value`, replacing the value of any sensitive key with {@link REDACTED}.
 *
 * Returns a copy — the caller's object is never mutated. Cycles resolve to `'[circular]'`.
 */
export function redact(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (depth > MAX_REDACT_DEPTH) return value

  if (Array.isArray(value)) {
    if (seen.has(value)) return '[circular]'
    seen.add(value)
    return value.map((item) => redact(item, depth + 1, seen))
  }

  if (!isPlainObject(value)) return value

  if (seen.has(value)) return '[circular]'
  seen.add(value)

  const out: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value)) {
    out[key] = isSensitiveKey(key) ? REDACTED : redact(item, depth + 1, seen)
  }
  return out
}

class Logger {
  private config: LoggerConfig = {
    level: 'info',
    prefix: '[Kwami]',
  }

  setLevel(level: LogLevel): void {
    this.config.level = level
  }

  setPrefix(prefix: string): void {
    this.config.prefix = prefix
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level]
  }

  /**
   * Redaction happens here rather than at the call sites so that no future `logger.info(config)`
   * can reintroduce the leak. It runs only once the level check has passed, so a suppressed log
   * costs nothing.
   */
  private scrub(args: unknown[]): unknown[] {
    return args.map((arg) => redact(arg))
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.config.prefix, ...this.scrub(args))
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.config.prefix, ...this.scrub(args))
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.config.prefix, ...this.scrub(args))
    }
  }

  error(...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.config.prefix, ...this.scrub(args))
    }
  }
}

export const logger = new Logger()
