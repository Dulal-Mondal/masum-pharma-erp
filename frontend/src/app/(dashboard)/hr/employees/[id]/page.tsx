// 'use client';

// import { useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { hrApi } from '@/lib/api';
// import { formatCurrency, formatDate, today } from '@/lib/utils';
// import {
//     ArrowLeft, User, Phone, MapPin, Briefcase, Calendar,
//     Clock, TrendingUp, Wallet, CheckCircle, XCircle, FileDown,
//     FileSpreadsheet, Loader2, Plus, Trash2, Pencil, Save,
// } from 'lucide-react';

// const SHOP_NAME = 'Masum Pharma Ltd.';
// const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// const statusColors: Record<string, string> = {
//     PRESENT: 'bg-green-100 text-green-700',
//     ABSENT: 'bg-red-100 text-red-700',
//     HALF_DAY: 'bg-yellow-100 text-yellow-700',
//     HOLIDAY: 'bg-blue-100 text-blue-700',
//     LEAVE: 'bg-purple-100 text-purple-700',
// };

// const payTypeColors: Record<string, string> = {
//     SALARY: 'bg-indigo-100 text-indigo-700',
//     BONUS: 'bg-green-100 text-green-700',
//     PARTIAL: 'bg-amber-100 text-amber-700',
// };

// type ActiveTab = 'overview' | 'time' | 'attendance' | 'salary';

// interface TimeEntry {
//     id: number;
//     entryDate: string;
//     checkIn: string | null;
//     checkOut: string | null;
//     workHours: number | null;
//     overtimeHours: number;
//     note: string | null;
// }

// interface AttendanceRecord {
//     id: number;
//     attendanceDate: string;
//     status: string;
//     note: string | null;
// }

// interface SalaryPayment {
//     id: number;
//     paymentDate: string;
//     paymentType: string;
//     amount: number;
//     month: number | null;
//     year: number | null;
//     note: string | null;
// }

// interface EmployeeProfile {
//     employee: {
//         id: number; name: string; phone?: string; address?: string;
//         position?: string; joinDate: string; basicSalary: number;
//         workingHours: number; overtimeRate: number;
//     };
//     currentMonth: { year: number; month: number };
//     timeEntries: TimeEntry[];
//     attendance: AttendanceRecord[];
//     salaryPayments: SalaryPayment[];
//     stats: {
//         totalWorkHours: number; totalOvertimeHours: number;
//         overtimePay: number; totalSalaryPaid: number;
//         totalBonusPaid: number; presentDays: number; absentDays: number;
//     };
// }

// export default function EmployeePortalPage() {
//     const { id } = useParams();
//     const router = useRouter();
//     const queryClient = useQueryClient();
//     const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
//     const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
//     const [viewYear, setViewYear] = useState(new Date().getFullYear());
//     const [showTimeForm, setShowTimeForm] = useState(false);
//     const [showOvertimeSettings, setShowOvertimeSettings] = useState(false);

//     const { data: profile, isLoading } = useQuery({
//         queryKey: ['employee-profile', id],
//         queryFn: () => hrApi.getEmployeeProfile(Number(id)).then((r) => r.data.data as EmployeeProfile),
//     });

//     const { data: monthTimeEntries = [] } = useQuery({
//         queryKey: ['time-entries', id, viewYear, viewMonth],
//         queryFn: () => hrApi.getTimeEntries(Number(id), { year: viewYear, month: viewMonth })
//             .then((r) => r.data.data as TimeEntry[]),
//     });

//     const deleteTimeMutation = useMutation({
//         mutationFn: (timeId: number) => hrApi.deleteTimeEntry(timeId),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['time-entries', id] });
//             queryClient.invalidateQueries({ queryKey: ['employee-profile', id] });
//         },
//     });

//     if (isLoading) {
//         return (
//             <div className="flex items-center justify-center py-24">
//                 <Loader2 size={24} className="animate-spin text-gray-300" />
//             </div>
//         );
//     }

//     if (!profile) return null;

//     const { employee: emp, stats } = profile;
//     const periodText = `${monthNames[viewMonth - 1]} ${viewYear}`;

//     // Monthly stats for selected month
//     const monthTotalHours = monthTimeEntries.reduce((s, e) => s + Number(e.workHours ?? 0), 0);
//     const monthOvertimeHours = monthTimeEntries.reduce((s, e) => s + Number(e.overtimeHours ?? 0), 0);
//     const monthOvertimePay = parseFloat((monthOvertimeHours * Number(emp.overtimeRate)).toFixed(2));

//     // ─── PDF Export ─────────────────────────────────────────────────────────────
//     const exportPDF = () => {
//         const timeRows = monthTimeEntries.map((e) => `
//       <tr>
//         <td>${formatDate(e.entryDate)}</td>
//         <td style="text-align:center">${e.checkIn ?? '—'}</td>
//         <td style="text-align:center">${e.checkOut ?? '—'}</td>
//         <td style="text-align:center">${e.workHours != null ? e.workHours + ' hrs' : '—'}</td>
//         <td style="text-align:center;color:#7c3aed">${Number(e.overtimeHours) > 0 ? e.overtimeHours + ' hrs' : '—'}</td>
//         <td>${e.note ?? '—'}</td>
//       </tr>`).join('');

//         const salaryRows = profile.salaryPayments.slice(0, 12).map((p) => `
//       <tr>
//         <td>${formatDate(p.paymentDate)}</td>
//         <td>${p.month ? monthNames[p.month - 1] + ' ' + p.year : '—'}</td>
//         <td><span style="padding:2px 8px;border-radius:10px;background:${p.paymentType === 'SALARY' ? '#e0e7ff' : p.paymentType === 'BONUS' ? '#dcfce7' : '#fef9c3'};color:${p.paymentType === 'SALARY' ? '#3730a3' : p.paymentType === 'BONUS' ? '#166534' : '#854d0e'}">${p.paymentType}</span></td>
//         <td style="text-align:right;font-weight:bold">${formatCurrency(Number(p.amount))}</td>
//         <td>${p.note ?? '—'}</td>
//       </tr>`).join('');

//         const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
//       <title>${emp.name} - Employee Report</title>
//       <style>
//         @page { margin: 12mm 10mm; size: A4 portrait; }
//         * { box-sizing: border-box; margin: 0; padding: 0; }
//         body { font-family: Arial, sans-serif; font-size: 10pt; color: #000; }
//         .header { text-align: center; margin-bottom: 10pt; }
//         .header h1 { font-size: 15pt; font-weight: bold; }
//         .header h2 { font-size: 11pt; margin-top: 2pt; }
//         .header p { font-size: 9pt; color: #555; margin-top: 2pt; }
//         .divider { border-top: 2px solid #000; margin: 6pt 0; }
//         .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6pt; margin-bottom: 10pt; }
//         .profile-item { padding: 4pt 0; border-bottom: 0.5pt solid #eee; }
//         .profile-item .label { font-size: 8pt; color: #777; text-transform: uppercase; }
//         .profile-item .value { font-size: 10pt; font-weight: 600; margin-top: 1pt; }
//         .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 6pt; margin-bottom: 10pt; }
//         .stat-card { border: 1pt solid #ccc; padding: 5pt; border-radius: 3pt; text-align: center; }
//         .stat-card .label { font-size: 8pt; color: #777; text-transform: uppercase; }
//         .stat-card .value { font-size: 12pt; font-weight: bold; margin-top: 2pt; }
//         .section-title { font-size: 11pt; font-weight: bold; margin: 10pt 0 5pt; border-bottom: 1pt solid #ccc; padding-bottom: 3pt; }
//         table { width: 100%; border-collapse: collapse; margin-bottom: 10pt; }
//         thead tr { background: #1a1a1a; color: #fff; }
//         thead th { padding: 4pt 6pt; text-align: left; font-size: 8pt; border: 1pt solid #000; }
//         tbody td { padding: 3pt 6pt; border: 0.5pt solid #ccc; font-size: 9pt; }
//         tbody tr:nth-child(even) td { background: #f9f9f9; }
//         tfoot td { padding: 4pt 6pt; font-weight: bold; border-top: 1.5pt solid #000; background: #efefef; }
//       </style></head><body>
//       <div class="header">
//         <h1>${SHOP_NAME}</h1>
//         <h2>Employee Report — ${emp.name}</h2>
//         <p>Period: ${periodText} &nbsp;|&nbsp; Printed: ${new Date().toLocaleString()}</p>
//       </div>
//       <div class="divider"></div>

//       <div class="profile-grid">
//         <div class="profile-item"><div class="label">Name</div><div class="value">${emp.name}</div></div>
//         <div class="profile-item"><div class="label">Position</div><div class="value">${emp.position ?? '—'}</div></div>
//         <div class="profile-item"><div class="label">Phone</div><div class="value">${emp.phone ?? '—'}</div></div>
//         <div class="profile-item"><div class="label">Join Date</div><div class="value">${formatDate(emp.joinDate)}</div></div>
//         <div class="profile-item"><div class="label">Basic Salary</div><div class="value">${formatCurrency(Number(emp.basicSalary))}</div></div>
//         <div class="profile-item"><div class="label">Working Hours/Day</div><div class="value">${emp.workingHours} hrs</div></div>
//         <div class="profile-item"><div class="label">Overtime Rate/Hour</div><div class="value">${formatCurrency(Number(emp.overtimeRate))}</div></div>
//         <div class="profile-item"><div class="label">Address</div><div class="value">${emp.address ?? '—'}</div></div>
//       </div>

//       <div class="section-title">Monthly Summary — ${periodText}</div>
//       <div class="stats-grid">
//         <div class="stat-card"><div class="label">Total Hours</div><div class="value">${monthTotalHours.toFixed(1)}</div></div>
//         <div class="stat-card"><div class="label">Overtime Hours</div><div class="value" style="color:#7c3aed">${monthOvertimeHours.toFixed(1)}</div></div>
//         <div class="stat-card"><div class="label">Overtime Pay</div><div class="value" style="color:#7c3aed">${formatCurrency(monthOvertimePay)}</div></div>
//         <div class="stat-card"><div class="label">Present Days</div><div class="value" style="color:#16a34a">${stats.presentDays}</div></div>
//       </div>

//       <div class="section-title">Time Entries — ${periodText}</div>
//       <table>
//         <thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Work Hours</th><th>Overtime</th><th>Note</th></tr></thead>
//         <tbody>${timeRows || '<tr><td colspan="6" style="text-align:center;color:#999">No time entries</td></tr>'}</tbody>
//         <tfoot><tr>
//           <td colspan="3" style="text-align:right">Total</td>
//           <td style="text-align:center">${monthTotalHours.toFixed(1)} hrs</td>
//           <td style="text-align:center;color:#7c3aed">${monthOvertimeHours.toFixed(1)} hrs</td>
//           <td></td>
//         </tr></tfoot>
//       </table>

//       <div class="section-title">Payment History (Last 12)</div>
//       <table>
//         <thead><tr><th>Date</th><th>For Month</th><th>Type</th><th>Amount</th><th>Note</th></tr></thead>
//         <tbody>${salaryRows || '<tr><td colspan="5" style="text-align:center;color:#999">No payments yet</td></tr>'}</tbody>
//         <tfoot><tr>
//           <td colspan="3" style="text-align:right">Total Salary Paid</td>
//           <td style="text-align:right">${formatCurrency(stats.totalSalaryPaid)}</td>
//           <td></td>
//         </tr></tfoot>
//       </table>

//       <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}</script>
//       </body></html>`;

//         const w = window.open('', '_blank', 'width=900,height=750');
//         if (w) { w.document.write(html); w.document.close(); }
//     };

//     // ─── XLSX Export ─────────────────────────────────────────────────────────────
//     const exportXLSX = async () => {
//         try {
//             const XLSX = await import('xlsx');
//             const wb = XLSX.utils.book_new();

//             // Profile sheet
//             const profileData = [
//                 [SHOP_NAME],
//                 [`Employee Report — ${emp.name} — ${periodText}`],
//                 [],
//                 ['Field', 'Value'],
//                 ['Name', emp.name],
//                 ['Position', emp.position ?? '—'],
//                 ['Phone', emp.phone ?? '—'],
//                 ['Join Date', formatDate(emp.joinDate)],
//                 ['Basic Salary', formatCurrency(Number(emp.basicSalary))],
//                 ['Working Hours/Day', emp.workingHours],
//                 ['Overtime Rate/Hour', formatCurrency(Number(emp.overtimeRate))],
//                 ['Address', emp.address ?? '—'],
//                 [],
//                 ['Monthly Summary'],
//                 ['Total Work Hours', monthTotalHours.toFixed(1)],
//                 ['Total Overtime Hours', monthOvertimeHours.toFixed(1)],
//                 ['Overtime Pay', formatCurrency(monthOvertimePay)],
//                 ['Present Days', stats.presentDays],
//                 ['Absent Days', stats.absentDays],
//             ];
//             XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(profileData), 'Profile');

//             // Time entries sheet
//             const timeData = [
//                 ['Date', 'Check In', 'Check Out', 'Work Hours', 'Overtime Hours', 'Overtime Pay', 'Note'],
//                 ...monthTimeEntries.map((e) => [
//                     formatDate(e.entryDate),
//                     e.checkIn ?? '—',
//                     e.checkOut ?? '—',
//                     e.workHours != null ? e.workHours + ' hrs' : '—',
//                     Number(e.overtimeHours) > 0 ? e.overtimeHours + ' hrs' : '—',
//                     Number(e.overtimeHours) > 0 ? formatCurrency(Number(e.overtimeHours) * Number(emp.overtimeRate)) : '—',
//                     e.note ?? '—',
//                 ]),
//                 ['Total', '', '', monthTotalHours.toFixed(1) + ' hrs', monthOvertimeHours.toFixed(1) + ' hrs', formatCurrency(monthOvertimePay), ''],
//             ];
//             XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(timeData), 'Time Entries');

//             // Salary history sheet
//             const salaryData = [
//                 ['Date', 'For Month', 'Type', 'Amount', 'Note'],
//                 ...profile.salaryPayments.map((p) => [
//                     formatDate(p.paymentDate),
//                     p.month ? monthNames[p.month - 1] + ' ' + p.year : '—',
//                     p.paymentType,
//                     formatCurrency(Number(p.amount)),
//                     p.note ?? '—',
//                 ]),
//             ];
//             XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(salaryData), 'Salary History');

//             XLSX.writeFile(wb, `${SHOP_NAME} - ${emp.name} - ${periodText}.xlsx`);
//         } catch { alert('Run: npm install xlsx'); }
//     };

//     const tabs = [
//         { id: 'overview' as ActiveTab, label: 'Overview' },
//         { id: 'time' as ActiveTab, label: 'Time Entries' },
//         { id: 'attendance' as ActiveTab, label: 'Attendance' },
//         { id: 'salary' as ActiveTab, label: 'Salary History' },
//     ];

//     return (
//         <div>
//             {/* Header */}
//             <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center gap-3">
//                     <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
//                         <ArrowLeft size={16} /> Back
//                     </button>
//                     <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold text-sm">
//                             {emp.name.charAt(0).toUpperCase()}
//                         </div>
//                         <div>
//                             <h1 className="text-xl font-semibold text-gray-900">{emp.name}</h1>
//                             <p className="text-xs text-gray-400">{emp.position || 'Staff'}</p>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="flex gap-2">
//                     <button onClick={exportXLSX} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-2 rounded-lg">
//                         <FileSpreadsheet size={13} /> XLSX
//                     </button>
//                     <button onClick={exportPDF} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-2 rounded-lg">
//                         <FileDown size={13} /> PDF
//                     </button>
//                 </div>
//             </div>

//             {/* Tabs */}
//             <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 w-fit">
//                 {tabs.map(({ id: tid, label }) => (
//                     <button key={tid} onClick={() => setActiveTab(tid)}
//                         className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tid ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
//                         {label}
//                     </button>
//                 ))}
//             </div>

//             {/* ── Overview Tab ─────────────────────────────────────────────────────── */}
//             {activeTab === 'overview' && (
//                 <div className="space-y-5">
//                     {/* Profile card */}
//                     <div className="bg-white rounded-xl border border-gray-200 p-5">
//                         <div className="flex items-center justify-between mb-4">
//                             <h2 className="text-sm font-semibold text-gray-700">Employee Profile</h2>
//                             <button onClick={() => setShowOvertimeSettings(!showOvertimeSettings)}
//                                 className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
//                                 <Pencil size={12} /> Edit Settings
//                             </button>
//                         </div>
//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                             {[
//                                 { icon: User, label: 'Full Name', value: emp.name },
//                                 { icon: Briefcase, label: 'Position', value: emp.position || '—' },
//                                 { icon: Phone, label: 'Phone', value: emp.phone || '—' },
//                                 { icon: Calendar, label: 'Join Date', value: formatDate(emp.joinDate) },
//                                 { icon: Wallet, label: 'Basic Salary', value: formatCurrency(Number(emp.basicSalary)) },
//                                 { icon: Clock, label: 'Working Hours/Day', value: emp.workingHours + ' hrs' },
//                                 { icon: TrendingUp, label: 'Overtime Rate/Hr', value: formatCurrency(Number(emp.overtimeRate)) },
//                                 { icon: MapPin, label: 'Address', value: emp.address || '—' },
//                             ].map(({ icon: Icon, label, value }) => (
//                                 <div key={label}>
//                                     <div className="flex items-center gap-1.5 mb-1">
//                                         <Icon size={12} className="text-gray-400" />
//                                         <p className="text-xs text-gray-400">{label}</p>
//                                     </div>
//                                     <p className="text-sm font-medium text-gray-900">{value}</p>
//                                 </div>
//                             ))}
//                         </div>

//                         {/* Overtime settings inline form */}
//                         {showOvertimeSettings && (
//                             <OvertimeSettingsForm
//                                 employeeId={emp.id}
//                                 currentWorkingHours={emp.workingHours}
//                                 currentOvertimeRate={Number(emp.overtimeRate)}
//                                 onSaved={() => {
//                                     queryClient.invalidateQueries({ queryKey: ['employee-profile', id] });
//                                     setShowOvertimeSettings(false);
//                                 }}
//                             />
//                         )}
//                     </div>

//                     {/* Stats cards */}
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                         <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
//                             <p className="text-xs font-medium text-blue-600 uppercase mb-1">This Month Hours</p>
//                             <p className="text-2xl font-bold text-blue-800">{stats.totalWorkHours.toFixed(1)}</p>
//                         </div>
//                         <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
//                             <p className="text-xs font-medium text-purple-600 uppercase mb-1">Overtime Hours</p>
//                             <p className="text-2xl font-bold text-purple-800">{stats.totalOvertimeHours.toFixed(1)}</p>
//                             <p className="text-xs text-purple-500 mt-0.5">{formatCurrency(stats.overtimePay)} pay</p>
//                         </div>
//                         <div className="bg-green-50 border border-green-200 rounded-xl p-4">
//                             <p className="text-xs font-medium text-green-600 uppercase mb-1">Present Days</p>
//                             <p className="text-2xl font-bold text-green-800">{stats.presentDays}</p>
//                         </div>
//                         <div className="bg-red-50 border border-red-200 rounded-xl p-4">
//                             <p className="text-xs font-medium text-red-500 uppercase mb-1">Absent Days</p>
//                             <p className="text-2xl font-bold text-red-700">{stats.absentDays}</p>
//                         </div>
//                     </div>

//                     {/* Recent time entries */}
//                     <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//                         <div className="px-5 py-3 border-b border-gray-100">
//                             <h2 className="text-sm font-semibold text-gray-700">Recent Time Entries</h2>
//                         </div>
//                         <div className="divide-y divide-gray-50">
//                             {profile.timeEntries.slice(0, 5).map((e) => (
//                                 <div key={e.id} className="flex items-center justify-between px-5 py-3">
//                                     <div>
//                                         <p className="text-sm font-medium text-gray-900">{formatDate(e.entryDate)}</p>
//                                         <p className="text-xs text-gray-400">{e.note || 'No note'}</p>
//                                     </div>
//                                     <div className="flex items-center gap-4 text-sm">
//                                         <span className="text-gray-500">{e.checkIn ?? '—'} → {e.checkOut ?? '—'}</span>
//                                         <span className="font-medium text-blue-700">{e.workHours != null ? e.workHours + ' hrs' : '—'}</span>
//                                         {Number(e.overtimeHours) > 0 && (
//                                             <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
//                                                 OT: {e.overtimeHours} hrs
//                                             </span>
//                                         )}
//                                     </div>
//                                 </div>
//                             ))}
//                             {profile.timeEntries.length === 0 && (
//                                 <p className="text-center py-8 text-gray-400 text-sm">No time entries this month</p>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ── Time Entries Tab ──────────────────────────────────────────────────── */}
//             {activeTab === 'time' && (
//                 <div>
//                     <div className="flex items-center justify-between mb-4">
//                         <div className="flex gap-2 items-center">
//                             <select value={viewMonth} onChange={(e) => setViewMonth(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
//                                 {monthNames.map((n, i) => <option key={i + 1} value={i + 1}>{n}</option>)}
//                             </select>
//                             <input type="number" value={viewYear} onChange={(e) => setViewYear(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                         </div>
//                         <button onClick={() => setShowTimeForm(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
//                             <Plus size={15} /> Add Entry
//                         </button>
//                     </div>

//                     {showTimeForm && (
//                         <TimeEntryForm
//                             employeeId={emp.id}
//                             onClose={() => setShowTimeForm(false)}
//                             onSaved={() => {
//                                 queryClient.invalidateQueries({ queryKey: ['time-entries', id] });
//                                 queryClient.invalidateQueries({ queryKey: ['employee-profile', id] });
//                                 setShowTimeForm(false);
//                             }}
//                         />
//                     )}

//                     {/* Summary row */}
//                     <div className="grid grid-cols-3 gap-3 mb-4">
//                         <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
//                             <p className="text-xs text-blue-600 font-medium">Total Work Hours</p>
//                             <p className="text-xl font-bold text-blue-800">{monthTotalHours.toFixed(1)} hrs</p>
//                         </div>
//                         <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
//                             <p className="text-xs text-purple-600 font-medium">Overtime Hours</p>
//                             <p className="text-xl font-bold text-purple-800">{monthOvertimeHours.toFixed(1)} hrs</p>
//                         </div>
//                         <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
//                             <p className="text-xs text-green-600 font-medium">Overtime Pay</p>
//                             <p className="text-xl font-bold text-green-800">{formatCurrency(monthOvertimePay)}</p>
//                         </div>
//                     </div>

//                     <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//                         <div className="overflow-x-auto">
//                             <table className="w-full text-sm">
//                                 <thead className="bg-gray-50 border-b border-gray-100">
//                                     <tr>
//                                         <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
//                                         <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Check In</th>
//                                         <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Check Out</th>
//                                         <th className="text-center px-4 py-3 text-xs font-medium text-blue-500 uppercase">Work Hours</th>
//                                         <th className="text-center px-4 py-3 text-xs font-medium text-purple-500 uppercase">Overtime</th>
//                                         <th className="text-center px-4 py-3 text-xs font-medium text-green-500 uppercase">OT Pay</th>
//                                         <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Note</th>
//                                         <th className="px-4 py-3"></th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-50">
//                                     {monthTimeEntries.length === 0 ? (
//                                         <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No entries for {periodText}</td></tr>
//                                     ) : monthTimeEntries.map((e) => (
//                                         <tr key={e.id} className="hover:bg-gray-50">
//                                             <td className="px-5 py-3 font-medium text-gray-900">{formatDate(e.entryDate)}</td>
//                                             <td className="px-4 py-3 text-center">
//                                                 <span className={`font-medium ${e.checkIn ? 'text-green-700' : 'text-gray-300'}`}>{e.checkIn ?? '—'}</span>
//                                             </td>
//                                             <td className="px-4 py-3 text-center">
//                                                 <span className={`font-medium ${e.checkOut ? 'text-red-600' : 'text-gray-300'}`}>{e.checkOut ?? '—'}</span>
//                                             </td>
//                                             <td className="px-4 py-3 text-center font-semibold text-blue-700">
//                                                 {e.workHours != null ? e.workHours + ' hrs' : '—'}
//                                             </td>
//                                             <td className="px-4 py-3 text-center">
//                                                 {Number(e.overtimeHours) > 0
//                                                     ? <span className="text-purple-700 font-semibold">{e.overtimeHours} hrs</span>
//                                                     : <span className="text-gray-300">—</span>}
//                                             </td>
//                                             <td className="px-4 py-3 text-center font-medium text-green-700">
//                                                 {Number(e.overtimeHours) > 0 ? formatCurrency(Number(e.overtimeHours) * Number(emp.overtimeRate)) : '—'}
//                                             </td>
//                                             <td className="px-4 py-3 text-gray-500 text-xs">{e.note ?? '—'}</td>
//                                             <td className="px-4 py-3">
//                                                 <button onClick={() => { if (confirm('Delete this entry?')) deleteTimeMutation.mutate(e.id); }}
//                                                     className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                                 {monthTimeEntries.length > 0 && (
//                                     <tfoot>
//                                         <tr className="bg-gray-50 border-t-2 border-gray-200">
//                                             <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-right text-gray-600">Total</td>
//                                             <td className="px-4 py-3 text-center font-bold text-blue-700">{monthTotalHours.toFixed(1)} hrs</td>
//                                             <td className="px-4 py-3 text-center font-bold text-purple-700">{monthOvertimeHours.toFixed(1)} hrs</td>
//                                             <td className="px-4 py-3 text-center font-bold text-green-700">{formatCurrency(monthOvertimePay)}</td>
//                                             <td colSpan={2}></td>
//                                         </tr>
//                                     </tfoot>
//                                 )}
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ── Attendance Tab ────────────────────────────────────────────────────── */}
//             {activeTab === 'attendance' && (
//                 <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//                     <div className="px-5 py-3 border-b border-gray-100">
//                         <h2 className="text-sm font-semibold text-gray-700">Attendance — This Month</h2>
//                     </div>
//                     <div className="divide-y divide-gray-50">
//                         {profile.attendance.length === 0 ? (
//                             <p className="text-center py-12 text-gray-400 text-sm">No attendance records this month</p>
//                         ) : profile.attendance.map((a) => (
//                             <div key={a.id} className="flex items-center justify-between px-5 py-3">
//                                 <p className="text-sm text-gray-700">{formatDate(a.attendanceDate)}</p>
//                                 <div className="flex items-center gap-3">
//                                     {a.note && <p className="text-xs text-gray-400">{a.note}</p>}
//                                     <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
//                                         {a.status.replace('_', ' ')}
//                                     </span>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}

//             {/* ── Salary History Tab ────────────────────────────────────────────────── */}
//             {activeTab === 'salary' && (
//                 <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//                     <div className="px-5 py-3 border-b border-gray-100">
//                         <h2 className="text-sm font-semibold text-gray-700">Salary & Payment History</h2>
//                     </div>
//                     {profile.salaryPayments.length === 0 ? (
//                         <p className="text-center py-12 text-gray-400 text-sm">No payments yet</p>
//                     ) : (
//                         <div className="overflow-x-auto">
//                             <table className="w-full text-sm">
//                                 <thead className="bg-gray-50 border-b border-gray-100">
//                                     <tr>
//                                         <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
//                                         <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">For Month</th>
//                                         <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
//                                         <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
//                                         <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Note</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-50">
//                                     {profile.salaryPayments.map((p) => (
//                                         <tr key={p.id} className="hover:bg-gray-50">
//                                             <td className="px-5 py-3 text-gray-700">{formatDate(p.paymentDate)}</td>
//                                             <td className="px-5 py-3 text-gray-500">
//                                                 {p.month ? `${monthNames[p.month - 1]} ${p.year}` : '—'}
//                                             </td>
//                                             <td className="px-5 py-3">
//                                                 <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${payTypeColors[p.paymentType] ?? 'bg-gray-100'}`}>
//                                                     {p.paymentType}
//                                                 </span>
//                                             </td>
//                                             <td className="px-5 py-3 text-right font-semibold text-gray-900">{formatCurrency(Number(p.amount))}</td>
//                                             <td className="px-5 py-3 text-gray-500 text-xs">{p.note || '—'}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                                 <tfoot>
//                                     <tr className="bg-gray-50 border-t-2 border-gray-200">
//                                         <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-right">Total Paid</td>
//                                         <td className="px-5 py-3 text-right font-bold text-gray-900">
//                                             {formatCurrency(profile.salaryPayments.reduce((s, p) => s + Number(p.amount), 0))}
//                                         </td>
//                                         <td></td>
//                                     </tr>
//                                 </tfoot>
//                             </table>
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }

// // ─── Time Entry Form ──────────────────────────────────────────────────────────

// function TimeEntryForm({ employeeId, onClose, onSaved }: {
//     employeeId: number; onClose: () => void; onSaved: () => void;
// }) {
//     const [form, setForm] = useState({
//         entryDate: today(),
//         checkIn: '09:00',
//         checkOut: '17:00',
//         note: '',
//     });
//     const [saving, setSaving] = useState(false);
//     const [error, setError] = useState('');

//     const handleSave = async () => {
//         setSaving(true);
//         try {
//             await hrApi.upsertTimeEntry({ employeeId, ...form });
//             onSaved();
//         } catch (err: unknown) {
//             const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
//             setError(msg || 'Failed to save');
//         } finally { setSaving(false); }
//     };

//     return (
//         <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
//             <h3 className="text-sm font-semibold text-indigo-800 mb-3">Add Time Entry</h3>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                 <div>
//                     <label className="block text-xs font-medium text-gray-500 mb-1">Date *</label>
//                     <input type="date" value={form.entryDate} onChange={(e) => setForm((f) => ({ ...f, entryDate: e.target.value }))}
//                         className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 </div>
//                 <div>
//                     <label className="block text-xs font-medium text-gray-500 mb-1">Check In</label>
//                     <input type="time" value={form.checkIn} onChange={(e) => setForm((f) => ({ ...f, checkIn: e.target.value }))}
//                         className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 </div>
//                 <div>
//                     <label className="block text-xs font-medium text-gray-500 mb-1">Check Out</label>
//                     <input type="time" value={form.checkOut} onChange={(e) => setForm((f) => ({ ...f, checkOut: e.target.value }))}
//                         className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 </div>
//                 <div>
//                     <label className="block text-xs font-medium text-gray-500 mb-1">Note</label>
//                     <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Optional"
//                         className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 </div>
//             </div>
//             {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
//             <div className="flex gap-2 mt-3">
//                 <button onClick={handleSave} disabled={saving}
//                     className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg">
//                     {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save Entry
//                 </button>
//                 <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
//             </div>
//         </div>
//     );
// }

// // ─── Overtime Settings Form ───────────────────────────────────────────────────

// function OvertimeSettingsForm({ employeeId, currentWorkingHours, currentOvertimeRate, onSaved }: {
//     employeeId: number; currentWorkingHours: number; currentOvertimeRate: number; onSaved: () => void;
// }) {
//     const [workingHours, setWorkingHours] = useState(String(currentWorkingHours));
//     const [overtimeRate, setOvertimeRate] = useState(String(currentOvertimeRate));
//     const [saving, setSaving] = useState(false);

//     const handleSave = async () => {
//         setSaving(true);
//         try {
//             await hrApi.updateOvertimeSettings(employeeId, {
//                 workingHours: parseFloat(workingHours),
//                 overtimeRate: parseFloat(overtimeRate),
//             });
//             onSaved();
//         } finally { setSaving(false); }
//     };

//     return (
//         <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
//             <div>
//                 <label className="block text-xs font-medium text-gray-500 mb-1">Working Hours/Day</label>
//                 <input type="number" step="0.5" min="1" max="24" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)}
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//             </div>
//             <div>
//                 <label className="block text-xs font-medium text-gray-500 mb-1">Overtime Rate/Hour (৳)</label>
//                 <input type="number" step="0.01" min="0" value={overtimeRate} onChange={(e) => setOvertimeRate(e.target.value)}
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//             </div>
//             <button onClick={handleSave} disabled={saving}
//                 className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg h-fit">
//                 {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
//             </button>
//         </div>
//     );
// }




















'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrApi } from '@/lib/api';
import { formatCurrency, formatDate, today } from '@/lib/utils';
import {
    ArrowLeft, User, Phone, MapPin, Briefcase, Calendar,
    Clock, TrendingUp, Wallet, CheckCircle, XCircle, FileDown,
    FileSpreadsheet, Loader2, Plus, Trash2, Pencil, Save,
} from 'lucide-react';

const SHOP_NAME = 'Masum Pharma Ltd.';
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const statusColors: Record<string, string> = {
    PRESENT: 'bg-green-100 text-green-700',
    ABSENT: 'bg-red-100 text-red-700',
    HALF_DAY: 'bg-yellow-100 text-yellow-700',
    HOLIDAY: 'bg-blue-100 text-blue-700',
    LEAVE: 'bg-purple-100 text-purple-700',
};

const payTypeColors: Record<string, string> = {
    SALARY: 'bg-indigo-100 text-indigo-700',
    BONUS: 'bg-green-100 text-green-700',
    PARTIAL: 'bg-amber-100 text-amber-700',
};

type ActiveTab = 'overview' | 'time' | 'attendance' | 'salary';

interface TimeEntry {
    id: number;
    entryDate: string;
    checkOutDate: string | null;
    checkIn: string | null;
    checkOut: string | null;
    workHours: number | null;
    overtimeHours: number;
    note: string | null;
}

interface AttendanceRecord {
    id: number;
    attendanceDate: string;
    status: string;
    note: string | null;
}

interface SalaryPayment {
    id: number;
    paymentDate: string;
    paymentType: string;
    amount: number;
    month: number | null;
    year: number | null;
    note: string | null;
}

interface EmployeeProfile {
    employee: {
        id: number; name: string; phone?: string; address?: string;
        position?: string; joinDate: string; basicSalary: number;
        workingHours: number; overtimeRate: number;
    };
    currentMonth: { year: number; month: number };
    timeEntries: TimeEntry[];
    attendance: AttendanceRecord[];
    salaryPayments: SalaryPayment[];
    stats: {
        totalWorkHours: number; totalOvertimeHours: number;
        overtimePay: number; totalSalaryPaid: number;
        totalBonusPaid: number; presentDays: number; absentDays: number;
    };
}

export default function EmployeePortalPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
    const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
    const [viewYear, setViewYear] = useState(new Date().getFullYear());
    const [showTimeForm, setShowTimeForm] = useState(false);
    const [showOvertimeSettings, setShowOvertimeSettings] = useState(false);

    const { data: profile, isLoading } = useQuery({
        queryKey: ['employee-profile', id],
        queryFn: () => hrApi.getEmployeeProfile(Number(id)).then((r) => r.data.data as EmployeeProfile),
    });

    const { data: monthTimeEntries = [] } = useQuery({
        queryKey: ['time-entries', id, viewYear, viewMonth],
        queryFn: () => hrApi.getTimeEntries(Number(id), { year: viewYear, month: viewMonth })
            .then((r) => r.data.data as TimeEntry[]),
    });

    const deleteTimeMutation = useMutation({
        mutationFn: (timeId: number) => hrApi.deleteTimeEntry(timeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['time-entries', id] });
            queryClient.invalidateQueries({ queryKey: ['employee-profile', id] });
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 size={24} className="animate-spin text-gray-300" />
            </div>
        );
    }

    if (!profile) return null;

    const { employee: emp, stats } = profile;
    const periodText = `${monthNames[viewMonth - 1]} ${viewYear}`;

    // Monthly stats for selected month
    const monthTotalHours = monthTimeEntries.reduce((s, e) => s + Number(e.workHours ?? 0), 0);
    const monthOvertimeHours = monthTimeEntries.reduce((s, e) => s + Number(e.overtimeHours ?? 0), 0);
    const monthOvertimePay = parseFloat((monthOvertimeHours * Number(emp.overtimeRate)).toFixed(2));

    // ─── PDF Export ─────────────────────────────────────────────────────────────
    const exportPDF = () => {
        const timeRows = monthTimeEntries.map((e) => `
      <tr>
        <td>${formatDate(e.entryDate)}</td>
        <td style="text-align:center">${e.checkIn ?? '—'}</td>
        <td style="text-align:center">${e.checkOut ?? '—'}</td>
        <td style="text-align:center">${e.workHours != null ? e.workHours + ' hrs' : '—'}</td>
        <td style="text-align:center;color:#7c3aed">${Number(e.overtimeHours) > 0 ? e.overtimeHours + ' hrs' : '—'}</td>
        <td>${e.note ?? '—'}</td>
      </tr>`).join('');

        const salaryRows = profile.salaryPayments.slice(0, 12).map((p) => `
      <tr>
        <td>${formatDate(p.paymentDate)}</td>
        <td>${p.month ? monthNames[p.month - 1] + ' ' + p.year : '—'}</td>
        <td><span style="padding:2px 8px;border-radius:10px;background:${p.paymentType === 'SALARY' ? '#e0e7ff' : p.paymentType === 'BONUS' ? '#dcfce7' : '#fef9c3'};color:${p.paymentType === 'SALARY' ? '#3730a3' : p.paymentType === 'BONUS' ? '#166534' : '#854d0e'}">${p.paymentType}</span></td>
        <td style="text-align:right;font-weight:bold">${formatCurrency(Number(p.amount))}</td>
        <td>${p.note ?? '—'}</td>
      </tr>`).join('');

        const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>${emp.name} - Employee Report</title>
      <style>
        @page { margin: 12mm 10mm; size: A4 portrait; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 10pt; color: #000; }
        .header { text-align: center; margin-bottom: 10pt; }
        .header h1 { font-size: 15pt; font-weight: bold; }
        .header h2 { font-size: 11pt; margin-top: 2pt; }
        .header p { font-size: 9pt; color: #555; margin-top: 2pt; }
        .divider { border-top: 2px solid #000; margin: 6pt 0; }
        .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6pt; margin-bottom: 10pt; }
        .profile-item { padding: 4pt 0; border-bottom: 0.5pt solid #eee; }
        .profile-item .label { font-size: 8pt; color: #777; text-transform: uppercase; }
        .profile-item .value { font-size: 10pt; font-weight: 600; margin-top: 1pt; }
        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 6pt; margin-bottom: 10pt; }
        .stat-card { border: 1pt solid #ccc; padding: 5pt; border-radius: 3pt; text-align: center; }
        .stat-card .label { font-size: 8pt; color: #777; text-transform: uppercase; }
        .stat-card .value { font-size: 12pt; font-weight: bold; margin-top: 2pt; }
        .section-title { font-size: 11pt; font-weight: bold; margin: 10pt 0 5pt; border-bottom: 1pt solid #ccc; padding-bottom: 3pt; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10pt; }
        thead tr { background: #1a1a1a; color: #fff; }
        thead th { padding: 4pt 6pt; text-align: left; font-size: 8pt; border: 1pt solid #000; }
        tbody td { padding: 3pt 6pt; border: 0.5pt solid #ccc; font-size: 9pt; }
        tbody tr:nth-child(even) td { background: #f9f9f9; }
        tfoot td { padding: 4pt 6pt; font-weight: bold; border-top: 1.5pt solid #000; background: #efefef; }
      </style></head><body>
      <div class="header">
        <h1>${SHOP_NAME}</h1>
        <h2>Employee Report — ${emp.name}</h2>
        <p>Period: ${periodText} &nbsp;|&nbsp; Printed: ${new Date().toLocaleString()}</p>
      </div>
      <div class="divider"></div>

      <div class="profile-grid">
        <div class="profile-item"><div class="label">Name</div><div class="value">${emp.name}</div></div>
        <div class="profile-item"><div class="label">Position</div><div class="value">${emp.position ?? '—'}</div></div>
        <div class="profile-item"><div class="label">Phone</div><div class="value">${emp.phone ?? '—'}</div></div>
        <div class="profile-item"><div class="label">Join Date</div><div class="value">${formatDate(emp.joinDate)}</div></div>
        <div class="profile-item"><div class="label">Basic Salary</div><div class="value">${formatCurrency(Number(emp.basicSalary))}</div></div>
        <div class="profile-item"><div class="label">Working Hours/Day</div><div class="value">${emp.workingHours} hrs</div></div>
        <div class="profile-item"><div class="label">Overtime Rate/Hour</div><div class="value">${formatCurrency(Number(emp.overtimeRate))}</div></div>
        <div class="profile-item"><div class="label">Address</div><div class="value">${emp.address ?? '—'}</div></div>
      </div>

      <div class="section-title">Monthly Summary — ${periodText}</div>
      <div class="stats-grid">
        <div class="stat-card"><div class="label">Total Hours</div><div class="value">${monthTotalHours.toFixed(1)}</div></div>
        <div class="stat-card"><div class="label">Overtime Hours</div><div class="value" style="color:#7c3aed">${monthOvertimeHours.toFixed(1)}</div></div>
        <div class="stat-card"><div class="label">Overtime Pay</div><div class="value" style="color:#7c3aed">${formatCurrency(monthOvertimePay)}</div></div>
        <div class="stat-card"><div class="label">Present Days</div><div class="value" style="color:#16a34a">${stats.presentDays}</div></div>
      </div>

      <div class="section-title">Time Entries — ${periodText}</div>
      <table>
        <thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Work Hours</th><th>Overtime</th><th>Note</th></tr></thead>
        <tbody>${timeRows || '<tr><td colspan="6" style="text-align:center;color:#999">No time entries</td></tr>'}</tbody>
        <tfoot><tr>
          <td colspan="3" style="text-align:right">Total</td>
          <td style="text-align:center">${monthTotalHours.toFixed(1)} hrs</td>
          <td style="text-align:center;color:#7c3aed">${monthOvertimeHours.toFixed(1)} hrs</td>
          <td></td>
        </tr></tfoot>
      </table>

      <div class="section-title">Payment History (Last 12)</div>
      <table>
        <thead><tr><th>Date</th><th>For Month</th><th>Type</th><th>Amount</th><th>Note</th></tr></thead>
        <tbody>${salaryRows || '<tr><td colspan="5" style="text-align:center;color:#999">No payments yet</td></tr>'}</tbody>
        <tfoot><tr>
          <td colspan="3" style="text-align:right">Total Salary Paid</td>
          <td style="text-align:right">${formatCurrency(stats.totalSalaryPaid)}</td>
          <td></td>
        </tr></tfoot>
      </table>

      <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}</script>
      </body></html>`;

        const w = window.open('', '_blank', 'width=900,height=750');
        if (w) { w.document.write(html); w.document.close(); }
    };

    // ─── XLSX Export ─────────────────────────────────────────────────────────────
    const exportXLSX = async () => {
        try {
            const XLSX = await import('xlsx');
            const wb = XLSX.utils.book_new();

            // Profile sheet
            const profileData = [
                [SHOP_NAME],
                [`Employee Report — ${emp.name} — ${periodText}`],
                [],
                ['Field', 'Value'],
                ['Name', emp.name],
                ['Position', emp.position ?? '—'],
                ['Phone', emp.phone ?? '—'],
                ['Join Date', formatDate(emp.joinDate)],
                ['Basic Salary', formatCurrency(Number(emp.basicSalary))],
                ['Working Hours/Day', emp.workingHours],
                ['Overtime Rate/Hour', formatCurrency(Number(emp.overtimeRate))],
                ['Address', emp.address ?? '—'],
                [],
                ['Monthly Summary'],
                ['Total Work Hours', monthTotalHours.toFixed(1)],
                ['Total Overtime Hours', monthOvertimeHours.toFixed(1)],
                ['Overtime Pay', formatCurrency(monthOvertimePay)],
                ['Present Days', stats.presentDays],
                ['Absent Days', stats.absentDays],
            ];
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(profileData), 'Profile');

            // Time entries sheet
            const timeData = [
                ['Date', 'Check In', 'Check Out', 'Work Hours', 'Overtime Hours', 'Overtime Pay', 'Note'],
                ...monthTimeEntries.map((e) => [
                    formatDate(e.entryDate),
                    e.checkIn ?? '—',
                    e.checkOut ?? '—',
                    e.workHours != null ? e.workHours + ' hrs' : '—',
                    Number(e.overtimeHours) > 0 ? e.overtimeHours + ' hrs' : '—',
                    Number(e.overtimeHours) > 0 ? formatCurrency(Number(e.overtimeHours) * Number(emp.overtimeRate)) : '—',
                    e.note ?? '—',
                ]),
                ['Total', '', '', monthTotalHours.toFixed(1) + ' hrs', monthOvertimeHours.toFixed(1) + ' hrs', formatCurrency(monthOvertimePay), ''],
            ];
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(timeData), 'Time Entries');

            // Salary history sheet
            const salaryData = [
                ['Date', 'For Month', 'Type', 'Amount', 'Note'],
                ...profile.salaryPayments.map((p) => [
                    formatDate(p.paymentDate),
                    p.month ? monthNames[p.month - 1] + ' ' + p.year : '—',
                    p.paymentType,
                    formatCurrency(Number(p.amount)),
                    p.note ?? '—',
                ]),
            ];
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(salaryData), 'Salary History');

            XLSX.writeFile(wb, `${SHOP_NAME} - ${emp.name} - ${periodText}.xlsx`);
        } catch { alert('Run: npm install xlsx'); }
    };

    const tabs = [
        { id: 'overview' as ActiveTab, label: 'Overview' },
        { id: 'time' as ActiveTab, label: 'Time Entries' },
        { id: 'attendance' as ActiveTab, label: 'Attendance' },
        { id: 'salary' as ActiveTab, label: 'Salary History' },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold text-sm">
                            {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">{emp.name}</h1>
                            <p className="text-xs text-gray-400">{emp.position || 'Staff'}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportXLSX} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-2 rounded-lg">
                        <FileSpreadsheet size={13} /> XLSX
                    </button>
                    <button onClick={exportPDF} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-2 rounded-lg">
                        <FileDown size={13} /> PDF
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 w-fit">
                {tabs.map(({ id: tid, label }) => (
                    <button key={tid} onClick={() => setActiveTab(tid)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tid ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* ── Overview Tab ─────────────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
                <div className="space-y-5">
                    {/* Profile card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-gray-700">Employee Profile</h2>
                            <button onClick={() => setShowOvertimeSettings(!showOvertimeSettings)}
                                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                <Pencil size={12} /> Edit Settings
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: User, label: 'Full Name', value: emp.name },
                                { icon: Briefcase, label: 'Position', value: emp.position || '—' },
                                { icon: Phone, label: 'Phone', value: emp.phone || '—' },
                                { icon: Calendar, label: 'Join Date', value: formatDate(emp.joinDate) },
                                { icon: Wallet, label: 'Basic Salary', value: formatCurrency(Number(emp.basicSalary)) },
                                { icon: Clock, label: 'Working Hours/Day', value: emp.workingHours + ' hrs' },
                                { icon: TrendingUp, label: 'Overtime Rate/Hr', value: formatCurrency(Number(emp.overtimeRate)) },
                                { icon: MapPin, label: 'Address', value: emp.address || '—' },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label}>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Icon size={12} className="text-gray-400" />
                                        <p className="text-xs text-gray-400">{label}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Overtime settings inline form */}
                        {showOvertimeSettings && (
                            <OvertimeSettingsForm
                                employeeId={emp.id}
                                currentWorkingHours={emp.workingHours}
                                currentOvertimeRate={Number(emp.overtimeRate)}
                                onSaved={() => {
                                    queryClient.invalidateQueries({ queryKey: ['employee-profile', id] });
                                    setShowOvertimeSettings(false);
                                }}
                            />
                        )}
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-xs font-medium text-blue-600 uppercase mb-1">This Month Hours</p>
                            <p className="text-2xl font-bold text-blue-800">{stats.totalWorkHours.toFixed(1)}</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                            <p className="text-xs font-medium text-purple-600 uppercase mb-1">Overtime Hours</p>
                            <p className="text-2xl font-bold text-purple-800">{stats.totalOvertimeHours.toFixed(1)}</p>
                            <p className="text-xs text-purple-500 mt-0.5">{formatCurrency(stats.overtimePay)} pay</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <p className="text-xs font-medium text-green-600 uppercase mb-1">Present Days</p>
                            <p className="text-2xl font-bold text-green-800">{stats.presentDays}</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-xs font-medium text-red-500 uppercase mb-1">Absent Days</p>
                            <p className="text-2xl font-bold text-red-700">{stats.absentDays}</p>
                        </div>
                    </div>

                    {/* Recent time entries */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-3 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-700">Recent Time Entries</h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {profile.timeEntries.slice(0, 5).map((e) => (
                                <div key={e.id} className="flex items-center justify-between px-5 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{formatDate(e.entryDate)}</p>
                                        <p className="text-xs text-gray-400">{e.note || 'No note'}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-gray-500">{e.checkIn ?? '—'} → {e.checkOut ?? '—'}</span>
                                        <span className="font-medium text-blue-700">{e.workHours != null ? e.workHours + ' hrs' : '—'}</span>
                                        {Number(e.overtimeHours) > 0 && (
                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                                OT: {e.overtimeHours} hrs
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {profile.timeEntries.length === 0 && (
                                <p className="text-center py-8 text-gray-400 text-sm">No time entries this month</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Time Entries Tab ──────────────────────────────────────────────────── */}
            {activeTab === 'time' && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-2 items-center">
                            <select value={viewMonth} onChange={(e) => setViewMonth(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                {monthNames.map((n, i) => <option key={i + 1} value={i + 1}>{n}</option>)}
                            </select>
                            <input type="number" value={viewYear} onChange={(e) => setViewYear(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <button onClick={() => setShowTimeForm(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
                            <Plus size={15} /> Add Entry
                        </button>
                    </div>

                    {showTimeForm && (
                        <TimeEntryForm
                            employeeId={emp.id}
                            onClose={() => setShowTimeForm(false)}
                            onSaved={() => {
                                queryClient.invalidateQueries({ queryKey: ['time-entries', id] });
                                queryClient.invalidateQueries({ queryKey: ['employee-profile', id] });
                                setShowTimeForm(false);
                            }}
                        />
                    )}

                    {/* Summary row */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                            <p className="text-xs text-blue-600 font-medium">Total Work Hours</p>
                            <p className="text-xl font-bold text-blue-800">{monthTotalHours.toFixed(1)} hrs</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                            <p className="text-xs text-purple-600 font-medium">Overtime Hours</p>
                            <p className="text-xl font-bold text-purple-800">{monthOvertimeHours.toFixed(1)} hrs</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                            <p className="text-xs text-green-600 font-medium">Overtime Pay</p>
                            <p className="text-xl font-bold text-green-800">{formatCurrency(monthOvertimePay)}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Check In</th>
                                        <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Check Out</th>
                                        <th className="text-center px-4 py-3 text-xs font-medium text-blue-500 uppercase">Work Hours</th>
                                        <th className="text-center px-4 py-3 text-xs font-medium text-purple-500 uppercase">Overtime</th>
                                        <th className="text-center px-4 py-3 text-xs font-medium text-green-500 uppercase">OT Pay</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Note</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {monthTimeEntries.length === 0 ? (
                                        <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No entries for {periodText}</td></tr>
                                    ) : monthTimeEntries.map((e) => (
                                        <tr key={e.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-3 font-medium text-gray-900">{formatDate(e.entryDate)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`font-medium ${e.checkIn ? 'text-green-700' : 'text-gray-300'}`}>{e.checkIn ?? '—'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`font-medium ${e.checkOut ? 'text-red-600' : 'text-gray-300'}`}>{e.checkOut ?? '—'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center font-semibold text-blue-700">
                                                {e.workHours != null ? e.workHours + ' hrs' : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {Number(e.overtimeHours) > 0
                                                    ? <span className="text-purple-700 font-semibold">{e.overtimeHours} hrs</span>
                                                    : <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-center font-medium text-green-700">
                                                {Number(e.overtimeHours) > 0 ? formatCurrency(Number(e.overtimeHours) * Number(emp.overtimeRate)) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">{e.note ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => { if (confirm('Delete this entry?')) deleteTimeMutation.mutate(e.id); }}
                                                    className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {monthTimeEntries.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-gray-50 border-t-2 border-gray-200">
                                            <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-right text-gray-600">Total</td>
                                            <td className="px-4 py-3 text-center font-bold text-blue-700">{monthTotalHours.toFixed(1)} hrs</td>
                                            <td className="px-4 py-3 text-center font-bold text-purple-700">{monthOvertimeHours.toFixed(1)} hrs</td>
                                            <td className="px-4 py-3 text-center font-bold text-green-700">{formatCurrency(monthOvertimePay)}</td>
                                            <td colSpan={2}></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Attendance Tab ────────────────────────────────────────────────────── */}
            {activeTab === 'attendance' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-700">Attendance — This Month</h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {profile.attendance.length === 0 ? (
                            <p className="text-center py-12 text-gray-400 text-sm">No attendance records this month</p>
                        ) : profile.attendance.map((a) => (
                            <div key={a.id} className="flex items-center justify-between px-5 py-3">
                                <p className="text-sm text-gray-700">{formatDate(a.attendanceDate)}</p>
                                <div className="flex items-center gap-3">
                                    {a.note && <p className="text-xs text-gray-400">{a.note}</p>}
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                        {a.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Salary History Tab ────────────────────────────────────────────────── */}
            {activeTab === 'salary' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-700">Salary & Payment History</h2>
                    </div>
                    {profile.salaryPayments.length === 0 ? (
                        <p className="text-center py-12 text-gray-400 text-sm">No payments yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">For Month</th>
                                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Note</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {profile.salaryPayments.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-3 text-gray-700">{formatDate(p.paymentDate)}</td>
                                            <td className="px-5 py-3 text-gray-500">
                                                {p.month ? `${monthNames[p.month - 1]} ${p.year}` : '—'}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${payTypeColors[p.paymentType] ?? 'bg-gray-100'}`}>
                                                    {p.paymentType}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right font-semibold text-gray-900">{formatCurrency(Number(p.amount))}</td>
                                            <td className="px-5 py-3 text-gray-500 text-xs">{p.note || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                                        <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-right">Total Paid</td>
                                        <td className="px-5 py-3 text-right font-bold text-gray-900">
                                            {formatCurrency(profile.salaryPayments.reduce((s, p) => s + Number(p.amount), 0))}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Time Entry Form ──────────────────────────────────────────────────────────

function TimeEntryForm({ employeeId, onClose, onSaved }: {
    employeeId: number; onClose: () => void; onSaved: () => void;
}) {
    const [form, setForm] = useState({
        entryDate: today(),
        checkOutDate: today(),
        checkIn: '09:00',
        checkOut: '17:00',
        note: '',
    });
    const [crossDay, setCrossDay] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        setSaving(true);
        try {
            await hrApi.createTimeEntry({ employeeId, ...form, checkOutDate: crossDay ? form.checkOutDate : undefined });
            onSaved();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg || 'Failed to save');
        } finally { setSaving(false); }
    };

    return (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-indigo-800 mb-3">Add Time Entry</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Check-In Date *</label>
                    <input type="date" value={form.entryDate}
                        onChange={(e) => setForm((f) => ({ ...f, entryDate: e.target.value, checkOutDate: crossDay ? f.checkOutDate : e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Check In Time</label>
                    <input type="time" value={form.checkIn} onChange={(e) => setForm((f) => ({ ...f, checkIn: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Note</label>
                    <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Optional"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
            </div>

            {/* Cross-day toggle */}
            <div className="flex items-center gap-2 mb-3">
                <input type="checkbox" id="crossDay" checked={crossDay}
                    onChange={(e) => {
                        setCrossDay(e.target.checked);
                        if (!e.target.checked) setForm((f) => ({ ...f, checkOutDate: f.entryDate }));
                    }}
                    className="rounded border-gray-300 text-indigo-600" />
                <label htmlFor="crossDay" className="text-xs text-gray-600">Check-out on next day (cross-day shift)</label>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {crossDay && (
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Check-Out Date *</label>
                        <input type="date" value={form.checkOutDate}
                            onChange={(e) => setForm((f) => ({ ...f, checkOutDate: e.target.value }))}
                            min={form.entryDate}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                )}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Check Out Time</label>
                    <input type="time" value={form.checkOut} onChange={(e) => setForm((f) => ({ ...f, checkOut: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
            </div>
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
            <div className="flex gap-2 mt-3">
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg">
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save Entry
                </button>
                <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
        </div>
    );
}

// ─── Overtime Settings Form ───────────────────────────────────────────────────

function OvertimeSettingsForm({ employeeId, currentWorkingHours, currentOvertimeRate, onSaved }: {
    employeeId: number; currentWorkingHours: number; currentOvertimeRate: number; onSaved: () => void;
}) {
    const [workingHours, setWorkingHours] = useState(String(currentWorkingHours));
    const [overtimeRate, setOvertimeRate] = useState(String(currentOvertimeRate));
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await hrApi.updateOvertimeSettings(employeeId, {
                workingHours: parseFloat(workingHours),
                overtimeRate: parseFloat(overtimeRate),
            });
            onSaved();
        } finally { setSaving(false); }
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Working Hours/Day</label>
                <input type="number" step="0.5" min="1" max="24" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Overtime Rate/Hour (৳)</label>
                <input type="number" step="0.01" min="0" value={overtimeRate} onChange={(e) => setOvertimeRate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg h-fit">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
            </button>
        </div>
    );
}