'use client';

import React, { createContext, useContext, ReactNode, Children } from 'react';
import { useRequireAuth } from '@/src/libs/useRequireAuth';
import { User } from 'firebase/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useRequireAuth();

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthentication() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthentication must be within an AuthProvider');
    }
    return context;
}