'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ──────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
    toast: () => { },
});

export const useToast = () => useContext(ToastContext);

// ── Provider ───────────────────────────────────────────────

export default function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    const colorMap: Record<ToastType, string> = {
        success: 'border-green-500 text-green-400',
        error: 'border-red-500 text-red-400',
        info: 'border-cyan-500 text-cyan-400',
    };

    const iconMap: Record<ToastType, string> = {
        success: '✓',
        error: '✗',
        info: 'ℹ',
    };

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            className={`pointer-events-auto bg-black/90 backdrop-blur-sm border px-4 py-2 font-mono text-xs flex items-center gap-2 min-w-[200px] ${colorMap[t.type]}`}
                        >
                            <span className="text-sm">{iconMap[t.type]}</span>
                            <span>{t.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
