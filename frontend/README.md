This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



# Pharmacy Management System

A full-stack pharmacy daily accounting system built with Next.js, Express, PostgreSQL, and Prisma.

## Features

- **Dashboard** — Live daily stats: opening, purchase, expense, cash in/out, sales, profit, current cash
- **Purchase Management** — Invoice creation with multiple line items, company-wise tracking
- **Expense Management** — Category-based expense tracking
- **Cash Transactions** — Bank, loan, owner investment tracking (IN/OUT)
- **Daily Closing** — Auto-calculate sales & profit using formula
- **Reports** — All reports with PDF Print support
- **Settings** — Manage companies, expense categories, transaction types

## Sales Formula

```
Sales = Closing + Purchase + Expense + CashOut − Opening − CashIn
Profit = Sales − Purchase − Expense
```

---

## Project Structure

```
pharmacy-management/
├── backend/          → Node.js + Express + Prisma
└── frontend/         → Next.js + TypeScript + TailwindCSS
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

---

### 1. Database Setup

```sql
-- In PostgreSQL, create the database:
CREATE DATABASE pharmacy_db;
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy env file and configure
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/pharmacy_db"
JWT_SECRET="your-very-secret-key-change-this"
```

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed initial data (companies, categories, admin user)
npm run db:seed

# Start development server
npm run dev
```

Backend runs on: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy env file
cp .env.local.example .env.local

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

## Default Login

| Username | Password |
|----------|----------|
| admin    | admin123 |

> ⚠️ Change the password after first login via Settings

---

## Print / PDF

Every report and the Daily Closing Statement has a **Print / Save PDF** button.

When you click it:
1. Browser print dialog opens
2. Select **"Save as PDF"** as the destination
3. Print layout is clean A4 — sidebar and header are hidden
4. Tables have proper borders, zebra striping, and totals

---

## API Endpoints

```
POST   /api/v1/auth/login
GET    /api/v1/auth/profile

GET    /api/v1/companies
POST   /api/v1/companies

GET    /api/v1/purchases
POST   /api/v1/purchases
PUT    /api/v1/purchases/:id
DELETE /api/v1/purchases/:id

GET    /api/v1/expenses
POST   /api/v1/expenses
GET    /api/v1/expenses/categories/list

GET    /api/v1/cash-transactions
POST   /api/v1/cash-transactions
GET    /api/v1/cash-transactions/types/list

GET    /api/v1/daily-accounts/dashboard
POST   /api/v1/daily-accounts/closing
GET    /api/v1/daily-accounts/monthly-summary

GET    /api/v1/reports/daily
GET    /api/v1/reports/purchase
GET    /api/v1/reports/purchase/company-wise
GET    /api/v1/reports/expense
GET    /api/v1/reports/cash-transactions
```

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Next.js 14, TypeScript, TailwindCSS |
| Backend   | Node.js, Express.js, TypeScript   |
| Database  | PostgreSQL                        |
| ORM       | Prisma                            |
| Auth      | JWT                               |
| Forms     | React Hook Form + Zod validation  |
| State     | TanStack React Query              |