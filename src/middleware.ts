import { NextRequest, NextResponse } from 'next/server';

// Cookie name — inlined here to avoid importing auth.ts (uses Node crypto, incompatible with Edge)
const COOKIE_NAME = 'pos_session';

// Paths that require authentication
const PROTECTED_PATHS = ['/admin', '/api/admin'];
// Paths explicitly excluded from protection (public read access)
// Note: branding + visual have public GET but admin-only PUT (enforced in route handlers)
const EXCLUDED_PATHS = ['/api/admin/login', '/api/admin/branding', '/api/admin/visual'];

function isProtected(pathname: string): boolean {
    return PROTECTED_PATHS.some(p => pathname.startsWith(p));
}

function isExcluded(pathname: string): boolean {
    return EXCLUDED_PATHS.some(p => pathname === p);
}

// Lightweight session verification for middleware (edge runtime)
// We only check cookie existence + basic structure here.
// Full HMAC signature verification happens in the API route handlers.
function hasSessionCookie(req: NextRequest): boolean {
    const cookie = req.cookies.get(COOKIE_NAME);
    if (!cookie?.value) return false;
    // Basic structure check: base64.signature
    const parts = cookie.value.split('.');
    return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Skip excluded paths
    if (isExcluded(pathname)) {
        return addSecurityHeaders(NextResponse.next());
    }

    // Check protected paths
    if (isProtected(pathname)) {
        if (!hasSessionCookie(req)) {
            // Stealth: redirect to home, not to a login page
            if (pathname.startsWith('/api/')) {
                return addSecurityHeaders(
                    NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
                );
            }
            return addSecurityHeaders(
                NextResponse.redirect(new URL('/', req.url))
            );
        }
    }

    return addSecurityHeaders(NextResponse.next());
}

function addSecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    return response;
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/admin/:path*',
    ],
};
