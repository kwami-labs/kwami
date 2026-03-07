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

  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.config.prefix, ...args)
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.config.prefix, ...args)
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.config.prefix, ...args)
    }
  }

  error(...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.config.prefix, ...args)
    }
  }
}

export const logger = new Logger()
