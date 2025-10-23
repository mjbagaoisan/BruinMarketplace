"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex flex-col gap-4 items-center">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Signed in as</p>
          <p className="font-semibold text-lg">{session.user?.email}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Role: <span className="font-semibold">{(session.user as any)?.role || "unknown"}</span>
          </p>
        </div>
        <button
          onClick={() => signOut()}
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-4"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm h-10 px-4"
    >
      Sign in with Google
    </button>
  );
}
