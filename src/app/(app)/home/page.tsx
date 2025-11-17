"use client";

import Link from 'next/link';
import { Check, Shield, Users, Zap, Search, MessageCircle, Handshake } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {

  const { user } = useAuth();

  // Get full name or fallback
  const fullName = user?.name ?? "Bruin";

  // Take only the first word
  const [firstRaw] = fullName.split(" ");

  // Make it "Normal" case: first letter upper, rest lower
  const firstName =
    firstRaw.charAt(0).toUpperCase() + firstRaw.slice(1).toLowerCase();


  return (
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
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[#00698f]">{feature.title}</h3>
              </div>
            ))}
          </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#FFD100] rounded-full opacity-20 -z-0"></div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50">

      </section>
    </div>
  );
}
