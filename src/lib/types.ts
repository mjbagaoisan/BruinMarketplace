
interface Media {
  id: string;
  listing_id: string;
  url: string;
  type: string;
  user_id: string;
}

interface Seller {
  id: string;
  name: string;
  profile_image_url?: string;
  is_verified: boolean;
  created_at: string;
}

interface InterestedUser {
  id: string;
  name?: string;
  email?: string;
  phone_number?: string;
  class_year?: number;
  major?: string;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  description: string;
  condition: string;
  category: string;
  status: string;
  location: string;
  preferred_payment: string;
  interested_users?: string[];
  interested_user_details?: InterestedUser[];
  created_at: string;
  media?: Media[];
  user?: Seller;
}

export type UserProfile = {
  name: string;
  major: string | null;
  hide_major: boolean;
  class_year: number | null;
  hide_class_year: boolean;
  profile_image_url: string | null;
  created_at: string;
};

export interface SearchResponse {
  results: Listing[];
  total: number;
  page: number;
  limit: number;
}