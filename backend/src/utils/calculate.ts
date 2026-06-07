import { Decimal } from '@prisma/client/runtime/library';

/**
 * CORE BUSINESS FORMULA:
 *
 * Sales = Closing + Purchase + Expense + CashOut - Opening - CashIn
 *
 * Logic: Cash starts at Opening. During the day:
 *   - Purchase is PAID (cash goes out for medicine stock)
 *   - Expense is PAID (cash goes out for shop expenses)
 *   - CashOut goes out (bank deposit, owner withdraw, etc.)
 *   - CashIn comes in (bank withdraw, owner investment, etc.)
 *   - Sales money comes in (but we don't track it directly)
 *   - Day ends at Closing balance
 *
 * So: Opening + Sales + CashIn = Closing + Purchase + Expense + CashOut
 * Rearranged: Sales = Closing + Purchase + Expense + CashOut - Opening - CashIn
 */
export function calculateSales(params: {
    opening: number;
    closing: number;
    purchase: number;
    expense: number;
    cashIn: number;
    cashOut: number;
}): number {
    const { opening, closing, purchase, expense, cashIn, cashOut } = params;
    const sales = closing + purchase + expense + cashOut - opening - cashIn;
    // Sales cannot be negative (data entry error)
    return Math.max(0, parseFloat(sales.toFixed(2)));
}

/**
 * Profit = Sales - Purchase - Expense
 * (Gross profit — does not account for other costs like salary, rent
 *  which are tracked as expenses)
 */
export function calculateProfit(params: {
    sales: number;
    purchase: number;
    expense: number;
}): number {
    const { sales, purchase, expense } = params;
    const profit = sales - purchase - expense;
    return parseFloat(profit.toFixed(2));
}

/** Convert Prisma Decimal or string to a plain JS number */
export function toNumber(value: Decimal | string | number | null | undefined): number {
    if (value === null || value === undefined) return 0;
    return parseFloat(value.toString());
}