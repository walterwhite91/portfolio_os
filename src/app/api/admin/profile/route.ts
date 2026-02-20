import { NextRequest } from 'next/server';
import { getSession } from '@/security/auth';
import { profileService } from '@/core/services/index';
import { apiSuccess, apiError, apiCatch } from '@/core/api-response';

// GET — fetch profile
export async function GET() {
    try {
        const session = await getSession();
        if (!session) return apiError('Unauthorized', 401);
        const data = await profileService.get();
        return apiSuccess(data);
    } catch (error) {
        return apiCatch(error);
    }
}

// PUT — update profile (singleton)
export async function PUT(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return apiError('Unauthorized', 401);
        const body = await req.json();
        const data = await profileService.update(body, session.username);
        return apiSuccess(data);
    } catch (error) {
        return apiCatch(error);
    }
}
