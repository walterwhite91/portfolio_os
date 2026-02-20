import { getSession } from '@/security/auth';
import { visualConfigService } from '@/core/services/index';
import { apiSuccess, apiError, apiCatch } from '@/core/api-response';
import { NextRequest } from 'next/server';

// GET — fetch visual config (public read for theming)
export async function GET() {
    try {
        const data = await visualConfigService.get();
        return apiSuccess(data);
    } catch (error) {
        return apiCatch(error);
    }
}

// PUT — update visual config (admin only)
export async function PUT(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return apiError('Unauthorized', 401);
        const body = await req.json();
        const data = await visualConfigService.update(body, session.username);
        return apiSuccess(data);
    } catch (error) {
        return apiCatch(error);
    }
}
