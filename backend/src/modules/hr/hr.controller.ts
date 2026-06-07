import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { hrService } from './hr.service';
import { sendSuccess, sendError } from '../../utils/response';

const employeeSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().optional(),
    address: z.string().optional(),
    position: z.string().optional(),
    joinDate: z.string().min(1, 'Join date is required'),
    basicSalary: z.coerce.number().min(0),
});

const attendanceSchema = z.object({
    employeeId: z.number().int().positive(),
    attendanceDate: z.string().min(1),
    status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'HOLIDAY', 'LEAVE']),
    note: z.string().optional(),
});

const paymentSchema = z.object({
    employeeId: z.number().int().positive(),
    paymentDate: z.string().min(1),
    paymentType: z.enum(['SALARY', 'BONUS', 'PARTIAL']),
    amount: z.coerce.number().positive('Amount must be positive'),
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().optional(),
    note: z.string().optional(),
});

export const hrController = {
    // ─── Employees ──────────────────────────────────────────────────────────────
    async createEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = employeeSchema.parse(req.body);
            const employee = await hrService.createEmployee(data);
            sendSuccess(res, employee, 'Employee created successfully', 201);
        } catch (err) { next(err); }
    },

    async getEmployees(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const employees = await hrService.getEmployees();
            sendSuccess(res, employees);
        } catch (err) { next(err); }
    },

    async getEmployeeById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const employee = await hrService.getEmployeeById(Number(req.params.id));
            sendSuccess(res, employee);
        } catch (err) { next(err); }
    },

    async updateEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = employeeSchema.parse(req.body);
            const employee = await hrService.updateEmployee(Number(req.params.id), data);
            sendSuccess(res, employee, 'Employee updated');
        } catch (err) { next(err); }
    },

    async deactivateEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await hrService.deactivateEmployee(Number(req.params.id));
            sendSuccess(res, result, result.message);
        } catch (err) { next(err); }
    },

    // ─── Attendance ─────────────────────────────────────────────────────────────
    async markAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = attendanceSchema.parse(req.body);
            const record = await hrService.markAttendance(data);
            sendSuccess(res, record, 'Attendance marked');
        } catch (err) { next(err); }
    },

    async getAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const now = new Date();
            const year = Number(req.query.year) || now.getFullYear();
            const month = Number(req.query.month) || now.getMonth() + 1;
            const employeeId = req.query.employeeId ? Number(req.query.employeeId) : undefined;
            const records = await hrService.getAttendanceByMonth(year, month, employeeId);
            sendSuccess(res, records);
        } catch (err) { next(err); }
    },

    async getAttendanceSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const employeeId = Number(req.params.id);
            const now = new Date();
            const year = Number(req.query.year) || now.getFullYear();
            const month = Number(req.query.month) || now.getMonth() + 1;
            const summary = await hrService.getAttendanceSummary(employeeId, year, month);
            sendSuccess(res, summary);
        } catch (err) { next(err); }
    },

    // ─── Salary Payments ────────────────────────────────────────────────────────
    async makePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = paymentSchema.parse(req.body);
            const payment = await hrService.makePayment(data);
            sendSuccess(res, payment, 'Payment processed and added to expenses', 201);
        } catch (err) { next(err); }
    },

    async getAllPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { startDate, endDate, type } = req.query;
            const payments = await hrService.getAllPayments({
                startDate: startDate as string,
                endDate: endDate as string,
                type: type as string,
            });
            sendSuccess(res, payments);
        } catch (err) { next(err); }
    },

    async getPaymentsByEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const payments = await hrService.getPaymentsByEmployee(Number(req.params.id));
            sendSuccess(res, payments);
        } catch (err) { next(err); }
    },

    async getMonthlySalaryStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const now = new Date();
            const year = Number(req.query.year) || now.getFullYear();
            const month = Number(req.query.month) || now.getMonth() + 1;
            const status = await hrService.getMonthlySalaryStatus(year, month);
            sendSuccess(res, status);
        } catch (err) { next(err); }
    },
};