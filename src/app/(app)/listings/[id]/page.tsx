"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, 
  Calendar, 
  CreditCard, 
  ArrowLeft, 
  Flag,
  MessageCircle,
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Media {
  id: string;
  listing_id: string;
  url: string;
  type: string;
}

interface Seller {
  id: string;
  name: string;
  profile_image_url?: string;
  is_verified: boolean;
  created_at: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  description: string;
  condition: string;
  category: string;
  status: string;
  location: string;
  preferred_payment: string;
  created_at: string;
  media?: Media[];
  user?: Seller;
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/${params.id}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Server Error Details:", errorData);
          throw new Error(errorData.error || 'Failed to fetch listing');
        }

        const data = await response.json();
        setListing(data);
      } catch (err) {
        console.error(err);
        setError('Could not load listing details.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchListing();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-200"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Listing Not Found</h1>
        <p className="text-gray-600">{error || "The listing you're looking for doesn't exist."}</p>
        <Button onClick={() => router.push('/listings')} variant="outline">
          Back to Listings
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Navigation Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-gray-600 hover:text-gray-900"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
        </div>
      </div>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Media Gallery */}
          <div className="lg:col-span-2 space-y-6">
            <div className="overflow-hidden rounded-xl border-none shadow-md bg-black/5">
              <div className="p-0">
                {listing.media && listing.media.length > 0 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {listing.media.map((item) => (
                        <CarouselItem key={item.id} className="flex items-center justify-center bg-black aspect-video">
                          <img
                            src={item.url}
                            alt={listing.title}
                            className="max-h-[500px] w-auto object-contain"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {listing.media.length > 1 && (
                      <>
                        <CarouselPrevious className="left-4" />
                        <CarouselNext className="right-4" />
                      </>
                    )}
                  </Carousel>
                ) : (
                  <div className="aspect-video bg-gray-200 flex items-center justify-center text-gray-400 flex-col gap-2">
                    <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-2xl">📷</span>
                    </div>
                    <p>No images available</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {listing.description || "No description provided."}
              </p>
            </div>

            {/* Location Map Placeholder */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                Location
              </h2>
              <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-4 border border-blue-100">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 capitalize">{listing.location}</p>
                  <p className="text-sm text-gray-500">Estimated location</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Listing Info & Seller */}
          <div className="space-y-6">
            
            {/* Main Info Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-primary">${listing.price.toFixed(2)}</span>
                  <Badge variant="secondary" className="capitalize px-3 py-1 text-sm">
                    {listing.condition.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Posted on {formatDate(listing.created_at)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <span className="capitalize">Preferred Payment: {listing.preferred_payment}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 flex items-center justify-center">
                    <span className="text-xs font-bold border border-gray-400 rounded px-0.5">C</span>
                  </div>
                  <span className="capitalize">Category: {listing.category}</span>
                </div>
              </div>
            </div>

            {/* Seller Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Seller Information</h2>
              {listing.user ? (
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                    <AvatarImage src={listing.user.profile_image_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(listing.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <a href="#" className="font-semibold text-lg hover:underline text-gray-900">
                        {listing.user.name}
                      </a>
                    </div>
                    <p className="text-sm text-gray-500">
                      Member since {new Date(listing.user.created_at).getFullYear()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 mb-6">Seller information unavailable</div>
              )}

              <Button className="w-full gap-2 text-base py-6" size="lg">
                <MessageCircle className="h-5 w-5" />
                I'm interested
              </Button>

              <div className="mt-4 flex justify-center">
                <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2" size="sm">
                  <Flag className="h-4 w-4" />
                  Report Listing
                </Button>
              </div>
            </div>



          </div>
        </div>
      </main>
    </div>
  );
}
