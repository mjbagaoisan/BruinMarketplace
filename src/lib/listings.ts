
const apiBase = process.env.NEXT_PUBLIC_API_URL;

export type ListingStatus = 'active' | 'sold' | 'traded' | 'removed';

export interface Listing {
  id: string;
  status: ListingStatus;
  [key: string]: any;
}

export async function updateListingStatus(
  listingId: string,
  status: ListingStatus
): Promise<Listing> {
  const res = await fetch(`${apiBase}/api/listings/${listingId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    let message = 'Failed to update listing status';
    try {
      const error = await res.json();
      if ((error as any)?.error || (error as any)?.message) {
        message = (error as any).error || (error as any).message;
      }
    } catch {
    }
    throw new Error(message);
  }

  return res.json();
}