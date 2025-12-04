"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardMedia, CardTitle, CardPrice } from "@/components/ui/card";
import { ListingsActionsMenu } from "@/components/ListingsActionsMenu";
import type { ListingStatus } from "@/lib/listings";
import DebouncedSearch from "@/components/SearchBar";
import Header from "@/components/Header";

interface Media {
  id: string;
  listing_id: string;
  url: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  description?: string;
  condition?: string;
  category?: string;
  status: ListingStatus;
  created_at: string;
  media?: Media[];
}

interface SearchResponse {
  results: Listing[];
  total: number;
  page: number;
  limit: number;
}

function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Listing[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/me`, {
        credentials: 'include',
      });

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

  const handleSearchResults = useCallback((data: Listing[] | SearchResponse) => {
    setSearchResults(Array.isArray(data) ? data : data.results);
  }, []);

  const displayListings = searchResults.length > 0 ? searchResults : listings;

  const formatCondition = (condition: string) => {
    return condition.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        {/* Centered Search Bar */}
        <div className="flex justify-center mb-8">
          <DebouncedSearch scope = "me" onResults={handleSearchResults} />  
          {/* Todo maybe, IDK why showing an error but code still works(?) I didn't change this lol */}
        </div>

        {/* Listings Grid */}
        <div className="container mx-auto px-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-lg text-gray-600">Loading listings...</div>
            </div>
          ) : displayListings.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-lg text-gray-600">
                {searchResults.length === 0 && listings.length > 0 
                  ? "No listings found matching your search." 
                  : "No listings available."}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {displayListings.map((listing) => (
                <div key={listing.id} className="w-full sm:w-60">
                  <Card className="w-full h-full hover:shadow-lg transition-shadow flex flex-col mb-7">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="flex flex-col flex-grow"
                    >
                      <CardMedia>
                        {listing.media && listing.media.length > 0 ? (
                          /\.(mp4|webm|ogg)(\?|$)/i.test(listing.media[0].url) ? (
                            <video
                              src={listing.media[0].url}
                              className="w-full h-full object-cover"
                              muted
                              loop
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
                      <div className="p-4 pb-2 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="truncate flex-1">{listing.title}</CardTitle>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${
                              listing.status === "sold"
                                ? "bg-red-50 text-red-600 border border-red-100"
                                : listing.status === "removed"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-green-50 text-green-600 border border-green-100"
                            }`}
                          >
                            {listing.status === "removed" ? "Reported" : listing.status}
                          </span>
                        </div>
                        <CardPrice>${listing.price.toFixed(2)}</CardPrice>
                        {listing.condition && (
                          <div className="text-sm text-gray-500">
                            Condition: {formatCondition(listing.condition)}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex justify-end px-2 pb-2">
                      <ListingsActionsMenu
                        listingId={listing.id}
                        currentStatus={listing.status}
                        onListingUpdated={(updated) => {
                          setListings((prev) =>
                            prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l))
                          );
                        }}
                      />
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
export default MyListingsPage;
