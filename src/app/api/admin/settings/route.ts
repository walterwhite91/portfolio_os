import { NextRequest } from 'next/server';
import { getSession } from '@/security/auth';
import { visualConfigService, systemConfigService } from '@/core/services/index';
import { apiSuccess, apiError, apiCatch } from '@/core/api-response';

// GET — fetch visual settings (tries visual_config table, falls back to system_config)
export async function GET() {
    try {
        const session = await getSession();
        if (!session) return apiError('Unauthorized', 401);
        const data = await visualConfigService.get();
        return apiSuccess(data);
    } catch (error) {
        return apiCatch(error);
    }
}

// PUT — save visual settings
export async function PUT(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return apiError('Unauthorized', 401);
        const body = await req.json();

        // Also persist to legacy system_config for backward compatibility
        try {
            const legacyRows: Record<string, string> = {};
            Object.entries(body).forEach(([key, value]) => {
                legacyRows[`theme_${key}`] = String(value);
            });
            await systemConfigService.set(legacyRows);
        } catch {
            // Legacy write is best-effort
        }

        const data = await visualConfigService.update(body, session.username);
        return apiSuccess(data);
    } catch (error) {
        return apiCatch(error);
    }
}
