/**
 * Logger utility for the KWAMI core library
 * 
 * Provides configurable logging levels:
 * - NOLOGS: No logs at all (default)
 * - ERROR: Only errors
 * - WARNING: Warnings and errors
 * - INFO: All logs (info, warnings, errors)
 */

export enum LogLevel {
  NOLOGS = 0,
  ERROR = 1,
  WARNING = 2,
  INFO = 3,
}

class Logger {
  private level: LogLevel = LogLevel.NOLOGS;

  /**
   * Set the logging level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get the current logging level
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Log an error message
   */
  error(...args: unknown[]): void {
    if (this.level >= LogLevel.ERROR) {
      console.error(...args);
    }
  }

  /**
   * Log a warning message
   */
  warn(...args: unknown[]): void {
    if (this.level >= LogLevel.WARNING) {
      console.warn(...args);
    }
  }

  /**
   * Log an info message
   */
  info(...args: unknown[]): void {
    if (this.level >= LogLevel.INFO) {
      console.log(...args);
    }
  }

  /**
   * Log a debug message (alias for info)
   */
  debug(...args: unknown[]): void {
    this.info(...args);
  }
}

// Export singleton instance
export const logger = new Logger();

