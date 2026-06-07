// 'use client';

// import { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { purchaseApi, companyApi } from '@/lib/api';
// import { formatCurrency, formatDate, today } from '@/lib/utils';
// import { Plus, Trash2, Eye, Search, RefreshCcw } from 'lucide-react';
// import PurchaseForm from '@/components/purchase/PurchaseForm';
// import type { Purchase, Company } from '@/types';

// export default function PurchasePage() {
//     const [showForm, setShowForm] = useState(false);
//     const [editItem, setEditItem] = useState<Purchase | null>(null);
//     const [search, setSearch] = useState({ startDate: today(), endDate: today(), companyId: '' });
//     const queryClient = useQueryClient();

//     const { data: companiesData } = useQuery({
//         queryKey: ['companies'],
//         queryFn: () => companyApi.getAll().then((r) => r.data.data as Company[]),
//     });

//     const { data, isLoading, refetch } = useQuery({
//         queryKey: ['purchases', search],
//         queryFn: () =>
//             purchaseApi
//                 .getAll({
//                     startDate: search.startDate,
//                     endDate: search.endDate,
//                     companyId: search.companyId || undefined,
//                 })
//                 .then((r) => r.data.data),
//     });

//     const deleteMutation = useMutation({
//         mutationFn: (id: number) => purchaseApi.delete(id),
//         onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchases'] }),
//     });

//     const purchases: Purchase[] = data?.purchases ?? [];
//     const total = purchases.reduce((sum: number, p: Purchase) => sum + Number(p.totalAmount), 0);

//     if (showForm || editItem) {
//         return (
//             <PurchaseForm
//                 companies={companiesData ?? []}
//                 editData={editItem}
//                 onClose={() => {
//                     setShowForm(false);
//                     setEditItem(null);
//                     queryClient.invalidateQueries({ queryKey: ['purchases'] });
//                 }}
//             />
//         );
//     }

//     return (
//         <div>
//             {/* Header */}
//             <div className="flex items-center justify-between mb-6">
//                 <h1 className="text-xl font-semibold text-gray-900">Purchase Management</h1>
//                 <button
//                     onClick={() => setShowForm(true)}
//                     className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
//                 >
//                     <Plus size={16} />
//                     New Purchase
//                 </button>
//             </div>

//             {/* Filters */}
//             <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
//                 <div className="flex flex-wrap gap-3 items-end">
//                     <div>
//                         <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
//                         <input
//                             type="date"
//                             value={search.startDate}
//                             onChange={(e) => setSearch((s) => ({ ...s, startDate: e.target.value }))}
//                             className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
//                         <input
//                             type="date"
//                             value={search.endDate}
//                             onChange={(e) => setSearch((s) => ({ ...s, endDate: e.target.value }))}
//                             className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
//                         <select
//                             value={search.companyId}
//                             onChange={(e) => setSearch((s) => ({ ...s, companyId: e.target.value }))}
//                             className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         >
//                             <option value="">All Companies</option>
//                             {companiesData?.map((c) => (
//                                 <option key={c.id} value={c.id}>
//                                     {c.companyName}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                     <button
//                         onClick={() => refetch()}
//                         className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
//                     >
//                         <Search size={14} />
//                         Search
//                     </button>
//                 </div>
//             </div>

//             {/* Table */}
//             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//                 <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
//                     <span className="text-sm font-medium text-gray-700">
//                         {purchases.length} invoices &mdash; Total: {formatCurrency(total)}
//                     </span>
//                     <button onClick={() => refetch()} className="text-gray-400 hover:text-gray-600">
//                         <RefreshCcw size={14} />
//                     </button>
//                 </div>

//                 {isLoading ? (
//                     <div className="flex items-center justify-center py-16">
//                         <RefreshCcw size={20} className="animate-spin text-gray-300" />
//                     </div>
//                 ) : purchases.length === 0 ? (
//                     <div className="text-center py-16 text-gray-400 text-sm">No purchases found</div>
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-sm">
//                             <thead className="bg-gray-50 border-b border-gray-100">
//                                 <tr>
//                                     <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
//                                     <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Invoice</th>
//                                     <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
//                                     <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Items</th>
//                                     <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
//                                     <th className="px-5 py-3"></th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-50">
//                                 {purchases.map((p) => (
//                                     <tr key={p.id} className="hover:bg-gray-50 transition-colors">
//                                         <td className="px-5 py-3 text-gray-700">{formatDate(p.purchaseDate)}</td>
//                                         <td className="px-5 py-3 text-gray-500">{p.invoiceNo || '—'}</td>
//                                         <td className="px-5 py-3 font-medium text-gray-900">{p.company.companyName}</td>
//                                         <td className="px-5 py-3 text-gray-500">{p.items.length} items</td>
//                                         <td className="px-5 py-3 text-right font-semibold text-gray-900">
//                                             {formatCurrency(Number(p.totalAmount))}
//                                         </td>
//                                         <td className="px-5 py-3">
//                                             <div className="flex items-center gap-2 justify-end">
//                                                 <button
//                                                     onClick={() => setEditItem(p)}
//                                                     className="text-blue-500 hover:text-blue-700 p-1"
//                                                     title="View / Edit"
//                                                 >
//                                                     <Eye size={15} />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => {
//                                                         if (confirm('Delete this purchase?')) deleteMutation.mutate(p.id);
//                                                     }}
//                                                     className="text-red-400 hover:text-red-600 p-1"
//                                                     title="Delete"
//                                                 >
//                                                     <Trash2 size={15} />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }


'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseApi, companyApi } from '@/lib/api';
import { formatCurrency, formatDate, today } from '@/lib/utils';
import { Plus, Trash2, Eye, RefreshCcw } from 'lucide-react';
import PurchaseForm from '@/components/purchase/PurchaseForm';
import type { Purchase, Company } from '@/types';

export default function PurchasePage() {
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<Purchase | null>(null);
    const [search, setSearch] = useState({ startDate: today(), endDate: today(), companyId: '' });
    const queryClient = useQueryClient();

    const { data: companiesData } = useQuery({
        queryKey: ['companies'],
        queryFn: () => companyApi.getAll().then((r) => r.data.data as Company[]),
    });

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['purchases', search],
        queryFn: () =>
            purchaseApi
                .getAll({ startDate: search.startDate, endDate: search.endDate, companyId: search.companyId || undefined })
                .then((r) => r.data.data),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => purchaseApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });

    const handleFormClose = () => {
        setShowForm(false);
        setEditItem(null);
        // Invalidate both purchases list and dashboard stats
        queryClient.invalidateQueries({ queryKey: ['purchases'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['daily-dashboard'] });
    };

    const purchases: Purchase[] = data?.purchases ?? [];
    const total = purchases.reduce((sum: number, p: Purchase) => sum + Number(p.totalAmount), 0);

    if (showForm || editItem) {
        return (
            <PurchaseForm
                companies={companiesData ?? []}
                editData={editItem}
                onClose={handleFormClose}
            />
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Purchase Management</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={16} />
                    New Purchase
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                        <input
                            type="date"
                            value={search.startDate}
                            onChange={(e) => setSearch((s) => ({ ...s, startDate: e.target.value }))}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                        <input
                            type="date"
                            value={search.endDate}
                            onChange={(e) => setSearch((s) => ({ ...s, endDate: e.target.value }))}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
                        <select
                            value={search.companyId}
                            onChange={(e) => setSearch((s) => ({ ...s, companyId: e.target.value }))}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Companies</option>
                            {companiesData?.map((c) => (
                                <option key={c.id} value={c.id}>{c.companyName}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm px-3 py-2 rounded-lg hover:bg-gray-50"
                    >
                        <RefreshCcw size={14} />
                        Search
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                        {purchases.length} invoices — Total: {formatCurrency(total)}
                    </span>
                    <button onClick={() => refetch()} className="text-gray-400 hover:text-gray-600">
                        <RefreshCcw size={14} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <RefreshCcw size={20} className="animate-spin text-gray-300" />
                    </div>
                ) : purchases.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-sm">No purchases found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Invoice</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Items</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-5 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {purchases.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 text-gray-700">{formatDate(p.purchaseDate)}</td>
                                        <td className="px-5 py-3 text-gray-500">{p.invoiceNo || '—'}</td>
                                        <td className="px-5 py-3 font-medium text-gray-900">{p.company.companyName}</td>
                                        <td className="px-5 py-3 text-gray-500">{p.items.length} items</td>
                                        <td className="px-5 py-3 text-right font-semibold text-gray-900">
                                            {formatCurrency(Number(p.totalAmount))}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2 justify-end">
                                                <button
                                                    onClick={() => setEditItem(p)}
                                                    className="text-blue-500 hover:text-blue-700 p-1"
                                                    title="View / Edit"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete this purchase?')) deleteMutation.mutate(p.id);
                                                    }}
                                                    className="text-red-400 hover:text-red-600 p-1"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}