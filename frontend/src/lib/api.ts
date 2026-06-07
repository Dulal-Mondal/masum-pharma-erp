import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('pharmacy_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('pharmacy_token');
            localStorage.removeItem('pharmacy_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// ─── API functions ────────────────────────────────────────────────────────────

export const authApi = {
    login: (username: string, password: string) =>
        api.post('/auth/login', { username, password }),
    getProfile: () => api.get('/auth/profile'),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
        api.put('/auth/change-password', data),
};

export const companyApi = {
    getAll: () => api.get('/companies'),
    create: (companyName: string) => api.post('/companies', { companyName }),
    update: (id: number, companyName: string) => api.put(`/companies/${id}`, { companyName }),
    delete: (id: number) => api.delete(`/companies/${id}`),
};

export const purchaseApi = {
    getAll: (params?: Record<string, unknown>) => api.get('/purchases', { params }),
    getById: (id: number) => api.get(`/purchases/${id}`),
    create: (data: unknown) => api.post('/purchases', data),
    update: (id: number, data: unknown) => api.put(`/purchases/${id}`, data),
    delete: (id: number) => api.delete(`/purchases/${id}`),
};

export const expenseApi = {
    getAll: (params?: Record<string, unknown>) => api.get('/expenses', { params }),
    create: (data: unknown) => api.post('/expenses', data),
    update: (id: number, data: unknown) => api.put(`/expenses/${id}`, data),
    delete: (id: number) => api.delete(`/expenses/${id}`),
    getCategories: () => api.get('/expenses/categories/list'),
    createCategory: (categoryName: string) =>
        api.post('/expenses/categories', { categoryName }),
};

export const cashTransactionApi = {
    getAll: (params?: Record<string, unknown>) => api.get('/cash-transactions', { params }),
    create: (data: unknown) => api.post('/cash-transactions', data),
    update: (id: number, data: unknown) => api.put(`/cash-transactions/${id}`, data),
    delete: (id: number) => api.delete(`/cash-transactions/${id}`),
    getTypes: () => api.get('/cash-transactions/types/list'),
};

export const dailyAccountApi = {
    getDashboard: (date?: string) =>
        api.get('/daily-accounts/dashboard', { params: { date } }),
    getOpeningBalance: (date: string) =>
        api.get('/daily-accounts/opening-balance', { params: { date } }),
    performClosing: (date: string, closingBalance: number) =>
        api.post('/daily-accounts/closing', { date, closingBalance }),
    getAll: (params?: Record<string, unknown>) => api.get('/daily-accounts', { params }),
    getMonthlySummary: (year?: number, month?: number) =>
        api.get('/daily-accounts/monthly-summary', { params: { year, month } }),
};

export const reportApi = {
    getDaily: (startDate: string, endDate: string) =>
        api.get('/reports/daily', { params: { startDate, endDate } }),
    getPurchase: (startDate: string, endDate: string, companyId?: number) =>
        api.get('/reports/purchase', { params: { startDate, endDate, companyId } }),
    getCompanyWisePurchase: (startDate: string, endDate: string) =>
        api.get('/reports/purchase/company-wise', { params: { startDate, endDate } }),
    getExpense: (startDate: string, endDate: string, categoryId?: number) =>
        api.get('/reports/expense', { params: { startDate, endDate, categoryId } }),
    getCashTransactions: (startDate: string, endDate: string) =>
        api.get('/reports/cash-transactions', { params: { startDate, endDate } }),
};