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
            <li>Listing 1</li>
            <li>Listing 2</li>
            <li>Listing 3</li>
            <CreateListing onListingSubmit={addListing} />
            {listings.map((listing, index) => (
                <ListingCard key={index} title={listing.title} price={listing.price} description={listing.description} imgUrls={listing.imgUrls} />
            ))}
        </ol>
    )
}