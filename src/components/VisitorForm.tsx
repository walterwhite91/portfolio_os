'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { recordVisitor, checkAdminKeyword } from '@/app/actions';
import AdminLoginModal from '@/security/AdminLoginModal';

interface VisitorFormProps {
    onComplete: (name: string, mode: 'cli' | 'gui') => void;
}

export default function VisitorForm({ onComplete }: VisitorFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mode, setMode] = useState<'cli' | 'gui'>('cli');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAdminLogin, setShowAdminLogin] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('IDENTITY_REQUIRED: PLEASE ENTER YOUR NAME');
            return;
        }

        setLoading(true);

        // Stealth admin keyword check
        const isAdminKeyword = await checkAdminKeyword(name.trim());
        if (isAdminKeyword) {
            setLoading(false);
            setName('');
            setShowAdminLogin(true);
            return;
        }

        // Normal visitor flow
        try {
            await recordVisitor(name, email);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
        onComplete(name.trim(), mode);
    };

    if (showAdminLogin) {
        return <AdminLoginModal onClose={() => setShowAdminLogin(false)} />;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-6 border border-green-500 bg-black shadow-[0_0_20px_rgba(34,197,94,0.2)] relative overflow-hidden"
            >
                {/* Scanline effect for modal */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0" />

                <h2 className="text-xl font-bold text-green-500 mb-6 tracking-wider glitch-text">
                    &gt; IDENTIFY_USER
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div>
                        <label className="block text-xs text-green-700 mb-1">NAME [REQUIRED]</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black border border-green-800 text-green-500 p-2 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-900 placeholder-green-900"
                            placeholder="John Doe"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-green-700 mb-1">EMAIL [OPTIONAL]</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black border border-green-800 text-green-500 p-2 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-900 placeholder-green-900"
                            placeholder="john@example.com"
                        />
                        <p className="text-[10px] text-green-800 mt-1">
                            * Used only for visitor analytics. No spam.
                        </p>
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setMode('cli')}
                            className={`p-3 border text-sm transition-all flex flex-col items-center justify-center gap-1 ${mode === 'cli'
                                ? 'bg-green-900/30 border-green-500 text-green-400'
                                : 'bg-black border-green-900 text-green-700 hover:border-green-700'
                                }`}
                        >
                            <span className="font-bold">[ CLI Mode ]</span>
                            <span className="text-[10px] opacity-70">Terminal Experience</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('gui')}
                            className={`p-3 border text-sm transition-all flex flex-col items-center justify-center gap-1 ${mode === 'gui'
                                ? 'bg-green-900/30 border-green-500 text-green-400'
                                : 'bg-black border-green-900 text-green-700 hover:border-green-700'
                                }`}
                        >
                            <span className="font-bold">[ GUI Mode ]</span>
                            <span className="text-[10px] opacity-70">Modern Dashboard</span>
                        </button>
                    </div>

                    {error && (
                        <p className="text-red-500 text-xs animate-pulse">
                            Error: {error}
                        </p>
                    )}

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-900/20 border border-green-500 text-green-500 px-6 py-2 hover:bg-green-500 hover:text-black transition-all flex items-center gap-2 group"
                        >
                            {loading ? (
                                <span className="animate-pulse">PROCESSING...</span>
                            ) : (
                                <>
                                    <span>ACCESS_TERMINAL</span>
                                    <span className="group-hover:translate-x-1 transition-transform">&gt;</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
