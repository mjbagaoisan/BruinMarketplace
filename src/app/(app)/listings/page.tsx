"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardMedia, CardTitle, CardPrice } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import DebouncedSearch from "@/components/SearchBar";
import CreateListing from '@/components/CreateListing';

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
  location?: string;
  created_at: string;
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

  // Filter state
  const [conditionFilter, setConditionFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sort, setSort] = useState<string>("date_desc");

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [conditionFilter, locationFilter, categoryFilter, sort]);

  const fetchListings = async () => {
    try {
      // Build query params from filter state
      const params = new URLSearchParams();
      if (conditionFilter) params.set("condition", conditionFilter);
      if (locationFilter) params.set("location", locationFilter);
      if (categoryFilter) params.set("category", categoryFilter)
      if (sort) params.set("sort", sort);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/listings?${params.toString()}`;

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

  const handleSearchResults = useCallback((data: Listing[] | SearchResponse) => {
    setSearchResults(Array.isArray(data) ? data : data.results);
  }, []);

  const displayListings = searchResults.length > 0 ? searchResults : listings;

  const formatDate = (dateString: string) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return "Today";
    }
    if (diffDays === 1) {
      return "1 day ago";
    }
    return `${diffDays} days ago`;
  };

  const formatCondition = (condition: string) => {
    return condition.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        {/* Create New Listing */}
        <div className="fixed bottom-10 right-10">
          <CreateListing>
            <div className="flex flex-col gap-8">
              <Button variant="outline" size="icon-lg" className="rounded-full h-14 w-14">
                <PlusIcon />
              </Button>
            </div>
          </CreateListing>
        </div>
        {/* Centered Search Bar */}
        <div className="flex justify-center mb-8">
          <DebouncedSearch onResults={handleSearchResults} />
        </div>

        {/* Filter Feature */}
        <div className="container mx-auto px-2 mb-6 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            {/* Condition Filter */}
            <Select
              value={conditionFilter || "all"}
              onValueChange={(value) =>
                setConditionFilter(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Conditions</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="like_new">Like New</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
            {/* Locaiton Filter */}
            <Select
              value={locationFilter || "all"}
              onValueChange={(value) =>
                setLocationFilter(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Locations</SelectItem>
                <SelectItem value="hill">The Hill</SelectItem>
                <SelectItem value="on campus">On Campus</SelectItem>
                <SelectItem value="off campus">Off Campus</SelectItem>
              </SelectContent>
            </Select>
            {/* Category Filter */}
            <Select
              value={categoryFilter || "all"}
              onValueChange={(value) =>
                setCategoryFilter(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Categories</SelectItem>
                <SelectItem value="textbooks">Textbooks</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="parking">Parking</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="tickets">Tickets</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSort((prev) => (prev === "date_desc" ? "date_asc" : "date_desc"))
              }
            >
              Sort: {sort === "date_desc" ? "Newest first" : "Oldest first"}
            </Button>
          </div>
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
                <Link key={listing.id} href={`/listings/${listing.id}`} className="block w-full sm:w-60">
                  <Card className="w-full h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col mb-7">
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

export default ListingsPage;
