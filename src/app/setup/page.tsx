'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, Shield, Key, Database, Terminal } from 'lucide-react';

type Step = 'welcome' | 'credentials' | 'keyword' | 'database' | 'review' | 'complete';

export default function SetupPage() {
    const [step, setStep] = useState<Step>('welcome');
    const [config, setConfig] = useState({
        adminUsername: 'admin',
        adminPassword: '',
        adminPasswordConfirm: '',
        adminKeyword: '__admin_access__',
        supabaseUrl: '',
        supabaseAnonKey: '',
    });
    const [error, setError] = useState('');
    const [initializing, setInitializing] = useState(false);
    const [checking, setChecking] = useState(true);

    // Check if system is already initialized
    useEffect(() => {
        fetch('/api/setup/status')
            .then(r => r.json())
            .then(data => {
                if (data.initialized) {
                    window.location.href = '/';
                }
                setChecking(false);
            })
            .catch(() => setChecking(false));
    }, []);

    const handleNext = () => {
        setError('');
        switch (step) {
            case 'welcome':
                setStep('credentials');
                break;
            case 'credentials':
                if (!config.adminPassword || config.adminPassword.length < 8) {
                    setError('Password must be at least 8 characters.');
                    return;
                }
                if (config.adminPassword !== config.adminPasswordConfirm) {
                    setError('Passwords do not match.');
                    return;
                }
                setStep('keyword');
                break;
            case 'keyword':
                if (!config.adminKeyword.trim()) {
                    setError('Keyword cannot be empty.');
                    return;
                }
                setStep('database');
                break;
            case 'database':
                setStep('review');
                break;
            case 'review':
                handleInitialize();
                break;
        }
    };

    const handleInitialize = async () => {
        setInitializing(true);
        setError('');
        try {
            const res = await fetch('/api/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: config.adminUsername,
                    password: config.adminPassword,
                    keyword: config.adminKeyword,
                    supabaseUrl: config.supabaseUrl,
                    supabaseAnonKey: config.supabaseAnonKey,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setStep('complete');
            } else {
                setError(data.error || 'Initialization failed.');
            }
        } catch {
            setError('Network error. Please try again.');
        }
        setInitializing(false);
    };

    if (checking) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-green-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono">
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg border border-green-500 bg-black p-6 shadow-[0_0_30px_rgba(34,197,94,0.15)] relative"
            >
                {/* Progress */}
                <div className="flex gap-1 mb-6">
                    {(['welcome', 'credentials', 'keyword', 'database', 'review', 'complete'] as Step[]).map((s, i) => (
                        <div key={s} className={`h-1 flex-1 transition-colors ${(['welcome', 'credentials', 'keyword', 'database', 'review', 'complete'].indexOf(step) >= i)
                                ? 'bg-green-500' : 'bg-green-900/30'
                            }`} />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

                        {step === 'welcome' && (
                            <div className="space-y-4">
                                <Terminal className="text-green-500 w-10 h-10" />
                                <h1 className="text-2xl font-bold text-green-500 tracking-widest">PORTFOLIO OS</h1>
                                <h2 className="text-sm text-green-700">STEALTH EDITION — SETUP WIZARD</h2>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Welcome. This wizard will configure your Portfolio OS installation.
                                    You&apos;ll set up admin credentials, a stealth access keyword, and
                                    optionally connect a Supabase database.
                                </p>
                            </div>
                        )}

                        {step === 'credentials' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="text-green-500 w-5 h-5" />
                                    <h2 className="text-sm font-bold text-green-500 tracking-wider">ADMIN_CREDENTIALS</h2>
                                </div>
                                <InputField label="USERNAME" value={config.adminUsername}
                                    onChange={v => setConfig({ ...config, adminUsername: v })} />
                                <InputField label="PASSWORD" type="password" value={config.adminPassword}
                                    onChange={v => setConfig({ ...config, adminPassword: v })} placeholder="Min 8 characters" />
                                <InputField label="CONFIRM_PASSWORD" type="password" value={config.adminPasswordConfirm}
                                    onChange={v => setConfig({ ...config, adminPasswordConfirm: v })} />
                            </div>
                        )}

                        {step === 'keyword' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Key className="text-green-500 w-5 h-5" />
                                    <h2 className="text-sm font-bold text-green-500 tracking-wider">STEALTH_KEYWORD</h2>
                                </div>
                                <p className="text-xs text-gray-500">
                                    This keyword, when typed as visitor name, reveals the admin login. Keep it secret.
                                </p>
                                <InputField label="ADMIN_KEYWORD" value={config.adminKeyword}
                                    onChange={v => setConfig({ ...config, adminKeyword: v })} />
                            </div>
                        )}

                        {step === 'database' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Database className="text-green-500 w-5 h-5" />
                                    <h2 className="text-sm font-bold text-green-500 tracking-wider">DATABASE (OPTIONAL)</h2>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">
                                    Connect Supabase to persist data. Leave empty to use static fallback data.
                                </p>
                                <InputField label="SUPABASE_URL" value={config.supabaseUrl}
                                    onChange={v => setConfig({ ...config, supabaseUrl: v })} placeholder="https://xxx.supabase.co" />
                                <InputField label="SUPABASE_ANON_KEY" value={config.supabaseAnonKey}
                                    onChange={v => setConfig({ ...config, supabaseAnonKey: v })} placeholder="eyJhbGci..." />
                            </div>
                        )}

                        {step === 'review' && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold text-green-500 tracking-wider">REVIEW_CONFIG</h2>
                                <div className="space-y-2 text-xs">
                                    <ReviewRow label="Admin User" value={config.adminUsername} />
                                    <ReviewRow label="Password" value={'•'.repeat(config.adminPassword.length)} />
                                    <ReviewRow label="Keyword" value={config.adminKeyword} />
                                    <ReviewRow label="Database" value={config.supabaseUrl || 'Not configured (static mode)'} />
                                </div>
                            </div>
                        )}

                        {step === 'complete' && (
                            <div className="space-y-4 text-center">
                                <Check className="text-green-500 w-12 h-12 mx-auto" />
                                <h2 className="text-xl font-bold text-green-500 tracking-wider">SYSTEM_INITIALIZED</h2>
                                <p className="text-xs text-gray-500">
                                    Portfolio OS is configured. You can now access the admin panel by entering
                                    your keyword in the visitor form.
                                </p>
                                <div className="bg-green-900/10 border border-green-900/50 p-3 text-xs text-green-400">
                                    <p>IMPORTANT: Add these to your <code>.env.local</code> file:</p>
                                    <pre className="mt-2 text-left text-[10px] text-gray-400 overflow-x-auto">
                                        {`ADMIN_USERNAME=${config.adminUsername}
ADMIN_KEYWORD=${config.adminKeyword}
# Password hash is stored in system config`}
                                    </pre>
                                </div>
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="bg-green-900/20 border border-green-500 text-green-500 px-6 py-2 text-xs hover:bg-green-900/40 transition-colors tracking-wider"
                                >
                                    [ LAUNCH_OS ]
                                </button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {error && <p className="text-red-500 text-xs mt-3 animate-pulse">{error}</p>}

                {step !== 'complete' && (
                    <div className="flex justify-between mt-8">
                        {step !== 'welcome' ? (
                            <button onClick={() => {
                                const steps: Step[] = ['welcome', 'credentials', 'keyword', 'database', 'review'];
                                const idx = steps.indexOf(step);
                                if (idx > 0) setStep(steps[idx - 1]);
                            }} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                                ← BACK
                            </button>
                        ) : <div />}
                        <button
                            onClick={handleNext}
                            disabled={initializing}
                            className="bg-green-900/20 border border-green-500 text-green-500 px-6 py-2 text-xs hover:bg-green-900/40 transition-colors flex items-center gap-2 tracking-wider"
                        >
                            {initializing ? <><Loader2 className="w-3 h-3 animate-spin" /> INITIALIZING...</> :
                                step === 'review' ? '[ INITIALIZE ]' : 'NEXT →'}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

function InputField({ label, value, onChange, type, placeholder }: {
    label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
    return (
        <div>
            <label className="block text-xs text-green-700 mb-1 tracking-wider">{label}</label>
            <input
                type={type || 'text'}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-black border border-green-900/50 text-green-100 p-2 text-sm font-mono focus:outline-none focus:border-green-500 transition-colors placeholder-green-900/50"
            />
        </div>
    );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between border-b border-green-900/20 py-1">
            <span className="text-green-700">{label}</span>
            <span className="text-green-300">{value}</span>
        </div>
    );
}
