"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardMedia, CardTitle, CardPrice } from "@/components/ui/card";
import DebouncedSearch from "@/components/SearchBar";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

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
  created_at: string;
  user_id: string;
  media?: Media[];
}

interface SearchResponse {
  results: Listing[];
  total: number;
  page: number;
  limit: number;
}

function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Listing[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings`, {
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

  const handleSearchResults = useCallback((data: Listing[] | SearchResponse) => {
    setSearchResults(Array.isArray(data) ? data : data.results);
  }, []);

  const displayListings = searchResults.length > 0 ? searchResults : listings;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        {/* Centered Search Bar */}
        <div className="flex justify-center mb-8">
          <DebouncedSearch onResults={handleSearchResults} />
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
                  : "No listings available."}``
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {displayListings.map((listing) => (
                <Card key={listing.id} className="w-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardMedia>
                    {listing.media && listing.media.length > 0 ? (
                      <img 
                        src={listing.media[0].url} 
                        alt={listing.title} 
                        className="w-full h-full object-cover"
                      />
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
                      <div className="text-sm text-gray-500 capitalize">Condition: {listing.condition}</div>
                    )}
                    <button
                      type="button"
                      className={`mt-auto w-full rounded py-2 text-sm font-semibold transition-colors ${
                        user?.userId === listing.user_id
                          ? "bg-gray-200 text-black cursor-default"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                      disabled={user?.userId === listing.user_id}
                    >
                      {user?.userId === listing.user_id ? "Your Listing" : "I'm Interested"}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ListingsPage;
