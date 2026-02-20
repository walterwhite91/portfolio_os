export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-green-500 font-mono">
            <div className="space-y-4 text-center">
                <div className="text-xl tracking-widest animate-pulse glow-text">
                    LOADING_SYSTEM
                </div>
                <div className="w-64 h-1 bg-green-900/30 mx-auto overflow-hidden">
                    <div
                        className="h-full bg-green-500"
                        style={{ animation: 'loading 2s ease-in-out infinite' }}
                    />
                </div>
                <div className="text-xs text-green-800 space-y-1">
                    <p>&gt; Initializing modules...</p>
                    <p>&gt; Establishing connection...</p>
                </div>
            </div>
        </div>
    );
}
