import { prisma } from '../../config/database';

interface CreatePurchaseDto {
    purchaseDate: string;
    invoiceNo?: string;
    companyId: number;
    note?: string;
    items: Array<{
        productName: string;
        quantity: number;
        unitPrice: number;
    }>;
}

export const purchaseService = {
    async create(data: CreatePurchaseDto) {
        // Calculate item amounts and total in service layer (not trusted from client)
        const itemsWithAmounts = data.items.map((item) => ({
            ...item,
            amount: parseFloat((item.quantity * item.unitPrice).toFixed(2)),
        }));

        const totalAmount = itemsWithAmounts.reduce((sum, item) => sum + item.amount, 0);

        const purchase = await prisma.purchaseMaster.create({
            data: {
                purchaseDate: new Date(data.purchaseDate),
                invoiceNo: data.invoiceNo,
                companyId: data.companyId,
                totalAmount,
                note: data.note,
                items: {
                    create: itemsWithAmounts,
                },
            },
            include: {
                company: { select: { id: true, companyName: true } },
                items: true,
            },
        });

        return purchase;
    },

    async findAll(filters?: {
        startDate?: string;
        endDate?: string;
        companyId?: number;
        page?: number;
        limit?: number;
    }) {
        const { startDate, endDate, companyId, page = 1, limit = 20 } = filters ?? {};
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};

        if (startDate || endDate) {
            where.purchaseDate = {
                ...(startDate ? { gte: new Date(startDate) } : {}),
                ...(endDate ? { lte: new Date(endDate) } : {}),
            };
        }

        if (companyId) {
            where.companyId = companyId;
        }

        const [total, purchases] = await Promise.all([
            prisma.purchaseMaster.count({ where }),
            prisma.purchaseMaster.findMany({
                where,
                include: {
                    company: { select: { id: true, companyName: true } },
                    items: true,
                },
                orderBy: { purchaseDate: 'desc' },
                skip,
                take: limit,
            }),
        ]);

        return { total, page, limit, purchases };
    },

    async findById(id: number) {
        const purchase = await prisma.purchaseMaster.findUniqueOrThrow({
            where: { id },
            include: {
                company: true,
                items: true,
            },
        });
        return purchase;
    },

    async update(id: number, data: CreatePurchaseDto) {
        const itemsWithAmounts = data.items.map((item) => ({
            ...item,
            amount: parseFloat((item.quantity * item.unitPrice).toFixed(2)),
        }));

        const totalAmount = itemsWithAmounts.reduce((sum, item) => sum + item.amount, 0);

        // Delete old items and recreate (simplest approach for invoice editing)
        const purchase = await prisma.$transaction(async (tx) => {
            await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });

            return tx.purchaseMaster.update({
                where: { id },
                data: {
                    purchaseDate: new Date(data.purchaseDate),
                    invoiceNo: data.invoiceNo,
                    companyId: data.companyId,
                    totalAmount,
                    note: data.note,
                    items: {
                        create: itemsWithAmounts,
                    },
                },
                include: {
                    company: { select: { id: true, companyName: true } },
                    items: true,
                },
            });
        });

        return purchase;
    },

    async delete(id: number) {
        // Cascade delete will remove items too (configured in schema)
        await prisma.purchaseMaster.delete({ where: { id } });
        return { message: 'Purchase deleted successfully' };
    },

    async getSummaryByDate(date: string) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const result = await prisma.purchaseMaster.aggregate({
            where: { purchaseDate: { gte: start, lte: end } },
            _sum: { totalAmount: true },
            _count: true,
        });

        return {
            totalAmount: result._sum.totalAmount ?? 0,
            invoiceCount: result._count,
        };
    },
};