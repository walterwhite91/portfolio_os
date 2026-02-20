import { NextRequest } from 'next/server';
import { getSession } from '@/security/auth';
import { educationService } from '@/core/services/index';
import { apiSuccess, apiError, apiCatch } from '@/core/api-response';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session) return apiError('Unauthorized', 401);
        const { id } = await params;
        const body = await req.json();
        const data = await educationService.update(id, body, session.username);
        return apiSuccess(data);
    } catch (error) {
        return apiCatch(error);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session) return apiError('Unauthorized', 401);
        const { id } = await params;
        await educationService.delete(id, session.username);
        return apiSuccess({ deleted: true });
    } catch (error) {
        return apiCatch(error);
    }
}
