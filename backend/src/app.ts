// import 'dotenv/config';
// import express from 'express';
// import cors from 'cors';

// import authRoutes from './modules/auth/auth.routes';
// import companyRoutes from './modules/company/company.routes';
// import purchaseRoutes from './modules/purchase/purchase.routes';
// import expenseRoutes from './modules/expense/expense.routes';
// import cashTransactionRoutes from './modules/cash-transaction/cash-transaction.routes';
// import dailyAccountRoutes from './modules/daily-account/daily-account.routes';
// import reportRoutes from './modules/report/report.routes';

// import { errorHandler } from './middleware/error.middleware';
// // import bcrypt from 'bcryptjs';

// const app = express();
// const PORT = process.env.PORT || 5000;

// // ─── Middleware ───────────────────────────────────────────────────────────────
// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ─── Health check ─────────────────────────────────────────────────────────────
// app.get('/health', (_req, res) => {
//     res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// // Temporary route to generate hash — remove after use
// // app.get('/generate-hash', async (_req, res) => {
// //     const hash = await bcrypt.hash('admin123', 10);
// //     res.json({ hash });
// // });

// // ─── Routes ───────────────────────────────────────────────────────────────────
// const API = '/api/v1';

// app.use(`${API}/auth`, authRoutes);
// app.use(`${API}/companies`, companyRoutes);
// app.use(`${API}/purchases`, purchaseRoutes);
// app.use(`${API}/expenses`, expenseRoutes);
// app.use(`${API}/cash-transactions`, cashTransactionRoutes);
// app.use(`${API}/daily-accounts`, dailyAccountRoutes);
// app.use(`${API}/reports`, reportRoutes);

// // ─── 404 handler ──────────────────────────────────────────────────────────────
// app.use((_req, res) => {
//     res.status(404).json({ success: false, message: 'Route not found' });
// });

// // ─── Global error handler ────────────────────────────────────────────────────
// app.use(errorHandler);

// // ─── Start server ─────────────────────────────────────────────────────────────
// app.listen(PORT, () => {
//     console.log(`
//   ╔══════════════════════════════════════╗
//   ║   Pharmacy API Server Running        ║
//   ║   http://localhost:${PORT}             ║
//   ╚══════════════════════════════════════╝
//   `);
// });

// export default app;


import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './modules/auth/auth.routes';
import companyRoutes from './modules/company/company.routes';
import purchaseRoutes from './modules/purchase/purchase.routes';
import expenseRoutes from './modules/expense/expense.routes';
import cashTransactionRoutes from './modules/cash-transaction/cash-transaction.routes';
import dailyAccountRoutes from './modules/daily-account/daily-account.routes';
import reportRoutes from './modules/report/report.routes';
import hrRoutes from './modules/hr/hr.routes';

import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/companies`, companyRoutes);
app.use(`${API}/purchases`, purchaseRoutes);
app.use(`${API}/expenses`, expenseRoutes);
app.use(`${API}/cash-transactions`, cashTransactionRoutes);
app.use(`${API}/daily-accounts`, dailyAccountRoutes);
app.use(`${API}/reports`, reportRoutes);
app.use(`${API}/hr`, hrRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global error handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════╗
  ║   Pharmacy API Server Running        ║
  ║   http://localhost:${PORT}             ║
  ╚══════════════════════════════════════╝
  `);
});

export default app;