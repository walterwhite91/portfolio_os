'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[SYSTEM_FAULT]', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-green-500 font-mono p-8">
            <div className="max-w-lg w-full border border-red-900 bg-black/90 p-8 space-y-6 relative overflow-hidden">
                {/* Scanline overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />

                <div className="relative z-10 space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-red-500 tracking-wider animate-pulse">
                            ⚠ SYSTEM_FAULT
                        </h1>
                        <p className="text-xs text-red-700 font-mono">
                            KERNEL PANIC — UNRECOVERABLE ERROR DETECTED
                        </p>
                    </div>

                    <div className="border border-red-900/50 p-4 bg-red-950/20">
                        <p className="text-sm text-red-400 break-all">
                            <span className="text-red-600">ERROR: </span>
                            {error.message || 'An unexpected error occurred'}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-red-800 mt-2">
                                DIGEST: {error.digest}
                            </p>
                        )}
                    </div>

                    <div className="text-xs text-green-800 space-y-1">
                        <p>&gt; Attempting automatic recovery...</p>
                        <p>&gt; System state preserved</p>
                        <p>&gt; Manual intervention available</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={reset}
                            className="bg-green-900/20 border border-green-500 text-green-500 px-6 py-2 hover:bg-green-500 hover:text-black transition-all text-sm tracking-wider"
                        >
                            [ RETRY ]
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="bg-red-900/20 border border-red-800 text-red-500 px-6 py-2 hover:bg-red-500 hover:text-black transition-all text-sm tracking-wider"
                        >
                            [ REBOOT ]
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
