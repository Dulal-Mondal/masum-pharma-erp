import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            name: 'Administrator',
            username: 'admin',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    // Pharma companies
    const companies = [
        'Square Pharmaceuticals',
        'Incepta Pharmaceuticals',
        'Beximco Pharmaceuticals',
        'Renata Limited',
        'ACI Limited',
        'Opsonin Pharma',
        'Eskayef Bangladesh',
        'General Pharmaceuticals',
    ];

    for (const companyName of companies) {
        await prisma.company.upsert({
            where: { companyName },
            update: {},
            create: { companyName },
        });
    }

    // Expense categories
    const categories = [
        'Shop Rent',
        'Electric Bill',
        'Internet Bill',
        'Staff Salary',
        'Transport',
        'Cleaning',
        'Tea & Snacks',
        'Others',
    ];

    for (const categoryName of categories) {
        await prisma.expenseCategory.upsert({
            where: { categoryName },
            update: {},
            create: { categoryName },
        });
    }

    // Transaction types
    const transactionTypes = [
        { transactionName: 'Bank Withdraw', transactionDirection: 'IN' as const },
        { transactionName: 'Bank Deposit', transactionDirection: 'OUT' as const },
        { transactionName: 'Loan Received', transactionDirection: 'IN' as const },
        { transactionName: 'Loan Given', transactionDirection: 'OUT' as const },
        { transactionName: 'Owner Investment', transactionDirection: 'IN' as const },
        { transactionName: 'Owner Withdraw', transactionDirection: 'OUT' as const },
        { transactionName: 'Other Income', transactionDirection: 'IN' as const },
        { transactionName: 'Other Expense', transactionDirection: 'OUT' as const },
    ];

    for (const type of transactionTypes) {
        await prisma.transactionType.upsert({
            where: { transactionName: type.transactionName },
            update: {},
            create: type,
        });
    }

    console.log('✅ Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });