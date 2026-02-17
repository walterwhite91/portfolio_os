// Security auth module — used by API routes and middleware
// Do NOT add 'use server' here — this module is imported directly by API route handlers.

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export const COOKIE_NAME = 'pos_session';

// Read env vars lazily to ensure they're available at call time
function getConfig() {
    return {
        SESSION_SECRET: process.env.SESSION_SECRET || 'fallback-dev-secret-change-me',
        SESSION_EXPIRY_HOURS: parseInt(process.env.SESSION_EXPIRY_HOURS || '2', 10),
        ADMIN_USERNAME: process.env.ADMIN_USERNAME || '',
        ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || '',
        ADMIN_KEYWORD: process.env.ADMIN_KEYWORD || '__admin_access__',
    };
}

// ── Credential Validation ──────────────────────────────────
export async function validateCredentials(username: string, password: string): Promise<boolean> {
    const { ADMIN_USERNAME, ADMIN_PASSWORD_HASH } = getConfig();

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH) {
        console.error('[AUTH] Admin credentials not configured in env.');
        return false;
    }

    if (username !== ADMIN_USERNAME) {
        // Constant-time fake comparison to prevent timing attacks
        await bcrypt.compare(password, '$2a$12$fakehashfakehashfakehashfakehashfakehashfakehas');
        return false;
    }

    return bcrypt.compare(password, ADMIN_PASSWORD_HASH);
}

// ── Session Management ─────────────────────────────────────
interface SessionPayload {
    username: string;
    createdAt: number;
    expiresAt: number;
}

function sign(payload: string): string {
    const { SESSION_SECRET } = getConfig();
    const hmac = crypto.createHmac('sha256', SESSION_SECRET);
    hmac.update(payload);
    return hmac.digest('hex');
}

export function createSessionToken(username: string): string {
    const { SESSION_EXPIRY_HOURS } = getConfig();
    const payload: SessionPayload = {
        username,
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000,
    };
    const data = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = sign(data);
    return `${data}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
    try {
        const [data, signature] = token.split('.');
        if (!data || !signature) return null;

        const expectedSignature = sign(data);
        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
            return null;
        }

        const payload: SessionPayload = JSON.parse(Buffer.from(data, 'base64').toString());

        if (Date.now() > payload.expiresAt) {
            return null; // Expired
        }

        return payload;
    } catch {
        return null;
    }
}

// ── Cookie Helpers ─────────────────────────────────────────
export async function setSessionCookie(username: string): Promise<void> {
    const { SESSION_EXPIRY_HOURS } = getConfig();
    const token = createSessionToken(username);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: SESSION_EXPIRY_HOURS * 60 * 60,
        path: '/',
    });
}

export async function clearSessionCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
}

// ── Keyword Check ──────────────────────────────────────────
export async function checkAdminKeyword(input: string): Promise<boolean> {
    const { ADMIN_KEYWORD } = getConfig();
    return input.trim() === ADMIN_KEYWORD;
}

// ── Password Hashing Utility (for setup) ───────────────────
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}
