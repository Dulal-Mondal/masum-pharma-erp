// 'use client';

// import { useState, useEffect } from 'react';
// import { useForm, useFieldArray } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useMutation } from '@tanstack/react-query';
// import { purchaseApi } from '@/lib/api';
// import { formatCurrency, today } from '@/lib/utils';
// import { Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
// import type { Company, Purchase } from '@/types';

// const itemSchema = z.object({
//     productName: z.string().min(1, 'Required'),
//     quantity: z.coerce.number().positive('Must be > 0'),
//     unitPrice: z.coerce.number().positive('Must be > 0'),
// });

// const schema = z.object({
//     purchaseDate: z.string().min(1),
//     invoiceNo: z.string().optional(),
//     companyId: z.coerce.number().int().positive('Select a company'),
//     note: z.string().optional(),
//     items: z.array(itemSchema).min(1, 'Add at least one item'),
// });

// type FormValues = z.infer<typeof schema>;

// interface Props {
//     companies: Company[];
//     editData: Purchase | null;
//     onClose: () => void;
// }

// export default function PurchaseForm({ companies, editData, onClose }: Props) {
//     const isEdit = !!editData;

//     const {
//         register,
//         control,
//         handleSubmit,
//         watch,
//         formState: { errors, isSubmitting },
//     } = useForm<FormValues>({
//         resolver: zodResolver(schema),
//         defaultValues: editData
//             ? {
//                 purchaseDate: editData.purchaseDate.split('T')[0],
//                 invoiceNo: editData.invoiceNo ?? '',
//                 companyId: editData.companyId,
//                 note: editData.note ?? '',
//                 items: editData.items.map((i) => ({
//                     productName: i.productName,
//                     quantity: Number(i.quantity),
//                     unitPrice: Number(i.unitPrice),
//                 })),
//             }
//             : {
//                 purchaseDate: today(),
//                 items: [{ productName: '', quantity: 1, unitPrice: 0 }],
//             },
//     });

//     const { fields, append, remove } = useFieldArray({ control, name: 'items' });
//     const watchedItems = watch('items');

//     // Calculate amounts live
//     const lineAmounts = watchedItems.map((item) => {
//         const qty = Number(item.quantity) || 0;
//         const price = Number(item.unitPrice) || 0;
//         return qty * price;
//     });
//     const grandTotal = lineAmounts.reduce((sum, a) => sum + a, 0);

//     const mutation = useMutation({
//         mutationFn: (data: FormValues) =>
//             isEdit ? purchaseApi.update(editData!.id, data) : purchaseApi.create(data),
//         onSuccess: onClose,
//     });

//     const [apiError, setApiError] = useState('');

//     const onSubmit = async (data: FormValues) => {
//         try {
//             setApiError('');
//             await mutation.mutateAsync(data);
//         } catch (err: unknown) {
//             const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
//             setApiError(msg || 'Failed to save purchase');
//         }
//     };

//     return (
//         <div>
//             {/* Header */}
//             <div className="flex items-center gap-3 mb-6">
//                 <button
//                     onClick={onClose}
//                     className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
//                 >
//                     <ArrowLeft size={16} />
//                     Back
//                 </button>
//                 <h1 className="text-xl font-semibold text-gray-900">
//                     {isEdit ? 'Edit Purchase' : 'New Purchase Invoice'}
//                 </h1>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//                 {/* Master Info */}
//                 <div className="bg-white rounded-xl border border-gray-200 p-5">
//                     <h2 className="text-sm font-semibold text-gray-700 mb-4">Invoice Details</h2>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">Date *</label>
//                             <input
//                                 type="date"
//                                 {...register('purchaseDate')}
//                                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                             {errors.purchaseDate && (
//                                 <p className="text-xs text-red-500 mt-1">{errors.purchaseDate.message}</p>
//                             )}
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">Company *</label>
//                             <select
//                                 {...register('companyId')}
//                                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             >
//                                 <option value="">Select company</option>
//                                 {companies.map((c) => (
//                                     <option key={c.id} value={c.id}>
//                                         {c.companyName}
//                                     </option>
//                                 ))}
//                             </select>
//                             {errors.companyId && (
//                                 <p className="text-xs text-red-500 mt-1">{errors.companyId.message}</p>
//                             )}
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">Invoice No.</label>
//                             <input
//                                 {...register('invoiceNo')}
//                                 placeholder="e.g. INV-2024-001"
//                                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">Note</label>
//                             <input
//                                 {...register('note')}
//                                 placeholder="Optional note"
//                                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Items */}
//                 <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//                     <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
//                         <h2 className="text-sm font-semibold text-gray-700">Items</h2>
//                         <button
//                             type="button"
//                             onClick={() => append({ productName: '', quantity: 1, unitPrice: 0 })}
//                             className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
//                         >
//                             <Plus size={13} />
//                             Add Row
//                         </button>
//                     </div>

//                     <div className="overflow-x-auto">
//                         <table className="w-full text-sm">
//                             <thead className="bg-gray-50 border-b border-gray-100">
//                                 <tr>
//                                     <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Product Name</th>
//                                     <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 w-28">Qty</th>
//                                     <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 w-32">Unit Price</th>
//                                     <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 w-32">Amount</th>
//                                     <th className="w-10"></th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-50">
//                                 {fields.map((field, index) => (
//                                     <tr key={field.id}>
//                                         <td className="px-4 py-2">
//                                             <input
//                                                 {...register(`items.${index}.productName`)}
//                                                 placeholder="Product name"
//                                                 className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
//                                             />
//                                             {errors.items?.[index]?.productName && (
//                                                 <p className="text-xs text-red-500 mt-0.5">
//                                                     {errors.items[index]?.productName?.message}
//                                                 </p>
//                                             )}
//                                         </td>
//                                         <td className="px-4 py-2">
//                                             <input
//                                                 {...register(`items.${index}.quantity`)}
//                                                 type="number"
//                                                 step="0.01"
//                                                 min="0"
//                                                 className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
//                                             />
//                                         </td>
//                                         <td className="px-4 py-2">
//                                             <input
//                                                 {...register(`items.${index}.unitPrice`)}
//                                                 type="number"
//                                                 step="0.01"
//                                                 min="0"
//                                                 className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
//                                             />
//                                         </td>
//                                         <td className="px-4 py-2 text-right font-medium text-gray-700">
//                                             {formatCurrency(lineAmounts[index] ?? 0)}
//                                         </td>
//                                         <td className="px-2 py-2">
//                                             <button
//                                                 type="button"
//                                                 onClick={() => remove(index)}
//                                                 disabled={fields.length === 1}
//                                                 className="text-red-400 hover:text-red-600 disabled:opacity-30 p-1"
//                                             >
//                                                 <Trash2 size={14} />
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                             <tfoot className="border-t-2 border-gray-200 bg-gray-50">
//                                 <tr>
//                                     <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">
//                                         Grand Total
//                                     </td>
//                                     <td className="px-4 py-3 text-right text-base font-bold text-blue-700">
//                                         {formatCurrency(grandTotal)}
//                                     </td>
//                                     <td></td>
//                                 </tr>
//                             </tfoot>
//                         </table>
//                     </div>
//                 </div>

//                 {apiError && (
//                     <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
//                         <p className="text-sm text-red-600">{apiError}</p>
//                     </div>
//                 )}

//                 {/* Actions */}
//                 <div className="flex gap-3">
//                     <button
//                         type="submit"
//                         disabled={isSubmitting}
//                         className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
//                     >
//                         {isSubmitting && <Loader2 size={15} className="animate-spin" />}
//                         {isEdit ? 'Update Purchase' : 'Save Purchase'}
//                     </button>
//                     <button
//                         type="button"
//                         onClick={onClose}
//                         className="px-6 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
//                     >
//                         Cancel
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// }



// 'use client';

// import { useState } from 'react';
// import { useForm, useFieldArray } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { purchaseApi } from '@/lib/api';
// import { formatCurrency, today } from '@/lib/utils';
// import { Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
// import type { Company, Purchase } from '@/types';

// const itemSchema = z.object({
//     productName: z.string().min(1, 'Required'),
//     quantity: z.coerce.number().positive('Must be > 0'),
//     unitPrice: z.coerce.number().positive('Must be > 0'),
// });

// const schema = z.object({
//     purchaseDate: z.string().min(1),
//     invoiceNo: z.string().optional(),
//     companyId: z.coerce.number().int().positive('Select a company'),
//     note: z.string().optional(),
//     items: z.array(itemSchema).min(1, 'Add at least one item'),
// });

// type FormValues = z.infer<typeof schema>;

// interface Props {
//     companies: Company[];
//     editData: Purchase | null;
//     onClose: () => void;
// }

// export default function PurchaseForm({ companies, editData, onClose }: Props) {
//     const isEdit = !!editData;
//     const [apiError, setApiError] = useState('');
//     const queryClient = useQueryClient();

//     const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
//         resolver: zodResolver(schema),
//         defaultValues: editData
//             ? {
//                 purchaseDate: editData.purchaseDate.split('T')[0],
//                 invoiceNo: editData.invoiceNo ?? '',
//                 companyId: editData.companyId,
//                 note: editData.note ?? '',
//                 items: editData.items.map((i) => ({
//                     productName: i.productName,
//                     quantity: Number(i.quantity),
//                     unitPrice: Number(i.unitPrice),
//                 })),
//             }
//             : {
//                 purchaseDate: today(),
//                 items: [{ productName: '', quantity: 1, unitPrice: 0 }],
//             },
//     });

//     const { fields, append, remove } = useFieldArray({ control, name: 'items' });
//     const watchedItems = watch('items');

//     const lineAmounts = watchedItems.map((item) => {
//         const qty = Number(item.quantity) || 0;
//         const price = Number(item.unitPrice) || 0;
//         return qty * price;
//     });
//     const grandTotal = lineAmounts.reduce((sum, a) => sum + a, 0);

//     const mutation = useMutation({
//         mutationFn: (data: FormValues) =>
//             isEdit ? purchaseApi.update(editData!.id, data) : purchaseApi.create(data),
//         onSuccess: () => {
//             // Invalidate all related queries so everything updates instantly
//             queryClient.invalidateQueries({ queryKey: ['purchases'] });
//             queryClient.invalidateQueries({ queryKey: ['dashboard'] });
//             queryClient.invalidateQueries({ queryKey: ['daily-dashboard'] });
//             onClose();
//         },
//     });

//     const onSubmit = async (data: FormValues) => {
//         try {
//             setApiError('');
//             await mutation.mutateAsync(data);
//         } catch (err: unknown) {
//             const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
//             setApiError(msg || 'Failed to save purchase');
//         }
//     };

//     return (
//         <div>
//             <div className="flex items-center gap-3 mb-6">
//                 <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
//                     <ArrowLeft size={16} />
//                     Back
//                 </button>
//                 <h1 className="text-xl font-semibold text-gray-900">
//                     {isEdit ? 'Edit Purchase' : 'New Purchase Invoice'}
//                 </h1>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//                 {/* Master Info */}
//                 <div className="bg-white rounded-xl border border-gray-200 p-5">
//                     <h2 className="text-sm font-semibold text-gray-700 mb-4">Invoice Details</h2>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">Date *</label>
//                             <input type="date" {...register('purchaseDate')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                             {errors.purchaseDate && <p className="text-xs text-red-500 mt-1">{errors.purchaseDate.message}</p>}
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">Company *</label>
//                             <select {...register('companyId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
//                                 <option value="">Select company</option>
//                                 {companies.map((c) => (
//                                     <option key={c.id} value={c.id}>{c.companyName}</option>
//                                 ))}
//                             </select>
//                             {errors.companyId && <p className="text-xs text-red-500 mt-1">{errors.companyId.message}</p>}
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">Invoice No.</label>
//                             <input {...register('invoiceNo')} placeholder="e.g. INV-001" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">Note</label>
//                             <input {...register('note')} placeholder="Optional" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Items */}
//                 <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//                     <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
//                         <h2 className="text-sm font-semibold text-gray-700">Items</h2>
//                         <button type="button" onClick={() => append({ productName: '', quantity: 1, unitPrice: 0 })} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
//                             <Plus size={13} />
//                             Add Row
//                         </button>
//                     </div>
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-sm">
//                             <thead className="bg-gray-50 border-b border-gray-100">
//                                 <tr>
//                                     <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Product Name</th>
//                                     <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 w-28">Qty</th>
//                                     <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 w-32">Unit Price</th>
//                                     <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 w-32">Amount</th>
//                                     <th className="w-10"></th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-50">
//                                 {fields.map((field, index) => (
//                                     <tr key={field.id}>
//                                         <td className="px-4 py-2">
//                                             <input {...register(`items.${index}.productName`)} placeholder="Product name" className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
//                                             {errors.items?.[index]?.productName && <p className="text-xs text-red-500 mt-0.5">{errors.items[index]?.productName?.message}</p>}
//                                         </td>
//                                         <td className="px-4 py-2">
//                                             <input {...register(`items.${index}.quantity`)} type="number" step="0.01" min="0" className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
//                                         </td>
//                                         <td className="px-4 py-2">
//                                             <input {...register(`items.${index}.unitPrice`)} type="number" step="0.01" min="0" className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
//                                         </td>
//                                         <td className="px-4 py-2 text-right font-medium text-gray-700">
//                                             {formatCurrency(lineAmounts[index] ?? 0)}
//                                         </td>
//                                         <td className="px-2 py-2">
//                                             <button type="button" onClick={() => remove(index)} disabled={fields.length === 1} className="text-red-400 hover:text-red-600 disabled:opacity-30 p-1">
//                                                 <Trash2 size={14} />
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                             <tfoot className="border-t-2 border-gray-200 bg-gray-50">
//                                 <tr>
//                                     <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">Grand Total</td>
//                                     <td className="px-4 py-3 text-right text-base font-bold text-blue-700">{formatCurrency(grandTotal)}</td>
//                                     <td></td>
//                                 </tr>
//                             </tfoot>
//                         </table>
//                     </div>
//                 </div>

//                 {apiError && (
//                     <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
//                         <p className="text-sm text-red-600">{apiError}</p>
//                     </div>
//                 )}

//                 <div className="flex gap-3">
//                     <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors">
//                         {isSubmitting && <Loader2 size={15} className="animate-spin" />}
//                         {isEdit ? 'Update Purchase' : 'Save Purchase'}
//                     </button>
//                     <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
//                         Cancel
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// }




'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseApi } from '@/lib/api';
import { formatCurrency, today } from '@/lib/utils';
import { Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import type { Company, Purchase } from '@/types';

// Item is fully optional — only amount is required if filled
const itemSchema = z.object({
    productName: z.string().optional(),
    quantity: z.coerce.number().min(0).optional(),
    unitPrice: z.coerce.number().min(0).optional(),
});

const schema = z.object({
    purchaseDate: z.string().min(1, 'Date is required'),
    invoiceNo: z.string().optional(),
    companyId: z.coerce.number().int().positive('Company is required'),
    note: z.string().optional(),
    // totalAmount — entered directly if no items
    totalAmount: z.coerce.number().min(0).optional(),
    items: z.array(itemSchema).optional(),
});

type FormValues = z.infer<typeof schema>;

// Item row state (managed manually for flexibility)
interface ItemRow {
    id: number;
    productName: string;
    quantity: string;
    unitPrice: string;
}

interface Props {
    companies: Company[];
    editData: Purchase | null;
    onClose: () => void;
}

export default function PurchaseForm({ companies, editData, onClose }: Props) {
    const isEdit = !!editData;
    const [apiError, setApiError] = useState('');
    const [useItemMode, setUseItemMode] = useState(
        isEdit ? (editData?.items?.length ?? 0) > 0 : false
    );
    const [items, setItems] = useState<ItemRow[]>(
        isEdit && editData?.items?.length
            ? editData.items.map((i, idx) => ({
                id: idx,
                productName: i.productName,
                quantity: String(i.quantity),
                unitPrice: String(i.unitPrice),
            }))
            : [{ id: 0, productName: '', quantity: '1', unitPrice: '0' }]
    );
    const queryClient = useQueryClient();

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            purchaseDate: editData ? editData.purchaseDate.split('T')[0] : today(),
            invoiceNo: editData?.invoiceNo ?? '',
            companyId: editData?.companyId,
            note: editData?.note ?? '',
            totalAmount: editData && !editData.items?.length ? Number(editData.totalAmount) : undefined,
        },
    });

    // Calculate totals from item rows
    const itemTotals = items.map((item) => {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.unitPrice) || 0;
        return qty * price;
    });
    const itemsGrandTotal = itemTotals.reduce((sum, a) => sum + a, 0);

    const watchedTotal = watch('totalAmount');
    const displayTotal = useItemMode ? itemsGrandTotal : (parseFloat(String(watchedTotal)) || 0);

    const addRow = () => {
        setItems((prev) => [...prev, { id: Date.now(), productName: '', quantity: '1', unitPrice: '0' }]);
    };

    const removeRow = (id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateRow = (id: number, field: keyof Omit<ItemRow, 'id'>, value: string) => {
        setItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
    };

    const mutation = useMutation({
        mutationFn: (payload: unknown) =>
            isEdit ? purchaseApi.update(editData!.id, payload) : purchaseApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['daily-dashboard'] });
            onClose();
        },
    });

    const onSubmit = async (data: FormValues) => {
        try {
            setApiError('');

            let payload;

            if (useItemMode) {
                // Filter out empty rows
                const validItems = items
                    .filter((i) => i.productName.trim() || parseFloat(i.unitPrice) > 0)
                    .map((i) => ({
                        productName: i.productName.trim() || 'Item',
                        quantity: parseFloat(i.quantity) || 1,
                        unitPrice: parseFloat(i.unitPrice) || 0,
                    }));

                if (validItems.length === 0) {
                    setApiError('Please add at least one item with a price');
                    return;
                }

                payload = {
                    purchaseDate: data.purchaseDate,
                    invoiceNo: data.invoiceNo,
                    companyId: data.companyId,
                    note: data.note,
                    items: validItems,
                };
            } else {
                // Simple mode — just company + total amount
                const total = parseFloat(String(data.totalAmount)) || 0;
                if (total <= 0) {
                    setApiError('Please enter a valid amount');
                    return;
                }

                payload = {
                    purchaseDate: data.purchaseDate,
                    invoiceNo: data.invoiceNo,
                    companyId: data.companyId,
                    note: data.note,
                    items: [{
                        productName: 'Purchase',
                        quantity: 1,
                        unitPrice: total,
                    }],
                };
            }

            await mutation.mutateAsync(payload);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setApiError(msg || 'Failed to save purchase');
        }
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={16} />
                    Back
                </button>
                <h1 className="text-xl font-semibold text-gray-900">
                    {isEdit ? 'Edit Purchase' : 'New Purchase Invoice'}
                </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Master Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Invoice Details</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Date *</label>
                            <input
                                type="date"
                                {...register('purchaseDate')}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.purchaseDate && <p className="text-xs text-red-500 mt-1">{errors.purchaseDate.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Company *</label>
                            <select
                                {...register('companyId')}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select company</option>
                                {companies.map((c) => (
                                    <option key={c.id} value={c.id}>{c.companyName}</option>
                                ))}
                            </select>
                            {errors.companyId && <p className="text-xs text-red-500 mt-1">{errors.companyId.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Invoice No.</label>
                            <input
                                {...register('invoiceNo')}
                                placeholder="e.g. INV-001"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Note</label>
                            <input
                                {...register('note')}
                                placeholder="Optional"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Mode Toggle */}
                <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4">
                    <span className="text-sm text-gray-500">Entry Mode:</span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setUseItemMode(false)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${!useItemMode
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Simple (Amount Only)
                        </button>
                        <button
                            type="button"
                            onClick={() => setUseItemMode(true)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${useItemMode
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Detailed (Product List)
                        </button>
                    </div>
                </div>

                {/* Simple Mode — just amount */}
                {!useItemMode && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Total Purchase Amount (৳)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register('totalAmount')}
                            placeholder="0.00"
                            className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-3 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {/* <p className="text-xs text-gray-400 mt-2">
                            শুধু মোট টাকার পরিমাণ দিলেই হবে। Product details দিতে হবে না।
                        </p> */}
                    </div>
                )}

                {/* Detailed Mode — item list */}
                {useItemMode && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-700">Items</h2>
                            <button
                                type="button"
                                onClick={addRow}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                <Plus size={13} />
                                Add Row
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Product Name</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 w-28">Qty</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 w-32">Unit Price</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 w-32">Amount</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {items.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-2">
                                                <input
                                                    value={item.productName}
                                                    onChange={(e) => updateRow(item.id, 'productName', e.target.value)}
                                                    placeholder="Product name (optional)"
                                                    className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={item.quantity}
                                                    onChange={(e) => updateRow(item.id, 'quantity', e.target.value)}
                                                    className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateRow(item.id, 'unitPrice', e.target.value)}
                                                    className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right font-medium text-gray-700">
                                                {formatCurrency(itemTotals[index] ?? 0)}
                                            </td>
                                            <td className="px-2 py-2">
                                                <button
                                                    type="button"
                                                    onClick={() => removeRow(item.id)}
                                                    disabled={items.length === 1}
                                                    className="text-red-400 hover:text-red-600 disabled:opacity-30 p-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">Grand Total</td>
                                        <td className="px-4 py-3 text-right text-base font-bold text-blue-700">{formatCurrency(itemsGrandTotal)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {/* Total Summary */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-700">Total Purchase Amount</span>
                    <span className="text-xl font-bold text-blue-800">{formatCurrency(displayTotal)}</span>
                </div>

                {apiError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                        <p className="text-sm text-red-600">{apiError}</p>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
                    >
                        {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                        {isEdit ? 'Update Purchase' : 'Save Purchase'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}