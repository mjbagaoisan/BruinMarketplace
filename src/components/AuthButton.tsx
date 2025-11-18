"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthButton() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to home if already signed in
  useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user, router]);

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="w-full">
        <button
          onClick={() => {
            const apiBase = process.env.NEXT_PUBLIC_API_URL;
            window.location.href = `${apiBase}/api/auth/google`; // redirect to Google OAuth instead of signIn('google') from NextAuth
          }}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Image
            src="/google.svg"
            alt="Google logo"
            width={18}
            height={18}
          />
          <span>Sign in with Google</span>
        </button>
      </div>
    );
  }

  // Show redirecting message while redirecting
  return (
    <div className="text-center text-sm text-gray-600">
      <p>Redirecting...</p>
    </div>
  );
}
