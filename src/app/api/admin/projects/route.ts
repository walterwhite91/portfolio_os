import { NextRequest } from 'next/server';
import { getSession } from '@/security/auth';
import { projectsService } from '@/core/services/index';
import { apiSuccess, apiError, apiCatch } from '@/core/api-response';

// GET — list all projects
export async function GET() {
    try {
        const session = await getSession();
        if (!session) return apiError('Unauthorized', 401);

        const data = await projectsService.getAll();
        return apiSuccess(data);
    } catch (error) {
        return apiCatch(error);
    }
}

// POST — create new project
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return apiError('Unauthorized', 401);

        const body = await req.json();
        const data = await projectsService.create(body, session.username);
        return apiSuccess(data, 201);
    } catch (error) {
        return apiCatch(error);
    }
}
