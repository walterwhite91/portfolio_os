import { NextRequest } from 'next/server';
import { getSession } from '@/security/auth';
import { educationService } from '@/core/services/index';
import { apiSuccess, apiError, apiCatch } from '@/core/api-response';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return apiError('Unauthorized', 401);
        const data = await educationService.getAll();
        return apiSuccess(data);
    } catch (error) {
        return apiCatch(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return apiError('Unauthorized', 401);
        const body = await req.json();
        const data = await educationService.create(body, session.username);
        return apiSuccess(data, 201);
    } catch (error) {
        return apiCatch(error);
    }
}
