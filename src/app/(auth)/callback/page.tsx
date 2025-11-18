"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function CallbackPage() {
  const { /* user, */ } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const hasError = searchParams.get("error");

      if (hasError) {
        setError("Something went wrong signing you in.");
        router.push("/login");
        return;
      }

      try {
        // The backend has already set the auth cookie at this point.
        // We can take the user straight to home; the app will hydrate auth state.
        router.push("/home");
      } catch (err) {
        console.error("Callback handling error:", err);
        setError("Something went wrong signing you in.");
        router.push("/login");
      }
    };

    run();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-600">Signing you in...</p>
    </div>
  );
}
