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

// // ─── Time Entries (added to hrService object above) ──────────────────────────
// // These are exported as separate service functions for time tracking

// export const timeEntryService = {
//     async upsertTimeEntry(data: {
//         employeeId: number;
//         entryDate: string;
//         checkIn?: string;
//         checkOut?: string;
//         note?: string;
//     }) {
//         const employee = await prisma.employee.findUniqueOrThrow({
//             where: { id: data.employeeId },
//         });

//         // Calculate work hours if both check-in and check-out provided
//         let workHours: number | null = null;
//         let overtimeHours = 0;

//         if (data.checkIn && data.checkOut) {
//             const [inH, inM] = data.checkIn.split(':').map(Number);
//             const [outH, outM] = data.checkOut.split(':').map(Number);
//             const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
//             workHours = parseFloat((totalMinutes / 60).toFixed(2));

//             const standardHours = parseFloat(employee.workingHours.toString());
//             if (workHours > standardHours) {
//                 overtimeHours = parseFloat((workHours - standardHours).toFixed(2));
//             }
//         }

//         return prisma.timeEntry.upsert({
//             where: {
//                 employeeId_entryDate: {
//                     employeeId: data.employeeId,
//                     entryDate: new Date(data.entryDate),
//                 },
//             },
//             create: {
//                 employeeId: data.employeeId,
//                 entryDate: new Date(data.entryDate),
//                 checkIn: data.checkIn,
//                 checkOut: data.checkOut,
//                 workHours,
//                 overtimeHours,
//                 note: data.note,
//             },
//             update: {
//                 checkIn: data.checkIn,
//                 checkOut: data.checkOut,
//                 workHours,
//                 overtimeHours,
//                 note: data.note,
//             },
//             include: {
//                 employee: { select: { id: true, name: true, workingHours: true } },
//             },
//         });
//     },

//     async getTimeEntriesByEmployee(employeeId: number, filters?: {
//         startDate?: string;
//         endDate?: string;
//         year?: number;
//         month?: number;
//     }) {
//         const where: Record<string, unknown> = { employeeId };

//         if (filters?.startDate || filters?.endDate) {
//             where.entryDate = {
//                 ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
//                 ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
//             };
//         } else if (filters?.year && filters?.month) {
//             where.entryDate = {
//                 gte: new Date(filters.year, filters.month - 1, 1),
//                 lte: new Date(filters.year, filters.month, 0),
//             };
//         }

//         return prisma.timeEntry.findMany({
//             where,
//             orderBy: { entryDate: 'desc' },
//         });
//     },

//     async getEmployeeFullProfile(id: number) {
//         const employee = await prisma.employee.findUniqueOrThrow({
//             where: { id },
//         });

//         const now = new Date();
//         const year = now.getFullYear();
//         const month = now.getMonth() + 1;

//         const [timeEntries, attendance, salaryPayments] = await Promise.all([
//             prisma.timeEntry.findMany({
//                 where: {
//                     employeeId: id,
//                     entryDate: {
//                         gte: new Date(year, month - 1, 1),
//                         lte: new Date(year, month, 0),
//                     },
//                 },
//                 orderBy: { entryDate: 'desc' },
//             }),
//             prisma.attendance.findMany({
//                 where: {
//                     employeeId: id,
//                     attendanceDate: {
//                         gte: new Date(year, month - 1, 1),
//                         lte: new Date(year, month, 0),
//                     },
//                 },
//                 orderBy: { attendanceDate: 'desc' },
//             }),
//             prisma.salaryPayment.findMany({
//                 where: { employeeId: id },
//                 orderBy: { paymentDate: 'desc' },
//                 take: 24,
//             }),
//         ]);

//         // Calculate monthly stats
//         const totalWorkHours = timeEntries.reduce(
//             (s, e) => s + parseFloat((e.workHours ?? 0).toString()), 0
//         );
//         const totalOvertimeHours = timeEntries.reduce(
//             (s, e) => s + parseFloat((e.overtimeHours ?? 0).toString()), 0
//         );
//         const overtimeRate = parseFloat(employee.overtimeRate.toString());
//         const overtimePay = parseFloat((totalOvertimeHours * overtimeRate).toFixed(2));

//         const totalSalaryPaid = salaryPayments
//             .filter((p) => p.paymentType === 'SALARY' || p.paymentType === 'PARTIAL')
//             .reduce((s, p) => s + parseFloat(p.amount.toString()), 0);

//         const totalBonusPaid = salaryPayments
//             .filter((p) => p.paymentType === 'BONUS')
//             .reduce((s, p) => s + parseFloat(p.amount.toString()), 0);

//         return {
//             employee,
//             currentMonth: { year, month },
//             timeEntries,
//             attendance,
//             salaryPayments,
//             stats: {
//                 totalWorkHours: parseFloat(totalWorkHours.toFixed(2)),
//                 totalOvertimeHours: parseFloat(totalOvertimeHours.toFixed(2)),
//                 overtimePay,
//                 totalSalaryPaid,
//                 totalBonusPaid,
//                 presentDays: attendance.filter((a) => a.status === 'PRESENT').length,
//                 absentDays: attendance.filter((a) => a.status === 'ABSENT').length,
//             },
//         };
//     },

//     async deleteTimeEntry(id: number) {
//         await prisma.timeEntry.delete({ where: { id } });
//         return { message: 'Time entry deleted' };
//     },
// };











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

//         const [payments, timeEntries] = await Promise.all([
//             prisma.salaryPayment.findMany({
//                 where: { year, month },
//                 include: { employee: { select: { id: true, name: true } } },
//             }),
//             prisma.timeEntry.findMany({
//                 where: {
//                     entryDate: {
//                         gte: new Date(year, month - 1, 1),
//                         lte: new Date(year, month, 0),
//                     },
//                 },
//             }),
//         ]);

//         return employees.map((emp) => {
//             const empPayments = payments.filter((p) => p.employeeId === emp.id);
//             const empTimeEntries = timeEntries.filter((t) => t.employeeId === emp.id);

//             // Salary + Partial count toward basic salary — Bonus is separate
//             const salaryPaid = empPayments
//                 .filter((p) => p.paymentType === 'SALARY' || p.paymentType === 'PARTIAL')
//                 .reduce((s, p) => s + toNumber(p.amount), 0);

//             const bonusPaid = empPayments
//                 .filter((p) => p.paymentType === 'BONUS')
//                 .reduce((s, p) => s + toNumber(p.amount), 0);

//             // Calculate overtime bill from time entries
//             const totalOvertimeHours = empTimeEntries.reduce(
//                 (s, t) => s + toNumber(t.overtimeHours), 0
//             );
//             const overtimeRate = toNumber(emp.overtimeRate);
//             const overtimeBill = parseFloat((totalOvertimeHours * overtimeRate).toFixed(2));
//             const totalPayable = toNumber(emp.basicSalary) + overtimeBill;

//             return {
//                 employee: emp,
//                 basicSalary: toNumber(emp.basicSalary),
//                 overtimeBill,
//                 totalPayable,
//                 totalOvertimeHours: parseFloat(totalOvertimeHours.toFixed(2)),
//                 salaryPaid,
//                 bonusPaid,
//                 remaining: Math.max(0, totalPayable - salaryPaid),
//                 isSalaryFullyPaid: empPayments.some((p) => p.paymentType === 'SALARY'),
//                 payments: empPayments,
//             };
//         });
//     },
// };

// // ─── Time Entries (added to hrService object above) ──────────────────────────
// // These are exported as separate service functions for time tracking

// export const timeEntryService = {
//     /**
//      * Create a new time entry session.
//      * Multiple sessions allowed per day.
//      * checkOutDate can be different from entryDate (cross-day).
//      * workHours and overtime auto-calculated if both times provided.
//      */
//     async createTimeEntry(data: {
//         employeeId: number;
//         entryDate: string;
//         checkOutDate?: string;
//         checkIn?: string;
//         checkOut?: string;
//         note?: string;
//     }) {
//         const employee = await prisma.employee.findUniqueOrThrow({
//             where: { id: data.employeeId },
//         });

//         let workHours: number | null = null;
//         let overtimeHours = 0;

//         if (data.checkIn && data.checkOut) {
//             const inDate = new Date(`${data.entryDate}T${data.checkIn}:00`);
//             const outDateStr = data.checkOutDate || data.entryDate;
//             const outDate = new Date(`${outDateStr}T${data.checkOut}:00`);

//             // If checkout is before checkin on same day, assume next day
//             let diffMs = outDate.getTime() - inDate.getTime();
//             if (diffMs < 0) {
//                 // Add 24 hours
//                 diffMs += 24 * 60 * 60 * 1000;
//             }

//             workHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
//             const standardHours = parseFloat(employee.workingHours.toString());
//             if (workHours > standardHours) {
//                 overtimeHours = parseFloat((workHours - standardHours).toFixed(2));
//             }
//         }

//         return prisma.timeEntry.create({
//             data: {
//                 employeeId: data.employeeId,
//                 entryDate: new Date(data.entryDate),
//                 checkOutDate: data.checkOutDate ? new Date(data.checkOutDate) : null,
//                 checkIn: data.checkIn,
//                 checkOut: data.checkOut,
//                 workHours,
//                 overtimeHours,
//                 note: data.note,
//             },
//         });
//     },

//     async updateTimeEntry(id: number, data: {
//         entryDate: string;
//         checkOutDate?: string;
//         checkIn?: string;
//         checkOut?: string;
//         note?: string;
//         employeeId: number;
//     }) {
//         const employee = await prisma.employee.findUniqueOrThrow({
//             where: { id: data.employeeId },
//         });

//         let workHours: number | null = null;
//         let overtimeHours = 0;

//         if (data.checkIn && data.checkOut) {
//             const inDate = new Date(`${data.entryDate}T${data.checkIn}:00`);
//             const outDateStr = data.checkOutDate || data.entryDate;
//             const outDate = new Date(`${outDateStr}T${data.checkOut}:00`);
//             let diffMs = outDate.getTime() - inDate.getTime();
//             if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
//             workHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
//             const standardHours = parseFloat(employee.workingHours.toString());
//             if (workHours > standardHours) {
//                 overtimeHours = parseFloat((workHours - standardHours).toFixed(2));
//             }
//         }

//         return prisma.timeEntry.update({
//             where: { id },
//             data: {
//                 entryDate: new Date(data.entryDate),
//                 checkOutDate: data.checkOutDate ? new Date(data.checkOutDate) : null,
//                 checkIn: data.checkIn,
//                 checkOut: data.checkOut,
//                 workHours,
//                 overtimeHours,
//                 note: data.note,
//             },
//         });
//     },

//     async getTimeEntriesByEmployee(employeeId: number, filters?: {
//         startDate?: string;
//         endDate?: string;
//         year?: number;
//         month?: number;
//     }) {
//         const where: Record<string, unknown> = { employeeId };

//         if (filters?.startDate || filters?.endDate) {
//             where.entryDate = {
//                 ...(filters?.startDate ? { gte: new Date(filters.startDate) } : {}),
//                 ...(filters?.endDate ? { lte: new Date(filters.endDate) } : {}),
//             };
//         } else if (filters?.year && filters?.month) {
//             where.entryDate = {
//                 gte: new Date(filters.year, filters.month - 1, 1),
//                 lte: new Date(filters.year, filters.month, 0),
//             };
//         }

//         return prisma.timeEntry.findMany({
//             where,
//             orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }],
//         });
//     },

//     async getEmployeeFullProfile(id: number) {
//         const employee = await prisma.employee.findUniqueOrThrow({ where: { id } });

//         const now = new Date();
//         const year = now.getFullYear();
//         const month = now.getMonth() + 1;

//         const [timeEntries, attendance, salaryPayments] = await Promise.all([
//             prisma.timeEntry.findMany({
//                 where: {
//                     employeeId: id,
//                     entryDate: {
//                         gte: new Date(year, month - 1, 1),
//                         lte: new Date(year, month, 0),
//                     },
//                 },
//                 orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }],
//             }),
//             prisma.attendance.findMany({
//                 where: {
//                     employeeId: id,
//                     attendanceDate: {
//                         gte: new Date(year, month - 1, 1),
//                         lte: new Date(year, month, 0),
//                     },
//                 },
//                 orderBy: { attendanceDate: 'desc' },
//             }),
//             prisma.salaryPayment.findMany({
//                 where: { employeeId: id },
//                 orderBy: { paymentDate: 'desc' },
//                 take: 24,
//             }),
//         ]);

//         const totalWorkHours = timeEntries.reduce((s, e) => s + parseFloat((e.workHours ?? 0).toString()), 0);
//         const totalOvertimeHours = timeEntries.reduce((s, e) => s + parseFloat((e.overtimeHours ?? 0).toString()), 0);
//         const overtimeRate = parseFloat(employee.overtimeRate.toString());
//         const overtimePay = parseFloat((totalOvertimeHours * overtimeRate).toFixed(2));

//         const totalSalaryPaid = salaryPayments
//             .filter((p) => p.paymentType === 'SALARY' || p.paymentType === 'PARTIAL')
//             .reduce((s, p) => s + parseFloat(p.amount.toString()), 0);
//         const totalBonusPaid = salaryPayments
//             .filter((p) => p.paymentType === 'BONUS')
//             .reduce((s, p) => s + parseFloat(p.amount.toString()), 0);

//         return {
//             employee,
//             currentMonth: { year, month },
//             timeEntries,
//             attendance,
//             salaryPayments,
//             stats: {
//                 totalWorkHours: parseFloat(totalWorkHours.toFixed(2)),
//                 totalOvertimeHours: parseFloat(totalOvertimeHours.toFixed(2)),
//                 overtimePay,
//                 totalSalaryPaid,
//                 totalBonusPaid,
//                 presentDays: attendance.filter((a) => a.status === 'PRESENT').length,
//                 absentDays: attendance.filter((a) => a.status === 'ABSENT').length,
//             },
//         };
//     },

//     async deleteTimeEntry(id: number) {
//         await prisma.timeEntry.delete({ where: { id } });
//         return { message: 'Time entry deleted' };
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

        const [payments, timeEntries] = await Promise.all([
            prisma.salaryPayment.findMany({
                where: { year, month },
                include: { employee: { select: { id: true, name: true } } },
            }),
            prisma.timeEntry.findMany({
                where: {
                    entryDate: {
                        gte: new Date(year, month - 1, 1),
                        lte: new Date(year, month, 0),
                    },
                },
            }),
        ]);

        return employees.map((emp) => {
            const empPayments = payments.filter((p) => p.employeeId === emp.id);
            const empTimeEntries = timeEntries.filter((t) => t.employeeId === emp.id);

            // Salary + Partial count toward basic salary — Bonus is separate
            const salaryPaid = empPayments
                .filter((p) => p.paymentType === 'SALARY' || p.paymentType === 'PARTIAL')
                .reduce((s, p) => s + toNumber(p.amount), 0);

            const bonusPaid = empPayments
                .filter((p) => p.paymentType === 'BONUS')
                .reduce((s, p) => s + toNumber(p.amount), 0);

            // Calculate overtime bill from time entries
            const totalOvertimeHours = empTimeEntries.reduce(
                (s, t) => s + toNumber(t.overtimeHours), 0
            );
            const overtimeRate = toNumber(emp.overtimeRate);
            const overtimeBill = parseFloat((totalOvertimeHours * overtimeRate).toFixed(2));
            const totalPayable = toNumber(emp.basicSalary) + overtimeBill;

            return {
                employee: emp,
                basicSalary: toNumber(emp.basicSalary),
                overtimeBill,
                totalPayable,
                totalOvertimeHours: parseFloat(totalOvertimeHours.toFixed(2)),
                salaryPaid,
                bonusPaid,
                remaining: Math.max(0, totalPayable - salaryPaid),
                isSalaryFullyPaid: empPayments.some((p) => p.paymentType === 'SALARY'),
                payments: empPayments,
            };
        });
    },
};

// ─── Time Entries (added to hrService object above) ──────────────────────────
// These are exported as separate service functions for time tracking

export const timeEntryService = {
    /**
     * Calculate work hours for a single session (checkin → checkout).
     * Handles cross-day (checkout date different from checkin date).
     */
    _calcSessionHours(entryDate: string, checkIn: string, checkOut: string, checkOutDate?: string): number {
        const inDate = new Date(`${entryDate}T${checkIn}:00`);
        const outDateStr = checkOutDate || entryDate;
        const outDate = new Date(`${outDateStr}T${checkOut}:00`);
        let diffMs = outDate.getTime() - inDate.getTime();
        if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // cross-day fallback
        return parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    },

    /**
     * After saving a session, recalculate overtime for ALL sessions on that day.
     *
     * Logic:
     *   1. Get all sessions for that employee on that day
     *   2. Sum all workHours
     *   3. If total > standardHours → overtime exists for that day
     *   4. Distribute overtime: 0 for earlier sessions, remainder in last completed session
     *
     * Example: standardHours = 8, sessions: 4hrs + 5hrs = 9hrs total → 1hr overtime
     *   Session 1 (4hrs): overtimeHours = 0
     *   Session 2 (5hrs): overtimeHours = 1
     */
    async _recalcDailyOvertime(employeeId: number, entryDate: string, standardHours: number) {
        const sessions = await prisma.timeEntry.findMany({
            where: {
                employeeId,
                entryDate: new Date(entryDate),
            },
            orderBy: { createdAt: 'asc' },
        });

        let accumulated = 0;
        for (const session of sessions) {
            const sessionHours = parseFloat((session.workHours ?? 0).toString());
            const prevAccumulated = accumulated;
            accumulated += sessionHours;

            let overtimeHours = 0;
            if (accumulated > standardHours) {
                // This session pushed us over the limit
                overtimeHours = parseFloat((accumulated - Math.max(prevAccumulated, standardHours)).toFixed(2));
            }

            await prisma.timeEntry.update({
                where: { id: session.id },
                data: { overtimeHours },
            });
        }
    },

    /**
     * Create a new time entry session.
     * Multiple sessions allowed per day.
     * checkOutDate can be different from entryDate (cross-day).
     * Overtime is calculated on DAILY TOTAL basis across all sessions.
     */
    async createTimeEntry(data: {
        employeeId: number;
        entryDate: string;
        checkOutDate?: string;
        checkIn?: string;
        checkOut?: string;
        note?: string;
    }) {
        const employee = await prisma.employee.findUniqueOrThrow({
            where: { id: data.employeeId },
        });

        // Calculate work hours for this session only (no overtime yet)
        let workHours: number | null = null;
        if (data.checkIn && data.checkOut) {
            workHours = this._calcSessionHours(
                data.entryDate, data.checkIn, data.checkOut, data.checkOutDate
            );
        }

        // Save session with overtimeHours = 0 initially
        const entry = await prisma.timeEntry.create({
            data: {
                employeeId: data.employeeId,
                entryDate: new Date(data.entryDate),
                checkOutDate: data.checkOutDate ? new Date(data.checkOutDate) : null,
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                workHours,
                overtimeHours: 0,
                note: data.note,
            },
        });

        // Recalculate overtime for ALL sessions on this day
        if (workHours !== null) {
            const standardHours = parseFloat(employee.workingHours.toString());
            await this._recalcDailyOvertime(data.employeeId, data.entryDate, standardHours);
        }

        // Return updated entry
        return prisma.timeEntry.findUniqueOrThrow({ where: { id: entry.id } });
    },

    async updateTimeEntry(id: number, data: {
        entryDate: string;
        checkOutDate?: string;
        checkIn?: string;
        checkOut?: string;
        note?: string;
        employeeId: number;
    }) {
        const employee = await prisma.employee.findUniqueOrThrow({
            where: { id: data.employeeId },
        });

        let workHours: number | null = null;
        if (data.checkIn && data.checkOut) {
            workHours = this._calcSessionHours(
                data.entryDate, data.checkIn, data.checkOut, data.checkOutDate
            );
        }

        await prisma.timeEntry.update({
            where: { id },
            data: {
                entryDate: new Date(data.entryDate),
                checkOutDate: data.checkOutDate ? new Date(data.checkOutDate) : null,
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                workHours,
                overtimeHours: 0,
                note: data.note,
            },
        });

        // Recalculate overtime for the whole day
        if (workHours !== null) {
            const standardHours = parseFloat(employee.workingHours.toString());
            await this._recalcDailyOvertime(data.employeeId, data.entryDate, standardHours);
        }

        return prisma.timeEntry.findUniqueOrThrow({ where: { id } });
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
                ...(filters?.startDate ? { gte: new Date(filters.startDate) } : {}),
                ...(filters?.endDate ? { lte: new Date(filters.endDate) } : {}),
            };
        } else if (filters?.year && filters?.month) {
            where.entryDate = {
                gte: new Date(filters.year, filters.month - 1, 1),
                lte: new Date(filters.year, filters.month, 0),
            };
        }

        return prisma.timeEntry.findMany({
            where,
            orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }],
        });
    },

    async getEmployeeFullProfile(id: number) {
        const employee = await prisma.employee.findUniqueOrThrow({ where: { id } });

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
                orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }],
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

        const totalWorkHours = timeEntries.reduce((s, e) => s + parseFloat((e.workHours ?? 0).toString()), 0);
        const totalOvertimeHours = timeEntries.reduce((s, e) => s + parseFloat((e.overtimeHours ?? 0).toString()), 0);
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
        // Get entry details before deleting (need employeeId and entryDate for recalc)
        const entry = await prisma.timeEntry.findUniqueOrThrow({
            where: { id },
            include: { employee: { select: { workingHours: true } } },
        });

        const entryDateStr = entry.entryDate.toISOString().split('T')[0];
        const standardHours = parseFloat(entry.employee.workingHours.toString());
        const employeeId = entry.employeeId;

        await prisma.timeEntry.delete({ where: { id } });

        // Recalculate overtime for remaining sessions on that day
        await this._recalcDailyOvertime(employeeId, entryDateStr, standardHours);

        return { message: 'Time entry deleted' };
    },
};