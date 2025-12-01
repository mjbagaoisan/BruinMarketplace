"use client";

import React, { useState } from "react";
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

interface ListingsActionsMenuProps {
  listingId: string;
  currentStatus: ListingStatus;
  onListingUpdated?: (listing: Listing) => void;
}

export function ListingsActionsMenu({
  listingId,
  currentStatus,
  onListingUpdated,
}: ListingsActionsMenuProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isSold = currentStatus === "sold";

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
        </DropdownMenuItem>
        <DropdownMenuItem>
          Edit Listing
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ListingsActionsMenu;
