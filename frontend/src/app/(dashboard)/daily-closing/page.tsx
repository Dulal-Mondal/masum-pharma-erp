// 'use client';

// import { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { dailyAccountApi } from '@/lib/api';
// import { formatCurrency, formatDate, today } from '@/lib/utils';
// import { usePrint } from '@/hooks/usePrint';
// import PrintLayout from '@/components/print/PrintLayout';
// import PrintButton from '@/components/print/PrintButton';
// import { CalendarCheck, CheckCircle, AlertCircle, Loader2, Calculator } from 'lucide-react';
// import type { DashboardData } from '@/types';

// export default function DailyClosingPage() {
//     const [selectedDate, setSelectedDate] = useState(today());
//     const [closingBalance, setClosingBalance] = useState('');
//     const [submitError, setSubmitError] = useState('');
//     const queryClient = useQueryClient();
//     const { printRef, triggerPrint } = usePrint();

//     const { data, isLoading } = useQuery({
//         queryKey: ['daily-dashboard', selectedDate],
//         queryFn: () =>
//             dailyAccountApi.getDashboard(selectedDate).then((r) => r.data.data as DashboardData),
//     });

//     const closingMutation = useMutation({
//         mutationFn: ({ date, balance }: { date: string; balance: number }) =>
//             dailyAccountApi.performClosing(date, balance),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['daily-dashboard'] });
//             queryClient.invalidateQueries({ queryKey: ['dashboard'] });
//             setSubmitError('');
//         },
//         onError: (err: unknown) => {
//             const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
//             setSubmitError(msg || 'Failed to perform closing');
//         },
//     });

//     const handleClosing = () => {
//         const balance = parseFloat(closingBalance);
//         if (isNaN(balance) || balance < 0) {
//             setSubmitError('Please enter a valid closing balance');
//             return;
//         }
//         closingMutation.mutate({ date: selectedDate, balance });
//     };

//     // Preview calculation before saving
//     const previewSales = (() => {
//         if (!data || closingBalance === '') return null;
//         const cb = parseFloat(closingBalance);
//         if (isNaN(cb)) return null;
//         const sales =
//             cb +
//             (data.purchaseAmount || 0) +
//             (data.expenseAmount || 0) +
//             (data.cashOutAmount || 0) -
//             (data.openingBalance || 0) -
//             (data.cashInAmount || 0);
//         const profit = sales - (data.purchaseAmount || 0) - (data.expenseAmount || 0);
//         return { sales: Math.max(0, sales), profit };
//     })();

//     const rows = data
//         ? [
//             { label: 'Opening Balance', value: formatCurrency(data.openingBalance), note: 'Auto-loaded from yesterday' },
//             { label: 'Purchase Amount', value: formatCurrency(data.purchaseAmount), note: 'Sum of today\'s purchases' },
//             { label: 'Expense Amount', value: formatCurrency(data.expenseAmount), note: 'Sum of today\'s expenses' },
//             { label: 'Cash In', value: formatCurrency(data.cashInAmount), note: 'Bank withdraw, loan, investment' },
//             { label: 'Cash Out', value: formatCurrency(data.cashOutAmount), note: 'Bank deposit, loan given, owner withdraw' },
//         ]
//         : [];

//     return (
//         <div>
//             {/* Header */}
//             <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center gap-3">
//                     <div className="bg-amber-100 text-amber-700 rounded-lg p-2">
//                         <CalendarCheck size={20} />
//                     </div>
//                     <div>
//                         <h1 className="text-xl font-semibold text-gray-900">Daily Closing</h1>
//                         <p className="text-xs text-gray-400 mt-0.5">Complete at end of day to calculate sales & profit</p>
//                     </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                     <div>
//                         <input
//                             type="date"
//                             value={selectedDate}
//                             onChange={(e) => setSelectedDate(e.target.value)}
//                             className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                     </div>
//                     <PrintButton onPrint={triggerPrint} disabled={!data?.isClosed} />
//                 </div>
//             </div>

//             {isLoading ? (
//                 <div className="flex items-center justify-center py-24">
//                     <Loader2 size={24} className="animate-spin text-gray-300" />
//                 </div>
//             ) : (
//                 <PrintLayout
//                     ref={printRef}
//                     title="Daily Closing Statement"
//                     subtitle={formatDate(selectedDate)}
//                     dateRange={{ startDate: selectedDate, endDate: selectedDate }}
//                 >
//                     <div className="grid md:grid-cols-2 gap-5">
//                         {/* Left: Breakdown */}
//                         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//                             <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
//                                 <h2 className="text-sm font-semibold text-gray-700">Today&apos;s Account Summary</h2>
//                             </div>

//                             {/* Print version */}
//                             <table className="w-full text-sm print-table hidden print:table">
//                                 <thead>
//                                     <tr>
//                                         <th>Particulars</th>
//                                         <th className="text-right">Amount</th>
//                                         <th>Note</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {rows.map((row) => (
//                                         <tr key={row.label}>
//                                             <td>{row.label}</td>
//                                             <td className="text-right font-medium">{row.value}</td>
//                                             <td className="text-gray-400 text-xs">{row.note}</td>
//                                         </tr>
//                                     ))}
//                                     {data?.isClosed && (
//                                         <tr>
//                                             <td>Closing Balance</td>
//                                             <td className="text-right font-medium">{formatCurrency(data.closingBalance)}</td>
//                                             <td className="text-xs text-gray-400">User entered</td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                                 {data?.isClosed && (
//                                     <tfoot>
//                                         <tr>
//                                             <td>Sales</td>
//                                             <td className="text-right">{formatCurrency(data.salesAmount)}</td>
//                                             <td></td>
//                                         </tr>
//                                         <tr>
//                                             <td className="font-bold">Net Profit</td>
//                                             <td className="text-right font-bold">{formatCurrency(data.profitAmount)}</td>
//                                             <td></td>
//                                         </tr>
//                                     </tfoot>
//                                 )}
//                             </table>

//                             {/* Screen version */}
//                             <div className="print:hidden divide-y divide-gray-50">
//                                 {rows.map((row) => (
//                                     <div key={row.label} className="flex items-center justify-between px-5 py-3">
//                                         <div>
//                                             <p className="text-sm text-gray-700">{row.label}</p>
//                                             <p className="text-xs text-gray-400">{row.note}</p>
//                                         </div>
//                                         <p className="text-sm font-semibold text-gray-900">{row.value}</p>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Right: Closing input or result */}
//                         <div>
//                             {data?.isClosed ? (
//                                 /* Already closed */
//                                 <div className="bg-green-50 border border-green-200 rounded-xl p-5">
//                                     <div className="flex items-center gap-2 mb-4">
//                                         <CheckCircle size={18} className="text-green-600" />
//                                         <h2 className="text-sm font-semibold text-green-800">Day Closed Successfully</h2>
//                                     </div>
//                                     <div className="space-y-3">
//                                         {[
//                                             { label: 'Closing Balance', value: formatCurrency(data.closingBalance), big: false },
//                                             { label: 'Today\'s Sales', value: formatCurrency(data.salesAmount), big: false },
//                                             { label: 'Today\'s Profit', value: formatCurrency(data.profitAmount), big: true },
//                                         ].map((item) => (
//                                             <div key={item.label} className="flex justify-between items-center">
//                                                 <p className="text-sm text-green-700">{item.label}</p>
//                                                 <p className={`font-bold ${item.big ? 'text-xl text-green-800' : 'text-sm text-green-800'}`}>
//                                                     {item.value}
//                                                 </p>
//                                             </div>
//                                         ))}
//                                     </div>

//                                     {/* Formula explanation */}
//                                     <div className="mt-4 pt-4 border-t border-green-200">
//                                         <p className="text-xs text-green-600 font-medium mb-1">Sales Formula:</p>
//                                         <p className="text-xs text-green-500 font-mono">
//                                             Sales = Closing + Purchase + Expense + CashOut - Opening - CashIn
//                                         </p>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 /* Closing form */
//                                 <div className="bg-white rounded-xl border border-gray-200 p-5">
//                                     <div className="flex items-center gap-2 mb-4">
//                                         <AlertCircle size={18} className="text-amber-500" />
//                                         <h2 className="text-sm font-semibold text-gray-700">Enter Closing Balance</h2>
//                                     </div>

//                                     <p className="text-xs text-gray-500 mb-4">
//                                         Count the cash in hand right now and enter the exact amount below.
//                                         System will automatically calculate today&apos;s sales and profit.
//                                     </p>

//                                     <div className="mb-4">
//                                         <label className="block text-xs font-medium text-gray-500 mb-1">
//                                             Closing Cash Balance (৳)
//                                         </label>
//                                         <input
//                                             type="number"
//                                             step="0.01"
//                                             min="0"
//                                             value={closingBalance}
//                                             onChange={(e) => setClosingBalance(e.target.value)}
//                                             placeholder="0.00"
//                                             className="w-full border border-gray-300 rounded-lg px-3 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                         />
//                                     </div>

//                                     {/* Live preview */}
//                                     {previewSales && (
//                                         <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
//                                             <div className="flex items-center gap-1.5 mb-2">
//                                                 <Calculator size={13} className="text-blue-600" />
//                                                 <p className="text-xs font-medium text-blue-700">Preview Calculation</p>
//                                             </div>
//                                             <div className="flex justify-between text-sm">
//                                                 <span className="text-blue-600">Estimated Sales:</span>
//                                                 <span className="font-semibold text-blue-800">{formatCurrency(previewSales.sales)}</span>
//                                             </div>
//                                             <div className="flex justify-between text-sm mt-1">
//                                                 <span className="text-blue-600">Estimated Profit:</span>
//                                                 <span className={`font-semibold ${previewSales.profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
//                                                     {formatCurrency(previewSales.profit)}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     )}

//                                     {submitError && (
//                                         <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
//                                             <p className="text-xs text-red-600">{submitError}</p>
//                                         </div>
//                                     )}

//                                     <button
//                                         onClick={handleClosing}
//                                         disabled={closingMutation.isPending || !closingBalance}
//                                         className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
//                                     >
//                                         {closingMutation.isPending && <Loader2 size={16} className="animate-spin" />}
//                                         Confirm Daily Closing
//                                     </button>
//                                 </div>
//                             )}

//                             {/* Formula card */}
//                             <div className="mt-4 bg-gray-50 rounded-xl border border-gray-200 p-4">
//                                 <p className="text-xs font-semibold text-gray-500 uppercase mb-2">How It Works</p>
//                                 <div className="text-xs text-gray-500 space-y-1 font-mono">
//                                     <p>Sales = Closing + Purchase</p>
//                                     <p>      + Expense + CashOut</p>
//                                     <p>      - Opening - CashIn</p>
//                                     <div className="border-t border-gray-200 pt-1 mt-1 not-italic font-sans">
//                                         <p>Profit = Sales - Purchase - Expense</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </PrintLayout>
//             )}
//         </div>
//     );
// }






'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyAccountApi } from '@/lib/api';
import { formatCurrency, formatDate, today } from '@/lib/utils';
import { usePrint } from '@/hooks/usePrint';
import PrintLayout from '@/components/print/PrintLayout';
import PrintButton from '@/components/print/PrintButton';
import { CalendarCheck, CheckCircle, AlertCircle, Loader2, Calculator } from 'lucide-react';
import type { DashboardData } from '@/types';

export default function DailyClosingPage() {
    const [selectedDate, setSelectedDate] = useState(today());
    const [closingBalance, setClosingBalance] = useState('');
    const [submitError, setSubmitError] = useState('');
    const queryClient = useQueryClient();
    const { printRef, triggerPrint } = usePrint();

    const { data, isLoading } = useQuery({
        queryKey: ['daily-dashboard', selectedDate],
        queryFn: () =>
            dailyAccountApi.getDashboard(selectedDate).then((r) => r.data.data as DashboardData),
    });

    const closingMutation = useMutation({
        mutationFn: ({ date, balance }: { date: string; balance: number }) =>
            dailyAccountApi.performClosing(date, balance),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['daily-dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            setSubmitError('');
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setSubmitError(msg || 'Failed to perform closing');
        },
    });

    const handleClosing = () => {
        const balance = parseFloat(closingBalance);
        if (isNaN(balance) || balance < 0) {
            setSubmitError('Please enter a valid closing balance');
            return;
        }
        closingMutation.mutate({ date: selectedDate, balance });
    };

    // Preview calculation before saving
    const previewSales = (() => {
        if (!data || closingBalance === '') return null;
        const cb = parseFloat(closingBalance);
        if (isNaN(cb)) return null;
        const sales =
            cb +
            (data.purchaseAmount || 0) +
            (data.expenseAmount || 0) +
            (data.cashOutAmount || 0) -
            (data.openingBalance || 0) -
            (data.cashInAmount || 0);
        const profit = sales - (data.purchaseAmount || 0) - (data.expenseAmount || 0);
        return { sales: Math.max(0, sales), profit };
    })();

    const rows = data
        ? [
            { label: 'Opening Balance', value: formatCurrency(data.openingBalance), note: 'Auto-loaded from yesterday' },
            { label: 'Purchase Amount', value: formatCurrency(data.purchaseAmount), note: 'Sum of today\'s purchases' },
            { label: 'Expense Amount', value: formatCurrency(data.expenseAmount), note: 'Sum of today\'s expenses' },
            { label: 'Cash In', value: formatCurrency(data.cashInAmount), note: 'Bank withdraw, loan, investment' },
            { label: 'Cash Out', value: formatCurrency(data.cashOutAmount), note: 'Bank deposit, loan given, owner withdraw' },
        ]
        : [];

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-100 text-amber-700 rounded-lg p-2">
                        <CalendarCheck size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Daily Closing</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Complete at end of day to calculate sales & profit</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <PrintButton onPrint={triggerPrint} disabled={!data?.isClosed} />
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 size={24} className="animate-spin text-gray-300" />
                </div>
            ) : (
                <PrintLayout
                    ref={printRef}
                    title="Daily Closing Statement"
                    subtitle={formatDate(selectedDate)}
                    dateRange={{ startDate: selectedDate, endDate: selectedDate }}
                >
                    <div className="grid md:grid-cols-2 gap-5">
                        {/* Left: Breakdown */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                                <h2 className="text-sm font-semibold text-gray-700">Today&apos;s Account Summary</h2>
                            </div>

                            {/* Print version */}
                            <table className="w-full text-sm print-table hidden print:table">
                                <thead>
                                    <tr>
                                        <th>Particulars</th>
                                        <th className="text-right">Amount</th>
                                        <th>Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row) => (
                                        <tr key={row.label}>
                                            <td>{row.label}</td>
                                            <td className="text-right font-medium">{row.value}</td>
                                            <td className="text-gray-400 text-xs">{row.note}</td>
                                        </tr>
                                    ))}
                                    {data?.isClosed && (
                                        <tr>
                                            <td>Closing Balance</td>
                                            <td className="text-right font-medium">{formatCurrency(data.closingBalance)}</td>
                                            <td className="text-xs text-gray-400">User entered</td>
                                        </tr>
                                    )}
                                </tbody>
                                {data?.isClosed && (
                                    <tfoot>
                                        <tr>
                                            <td>Sales</td>
                                            <td className="text-right">{formatCurrency(data.salesAmount)}</td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td className="font-bold">Net Profit</td>
                                            <td className="text-right font-bold">{formatCurrency(data.profitAmount)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>

                            {/* Screen version */}
                            <div className="print:hidden divide-y divide-gray-50">
                                {rows.map((row) => (
                                    <div key={row.label} className="flex items-center justify-between px-5 py-3">
                                        <div>
                                            <p className="text-sm text-gray-700">{row.label}</p>
                                            <p className="text-xs text-gray-400">{row.note}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900">{row.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Closing input or result */}
                        <div>
                            {data?.isClosed ? (
                                /* Already closed */
                                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle size={18} className="text-green-600" />
                                        <h2 className="text-sm font-semibold text-green-800">Day Closed Successfully</h2>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Closing Balance', value: formatCurrency(data.closingBalance), big: false },
                                            { label: 'Today\'s Sales', value: formatCurrency(data.salesAmount), big: false },
                                            { label: 'Today\'s Profit', value: formatCurrency(data.profitAmount), big: true },
                                        ].map((item) => (
                                            <div key={item.label} className="flex justify-between items-center">
                                                <p className="text-sm text-green-700">{item.label}</p>
                                                <p className={`font-bold ${item.big ? 'text-xl text-green-800' : 'text-sm text-green-800'}`}>
                                                    {item.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Formula explanation */}
                                    <div className="mt-4 pt-4 border-t border-green-200">
                                        <p className="text-xs text-green-600 font-medium mb-1">Sales Formula:</p>
                                        <p className="text-xs text-green-500 font-mono">
                                            Sales = Closing + Purchase + Expense + CashOut - Opening - CashIn
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* Closing form */
                                <div className="bg-white rounded-xl border border-gray-200 p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <AlertCircle size={18} className="text-amber-500" />
                                        <h2 className="text-sm font-semibold text-gray-700">Enter Closing Balance</h2>
                                    </div>

                                    <p className="text-xs text-gray-500 mb-4">
                                        Count the cash in hand right now and enter the exact amount below.
                                        System will automatically calculate today&apos;s sales and profit.
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
                                    {previewSales && (
                                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <Calculator size={13} className="text-blue-600" />
                                                <p className="text-xs font-medium text-blue-700">Preview Calculation</p>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-blue-600">Estimated Sales:</span>
                                                <span className="font-semibold text-blue-800">{formatCurrency(previewSales.sales)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm mt-1">
                                                <span className="text-blue-600">Estimated Profit:</span>
                                                <span className={`font-semibold ${previewSales.profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                                    {formatCurrency(previewSales.profit)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {submitError && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                                            <p className="text-xs text-red-600">{submitError}</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleClosing}
                                        disabled={closingMutation.isPending || !closingBalance}
                                        className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
                                    >
                                        {closingMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                                        Confirm Daily Closing
                                    </button>
                                </div>
                            )}

                            {/* Formula card */}
                            {/* <div className="mt-4 bg-gray-50 rounded-xl border border-gray-200 p-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">How It Works</p>
                                <div className="text-xs text-gray-500 space-y-1 font-mono">
                                    <p>Sales = Closing + Purchase</p>
                                    <p>      + Expense + CashOut</p>
                                    <p>      - Opening - CashIn</p>
                                    <div className="border-t border-gray-200 pt-1 mt-1 not-italic font-sans">
                                        <p>Profit = Sales - Purchase - Expense</p>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </PrintLayout>
            )}
        </div>
    );
}