'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AdminLoginModalProps {
    onClose: () => void;
}

export default function AdminLoginModal({ onClose }: AdminLoginModalProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (data.success) {
                router.push('/admin');
            } else {
                setError('Invalid credentials');
                setPassword('');
                setLoading(false);
            }
        } catch {
            setError('Connection failed');
            setPassword('');
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="w-full max-w-sm bg-black border border-green-900/50 p-6 font-mono"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="mb-6">
                        <h2 className="text-green-500 text-sm font-bold tracking-widest">ACCESS_CONTROL</h2>
                        <div className="h-px bg-green-900/50 mt-2" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-900/20 border border-red-900/50 text-red-500 p-2 text-xs text-center mb-4">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-xs text-green-700 mb-1 tracking-wider">USERNAME</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setError(null);
                                }}
                                className="w-full bg-black border border-green-900/50 text-green-100 p-2 text-sm font-mono focus:outline-none focus:border-green-500 transition-colors"
                                autoFocus
                                autoComplete="off"
                                maxLength={64}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-green-700 mb-1 tracking-wider">PASSWORD</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError(null);
                                }}
                                className="w-full bg-black border border-green-900/50 text-green-100 p-2 text-sm font-mono focus:outline-none focus:border-green-500 transition-colors"
                                maxLength={128}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-900/20 border border-green-900/50 text-green-500 p-2 text-xs hover:bg-green-900/40 transition-colors uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    AUTHENTICATING...
                                </>
                            ) : (
                                '[ AUTHENTICATE ]'
                            )}
                        </button>
                    </form>

                    <button
                        onClick={onClose}
                        className="w-full mt-3 text-xs text-gray-600 hover:text-gray-400 transition-colors"
                    >
                        CANCEL
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
