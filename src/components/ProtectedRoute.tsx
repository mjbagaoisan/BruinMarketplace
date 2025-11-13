"use client";

import { useSession } from 'next-auth/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, status } = useSession();

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-lg text-gray-600">Checking authentication...</div>
      </div>
    );
  }

  
  if (!session) {
    return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="text-lg text-gray-600">
        <p>You are not authenticated. Please <a href="/login" className="text-blue-600">Login</a> to continue.</p>  
      </div>
    </div>
    );
  }

  return <>{children}</>;
}
