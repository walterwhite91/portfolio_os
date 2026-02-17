/**
 * In-memory rate limiter keyed by IP address.
 * Allows `maxAttempts` within a `windowMs` window.
 * Resets on successful login.
 */

interface RateLimitEntry {
    attempts: number;
    firstAttempt: number;
}

const store = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry) {
        store.set(ip, { attempts: 1, firstAttempt: now });
        return false;
    }

    // Window expired — reset
    if (now - entry.firstAttempt > WINDOW_MS) {
        store.set(ip, { attempts: 1, firstAttempt: now });
        return false;
    }

    // Within window
    if (entry.attempts >= MAX_ATTEMPTS) {
        return true; // Rate limited
    }

    entry.attempts += 1;
    return false;
}

export function resetRateLimit(ip: string): void {
    store.delete(ip);
}

// Periodic cleanup every 30 minutes to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of store.entries()) {
        if (now - entry.firstAttempt > WINDOW_MS) {
            store.delete(ip);
        }
    }
}, 30 * 60 * 1000);
