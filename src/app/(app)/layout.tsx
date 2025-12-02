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
  const isListingDetail = pathname.startsWith("/listings/") && pathname !== "/listings" && pathname !== "/listings/me";

  return (
    <>
      {!isHomePage && !isListingDetail && <Header />}
      <main>{children}</main>
    </>
  );
}
