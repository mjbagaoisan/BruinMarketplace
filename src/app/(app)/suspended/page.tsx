// src/app/suspended/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Suspended | BruinMarketplace",
  description: "Your account has been suspended",
};

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Account Suspended</h1>
        <p className="text-sm text-gray-700">
          Your account has been suspended for violating our marketplace
          policies.
        </p>
        <p className="text-sm text-gray-700">
          If you believe this is a mistake, please contact us at{" "}
          <a
            href="mailto:bruinmarketplace@gmail.com"
            className="text-blue-600 underline"
          >
            bruinmarketplace@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
