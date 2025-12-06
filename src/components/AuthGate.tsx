"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGateProps {
  children: React.ReactNode;
}

/** Guard for pages that require authentication. */
export default function AuthGate({ children }: AuthGateProps) {
  const { user, isLoading } = useAuth();

  // Block rendering until we know whether the user has a valid session.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  /*
  AI-Assisted Code (CSS/Styling)

  Prompt: Style this unauthenticated state with a modern, centered card layout 
  using Tailwind CSS with a gradient background and UCLA brand colors.

  Additional Notes: I wrote the React logic and the Link component. AI helped 
  with the CSS like the gradient background, centering with flexbox, the rounded 
  icon container, and the button hover effects.
  */
  // Show a prompt for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-[#2774AE]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Login Required
            </h1>
            <p className="text-gray-600">
              Bruin Marketplace is only for UCLA students. Please sign in
              with your UCLA email to continue.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-block bg-[#2774AE] hover:bg-[#1a5a8a] text-white font-medium py-3 px-8 rounded-full transition-all hover:shadow-lg"
          >
            Sign In with UCLA Account
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
