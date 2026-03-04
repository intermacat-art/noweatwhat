import type { CategoryName, Restaurant } from '../data/types';
import { CATEGORY_KEYWORD_MAP } from '../data/types';

export interface GooglePlace {
  placeId: string;
  name: string;
  rating: number;
  priceLevel: string;
  location: { latitude: number; longitude: number };
  photoRefs: string[];
  openNow: boolean | null;
  userRatingsTotal: number;
  address: string;
}

export interface GooglePlaceDetail extends GooglePlace {
  openingHours: string[];
  reviews: { author: string; rating: number; text: string; time: string }[];
  website: string | null;
  phone: string | null;
}

function priceLevelToNumber(level: string): 1 | 2 | 3 | 4 {
  switch (level) {
    case 'PRICE_LEVEL_FREE':
    case 'PRICE_LEVEL_INEXPENSIVE': return 1;
    case 'PRICE_LEVEL_MODERATE': return 2;
    case 'PRICE_LEVEL_EXPENSIVE': return 3;
    case 'PRICE_LEVEL_VERY_EXPENSIVE': return 4;
    default: return 2;
  }
}

function priceLevelToStr(level: number): string {
  return '$'.repeat(level);
}

function distanceStr(lat1: number, lng1: number, lat2: number, lng2: number): string {
  const R = 6371e3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return d < 1000 ? `${Math.round(d)}m` : `${(d / 1000).toFixed(1)}km`;
}

export function getPhotoUrl(photoRef: string, maxwidth = 800): string {
  return `/api/places/photo?ref=${encodeURIComponent(photoRef)}&maxwidth=${maxwidth}`;
}

export async function searchNearby(
  lat: number,
  lng: number,
  category?: CategoryName,
  radius = 1000
): Promise<Restaurant[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
  });

  if (category) {
    params.set('keyword', CATEGORY_KEYWORD_MAP[category]);
  }

  const response = await fetch(`/api/places/nearby?${params}`);
  if (!response.ok) throw new Error('Failed to fetch nearby places');

  const data = await response.json();
  return (data.places as GooglePlace[]).map((place, idx) => {
    const pl = priceLevelToNumber(place.priceLevel);
    return {
      id: 10000 + idx,
      name: place.name,
      category: category ?? '小吃',
      rating: place.rating,
      priceLevel: pl,
      priceStr: priceLevelToStr(pl),
      dist: distanceStr(lat, lng, place.location.latitude, place.location.longitude),
      address: place.address,
      coordinates: { lat: place.location.latitude, lng: place.location.longitude },
      tags: [],
      image: place.photoRefs[0] ? getPhotoUrl(place.photoRefs[0], 400) : 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
      parkingLots: [],
      videos: [],
      articles: [],
      placeId: place.placeId,
      openNow: place.openNow ?? undefined,
      googlePhotos: place.photoRefs,
      userRatingsTotal: place.userRatingsTotal,
    };
  });
}

export async function getDetail(placeId: string): Promise<GooglePlaceDetail> {
  const response = await fetch(`/api/places/detail?placeId=${encodeURIComponent(placeId)}`);
  if (!response.ok) throw new Error('Failed to fetch place detail');
  return response.json();
}
