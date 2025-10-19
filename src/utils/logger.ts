/**
 * Centralized logging utility for the Briconomy application
 * 
 * This logger provides:
 * - Conditional logging based on environment
 * - Different log levels (debug, info, warn, error)
 * - Consistent formatting
 * - Easy to enable/disable for production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  prefix?: string;
}

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      enabled: true, // Always enabled for now, can be controlled via config
      level: 'debug',
      prefix: '[Briconomy]',
      ...config
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    return levels[level] >= levels[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const prefix = this.config.prefix || '';
    const contextStr = context ? ` [${context}]` : '';
    return `${timestamp} ${prefix}${contextStr} [${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, context?: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, context), ...args);
    }
  }

  info(message: string, context?: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context), ...args);
    }
  }

  warn(message: string, context?: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context), ...args);
    }
  }

  error(message: string, context?: string, error?: Error, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, context), error || '', ...args);
    }
  }

  // Convenience method for API calls
  api(method: string, endpoint: string, status?: number, duration?: number): void {
    const message = `${method} ${endpoint}${status ? ` - ${status}` : ''}${duration ? ` (${duration}ms)` : ''}`;
    this.debug(message, 'API');
  }

  // Convenience method for component lifecycle
  component(name: string, action: string, ...args: unknown[]): void {
    this.debug(`${name} ${action}`, 'Component', ...args);
  }

  // Convenience method for business logic
  business(action: string, context?: string, ...args: unknown[]): void {
    this.debug(action, context || 'Business', ...args);
  }
}

// Create default logger instance
export const logger = new Logger();

// Create logger factory for specific contexts
export const createLogger = (context: string, config?: Partial<LoggerConfig>) => {
  return new Logger({
    ...config,
    prefix: `[Briconomy:${context}]`
  });
};

// Export types for custom logger creation
export type { LogLevel, LoggerConfig };
export { Logger };