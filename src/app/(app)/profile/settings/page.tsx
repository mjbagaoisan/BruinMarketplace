"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Header from "@/components/Header";
import {useSession} from "next-auth/react";
import { Button } from "@/components/ui/button";


function profileSettingsPage() {
    const { data: session } = useSession();

    const [major, setMajor] = useState<string | null>(null); 
    const [hideMajor, setHideMajor] = useState<boolean>(false);
    const [classYear, setClassYear] = useState<number | null>(null);
    const [hideClassYear, setHideClassYear] = useState<boolean>(false);
    const [save, setSave] = useState<boolean>(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (session?.user?.userId) {
        fetchProfile();
      }
    }, [session]);

    // load user's profile info
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me?userId=${session.user.userId}`);
        const data = await response.json();
        if (!response.ok) return console.log("Failed to fetch profile");

        setMajor(data.major || "");
        setHideMajor(data.hide_major);
        setClassYear(data.class_year);
        setHideClassYear(data.hide_class_year);
    }
      catch (error) {
        console.error("Error loading profile:", error);
    }
      finally {
        setLoading(false);
      }
  };
  
  
    // update user's profile info
    const handleSave = async () => {
      if (!session?.user?.userId) return;

      setSave(true);
      setSaveMsg(null);
      try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me?userId=${session.user.userId}`, {
              method: "PATCH",
              credentials: "include",
              headers: { "Content-Type": "application/json" }, 
              body: JSON.stringify({
                  major: major,
                  hide_major: hideMajor,
                  class_year: classYear,
                  hide_class_year: hideClassYear
              }),
          });
          
          const data = await response.json();

          if (!response.ok) {
            setSaveMsg("Failed to save changes");
            setSave(false);
            return;
        }

        setSaveMsg("changes saved!");
      } catch (error) {
          console.error("Error saving changes:", error);
          setSaveMsg("Error saving changes");
      } 
      
      setSave(false);
    };


    if (loading) {
      return (
        <>
          <Header />
          <div className="flex justify-center items-center min-h-screen">
            <p className="text-gray-500 -mt-50">Loading Profile Information...</p>
          </div>
        </>
      );
    }

    return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-8 max-w-3xl">

          <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

          <div className="flex flex-col gap-6 bg-white p-6 rounded-lg shadow-sm">

            {/* user's name */}
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                className="border p-2 rounded w-full mt-1 bg-gray-100"
                value={session?.user?.name || ""}
                disabled
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
    </>
  );
}

export default profileSettingsPage;