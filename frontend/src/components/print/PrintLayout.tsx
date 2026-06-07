'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';

interface PrintLayoutProps {
    title: string;
    subtitle?: string;
    dateRange?: { startDate: string; endDate: string };
    children: React.ReactNode;
}

/**
 * PrintLayout — wraps report content with a professional print header.
 * This div is what gets printed. Everything outside it is hidden by CSS.
 */
const PrintLayout = forwardRef<HTMLDivElement, PrintLayoutProps>(
    ({ title, subtitle, dateRange, children }, ref) => {
        const [printedAt, setPrintedAt] = useState('');

        useEffect(() => {
            setPrintedAt(new Date().toLocaleString('en-BD'));
        }, []);

        return (
            <div ref={ref} className="print-layout">
                {/* Print Header — only visible when printing */}
                <div className="print-header">
                    <div className="print-shop-name">Masum Pharma Ltd. Management System</div>
                    <div className="print-report-title">{title}</div>
                    {subtitle && <div className="print-subtitle">{subtitle}</div>}
                    {dateRange && (
                        <div className="print-date-range">
                            Period: {formatDate(dateRange.startDate)} — {formatDate(dateRange.endDate)}
                        </div>
                    )}
                    <div className="print-generated">Printed: {printedAt}</div>
                    <div className="print-divider" />
                </div>

                {/* Report Content */}
                <div className="print-content">{children}</div>

                {/* Print Footer */}
                <div className="print-footer">
                    <span>Masum Pharma Ltd. Management System</span>
                    <span className="print-page-no">Page <span className="pageNumber" /></span>
                </div>
            </div>
        );
    }
);

PrintLayout.displayName = 'PrintLayout';
export default PrintLayout;