"use client";

import { createContext, useContext, useEffect, useState } from 'react';

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${apiBase}/api/auth/me`, { // include auth_token cookie
          credentials: "include",
        });

        if (!res.ok) {
          if (isMounted) {
            setUser(null);
          }
          return;
        }

        const data = await res.json();

        if (data?.user && isMounted) {
          setUser({
            userId: data.user.id ?? data.user.userId,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
          });
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [apiBase]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
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
