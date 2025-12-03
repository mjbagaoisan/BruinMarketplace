"use client";

<<<<<<< HEAD
import Link from 'next/link';
import { Search, MessageCircle, Handshake } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import AuthGate from "@/components/AuthGate";

export default function Home() {
  const { user } = useAuth();

  // Extract first name for personalized greeting
=======
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Package,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
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

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

>>>>>>> main
  const fullName = user?.name ?? "Bruin";
  const [firstRaw] = fullName.split(" ");
  const firstName =
    firstRaw.charAt(0).toUpperCase() + firstRaw.slice(1).toLowerCase();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
<<<<<<< HEAD
    <AuthGate>
    <div className="min-h-screen bg-gradient-to-br from-[#f5f9ff] to-[#f0f7ff]">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome <span className="text-[#2774AE]">{firstName}!</span><br />
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iure, vero ipsam est ab ipsa commodi repudiandae aspernatur amet recusandae error quia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/listings"
                className="bg-[#2774AE] hover:bg-[#1a5a8a] text-white font-medium py-3 px-8 rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5 transform text-center"
              >
                Start Exploring
              </Link>
            </div>
          </div>      
          <div className="relative">
            <div className="relative z-10">
              <div className="grid md:grid-cols-3 md:grid-rows-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Search className="w-8 h-8 text-[#2774AE]" />,
                title: 'New Listings',
              },
              {
                icon: <MessageCircle className="w-8 h-8 text-[#2774AE]" />,
                title: 'Make a Listing',
              },
              {
                icon: <Handshake className="w-8 h-8 text-[#2774AE]" />,
                title: 'My Listings',
              },
              {
                icon: <Handshake className="w-8 h-8 text-[#2774AE]" />,
                title: 'My Listings',
              },
              {
                icon: <Handshake className="w-8 h-8 text-[#2774AE]" />,
                title: 'My Listings',
              },
              {
                icon: <Handshake className="w-8 h-8 text-[#2774AE]" />,
                title: 'My Listings',
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  {feature.icon}
=======
    <div className="relative min-h-screen bg-gradient-to-br from-[#e8f1ff] via-white to-[#fff5d6] text-gray-900">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-10 top-24 h-72 w-72 rounded-full bg-[#2774AE]/15 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#FFD100]/25 blur-[140px]" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#bee3ff]/30 blur-[120px]" />
      </div>

      <section className="flex min-h-screen flex-col items-center justify-center px-4 py-12 md:py-16">
        <div className="w-full max-w-2xl">
          <div className="flex flex-col gap-6 rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_25px_60px_rgba(23,32,90,0.08)] backdrop-blur">
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
>>>>>>> main
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
            {quickActions.map((action) => (
              action.isLink ? (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`group relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br ${action.accent} p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl`}
                >
                  <action.icon className="mb-4 h-9 w-9 text-[#1b3b73] transition group-hover:scale-110" />
                  <h3 className="text-lg font-semibold text-[#1b3b73]">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{action.description}</p>
                  <span className="mt-6 inline-flex items-center text-sm font-semibold text-[#1b3b73]">
                    Open
                    <ArrowUpRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              ) : (
                <CreateListing key={action.title}>
                  <div className={`group relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br ${action.accent} p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl cursor-pointer`}>
                    <action.icon className="mb-4 h-9 w-9 text-[#1b3b73] transition group-hover:scale-110" />
                    <h3 className="text-lg font-semibold text-[#1b3b73]">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{action.description}</p>
                    <span className="mt-6 inline-flex items-center text-sm font-semibold text-[#1b3b73]">
                      Open
                      <ArrowUpRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </CreateListing>
              )
            ))}
          </div>
        </div>
      </section>
    </div>
    </AuthGate>
  );
}
