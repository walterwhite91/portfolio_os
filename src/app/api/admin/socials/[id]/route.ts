import { NextRequest } from 'next/server';
import { socialsService } from '@/core/services/index';
import { apiSuccess, apiCatch } from '@/core/api-response';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const body = await req.json();
        const data = await socialsService.update(id, body, 'admin');
        return apiSuccess(data);
    } catch (error) {
        return apiCatch(error);
    }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        await socialsService.delete(id, 'admin');
        return apiSuccess({ deleted: true });
    } catch (error) {
        return apiCatch(error);
    }
}
