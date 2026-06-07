// 'use client';

// import { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { expenseApi } from '@/lib/api';
// import { formatCurrency, formatDate, today } from '@/lib/utils';
// import { usePrint } from '@/hooks/usePrint';
// import PrintLayout from '@/components/print/PrintLayout';
// import PrintButton from '@/components/print/PrintButton';
// import { Plus, Trash2, Pencil, RefreshCcw, Loader2 } from 'lucide-react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import type { Expense, ExpenseCategory } from '@/types';

// const schema = z.object({
//     expenseDate: z.string().min(1),
//     categoryId: z.coerce.number().int().positive('Select a category'),
//     amount: z.coerce.number().positive('Amount must be positive'),
//     note: z.string().optional(),
// });
// type FormValues = z.infer<typeof schema>;

// export default function ExpensePage() {
//     const [showForm, setShowForm] = useState(false);
//     const [editItem, setEditItem] = useState<Expense | null>(null);
//     const [dateRange, setDateRange] = useState({ startDate: today(), endDate: today() });
//     const queryClient = useQueryClient();
//     const { printRef, triggerPrint } = usePrint();

//     const { data: categories } = useQuery({
//         queryKey: ['expense-categories'],
//         queryFn: () => expenseApi.getCategories().then((r) => r.data.data as ExpenseCategory[]),
//     });

//     const { data, isLoading, refetch } = useQuery({
//         queryKey: ['expenses', dateRange],
//         queryFn: () =>
//             expenseApi.getAll({ startDate: dateRange.startDate, endDate: dateRange.endDate }).then((r) => r.data.data),
//     });

//     const deleteMutation = useMutation({
//         mutationFn: (id: number) => expenseApi.delete(id),
//         onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
//     });

//     const expenses: Expense[] = data?.expenses ?? [];
//     const total = expenses.reduce((sum: number, e: Expense) => sum + Number(e.amount), 0);

//     return (
//         <div>
//             {/* Header */}
//             <div className="flex items-center justify-between mb-6">
//                 <h1 className="text-xl font-semibold text-gray-900">Expense Management</h1>
//                 <div className="flex items-center gap-2">
//                     <PrintButton onPrint={triggerPrint} disabled={expenses.length === 0} />
//                     <button
//                         onClick={() => { setEditItem(null); setShowForm(true); }}
//                         className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
//                     >
//                         <Plus size={16} />
//                         Add Expense
//                     </button>
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

//             {/* Modal Form */}
//             {showForm && (
//                 <ExpenseModal
//                     categories={categories ?? []}
//                     editData={editItem}
//                     onClose={() => { setShowForm(false); setEditItem(null); }}
//                     onSaved={() => {
//                         queryClient.invalidateQueries({ queryKey: ['expenses'] });
//                         setShowForm(false);
//                         setEditItem(null);
//                     }}
//                 />
//             )}

//             {/* Printable Table */}
//             <PrintLayout
//                 ref={printRef}
//                 title="Expense Report"
//                 dateRange={dateRange}
//             >
//                 <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//                     <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between print:hidden">
//                         <span className="text-sm font-medium text-gray-700">
//                             {expenses.length} entries — Total: {formatCurrency(total)}
//                         </span>
//                     </div>

//                     {isLoading ? (
//                         <div className="flex items-center justify-center py-16">
//                             <RefreshCcw size={20} className="animate-spin text-gray-300" />
//                         </div>
//                     ) : (
//                         <div className="overflow-x-auto">
//                             <table className="w-full text-sm print-table">
//                                 <thead>
//                                     <tr>
//                                         <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase print:p-0">Date</th>
//                                         <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase print:p-0">Category</th>
//                                         <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase print:p-0">Note</th>
//                                         <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase print:p-0">Amount</th>
//                                         <th className="px-5 py-3 print:hidden"></th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-50">
//                                     {expenses.length === 0 ? (
//                                         <tr>
//                                             <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
//                                                 No expenses found for this date range
//                                             </td>
//                                         </tr>
//                                     ) : (
//                                         expenses.map((e) => (
//                                             <tr key={e.id} className="hover:bg-gray-50 print:hover:bg-transparent">
//                                                 <td className="px-5 py-3 text-gray-700">{formatDate(e.expenseDate)}</td>
//                                                 <td className="px-5 py-3 font-medium text-gray-900">{e.category.categoryName}</td>
//                                                 <td className="px-5 py-3 text-gray-500">{e.note || '—'}</td>
//                                                 <td className="px-5 py-3 text-right font-semibold text-gray-900">
//                                                     {formatCurrency(Number(e.amount))}
//                                                 </td>
//                                                 <td className="px-5 py-3 print:hidden">
//                                                     <div className="flex items-center gap-2 justify-end">
//                                                         <button
//                                                             onClick={() => { setEditItem(e); setShowForm(true); }}
//                                                             className="text-blue-400 hover:text-blue-600 p-1"
//                                                         >
//                                                             <Pencil size={14} />
//                                                         </button>
//                                                         <button
//                                                             onClick={() => { if (confirm('Delete this expense?')) deleteMutation.mutate(e.id); }}
//                                                             className="text-red-400 hover:text-red-600 p-1"
//                                                         >
//                                                             <Trash2 size={14} />
//                                                         </button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     )}
//                                 </tbody>
//                                 {expenses.length > 0 && (
//                                     <tfoot>
//                                         <tr className="bg-gray-50 border-t-2 border-gray-200">
//                                             <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-gray-700 text-right">
//                                                 Total ({expenses.length} entries)
//                                             </td>
//                                             <td className="px-5 py-3 text-right text-base font-bold text-gray-900">
//                                                 {formatCurrency(total)}
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

// // ─── Expense Modal ────────────────────────────────────────────────────────────

// function ExpenseModal({
//     categories,
//     editData,
//     onClose,
//     onSaved,
// }: {
//     categories: ExpenseCategory[];
//     editData: Expense | null;
//     onClose: () => void;
//     onSaved: () => void;
// }) {
//     const isEdit = !!editData;
//     const [apiError, setApiError] = useState('');

//     const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
//         resolver: zodResolver(schema),
//         defaultValues: editData
//             ? {
//                 expenseDate: editData.expenseDate.split('T')[0],
//                 categoryId: editData.categoryId,
//                 amount: Number(editData.amount),
//                 note: editData.note ?? '',
//             }
//             : { expenseDate: today() },
//     });

//     const onSubmit = async (data: FormValues) => {
//         try {
//             setApiError('');
//             if (isEdit) {
//                 await expenseApi.update(editData!.id, data);
//             } else {
//                 await expenseApi.create(data);
//             }
//             onSaved();
//         } catch (err: unknown) {
//             const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
//             setApiError(msg || 'Failed to save expense');
//         }
//     };

//     return (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
//                 <div className="px-6 py-4 border-b border-gray-100">
//                     <h2 className="text-base font-semibold text-gray-900">
//                         {isEdit ? 'Edit Expense' : 'Add Expense'}
//                     </h2>
//                 </div>
//                 <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
//                     <div>
//                         <label className="block text-xs font-medium text-gray-500 mb-1">Date *</label>
//                         <input
//                             type="date"
//                             {...register('expenseDate')}
//                             className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-xs font-medium text-gray-500 mb-1">Category *</label>
//                         <select
//                             {...register('categoryId')}
//                             className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         >
//                             <option value="">Select category</option>
//                             {categories.map((c) => (
//                                 <option key={c.id} value={c.id}>{c.categoryName}</option>
//                             ))}
//                         </select>
//                         {errors.categoryId && (
//                             <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>
//                         )}
//                     </div>
//                     <div>
//                         <label className="block text-xs font-medium text-gray-500 mb-1">Amount (৳) *</label>
//                         <input
//                             type="number"
//                             step="0.01"
//                             min="0"
//                             {...register('amount')}
//                             placeholder="0.00"
//                             className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                         {errors.amount && (
//                             <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>
//                         )}
//                     </div>
//                     <div>
//                         <label className="block text-xs font-medium text-gray-500 mb-1">Note</label>
//                         <input
//                             {...register('note')}
//                             placeholder="Optional"
//                             className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                     </div>

//                     {apiError && (
//                         <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
//                             <p className="text-xs text-red-600">{apiError}</p>
//                         </div>
//                     )}

//                     <div className="flex gap-3 pt-2">
//                         <button
//                             type="submit"
//                             disabled={isSubmitting}
//                             className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm"
//                         >
//                             {isSubmitting && <Loader2 size={14} className="animate-spin" />}
//                             {isEdit ? 'Update' : 'Save'}
//                         </button>
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50"
//                         >
//                             Cancel
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }






'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi } from '@/lib/api';
import { formatCurrency, formatDate, today } from '@/lib/utils';
import { usePrint } from '@/hooks/usePrint';
import PrintLayout from '@/components/print/PrintLayout';
import PrintButton from '@/components/print/PrintButton';
import { Plus, Trash2, Pencil, RefreshCcw, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Expense, ExpenseCategory } from '@/types';

const schema = z.object({
    expenseDate: z.string().min(1),
    categoryId: z.coerce.number().int().positive('Select a category'),
    amount: z.coerce.number().positive('Amount must be positive'),
    note: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function ExpensePage() {
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<Expense | null>(null);
    const [dateRange, setDateRange] = useState({ startDate: today(), endDate: today() });
    const queryClient = useQueryClient();
    const { printRef, triggerPrint } = usePrint();

    const { data: categories } = useQuery({
        queryKey: ['expense-categories'],
        queryFn: () => expenseApi.getCategories().then((r) => r.data.data as ExpenseCategory[]),
    });

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['expenses', dateRange],
        queryFn: () =>
            expenseApi.getAll({ startDate: dateRange.startDate, endDate: dateRange.endDate }).then((r) => r.data.data),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => expenseApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["daily-dashboard"] });
        },
    });

    const expenses: Expense[] = data?.expenses ?? [];
    const total = expenses.reduce((sum: number, e: Expense) => sum + Number(e.amount), 0);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Expense Management</h1>
                <div className="flex items-center gap-2">
                    <PrintButton onPrint={triggerPrint} disabled={expenses.length === 0} />
                    <button
                        onClick={() => { setEditItem(null); setShowForm(true); }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus size={16} />
                        Add Expense
                    </button>
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

            {/* Modal Form */}
            {showForm && (
                <ExpenseModal
                    categories={categories ?? []}
                    editData={editItem}
                    onClose={() => { setShowForm(false); setEditItem(null); }}
                    onSaved={() => {
                        queryClient.invalidateQueries({ queryKey: ['expenses'] });
                        setShowForm(false);
                        setEditItem(null);
                    }}
                />
            )}

            {/* Printable Table */}
            <PrintLayout
                ref={printRef}
                title="Expense Report"
                dateRange={dateRange}
            >
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between print:hidden">
                        <span className="text-sm font-medium text-gray-700">
                            {expenses.length} entries — Total: {formatCurrency(total)}
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <RefreshCcw size={20} className="animate-spin text-gray-300" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm print-table">
                                <thead>
                                    <tr>
                                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase print:p-0">Date</th>
                                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase print:p-0">Category</th>
                                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase print:p-0">Note</th>
                                        <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase print:p-0">Amount</th>
                                        <th className="px-5 py-3 print:hidden"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {expenses.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                                                No expenses found for this date range
                                            </td>
                                        </tr>
                                    ) : (
                                        expenses.map((e) => (
                                            <tr key={e.id} className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-5 py-3 text-gray-700">{formatDate(e.expenseDate)}</td>
                                                <td className="px-5 py-3 font-medium text-gray-900">{e.category.categoryName}</td>
                                                <td className="px-5 py-3 text-gray-500">{e.note || '—'}</td>
                                                <td className="px-5 py-3 text-right font-semibold text-gray-900">
                                                    {formatCurrency(Number(e.amount))}
                                                </td>
                                                <td className="px-5 py-3 print:hidden">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <button
                                                            onClick={() => { setEditItem(e); setShowForm(true); }}
                                                            className="text-blue-400 hover:text-blue-600 p-1"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => { if (confirm('Delete this expense?')) deleteMutation.mutate(e.id); }}
                                                            className="text-red-400 hover:text-red-600 p-1"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {expenses.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-gray-50 border-t-2 border-gray-200">
                                            <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-gray-700 text-right">
                                                Total ({expenses.length} entries)
                                            </td>
                                            <td className="px-5 py-3 text-right text-base font-bold text-gray-900">
                                                {formatCurrency(total)}
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

// ─── Expense Modal ────────────────────────────────────────────────────────────

function ExpenseModal({
    categories,
    editData,
    onClose,
    onSaved,
}: {
    categories: ExpenseCategory[];
    editData: Expense | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const isEdit = !!editData;
    const [apiError, setApiError] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: editData
            ? {
                expenseDate: editData.expenseDate.split('T')[0],
                categoryId: editData.categoryId,
                amount: Number(editData.amount),
                note: editData.note ?? '',
            }
            : { expenseDate: today() },
    });

    const onSubmit = async (data: FormValues) => {
        try {
            setApiError('');
            if (isEdit) {
                await expenseApi.update(editData!.id, data);
            } else {
                await expenseApi.create(data);
            }
            onSaved();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setApiError(msg || 'Failed to save expense');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">
                        {isEdit ? 'Edit Expense' : 'Add Expense'}
                    </h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Date *</label>
                        <input
                            type="date"
                            {...register('expenseDate')}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Category *</label>
                        <select
                            {...register('categoryId')}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.categoryName}</option>
                            ))}
                        </select>
                        {errors.categoryId && (
                            <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Amount (৳) *</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register('amount')}
                            placeholder="0.00"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.amount && (
                            <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Note</label>
                        <input
                            {...register('note')}
                            placeholder="Optional"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {apiError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <p className="text-xs text-red-600">{apiError}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm"
                        >
                            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                            {isEdit ? 'Update' : 'Save'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}