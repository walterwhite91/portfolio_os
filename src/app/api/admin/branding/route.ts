import { NextRequest } from 'next/server';
import { getSession } from '@/security/auth';
import { brandingService } from '@/core/services/index';
import { apiSuccess, apiError, apiCatch } from '@/core/api-response';

// GET — fetch branding config (public read for landing page)
export async function GET() {
    try {
        const data = await brandingService.get();
        return apiSuccess(data);
    } catch (error) {
        return apiCatch(error);
    }
}

// PUT — update branding config (admin only)
export async function PUT(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return apiError('Unauthorized', 401);
        const body = await req.json();
        const data = await brandingService.update(body, session.username);
        return apiSuccess(data);
    } catch (error) {
        return apiCatch(error);
    }
}
