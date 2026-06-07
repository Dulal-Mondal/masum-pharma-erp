import { prisma } from '../../config/database';

interface CreateExpenseDto {
    expenseDate: string;
    categoryId: number;
    amount: number;
    note?: string;
}

export const expenseService = {
    async create(data: CreateExpenseDto) {
        return prisma.expense.create({
            data: {
                expenseDate: new Date(data.expenseDate),
                categoryId: data.categoryId,
                amount: data.amount,
                note: data.note,
            },
            include: {
                category: { select: { id: true, categoryName: true } },
            },
        });
    },

    async findAll(filters?: {
        startDate?: string;
        endDate?: string;
        categoryId?: number;
        page?: number;
        limit?: number;
    }) {
        const { startDate, endDate, categoryId, page = 1, limit = 20 } = filters ?? {};
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};

        if (startDate || endDate) {
            where.expenseDate = {
                ...(startDate ? { gte: new Date(startDate) } : {}),
                ...(endDate ? { lte: new Date(endDate) } : {}),
            };
        }

        if (categoryId) where.categoryId = categoryId;

        const [total, expenses] = await Promise.all([
            prisma.expense.count({ where }),
            prisma.expense.findMany({
                where,
                include: { category: { select: { id: true, categoryName: true } } },
                orderBy: { expenseDate: 'desc' },
                skip,
                take: limit,
            }),
        ]);

        return { total, page, limit, expenses };
    },

    async update(id: number, data: CreateExpenseDto) {
        return prisma.expense.update({
            where: { id },
            data: {
                expenseDate: new Date(data.expenseDate),
                categoryId: data.categoryId,
                amount: data.amount,
                note: data.note,
            },
            include: { category: true },
        });
    },

    async delete(id: number) {
        await prisma.expense.delete({ where: { id } });
        return { message: 'Expense deleted successfully' };
    },

    async getTotalByDate(date: string) {
        const result = await prisma.expense.aggregate({
            where: { expenseDate: new Date(date) },
            _sum: { amount: true },
        });
        return result._sum.amount ?? 0;
    },

    // Category management
    async getCategories() {
        return prisma.expenseCategory.findMany({
            where: { isActive: true },
            orderBy: { categoryName: 'asc' },
        });
    },

    async createCategory(categoryName: string) {
        return prisma.expenseCategory.create({ data: { categoryName } });
    },

    async deleteCategory(id: number) {
        await prisma.expenseCategory.update({ where: { id }, data: { isActive: false } });
        return { message: 'Category deactivated' };
    },
};