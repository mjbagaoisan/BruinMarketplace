"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Package,
  Search,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import AuthGate from "@/components/AuthGate";
import CreateListing from '@/components/CreateListing';

const quickActions = [
  {
    title: "Browse Listings",
    description: "Browse fresh listings and popular finds.",
    href: "/listings",
    accent: "from-[#D2E6FF] to-white",
    icon: Search,
    isLink: true,
  },
  {
    title: "Sell an Item",
    description: "Upload photos, set a price, choose your location, and publish in seconds.",
    href: "",
    accent: "from-[#FFF1CC] to-white",
    icon: Sparkles,
    isLink: false,
  },
  {
    title: "My Listings",
    description: "Manage your active and sold items.",
    href: "/listings/me",
    accent: "from-[#E6F7F3] to-white",
    icon: Package,
    isLink: true,
  },
];

// admin-only action kept separate for explicit role-based visibility
const adminDashboardAction = {
  title: "Admin Dashboard",
  description: "Review reports and manage users.",
  href: "/admin/reports",
  accent: "from-[#FFE4E4] to-white",
  icon: Shield,
};

const actionCardBaseStyles = 
  "group relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br p-6 shadow-sm";

// reusable card content to reduce duplication
function ActionCardContent({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  title: string; 
  description: string; 
}) {
  return (
    <>
      <Icon className="mb-4 h-9 w-9 text-[#1b3b73]" />
      <h3 className="text-lg font-semibold text-[#1b3b73]">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      <span className="mt-6 inline-flex items-center text-sm font-semibold text-[#1b3b73]">
        Open
        <ArrowUpRight className="ml-1 h-4 w-4" />
      </span>
    </>
  );
}

export default function Home() {
  const { user } = useAuth();

  const fullName = user?.name ?? "Bruin";
  const [firstRaw] = fullName.split(" ");
  const firstName =
    firstRaw.charAt(0).toUpperCase() + firstRaw.slice(1).toLowerCase();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <AuthGate>
      <div className="relative min-h-screen bg-gradient-to-br from-[#e8f1ff] via-white to-[#fff5d6] text-gray-900">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-10 top-24 h-72 w-72 rounded-full bg-[#2774AE]/15 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#FFD100]/25 blur-[140px]" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#bee3ff]/30 blur-[120px]" />
      </div>

      <section className="flex min-h-screen flex-col items-center justify-center px-4 py-12 md:py-16">
        <div className="w-full max-w-2xl">
          <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-3 text-center">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                  <AvatarImage src="" alt={fullName} />
                  <AvatarFallback className="bg-[#2774AE] text-white">
                    {firstName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#1b3b73]">
                    {greeting}, {firstName}
                  </p>
                  <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
                    Welcome back to BruinMarketplace!
                  </h1>
                </div>
              </div>
              <p className="text-center text-base text-slate-600 md:text-lg">
                Find deals, manage your listings, and connect with Bruins.
              </p>
            </div>
            <CreateListing>
              <Button className="mx-auto w-full max-w-xs rounded-full bg-[#2774AE] px-6 text-white hover:bg-[#1a5a8a]">
                <Sparkles className="mr-2 h-4 w-4" />
                Sell an Item
              </Button>
            </CreateListing>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((action) =>
              action.isLink ? (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`${actionCardBaseStyles} ${action.accent}`}
                >
                  <ActionCardContent
                    icon={action.icon}
                    title={action.title}
                    description={action.description}
                  />
                </Link>
              ) : (
                <CreateListing key={action.title}>
                  <div className={`${actionCardBaseStyles} ${action.accent} cursor-pointer`}>
                    <ActionCardContent
                      icon={action.icon}
                      title={action.title}
                      description={action.description}
                    />
                  </div>
                </CreateListing>
              )
            )}

          </div>

          {/* visible only to admin users, centered when on its own row */}
          {user?.role === "admin" && (
            <div className="mt-6 flex justify-center">
              <Link
                href={adminDashboardAction.href}
                className={`${actionCardBaseStyles} ${adminDashboardAction.accent} w-full sm:w-1/2 xl:w-1/3`}
              >
                <ActionCardContent
                  icon={adminDashboardAction.icon}
                  title={adminDashboardAction.title}
                  description={adminDashboardAction.description}
                />
              </Link>
            </div>
          )}
        </div>
      </section>
      </div>
    </AuthGate>
  );
}
