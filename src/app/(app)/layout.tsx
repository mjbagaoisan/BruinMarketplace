import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <AuthProvider>
      <main>{children}</main>
    </AuthProvider>
  );
}
