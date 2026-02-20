'use client';

import React from 'react';

type SkeletonVariant = 'text' | 'card' | 'row' | 'circle' | 'block';

interface LoadingSkeletonProps {
    variant?: SkeletonVariant;
    count?: number;
    className?: string;
}

const VARIANT_STYLES: Record<SkeletonVariant, string> = {
    text: 'h-4 w-3/4 rounded-sm',
    card: 'h-32 w-full rounded-sm',
    row: 'h-10 w-full rounded-sm',
    circle: 'h-12 w-12 rounded-full',
    block: 'h-24 w-full rounded-sm',
};

export default function LoadingSkeleton({
    variant = 'text',
    count = 1,
    className = '',
}: LoadingSkeletonProps) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`
                        ${VARIANT_STYLES[variant]}
                        bg-green-900/10 border border-green-900/20
                        animate-pulse
                    `}
                    style={{
                        animationDelay: `${i * 150}ms`,
                    }}
                >
                    {/* Inner glow line for matrix effect */}
                    <div
                        className="h-full w-full bg-gradient-to-r from-transparent via-green-900/20 to-transparent"
                        style={{
                            animation: 'skeleton-sweep 2s ease-in-out infinite',
                            animationDelay: `${i * 200}ms`,
                        }}
                    />
                </div>
            ))}
        </div>
    );
}

// Convenience presets
export function CardSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="border border-green-900/30 p-4 space-y-3">
                    <LoadingSkeleton variant="text" />
                    <LoadingSkeleton variant="text" className="w-1/2" />
                    <LoadingSkeleton variant="block" />
                </div>
            ))}
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-2">
            <LoadingSkeleton variant="row" />
            <div className="border-t border-green-900/20" />
            <LoadingSkeleton variant="row" count={rows} />
        </div>
    );
}
