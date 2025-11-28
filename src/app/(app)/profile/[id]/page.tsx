"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { User, ArrowLeft } from 'lucide-react';

type UserProfile = {
  name: string;
  major: string | null;
  hide_major: boolean;
  class_year: number | null;
  hide_class_year: boolean;
  profile_image_url: string | null;
  created_at: string;
};

export default function viewOtherProfilePage() {
  const params = useParams();
  const router = useRouter();

  const { user, isLoading: authLoading} = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const profileId = params.id as string;

  useEffect(() => {
    if (profileId) {
      fetchProfile(profileId);
    }
  }, [profileId]);

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

            {/* major */}
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
      </div>
    </>
  );
}
