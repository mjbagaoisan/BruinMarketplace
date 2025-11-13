"use client";

import { createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  userId: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const user = session?.user ? {
    userId: (session.user as any).userId,
    email: session.user.email!,
    name: session.user.name!,
    role: (session.user as any).role || 'user'
  } : null;

  const value = {
    user,
    isLoading: status === 'loading',
    isAuthenticated: !!session
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
