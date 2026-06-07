// 'use client';

// import { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { cashTransactionApi } from '@/lib/api';
// import { formatCurrency, formatDate, today } from '@/lib/utils';
// import { usePrint } from '@/hooks/usePrint';
// import PrintLayout from '@/components/print/PrintLayout';
// import PrintButton from '@/components/print/PrintButton';
// import { Plus, Trash2, Pencil, RefreshCcw, Loader2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import type { CashTransaction, TransactionType } from '@/types';

// const schema = z.object({
//     transactionDate: z.string().min(1),
//     transactionTypeId: z.coerce.number().int().positive('Select a type'),
//     amount: z.coerce.number().positive('Amount must be positive'),
//     note: z.string().optional(),
// });
// type FormValues = z.infer<typeof schema>;

// export default function CashTransactionsPage() {
//     const [showForm, setShowForm] = useState(false);
//     const [editItem, setEditItem] = useState<CashTransaction | null>(null);
//     const [dateRange, setDateRange] = useState({ startDate: today(), endDate: today() });
//     const queryClient = useQueryClient();
//     const { printRef, triggerPrint } = usePrint();

//     const { data: typesData } = useQuery({
//         queryKey: ['transaction-types'],
//         queryFn: () => cashTransactionApi.getTypes().then((r) => r.data.data as TransactionType[]),
//     });

//     const { data, isLoading, refetch } = useQuery({
//         queryKey: ['cash-transactions', dateRange],
//         queryFn: () =>
//             cashTransactionApi.getAll({ startDate: dateRange.startDate, endDate: dateRange.endDate })
//                 .then((r) => r.data.data),
//     });

//     const deleteMutation = useMutation({
//         mutationFn: (id: number) => cashTransactionApi.delete(id),
//         onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cash-transactions'] }),
//     });

//     const transactions: CashTransaction[] = data?.transactions ?? [];
//     const cashIn = transactions.filter((t) => t.transactionType.transactionDirection === 'IN').reduce((s, t) => s + Number(t.amount), 0);
//     const cashOut = transactions.filter((t) => t.transactionType.transactionDirection === 'OUT').reduce((s, t) => s + Number(t.amount), 0);

//     return (
//         <div>
//             <div className="flex items-center justify-between mb-6">
//                 <h1 className="text-xl font-semibold text-gray-900">Cash Transactions</h1>
//                 <div className="flex items-center gap-2">
//                     <PrintButton onPrint={triggerPrint} disabled={transactions.length === 0} />
//                     <button
//                         onClick={() => { setEditItem(null); setShowForm(true); }}
//                         className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
//                     >
//                         <Plus size={16} />
//                         Add Transaction
//                     </button>
//                 </div>
//             </div>

//             {/* Summary Cards */}
//             <div className="grid grid-cols-3 gap-4 mb-5">
//                 <div className="bg-green-50 border border-green-200 rounded-xl p-4">
//                     <div className="flex items-center gap-2 mb-1">
//                         <ArrowDownLeft size={16} className="text-green-600" />
//                         <p className="text-xs font-medium text-green-700">Total Cash In</p>
//                     </div>
//                     <p className="text-xl font-bold text-green-800">{formatCurrency(cashIn)}</p>
//                 </div>
//                 <div className="bg-red-50 border border-red-200 rounded-xl p-4">
//                     <div className="flex items-center gap-2 mb-1">
//                         <ArrowUpRight size={16} className="text-red-500" />
//                         <p className="text-xs font-medium text-red-700">Total Cash Out</p>
//                     </div>
//                     <p className="text-xl font-bold text-red-700">{formatCurrency(cashOut)}</p>
//                 </div>
//                 <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
//                     <p className="text-xs font-medium text-blue-700 mb-1">Net Flow</p>
//                     <p className={`text-xl font-bold ${cashIn - cashOut >= 0 ? 'text-blue-800' : 'text-red-700'}`}>
//                         {formatCurrency(cashIn - cashOut)}
//                     </p>
//                 </div>
//             </div>

//             {/* Filters */}
//             <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
//                 <div className="flex flex-wrap gap-3 items-end">
//                     <div>
//                         <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
//                         <input
//                             type="date"
//                             value={dateRange.startDate}
//                             onChange={(e) => setDateRange((d) => ({ ...d, startDate: e.target.value }))}
//                             className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
//                         <input
//                             type="date"
//                             value={dateRange.endDate}
//                             onChange={(e) => setDateRange((d) => ({ ...d, endDate: e.target.value }))}
//                             className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                     </div>
//                     <button
//                         onClick={() => refetch()}
//                         className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm px-3 py-2 rounded-lg hover:bg-gray-50"
//                     >
//                         <RefreshCcw size={14} />
//                         Refresh
//                     </button>
//                 </div>
//             </div>

//             {showForm && (
//                 <CashTransactionModal
//                     types={typesData ?? []}
//                     editData={editItem}
//                     onClose={() => { setShowForm(false); setEditItem(null); }}
//                     onSaved={() => {
//                         queryClient.invalidateQueries({ queryKey: ['cash-transactions'] });
//                         setShowForm(false);
//                         setEditItem(null);
//                     }}
//                 />
//             )}

//             <PrintLayout ref={printRef} title="Cash Transaction Report" dateRange={dateRange}>
//                 <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//                     {isLoading ? (
//                         <div className="flex items-center justify-center py-16">
//                             <RefreshCcw size={20} className="animate-spin text-gray-300" />
//                         </div>
//                     ) : (
//                         <div className="overflow-x-auto">
//                             <table className="w-full text-sm print-table">
//                                 <thead>
//                                     <tr>
//                                         <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
//                                         <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
//                                         <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Direction</th>
//                                         <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Note</th>
//                                         <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
//                                         <th className="px-5 py-3 print:hidden"></th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-50">
//                                     {transactions.length === 0 ? (
//                                         <tr>
//                                             <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No transactions found</td>
//                                         </tr>
//                                     ) : (
//                                         transactions.map((t) => (
//                                             <tr key={t.id} className="hover:bg-gray-50">
//                                                 <td className="px-5 py-3 text-gray-700">{formatDate(t.transactionDate)}</td>
//                                                 <td className="px-5 py-3 font-medium text-gray-900">{t.transactionType.transactionName}</td>
//                                                 <td className="px-5 py-3">
//                                                     <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${t.transactionType.transactionDirection === 'IN'
//                                                             ? 'bg-green-100 text-green-700'
//                                                             : 'bg-red-100 text-red-700'
//                                                         }`}>
//                                                         {t.transactionType.transactionDirection === 'IN'
//                                                             ? <><ArrowDownLeft size={11} /> IN</>
//                                                             : <><ArrowUpRight size={11} /> OUT</>
//                                                         }
//                                                     </span>
//                                                 </td>
//                                                 <td className="px-5 py-3 text-gray-500">{t.note || '—'}</td>
//                                                 <td className="px-5 py-3 text-right font-semibold text-gray-900">
//                                                     {formatCurrency(Number(t.amount))}
//                                                 </td>
//                                                 <td className="px-5 py-3 print:hidden">
//                                                     <div className="flex items-center gap-2 justify-end">
//                                                         <button onClick={() => { setEditItem(t); setShowForm(true); }} className="text-blue-400 hover:text-blue-600 p-1">
//                                                             <Pencil size={14} />
//                                                         </button>
//                                                         <button onClick={() => { if (confirm('Delete this transaction?')) deleteMutation.mutate(t.id); }} className="text-red-400 hover:text-red-600 p-1">
//                                                             <Trash2 size={14} />
//                                                         </button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     )}
//                                 </tbody>
//                                 {transactions.length > 0 && (
//                                     <tfoot>
//                                         <tr className="bg-gray-50 border-t-2 border-gray-200">
//                                             <td colSpan={4} className="px-5 py-3 text-sm font-semibold text-gray-700 text-right">
//                                                 In: {formatCurrency(cashIn)} | Out: {formatCurrency(cashOut)}
//                                             </td>
//                                             <td className="px-5 py-3 text-right text-base font-bold text-gray-900">
//                                                 Net: {formatCurrency(cashIn - cashOut)}
//                                             </td>
//                                             <td className="print:hidden"></td>
//                                         </tr>
//                                     </tfoot>
//                                 )}
//                             </table>
//                         </div>
//                     )}
//                 </div>
//             </PrintLayout>
//         </div>
//     );
// }

// function CashTransactionModal({
//     types,
//     editData,
//     onClose,
//     onSaved,
// }: {
//     types: TransactionType[];
//     editData: CashTransaction | null;
//     onClose: () => void;
//     onSaved: () => void;
// }) {
//     const isEdit = !!editData;
//     const [apiError, setApiError] = useState('');

//     const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
//         resolver: zodResolver(schema),
//         defaultValues: editData
//             ? {
//                 transactionDate: editData.transactionDate.split('T')[0],
//                 transactionTypeId: editData.transactionTypeId,
//                 amount: Number(editData.amount),
//                 note: editData.note ?? '',
//             }
//             : { transactionDate: today() },
//     });

//     const onSubmit = async (data: FormValues) => {
//         try {
//             setApiError('');
//             if (isEdit) {
//                 await cashTransactionApi.update(editData!.id, data);
//             } else {
//                 await cashTransactionApi.create(data);
//             }
//             onSaved();
//         } catch (err: unknown) {
//             const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
//             setApiError(msg || 'Failed to save');
//         }
//     };

//     const inTypes = types.filter((t) => t.transactionDirection === 'IN');
//     const outTypes = types.filter((t) => t.transactionDirection === 'OUT');

//     return (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
//                 <div className="px-6 py-4 border-b border-gray-100">
//                     <h2 className="text-base font-semibold text-gray-900">
//                         {isEdit ? 'Edit Transaction' : 'Add Transaction'}
//                     </h2>
//                 </div>
//                 <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
//                     <div>
//                         <label className="block text-xs font-medium text-gray-500 mb-1">Date *</label>
//                         <input type="date" {...register('transactionDate')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                     </div>
//                     <div>
//                         <label className="block text-xs font-medium text-gray-500 mb-1">Transaction Type *</label>
//                         <select {...register('transactionTypeId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
//                             <option value="">Select type</option>
//                             <optgroup label="↓ Cash IN">
//                                 {inTypes.map((t) => <option key={t.id} value={t.id}>{t.transactionName}</option>)}
//                             </optgroup>
//                             <optgroup label="↑ Cash OUT">
//                                 {outTypes.map((t) => <option key={t.id} value={t.id}>{t.transactionName}</option>)}
//                             </optgroup>
//                         </select>
//                         {errors.transactionTypeId && <p className="text-xs text-red-500 mt-1">{errors.transactionTypeId.message}</p>}
//                     </div>
//                     <div>
//                         <label className="block text-xs font-medium text-gray-500 mb-1">Amount (৳) *</label>
//                         <input type="number" step="0.01" min="0" {...register('amount')} placeholder="0.00" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                         {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
//                     </div>
//                     <div>
//                         <label className="block text-xs font-medium text-gray-500 mb-1">Note</label>
//                         <input {...register('note')} placeholder="Optional" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                     </div>
//                     {apiError && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2"><p className="text-xs text-red-600">{apiError}</p></div>}
//                     <div className="flex gap-3 pt-2">
//                         <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm">
//                             {isSubmitting && <Loader2 size={14} className="animate-spin" />}
//                             {isEdit ? 'Update' : 'Save'}
//                         </button>
//                         <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }





'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cashTransactionApi } from '@/lib/api';
import { formatCurrency, formatDate, today } from '@/lib/utils';
import { usePrint } from '@/hooks/usePrint';
import PrintLayout from '@/components/print/PrintLayout';
import PrintButton from '@/components/print/PrintButton';
import { Plus, Trash2, Pencil, RefreshCcw, Loader2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CashTransaction, TransactionType } from '@/types';

const schema = z.object({
    transactionDate: z.string().min(1),
    transactionTypeId: z.coerce.number().int().positive('Select a type'),
    amount: z.coerce.number().positive('Amount must be positive'),
    note: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function CashTransactionsPage() {
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<CashTransaction | null>(null);
    const [dateRange, setDateRange] = useState({ startDate: today(), endDate: today() });
    const queryClient = useQueryClient();
    const { printRef, triggerPrint } = usePrint();

    const { data: typesData } = useQuery({
        queryKey: ['transaction-types'],
        queryFn: () => cashTransactionApi.getTypes().then((r) => r.data.data as TransactionType[]),
    });

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['cash-transactions', dateRange],
        queryFn: () =>
            cashTransactionApi.getAll({ startDate: dateRange.startDate, endDate: dateRange.endDate })
                .then((r) => r.data.data),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => cashTransactionApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["daily-dashboard"] });
        },
    });

    const transactions: CashTransaction[] = data?.transactions ?? [];
    const cashIn = transactions.filter((t) => t.transactionType.transactionDirection === 'IN').reduce((s, t) => s + Number(t.amount), 0);
    const cashOut = transactions.filter((t) => t.transactionType.transactionDirection === 'OUT').reduce((s, t) => s + Number(t.amount), 0);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Cash Transactions</h1>
                <div className="flex items-center gap-2">
                    <PrintButton onPrint={triggerPrint} disabled={transactions.length === 0} />
                    <button
                        onClick={() => { setEditItem(null); setShowForm(true); }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus size={16} />
                        Add Transaction
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowDownLeft size={16} className="text-green-600" />
                        <p className="text-xs font-medium text-green-700">Total Cash In</p>
                    </div>
                    <p className="text-xl font-bold text-green-800">{formatCurrency(cashIn)}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowUpRight size={16} className="text-red-500" />
                        <p className="text-xs font-medium text-red-700">Total Cash Out</p>
                    </div>
                    <p className="text-xl font-bold text-red-700">{formatCurrency(cashOut)}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs font-medium text-blue-700 mb-1">Net Flow</p>
                    <p className={`text-xl font-bold ${cashIn - cashOut >= 0 ? 'text-blue-800' : 'text-red-700'}`}>
                        {formatCurrency(cashIn - cashOut)}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange((d) => ({ ...d, startDate: e.target.value }))}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange((d) => ({ ...d, endDate: e.target.value }))}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm px-3 py-2 rounded-lg hover:bg-gray-50"
                    >
                        <RefreshCcw size={14} />
                        Refresh
                    </button>
                </div>
            </div>

            {showForm && (
                <CashTransactionModal
                    types={typesData ?? []}
                    editData={editItem}
                    onClose={() => { setShowForm(false); setEditItem(null); }}
                    onSaved={() => {
                        queryClient.invalidateQueries({ queryKey: ['cash-transactions'] });
                        setShowForm(false);
                        setEditItem(null);
                    }}
                />
            )}

            <PrintLayout ref={printRef} title="Cash Transaction Report" dateRange={dateRange}>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <RefreshCcw size={20} className="animate-spin text-gray-300" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm print-table">
                                <thead>
                                    <tr>
                                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Direction</th>
                                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Note</th>
                                        <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-5 py-3 print:hidden"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No transactions found</td>
                                        </tr>
                                    ) : (
                                        transactions.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-3 text-gray-700">{formatDate(t.transactionDate)}</td>
                                                <td className="px-5 py-3 font-medium text-gray-900">{t.transactionType.transactionName}</td>
                                                <td className="px-5 py-3">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${t.transactionType.transactionDirection === 'IN'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {t.transactionType.transactionDirection === 'IN'
                                                            ? <><ArrowDownLeft size={11} /> IN</>
                                                            : <><ArrowUpRight size={11} /> OUT</>
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-gray-500">{t.note || '—'}</td>
                                                <td className="px-5 py-3 text-right font-semibold text-gray-900">
                                                    {formatCurrency(Number(t.amount))}
                                                </td>
                                                <td className="px-5 py-3 print:hidden">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <button onClick={() => { setEditItem(t); setShowForm(true); }} className="text-blue-400 hover:text-blue-600 p-1">
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button onClick={() => { if (confirm('Delete this transaction?')) deleteMutation.mutate(t.id); }} className="text-red-400 hover:text-red-600 p-1">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {transactions.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-gray-50 border-t-2 border-gray-200">
                                            <td colSpan={4} className="px-5 py-3 text-sm font-semibold text-gray-700 text-right">
                                                In: {formatCurrency(cashIn)} | Out: {formatCurrency(cashOut)}
                                            </td>
                                            <td className="px-5 py-3 text-right text-base font-bold text-gray-900">
                                                Net: {formatCurrency(cashIn - cashOut)}
                                            </td>
                                            <td className="print:hidden"></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    )}
                </div>
            </PrintLayout>
        </div>
    );
}

function CashTransactionModal({
    types,
    editData,
    onClose,
    onSaved,
}: {
    types: TransactionType[];
    editData: CashTransaction | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const isEdit = !!editData;
    const [apiError, setApiError] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: editData
            ? {
                transactionDate: editData.transactionDate.split('T')[0],
                transactionTypeId: editData.transactionTypeId,
                amount: Number(editData.amount),
                note: editData.note ?? '',
            }
            : { transactionDate: today() },
    });

    const onSubmit = async (data: FormValues) => {
        try {
            setApiError('');
            if (isEdit) {
                await cashTransactionApi.update(editData!.id, data);
            } else {
                await cashTransactionApi.create(data);
            }
            onSaved();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setApiError(msg || 'Failed to save');
        }
    };

    const inTypes = types.filter((t) => t.transactionDirection === 'IN');
    const outTypes = types.filter((t) => t.transactionDirection === 'OUT');

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">
                        {isEdit ? 'Edit Transaction' : 'Add Transaction'}
                    </h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Date *</label>
                        <input type="date" {...register('transactionDate')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Transaction Type *</label>
                        <select {...register('transactionTypeId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select type</option>
                            <optgroup label="↓ Cash IN">
                                {inTypes.map((t) => <option key={t.id} value={t.id}>{t.transactionName}</option>)}
                            </optgroup>
                            <optgroup label="↑ Cash OUT">
                                {outTypes.map((t) => <option key={t.id} value={t.id}>{t.transactionName}</option>)}
                            </optgroup>
                        </select>
                        {errors.transactionTypeId && <p className="text-xs text-red-500 mt-1">{errors.transactionTypeId.message}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Amount (৳) *</label>
                        <input type="number" step="0.01" min="0" {...register('amount')} placeholder="0.00" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Note</label>
                        <input {...register('note')} placeholder="Optional" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    {apiError && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2"><p className="text-xs text-red-600">{apiError}</p></div>}
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm">
                            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                            {isEdit ? 'Update' : 'Save'}
                        </button>
                        <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}