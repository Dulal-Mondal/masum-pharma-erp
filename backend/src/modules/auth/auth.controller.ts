import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const authController = {
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { username, password } = loginSchema.parse(req.body);
            const result = await authService.login(username, password);
            sendSuccess(res, result, 'Login successful');
        } catch (err) {
            if (err instanceof Error && err.message === 'Invalid username or password') {
                sendError(res, err.message, 401);
                return;
            }
            next(err);
        }
    },

    async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await authService.getProfile(req.user!.userId);
            sendSuccess(res, user);
        } catch (err) {
            next(err);
        }
    },

    async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
            const result = await authService.changePassword(
                req.user!.userId,
                currentPassword,
                newPassword
            );
            sendSuccess(res, result, result.message);
        } catch (err) {
            if (err instanceof Error && err.message === 'Current password is incorrect') {
                sendError(res, err.message, 400);
                return;
            }
            next(err);
        }
    },
};