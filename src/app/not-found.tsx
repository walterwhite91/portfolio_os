import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black font-mono">
            <div className="text-center">
                <div className="text-green-500 text-8xl font-bold mb-2 glow-text">
                    404
                </div>
                <div className="text-green-700 text-lg mb-4 tracking-widest">
                    PATH_NOT_FOUND
                </div>
                <div className="h-px bg-green-900/50 w-48 mx-auto my-6" />
                <p className="text-green-800 text-sm mb-8">
                    The requested resource does not exist in this system.
                </p>
                <Link
                    href="/"
                    className="bg-green-900/20 border border-green-500 text-green-500 px-6 py-2 hover:bg-green-500 hover:text-black transition-all text-sm inline-block"
                >
                    [ RETURN TO TERMINAL ]
                </Link>
            </div>
        </div>
    );
}
