// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
    id: number;
    name: string;
    username: string;
    role: 'ADMIN' | 'STAFF';
}

export interface AuthState {
    user: User | null;
    token: string | null;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T> {
    total: number;
    page: number;
    limit: number;
    items: T[];
}

// ─── Company ──────────────────────────────────────────────────────────────────

export interface Company {
    id: number;
    companyName: string;
    isActive: boolean;
}

// ─── Purchase ─────────────────────────────────────────────────────────────────

export interface PurchaseItem {
    id: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

export interface Purchase {
    id: number;
    purchaseDate: string;
    invoiceNo: string | null;
    companyId: number;
    company: Pick<Company, 'id' | 'companyName'>;
    totalAmount: number;
    note: string | null;
    createdAt: string;
    items: PurchaseItem[];
}

export interface CreatePurchaseInput {
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

// ─── Expense ──────────────────────────────────────────────────────────────────

export interface ExpenseCategory {
    id: number;
    categoryName: string;
}

export interface Expense {
    id: number;
    expenseDate: string;
    categoryId: number;
    category: Pick<ExpenseCategory, 'id' | 'categoryName'>;
    amount: number;
    note: string | null;
    createdAt: string;
}

export interface CreateExpenseInput {
    expenseDate: string;
    categoryId: number;
    amount: number;
    note?: string;
}

// ─── Cash Transaction ─────────────────────────────────────────────────────────

export interface TransactionType {
    id: number;
    transactionName: string;
    transactionDirection: 'IN' | 'OUT';
}

export interface CashTransaction {
    id: number;
    transactionDate: string;
    transactionTypeId: number;
    transactionType: TransactionType;
    amount: number;
    note: string | null;
    createdAt: string;
}

export interface CreateCashTransactionInput {
    transactionDate: string;
    transactionTypeId: number;
    amount: number;
    note?: string;
}

// ─── Daily Account ────────────────────────────────────────────────────────────

export interface DailyAccount {
    id: number;
    accountDate: string;
    openingBalance: number;
    purchaseAmount: number;
    expenseAmount: number;
    cashInAmount: number;
    cashOutAmount: number;
    closingBalance: number;
    salesAmount: number;
    profitAmount: number;
    createdAt: string;
}

export interface DashboardData {
    date: string;
    isClosed: boolean;
    openingBalance: number;
    purchaseAmount: number;
    expenseAmount: number;
    cashInAmount: number;
    cashOutAmount: number;
    closingBalance: number | null;
    salesAmount: number | null;
    profitAmount: number | null;
    currentCash: number;
}

export interface MonthlySummary {
    year: number;
    month: number;
    totalPurchase: number;
    totalExpense: number;
    totalCashIn: number;
    totalCashOut: number;
    totalSales: number;
    totalProfit: number;
}