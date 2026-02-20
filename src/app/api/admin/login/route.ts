import { NextRequest } from 'next/server';
import { validateCredentials, setSessionCookie } from '@/security/auth';
import { isRateLimited, resetRateLimit } from '@/security/rate-limit';
import { LoginInputSchema } from '@/core/validators/schemas';
import { auditService } from '@/core/services/index';
import { apiSuccess, apiError } from '@/core/api-response';
import { logger } from '@/core/logger';

export async function POST(req: NextRequest) {
    try {
        // Rate limit check
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || 'unknown';

        if (isRateLimited(ip)) {
            // Silently return failure — no hints to attackers
            return apiSuccess({ success: false });
        }

        const body = await req.json();

        // Zod validation — strict schema check
        const parsed = LoginInputSchema.safeParse(body);
        if (!parsed.success) {
            return apiSuccess({ success: false });
        }

        const { username, password } = parsed.data;
        const valid = await validateCredentials(username, password);

        if (!valid) {
            logger.warn('Failed login attempt', { ip, username });
            await auditService.log('login.failed', username, `Failed login from ${ip}`, ip);
            return apiError('Invalid credentials', 401);
        }

        // Success — set cookie and reset rate limit
        await setSessionCookie(username);
        resetRateLimit(ip);

        logger.info('Successful login', { ip, username });
        await auditService.log('login.success', username, `Successful login from ${ip}`, ip);

        return apiSuccess({ success: true });
    } catch (error) {
        logger.error('Login error', { error: String(error) });
        return apiSuccess({ success: false });
    }
}
