import { prisma } from '../../config/database';

export const companyService = {
    async findAll() {
        return prisma.company.findMany({
            where: { isActive: true },
            orderBy: { companyName: 'asc' },
        });
    },

    async create(companyName: string) {
        return prisma.company.create({ data: { companyName } });
    },

    async update(id: number, companyName: string) {
        return prisma.company.update({ where: { id }, data: { companyName } });
    },

    async delete(id: number) {
        // Soft delete to preserve purchase history
        await prisma.company.update({ where: { id }, data: { isActive: false } });
        return { message: 'Company deactivated successfully' };
    },
};