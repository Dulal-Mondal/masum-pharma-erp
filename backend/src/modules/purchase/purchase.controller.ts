import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { purchaseService } from './purchase.service';
import { sendSuccess } from '../../utils/response';

const purchaseItemSchema = z.object({
    productName: z.string().min(1, 'Product name is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
});

const createPurchaseSchema = z.object({
    purchaseDate: z.string().min(1, 'Purchase date is required'),
    invoiceNo: z.string().optional(),
    companyId: z.number().int().positive('Company is required'),
    note: z.string().optional(),
    items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
});

export const purchaseController = {
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = createPurchaseSchema.parse(req.body);
            const purchase = await purchaseService.create(data);
            sendSuccess(res, purchase, 'Purchase created successfully', 201);
        } catch (err) {
            next(err);
        }
    },

    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { startDate, endDate, companyId, page, limit } = req.query;
            const result = await purchaseService.findAll({
                startDate: startDate as string,
                endDate: endDate as string,
                companyId: companyId ? Number(companyId) : undefined,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 20,
            });
            sendSuccess(res, result);
        } catch (err) {
            next(err);
        }
    },

    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const purchase = await purchaseService.findById(Number(req.params.id));
            sendSuccess(res, purchase);
        } catch (err) {
            next(err);
        }
    },

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = createPurchaseSchema.parse(req.body);
            const purchase = await purchaseService.update(Number(req.params.id), data);
            sendSuccess(res, purchase, 'Purchase updated successfully');
        } catch (err) {
            next(err);
        }
    },

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await purchaseService.delete(Number(req.params.id));
            sendSuccess(res, result, result.message);
        } catch (err) {
            next(err);
        }
    },
};