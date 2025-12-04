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
  const { clearUser } = useAuth();

  const handleLogout = React.useCallback(async () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;

    try {
      if (!apiBase) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured");
      }

      // Ask the API to clear the httpOnly auth_token cookie on the server.
      await fetch(`${apiBase}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear client-side state + return user to the landing page.
      clearUser();
      router.replace('/');
      router.refresh();
    }
  }, [router, clearUser]);

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
