"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardMedia, CardTitle, CardPrice } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from 'lucide-react';

import { formatDate, formatCondition, getInitials } from "@/lib/utils"
import { Listing, UserProfile } from "@/lib/types"


export default function viewOtherProfilePage() {
  const params = useParams();
  const router = useRouter();


  // profile
  const { user, isLoading: authLoading} = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // listing
  const [searchResults, setSearchResults] = useState<Listing[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);

  const profileId = params.id as string;

  useEffect(() => {
    if (profileId) {
      fetchProfile(profileId);
    }
  }, [profileId]);

  
  const fetchListings = async () => {
    try {

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/listings/user/${profileId}`;

      const response = await fetch(url, {
        credentials: 'include',
      });

      // if user is not signed in, redirect to login page
      if (response.status === 401) {
        router.push('/login');
        setListings([]);
        return;
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        setListings(data);
      } else {
        console.error('API returned non-array data:', data);
        setListings([]);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchListings();
  }, []);

  // load user's profile info
  const fetchProfile = async (id: string) => {
    setLoading(true);
    setProfile(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${id}`, {
        credentials: "include",
      });

      if (!response.ok) return console.log("Failed to fetch profile");
      const data = await response.json();

      if (!data) {
        throw new Error("Profile data is empty.");
      }

      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };


  if (loading || authLoading) {
    return (
      <>
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-gray-500 -mt-50">Loading Profile Information...</p>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 -mt-50">Profile not found.</p>
      </div>
    );
  }

  return (
    <>

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

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-8 max-w-3xl">

          <h1 className="text-3xl font-bold mb-8">Profile</h1>

          <div className="flex flex-col gap-6 bg-white p-6 rounded-lg shadow-sm">

            {/* user's profile picture */}
            <div>                
                <Avatar className="h-24 w-24 border-2 border-white shadow-sm">
                    <AvatarImage src={profile.profile_image_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-xl">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                </Avatar>
            </div>

            {/* name */}
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="border p-2 rounded w-full mt-1 bg-gray-100"> 
                {profile.name}
              </p>
            </div>

            {/* major */}
            {!profile.hide_major && profile.major && (
              <div>
                <label className="text-sm font-medium">Major</label>
                <p className="border p-2 rounded w-full mt-1 bg-gray-100"> 
                  {profile.major}
                </p>
              </div>
            )}

            {/* class year */}
            {!profile.hide_class_year && profile.class_year && (
              <div>
                <label className="text-sm font-medium">Class Year</label>
                <p className="border p-2 rounded w-full mt-1 bg-gray-100"> 
                  {profile.class_year}
                </p>
              </div>
            )}

            <p className="text-sm text-gray-500">
              Member since {new Date(profile.created_at).getFullYear()}
            </p>


          </div>
        </div>


        {/* Listings Grid */}
            <div className="container mx-auto px-8 pt-10">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-lg text-gray-600">Loading listings...</div>
                </div>
              ) : listings.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-lg text-gray-600">
                    {searchResults.length === 0 && listings.length > 0 
                      ? "No listings found matching your search." 
                      : "No listings available."}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-6">
                  {listings.map((listing) => (
                    <Link key={listing.id} href={`/listings/${listing.id}`} className="block w-full sm:w-60">
                      <Card className="w-full h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col mb-7">
                        <CardMedia>
                          {listing.media && listing.media.length > 0 ? (
                            /\.(mp4|webm|ogg)(\?|$)/i.test(listing.media[0].url) ? (
                              <video
                                src={listing.media[0].url}
                                className="w-full h-full object-cover"
                                muted
                                loop
                                playsInline
                                preload="metadata"
                              />
                            ) : (
                              <img 
                                src={listing.media[0].url} 
                                alt={listing.title} 
                                className="w-full h-full object-cover"
                              />
                            )
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <span className="text-gray-400 text-sm">No Image</span>
                            </div>
                          )}
                        </CardMedia>
                        <div className="p-4 pb-2 flex flex-col gap-2 flex-grow">
                          <CardTitle className="truncate">{listing.title}</CardTitle>
                          <CardPrice>${listing.price.toFixed(2)}</CardPrice>
                          {listing.condition && (
                            <div className="text-sm text-gray-500">Condition: {formatCondition(listing.condition)}</div>
                          )}
                          {listing.created_at &&(
                            <div className="text-sm text-gray-500">Posted: {formatDate(listing.created_at)}</div>
                          )}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>

      </div>
    </>
  );
}
