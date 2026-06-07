import { prisma } from '../../config/database';
import { toNumber } from '../../utils/calculate';

export const reportService = {
    async getDailyReport(filters: { startDate: string; endDate: string }) {
        return prisma.dailyAccount.findMany({
            where: {
                accountDate: {
                    gte: new Date(filters.startDate),
                    lte: new Date(filters.endDate),
                },
            },
            orderBy: { accountDate: 'asc' },
        });
    },

    async getPurchaseReport(filters: {
        startDate: string;
        endDate: string;
        companyId?: number;
    }) {
        const where: Record<string, unknown> = {
            purchaseDate: {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate),
            },
        };

        if (filters.companyId) where.companyId = filters.companyId;

        return prisma.purchaseMaster.findMany({
            where,
            include: {
                company: { select: { id: true, companyName: true } },
                items: true,
            },
            orderBy: { purchaseDate: 'asc' },
        });
    },

    async getCompanyWisePurchase(filters: { startDate: string; endDate: string }) {
        const purchases = await prisma.purchaseMaster.groupBy({
            by: ['companyId'],
            where: {
                purchaseDate: {
                    gte: new Date(filters.startDate),
                    lte: new Date(filters.endDate),
                },
            },
            _sum: { totalAmount: true },
            _count: true,
        });

        // Fetch company names
        const companyIds = purchases.map((p) => p.companyId);
        const companies = await prisma.company.findMany({
            where: { id: { in: companyIds } },
        });

        const companyMap = new Map(companies.map((c) => [c.id, c.companyName]));

        return purchases.map((p) => ({
            companyId: p.companyId,
            companyName: companyMap.get(p.companyId) ?? 'Unknown',
            totalAmount: toNumber(p._sum.totalAmount),
            invoiceCount: p._count,
        }));
    },

    async getExpenseReport(filters: {
        startDate: string;
        endDate: string;
        categoryId?: number;
    }) {
        const where: Record<string, unknown> = {
            expenseDate: {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate),
            },
        };

        if (filters.categoryId) where.categoryId = filters.categoryId;

        return prisma.expense.findMany({
            where,
            include: { category: { select: { categoryName: true } } },
            orderBy: { expenseDate: 'asc' },
        });
    },

    async getCashTransactionReport(filters: { startDate: string; endDate: string }) {
        return prisma.cashTransaction.findMany({
            where: {
                transactionDate: {
                    gte: new Date(filters.startDate),
                    lte: new Date(filters.endDate),
                },
            },
            include: { transactionType: true },
            orderBy: { transactionDate: 'asc' },
        });
    },
};