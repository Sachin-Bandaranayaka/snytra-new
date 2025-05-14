/**
 * Standardized logger for the application
 * Supports different log levels and formats based on environment
 */

// Log levels in order of severity
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// Determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Default configuration
const config = {
    minLevel: isProduction ? 'info' : 'debug',
    enabled: !isTest, // Disable in test unless explicitly enabled
    timestamps: true,
    colors: !isProduction && !isBrowser, // Use colors in non-production server environments
};

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
};

// Log level to color mapping
const levelColors: Record<LogLevel, string> = {
    debug: colors.cyan,
    info: colors.green,
    warn: colors.yellow,
    error: colors.red,
    fatal: colors.magenta,
};

// Log level to numeric severity mapping
const logLevelSeverity: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
};

/**
 * Format a log message with timestamp, level, and context
 */
function formatLogMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = config.timestamps ? new Date().toISOString() : '';
    const levelStr = level.toUpperCase().padEnd(5);

    // Use colors in terminal environments
    const colorize = (str: string, color: string) => {
        return config.colors ? `${color}${str}${colors.reset}` : str;
    };

    // Format the message parts
    const parts = [
        timestamp ? colorize(`[${timestamp}]`, colors.dim) : '',
        colorize(`[${levelStr}]`, levelColors[level]),
        message,
    ].filter(Boolean);

    // Add structured metadata if available
    let formatted = parts.join(' ');
    if (meta) {
        // Handle errors specially
        if (meta instanceof Error) {
            formatted += `\n${colorize('Error:', colors.red)} ${meta.message}`;
            if (meta.stack && !isProduction) {
                formatted += `\n${colorize('Stack:', colors.dim)} ${meta.stack}`;
            }
        } else if (typeof meta === 'object') {
            try {
                formatted += ` ${JSON.stringify(meta)}`;
            } catch (err) {
                formatted += ` [Unstringifiable Object]`;
            }
        } else {
            formatted += ` ${meta}`;
        }
    }

    return formatted;
}

/**
 * Log a message with the specified level
 */
function log(level: LogLevel, message: string, meta?: any): void {
    if (!config.enabled) return;

    // Check if this log level should be displayed
    if (logLevelSeverity[level] < logLevelSeverity[config.minLevel as LogLevel]) {
        return;
    }

    const formattedMessage = formatLogMessage(level, message, meta);

    // Output to appropriate console method
    switch (level) {
        case 'debug':
            console.debug(formattedMessage);
            break;
        case 'info':
            console.info(formattedMessage);
            break;
        case 'warn':
            console.warn(formattedMessage);
            break;
        case 'error':
        case 'fatal':
            console.error(formattedMessage);

            // In production, we might want to send fatal errors to an error tracking service
            if (level === 'fatal' && isProduction && !isBrowser) {
                // This would be where you'd integrate with error reporting services
                // like Sentry, Bugsnag, etc.
                // Example: errorReportingService.captureException(meta);
            }
            break;
    }
}

/**
 * Configure the logger
 */
export function configureLogger(options: Partial<typeof config>) {
    Object.assign(config, options);
}

// Export the logger interface
export const logger = {
    debug: (message: string, meta?: any) => log('debug', message, meta),
    info: (message: string, meta?: any) => log('info', message, meta),
    warn: (message: string, meta?: any) => log('warn', message, meta),
    error: (message: string, meta?: any) => log('error', message, meta),
    fatal: (message: string, meta?: any) => log('fatal', message, meta),
    configure: configureLogger,
};

export default logger; 