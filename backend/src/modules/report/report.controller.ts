import { Request, Response, NextFunction } from 'express';
import { reportService } from './report.service';
import { sendSuccess, sendError } from '../../utils/response';

export const reportController = {
    async getDailyReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                sendError(res, 'startDate and endDate are required', 400);
                return;
            }
            const data = await reportService.getDailyReport({
                startDate: startDate as string,
                endDate: endDate as string,
            });
            sendSuccess(res, data);
        } catch (err) {
            next(err);
        }
    },

    async getPurchaseReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { startDate, endDate, companyId } = req.query;
            if (!startDate || !endDate) {
                sendError(res, 'startDate and endDate are required', 400);
                return;
            }
            const data = await reportService.getPurchaseReport({
                startDate: startDate as string,
                endDate: endDate as string,
                companyId: companyId ? Number(companyId) : undefined,
            });
            sendSuccess(res, data);
        } catch (err) {
            next(err);
        }
    },

    async getCompanyWisePurchase(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                sendError(res, 'startDate and endDate are required', 400);
                return;
            }
            const data = await reportService.getCompanyWisePurchase({
                startDate: startDate as string,
                endDate: endDate as string,
            });
            sendSuccess(res, data);
        } catch (err) {
            next(err);
        }
    },

    async getExpenseReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { startDate, endDate, categoryId } = req.query;
            if (!startDate || !endDate) {
                sendError(res, 'startDate and endDate are required', 400);
                return;
            }
            const data = await reportService.getExpenseReport({
                startDate: startDate as string,
                endDate: endDate as string,
                categoryId: categoryId ? Number(categoryId) : undefined,
            });
            sendSuccess(res, data);
        } catch (err) {
            next(err);
        }
    },

    async getCashTransactionReport(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                sendError(res, 'startDate and endDate are required', 400);
                return;
            }
            const data = await reportService.getCashTransactionReport({
                startDate: startDate as string,
                endDate: endDate as string,
            });
            sendSuccess(res, data);
        } catch (err) {
            next(err);
        }
    },
};