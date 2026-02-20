export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black font-mono">
            <div className="text-green-500 text-sm mb-8 space-y-1 animate-pulse">
                <p>&gt; Initializing kernel modules...</p>
                <p>&gt; Loading system configuration...</p>
                <p>&gt; Establishing secure connection...</p>
                <p className="text-green-700">&gt; Please wait...</p>
            </div>
            <div className="w-48 h-1 bg-green-900/30 overflow-hidden">
                <div className="h-full bg-green-500 animate-[loading_1.5s_ease-in-out_infinite]" />
            </div>
        </div>
    );
}
