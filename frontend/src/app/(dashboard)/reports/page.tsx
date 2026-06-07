// 'use client';

// import { useState, useRef } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { reportApi, dailyAccountApi } from '@/lib/api';
// import { formatCurrency, formatDate, currentMonthRange } from '@/lib/utils';
// import { usePrint } from '@/hooks/usePrint';
// import PrintLayout from '@/components/print/PrintLayout';
// import PrintButton from '@/components/print/PrintButton';
// import { BarChart3, FileText, Building2, Receipt, ArrowLeftRight, CalendarRange, RefreshCcw } from 'lucide-react';
// import type { DailyAccount, Purchase, Expense, CashTransaction, Company } from '@/types';
// import { companyApi } from '@/lib/api';

// type ReportTab = 'daily' | 'purchase' | 'company-purchase' | 'expense' | 'cash' | 'monthly';

// const tabs = [
//     { id: 'daily' as ReportTab, label: 'Daily Report', icon: FileText },
//     { id: 'purchase' as ReportTab, label: 'Purchase Report', icon: FileText },
//     { id: 'company-purchase' as ReportTab, label: 'Company Wise Purchase', icon: Building2 },
//     { id: 'expense' as ReportTab, label: 'Expense Report', icon: Receipt },
//     { id: 'cash' as ReportTab, label: 'Cash Transactions', icon: ArrowLeftRight },
//     { id: 'monthly' as ReportTab, label: 'Monthly Summary', icon: CalendarRange },
// ];

// export default function ReportsPage() {
//     const [activeTab, setActiveTab] = useState<ReportTab>('daily');
//     const { startDate: defaultStart, endDate: defaultEnd } = currentMonthRange();
//     const [dateRange, setDateRange] = useState({ startDate: defaultStart, endDate: defaultEnd });
//     const [companyId, setCompanyId] = useState('');
//     const [monthYear, setMonthYear] = useState({
//         year: new Date().getFullYear(),
//         month: new Date().getMonth() + 1,
//     });

//     const { printRef, triggerPrint } = usePrint();

//     const { data: companiesData } = useQuery({
//         queryKey: ['companies'],
//         queryFn: () => companyApi.getAll().then((r) => r.data.data as Company[]),
//     });

//     // ─── Daily Report ───────────────────────────────────────────────────────────
//     const { data: dailyData, isLoading: dailyLoading, refetch: refetchDaily } = useQuery({
//         queryKey: ['report-daily', dateRange],
//         queryFn: () =>
//             reportApi.getDaily(dateRange.startDate, dateRange.endDate).then((r) => r.data.data as DailyAccount[]),
//         enabled: activeTab === 'daily',
//     });

//     // ─── Purchase Report ────────────────────────────────────────────────────────
//     const { data: purchaseData, isLoading: purchaseLoading, refetch: refetchPurchase } = useQuery({
//         queryKey: ['report-purchase', dateRange, companyId],
//         queryFn: () =>
//             reportApi
//                 .getPurchase(dateRange.startDate, dateRange.endDate, companyId ? Number(companyId) : undefined)
//                 .then((r) => r.data.data as Purchase[]),
//         enabled: activeTab === 'purchase',
//     });

//     // ─── Company Wise ───────────────────────────────────────────────────────────
//     const { data: companyWiseData, isLoading: companyWiseLoading, refetch: refetchCompanyWise } = useQuery({
//         queryKey: ['report-company-wise', dateRange],
//         queryFn: () =>
//             reportApi.getCompanyWisePurchase(dateRange.startDate, dateRange.endDate).then((r) => r.data.data),
//         enabled: activeTab === 'company-purchase',
//     });

//     // ─── Expense Report ─────────────────────────────────────────────────────────
//     const { data: expenseData, isLoading: expenseLoading, refetch: refetchExpense } = useQuery({
//         queryKey: ['report-expense', dateRange],
//         queryFn: () =>
//             reportApi.getExpense(dateRange.startDate, dateRange.endDate).then((r) => r.data.data as Expense[]),
//         enabled: activeTab === 'expense',
//     });

//     // ─── Cash Transaction Report ────────────────────────────────────────────────
//     const { data: cashData, isLoading: cashLoading, refetch: refetchCash } = useQuery({
//         queryKey: ['report-cash', dateRange],
//         queryFn: () =>
//             reportApi.getCashTransactions(dateRange.startDate, dateRange.endDate).then((r) => r.data.data as CashTransaction[]),
//         enabled: activeTab === 'cash',
//     });

//     // ─── Monthly Summary ────────────────────────────────────────────────────────
//     const { data: monthlyData, isLoading: monthlyLoading, refetch: refetchMonthly } = useQuery({
//         queryKey: ['report-monthly', monthYear],
//         queryFn: () =>
//             dailyAccountApi.getMonthlySummary(monthYear.year, monthYear.month).then((r) => r.data.data),
//         enabled: activeTab === 'monthly',
//     });

//     const handleRefetch = () => {
//         if (activeTab === 'daily') refetchDaily();
//         else if (activeTab === 'purchase') refetchPurchase();
//         else if (activeTab === 'company-purchase') refetchCompanyWise();
//         else if (activeTab === 'expense') refetchExpense();
//         else if (activeTab === 'cash') refetchCash();
//         else if (activeTab === 'monthly') refetchMonthly();
//     };

//     const isLoading = dailyLoading || purchaseLoading || companyWiseLoading || expenseLoading || cashLoading || monthlyLoading;

//     const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

//     return (
//         <div>
//             {/* Page Header */}
//             <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center gap-3">
//                     <div className="bg-blue-100 text-blue-700 rounded-lg p-2">
//                         <BarChart3 size={20} />
//                     </div>
//                     <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
//                 </div>
//                 <div className="flex items-center gap-2">
//                     <button
//                         onClick={handleRefetch}
//                         className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
//                     >
//                         <RefreshCcw size={13} />
//                         Refresh
//                     </button>
//                     <PrintButton onPrint={triggerPrint} disabled={isLoading} />
//                 </div>
//             </div>

//             {/* Tabs */}
//             <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 overflow-x-auto">
//                 {tabs.map(({ id, label, icon: Icon }) => (
//                     <button
//                         key={id}
//                         onClick={() => setActiveTab(id)}
//                         className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === id
//                             ? 'bg-white text-blue-700 shadow-sm'
//                             : 'text-gray-500 hover:text-gray-700'
//                             }`}
//                     >
//                         <Icon size={13} />
//                         {label}
//                     </button>
//                 ))}
//             </div>

//             {/* Filters */}
//             <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
//                 {activeTab === 'monthly' ? (
//                     <div className="flex gap-3 items-end">
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
//                             <input
//                                 type="number"
//                                 value={monthYear.year}
//                                 onChange={(e) => setMonthYear((m) => ({ ...m, year: Number(e.target.value) }))}
//                                 className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
//                             <select
//                                 value={monthYear.month}
//                                 onChange={(e) => setMonthYear((m) => ({ ...m, month: Number(e.target.value) }))}
//                                 className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             >
//                                 {monthNames.map((name, i) => (
//                                     <option key={i + 1} value={i + 1}>{name}</option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="flex flex-wrap gap-3 items-end">
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
//                             <input
//                                 type="date"
//                                 value={dateRange.startDate}
//                                 onChange={(e) => setDateRange((d) => ({ ...d, startDate: e.target.value }))}
//                                 className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
//                             <input
//                                 type="date"
//                                 value={dateRange.endDate}
//                                 onChange={(e) => setDateRange((d) => ({ ...d, endDate: e.target.value }))}
//                                 className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                         </div>
//                         {activeTab === 'purchase' && (
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
//                                 <select
//                                     value={companyId}
//                                     onChange={(e) => setCompanyId(e.target.value)}
//                                     className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 >
//                                     <option value="">All Companies</option>
//                                     {companiesData?.map((c) => (
//                                         <option key={c.id} value={c.id}>{c.companyName}</option>
//                                     ))}
//                                 </select>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>

//             {/* Report Content — this div gets printed */}
//             <PrintLayout
//                 ref={printRef}
//                 title={tabs.find((t) => t.id === activeTab)?.label ?? 'Report'}
//                 dateRange={activeTab !== 'monthly' ? dateRange : undefined}
//                 subtitle={activeTab === 'monthly' ? `${monthNames[monthYear.month - 1]} ${monthYear.year}` : undefined}
//             >
//                 {isLoading ? (
//                     <div className="flex items-center justify-center py-16">
//                         <RefreshCcw size={20} className="animate-spin text-gray-300" />
//                     </div>
//                 ) : (
//                     <>
//                         {/* ── Daily Report ── */}
//                         {activeTab === 'daily' && (
//                             <DailyReportTable data={dailyData ?? []} />
//                         )}

//                         {/* ── Purchase Report ── */}
//                         {activeTab === 'purchase' && (
//                             <PurchaseReportTable data={purchaseData ?? []} />
//                         )}

//                         {/* ── Company Wise Purchase ── */}
//                         {activeTab === 'company-purchase' && (
//                             <CompanyWiseTable data={companyWiseData ?? []} />
//                         )}

//                         {/* ── Expense Report ── */}
//                         {activeTab === 'expense' && (
//                             <ExpenseReportTable data={expenseData ?? []} />
//                         )}

//                         {/* ── Cash Transaction Report ── */}
//                         {activeTab === 'cash' && (
//                             <CashReportTable data={cashData ?? []} />
//                         )}

//                         {/* ── Monthly Summary ── */}
//                         {activeTab === 'monthly' && monthlyData && (
//                             <MonthlySummaryView data={monthlyData} />
//                         )}
//                     </>
//                 )}
//             </PrintLayout>
//         </div>
//     );
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function DailyReportTable({ data }: { data: DailyAccount[] }) {
//     const totals = data.reduce(
//         (acc, row) => ({
//             purchase: acc.purchase + Number(row.purchaseAmount),
//             expense: acc.expense + Number(row.expenseAmount),
//             cashIn: acc.cashIn + Number(row.cashInAmount),
//             cashOut: acc.cashOut + Number(row.cashOutAmount),
//             sales: acc.sales + Number(row.salesAmount),
//             profit: acc.profit + Number(row.profitAmount),
//         }),
//         { purchase: 0, expense: 0, cashIn: 0, cashOut: 0, sales: 0, profit: 0 }
//     );

//     return (
//         <div>
//             <div className="overflow-x-auto">
//                 <table className="w-full text-sm print-table">
//                     <thead>
//                         <tr>
//                             <th>Date</th>
//                             <th className="text-right">Opening</th>
//                             <th className="text-right">Purchase</th>
//                             <th className="text-right">Expense</th>
//                             <th className="text-right">Cash In</th>
//                             <th className="text-right">Cash Out</th>
//                             <th className="text-right">Sales</th>
//                             <th className="text-right">Profit</th>
//                             <th className="text-right">Closing</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {data.length === 0 ? (
//                             <tr><td colSpan={9} className="text-center py-8 text-gray-400">No data found</td></tr>
//                         ) : (
//                             data.map((row) => (
//                                 <tr key={row.id}>
//                                     <td>{formatDate(row.accountDate)}</td>
//                                     <td className="text-right">{formatCurrency(Number(row.openingBalance))}</td>
//                                     <td className="text-right">{formatCurrency(Number(row.purchaseAmount))}</td>
//                                     <td className="text-right">{formatCurrency(Number(row.expenseAmount))}</td>
//                                     <td className="text-right">{formatCurrency(Number(row.cashInAmount))}</td>
//                                     <td className="text-right">{formatCurrency(Number(row.cashOutAmount))}</td>
//                                     <td className="text-right font-medium">{formatCurrency(Number(row.salesAmount))}</td>
//                                     <td className={`text-right font-medium ${Number(row.profitAmount) >= 0 ? 'text-green-700' : 'text-red-600'}`}>
//                                         {formatCurrency(Number(row.profitAmount))}
//                                     </td>
//                                     <td className="text-right">{formatCurrency(Number(row.closingBalance))}</td>
//                                 </tr>
//                             ))
//                         )}
//                     </tbody>
//                     {data.length > 0 && (
//                         <tfoot>
//                             <tr>
//                                 <td className="font-bold">Total ({data.length} days)</td>
//                                 <td className="text-right">—</td>
//                                 <td className="text-right">{formatCurrency(totals.purchase)}</td>
//                                 <td className="text-right">{formatCurrency(totals.expense)}</td>
//                                 <td className="text-right">{formatCurrency(totals.cashIn)}</td>
//                                 <td className="text-right">{formatCurrency(totals.cashOut)}</td>
//                                 <td className="text-right">{formatCurrency(totals.sales)}</td>
//                                 <td className="text-right">{formatCurrency(totals.profit)}</td>
//                                 <td className="text-right">—</td>
//                             </tr>
//                         </tfoot>
//                     )}
//                 </table>
//             </div>
//         </div>
//     );
// }

// function PurchaseReportTable({ data }: { data: Purchase[] }) {
//     const total = data.reduce((sum, p) => sum + Number(p.totalAmount), 0);

//     return (
//         <div className="overflow-x-auto">
//             <table className="w-full text-sm print-table">
//                 <thead>
//                     <tr>
//                         <th>Date</th>
//                         <th>Invoice No.</th>
//                         <th>Company</th>
//                         <th>Items</th>
//                         <th className="text-right">Amount</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {data.length === 0 ? (
//                         <tr><td colSpan={5} className="text-center py-8 text-gray-400">No data found</td></tr>
//                     ) : (
//                         data.map((p) => (
//                             <tr key={p.id}>
//                                 <td>{formatDate(p.purchaseDate)}</td>
//                                 <td>{p.invoiceNo || '—'}</td>
//                                 <td className="font-medium">{p.company.companyName}</td>
//                                 <td>{p.items.length}</td>
//                                 <td className="text-right font-medium">{formatCurrency(Number(p.totalAmount))}</td>
//                             </tr>
//                         ))
//                     )}
//                 </tbody>
//                 {data.length > 0 && (
//                     <tfoot>
//                         <tr>
//                             <td colSpan={4} className="font-bold text-right">Total ({data.length} invoices)</td>
//                             <td className="text-right">{formatCurrency(total)}</td>
//                         </tr>
//                     </tfoot>
//                 )}
//             </table>
//         </div>
//     );
// }

// function CompanyWiseTable({ data }: { data: Array<{ companyId: number; companyName: string; totalAmount: number; invoiceCount: number }> }) {
//     const grandTotal = data.reduce((sum, row) => sum + Number(row.totalAmount), 0);
//     const sorted = [...data].sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount));

//     return (
//         <div className="overflow-x-auto">
//             <table className="w-full text-sm print-table">
//                 <thead>
//                     <tr>
//                         <th>#</th>
//                         <th>Company Name</th>
//                         <th className="text-right">Invoices</th>
//                         <th className="text-right">Total Purchase</th>
//                         <th className="text-right">% of Total</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {sorted.length === 0 ? (
//                         <tr><td colSpan={5} className="text-center py-8 text-gray-400">No data found</td></tr>
//                     ) : (
//                         sorted.map((row, idx) => (
//                             <tr key={row.companyId}>
//                                 <td>{idx + 1}</td>
//                                 <td className="font-medium">{row.companyName}</td>
//                                 <td className="text-right">{row.invoiceCount}</td>
//                                 <td className="text-right font-medium">{formatCurrency(Number(row.totalAmount))}</td>
//                                 <td className="text-right text-gray-500">
//                                     {grandTotal > 0 ? ((Number(row.totalAmount) / grandTotal) * 100).toFixed(1) : 0}%
//                                 </td>
//                             </tr>
//                         ))
//                     )}
//                 </tbody>
//                 {sorted.length > 0 && (
//                     <tfoot>
//                         <tr>
//                             <td colSpan={2} className="font-bold">Total ({sorted.length} companies)</td>
//                             <td className="text-right">{sorted.reduce((s, r) => s + r.invoiceCount, 0)}</td>
//                             <td className="text-right">{formatCurrency(grandTotal)}</td>
//                             <td className="text-right">100%</td>
//                         </tr>
//                     </tfoot>
//                 )}
//             </table>
//         </div>
//     );
// }

// function ExpenseReportTable({ data }: { data: Expense[] }) {
//     const total = data.reduce((sum, e) => sum + Number(e.amount), 0);

//     return (
//         <div className="overflow-x-auto">
//             <table className="w-full text-sm print-table">
//                 <thead>
//                     <tr>
//                         <th>Date</th>
//                         <th>Category</th>
//                         <th>Note</th>
//                         <th className="text-right">Amount</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {data.length === 0 ? (
//                         <tr><td colSpan={4} className="text-center py-8 text-gray-400">No data found</td></tr>
//                     ) : (
//                         data.map((e) => (
//                             <tr key={e.id}>
//                                 <td>{formatDate(e.expenseDate)}</td>
//                                 <td className="font-medium">{e.category.categoryName}</td>
//                                 <td className="text-gray-500">{e.note || '—'}</td>
//                                 <td className="text-right">{formatCurrency(Number(e.amount))}</td>
//                             </tr>
//                         ))
//                     )}
//                 </tbody>
//                 {data.length > 0 && (
//                     <tfoot>
//                         <tr>
//                             <td colSpan={3} className="font-bold text-right">Total ({data.length} entries)</td>
//                             <td className="text-right">{formatCurrency(total)}</td>
//                         </tr>
//                     </tfoot>
//                 )}
//             </table>
//         </div>
//     );
// }

// function CashReportTable({ data }: { data: CashTransaction[] }) {
//     const cashIn = data.filter((t) => t.transactionType.transactionDirection === 'IN').reduce((s, t) => s + Number(t.amount), 0);
//     const cashOut = data.filter((t) => t.transactionType.transactionDirection === 'OUT').reduce((s, t) => s + Number(t.amount), 0);

//     return (
//         <div>
//             <div className="overflow-x-auto">
//                 <table className="w-full text-sm print-table">
//                     <thead>
//                         <tr>
//                             <th>Date</th>
//                             <th>Type</th>
//                             <th>Direction</th>
//                             <th>Note</th>
//                             <th className="text-right">Amount</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {data.length === 0 ? (
//                             <tr><td colSpan={5} className="text-center py-8 text-gray-400">No data found</td></tr>
//                         ) : (
//                             data.map((t) => (
//                                 <tr key={t.id}>
//                                     <td>{formatDate(t.transactionDate)}</td>
//                                     <td className="font-medium">{t.transactionType.transactionName}</td>
//                                     <td>
//                                         <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${t.transactionType.transactionDirection === 'IN'
//                                             ? 'bg-green-100 text-green-700'
//                                             : 'bg-red-100 text-red-700'
//                                             }`}>
//                                             {t.transactionType.transactionDirection === 'IN' ? '↓ IN' : '↑ OUT'}
//                                         </span>
//                                     </td>
//                                     <td className="text-gray-500">{t.note || '—'}</td>
//                                     <td className="text-right">{formatCurrency(Number(t.amount))}</td>
//                                 </tr>
//                             ))
//                         )}
//                     </tbody>
//                     {data.length > 0 && (
//                         <tfoot>
//                             <tr>
//                                 <td colSpan={4} className="font-bold text-right">
//                                     Cash In: {formatCurrency(cashIn)} | Cash Out: {formatCurrency(cashOut)}
//                                 </td>
//                                 <td className="text-right">{formatCurrency(cashIn - cashOut)}</td>
//                             </tr>
//                         </tfoot>
//                     )}
//                 </table>
//             </div>
//         </div>
//     );
// }

// function MonthlySummaryView({ data }: {
//     data: {
//         year: number; month: number;
//         totalPurchase: number; totalExpense: number;
//         totalCashIn: number; totalCashOut: number;
//         totalSales: number; totalProfit: number;
//     }
// }) {
//     const cards = [
//         { label: 'Total Purchase', value: formatCurrency(data.totalPurchase), highlight: false },
//         { label: 'Total Expense', value: formatCurrency(data.totalExpense), highlight: false },
//         { label: 'Total Cash In', value: formatCurrency(data.totalCashIn), highlight: false },
//         { label: 'Total Cash Out', value: formatCurrency(data.totalCashOut), highlight: false },
//         { label: 'Total Sales', value: formatCurrency(data.totalSales), highlight: false },
//         { label: 'Total Profit', value: formatCurrency(data.totalProfit), highlight: true },
//     ];

//     return (
//         <div>
//             {/* Screen view */}
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:hidden">
//                 {cards.map((card) => (
//                     <div
//                         key={card.label}
//                         className={`rounded-xl border p-5 ${card.highlight ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200'}`}
//                     >
//                         <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${card.highlight ? 'text-blue-100' : 'text-gray-500'}`}>
//                             {card.label}
//                         </p>
//                         <p className={`text-2xl font-bold ${card.highlight ? 'text-white' : 'text-gray-900'}`}>
//                             {card.value}
//                         </p>
//                     </div>
//                 ))}
//             </div>

//             {/* Print view */}
//             <div className="print-summary-grid hidden print:grid">
//                 {cards.map((card) => (
//                     <div key={card.label} className={`print-summary-card ${card.highlight ? 'highlight' : ''}`}>
//                         <div className="label">{card.label}</div>
//                         <div className="value">{card.value}</div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }











// 'use client';

// import { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { reportApi, dailyAccountApi, companyApi } from '@/lib/api';
// import { formatCurrency, formatDate, currentMonthRange } from '@/lib/utils';
// import { BarChart3, FileSpreadsheet, FileDown, RefreshCcw, Loader2 } from 'lucide-react';
// import type { DailyAccount, Purchase, Expense, CashTransaction, Company } from '@/types';

// const SHOP_NAME = 'Masum Pharma Ltd.';

// type ReportTab = 'daily' | 'purchase' | 'company-purchase' | 'expense' | 'cash' | 'monthly';

// const tabs = [
//     { id: 'daily' as ReportTab, label: 'Daily Report' },
//     { id: 'purchase' as ReportTab, label: 'Purchase Report' },
//     { id: 'company-purchase' as ReportTab, label: 'Company Wise Purchase' },
//     { id: 'expense' as ReportTab, label: 'Expense Report' },
//     { id: 'cash' as ReportTab, label: 'Cash Transactions' },
//     { id: 'monthly' as ReportTab, label: 'Monthly Summary' },
// ];

// const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// export default function ReportsPage() {
//     const [activeTab, setActiveTab] = useState<ReportTab>('daily');
//     const { startDate: defaultStart, endDate: defaultEnd } = currentMonthRange();
//     const [dateRange, setDateRange] = useState({ startDate: defaultStart, endDate: defaultEnd });
//     const [companyId, setCompanyId] = useState('');
//     const [monthYear, setMonthYear] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
//     const [isExporting, setIsExporting] = useState(false);

//     const { data: companiesData } = useQuery({
//         queryKey: ['companies'],
//         queryFn: () => companyApi.getAll().then((r) => r.data.data as Company[]),
//     });

//     const { data: dailyData, isLoading: dailyLoading, refetch: refetchDaily } = useQuery({
//         queryKey: ['report-daily', dateRange],
//         queryFn: () => reportApi.getDaily(dateRange.startDate, dateRange.endDate).then((r) => r.data.data as DailyAccount[]),
//         enabled: activeTab === 'daily',
//     });

//     const { data: purchaseData, isLoading: purchaseLoading, refetch: refetchPurchase } = useQuery({
//         queryKey: ['report-purchase', dateRange, companyId],
//         queryFn: () => reportApi.getPurchase(dateRange.startDate, dateRange.endDate, companyId ? Number(companyId) : undefined).then((r) => r.data.data as Purchase[]),
//         enabled: activeTab === 'purchase',
//     });

//     const { data: companyWiseData, isLoading: companyWiseLoading, refetch: refetchCompanyWise } = useQuery({
//         queryKey: ['report-company-wise', dateRange],
//         queryFn: () => reportApi.getCompanyWisePurchase(dateRange.startDate, dateRange.endDate).then((r) => r.data.data),
//         enabled: activeTab === 'company-purchase',
//     });

//     const { data: expenseData, isLoading: expenseLoading, refetch: refetchExpense } = useQuery({
//         queryKey: ['report-expense', dateRange],
//         queryFn: () => reportApi.getExpense(dateRange.startDate, dateRange.endDate).then((r) => r.data.data as Expense[]),
//         enabled: activeTab === 'expense',
//     });

//     const { data: cashData, isLoading: cashLoading, refetch: refetchCash } = useQuery({
//         queryKey: ['report-cash', dateRange],
//         queryFn: () => reportApi.getCashTransactions(dateRange.startDate, dateRange.endDate).then((r) => r.data.data as CashTransaction[]),
//         enabled: activeTab === 'cash',
//     });

//     const { data: monthlyData, isLoading: monthlyLoading, refetch: refetchMonthly } = useQuery({
//         queryKey: ['report-monthly', monthYear],
//         queryFn: () => dailyAccountApi.getMonthlySummary(monthYear.year, monthYear.month).then((r) => r.data.data),
//         enabled: activeTab === 'monthly',
//     });

//     const isLoading = dailyLoading || purchaseLoading || companyWiseLoading || expenseLoading || cashLoading || monthlyLoading;

//     const handleRefetch = () => {
//         if (activeTab === 'daily') refetchDaily();
//         else if (activeTab === 'purchase') refetchPurchase();
//         else if (activeTab === 'company-purchase') refetchCompanyWise();
//         else if (activeTab === 'expense') refetchExpense();
//         else if (activeTab === 'cash') refetchCash();
//         else if (activeTab === 'monthly') refetchMonthly();
//     };

//     // ─── PDF Export ────────────────────────────────────────────────────────────
//     const exportPDF = async () => {
//         setIsExporting(true);
//         try {
//             const { default: jsPDF } = await import('jspdf');
//             const { default: autoTable } = await import('jspdf-autotable');

//             const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
//             const tabLabel = tabs.find((t) => t.id === activeTab)?.label ?? 'Report';
//             const periodText = activeTab === 'monthly'
//                 ? `${monthNames[monthYear.month - 1]} ${monthYear.year}`
//                 : `${formatDate(dateRange.startDate)} — ${formatDate(dateRange.endDate)}`;

//             // Header
//             doc.setFontSize(16);
//             doc.setFont('helvetica', 'bold');
//             doc.text(SHOP_NAME, 148, 15, { align: 'center' });
//             doc.setFontSize(12);
//             doc.setFont('helvetica', 'normal');
//             doc.text(tabLabel, 148, 22, { align: 'center' });
//             doc.setFontSize(9);
//             doc.text(`Period: ${periodText}`, 148, 28, { align: 'center' });
//             doc.text(`Printed: ${new Date().toLocaleString()}`, 148, 33, { align: 'center' });

//             // Table
//             const { head, body, foot } = getTableData();
//             autoTable(doc, {
//                 head: [head],
//                 body,
//                 foot: foot ? [foot] : undefined,
//                 startY: 38,
//                 styles: { fontSize: 8, cellPadding: 2 },
//                 headStyles: { fillColor: [30, 30, 30], textColor: 255, fontStyle: 'bold' },
//                 footStyles: { fillColor: [240, 240, 240], fontStyle: 'bold' },
//                 alternateRowStyles: { fillColor: [250, 250, 250] },
//             });

//             doc.save(`${SHOP_NAME} - ${tabLabel} - ${periodText}.pdf`);
//         } catch {
//             alert('PDF export failed. Please run: npm install jspdf jspdf-autotable');
//         } finally {
//             setIsExporting(false);
//         }
//     };

//     // ─── XLSX Export ───────────────────────────────────────────────────────────
//     const exportXLSX = async () => {
//         setIsExporting(true);
//         try {
//             const XLSX = await import('xlsx');
//             const tabLabel = tabs.find((t) => t.id === activeTab)?.label ?? 'Report';
//             const periodText = activeTab === 'monthly'
//                 ? `${monthNames[monthYear.month - 1]} ${monthYear.year}`
//                 : `${formatDate(dateRange.startDate)} — ${formatDate(dateRange.endDate)}`;

//             const { head, body, foot } = getTableData();
//             const wsData = [
//                 [SHOP_NAME],
//                 [tabLabel],
//                 [`Period: ${periodText}`],
//                 [`Printed: ${new Date().toLocaleString()}`],
//                 [],
//                 head,
//                 ...body,
//                 ...(foot ? [foot] : []),
//             ];

//             const ws = XLSX.utils.aoa_to_sheet(wsData);
//             const wb = XLSX.utils.book_new();
//             XLSX.utils.book_append_sheet(wb, ws, tabLabel.substring(0, 31));
//             XLSX.writeFile(wb, `${SHOP_NAME} - ${tabLabel} - ${periodText}.xlsx`);
//         } catch {
//             alert('XLSX export failed. Please run: npm install xlsx');
//         } finally {
//             setIsExporting(false);
//         }
//     };

//     // ─── Build table data based on active tab ─────────────────────────────────
//     const getTableData = (): { head: string[]; body: (string | number)[][]; foot?: (string | number)[] } => {
//         if (activeTab === 'daily') {
//             const rows = dailyData ?? [];
//             const totals = rows.reduce((acc, r) => ({
//                 purchase: acc.purchase + Number(r.purchaseAmount),
//                 expense: acc.expense + Number(r.expenseAmount),
//                 cashIn: acc.cashIn + Number(r.cashInAmount),
//                 cashOut: acc.cashOut + Number(r.cashOutAmount),
//                 sales: acc.sales + Number(r.salesAmount),
//                 profit: acc.profit + Number(r.profitAmount),
//             }), { purchase: 0, expense: 0, cashIn: 0, cashOut: 0, sales: 0, profit: 0 });

//             return {
//                 head: ['Date', 'Opening', 'Purchase', 'Expense', 'Cash In', 'Cash Out', 'Sales', 'Profit', 'Closing'],
//                 body: rows.map((r) => [
//                     formatDate(r.accountDate),
//                     formatCurrency(Number(r.openingBalance)),
//                     formatCurrency(Number(r.purchaseAmount)),
//                     formatCurrency(Number(r.expenseAmount)),
//                     formatCurrency(Number(r.cashInAmount)),
//                     formatCurrency(Number(r.cashOutAmount)),
//                     formatCurrency(Number(r.salesAmount)),
//                     formatCurrency(Number(r.profitAmount)),
//                     formatCurrency(Number(r.closingBalance)),
//                 ]),
//                 foot: [`Total (${rows.length} days)`, '—', formatCurrency(totals.purchase), formatCurrency(totals.expense), formatCurrency(totals.cashIn), formatCurrency(totals.cashOut), formatCurrency(totals.sales), formatCurrency(totals.profit), '—'],
//             };
//         }

//         if (activeTab === 'purchase') {
//             const rows = purchaseData ?? [];
//             const total = rows.reduce((s, r) => s + Number(r.totalAmount), 0);
//             return {
//                 head: ['Date', 'Invoice No.', 'Company', 'Items', 'Amount'],
//                 body: rows.map((r) => [formatDate(r.purchaseDate), r.invoiceNo ?? '—', r.company.companyName, r.items.length, formatCurrency(Number(r.totalAmount))]),
//                 foot: [`Total (${rows.length} invoices)`, '', '', '', formatCurrency(total)],
//             };
//         }

//         if (activeTab === 'company-purchase') {
//             const rows = (companyWiseData ?? []) as Array<{ companyName: string; invoiceCount: number; totalAmount: number }>;
//             const grandTotal = rows.reduce((s, r) => s + Number(r.totalAmount), 0);
//             return {
//                 head: ['#', 'Company', 'Invoices', 'Total Amount', '% of Total'],
//                 body: rows.sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount)).map((r, i) => [
//                     i + 1, r.companyName, r.invoiceCount,
//                     formatCurrency(Number(r.totalAmount)),
//                     grandTotal > 0 ? `${((Number(r.totalAmount) / grandTotal) * 100).toFixed(1)}%` : '0%',
//                 ]),
//                 foot: ['', `Total (${rows.length})`, rows.reduce((s, r) => s + r.invoiceCount, 0), formatCurrency(grandTotal), '100%'],
//             };
//         }

//         if (activeTab === 'expense') {
//             const rows = expenseData ?? [];
//             const total = rows.reduce((s, r) => s + Number(r.amount), 0);
//             return {
//                 head: ['Date', 'Category', 'Note', 'Amount'],
//                 body: rows.map((r) => [formatDate(r.expenseDate), r.category.categoryName, r.note ?? '—', formatCurrency(Number(r.amount))]),
//                 foot: [`Total (${rows.length})`, '', '', formatCurrency(total)],
//             };
//         }

//         if (activeTab === 'cash') {
//             const rows = cashData ?? [];
//             const cashIn = rows.filter((t) => t.transactionType.transactionDirection === 'IN').reduce((s, t) => s + Number(t.amount), 0);
//             const cashOut = rows.filter((t) => t.transactionType.transactionDirection === 'OUT').reduce((s, t) => s + Number(t.amount), 0);
//             return {
//                 head: ['Date', 'Type', 'Direction', 'Note', 'Amount'],
//                 body: rows.map((r) => [formatDate(r.transactionDate), r.transactionType.transactionName, r.transactionType.transactionDirection, r.note ?? '—', formatCurrency(Number(r.amount))]),
//                 foot: [`Total (${rows.length})`, '', `In: ${formatCurrency(cashIn)} | Out: ${formatCurrency(cashOut)}`, '', formatCurrency(cashIn - cashOut)],
//             };
//         }

//         if (activeTab === 'monthly' && monthlyData) {
//             return {
//                 head: ['Particulars', 'Amount'],
//                 body: [
//                     ['Total Purchase', formatCurrency(monthlyData.totalPurchase)],
//                     ['Total Expense', formatCurrency(monthlyData.totalExpense)],
//                     ['Total Cash In', formatCurrency(monthlyData.totalCashIn)],
//                     ['Total Cash Out', formatCurrency(monthlyData.totalCashOut)],
//                     ['Total Sales', formatCurrency(monthlyData.totalSales)],
//                     ['Total Profit', formatCurrency(monthlyData.totalProfit)],
//                 ],
//             };
//         }

//         return { head: [], body: [] };
//     };

//     // ─── Preview table for screen ─────────────────────────────────────────────
//     const { head, body, foot } = isLoading ? { head: [], body: [], foot: undefined } : getTableData();

//     return (
//         <div>
//             {/* Header */}
//             <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center gap-3">
//                     <div className="bg-blue-100 text-blue-700 rounded-lg p-2">
//                         <BarChart3 size={20} />
//                     </div>
//                     <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
//                 </div>
//                 <div className="flex items-center gap-2">
//                     <button onClick={handleRefetch} className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
//                         <RefreshCcw size={13} />
//                         Refresh
//                     </button>
//                     <button
//                         onClick={exportXLSX}
//                         disabled={isLoading || isExporting}
//                         className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
//                     >
//                         {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
//                         Download XLSX
//                     </button>
//                     <button
//                         onClick={exportPDF}
//                         disabled={isLoading || isExporting}
//                         className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
//                     >
//                         {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
//                         Download PDF
//                     </button>
//                 </div>
//             </div>

//             {/* Tabs */}
//             <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 overflow-x-auto">
//                 {tabs.map(({ id, label }) => (
//                     <button
//                         key={id}
//                         onClick={() => setActiveTab(id)}
//                         className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
//                             }`}
//                     >
//                         {label}
//                     </button>
//                 ))}
//             </div>

//             {/* Filters */}
//             <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
//                 {activeTab === 'monthly' ? (
//                     <div className="flex gap-3 items-end">
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
//                             <input type="number" value={monthYear.year} onChange={(e) => setMonthYear((m) => ({ ...m, year: Number(e.target.value) }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
//                             <select value={monthYear.month} onChange={(e) => setMonthYear((m) => ({ ...m, month: Number(e.target.value) }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
//                                 {monthNames.map((name, i) => (
//                                     <option key={i + 1} value={i + 1}>{name}</option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="flex flex-wrap gap-3 items-end">
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
//                             <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange((d) => ({ ...d, startDate: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
//                             <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange((d) => ({ ...d, endDate: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                         </div>
//                         {activeTab === 'purchase' && (
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
//                                 <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
//                                     <option value="">All Companies</option>
//                                     {companiesData?.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
//                                 </select>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>

//             {/* Clean Preview Table */}
//             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//                 <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
//                     <span className="text-sm font-medium text-gray-700">
//                         {tabs.find((t) => t.id === activeTab)?.label} — Preview
//                     </span>
//                     <span className="text-xs text-gray-400">{body.length} records</span>
//                 </div>

//                 {isLoading ? (
//                     <div className="flex items-center justify-center py-16">
//                         <Loader2 size={20} className="animate-spin text-gray-300" />
//                     </div>
//                 ) : body.length === 0 ? (
//                     <div className="text-center py-16 text-gray-400 text-sm">No data found for selected period</div>
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-sm">
//                             <thead className="bg-gray-50 border-b border-gray-100">
//                                 <tr>
//                                     {head.map((h, i) => (
//                                         <th key={i} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
//                                             {h}
//                                         </th>
//                                     ))}
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-50">
//                                 {body.map((row, ri) => (
//                                     <tr key={ri} className="hover:bg-gray-50">
//                                         {row.map((cell, ci) => (
//                                             <td key={ci} className="px-4 py-3 text-gray-700 whitespace-nowrap">{cell}</td>
//                                         ))}
//                                     </tr>
//                                 ))}
//                             </tbody>
//                             {foot && (
//                                 <tfoot>
//                                     <tr className="bg-gray-50 border-t-2 border-gray-200">
//                                         {foot.map((cell, ci) => (
//                                             <td key={ci} className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">{cell}</td>
//                                         ))}
//                                     </tr>
//                                 </tfoot>
//                             )}
//                         </table>
//                     </div>
//                 )}
//             </div>

//             {/* Install hint */}
//             <p className="text-xs text-gray-400 mt-3 text-center">
//                 PDF/XLSX download এর জন্য run করো: <code className="bg-gray-100 px-1 rounded">npm install jspdf jspdf-autotable xlsx</code>
//             </p>
//         </div>
//     );
// }






'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApi, dailyAccountApi, companyApi } from '@/lib/api';
import { formatCurrency, formatDate, currentMonthRange } from '@/lib/utils';
import { BarChart3, FileSpreadsheet, FileDown, RefreshCcw, Loader2 } from 'lucide-react';
import type { DailyAccount, Purchase, Expense, CashTransaction, Company } from '@/types';

const SHOP_NAME = 'Masum Pharma Ltd.';

type ReportTab = 'daily' | 'purchase' | 'company-purchase' | 'expense' | 'cash' | 'monthly';

const tabs = [
    { id: 'daily' as ReportTab, label: 'Daily Report' },
    { id: 'purchase' as ReportTab, label: 'Purchase Report' },
    { id: 'company-purchase' as ReportTab, label: 'Company Wise Purchase' },
    { id: 'expense' as ReportTab, label: 'Expense Report' },
    { id: 'cash' as ReportTab, label: 'Cash Transactions' },
    { id: 'monthly' as ReportTab, label: 'Monthly Summary' },
];

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<ReportTab>('daily');
    const { startDate: defaultStart, endDate: defaultEnd } = currentMonthRange();
    const [dateRange, setDateRange] = useState({ startDate: defaultStart, endDate: defaultEnd });
    const [companyId, setCompanyId] = useState('');
    const [monthYear, setMonthYear] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
    const [isExporting, setIsExporting] = useState(false);

    const { data: companiesData } = useQuery({
        queryKey: ['companies'],
        queryFn: () => companyApi.getAll().then((r) => r.data.data as Company[]),
    });

    const { data: dailyData, isLoading: dailyLoading, refetch: refetchDaily } = useQuery({
        queryKey: ['report-daily', dateRange],
        queryFn: () => reportApi.getDaily(dateRange.startDate, dateRange.endDate).then((r) => r.data.data as DailyAccount[]),
        enabled: activeTab === 'daily',
    });

    const { data: purchaseData, isLoading: purchaseLoading, refetch: refetchPurchase } = useQuery({
        queryKey: ['report-purchase', dateRange, companyId],
        queryFn: () => reportApi.getPurchase(dateRange.startDate, dateRange.endDate, companyId ? Number(companyId) : undefined).then((r) => r.data.data as Purchase[]),
        enabled: activeTab === 'purchase',
    });

    const { data: companyWiseData, isLoading: companyWiseLoading, refetch: refetchCompanyWise } = useQuery({
        queryKey: ['report-company-wise', dateRange],
        queryFn: () => reportApi.getCompanyWisePurchase(dateRange.startDate, dateRange.endDate).then((r) => r.data.data),
        enabled: activeTab === 'company-purchase',
    });

    const { data: expenseData, isLoading: expenseLoading, refetch: refetchExpense } = useQuery({
        queryKey: ['report-expense', dateRange],
        queryFn: () => reportApi.getExpense(dateRange.startDate, dateRange.endDate).then((r) => r.data.data as Expense[]),
        enabled: activeTab === 'expense',
    });

    const { data: cashData, isLoading: cashLoading, refetch: refetchCash } = useQuery({
        queryKey: ['report-cash', dateRange],
        queryFn: () => reportApi.getCashTransactions(dateRange.startDate, dateRange.endDate).then((r) => r.data.data as CashTransaction[]),
        enabled: activeTab === 'cash',
    });

    const { data: monthlyData, isLoading: monthlyLoading, refetch: refetchMonthly } = useQuery({
        queryKey: ['report-monthly', monthYear],
        queryFn: () => dailyAccountApi.getMonthlySummary(monthYear.year, monthYear.month).then((r) => r.data.data),
        enabled: activeTab === 'monthly',
    });

    const isLoading = dailyLoading || purchaseLoading || companyWiseLoading || expenseLoading || cashLoading || monthlyLoading;

    const handleRefetch = () => {
        if (activeTab === 'daily') refetchDaily();
        else if (activeTab === 'purchase') refetchPurchase();
        else if (activeTab === 'company-purchase') refetchCompanyWise();
        else if (activeTab === 'expense') refetchExpense();
        else if (activeTab === 'cash') refetchCash();
        else if (activeTab === 'monthly') refetchMonthly();
    };

    // ─── Build table data ─────────────────────────────────────────────────────
    const getTableData = (): { head: string[]; body: string[][]; foot?: string[] } => {
        if (activeTab === 'daily') {
            const rows = dailyData ?? [];
            const totals = rows.reduce((acc, r) => ({
                purchase: acc.purchase + Number(r.purchaseAmount),
                expense: acc.expense + Number(r.expenseAmount),
                cashIn: acc.cashIn + Number(r.cashInAmount),
                cashOut: acc.cashOut + Number(r.cashOutAmount),
                sales: acc.sales + Number(r.salesAmount),
                profit: acc.profit + Number(r.profitAmount),
            }), { purchase: 0, expense: 0, cashIn: 0, cashOut: 0, sales: 0, profit: 0 });
            return {
                head: ['Date', 'Opening', 'Purchase', 'Expense', 'Cash In', 'Cash Out', 'Sales', 'Profit', 'Closing'],
                body: rows.map((r) => [formatDate(r.accountDate), formatCurrency(Number(r.openingBalance)), formatCurrency(Number(r.purchaseAmount)), formatCurrency(Number(r.expenseAmount)), formatCurrency(Number(r.cashInAmount)), formatCurrency(Number(r.cashOutAmount)), formatCurrency(Number(r.salesAmount)), formatCurrency(Number(r.profitAmount)), formatCurrency(Number(r.closingBalance))]),
                foot: [`Total (${rows.length} days)`, '—', formatCurrency(totals.purchase), formatCurrency(totals.expense), formatCurrency(totals.cashIn), formatCurrency(totals.cashOut), formatCurrency(totals.sales), formatCurrency(totals.profit), '—'],
            };
        }
        if (activeTab === 'purchase') {
            const rows = purchaseData ?? [];
            const total = rows.reduce((s, r) => s + Number(r.totalAmount), 0);
            return {
                head: ['Date', 'Invoice No.', 'Company', 'Items', 'Amount'],
                body: rows.map((r) => [formatDate(r.purchaseDate), r.invoiceNo ?? '—', r.company.companyName, String(r.items.length), formatCurrency(Number(r.totalAmount))]),
                foot: [`Total (${rows.length})`, '', '', '', formatCurrency(total)],
            };
        }
        if (activeTab === 'company-purchase') {
            const rows = (companyWiseData ?? []) as Array<{ companyName: string; invoiceCount: number; totalAmount: number }>;
            const grandTotal = rows.reduce((s, r) => s + Number(r.totalAmount), 0);
            return {
                head: ['#', 'Company', 'Invoices', 'Total Amount', '% of Total'],
                body: rows.sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount)).map((r, i) => [String(i + 1), r.companyName, String(r.invoiceCount), formatCurrency(Number(r.totalAmount)), grandTotal > 0 ? `${((Number(r.totalAmount) / grandTotal) * 100).toFixed(1)}%` : '0%']),
                foot: ['', `Total (${rows.length})`, String(rows.reduce((s, r) => s + r.invoiceCount, 0)), formatCurrency(grandTotal), '100%'],
            };
        }
        if (activeTab === 'expense') {
            const rows = expenseData ?? [];
            const total = rows.reduce((s, r) => s + Number(r.amount), 0);
            return {
                head: ['Date', 'Category', 'Note', 'Amount'],
                body: rows.map((r) => [formatDate(r.expenseDate), r.category.categoryName, r.note ?? '—', formatCurrency(Number(r.amount))]),
                foot: [`Total (${rows.length})`, '', '', formatCurrency(total)],
            };
        }
        if (activeTab === 'cash') {
            const rows = cashData ?? [];
            const cashIn = rows.filter((t) => t.transactionType.transactionDirection === 'IN').reduce((s, t) => s + Number(t.amount), 0);
            const cashOut = rows.filter((t) => t.transactionType.transactionDirection === 'OUT').reduce((s, t) => s + Number(t.amount), 0);
            return {
                head: ['Date', 'Type', 'Direction', 'Note', 'Amount'],
                body: rows.map((r) => [formatDate(r.transactionDate), r.transactionType.transactionName, r.transactionType.transactionDirection, r.note ?? '—', formatCurrency(Number(r.amount))]),
                foot: [`Total (${rows.length})`, '', `In: ${formatCurrency(cashIn)} | Out: ${formatCurrency(cashOut)}`, '', formatCurrency(cashIn - cashOut)],
            };
        }
        if (activeTab === 'monthly' && monthlyData) {
            return {
                head: ['Particulars', 'Amount'],
                body: [
                    ['Total Purchase', formatCurrency(monthlyData.totalPurchase)],
                    ['Total Expense', formatCurrency(monthlyData.totalExpense)],
                    ['Total Cash In', formatCurrency(monthlyData.totalCashIn)],
                    ['Total Cash Out', formatCurrency(monthlyData.totalCashOut)],
                    ['Total Sales', formatCurrency(monthlyData.totalSales)],
                    ['Total Profit', formatCurrency(monthlyData.totalProfit)],
                ],
            };
        }
        return { head: [], body: [] };
    };

    const periodText = activeTab === 'monthly'
        ? `${monthNames[monthYear.month - 1]} ${monthYear.year}`
        : `${formatDate(dateRange.startDate)} — ${formatDate(dateRange.endDate)}`;

    const tabLabel = tabs.find((t) => t.id === activeTab)?.label ?? 'Report';

    // ─── XLSX Export ───────────────────────────────────────────────────────────
    const exportXLSX = async () => {
        setIsExporting(true);
        try {
            const XLSX = await import('xlsx');
            const { head, body, foot } = getTableData();
            const wsData = [
                [SHOP_NAME],
                [tabLabel],
                [`Period: ${periodText}`],
                [`Printed: ${new Date().toLocaleString()}`],
                [],
                head,
                ...body,
                ...(foot ? [foot] : []),
            ];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            // Bold first 4 rows
            ws['A1'] = { v: SHOP_NAME, t: 's' };
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, tabLabel.substring(0, 31));
            XLSX.writeFile(wb, `${SHOP_NAME} - ${tabLabel} - ${periodText}.xlsx`);
        } catch {
            alert('XLSX export failed. Run: npm install xlsx');
        } finally {
            setIsExporting(false);
        }
    };

    // ─── PDF Export (pure HTML→print, no jspdf needed) ────────────────────────
    const exportPDF = () => {
        const { head, body, foot } = getTableData();

        const rows = body.map((row) =>
            `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`
        ).join('');

        const footRow = foot
            ? `<tfoot><tr>${foot.map((cell) => `<td><strong>${cell}</strong></td>`).join('')}</tr></tfoot>`
            : '';

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${SHOP_NAME} - ${tabLabel}</title>
        <style>
          @page { margin: 12mm 10mm; size: A4 landscape; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 10pt; color: #000; }
          .header { text-align: center; margin-bottom: 12pt; }
          .header h1 { font-size: 16pt; font-weight: bold; }
          .header h2 { font-size: 12pt; margin-top: 3pt; }
          .header p { font-size: 9pt; color: #555; margin-top: 2pt; }
          .divider { border-top: 2px solid #000; margin: 8pt 0; }
          table { width: 100%; border-collapse: collapse; }
          thead tr { background: #1a1a1a; color: #fff; }
          thead th { padding: 5pt 7pt; text-align: left; font-size: 9pt; text-transform: uppercase; border: 1pt solid #000; }
          tbody td { padding: 4pt 7pt; border: 0.5pt solid #ccc; font-size: 9pt; }
          tbody tr:nth-child(even) td { background: #f5f5f5; }
          tfoot td { padding: 5pt 7pt; font-weight: bold; border-top: 2pt solid #000; border-bottom: 2pt solid #000; background: #efefef; font-size: 9pt; }
          .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 8pt; color: #777; border-top: 0.5pt solid #ccc; padding-top: 3pt; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${SHOP_NAME}</h1>
          <h2>${tabLabel}</h2>
          <p>Period: ${periodText}</p>
          <p>Printed: ${new Date().toLocaleString()}</p>
        </div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>${rows}</tbody>
          ${footRow}
        </table>
        <div class="footer">${SHOP_NAME} — ${tabLabel}</div>
        <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }</script>
      </body>
      </html>
    `;

        const printWindow = window.open('', '_blank', 'width=1100,height=700');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
    };

    const { head, body, foot } = isLoading ? { head: [], body: [], foot: undefined } : getTableData();

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-700 rounded-lg p-2">
                        <BarChart3 size={20} />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleRefetch} className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                        <RefreshCcw size={13} />
                        Refresh
                    </button>
                    <button
                        onClick={exportXLSX}
                        disabled={isLoading || isExporting || body.length === 0}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
                        Download XLSX
                    </button>
                    <button
                        onClick={exportPDF}
                        disabled={isLoading || body.length === 0}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        <FileDown size={14} />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 overflow-x-auto">
                {tabs.map(({ id, label }) => (
                    <button key={id} onClick={() => setActiveTab(id)} className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
                {activeTab === 'monthly' ? (
                    <div className="flex gap-3 items-end">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
                            <input type="number" value={monthYear.year} onChange={(e) => setMonthYear((m) => ({ ...m, year: Number(e.target.value) }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
                            <select value={monthYear.month} onChange={(e) => setMonthYear((m) => ({ ...m, month: Number(e.target.value) }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {monthNames.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-3 items-end">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                            <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange((d) => ({ ...d, startDate: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                            <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange((d) => ({ ...d, endDate: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        {activeTab === 'purchase' && (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
                                <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">All Companies</option>
                                    {companiesData?.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Preview Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{tabLabel} — {periodText}</span>
                    <span className="text-xs text-gray-400">{body.length} records</span>
                </div>
                {isLoading ? (
                    <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-gray-300" /></div>
                ) : body.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-sm">No data found for selected period</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>{head.map((h, i) => <th key={i} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {body.map((row, ri) => (
                                    <tr key={ri} className="hover:bg-gray-50">
                                        {row.map((cell, ci) => <td key={ci} className="px-4 py-3 text-gray-700 whitespace-nowrap">{cell}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                            {foot && (
                                <tfoot>
                                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                                        {foot.map((cell, ci) => <td key={ci} className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">{cell}</td>)}
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}