'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import type { User } from '@/types';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('pharmacy_token');
        const storedUser = localStorage.getItem('pharmacy_user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('pharmacy_token');
                localStorage.removeItem('pharmacy_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(
        async (username: string, password: string) => {
            const response = await authApi.login(username, password);
            const { token, user: userData } = response.data.data;

            localStorage.setItem('pharmacy_token', token);
            localStorage.setItem('pharmacy_user', JSON.stringify(userData));
            setUser(userData);
            router.push('/');
        },
        [router]
    );

    const logout = useCallback(() => {
        localStorage.removeItem('pharmacy_token');
        localStorage.removeItem('pharmacy_user');
        setUser(null);
        router.push('/login');
    }, [router]);

    return { user, isLoading, login, logout };
}