import { prisma } from '../../config/database';
import { purchaseService } from '../purchase/purchase.service';
import { expenseService } from '../expense/expense.service';
import { cashTransactionService } from '../cash-transaction/cash-transaction.service';
import { calculateSales, calculateProfit, toNumber } from '../../utils/calculate';

export const dailyAccountService = {
    /**
     * Get opening balance for a given date.
     * Opening = Yesterday's closing balance.
     * If no previous record exists, opening = 0 (first day setup).
     */
    async getOpeningBalance(date: string): Promise<number> {
        const targetDate = new Date(date);
        const yesterday = new Date(targetDate);
        yesterday.setDate(yesterday.getDate() - 1);

        const prevRecord = await prisma.dailyAccount.findFirst({
            where: { accountDate: { lte: yesterday } },
            orderBy: { accountDate: 'desc' },
        });

        return prevRecord ? toNumber(prevRecord.closingBalance) : 0;
    },

    /**
     * Get today's running totals from individual entries.
     * This is used for Dashboard "live" view before closing.
     */
    async getDailyTotals(date: string) {
        const [purchaseSummary, expenseTotal, cashTotals] = await Promise.all([
            purchaseService.getSummaryByDate(date),
            expenseService.getTotalByDate(date),
            cashTransactionService.getTotalsByDate(date),
        ]);

        return {
            purchaseAmount: toNumber(purchaseSummary.totalAmount),
            expenseAmount: toNumber(expenseTotal),
            cashInAmount: cashTotals.cashIn,
            cashOutAmount: cashTotals.cashOut,
        };
    },

    /**
     * Get today's dashboard data (live, not from daily_accounts table).
     * Used throughout the day before daily closing.
     */
    async getDashboardData(date: string) {
        const [openingBalance, dailyTotals, existingRecord] = await Promise.all([
            this.getOpeningBalance(date),
            this.getDailyTotals(date),
            prisma.dailyAccount.findUnique({ where: { accountDate: new Date(date) } }),
        ]);

        // If daily closing has been done, use those figures
        if (existingRecord) {
            return {
                date,
                isClosed: true,
                openingBalance: toNumber(existingRecord.openingBalance),
                purchaseAmount: toNumber(existingRecord.purchaseAmount),
                expenseAmount: toNumber(existingRecord.expenseAmount),
                cashInAmount: toNumber(existingRecord.cashInAmount),
                cashOutAmount: toNumber(existingRecord.cashOutAmount),
                closingBalance: toNumber(existingRecord.closingBalance),
                salesAmount: toNumber(existingRecord.salesAmount),
                profitAmount: toNumber(existingRecord.profitAmount),
                currentCash: toNumber(existingRecord.closingBalance),
            };
        }

        // Day is not closed yet — compute current cash estimate
        const { purchaseAmount, expenseAmount, cashInAmount, cashOutAmount } = dailyTotals;

        // currentCash = opening + cashIn - purchase - expense - cashOut
        // (sales not counted yet since we don't have closing)
        const currentCash =
            openingBalance + cashInAmount - purchaseAmount - expenseAmount - cashOutAmount;

        return {
            date,
            isClosed: false,
            openingBalance,
            purchaseAmount,
            expenseAmount,
            cashInAmount,
            cashOutAmount,
            closingBalance: null,
            salesAmount: null,
            profitAmount: null,
            currentCash,
        };
    },

    /**
     * Perform daily closing.
     * User provides closingBalance; system calculates sales and profit.
     *
     * Sales = Closing + Purchase + Expense + CashOut - Opening - CashIn
     * Profit = Sales - Purchase - Expense
     */
    async performDailyClosing(date: string, closingBalance: number) {
        const [openingBalance, dailyTotals] = await Promise.all([
            this.getOpeningBalance(date),
            this.getDailyTotals(date),
        ]);

        const { purchaseAmount, expenseAmount, cashInAmount, cashOutAmount } = dailyTotals;

        const salesAmount = calculateSales({
            opening: openingBalance,
            closing: closingBalance,
            purchase: purchaseAmount,
            expense: expenseAmount,
            cashIn: cashInAmount,
            cashOut: cashOutAmount,
        });

        const profitAmount = calculateProfit({
            sales: salesAmount,
            purchase: purchaseAmount,
            expense: expenseAmount,
        });

        const record = await prisma.dailyAccount.upsert({
            where: { accountDate: new Date(date) },
            create: {
                accountDate: new Date(date),
                openingBalance,
                purchaseAmount,
                expenseAmount,
                cashInAmount,
                cashOutAmount,
                closingBalance,
                salesAmount,
                profitAmount,
            },
            update: {
                openingBalance,
                purchaseAmount,
                expenseAmount,
                cashInAmount,
                cashOutAmount,
                closingBalance,
                salesAmount,
                profitAmount,
            },
        });

        return record;
    },

    async findByDate(date: string) {
        return prisma.dailyAccount.findUnique({
            where: { accountDate: new Date(date) },
        });
    },

    async findAll(filters?: { startDate?: string; endDate?: string; page?: number; limit?: number }) {
        const { startDate, endDate, page = 1, limit = 30 } = filters ?? {};
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};
        if (startDate || endDate) {
            where.accountDate = {
                ...(startDate ? { gte: new Date(startDate) } : {}),
                ...(endDate ? { lte: new Date(endDate) } : {}),
            };
        }

        const [total, accounts] = await Promise.all([
            prisma.dailyAccount.count({ where }),
            prisma.dailyAccount.findMany({
                where,
                orderBy: { accountDate: 'desc' },
                skip,
                take: limit,
            }),
        ]);

        return { total, page, limit, accounts };
    },

    async getMonthlySummary(year: number, month: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // last day of month

        const result = await prisma.dailyAccount.aggregate({
            where: {
                accountDate: { gte: startDate, lte: endDate },
            },
            _sum: {
                purchaseAmount: true,
                expenseAmount: true,
                cashInAmount: true,
                cashOutAmount: true,
                salesAmount: true,
                profitAmount: true,
            },
        });

        return {
            year,
            month,
            totalPurchase: toNumber(result._sum.purchaseAmount),
            totalExpense: toNumber(result._sum.expenseAmount),
            totalCashIn: toNumber(result._sum.cashInAmount),
            totalCashOut: toNumber(result._sum.cashOutAmount),
            totalSales: toNumber(result._sum.salesAmount),
            totalProfit: toNumber(result._sum.profitAmount),
        };
    },
};