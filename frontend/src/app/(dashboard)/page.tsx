'use client';

import { useQuery } from '@tanstack/react-query';
import { dailyAccountApi } from '@/lib/api';
import { formatCurrency, today } from '@/lib/utils';
import StatCard from '@/components/dashboard/StatCard';
import {
    Wallet,
    ShoppingCart,
    Receipt,
    ArrowDownLeft,
    ArrowUpRight,
    TrendingUp,
    DollarSign,
    Banknote,
    RefreshCcw,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import type { DashboardData } from '@/types';

export default function DashboardPage() {
    const todayDate = today();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['dashboard', todayDate],
        queryFn: () => dailyAccountApi.getDashboard(todayDate).then((r) => r.data.data as DashboardData),
        refetchInterval: 30000, // refresh every 30 seconds
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-48">
                <RefreshCcw size={20} className="animate-spin text-gray-400" />
            </div>
        );
    }

    const stats = [
        {
            label: "Today's Opening",
            value: formatCurrency(data?.openingBalance),
            icon: Wallet,
            colorClass: 'bg-gray-100 text-gray-600',
        },
        {
            label: "Today's Purchase",
            value: formatCurrency(data?.purchaseAmount),
            icon: ShoppingCart,
            colorClass: 'bg-orange-50 text-orange-600',
        },
        {
            label: "Today's Expense",
            value: formatCurrency(data?.expenseAmount),
            icon: Receipt,
            colorClass: 'bg-red-50 text-red-600',
        },
        {
            label: "Today's Cash In",
            value: formatCurrency(data?.cashInAmount),
            icon: ArrowDownLeft,
            colorClass: 'bg-green-50 text-green-600',
        },
        {
            label: "Today's Cash Out",
            value: formatCurrency(data?.cashOutAmount),
            icon: ArrowUpRight,
            colorClass: 'bg-purple-50 text-purple-600',
        },
        {
            label: "Today's Sales",
            value: data?.salesAmount !== null ? formatCurrency(data?.salesAmount) : 'Pending close',
            icon: DollarSign,
            colorClass: 'bg-blue-50 text-blue-600',
        },
        {
            label: "Today's Profit",
            value: data?.profitAmount !== null ? formatCurrency(data?.profitAmount) : 'Pending close',
            icon: TrendingUp,
            colorClass: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Current Cash',
            value: formatCurrency(data?.currentCash),
            icon: Banknote,
            colorClass: 'bg-blue-600 text-white',
        },
    ];

    return (
        <div>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Today: {todayDate}</p>
                </div>
                <div className="flex items-center gap-3">
                    {data?.isClosed ? (
                        <span className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
                            <CheckCircle size={14} />
                            Day Closed
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
                            <AlertCircle size={14} />
                            Day Open
                        </span>
                    )}
                    <button
                        onClick={() => refetch()}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
                    >
                        <RefreshCcw size={14} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                ))}
            </div>

            {/* Closing Banner */}
            {!data?.isClosed && (
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-amber-800">Daily closing pending</p>
                        <p className="text-xs text-amber-600 mt-0.5">
                            Complete daily closing at end of day to calculate today&apos;s sales and profit.
                        </p>
                    </div>
                    <a
                        href="/daily-closing"
                        className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        Go to Closing
                    </a>
                </div>
            )}
        </div>
    );
}