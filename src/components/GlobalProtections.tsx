'use client';

import { useEffect } from 'react';

export default function GlobalProtections({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // Disable right-click globally
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    return (
        <div className="select-none h-full w-full">
            {children}
        </div>
    );
}
