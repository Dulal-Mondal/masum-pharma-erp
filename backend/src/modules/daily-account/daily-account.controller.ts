import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { dailyAccountService } from './daily-account.service';
import { sendSuccess } from '../../utils/response';

const closingSchema = z.object({
    date: z.string().min(1, 'Date is required'),
    closingBalance: z.number().min(0, 'Closing balance cannot be negative'),
});

export const dailyAccountController = {
    async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Default to today
            const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
            const data = await dailyAccountService.getDashboardData(date);
            sendSuccess(res, data);
        } catch (err) {
            next(err);
        }
    },

    async getOpeningBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
            const openingBalance = await dailyAccountService.getOpeningBalance(date);
            sendSuccess(res, { date, openingBalance });
        } catch (err) {
            next(err);
        }
    },

    async performClosing(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { date, closingBalance } = closingSchema.parse(req.body);
            const record = await dailyAccountService.performDailyClosing(date, closingBalance);
            sendSuccess(res, record, 'Daily closing completed successfully');
        } catch (err) {
            next(err);
        }
    },

    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { startDate, endDate, page, limit } = req.query;
            const result = await dailyAccountService.findAll({
                startDate: startDate as string,
                endDate: endDate as string,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 30,
            });
            sendSuccess(res, result);
        } catch (err) {
            next(err);
        }
    },

    async getMonthlySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const now = new Date();
            const year = Number(req.query.year) || now.getFullYear();
            const month = Number(req.query.month) || now.getMonth() + 1;
            const summary = await dailyAccountService.getMonthlySummary(year, month);
            sendSuccess(res, summary);
        } catch (err) {
            next(err);
        }
    },
};