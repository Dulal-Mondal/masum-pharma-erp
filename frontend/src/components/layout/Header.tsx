'use client';

import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';

export default function Header() {
    const { user, logout } = useAuth();
    const today = formatDate(new Date());

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">{today}</p>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-100 text-blue-700 rounded-full p-1.5">
                        <User size={14} />
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{user?.role?.toLowerCase()}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                    <LogOut size={15} />
                    Logout
                </button>
            </div>
        </header>
    );
}