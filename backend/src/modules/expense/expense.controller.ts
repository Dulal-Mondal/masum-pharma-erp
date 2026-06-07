import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { expenseService } from './expense.service';
import { sendSuccess } from '../../utils/response';

const expenseSchema = z.object({
    expenseDate: z.string().min(1),
    categoryId: z.number().int().positive(),
    amount: z.number().positive('Amount must be positive'),
    note: z.string().optional(),
});

const categorySchema = z.object({
    categoryName: z.string().min(1, 'Category name is required'),
});

export const expenseController = {
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = expenseSchema.parse(req.body);
            const expense = await expenseService.create(data);
            sendSuccess(res, expense, 'Expense recorded successfully', 201);
        } catch (err) {
            next(err);
        }
    },

    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { startDate, endDate, categoryId, page, limit } = req.query;
            const result = await expenseService.findAll({
                startDate: startDate as string,
                endDate: endDate as string,
                categoryId: categoryId ? Number(categoryId) : undefined,
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
            const data = expenseSchema.parse(req.body);
            const expense = await expenseService.update(Number(req.params.id), data);
            sendSuccess(res, expense, 'Expense updated successfully');
        } catch (err) {
            next(err);
        }
    },

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await expenseService.delete(Number(req.params.id));
            sendSuccess(res, result, result.message);
        } catch (err) {
            next(err);
        }
    },

    async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const categories = await expenseService.getCategories();
            sendSuccess(res, categories);
        } catch (err) {
            next(err);
        }
    },

    async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { categoryName } = categorySchema.parse(req.body);
            const category = await expenseService.createCategory(categoryName);
            sendSuccess(res, category, 'Category created', 201);
        } catch (err) {
            next(err);
        }
    },

    async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await expenseService.deleteCategory(Number(req.params.id));
            sendSuccess(res, result, result.message);
        } catch (err) {
            next(err);
        }
    },
};