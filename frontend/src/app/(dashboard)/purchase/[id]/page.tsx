'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { purchaseApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { usePrint } from '@/hooks/usePrint';
import PrintLayout from '@/components/print/PrintLayout';
import PrintButton from '@/components/print/PrintButton';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { Purchase } from '@/types';

export default function PurchaseDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { printRef, triggerPrint } = usePrint();

    const { data: purchase, isLoading } = useQuery({
        queryKey: ['purchase', id],
        queryFn: () => purchaseApi.getById(Number(id)).then((r) => r.data.data as Purchase),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 size={24} className="animate-spin text-gray-300" />
            </div>
        );
    }

    if (!purchase) {
        return (
            <div className="text-center py-24 text-gray-400">Purchase not found</div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900">Purchase Invoice</h1>
                </div>
                <PrintButton onPrint={triggerPrint} label="Print Invoice" />
            </div>

            <PrintLayout
                ref={printRef}
                title="Purchase Invoice"
                subtitle={`Invoice: ${purchase.invoiceNo ?? 'N/A'} | Company: ${purchase.company.companyName}`}
                dateRange={{ startDate: purchase.purchaseDate, endDate: purchase.purchaseDate }}
            >
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Invoice Meta */}
                    <div className="px-6 py-5 border-b border-gray-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase mb-1">Date</p>
                                <p className="text-sm font-semibold text-gray-900">{formatDate(purchase.purchaseDate)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase mb-1">Company</p>
                                <p className="text-sm font-semibold text-gray-900">{purchase.company.companyName}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase mb-1">Invoice No.</p>
                                <p className="text-sm font-semibold text-gray-900">{purchase.invoiceNo || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase mb-1">Total Amount</p>
                                <p className="text-lg font-bold text-blue-700">{formatCurrency(Number(purchase.totalAmount))}</p>
                            </div>
                        </div>
                        {purchase.note && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-400">Note: <span className="text-gray-600">{purchase.note}</span></p>
                            </div>
                        )}
                    </div>

                    {/* Items Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm print-table">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Product Name</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {purchase.items.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-3 text-gray-400">{idx + 1}</td>
                                        <td className="px-5 py-3 font-medium text-gray-900">{item.productName}</td>
                                        <td className="px-5 py-3 text-right text-gray-700">{Number(item.quantity).toLocaleString()}</td>
                                        <td className="px-5 py-3 text-right text-gray-700">{formatCurrency(Number(item.unitPrice))}</td>
                                        <td className="px-5 py-3 text-right font-semibold text-gray-900">{formatCurrency(Number(item.amount))}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50 border-t-2 border-gray-200">
                                    <td colSpan={4} className="px-5 py-4 text-sm font-bold text-gray-700 text-right">
                                        Grand Total ({purchase.items.length} items)
                                    </td>
                                    <td className="px-5 py-4 text-right text-lg font-bold text-blue-700">
                                        {formatCurrency(Number(purchase.totalAmount))}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </PrintLayout>
        </div>
    );
}