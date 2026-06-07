'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { expenseApi } from '@/lib/api';
import { today } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { Expense, ExpenseCategory } from '@/types';

const schema = z.object({
    expenseDate: z.string().min(1, 'Date is required'),
    categoryId: z.coerce.number().int().positive('Select a category'),
    amount: z.coerce.number().positive('Amount must be positive'),
    note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ExpenseFormProps {
    categories: ExpenseCategory[];
    editData?: Expense | null;
    onClose: () => void;
    onSaved: () => void;
}

export default function ExpenseForm({
    categories,
    editData,
    onClose,
    onSaved,
}: ExpenseFormProps) {
    const isEdit = !!editData;
    const [apiError, setApiError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: editData
            ? {
                expenseDate: editData.expenseDate.split('T')[0],
                categoryId: editData.categoryId,
                amount: Number(editData.amount),
                note: editData.note ?? '',
            }
            : {
                expenseDate: today(),
            },
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
            const msg = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message;
            setApiError(msg || 'Failed to save expense');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">
                        {isEdit ? 'Edit Expense' : 'Add Expense'}
                    </h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {/* Date */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Date *
                        </label>
                        <input
                            type="date"
                            {...register('expenseDate')}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.expenseDate && (
                            <p className="text-xs text-red-500 mt-1">{errors.expenseDate.message}</p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Category *
                        </label>
                        <select
                            {...register('categoryId')}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.categoryName}
                                </option>
                            ))}
                        </select>
                        {errors.categoryId && (
                            <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>
                        )}
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Amount (৳) *
                        </label>
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

                    {/* Note */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Note
                        </label>
                        <input
                            {...register('note')}
                            placeholder="Optional"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* API Error */}
                    {apiError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <p className="text-xs text-red-600">{apiError}</p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                        >
                            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                            {isEdit ? 'Update' : 'Save'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}