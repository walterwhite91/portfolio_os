'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

// ── Types ──────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType, duration?: number) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
}

// ── Context ────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType>({
    toast: () => { },
    success: () => { },
    error: () => { },
    info: () => { },
    warning: () => { },
});

export const useToast = () => useContext(ToastContext);

// ── Styling ────────────────────────────────────────────────

const TYPE_STYLES: Record<ToastType, { border: string; text: string; icon: string; bg: string }> = {
    success: { border: 'border-green-500', text: 'text-green-400', icon: '✓', bg: 'bg-green-950/30' },
    error: { border: 'border-red-500', text: 'text-red-400', icon: '✗', bg: 'bg-red-950/30' },
    info: { border: 'border-cyan-500', text: 'text-cyan-400', icon: 'ℹ', bg: 'bg-cyan-950/30' },
    warning: { border: 'border-yellow-500', text: 'text-yellow-400', icon: '⚠', bg: 'bg-yellow-950/30' },
};

// ── Toast Item ─────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const style = TYPE_STYLES[toast.type];

    return (
        <div
            className={`
                flex items-center gap-3 px-4 py-3 border ${style.border} ${style.bg}
                bg-black/90 backdrop-blur-sm font-mono text-sm
                animate-[toast-in_0.3s_ease-out_forwards]
                cursor-pointer select-none min-w-[280px] max-w-[420px]
                shadow-lg
            `}
            onClick={() => onDismiss(toast.id)}
            role="alert"
        >
            <span className={`${style.text} text-base flex-shrink-0`}>{style.icon}</span>
            <span className={`${style.text} flex-1 break-words`}>{toast.message}</span>
            <span className="text-green-800 text-xs flex-shrink-0 hover:text-green-400 transition-colors">
                [×]
            </span>
        </div>
    );
}

// ── Provider ───────────────────────────────────────────────

export default function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const counterRef = useRef(0);

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
        const id = `toast-${++counterRef.current}-${Date.now()}`;
        const newToast: Toast = { id, message, type, duration };

        setToasts(prev => [...prev.slice(-4), newToast]); // Keep max 5

        if (duration > 0) {
            setTimeout(() => dismiss(id), duration);
        }
    }, [dismiss]);

    const contextValue: ToastContextType = {
        toast: addToast,
        success: useCallback((msg: string) => addToast(msg, 'success'), [addToast]),
        error: useCallback((msg: string) => addToast(msg, 'error', 6000), [addToast]),
        info: useCallback((msg: string) => addToast(msg, 'info'), [addToast]),
        warning: useCallback((msg: string) => addToast(msg, 'warning', 5000), [addToast]),
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}

            {/* Toast Container — bottom-right */}
            {toasts.length > 0 && (
                <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
                    {toasts.map(t => (
                        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
                    ))}
                </div>
            )}
        </ToastContext.Provider>
    );
}
