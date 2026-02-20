'use client';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="w-full max-w-lg p-8 border border-red-500/50 bg-black/90 font-mono text-center">
                <div className="text-red-500 text-6xl font-bold mb-4 animate-pulse">
                    ⚠ SYSTEM_ERROR
                </div>
                <div className="h-px bg-red-900/50 my-4" />
                <p className="text-red-400 text-sm mb-2">
                    CRITICAL FAULT DETECTED IN RUNTIME
                </p>
                <p className="text-red-700 text-xs mb-6 break-all">
                    {error.message || 'Unknown error occurred'}
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="bg-red-900/20 border border-red-500 text-red-500 px-6 py-2 hover:bg-red-500 hover:text-black transition-all text-sm"
                    >
                        [ RETRY ]
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-green-900/20 border border-green-500 text-green-500 px-6 py-2 hover:bg-green-500 hover:text-black transition-all text-sm"
                    >
                        [ HOME ]
                    </button>
                </div>
            </div>
        </div>
    );
}
