// 'use client';

// import { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { companyApi, expenseApi, cashTransactionApi } from '@/lib/api';
// import { Plus, Trash2, Settings, Building2, Tag, ArrowLeftRight, Loader2 } from 'lucide-react';
// import type { Company, ExpenseCategory, TransactionType } from '@/types';

// type Tab = 'companies' | 'expense-categories' | 'transaction-types';

// export default function SettingsPage() {
//     const [activeTab, setActiveTab] = useState<Tab>('companies');

//     const tabs = [
//         { id: 'companies' as Tab, label: 'Companies', icon: Building2 },
//         { id: 'expense-categories' as Tab, label: 'Expense Categories', icon: Tag },
//         { id: 'transaction-types' as Tab, label: 'Transaction Types', icon: ArrowLeftRight },
//     ];

//     return (
//         <div>
//             <div className="flex items-center gap-3 mb-6">
//                 <div className="bg-gray-100 text-gray-600 rounded-lg p-2">
//                     <Settings size={20} />
//                 </div>
//                 <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
//             </div>

//             <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 w-fit">
//                 {tabs.map(({ id, label, icon: Icon }) => (
//                     <button
//                         key={id}
//                         onClick={() => setActiveTab(id)}
//                         className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
//                             }`}
//                     >
//                         <Icon size={14} />
//                         {label}
//                     </button>
//                 ))}
//             </div>

//             {activeTab === 'companies' && <CompaniesTab />}
//             {activeTab === 'expense-categories' && <ExpenseCategoriesTab />}
//             {activeTab === 'transaction-types' && <TransactionTypesTab />}
//         </div>
//     );
// }

// // ─── Companies Tab ────────────────────────────────────────────────────────────

// function CompaniesTab() {
//     const [newName, setNewName] = useState('');
//     const queryClient = useQueryClient();

//     const { data: companies, isLoading } = useQuery({
//         queryKey: ['companies'],
//         queryFn: () => companyApi.getAll().then((r) => r.data.data as Company[]),
//     });

//     const createMutation = useMutation({
//         mutationFn: (name: string) => companyApi.create(name),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['companies'] });
//             setNewName('');
//         },
//     });

//     const deleteMutation = useMutation({
//         mutationFn: (id: number) => companyApi.delete(id),
//         onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
//     });

//     return (
//         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-lg">
//             <div className="px-5 py-4 border-b border-gray-100">
//                 <h2 className="text-sm font-semibold text-gray-700">Pharma Companies</h2>
//                 <p className="text-xs text-gray-400 mt-0.5">Manage the list of companies for purchase invoices</p>
//             </div>

//             {/* Add form */}
//             <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
//                 <div className="flex gap-2">
//                     <input
//                         value={newName}
//                         onChange={(e) => setNewName(e.target.value)}
//                         onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) createMutation.mutate(newName.trim()); }}
//                         placeholder="Company name..."
//                         className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     <button
//                         onClick={() => { if (newName.trim()) createMutation.mutate(newName.trim()); }}
//                         disabled={createMutation.isPending || !newName.trim()}
//                         className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-3 py-2 rounded-lg"
//                     >
//                         {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
//                         Add
//                     </button>
//                 </div>
//             </div>

//             {/* List */}
//             <div className="divide-y divide-gray-50">
//                 {isLoading ? (
//                     <div className="flex items-center justify-center py-8"><Loader2 size={18} className="animate-spin text-gray-300" /></div>
//                 ) : companies?.length === 0 ? (
//                     <p className="text-center py-8 text-sm text-gray-400">No companies yet</p>
//                 ) : (
//                     companies?.map((c) => (
//                         <div key={c.id} className="flex items-center justify-between px-5 py-3">
//                             <span className="text-sm text-gray-800">{c.companyName}</span>
//                             <button
//                                 onClick={() => { if (confirm(`Deactivate "${c.companyName}"?`)) deleteMutation.mutate(c.id); }}
//                                 className="text-red-400 hover:text-red-600 p-1"
//                             >
//                                 <Trash2 size={14} />
//                             </button>
//                         </div>
//                     ))
//                 )}
//             </div>
//         </div>
//     );
// }

// // ─── Expense Categories Tab ───────────────────────────────────────────────────

// function ExpenseCategoriesTab() {
//     const [newName, setNewName] = useState('');
//     const queryClient = useQueryClient();

//     const { data: categories, isLoading } = useQuery({
//         queryKey: ['expense-categories'],
//         queryFn: () => expenseApi.getCategories().then((r) => r.data.data as ExpenseCategory[]),
//     });

//     const createMutation = useMutation({
//         mutationFn: (name: string) => expenseApi.createCategory(name),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
//             setNewName('');
//         },
//     });

//     const deleteMutation = useMutation({
//         mutationFn: (id: number) => expenseApi.deleteCategory(id),
//         onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expense-categories'] }),
//     });

//     return (
//         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-lg">
//             <div className="px-5 py-4 border-b border-gray-100">
//                 <h2 className="text-sm font-semibold text-gray-700">Expense Categories</h2>
//                 <p className="text-xs text-gray-400 mt-0.5">Customize categories for expense entries</p>
//             </div>
//             <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
//                 <div className="flex gap-2">
//                     <input
//                         value={newName}
//                         onChange={(e) => setNewName(e.target.value)}
//                         onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) createMutation.mutate(newName.trim()); }}
//                         placeholder="Category name..."
//                         className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     <button
//                         onClick={() => { if (newName.trim()) createMutation.mutate(newName.trim()); }}
//                         disabled={createMutation.isPending || !newName.trim()}
//                         className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-3 py-2 rounded-lg"
//                     >
//                         {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
//                         Add
//                     </button>
//                 </div>
//             </div>
//             <div className="divide-y divide-gray-50">
//                 {isLoading ? (
//                     <div className="flex items-center justify-center py-8"><Loader2 size={18} className="animate-spin text-gray-300" /></div>
//                 ) : (
//                     categories?.map((c) => (
//                         <div key={c.id} className="flex items-center justify-between px-5 py-3">
//                             <span className="text-sm text-gray-800">{c.categoryName}</span>
//                             <button onClick={() => { if (confirm(`Delete "${c.categoryName}"?`)) deleteMutation.mutate(c.id); }} className="text-red-400 hover:text-red-600 p-1">
//                                 <Trash2 size={14} />
//                             </button>
//                         </div>
//                     ))
//                 )}
//             </div>
//         </div>
//     );
// }

// // ─── Transaction Types Tab ────────────────────────────────────────────────────

// function TransactionTypesTab() {
//     const [newName, setNewName] = useState('');
//     const [direction, setDirection] = useState<'IN' | 'OUT'>('IN');

//     const { data: types, isLoading } = useQuery({
//         queryKey: ['transaction-types'],
//         queryFn: () => cashTransactionApi.getTypes().then((r) => r.data.data as TransactionType[]),
//     });

//     const inTypes = types?.filter((t) => t.transactionDirection === 'IN') ?? [];
//     const outTypes = types?.filter((t) => t.transactionDirection === 'OUT') ?? [];

//     return (
//         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-lg">
//             <div className="px-5 py-4 border-b border-gray-100">
//                 <h2 className="text-sm font-semibold text-gray-700">Transaction Types</h2>
//                 <p className="text-xs text-gray-400 mt-0.5">Types for cash in/out transactions (view only — managed by admin)</p>
//             </div>
//             {isLoading ? (
//                 <div className="flex items-center justify-center py-8"><Loader2 size={18} className="animate-spin text-gray-300" /></div>
//             ) : (
//                 <div>
//                     <div className="px-5 py-3 border-b border-gray-100 bg-green-50">
//                         <p className="text-xs font-semibold text-green-700 uppercase mb-2">Cash IN</p>
//                         <div className="space-y-1">
//                             {inTypes.map((t) => (
//                                 <div key={t.id} className="flex items-center gap-2 text-sm text-gray-700">
//                                     <span className="w-2 h-2 bg-green-400 rounded-full" />
//                                     {t.transactionName}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                     <div className="px-5 py-3 bg-red-50">
//                         <p className="text-xs font-semibold text-red-700 uppercase mb-2">Cash OUT</p>
//                         <div className="space-y-1">
//                             {outTypes.map((t) => (
//                                 <div key={t.id} className="flex items-center gap-2 text-sm text-gray-700">
//                                     <span className="w-2 h-2 bg-red-400 rounded-full" />
//                                     {t.transactionName}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }




'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi, expenseApi, cashTransactionApi, dailyAccountApi } from '@/lib/api';
import { formatCurrency, today } from '@/lib/utils';
import { Plus, Trash2, Settings, Building2, Tag, ArrowLeftRight, Wallet, Loader2, CheckCircle } from 'lucide-react';
import type { Company, ExpenseCategory, TransactionType } from '@/types';

type Tab = 'opening-balance' | 'companies' | 'expense-categories' | 'transaction-types';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('opening-balance');

    const tabs = [
        { id: 'opening-balance' as Tab, label: 'Opening Balance', icon: Wallet },
        { id: 'companies' as Tab, label: 'Companies', icon: Building2 },
        { id: 'expense-categories' as Tab, label: 'Expense Categories', icon: Tag },
        { id: 'transaction-types' as Tab, label: 'Transaction Types', icon: ArrowLeftRight },
    ];

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gray-100 text-gray-600 rounded-lg p-2">
                    <Settings size={20} />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>

            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 w-fit flex-wrap">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'opening-balance' && <OpeningBalanceTab />}
            {activeTab === 'companies' && <CompaniesTab />}
            {activeTab === 'expense-categories' && <ExpenseCategoriesTab />}
            {activeTab === 'transaction-types' && <TransactionTypesTab />}
        </div>
    );
}

// ─── Opening Balance Tab ──────────────────────────────────────────────────────

function OpeningBalanceTab() {
    const [date, setDate] = useState(() => {
        // Default: yesterday
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
    });
    const [amount, setAmount] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ date, balance }: { date: string; balance: number }) =>
            dailyAccountApi.performClosing(date, balance),
        onSuccess: () => {
            setSuccess(true);
            setError('');
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['daily-dashboard'] });
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message;
            setError(msg || 'Failed to set opening balance');
            setSuccess(false);
        },
    });

    const handleSubmit = () => {
        const balance = parseFloat(amount);
        if (isNaN(balance) || balance < 0) {
            setError('Please enter a valid amount');
            return;
        }
        if (!date) {
            setError('Please select a date');
            return;
        }
        setError('');
        mutation.mutate({ date, balance });
    };

    return (
        <div className="max-w-lg">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700">Set Opening Balance</h2>
                    <p className="text-xs text-gray-400 mt-1">
                        Enter the amount of money you have on hand when you first launch the software.
                        The system will save it as yesterday's closing, which will be today's opening.
                    </p>
                </div>

                <div className="p-5 space-y-4">
                    {/* Info box */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <p className="text-xs text-blue-700 font-medium mb-1">How work it?</p>
                        <p className="text-xs text-blue-600">
                            Today's Opening = Yesterday's Closing. So give a previous date below and give your current cash as that day's closing balance.
                        </p>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Date (The day before today) *
                        </label>
                        <input
                            type="date"
                            value={date}
                            max={today()}
                            onChange={(e) => { setDate(e.target.value); setSuccess(false); }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">

                            To get Today's opening give previous date
                        </p>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Cash Amount (৳) *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => { setAmount(e.target.value); setSuccess(false); }}
                            placeholder="0.00"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Give your hand cash
                        </p>
                    </div>

                    {/* Preview */}
                    {amount && !isNaN(parseFloat(amount)) && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Selected Date Closing:</span>
                                <span className="font-semibold text-gray-800">{formatCurrency(parseFloat(amount))}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-500">Tomorrow&apos;s Opening:</span>
                                <span className="font-semibold text-blue-700">{formatCurrency(parseFloat(amount))}</span>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <p className="text-xs text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
                            <CheckCircle size={14} className="text-green-600" />
                            <p className="text-xs text-green-700 font-medium">
                                Opening balance set successfully!Go to Dashboard.
                            </p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={mutation.isPending || !amount || !date}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                    >
                        {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
                        Set Opening Balance
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Companies Tab ────────────────────────────────────────────────────────────

function CompaniesTab() {
    const [newName, setNewName] = useState('');
    const queryClient = useQueryClient();

    const { data: companies, isLoading } = useQuery({
        queryKey: ['companies'],
        queryFn: () => companyApi.getAll().then((r) => r.data.data as Company[]),
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => companyApi.create(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            setNewName('');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => companyApi.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
    });

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-lg">
            <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Pharma Companies</h2>
                <p className="text-xs text-gray-400 mt-0.5">Manage the list of companies for purchase invoices</p>
            </div>
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex gap-2">
                    <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) createMutation.mutate(newName.trim()); }}
                        placeholder="Company name..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => { if (newName.trim()) createMutation.mutate(newName.trim()); }}
                        disabled={createMutation.isPending || !newName.trim()}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-3 py-2 rounded-lg"
                    >
                        {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Add
                    </button>
                </div>
            </div>
            <div className="divide-y divide-gray-50">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 size={18} className="animate-spin text-gray-300" /></div>
                ) : companies?.length === 0 ? (
                    <p className="text-center py-8 text-sm text-gray-400">No companies yet</p>
                ) : (
                    companies?.map((c) => (
                        <div key={c.id} className="flex items-center justify-between px-5 py-3">
                            <span className="text-sm text-gray-800">{c.companyName}</span>
                            <button onClick={() => { if (confirm(`Deactivate "${c.companyName}"?`)) deleteMutation.mutate(c.id); }} className="text-red-400 hover:text-red-600 p-1">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ─── Expense Categories Tab ───────────────────────────────────────────────────

function ExpenseCategoriesTab() {
    const [newName, setNewName] = useState('');
    const queryClient = useQueryClient();

    const { data: categories, isLoading } = useQuery({
        queryKey: ['expense-categories'],
        queryFn: () => expenseApi.getCategories().then((r) => r.data.data as ExpenseCategory[]),
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => expenseApi.createCategory(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
            setNewName('');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => expenseApi.deleteCategory(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expense-categories'] }),
    });

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-lg">
            <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Expense Categories</h2>
                <p className="text-xs text-gray-400 mt-0.5">Customize categories for expense entries</p>
            </div>
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex gap-2">
                    <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) createMutation.mutate(newName.trim()); }}
                        placeholder="Category name..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => { if (newName.trim()) createMutation.mutate(newName.trim()); }}
                        disabled={createMutation.isPending || !newName.trim()}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-3 py-2 rounded-lg"
                    >
                        {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Add
                    </button>
                </div>
            </div>
            <div className="divide-y divide-gray-50">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 size={18} className="animate-spin text-gray-300" /></div>
                ) : (
                    categories?.map((c) => (
                        <div key={c.id} className="flex items-center justify-between px-5 py-3">
                            <span className="text-sm text-gray-800">{c.categoryName}</span>
                            <button onClick={() => { if (confirm(`Delete "${c.categoryName}"?`)) deleteMutation.mutate(c.id); }} className="text-red-400 hover:text-red-600 p-1">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ─── Transaction Types Tab ────────────────────────────────────────────────────

function TransactionTypesTab() {
    const { data: types, isLoading } = useQuery({
        queryKey: ['transaction-types'],
        queryFn: () => cashTransactionApi.getTypes().then((r) => r.data.data as TransactionType[]),
    });

    const inTypes = types?.filter((t) => t.transactionDirection === 'IN') ?? [];
    const outTypes = types?.filter((t) => t.transactionDirection === 'OUT') ?? [];

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-lg">
            <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Transaction Types</h2>
                <p className="text-xs text-gray-400 mt-0.5">Cash in/out transaction types</p>
            </div>
            {isLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 size={18} className="animate-spin text-gray-300" /></div>
            ) : (
                <div>
                    <div className="px-5 py-3 border-b border-gray-100 bg-green-50">
                        <p className="text-xs font-semibold text-green-700 uppercase mb-2">Cash IN</p>
                        <div className="space-y-1">
                            {inTypes.map((t) => (
                                <div key={t.id} className="flex items-center gap-2 text-sm text-gray-700">
                                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                                    {t.transactionName}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="px-5 py-3 bg-red-50">
                        <p className="text-xs font-semibold text-red-700 uppercase mb-2">Cash OUT</p>
                        <div className="space-y-1">
                            {outTypes.map((t) => (
                                <div key={t.id} className="flex items-center gap-2 text-sm text-gray-700">
                                    <span className="w-2 h-2 bg-red-400 rounded-full" />
                                    {t.transactionName}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}