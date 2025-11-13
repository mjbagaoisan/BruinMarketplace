"use client";

import React from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

const LogoutButton = React.memo(({ className, children }: LogoutButtonProps) => {
  const router = useRouter();

  const handleLogout = React.useCallback(async () => {
    try {
      await signOut({ 
        redirect: false
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
