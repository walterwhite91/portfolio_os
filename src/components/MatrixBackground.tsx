'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface MatrixBackgroundProps {
    /** Large text displayed in background (e.g. "MIMANSH") */
    text?: string;
    /** Matrix rain color */
    color?: string;
    /** Animation speed multiplier (0.1 – 5.0) */
    speed?: number;
    /** Character density multiplier (0.1 – 2.0) */
    density?: number;
    /** Overall opacity (0 – 1) */
    opacity?: number;
    /** Whether the effect is enabled */
    enabled?: boolean;
}

// Characters used in the matrix rain
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#$%^&*()_+-=[]{}|;:,.<>?';

export default function MatrixBackground({
    text = 'MIMANSH',
    color = '#22c55e',
    speed = 1.0,
    density = 0.8,
    opacity = 0.3,
    enabled = true,
}: MatrixBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const columnsRef = useRef<number[]>([]);
    const lastTimeRef = useRef<number>(0);
    const isVisibleRef = useRef(true);

    // Parse hex color to rgba
    const hexToRgba = useCallback((hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }, []);

    const draw = useCallback(
        (ctx: CanvasRenderingContext2D, width: number, height: number, timestamp: number) => {
            // Frame rate control based on speed
            const interval = Math.max(30, 80 - speed * 15);
            if (timestamp - lastTimeRef.current < interval) {
                animationRef.current = requestAnimationFrame((t) => draw(ctx, width, height, t));
                return;
            }
            lastTimeRef.current = timestamp;

            // Fade trail
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);

            // Draw the large background text
            const textFontSize = Math.min(width * 0.12, 160);
            ctx.save();
            ctx.font = `900 ${textFontSize}px "JetBrains Mono", "Courier New", monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Glow effect layers
            ctx.shadowColor = color;
            ctx.shadowBlur = 40;
            ctx.fillStyle = hexToRgba(color, 0.06);
            ctx.fillText(text, width / 2, height / 2);

            ctx.shadowBlur = 20;
            ctx.fillStyle = hexToRgba(color, 0.04);
            ctx.fillText(text, width / 2, height / 2);

            ctx.shadowBlur = 0;
            ctx.fillStyle = hexToRgba(color, 0.03);
            ctx.fillText(text, width / 2, height / 2);
            ctx.restore();

            // Matrix rain
            const fontSize = 14;
            const columns = columnsRef.current;
            ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

            for (let i = 0; i < columns.length; i++) {
                const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
                const x = i * fontSize;
                const y = columns[i] * fontSize;

                // Vary brightness for depth effect
                const brightness = 0.3 + Math.random() * 0.7;
                ctx.fillStyle = hexToRgba(color, brightness * 0.8);

                // Leading character is brighter
                if (Math.random() > 0.98) {
                    ctx.fillStyle = hexToRgba('#ffffff', 0.9);
                }

                ctx.fillText(char, x, y);

                // Reset column or advance
                if (y > height && Math.random() > 0.975) {
                    columns[i] = 0;
                } else {
                    columns[i]++;
                }
            }
        },
        [color, speed, text, hexToRgba]
    );

    useEffect(() => {
        if (!enabled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Check reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            // Draw static version: just the text, no rain
            const resize = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const textFontSize = Math.min(canvas.width * 0.12, 160);
                ctx.font = `900 ${textFontSize}px "JetBrains Mono", "Courier New", monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = hexToRgba(color, 0.08);
                ctx.fillText(text, canvas.width / 2, canvas.height / 2);
            };
            resize();
            window.addEventListener('resize', resize);
            return () => window.removeEventListener('resize', resize);
        }

        // Setup canvas
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Initialize columns based on density
            const fontSize = 14;
            const colCount = Math.ceil((canvas.width / fontSize) * density);
            columnsRef.current = Array(colCount)
                .fill(0)
                .map(() => Math.floor(Math.random() * (canvas.height / fontSize)));
        };

        resize();

        // Clear canvas initially
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Page Visibility API: pause when tab is not visible
        const handleVisibility = () => {
            isVisibleRef.current = !document.hidden;
            if (isVisibleRef.current) {
                lastTimeRef.current = 0;
                animationRef.current = requestAnimationFrame((t) =>
                    draw(ctx, canvas.width, canvas.height, t)
                );
            } else {
                cancelAnimationFrame(animationRef.current);
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('resize', resize);

        // Start animation
        animationRef.current = requestAnimationFrame((t) =>
            draw(ctx, canvas.width, canvas.height, t)
        );

        return () => {
            cancelAnimationFrame(animationRef.current);
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('resize', resize);
        };
    }, [enabled, color, speed, density, text, draw, hexToRgba]);

    if (!enabled) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{ opacity }}
            aria-hidden="true"
        />
    );
}
