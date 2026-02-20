// ── Logging Abstraction ────────────────────────────────────
// Structured logging with audit trail support.
// Future: swap console with external service (Datadog, Sentry, etc.)

type LogLevel = 'info' | 'warn' | 'error' | 'audit';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, unknown>;
}

function formatEntry(entry: LogEntry): string {
    const ctx = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    return `[${entry.level.toUpperCase()}] ${entry.timestamp} — ${entry.message}${ctx}`;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        context,
    };

    const formatted = formatEntry(entry);

    switch (level) {
        case 'error':
            console.error(formatted);
            break;
        case 'warn':
            console.warn(formatted);
            break;
        default:
            console.log(formatted);
    }
}

export const logger = {
    info: (msg: string, ctx?: Record<string, unknown>) => log('info', msg, ctx),
    warn: (msg: string, ctx?: Record<string, unknown>) => log('warn', msg, ctx),
    error: (msg: string, ctx?: Record<string, unknown>) => log('error', msg, ctx),
    audit: (action: string, ctx?: Record<string, unknown>) => log('audit', `[AUDIT] ${action}`, ctx),
};
