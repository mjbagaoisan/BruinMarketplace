"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/home";

  return (
    <>
      {!isHomePage && <Header />}
      <main>{children}</main>
    </>
  );
}
