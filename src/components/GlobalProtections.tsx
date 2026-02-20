'use client';

import { useEffect } from 'react';

export default function GlobalProtections({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // Disable right-click globally
        document.addEventListener('contextmenu', handleContextMenu);
        // Disable text selection globally without messing up DOM flex roots
        document.body.classList.add('select-none');

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.body.classList.remove('select-none');
        };
    }, []);

    return <>{children}</>;
}
