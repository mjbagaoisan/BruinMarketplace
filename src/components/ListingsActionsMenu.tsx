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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


interface ListingsActionsMenuProps {
  listingId: string;
  currentStatus: ListingStatus;
  onListingUpdated?: (listing: Listing) => void;
}

export function ListingsActionsMenu( {listingId, currentStatus, onListingUpdated}: ListingsActionsMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [listingData, setListingData] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  const handleDeleteListing = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/${listingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete listing");
      }
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete listing ", error);
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
              disabled={isLoading}
              className="cursor-pointer"
            >
              Edit listing
            </DropdownMenuItem>
          </EditListing>
        )}

        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()} 
          onClick={() => setDeleteOpen(true)}
          disabled={isLoading}
          className="cursor-pointer text-red-600 focus:text-red-600 aria-disabled:opacity-50 aria-disabled:pointer-events-none"
        >
          Delete Listing
        </DropdownMenuItem >
      </DropdownMenuContent>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>

            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteListing}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
}

export default ListingsActionsMenu;
