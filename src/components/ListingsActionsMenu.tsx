"use client";

import React, { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  updateListingStatus,
  ListingStatus,
  Listing,
} from "@/lib/listings";
import Link from "next/link";
import EditListing from "@/components/EditListing";


interface ListingsActionsMenuProps {
  listingId: string;
  currentStatus: ListingStatus;
  onListingUpdated?: (listing: Listing) => void;
}

export function ListingsActionsMenu( {listingId, currentStatus, onListingUpdated}: ListingsActionsMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [listingData, setListingData] = useState<any | null>(null);

  const isSold = currentStatus === "sold";

  // get listing initial data
  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${listingId}`,
        { credentials: "include" }
      );
      if (res.ok) setListingData(await res.json());
    }
    fetchData();
  }, [listingId]);

  const handleMarkAsSold = async () => {
    try {
      setIsLoading(true);
      const updated = await updateListingStatus(listingId, "sold");
      if (onListingUpdated) {
        onListingUpdated(updated);
      }
    } catch (error) {
      console.error("Failed to mark listing as sold", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={isLoading}
          aria-label="Listing actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={handleMarkAsSold}
          disabled={isSold || isLoading}
        >
          Mark as sold
        </DropdownMenuItem >

        {listingData && (
          <EditListing listingId={listingId} initialData={listingData}>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()} 
              className="cursor-pointer"
            >
              Edit listing
            </DropdownMenuItem>
          </EditListing>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ListingsActionsMenu;
