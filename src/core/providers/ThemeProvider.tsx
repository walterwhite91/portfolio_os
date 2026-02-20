'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { BrandingConfig, VisualConfig } from '@/types';

// ── Default Configs ────────────────────────────────────────

const DEFAULT_VISUAL: VisualConfig = {
    id: '',
    terminal_color: '#22c55e',
    accent_color: '#06b6d4',
    font_family: 'JetBrains Mono, monospace',
    dark_mode: true,
    ascii_header: 'PORTFOLIO OS',
    boot_enabled: true,
    visitor_form_enabled: true,
    default_mode: 'cli',
    created_at: '',
    updated_at: '',
};

const DEFAULT_BRANDING: BrandingConfig = {
    id: '',
    display_name: 'MIMANSH',
    background_name_text: 'MIMANSH',
    matrix_enabled: true,
    matrix_speed: 1.0,
    matrix_density: 0.8,
    matrix_color: '#22c55e',
    matrix_opacity: 0.3,
    background_mode: 'matrix',
    created_at: '',
    updated_at: '',
};

// ── Context ────────────────────────────────────────────────

interface ThemeContextType {
    visual: VisualConfig;
    branding: BrandingConfig;
    isLoading: boolean;
    refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
    visual: DEFAULT_VISUAL,
    branding: DEFAULT_BRANDING,
    isLoading: true,
    refreshTheme: async () => { },
});

export const useTheme = () => useContext(ThemeContext);
export const useBranding = () => useContext(ThemeContext).branding;

// ── Provider ───────────────────────────────────────────────

interface ThemeProviderProps {
    children: React.ReactNode;
    initialVisual?: VisualConfig;
    initialBranding?: BrandingConfig;
}

export default function ThemeProvider({
    children,
    initialVisual,
    initialBranding,
}: ThemeProviderProps) {
    const [visual, setVisual] = useState<VisualConfig>(initialVisual ?? DEFAULT_VISUAL);
    const [branding, setBranding] = useState<BrandingConfig>(initialBranding ?? DEFAULT_BRANDING);
    const [isLoading, setIsLoading] = useState(!initialVisual);

    const refreshTheme = async () => {
        try {
            const [visualRes, brandingRes] = await Promise.all([
                fetch('/api/admin/visual').then((r) => r.json()),
                fetch('/api/admin/branding').then((r) => r.json()),
            ]);
            if (visualRes.success && visualRes.data) setVisual(visualRes.data);
            if (brandingRes.success && brandingRes.data) setBranding(brandingRes.data);
        } catch {
            // Silent fail — keep defaults
        }
    };

    // Load config from API on mount if no initial data provided
    useEffect(() => {
        if (initialVisual && initialBranding) {
            setIsLoading(false);
            return;
        }
        refreshTheme().finally(() => setIsLoading(false));
    }, [initialVisual, initialBranding]);

    // Inject CSS custom properties dynamically
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--terminal-color', visual.terminal_color);
        root.style.setProperty('--accent-color', visual.accent_color);
        root.style.setProperty('--font-family', visual.font_family);
    }, [visual]);

    return (
        <ThemeContext.Provider value={{ visual, branding, isLoading, refreshTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
