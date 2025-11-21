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

      try {
        router.push("/home"); // sends user to home page if everything went well
      } catch (err) {
        console.error("Callback handling error:", err);
        setError("Something went wrong signing you in.");
        router.push("/login"); // sends user back to login page if something went wrong
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
