import { NextRequest } from 'next/server';
import { getSession } from '@/security/auth';
import { projectsService } from '@/core/services/index';
import { apiSuccess, apiError, apiCatch } from '@/core/api-response';

// PUT — update project by ID
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session) return apiError('Unauthorized', 401);

        const { id } = await params;
        const body = await req.json();
        const data = await projectsService.update(id, body, session.username);
        return apiSuccess(data);
    } catch (error) {
        return apiCatch(error);
    }
}

// DELETE — delete project by ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session) return apiError('Unauthorized', 401);

        const { id } = await params;
        await projectsService.delete(id, session.username);
        return apiSuccess({ deleted: true });
    } catch (error) {
        return apiCatch(error);
    }
}
