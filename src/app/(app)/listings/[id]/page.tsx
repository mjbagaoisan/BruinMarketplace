"use client";

/*import { ReportModal } from "@/components/ReportModal";*/
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, 
  Calendar, 
  CreditCard, 
  ArrowLeft, 
  Flag,
  MessageCircle,
  ChevronRight,
  Home,
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
import AuthGate from "@/components/AuthGate";
import { useAuth } from "@/contexts/AuthContext";

import { Listing } from "@/lib/types"

const formatLocation = (location: string): string => {
  const locationMap: Record<string, string> = {
    hill: "The Hill",
    on_campus: "On Campus",
    off_campus: "Off Campus",
  };
  return locationMap[location] || location;
};

const isVideo = (mediaUrl: string, type?: string) =>
  (type && type.toLowerCase().startsWith("video")) ||
  /\.(mp4|webm|ogg)(\?|$)/i.test(mediaUrl);

type ReportReason =
  | "scam"
  | "prohibited"
  | "harassment"
  | "counterfeit"
  | "no_show";

interface ListingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "listing" | "user";
  targetId: string | number;
}

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "scam", label: "Scam / Fraud" },
  { value: "prohibited", label: "Prohibited Item" },
  { value: "harassment", label: "Harassment" },
  { value: "counterfeit", label: "Counterfeit" },
  { value: "no_show", label: "No Show" },
];

function ListingReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
}: ListingReportModalProps) {
  const [reason, setReason] = React.useState<ReportReason>("scam");
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const base = process.env.NEXT_PUBLIC_API_URL;
      if (!base) throw new Error("API URL is not configured");

      const body: any = { reason, notes: notes || undefined };

      if (targetType === "listing") {
        body.listingId = Number(targetId);
      } else {
        body.reportedUserId = targetId;
      }

      const res = await fetch(`${base}/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit report");
      }

      setSuccess(true);
      setNotes("");
    } catch (err: any) {
      setError(err.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setError(null);
    setSuccess(false);
    setNotes("");
    setReason("scam");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          Report {targetType === "listing" ? "Listing" : "User"} #{targetId}
        </h2>

        {success ? (
          <div className="space-y-4">
            <p className="text-green-600 text-sm">
              Thank you. Your report has been submitted.
            </p>
            <Button onClick={handleClose} size="sm">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Reason</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Additional details (optional)
              </label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Provide any extra information that might help..."
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit report"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showListingReport, setShowListingReport] = useState(false);
  const [showSellerReport, setShowSellerReport] = useState(false);
  const [showInterestConfirm, setShowInterestConfirm] = useState(false);
  const [interestSubmitting, setInterestSubmitting] = useState(false);
  const [interestError, setInterestError] = useState<string | null>(null);
  const [showInterestedList, setShowInterestedList] = useState(false);
  const [removalError, setRemovalError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  
  const isOwner = !!(user?.userId && listing?.user?.id && user.userId === listing.user.id);
  let interestButton = (
    <Button className="w-full gap-2 text-base py-6" size="lg" onClick={() => setShowInterestConfirm(true)}>
      <MessageCircle className="h-5 w-5" />
      I&apos;m interested
    </Button>
  );

  if (isOwner) {
    interestButton = (
      <Button
        className="w-full gap-2 text-base py-6 text-black hover:bg-sky-100 " 
        size="lg"
        variant="secondary"
        onClick={() => setShowInterestedList(true)}
      >
        Interested Users
      </Button>
    );
  }

  useEffect(() => {
    if (authLoading || !user || !params.id) return;

    const fetchListing = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${params.id}`,
          { credentials: "include" }
        );

        if (response.status === 401) {
          router.push("/login");
          return;
        }

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

    fetchListing();
  }, [params.id, authLoading, user, router]);

  const handleSendInterest = async () => {
    if (isOwner) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!listing?.id) return;

    setInterestSubmitting(true);
    setInterestError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/${listing.id}/interested`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send interest");
      }

      setShowInterestConfirm(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send interest";
      setInterestError(message);
    } finally {
      setInterestSubmitting(false);
    }
  };

  if (authLoading) { // redirect users to authentication gate
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-200"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthGate>{null}</AuthGate>;
  }

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

  const handleRemoveInterestedUser = async (userId: string) => {
    if (!listing?.id) return;
    const confirmed = window.confirm("Are you sure you want to remove this interested user?");
    if (!confirmed) return;

    setRemovalError(null);
    setDeletingUserId(userId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/${listing.id}/interested/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to remove interested user");
      }

      const data = await response.json();
      setListing((prev) => {
        if (!prev) return prev;
        const filteredDetails = prev.interested_user_details?.filter((buyer) => buyer.id !== userId) || [];
        const filteredIds =
          (data as { interested_users?: string[] }).interested_users ??
          prev.interested_users?.filter((id) => id !== userId) ??
          [];
        return {
          ...prev,
          interested_user_details: filteredDetails,
          interested_users: filteredIds,
        };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remove interested user";
      setRemovalError(message);
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <AuthGate>
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Breadcrumbs */}
      <div className="bg-white border-b px-4 py-3">
        <nav className="flex items-center text-sm text-gray-600">
          <Link href="/home" className="flex items-center gap-1 hover:text-gray-900 transition-colors">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <Link href="/listings" className="hover:text-gray-900 transition-colors">
            Browse Listings
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">
            {listing?.title || 'Loading...'}
          </span>
        </nav>
      </div>

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
                          {isVideo(item.url, item.type) ? (
                            <video
                              controls // adds a bunch of cool video control stuff (full screen, downloading, playback, etc.)
                              className="max-h-[500px] w-full object-contain bg-black"
                              src={item.url}
                              preload="metadata"
                            >
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <Image
                              src={item.url}
                              alt={listing.title}
                              className="max-h-[500px] w-auto object-contain"
                              width={800}
                              height={600}
                              style={{ objectFit: 'contain' }}
                            />
                          )}
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
                  <p className="font-medium text-gray-900">{formatLocation(listing.location)}</p>
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
                      <a href={`/profile/${listing.user.id}`} className="font-semibold text-lg hover:underline text-gray-900">
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

            
              {interestButton}

              <div className="mt-4 flex justify-center gap-2">
                <Button
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2"
                  size="sm"
                  onClick={() => setShowListingReport(true)}
                >
                  <Flag className="h-4 w-4" />
                  Report Listing
                </Button>

                {listing.user && (
                  <Button
                    variant="ghost"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2"
                    size="sm"
                    onClick={() => setShowSellerReport(true)}
                  >
                    <Flag className="h-4 w-4" />
                    Report Seller
                  </Button>
                )}
              </div>
            </div>



          </div>
        </div>
      </main>

      {showInterestConfirm && !isOwner && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Do you want to send your information to the seller?
            </h3>
            <p className="text-sm text-gray-600">
              We’ll share your contact details so the seller can reach out.
            </p>
            {interestError && (
              <p className="text-sm text-red-600">{interestError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowInterestConfirm(false)}>
                No
              </Button>
              <Button
                onClick={handleSendInterest}
                disabled={interestSubmitting}
              >
                {interestSubmitting ? "Sending..." : "Yes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showInterestedList && isOwner && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Interested Buyers</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowInterestedList(false)}>
                Close
              </Button>
            </div>
            {removalError && (
              <p className="text-sm text-red-600">{removalError}</p>
            )}
            {!listing?.interested_user_details || listing.interested_user_details.length === 0 ? (
              <p className="text-sm text-gray-600">No one has expressed interest yet.</p>
            ) : (
              <div className="space-y-3">
                {listing.interested_user_details.map((buyer) => (
                  <div key={buyer.id} className="border rounded-lg p-4 relative">
                    <button
                      type="button"
                      className="absolute right-2 top-2 text-gray-400 hover:text-red-600"
                      onClick={() => handleRemoveInterestedUser(buyer.id)}
                      disabled={deletingUserId === buyer.id}
                      aria-label="Remove interested user"
                    >
                      {deletingUserId === buyer.id ? "…" : "×"}
                    </button>
                    <p className="font-semibold text-gray-900">{buyer.name || "Unknown Name"}</p>
                    <p className="text-sm text-gray-700">Email: {buyer.email || "Not provided"}</p>
                    <p className="text-sm text-gray-700">Phone Number: {buyer.phone_number || "Not provided"}</p>
                    <p className="text-sm text-gray-700">Class Year: {buyer.class_year || "Not provided"}</p>
                    <p className="text-sm text-gray-700">Major: {buyer.major || "Not provided"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <ListingReportModal
        isOpen={showListingReport}
        onClose={() => setShowListingReport(false)}
        targetType="listing"
        targetId={listing.id}
      />

      {listing.user && (
        <ListingReportModal
          isOpen={showSellerReport}
          onClose={() => setShowSellerReport(false)}
          targetType="user"
          targetId={listing.user.id}
        />
      )} 
    </div>
    </AuthGate>
  );
}
