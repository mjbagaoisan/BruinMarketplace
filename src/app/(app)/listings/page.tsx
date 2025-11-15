"use client";

import React from 'react'
import CreateListing from '@/components/CreateListing'
import ListingCard from '@/components/ListingCard'

export default function Page() {
    return(
        <ol>
            <li>Listing 1</li>
            <li>Listing 2</li>
            <li>Listing 3</li>
            <CreateListing/>
            <ListingCard title="Lightning McQueen Crocs" price="$450" description="hmu 858-493-1232" imgUrls={["/listingcard_sample2.jpg"]}/>
        </ol>
    )
}