// import { prisma } from '../../config/database';
// import { toNumber } from '../../utils/calculate';

// export const hrService = {
//     // ─── Employees ───────────────────────────────────────────────────────────────

//     async createEmployee(data: {
//         name: string; phone?: string; address?: string;
//         position?: string; joinDate: string; basicSalary: number;
//     }) {
//         return prisma.employee.create({
//             data: { ...data, joinDate: new Date(data.joinDate) },
//         });
//     },

//     async getEmployees() {
//         return prisma.employee.findMany({
//             where: { isActive: true },
//             orderBy: { name: 'asc' },
//         });
//     },

//     async getEmployeeById(id: number) {
//         return prisma.employee.findUniqueOrThrow({
//             where: { id },
//             include: {
//                 salaryPayments: { orderBy: { paymentDate: 'desc' }, take: 12 },
//             },
//         });
//     },

//     async updateEmployee(id: number, data: {
//         name: string; phone?: string; address?: string;
//         position?: string; joinDate: string; basicSalary: number;
//     }) {
//         return prisma.employee.update({
//             where: { id },
//             data: { ...data, joinDate: new Date(data.joinDate) },
//         });
//     },

//     async deactivateEmployee(id: number) {
//         await prisma.employee.update({ where: { id }, data: { isActive: false } });
//         return { message: 'Employee deactivated' };
//     },

//     // ─── Attendance ───────────────────────────────────────────────────────────────

//     async markAttendance(data: {
//         employeeId: number; attendanceDate: string;
//         status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'HOLIDAY' | 'LEAVE'; note?: string;
//     }) {
//         return prisma.attendance.upsert({
//             where: {
//                 employeeId_attendanceDate: {
//                     employeeId: data.employeeId,
//                     attendanceDate: new Date(data.attendanceDate),
//                 },
//             },
//             create: {
//                 employeeId: data.employeeId,
//                 attendanceDate: new Date(data.attendanceDate),
//                 status: data.status,
//                 note: data.note,
//             },
//             update: { status: data.status, note: data.note },
//         });
//     },

//     async getAttendanceByMonth(year: number, month: number, employeeId?: number) {
//         const startDate = new Date(year, month - 1, 1);
//         const endDate = new Date(year, month, 0);
//         const where: Record<string, unknown> = {
//             attendanceDate: { gte: startDate, lte: endDate },
//         };
//         if (employeeId) where.employeeId = employeeId;
//         return prisma.attendance.findMany({
//             where,
//             include: { employee: { select: { id: true, name: true, position: true } } },
//             orderBy: [{ attendanceDate: 'asc' }, { employeeId: 'asc' }],
//         });
//     },

//     async getAttendanceSummary(employeeId: number, year: number, month: number) {
//         const startDate = new Date(year, month - 1, 1);
//         const endDate = new Date(year, month, 0);
//         const records = await prisma.attendance.findMany({
//             where: { employeeId, attendanceDate: { gte: startDate, lte: endDate } },
//         });
//         const summary = { present: 0, absent: 0, halfDay: 0, holiday: 0, leave: 0, total: records.length };
//         for (const r of records) {
//             if (r.status === 'PRESENT') summary.present++;
//             else if (r.status === 'ABSENT') summary.absent++;
//             else if (r.status === 'HALF_DAY') summary.halfDay++;
//             else if (r.status === 'HOLIDAY') summary.holiday++;
//             else if (r.status === 'LEAVE') summary.leave++;
//         }
//         return summary;
//     },

//     // ─── Salary Payments ──────────────────────────────────────────────────────────

//     /**
//      * FIX 1: Salary → "Staff Salary" category
//      *        Bonus  → "Bonus" category (auto-created if missing)
//      *        Partial → "Staff Salary" category
//      *
//      * FIX 2: Delete payment also deletes linked expense
//      */
//     async makePayment(data: {
//         employeeId: number;
//         paymentDate: string;
//         paymentType: 'SALARY' | 'BONUS' | 'PARTIAL';
//         amount: number;
//         month?: number;
//         year?: number;
//         note?: string;
//     }) {
//         const employee = await prisma.employee.findUniqueOrThrow({
//             where: { id: data.employeeId },
//         });

//         // ── Pick the right expense category based on payment type ──
//         let category;

//         if (data.paymentType === 'BONUS') {
//             // Find or create "Bonus" category
//             category = await prisma.expenseCategory.findFirst({
//                 where: { categoryName: { contains: 'Bonus', mode: 'insensitive' } },
//             });
//             if (!category) {
//                 category = await prisma.expenseCategory.create({
//                     data: { categoryName: 'Bonus' },
//                 });
//             }
//         } else {
//             // Salary or Partial → "Staff Salary" category
//             category = await prisma.expenseCategory.findFirst({
//                 where: { categoryName: { contains: 'Salary', mode: 'insensitive' } },
//             });
//             if (!category) {
//                 // Fallback: create it
//                 category = await prisma.expenseCategory.create({
//                     data: { categoryName: 'Staff Salary' },
//                 });
//             }
//         }

//         const typeLabel =
//             data.paymentType === 'SALARY' ? 'Salary'
//                 : data.paymentType === 'BONUS' ? 'Bonus'
//                     : 'Partial Salary';

//         const expenseNote = `${typeLabel} - ${employee.name}${data.note ? ` (${data.note})` : ''}`;

//         return prisma.$transaction(async (tx) => {
//             const expense = await tx.expense.create({
//                 data: {
//                     expenseDate: new Date(data.paymentDate),
//                     categoryId: category!.id,
//                     amount: data.amount,
//                     note: expenseNote,
//                 },
//             });

//             const payment = await tx.salaryPayment.create({
//                 data: {
//                     employeeId: data.employeeId,
//                     paymentDate: new Date(data.paymentDate),
//                     paymentType: data.paymentType,
//                     amount: data.amount,
//                     month: data.month,
//                     year: data.year,
//                     note: data.note,
//                     expenseId: expense.id,
//                 },
//                 include: {
//                     employee: { select: { id: true, name: true, position: true } },
//                 },
//             });

//             return payment;
//         });
//     },

//     /**
//      * FIX 1: Delete payment AND its linked expense together
//      */
//     async deletePayment(id: number) {
//         const payment = await prisma.salaryPayment.findUniqueOrThrow({
//             where: { id },
//         });

//         await prisma.$transaction(async (tx) => {
//             // Delete salary payment first (FK constraint)
//             await tx.salaryPayment.delete({ where: { id } });

//             // Then delete the linked expense if it exists
//             if (payment.expenseId) {
//                 await tx.expense.delete({ where: { id: payment.expenseId } });
//             }
//         });

//         return { message: 'Payment and linked expense deleted successfully' };
//     },

//     async getPaymentsByEmployee(employeeId: number) {
//         return prisma.salaryPayment.findMany({
//             where: { employeeId },
//             include: { employee: { select: { id: true, name: true } } },
//             orderBy: { paymentDate: 'desc' },
//         });
//     },

//     async getAllPayments(filters?: { startDate?: string; endDate?: string; type?: string }) {
//         const where: Record<string, unknown> = {};
//         if (filters?.startDate || filters?.endDate) {
//             where.paymentDate = {
//                 ...(filters?.startDate ? { gte: new Date(filters.startDate) } : {}),
//                 ...(filters?.endDate ? { lte: new Date(filters.endDate) } : {}),
//             };
//         }
//         if (filters?.type) where.paymentType = filters.type;
//         return prisma.salaryPayment.findMany({
//             where,
//             include: { employee: { select: { id: true, name: true, position: true } } },
//             orderBy: { paymentDate: 'desc' },
//         });
//     },

//     async getMonthlySalaryStatus(year: number, month: number) {
//         const employees = await prisma.employee.findMany({ where: { isActive: true } });
//         const payments = await prisma.salaryPayment.findMany({
//             where: { year, month },
//             include: { employee: { select: { id: true, name: true } } },
//         });

//         return employees.map((emp) => {
//             const empPayments = payments.filter((p) => p.employeeId === emp.id);

//             // Salary + Partial count toward basic salary — Bonus is separate
//             const salaryPaid = empPayments
//                 .filter((p) => p.paymentType === 'SALARY' || p.paymentType === 'PARTIAL')
//                 .reduce((s, p) => s + toNumber(p.amount), 0);

//             const bonusPaid = empPayments
//                 .filter((p) => p.paymentType === 'BONUS')
//                 .reduce((s, p) => s + toNumber(p.amount), 0);

//             return {
//                 employee: emp,
//                 basicSalary: toNumber(emp.basicSalary),
//                 salaryPaid,
//                 bonusPaid,
//                 remaining: Math.max(0, toNumber(emp.basicSalary) - salaryPaid),
//                 isSalaryFullyPaid: empPayments.some((p) => p.paymentType === 'SALARY'),
//                 payments: empPayments,
//             };
//         });
//     },
// };












import { prisma } from '../../config/database';
import { toNumber } from '../../utils/calculate';

export const hrService = {
    // ─── Employees ───────────────────────────────────────────────────────────────

    async createEmployee(data: {
        name: string; phone?: string; address?: string;
        position?: string; joinDate: string; basicSalary: number;
    }) {
        return prisma.employee.create({
            data: { ...data, joinDate: new Date(data.joinDate) },
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
                salaryPayments: { orderBy: { paymentDate: 'desc' }, take: 12 },
            },
        });
    },

    async updateEmployee(id: number, data: {
        name: string; phone?: string; address?: string;
        position?: string; joinDate: string; basicSalary: number;
    }) {
        return prisma.employee.update({
            where: { id },
            data: { ...data, joinDate: new Date(data.joinDate) },
        });
    },

    async deactivateEmployee(id: number) {
        await prisma.employee.update({ where: { id }, data: { isActive: false } });
        return { message: 'Employee deactivated' };
    },

    // ─── Attendance ───────────────────────────────────────────────────────────────

    async markAttendance(data: {
        employeeId: number; attendanceDate: string;
        status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'HOLIDAY' | 'LEAVE'; note?: string;
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
            update: { status: data.status, note: data.note },
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
        const summary = { present: 0, absent: 0, halfDay: 0, holiday: 0, leave: 0, total: records.length };
        for (const r of records) {
            if (r.status === 'PRESENT') summary.present++;
            else if (r.status === 'ABSENT') summary.absent++;
            else if (r.status === 'HALF_DAY') summary.halfDay++;
            else if (r.status === 'HOLIDAY') summary.holiday++;
            else if (r.status === 'LEAVE') summary.leave++;
        }
        return summary;
    },

    // ─── Salary Payments ──────────────────────────────────────────────────────────

    /**
     * FIX 1: Salary → "Staff Salary" category
     *        Bonus  → "Bonus" category (auto-created if missing)
     *        Partial → "Staff Salary" category
     *
     * FIX 2: Delete payment also deletes linked expense
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

        // ── Pick the right expense category based on payment type ──
        let category;

        if (data.paymentType === 'BONUS') {
            // Find or create "Bonus" category
            category = await prisma.expenseCategory.findFirst({
                where: { categoryName: { contains: 'Bonus', mode: 'insensitive' } },
            });
            if (!category) {
                category = await prisma.expenseCategory.create({
                    data: { categoryName: 'Bonus' },
                });
            }
        } else {
            // Salary or Partial → "Staff Salary" category
            category = await prisma.expenseCategory.findFirst({
                where: { categoryName: { contains: 'Salary', mode: 'insensitive' } },
            });
            if (!category) {
                // Fallback: create it
                category = await prisma.expenseCategory.create({
                    data: { categoryName: 'Staff Salary' },
                });
            }
        }

        const typeLabel =
            data.paymentType === 'SALARY' ? 'Salary'
                : data.paymentType === 'BONUS' ? 'Bonus'
                    : 'Partial Salary';

        const expenseNote = `${typeLabel} - ${employee.name}${data.note ? ` (${data.note})` : ''}`;

        return prisma.$transaction(async (tx) => {
            const expense = await tx.expense.create({
                data: {
                    expenseDate: new Date(data.paymentDate),
                    categoryId: category!.id,
                    amount: data.amount,
                    note: expenseNote,
                },
            });

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

    /**
     * FIX 1: Delete payment AND its linked expense together
     */
    async deletePayment(id: number) {
        const payment = await prisma.salaryPayment.findUniqueOrThrow({
            where: { id },
        });

        await prisma.$transaction(async (tx) => {
            // Delete salary payment first (FK constraint)
            await tx.salaryPayment.delete({ where: { id } });

            // Then delete the linked expense if it exists
            if (payment.expenseId) {
                await tx.expense.delete({ where: { id: payment.expenseId } });
            }
        });

        return { message: 'Payment and linked expense deleted successfully' };
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
                ...(filters?.startDate ? { gte: new Date(filters.startDate) } : {}),
                ...(filters?.endDate ? { lte: new Date(filters.endDate) } : {}),
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

            // Salary + Partial count toward basic salary — Bonus is separate
            const salaryPaid = empPayments
                .filter((p) => p.paymentType === 'SALARY' || p.paymentType === 'PARTIAL')
                .reduce((s, p) => s + toNumber(p.amount), 0);

            const bonusPaid = empPayments
                .filter((p) => p.paymentType === 'BONUS')
                .reduce((s, p) => s + toNumber(p.amount), 0);

            return {
                employee: emp,
                basicSalary: toNumber(emp.basicSalary),
                salaryPaid,
                bonusPaid,
                remaining: Math.max(0, toNumber(emp.basicSalary) - salaryPaid),
                isSalaryFullyPaid: empPayments.some((p) => p.paymentType === 'SALARY'),
                payments: empPayments,
            };
        });
    },
};

// ─── Time Entries (added to hrService object above) ──────────────────────────
// These are exported as separate service functions for time tracking

export const timeEntryService = {
    async upsertTimeEntry(data: {
        employeeId: number;
        entryDate: string;
        checkIn?: string;
        checkOut?: string;
        note?: string;
    }) {
        const employee = await prisma.employee.findUniqueOrThrow({
            where: { id: data.employeeId },
        });

        // Calculate work hours if both check-in and check-out provided
        let workHours: number | null = null;
        let overtimeHours = 0;

        if (data.checkIn && data.checkOut) {
            const [inH, inM] = data.checkIn.split(':').map(Number);
            const [outH, outM] = data.checkOut.split(':').map(Number);
            const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
            workHours = parseFloat((totalMinutes / 60).toFixed(2));

            const standardHours = parseFloat(employee.workingHours.toString());
            if (workHours > standardHours) {
                overtimeHours = parseFloat((workHours - standardHours).toFixed(2));
            }
        }

        return prisma.timeEntry.upsert({
            where: {
                employeeId_entryDate: {
                    employeeId: data.employeeId,
                    entryDate: new Date(data.entryDate),
                },
            },
            create: {
                employeeId: data.employeeId,
                entryDate: new Date(data.entryDate),
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                workHours,
                overtimeHours,
                note: data.note,
            },
            update: {
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                workHours,
                overtimeHours,
                note: data.note,
            },
            include: {
                employee: { select: { id: true, name: true, workingHours: true } },
            },
        });
    },

    async getTimeEntriesByEmployee(employeeId: number, filters?: {
        startDate?: string;
        endDate?: string;
        year?: number;
        month?: number;
    }) {
        const where: Record<string, unknown> = { employeeId };

        if (filters?.startDate || filters?.endDate) {
            where.entryDate = {
                ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
                ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
            };
        } else if (filters?.year && filters?.month) {
            where.entryDate = {
                gte: new Date(filters.year, filters.month - 1, 1),
                lte: new Date(filters.year, filters.month, 0),
            };
        }

        return prisma.timeEntry.findMany({
            where,
            orderBy: { entryDate: 'desc' },
        });
    },

    async getEmployeeFullProfile(id: number) {
        const employee = await prisma.employee.findUniqueOrThrow({
            where: { id },
        });

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const [timeEntries, attendance, salaryPayments] = await Promise.all([
            prisma.timeEntry.findMany({
                where: {
                    employeeId: id,
                    entryDate: {
                        gte: new Date(year, month - 1, 1),
                        lte: new Date(year, month, 0),
                    },
                },
                orderBy: { entryDate: 'desc' },
            }),
            prisma.attendance.findMany({
                where: {
                    employeeId: id,
                    attendanceDate: {
                        gte: new Date(year, month - 1, 1),
                        lte: new Date(year, month, 0),
                    },
                },
                orderBy: { attendanceDate: 'desc' },
            }),
            prisma.salaryPayment.findMany({
                where: { employeeId: id },
                orderBy: { paymentDate: 'desc' },
                take: 24,
            }),
        ]);

        // Calculate monthly stats
        const totalWorkHours = timeEntries.reduce(
            (s, e) => s + parseFloat((e.workHours ?? 0).toString()), 0
        );
        const totalOvertimeHours = timeEntries.reduce(
            (s, e) => s + parseFloat((e.overtimeHours ?? 0).toString()), 0
        );
        const overtimeRate = parseFloat(employee.overtimeRate.toString());
        const overtimePay = parseFloat((totalOvertimeHours * overtimeRate).toFixed(2));

        const totalSalaryPaid = salaryPayments
            .filter((p) => p.paymentType === 'SALARY' || p.paymentType === 'PARTIAL')
            .reduce((s, p) => s + parseFloat(p.amount.toString()), 0);

        const totalBonusPaid = salaryPayments
            .filter((p) => p.paymentType === 'BONUS')
            .reduce((s, p) => s + parseFloat(p.amount.toString()), 0);

        return {
            employee,
            currentMonth: { year, month },
            timeEntries,
            attendance,
            salaryPayments,
            stats: {
                totalWorkHours: parseFloat(totalWorkHours.toFixed(2)),
                totalOvertimeHours: parseFloat(totalOvertimeHours.toFixed(2)),
                overtimePay,
                totalSalaryPaid,
                totalBonusPaid,
                presentDays: attendance.filter((a) => a.status === 'PRESENT').length,
                absentDays: attendance.filter((a) => a.status === 'ABSENT').length,
            },
        };
    },

    async deleteTimeEntry(id: number) {
        await prisma.timeEntry.delete({ where: { id } });
        return { message: 'Time entry deleted' };
    },
};