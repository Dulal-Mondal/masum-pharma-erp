import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Format number as Bangladeshi Taka */
export function formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return '৳0';
    return `৳${amount.toLocaleString('en-BD', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

/** Format date to display format */
export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/** Get today's date as YYYY-MM-DD string */
export function today(): string {
    return new Date().toISOString().split('T')[0];
}

/** Get first and last day of current month */
export function currentMonthRange() {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
        startDate: first.toISOString().split('T')[0],
        endDate: last.toISOString().split('T')[0],
    };
}