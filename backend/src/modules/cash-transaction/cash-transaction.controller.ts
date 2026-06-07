import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { cashTransactionService } from './cash-transaction.service';
import { sendSuccess } from '../../utils/response';

const transactionSchema = z.object({
    transactionDate: z.string().min(1),
    transactionTypeId: z.number().int().positive(),
    amount: z.number().positive('Amount must be positive'),
    note: z.string().optional(),
});

const typeSchema = z.object({
    transactionName: z.string().min(1),
    transactionDirection: z.enum(['IN', 'OUT']),
});

export const cashTransactionController = {
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = transactionSchema.parse(req.body);
            const transaction = await cashTransactionService.create(data);
            sendSuccess(res, transaction, 'Transaction recorded successfully', 201);
        } catch (err) {
            next(err);
        }
    },

    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { startDate, endDate, typeId, direction, page, limit } = req.query;
            const result = await cashTransactionService.findAll({
                startDate: startDate as string,
                endDate: endDate as string,
                typeId: typeId ? Number(typeId) : undefined,
                direction: direction as string,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 20,
            });
            sendSuccess(res, result);
        } catch (err) {
            next(err);
        }
    },

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = transactionSchema.parse(req.body);
            const transaction = await cashTransactionService.update(Number(req.params.id), data);
            sendSuccess(res, transaction, 'Transaction updated successfully');
        } catch (err) {
            next(err);
        }
    },

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await cashTransactionService.delete(Number(req.params.id));
            sendSuccess(res, result, result.message);
        } catch (err) {
            next(err);
        }
    },

    async getTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const types = await cashTransactionService.getTypes();
            sendSuccess(res, types);
        } catch (err) {
            next(err);
        }
    },

    async createType(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { transactionName, transactionDirection } = typeSchema.parse(req.body);
            const type = await cashTransactionService.createType(transactionName, transactionDirection);
            sendSuccess(res, type, 'Transaction type created', 201);
        } catch (err) {
            next(err);
        }
    },
};