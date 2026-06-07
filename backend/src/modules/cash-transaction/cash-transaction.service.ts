import { prisma } from '../../config/database';

interface CreateTransactionDto {
    transactionDate: string;
    transactionTypeId: number;
    amount: number;
    note?: string;
}

export const cashTransactionService = {
    async create(data: CreateTransactionDto) {
        return prisma.cashTransaction.create({
            data: {
                transactionDate: new Date(data.transactionDate),
                transactionTypeId: data.transactionTypeId,
                amount: data.amount,
                note: data.note,
            },
            include: {
                transactionType: true,
            },
        });
    },

    async findAll(filters?: {
        startDate?: string;
        endDate?: string;
        typeId?: number;
        direction?: string;
        page?: number;
        limit?: number;
    }) {
        const { startDate, endDate, typeId, direction, page = 1, limit = 20 } = filters ?? {};
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};

        if (startDate || endDate) {
            where.transactionDate = {
                ...(startDate ? { gte: new Date(startDate) } : {}),
                ...(endDate ? { lte: new Date(endDate) } : {}),
            };
        }

        if (typeId) where.transactionTypeId = typeId;

        if (direction) {
            where.transactionType = {
                transactionDirection: direction.toUpperCase(),
            };
        }

        const [total, transactions] = await Promise.all([
            prisma.cashTransaction.count({ where }),
            prisma.cashTransaction.findMany({
                where,
                include: { transactionType: true },
                orderBy: { transactionDate: 'desc' },
                skip,
                take: limit,
            }),
        ]);

        return { total, page, limit, transactions };
    },

    async update(id: number, data: CreateTransactionDto) {
        return prisma.cashTransaction.update({
            where: { id },
            data: {
                transactionDate: new Date(data.transactionDate),
                transactionTypeId: data.transactionTypeId,
                amount: data.amount,
                note: data.note,
            },
            include: { transactionType: true },
        });
    },

    async delete(id: number) {
        await prisma.cashTransaction.delete({ where: { id } });
        return { message: 'Transaction deleted successfully' };
    },

    /**
     * Get totals for a specific date
     * Returns separate cashIn and cashOut totals based on direction
     */
    async getTotalsByDate(date: string) {
        const targetDate = new Date(date);

        const transactions = await prisma.cashTransaction.findMany({
            where: { transactionDate: targetDate },
            include: { transactionType: { select: { transactionDirection: true } } },
        });

        let cashIn = 0;
        let cashOut = 0;

        for (const t of transactions) {
            const amount = parseFloat(t.amount.toString());
            if (t.transactionType.transactionDirection === 'IN') {
                cashIn += amount;
            } else {
                cashOut += amount;
            }
        }

        return { cashIn, cashOut };
    },

    // Transaction type management
    async getTypes() {
        return prisma.transactionType.findMany({
            where: { isActive: true },
            orderBy: { transactionName: 'asc' },
        });
    },

    async createType(transactionName: string, transactionDirection: 'IN' | 'OUT') {
        return prisma.transactionType.create({
            data: { transactionName, transactionDirection },
        });
    },
};