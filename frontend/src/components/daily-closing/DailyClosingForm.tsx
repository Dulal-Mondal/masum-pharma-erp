'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyAccountApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Calculator, Loader2, CheckCircle } from 'lucide-react';
import type { DashboardData } from '@/types';

interface DailyClosingFormProps {
    date: string;
    data: DashboardData;
}

export default function DailyClosingForm({ date, data }: DailyClosingFormProps) {
    const [closingBalance, setClosingBalance] = useState('');
    const [error, setError] = useState('');
    const queryClient = useQueryClient();

    const closingMutation = useMutation({
        mutationFn: ({ date, balance }: { date: string; balance: number }) =>
            dailyAccountApi.performClosing(date, balance),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['daily-dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            setError('');
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message;
            setError(msg || 'Failed to perform closing');
        },
    });

    // Live preview calculation
    const preview = (() => {
        if (!closingBalance) return null;
        const cb = parseFloat(closingBalance);
        if (isNaN(cb) || cb < 0) return null;

        const sales =
            cb +
            (data.purchaseAmount || 0) +
            (data.expenseAmount || 0) +
            (data.cashOutAmount || 0) -
            (data.openingBalance || 0) -
            (data.cashInAmount || 0);

        const profit =
            Math.max(0, sales) - (data.purchaseAmount || 0) - (data.expenseAmount || 0);

        return { sales: Math.max(0, sales), profit };
    })();

    const handleSubmit = () => {
        const balance = parseFloat(closingBalance);
        if (isNaN(balance) || balance < 0) {
            setError('Please enter a valid closing balance');
            return;
        }
        closingMutation.mutate({ date, balance });
    };

    if (data.isClosed) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle size={18} className="text-green-600" />
                    <h2 className="text-sm font-semibold text-green-800">Day Closed Successfully</h2>
                </div>
                <div className="space-y-3">
                    {[
                        { label: 'Closing Balance', value: formatCurrency(data.closingBalance) },
                        { label: "Today's Sales", value: formatCurrency(data.salesAmount) },
                        { label: "Today's Profit", value: formatCurrency(data.profitAmount), big: true },
                    ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center">
                            <p className="text-sm text-green-700">{item.label}</p>
                            <p className={`font-bold ${item.big ? 'text-xl text-green-800' : 'text-sm text-green-800'}`}>
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-xs text-green-600 font-medium mb-1">Sales Formula:</p>
                    <p className="text-xs text-green-500 font-mono">
                        Sales = Closing + Purchase + Expense + CashOut - Opening - CashIn
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Enter Closing Balance</h2>
            <p className="text-xs text-gray-500 mb-4">
                Count cash in hand and enter the exact amount. System will calculate sales and profit.
            </p>

            <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                    Closing Cash Balance (৳)
                </label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={closingBalance}
                    onChange={(e) => setClosingBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Live preview */}
            {preview && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Calculator size={13} className="text-blue-600" />
                        <p className="text-xs font-medium text-blue-700">Preview Calculation</p>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-blue-600">Estimated Sales:</span>
                        <span className="font-semibold text-blue-800">{formatCurrency(preview.sales)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span className="text-blue-600">Estimated Profit:</span>
                        <span className={`font-semibold ${preview.profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                            {formatCurrency(preview.profit)}
                        </span>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                    <p className="text-xs text-red-600">{error}</p>
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={closingMutation.isPending || !closingBalance}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
            >
                {closingMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                Confirm Daily Closing
            </button>
        </div>
    );
}