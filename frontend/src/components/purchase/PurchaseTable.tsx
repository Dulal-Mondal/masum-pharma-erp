'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { purchaseApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { Purchase } from '@/types';

interface PurchaseTableProps {
    purchases: Purchase[];
    onEdit: (purchase: Purchase) => void;
}

export default function PurchaseTable({ purchases, onEdit }: PurchaseTableProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: number) => purchaseApi.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchases'] }),
    });

    const total = purchases.reduce((sum, p) => sum + Number(p.totalAmount), 0);

    if (purchases.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
                <p className="text-gray-400 text-sm">No purchases found for this date range</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Table Summary Bar */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <span className="text-xs font-medium text-gray-500">
                    {purchases.length} invoice{purchases.length > 1 ? 's' : ''} found
                </span>
                <span className="text-sm font-bold text-gray-900">
                    Total: {formatCurrency(total)}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-100">
                        <tr>
                            <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Date</th>
                            <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Invoice</th>
                            <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Company</th>
                            <th className="text-center px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Items</th>
                            <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Amount</th>
                            <th className="px-5 py-3 w-24"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {purchases.map((p) => (
                            <tr
                                key={p.id}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                                    {formatDate(p.purchaseDate)}
                                </td>
                                <td className="px-5 py-3 text-gray-500">
                                    {p.invoiceNo ? (
                                        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                                            {p.invoiceNo}
                                        </span>
                                    ) : (
                                        <span className="text-gray-300">—</span>
                                    )}
                                </td>
                                <td className="px-5 py-3 font-medium text-gray-900">
                                    {p.company.companyName}
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                        {p.items.length} items
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                                    {formatCurrency(Number(p.totalAmount))}
                                </td>
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-1 justify-end">
                                        {/* View detail */}
                                        <button
                                            onClick={() => router.push(`/purchase/${p.id}`)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="View Invoice"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        {/* Edit */}
                                        <button
                                            onClick={() => onEdit(p)}
                                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        {/* Delete */}
                                        <button
                                            onClick={() => {
                                                if (confirm(`Delete invoice from ${p.company.companyName}?`)) {
                                                    deleteMutation.mutate(p.id);
                                                }
                                            }}
                                            disabled={deleteMutation.isPending}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                    {/* Footer total row */}
                    <tfoot>
                        <tr className="border-t-2 border-gray-200 bg-gray-50">
                            <td colSpan={4} className="px-5 py-3 text-xs font-semibold text-gray-500 text-right uppercase tracking-wide">
                                Grand Total
                            </td>
                            <td className="px-5 py-3 text-right text-base font-bold text-gray-900">
                                {formatCurrency(total)}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}