import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { companyService } from './company.service';
import { sendSuccess } from '../../utils/response';

const companySchema = z.object({
    companyName: z.string().min(1, 'Company name is required').max(255),
});

export const companyController = {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const companies = await companyService.findAll();
            sendSuccess(res, companies);
        } catch (err) {
            next(err);
        }
    },

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { companyName } = companySchema.parse(req.body);
            const company = await companyService.create(companyName);
            sendSuccess(res, company, 'Company created successfully', 201);
        } catch (err) {
            next(err);
        }
    },

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { companyName } = companySchema.parse(req.body);
            const company = await companyService.update(Number(req.params.id), companyName);
            sendSuccess(res, company, 'Company updated successfully');
        } catch (err) {
            next(err);
        }
    },

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await companyService.delete(Number(req.params.id));
            sendSuccess(res, result, result.message);
        } catch (err) {
            next(err);
        }
    },
};