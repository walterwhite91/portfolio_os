import { NextRequest } from 'next/server';
import { socialsService } from '@/core/services/index';
import { apiSuccess, apiCatch } from '@/core/api-response';

export async function GET() {
    try {
        const data = await socialsService.getAll();
        return apiSuccess(data);
    } catch (error) {
        return apiCatch(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Extract session logic would ideally wrap here, but middleware handles Auth.
        // For audit logs, we'll pass 'admin' (mocking session context handled inside service if we tracked cookies explicitly)
        const data = await socialsService.create(body, 'admin');
        return apiSuccess(data, 201);
    } catch (error) {
        return apiCatch(error);
    }
}
