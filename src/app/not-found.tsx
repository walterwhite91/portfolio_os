import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-green-500 font-mono p-8">
            <div className="max-w-lg w-full border border-green-900 bg-black/90 p-8 space-y-6 relative overflow-hidden">
                {/* Scanline overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />

                <div className="relative z-10 space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-6xl font-bold text-green-500 tracking-wider glow-text">
                            404
                        </h1>
                        <p className="text-xl text-green-600 tracking-widest">
                            PATH_NOT_FOUND
                        </p>
                    </div>

                    <div className="border border-green-900/50 p-4 bg-green-950/10">
                        <div className="text-sm text-green-700 space-y-1">
                            <p>&gt; ls: cannot access requested path</p>
                            <p>&gt; Permission denied or path does not exist</p>
                            <p>&gt; Check your coordinates and try again</p>
                        </div>
                    </div>

                    <div className="text-xs text-green-800 space-y-1">
                        <p>$ suggest: return to root directory</p>
                        <p>$ hint: type &apos;help&apos; for available commands</p>
                    </div>

                    <Link
                        href="/"
                        className="inline-block bg-green-900/20 border border-green-500 text-green-500 px-6 py-2 hover:bg-green-500 hover:text-black transition-all text-sm tracking-wider"
                    >
                        [ cd / ]
                    </Link>
                </div>
            </div>
        </div>
    );
}
