"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { format } from 'path';
import { profile } from 'console';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

function profileSettingsPage() {
    const router = useRouter();
    const { user, isLoading: authLoading} = useAuth();

    const [profilePicUrl, setProfilePicUrl] = useState<string | undefined>(undefined);
    const [tempPicUrl, setTempPicUrl] = useState<string | undefined>(undefined);
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);    
    const [major, setMajor] = useState<string | null>(null); 
    const [hideMajor, setHideMajor] = useState<boolean>(false);
    const [classYear, setClassYear] = useState<number | null>(null);
    const [hideClassYear, setHideClassYear] = useState<boolean>(false);
    const [save, setSave] = useState<boolean>(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

    useEffect(() => {
      if (!authLoading && user) {
        fetchProfile();
      }
    }, [authLoading, user]);

    // load user's profile info
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
            credentials: "include",
          }
        );        
        if (!response.ok) return console.log("Failed to fetch profile");
        const data = await response.json();

        setMajor(data.major || "");
        setHideMajor(data.hide_major);
        setClassYear(data.class_year || null);
        setHideClassYear(data.hide_class_year);
        setProfilePicUrl(data.profile_image_url);
        setEmail(data.email || "");
        setPhoneNumber(data.phone_number || "");
    }
      catch (error) {
        console.error("Error loading profile:", error);
    }
      finally {
        setLoading(false);
      }
      
  };
  

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
      const avatarFile = e.target.files?.[0];

      if (!avatarFile) return;
      setProfilePicFile(avatarFile);
      setTempPicUrl(URL.createObjectURL(avatarFile));
    }
    // update user's profile info
    const handleSave = async () => {
      if (!user) return;

      setSave(true);
      setSaveMsg(null);
      
      try {
        const formData = new FormData();
        if (profilePicFile) {
          formData.append("avatar", profilePicFile);
        }
        formData.append("major", String(major ?? ""));
        formData.append("hide_major", (hideMajor? "true" : "false"));
        formData.append("class_year", String(classYear ?? ""));
        formData.append("hide_class_year", (hideClassYear? "true" : "false"));
        formData.append("email", String(email ?? ""));
        formData.append("phone_number", String(phoneNumber ?? ""));


        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );
          
        const data = await response.json();

      if (!response.ok) {
        setSaveMsg("Failed to save changes");
        setSave(false);
        return;
      }

      setProfilePicUrl(data.profile_image_url);
      setSaveMsg("changes saved!");
      } catch (error) {
          console.error("Error saving changes:", error);
          setSaveMsg("Error saving changes");
      } 
      setSave(false);
    }


    if (loading || authLoading) {
      return (
        <>
          <div className="flex justify-center items-center min-h-screen">
              <p className="text-gray-500 -mt-50">Loading Profile Information...</p>
            </div>
      </>
      );
    }
          

    return (
      <div className="min-h-screen bg-gray-50">

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
          <div className="flex gap-2"></div>
        </div>

        <div className="py-8">
          <div className="container mx-auto px-8 max-w-3xl">

          <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

            <div className="flex flex-col gap-6 bg-white p-6 rounded-lg shadow-sm">

              {/* user's profile picture */}
              <div>
                <label className="text-sm font-medium">Profile Picture</label>
                  <label className="relative w-24 h-24 rounded-full overflow-hidden border cursor-pointer flex items-center justify-center bg-gray-100">
                    <img
                      src={tempPicUrl || profilePicUrl || undefined}
                      className="w-full h-full object-cover"
                    />
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />
                </label>
              </div>

            
          {/* user's name */}
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              className="border p-2 rounded w-full mt-1 bg-gray-100"
              value={user?.name || ""}
              disabled
            />
          </div>

          {/* user's email */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="border p-2 rounded w-full mt-1 bg-gray-100 cursor-not-allowed"
              value={email ?? ""}
              disabled
            />
          </div>

          {/* user's phone number */}
          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <input
              type="tel"
              className="border p-2 rounded w-full mt-1"
              value={phoneNumber ?? ""}
              onChange={(e) => setPhoneNumber(e.target.value || null)}
            />
          </div>

          {/* user's major */}
          <div>
            <label className="text-sm font-medium">Major</label>
            <input
              className="border p-2 rounded w-full mt-1"
              value={major ?? ""}
              onChange={(e) => setMajor(e.target.value || null)}
            />
          </div>

          {/* make major visible */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={!hideMajor}
              onChange={() => setHideMajor(!hideMajor)}
            />
            <label className="text-sm">Make your major visible to others</label>
          </div>

          {/* user's class year */}
          <div>
            <label className="text-sm font-medium">Class Year</label>
            <input
              type="number"
              className="border p-2 rounded w-full mt-1"
              min={2026}
              value={classYear ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setClassYear(val ? Number(val) : null);
              }}
            />
          </div>

          {/* make class year visible */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={!hideClassYear}
              onChange={() => setHideClassYear(!hideClassYear)}
            />
            <label className="text-sm">Make your class year visible to others</label>
          </div>

          {/* save changes button */}
          <div className="flex flex-col justify-end">
            <Button
              onClick={handleSave}
              disabled={save}
              className="w-fit"
            >
              {save ? "Saving..." : "Save Changes"}
            </Button>
            
            {saveMsg && (
              <p className="text-red-600 text-sm mt-1">
                {saveMsg}
              </p>
            )}
          </div>
        </div>
       </div>     
      </div>
    </div>
  );
}

export default profileSettingsPage;
