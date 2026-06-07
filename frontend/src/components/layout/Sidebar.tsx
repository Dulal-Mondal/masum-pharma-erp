'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingCart,
    Receipt,
    ArrowLeftRight,
    CalendarCheck,
    BarChart3,
    Settings,
    Pill,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/purchase', label: 'Purchase', icon: ShoppingCart },
    { href: '/expense', label: 'Expense', icon: Receipt },
    { href: '/cash-transactions', label: 'Cash Transactions', icon: ArrowLeftRight },
    { href: '/daily-closing', label: 'Daily Closing', icon: CalendarCheck },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
            {/* Brand */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
                <div className="bg-blue-600 text-white rounded-lg p-1.5">
                    <Pill size={18} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-900">MASUM PHARMA LTD.</p>
                    <p className="text-xs text-gray-400">Management System</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                                isActive
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            )}
                        >
                            <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">v1.0.0</p>
            </div>
        </aside>
    );
}