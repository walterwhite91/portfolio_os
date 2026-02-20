// ── Typed API Response Wrapper ──────────────────────────────
// All API routes return this shape for consistency.

import { NextResponse } from 'next/server';
import { ErrorCode, handleApiError } from './errors/errors';

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    code?: ErrorCode;
}

/** Return a success JSON response */
export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json({ success: true, data }, { status });
}

/** Return an error JSON response */
export function apiError(
    message: string,
    status = 500,
    code: ErrorCode = ErrorCode.INTERNAL
): NextResponse<ApiResponse<never>> {
    return NextResponse.json({ success: false, error: message, code }, { status });
}

/** Catch any error and return a typed API response */
export function apiCatch(error: unknown): NextResponse<ApiResponse<never>> {
    const { code, message, status } = handleApiError(error);
    return NextResponse.json({ success: false, error: message, code }, { status });
}
