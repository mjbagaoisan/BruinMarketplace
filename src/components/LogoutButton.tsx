"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

const LogoutButton = React.memo(({ className, children }: LogoutButtonProps) => {
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = React.useCallback(async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL;

      // sends Post request to /api/auth/logout to clear auth_token cookie
      await fetch(`${apiBase}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  return (
    <button
      onClick={handleLogout}
      className={className}
    >
      {children || "Logout"}
    </button>
  );
});

LogoutButton.displayName = "LogoutButton";

export default LogoutButton;
