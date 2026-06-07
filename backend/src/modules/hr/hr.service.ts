import { prisma } from '../../config/database';
import { toNumber } from '../../utils/calculate';

// ─── Employee ─────────────────────────────────────────────────────────────────

export const hrService = {
    // Employees
    async createEmployee(data: {
        name: string;
        phone?: string;
        address?: string;
        position?: string;
        joinDate: string;
        basicSalary: number;
    }) {
        return prisma.employee.create({
            data: {
                ...data,
                joinDate: new Date(data.joinDate),
            },
        });
    },

    async getEmployees() {
        return prisma.employee.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    },

    async getEmployeeById(id: number) {
        return prisma.employee.findUniqueOrThrow({
            where: { id },
            include: {
                salaryPayments: {
                    orderBy: { paymentDate: 'desc' },
                    take: 12,
                },
            },
        });
    },

    async updateEmployee(
        id: number,
        data: {
            name: string;
            phone?: string;
            address?: string;
            position?: string;
            joinDate: string;
            basicSalary: number;
        }
    ) {
        return prisma.employee.update({
            where: { id },
            data: { ...data, joinDate: new Date(data.joinDate) },
        });
    },

    async deactivateEmployee(id: number) {
        await prisma.employee.update({ where: { id }, data: { isActive: false } });
        return { message: 'Employee deactivated' };
    },

    // ─── Attendance ─────────────────────────────────────────────────────────────

    async markAttendance(data: {
        employeeId: number;
        attendanceDate: string;
        status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'HOLIDAY' | 'LEAVE';
        note?: string;
    }) {
        return prisma.attendance.upsert({
            where: {
                employeeId_attendanceDate: {
                    employeeId: data.employeeId,
                    attendanceDate: new Date(data.attendanceDate),
                },
            },
            create: {
                employeeId: data.employeeId,
                attendanceDate: new Date(data.attendanceDate),
                status: data.status,
                note: data.note,
            },
            update: {
                status: data.status,
                note: data.note,
            },
        });
    },

    async getAttendanceByMonth(year: number, month: number, employeeId?: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const where: Record<string, unknown> = {
            attendanceDate: { gte: startDate, lte: endDate },
        };
        if (employeeId) where.employeeId = employeeId;

        return prisma.attendance.findMany({
            where,
            include: { employee: { select: { id: true, name: true, position: true } } },
            orderBy: [{ attendanceDate: 'asc' }, { employeeId: 'asc' }],
        });
    },

    async getAttendanceSummary(employeeId: number, year: number, month: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const records = await prisma.attendance.findMany({
            where: { employeeId, attendanceDate: { gte: startDate, lte: endDate } },
        });

        const summary = {
            present: 0,
            absent: 0,
            halfDay: 0,
            holiday: 0,
            leave: 0,
            total: records.length,
        };

        for (const r of records) {
            if (r.status === 'PRESENT') summary.present++;
            else if (r.status === 'ABSENT') summary.absent++;
            else if (r.status === 'HALF_DAY') summary.halfDay++;
            else if (r.status === 'HOLIDAY') summary.holiday++;
            else if (r.status === 'LEAVE') summary.leave++;
        }

        return summary;
    },

    // ─── Salary Payments ─────────────────────────────────────────────────────────

    /**
     * Pay salary/bonus/partial — automatically creates an Expense entry
     * so it shows up in daily accounts and expense reports.
     */
    async makePayment(data: {
        employeeId: number;
        paymentDate: string;
        paymentType: 'SALARY' | 'BONUS' | 'PARTIAL';
        amount: number;
        month?: number;
        year?: number;
        note?: string;
    }) {
        const employee = await prisma.employee.findUniqueOrThrow({
            where: { id: data.employeeId },
        });

        // Find "Staff Salary" category — fallback to first available
        let salaryCategory = await prisma.expenseCategory.findFirst({
            where: { categoryName: { contains: 'Salary', mode: 'insensitive' } },
        });

        if (!salaryCategory) {
            salaryCategory = await prisma.expenseCategory.findFirst();
        }

        if (!salaryCategory) {
            throw new Error('No expense category found. Please create one in Settings.');
        }

        const typeLabel =
            data.paymentType === 'SALARY'
                ? 'Salary'
                : data.paymentType === 'BONUS'
                    ? 'Bonus'
                    : 'Partial Salary';

        const expenseNote = `${typeLabel} - ${employee.name}${data.note ? ` (${data.note})` : ''}`;

        return prisma.$transaction(async (tx) => {
            // 1. Create expense entry
            const expense = await tx.expense.create({
                data: {
                    expenseDate: new Date(data.paymentDate),
                    categoryId: salaryCategory!.id,
                    amount: data.amount,
                    note: expenseNote,
                },
            });

            // 2. Create salary payment record linked to expense
            const payment = await tx.salaryPayment.create({
                data: {
                    employeeId: data.employeeId,
                    paymentDate: new Date(data.paymentDate),
                    paymentType: data.paymentType,
                    amount: data.amount,
                    month: data.month,
                    year: data.year,
                    note: data.note,
                    expenseId: expense.id,
                },
                include: {
                    employee: { select: { id: true, name: true, position: true } },
                },
            });

            return payment;
        });
    },

    async getPaymentsByEmployee(employeeId: number) {
        return prisma.salaryPayment.findMany({
            where: { employeeId },
            include: { employee: { select: { id: true, name: true } } },
            orderBy: { paymentDate: 'desc' },
        });
    },

    async getAllPayments(filters?: { startDate?: string; endDate?: string; type?: string }) {
        const where: Record<string, unknown> = {};
        if (filters?.startDate || filters?.endDate) {
            where.paymentDate = {
                ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
                ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
            };
        }
        if (filters?.type) where.paymentType = filters.type;

        return prisma.salaryPayment.findMany({
            where,
            include: { employee: { select: { id: true, name: true, position: true } } },
            orderBy: { paymentDate: 'desc' },
        });
    },

    async getMonthlySalaryStatus(year: number, month: number) {
        const employees = await prisma.employee.findMany({ where: { isActive: true } });

        const payments = await prisma.salaryPayment.findMany({
            where: { year, month },
            include: { employee: { select: { id: true, name: true } } },
        });

        return employees.map((emp) => {
            const empPayments = payments.filter((p) => p.employeeId === emp.id);
            const totalPaid = empPayments.reduce((s, p) => s + toNumber(p.amount), 0);
            const salaryPaid = empPayments.filter((p) => p.paymentType === 'SALARY').length > 0;
            const bonusPaid = empPayments.filter((p) => p.paymentType === 'BONUS').length > 0;

            return {
                employee: emp,
                basicSalary: toNumber(emp.basicSalary),
                totalPaid,
                remaining: Math.max(0, toNumber(emp.basicSalary) - totalPaid),
                salaryPaid,
                bonusPaid,
                payments: empPayments,
            };
        });
    },
};