import { buttonVariants } from "@/components/button";
import AuthButton from "@/components/AuthButton";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";   // ✅ NEW

export const metadata: Metadata = {
  title: "Login | BruinMarketplace",
  description: "Login to your account",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  // If backend sent ?error=account_suspended, go straight to /suspended
  if (params?.error === "account_suspended") {
    redirect("/suspended");
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="fixed top-4 left-4 md:left-8 md:top-8">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "flex items-center"
          )}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>
      <div className="w-full max-w-[400px] flex flex-col gap-8 p-8 bg-card rounded-lg shadow-lg">
        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome!
          </h1>
          <p className="text-base text-muted-foreground">
            Login/Create your account
          </p>
        </div>
        <div className="w-full">
          <AuthButton />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
