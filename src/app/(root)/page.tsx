import Link from 'next/link';
import { Check, Shield, Users, Zap, Search, MessageCircle, Handshake } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f9ff] to-[#f0f7ff]">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              The <span className="text-[#2774AE]">UCLA Marketplace</span><br />
              <span className="text-[#FFD100]">By Students, For Students</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              Connect with verified UCLA students to buy, sell, and trade textbooks, furniture, electronics, and more in one secure place.
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
              <img 
                src="/bruinLogo.svg" 
                alt="UCLA Logo" 
                className="w-full h-auto max-w-lg mx-auto"
              />
            </div>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#FFD100] rounded-full opacity-20 -z-0"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Simple steps to buy and sell within the UCLA community</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Search className="w-8 h-8 text-[#2774AE]" />,
                title: 'Find What You Need',
                description: 'Browse through thousands of listings from fellow students'
              },
              {
                icon: <MessageCircle className="w-8 h-8 text-[#2774AE]" />,
                title: 'Message Securely',
                description: 'Chat directly with buyers or sellers in our secure platform'
              },
              {
                icon: <Handshake className="w-8 h-8 text-[#2774AE]" />,
                title: 'Meet & Complete',
                description: 'Arrange to meet on campus and complete your transaction'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[#00698f]">{feature.title}</h3>
                <p className="text-[#00698f]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to get started?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/login"
              className="bg-[#2774AE] hover:bg-[#1a5a8a] text-white font-medium py-3 px-8 rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5 transform"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
