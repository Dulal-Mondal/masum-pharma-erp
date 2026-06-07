'use client';

import { Printer } from 'lucide-react';

interface PrintButtonProps {
    onPrint: () => void;
    label?: string;
    disabled?: boolean;
}

export default function PrintButton({
    onPrint,
    label = 'Print / Save PDF',
    disabled = false,
}: PrintButtonProps) {
    return (
        <button
            onClick={onPrint}
            disabled={disabled}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
            <Printer size={15} />
            {label}
        </button>
    );
}