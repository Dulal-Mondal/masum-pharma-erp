import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';

export const authService = {
    async login(username: string, password: string) {
        const user = await prisma.user.findUnique({
            where: { username, isActive: true },
        });

        if (!user) {
            throw new Error('Invalid username or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid username or password');
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role,
            },
        };
    },

    async getProfile(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, username: true, role: true, createdAt: true },
        });
        return user;
    },

    async changePassword(userId: number, currentPassword: string, newPassword: string) {
        const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) throw new Error('Current password is incorrect');

        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashed },
        });

        return { message: 'Password changed successfully' };
    },
};