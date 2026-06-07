import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    label: string;
    value: string;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    colorClass?: string;
}

export default function StatCard({
    label,
    value,
    icon: Icon,
    colorClass = 'bg-blue-50 text-blue-600',
}: StatCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={cn('rounded-lg p-2', colorClass)}>
                    <Icon size={18} />
                </div>
            </div>
        </div>
    );
}