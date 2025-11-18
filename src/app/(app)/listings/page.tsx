"use client";

import React from 'react'
import CreateListing from '@/components/CreateListing'
import ListingCard, { ListingData } from '@/components/ListingCard'

import { useState } from "react";

export default function Page() {

    const [listings, setListings] = useState<ListingData[]>([])

    function addListing(newListing: ListingData) { //ListingData imported from ListingCard
        setListings([...listings, newListing])
    }

    return(
        <ol>
            <CreateListing onListingSubmit={addListing} />
            {listings.map((listing, index) => (
                <ListingCard key={index} title={listing.title} price={listing.price} description={listing.description} location={listing.location} />
            ))}
        </ol>
    )
}