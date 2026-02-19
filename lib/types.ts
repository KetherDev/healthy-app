export type EstablishmentType = 'gym' | 'yoga' | 'pilates' | 'restaurant' | 'meditation' | 'crossfit';

export interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Establishment {
  id: string;
  name: string;
  type: EstablishmentType;
  description: string | null;
  image_url: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  review_count: number;
  amenities: string[] | null;
  price_range: string | null;
  featured: boolean;
  created_at: string;
}

export interface ClassSession {
  id: string;
  establishment_id: string;
  name: string;
  description: string | null;
  instructor: string | null;
  instructor_image: string | null;
  duration: number;
  price: number;
  max_spots: number | null;
  level: string | null;
  scheduled_at: string;
  created_at: string;
  establishment?: Establishment;
}

export interface Booking {
  id: string;
  user_id: string;
  class_id: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  total_paid: number;
  created_at: string;
  class?: ClassSession;
}

export interface Review {
  id: string;
  user_id: string;
  establishment_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  establishment_id: string;
  created_at: string;
}
