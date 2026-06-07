'use client';

import { useRef, useCallback } from 'react';

/**
 * usePrint hook
 * Returns a ref to attach to the printable element and a triggerPrint function.
 * Uses window.print() with a print-only CSS class approach — no external lib needed.
 */
export function usePrint() {
    const printRef = useRef<HTMLDivElement>(null);

    const triggerPrint = useCallback(() => {
        if (!printRef.current) return;

        // Mark the print target
        printRef.current.classList.add('print-target');
        document.body.classList.add('printing');

        window.print();

        // Cleanup after print dialog closes
        const cleanup = () => {
            printRef.current?.classList.remove('print-target');
            document.body.classList.remove('printing');
            window.removeEventListener('afterprint', cleanup);
        };

        window.addEventListener('afterprint', cleanup);
        // Fallback cleanup (some browsers don't fire afterprint)
        setTimeout(cleanup, 3000);
    }, []);

    return { printRef, triggerPrint };
}