"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

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
  refreshUser: () => Promise<void>;
  clearUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  const isMountedRef = useRef(true);

  // Centralized helper that resolves the current session and stores it in React state.
  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${apiBase}/api/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (isMountedRef.current) {
          setUser(null);
        }
        return;
      }

      const data = await res.json();

      if (data?.user && isMountedRef.current) {
        setUser({
          userId: data.user.id ?? data.user.userId,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
        });
      } else if (isMountedRef.current) {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      if (isMountedRef.current) {
        setUser(null);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [apiBase]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchUser();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchUser]);

  // Exposed so components (e.g., logout button) can immediately clear cached identity.
  const clearUser = useCallback(() => {
    if (!isMountedRef.current) return;
    setUser(null);
    setIsLoading(false);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    refreshUser: fetchUser,
    clearUser,
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
