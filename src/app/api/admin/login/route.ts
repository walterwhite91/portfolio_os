import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, setSessionCookie } from '@/security/auth';
import { isRateLimited, resetRateLimit } from '@/security/rate-limit';

export async function POST(req: NextRequest) {
    try {
        // Rate limit check
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || 'unknown';

        if (isRateLimited(ip)) {
            // Silently return failure — no hints
            return NextResponse.json({ success: false }, { status: 200 });
        }

        const body = await req.json();
        const { username, password } = body;

        if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
            return NextResponse.json({ success: false }, { status: 200 });
        }

        // Sanitize inputs (max length, no control chars)
        if (username.length > 64 || password.length > 128) {
            return NextResponse.json({ success: false }, { status: 200 });
        }

        const valid = await validateCredentials(username, password);

        if (!valid) {
            // Log failed attempt (to console; DB logging added in Phase 4)
            console.warn(`[AUDIT] Failed login attempt from ${ip} for user: ${username}`);
            return NextResponse.json({ success: false }, { status: 200 });
        }

        // Success — set cookie and reset rate limit
        await setSessionCookie(username);
        resetRateLimit(ip);

        console.log(`[AUDIT] Successful login from ${ip} for user: ${username}`);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('[AUTH] Login error:', error);
        return NextResponse.json({ success: false }, { status: 200 });
    }
}
