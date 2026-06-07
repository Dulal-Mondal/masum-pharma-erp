'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrApi } from '@/lib/api';
import { formatCurrency, formatDate, today } from '@/lib/utils';
import {
    Users, CalendarDays, Wallet, Plus, Trash2, Pencil,
    Loader2, CheckCircle, Clock, XCircle, ChevronDown,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type Tab = 'employees' | 'attendance' | 'salary';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const statusConfig = {
    PRESENT: { label: 'Present', color: 'bg-green-100 text-green-700' },
    ABSENT: { label: 'Absent', color: 'bg-red-100 text-red-700' },
    HALF_DAY: { label: 'Half Day', color: 'bg-yellow-100 text-yellow-700' },
    HOLIDAY: { label: 'Holiday', color: 'bg-blue-100 text-blue-700' },
    LEAVE: { label: 'Leave', color: 'bg-purple-100 text-purple-700' },
};

interface Employee {
    id: number; name: string; phone?: string; address?: string;
    position?: string; joinDate: string; basicSalary: number; isActive: boolean;
}

export default function HRPage() {
    const [activeTab, setActiveTab] = useState<Tab>('employees');

    const tabs = [
        { id: 'employees' as Tab, label: 'Employees', icon: Users },
        { id: 'attendance' as Tab, label: 'Attendance', icon: CalendarDays },
        { id: 'salary' as Tab, label: 'Salary & Payments', icon: Wallet },
    ];

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 text-indigo-700 rounded-lg p-2">
                    <Users size={20} />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">HR Management</h1>
            </div>

            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 w-fit">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === id ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'employees' && <EmployeesTab />}
            {activeTab === 'attendance' && <AttendanceTab />}
            {activeTab === 'salary' && <SalaryTab />}
        </div>
    );
}

// ─── Employees Tab ────────────────────────────────────────────────────────────

const empSchema = z.object({
    name: z.string().min(1, 'Name required'),
    phone: z.string().optional(),
    address: z.string().optional(),
    position: z.string().optional(),
    joinDate: z.string().min(1, 'Join date required'),
    basicSalary: z.coerce.number().min(0),
});
type EmpForm = z.infer<typeof empSchema>;

function EmployeesTab() {
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<Employee | null>(null);
    const queryClient = useQueryClient();

    const { data: employees = [], isLoading } = useQuery({
        queryKey: ['employees'],
        queryFn: () => hrApi.getEmployees().then((r) => r.data.data as Employee[]),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => hrApi.deleteEmployee(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">{employees.length} active employees</span>
                <button
                    onClick={() => { setEditItem(null); setShowForm(true); }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
                >
                    <Plus size={15} /> Add Employee
                </button>
            </div>

            {showForm && (
                <EmployeeModal
                    editData={editItem}
                    onClose={() => { setShowForm(false); setEditItem(null); }}
                    onSaved={() => {
                        queryClient.invalidateQueries({ queryKey: ['employees'] });
                        setShowForm(false); setEditItem(null);
                    }}
                />
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-gray-300" /></div>
                ) : employees.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-sm">No employees yet. Add your first employee.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Position</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Join Date</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Basic Salary</th>
                                    <th className="px-5 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-3 font-medium text-gray-900">{emp.name}</td>
                                        <td className="px-5 py-3 text-gray-500">{emp.position || '—'}</td>
                                        <td className="px-5 py-3 text-gray-500">{emp.phone || '—'}</td>
                                        <td className="px-5 py-3 text-gray-500">{formatDate(emp.joinDate)}</td>
                                        <td className="px-5 py-3 text-right font-semibold text-gray-900">{formatCurrency(Number(emp.basicSalary))}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2 justify-end">
                                                <button onClick={() => { setEditItem(emp); setShowForm(true); }} className="text-blue-400 hover:text-blue-600 p-1"><Pencil size={14} /></button>
                                                <button onClick={() => { if (confirm(`Remove ${emp.name}?`)) deleteMutation.mutate(emp.id); }} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
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

function EmployeeModal({ editData, onClose, onSaved }: { editData: Employee | null; onClose: () => void; onSaved: () => void }) {
    const isEdit = !!editData;
    const [apiError, setApiError] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EmpForm>({
        resolver: zodResolver(empSchema),
        defaultValues: editData ? {
            name: editData.name, phone: editData.phone ?? '', address: editData.address ?? '',
            position: editData.position ?? '', joinDate: editData.joinDate.split('T')[0],
            basicSalary: Number(editData.basicSalary),
        } : { joinDate: today(), basicSalary: 0 },
    });

    const onSubmit = async (data: EmpForm) => {
        try {
            setApiError('');
            if (isEdit) await hrApi.updateEmployee(editData!.id, data);
            else await hrApi.createEmployee(data);
            onSaved();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setApiError(msg || 'Failed to save');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Full Name *</label>
                            <input {...register('name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
                            <input {...register('position')} placeholder="e.g. Pharmacist" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                            <input {...register('phone')} placeholder="01XXXXXXXXX" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Join Date *</label>
                            <input type="date" {...register('joinDate')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Basic Salary (৳)</label>
                            <input type="number" step="0.01" min="0" {...register('basicSalary')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                            <input {...register('address')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                    {apiError && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2"><p className="text-xs text-red-600">{apiError}</p></div>}
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm">
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

// ─── Attendance Tab ───────────────────────────────────────────────────────────

function AttendanceTab() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [selectedDate, setSelectedDate] = useState(today());
    const queryClient = useQueryClient();

    const { data: employees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: () => hrApi.getEmployees().then((r) => r.data.data as Employee[]),
    });

    const { data: attendance = [], refetch } = useQuery({
        queryKey: ['attendance', year, month],
        queryFn: () => hrApi.getAttendance({ year, month }).then((r) => r.data.data as Array<{ employeeId: number; attendanceDate: string; status: string }>),
    });

    const markMutation = useMutation({
        mutationFn: (data: unknown) => hrApi.markAttendance(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            refetch();
        },
    });

    const getStatus = (empId: number, date: string) => {
        const rec = attendance.find(
            (a) => a.employeeId === empId && a.attendanceDate.split('T')[0] === date
        );
        return rec?.status ?? null;
    };

    return (
        <div>
            {/* Controls */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Month View</label>
                    <div className="flex gap-2">
                        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            {monthNames.map((n, i) => <option key={i + 1} value={i + 1}>{n}</option>)}
                        </select>
                        <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
            </div>

            {/* Quick Mark for selected date */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
                <div className="px-5 py-3 border-b border-gray-100 bg-indigo-50">
                    <h2 className="text-sm font-semibold text-indigo-800">Mark Attendance — {formatDate(selectedDate)}</h2>
                </div>
                <div className="divide-y divide-gray-50">
                    {employees.map((emp) => {
                        const currentStatus = getStatus(emp.id, selectedDate);
                        return (
                            <div key={emp.id} className="flex items-center justify-between px-5 py-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                                    <p className="text-xs text-gray-400">{emp.position || 'Staff'}</p>
                                </div>
                                <div className="flex gap-1.5 flex-wrap justify-end">
                                    {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => markMutation.mutate({ employeeId: emp.id, attendanceDate: selectedDate, status })}
                                            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${currentStatus === status
                                                    ? statusConfig[status].color + ' ring-2 ring-offset-1 ring-indigo-400'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                        >
                                            {statusConfig[status].label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Monthly Summary */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700">Monthly Summary — {monthNames[month - 1]} {year}</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                                <th className="text-center px-3 py-3 text-xs font-medium text-green-600 uppercase">Present</th>
                                <th className="text-center px-3 py-3 text-xs font-medium text-red-500 uppercase">Absent</th>
                                <th className="text-center px-3 py-3 text-xs font-medium text-yellow-600 uppercase">Half Day</th>
                                <th className="text-center px-3 py-3 text-xs font-medium text-blue-500 uppercase">Holiday</th>
                                <th className="text-center px-3 py-3 text-xs font-medium text-purple-500 uppercase">Leave</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {employees.map((emp) => {
                                const empAtt = attendance.filter((a) => a.employeeId === emp.id);
                                const count = (s: string) => empAtt.filter((a) => a.status === s).length;
                                return (
                                    <tr key={emp.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-3 font-medium text-gray-900">{emp.name}</td>
                                        <td className="px-3 py-3 text-center"><span className="text-green-700 font-semibold">{count('PRESENT')}</span></td>
                                        <td className="px-3 py-3 text-center"><span className="text-red-600 font-semibold">{count('ABSENT')}</span></td>
                                        <td className="px-3 py-3 text-center"><span className="text-yellow-600 font-semibold">{count('HALF_DAY')}</span></td>
                                        <td className="px-3 py-3 text-center"><span className="text-blue-600 font-semibold">{count('HOLIDAY')}</span></td>
                                        <td className="px-3 py-3 text-center"><span className="text-purple-600 font-semibold">{count('LEAVE')}</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ─── Salary Tab ───────────────────────────────────────────────────────────────

function SalaryTab() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
    const queryClient = useQueryClient();

    const { data: salaryStatus = [], isLoading } = useQuery({
        queryKey: ['salary-status', year, month],
        queryFn: () => hrApi.getMonthlySalaryStatus({ year, month }).then((r) => r.data.data as Array<{
            employee: Employee;
            basicSalary: number;
            totalPaid: number;
            remaining: number;
            salaryPaid: boolean;
            bonusPaid: boolean;
        }>),
    });

    const totalBasic = salaryStatus.reduce((s, e) => s + Number(e.basicSalary), 0);
    const totalPaid = salaryStatus.reduce((s, e) => s + Number(e.totalPaid), 0);

    return (
        <div>
            {/* Month selector */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-3 items-end">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
                    <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {monthNames.map((n, i) => <option key={i + 1} value={i + 1}>{n}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
                    <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase mb-1">Total Payable</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(totalBasic)}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-xs font-medium text-green-600 uppercase mb-1">Total Paid</p>
                    <p className="text-xl font-bold text-green-800">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-xs font-medium text-red-500 uppercase mb-1">Remaining</p>
                    <p className="text-xl font-bold text-red-700">{formatCurrency(Math.max(0, totalBasic - totalPaid))}</p>
                </div>
            </div>

            {showPayModal && selectedEmp && (
                <PaymentModal
                    employee={selectedEmp}
                    month={month}
                    year={year}
                    onClose={() => { setShowPayModal(false); setSelectedEmp(null); }}
                    onSaved={() => {
                        queryClient.invalidateQueries({ queryKey: ['salary-status'] });
                        queryClient.invalidateQueries({ queryKey: ['expenses'] });
                        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                        queryClient.invalidateQueries({ queryKey: ['daily-dashboard'] });
                        setShowPayModal(false);
                        setSelectedEmp(null);
                    }}
                />
            )}

            {/* Employee salary table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700">
                        Salary Status — {monthNames[month - 1]} {year}
                    </h2>
                </div>
                {isLoading ? (
                    <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-gray-300" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Basic Salary</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Paid</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Remaining</th>
                                    <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-5 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {salaryStatus.map(({ employee: emp, basicSalary, totalPaid, remaining, salaryPaid }) => (
                                    <tr key={emp.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-3">
                                            <p className="font-medium text-gray-900">{emp.name}</p>
                                            <p className="text-xs text-gray-400">{emp.position || 'Staff'}</p>
                                        </td>
                                        <td className="px-5 py-3 text-right text-gray-700">{formatCurrency(basicSalary)}</td>
                                        <td className="px-5 py-3 text-right font-medium text-green-700">{formatCurrency(totalPaid)}</td>
                                        <td className="px-5 py-3 text-right font-medium text-red-600">{formatCurrency(remaining)}</td>
                                        <td className="px-5 py-3 text-center">
                                            {salaryPaid ? (
                                                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                    <CheckCircle size={11} /> Paid
                                                </span>
                                            ) : totalPaid > 0 ? (
                                                <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                                    <Clock size={11} /> Partial
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                                    <XCircle size={11} /> Unpaid
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            <button
                                                onClick={() => { setSelectedEmp(emp); setShowPayModal(true); }}
                                                className="flex items-center gap-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                <Wallet size={12} /> Pay
                                            </button>
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

// ─── Payment Modal ────────────────────────────────────────────────────────────

const paySchema = z.object({
    paymentType: z.enum(['SALARY', 'BONUS', 'PARTIAL']),
    amount: z.coerce.number().positive('Amount must be positive'),
    paymentDate: z.string().min(1),
    note: z.string().optional(),
});
type PayForm = z.infer<typeof paySchema>;

function PaymentModal({ employee, month, year, onClose, onSaved }: {
    employee: Employee; month: number; year: number;
    onClose: () => void; onSaved: () => void;
}) {
    const [apiError, setApiError] = useState('');
    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<PayForm>({
        resolver: zodResolver(paySchema),
        defaultValues: {
            paymentType: 'SALARY',
            amount: Number(employee.basicSalary),
            paymentDate: today(),
        },
    });

    const paymentType = watch('paymentType');

    const onSubmit = async (data: PayForm) => {
        try {
            setApiError('');
            await hrApi.makePayment({ ...data, employeeId: employee.id, month, year });
            onSaved();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setApiError(msg || 'Payment failed');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">Pay — {employee.name}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Basic Salary: {formatCurrency(Number(employee.basicSalary))}</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {/* Payment Type */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">Payment Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'SALARY', label: 'Salary', color: 'indigo' },
                                { value: 'BONUS', label: 'Bonus', color: 'green' },
                                { value: 'PARTIAL', label: 'Partial', color: 'amber' },
                            ].map(({ value, label, color }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                        setValue('paymentType', value as 'SALARY' | 'BONUS' | 'PARTIAL');
                                        if (value === 'SALARY') setValue('amount', Number(employee.basicSalary));
                                    }}
                                    className={`py-2 rounded-lg text-sm font-medium border transition-colors ${paymentType === value
                                            ? `bg-${color}-600 text-white border-${color}-600`
                                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    style={{
                                        backgroundColor: paymentType === value
                                            ? value === 'SALARY' ? '#4f46e5' : value === 'BONUS' ? '#16a34a' : '#d97706'
                                            : undefined,
                                        color: paymentType === value ? 'white' : undefined,
                                        borderColor: paymentType === value
                                            ? value === 'SALARY' ? '#4f46e5' : value === 'BONUS' ? '#16a34a' : '#d97706'
                                            : undefined,
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Amount (৳) *</label>
                        <input type="number" step="0.01" min="0" {...register('amount')} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Payment Date *</label>
                        <input type="date" {...register('paymentDate')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Note</label>
                        <input {...register('note')} placeholder="Optional" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 text-xs text-indigo-700">
                        ✓ এই payment automatically Expense এ যোগ হবে এবং Daily Account এ count হবে।
                    </div>

                    {apiError && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2"><p className="text-xs text-red-600">{apiError}</p></div>}

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm">
                            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                            Confirm Payment
                        </button>
                        <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}