// ── Core Error System ──────────────────────────────────────
// Centralized error handling for Portfolio OS

export enum ErrorCode {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    DB_ERROR = 'DB_ERROR',
    RATE_LIMITED = 'RATE_LIMITED',
    INTERNAL = 'INTERNAL',
    BAD_REQUEST = 'BAD_REQUEST',
    SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

const STATUS_MAP: Record<ErrorCode, number> = {
    [ErrorCode.VALIDATION_ERROR]: 400,
    [ErrorCode.BAD_REQUEST]: 400,
    [ErrorCode.UNAUTHORIZED]: 401,
    [ErrorCode.FORBIDDEN]: 403,
    [ErrorCode.NOT_FOUND]: 404,
    [ErrorCode.RATE_LIMITED]: 429,
    [ErrorCode.DB_ERROR]: 500,
    [ErrorCode.INTERNAL]: 500,
    [ErrorCode.SERVICE_UNAVAILABLE]: 503,
};

export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly status: number;
    public readonly details?: unknown;

    constructor(code: ErrorCode, message: string, details?: unknown) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.status = STATUS_MAP[code];
        this.details = details;
    }

    static validation(message: string, details?: unknown) {
        return new AppError(ErrorCode.VALIDATION_ERROR, message, details);
    }

    static notFound(resource: string) {
        return new AppError(ErrorCode.NOT_FOUND, `${resource} not found`);
    }

    static unauthorized(message = 'Authentication required') {
        return new AppError(ErrorCode.UNAUTHORIZED, message);
    }

    static forbidden(message = 'Access denied') {
        return new AppError(ErrorCode.FORBIDDEN, message);
    }

    static db(message: string, details?: unknown) {
        return new AppError(ErrorCode.DB_ERROR, message, details);
    }

    static rateLimited() {
        return new AppError(ErrorCode.RATE_LIMITED, 'Too many requests');
    }

    static internal(message = 'Internal server error') {
        return new AppError(ErrorCode.INTERNAL, message);
    }

    static serviceUnavailable(message = 'Service unavailable') {
        return new AppError(ErrorCode.SERVICE_UNAVAILABLE, message);
    }
}

/**
 * Extract a safe error response from any thrown value.
 * Used in API route catch blocks.
 */
export function handleApiError(error: unknown): {
    code: ErrorCode;
    message: string;
    status: number;
} {
    if (error instanceof AppError) {
        return {
            code: error.code,
            message: error.message,
            status: error.status,
        };
    }

    // Unknown error — don't leak details
    console.error('[UNHANDLED]', error);
    return {
        code: ErrorCode.INTERNAL,
        message: 'An unexpected error occurred',
        status: 500,
    };
}
