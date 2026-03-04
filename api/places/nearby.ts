import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCachedArea, saveCachedArea, type CachedPlace } from '../_lib/supabaseCache.js';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

interface GooglePlaceResult {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ error: 'Google API key not configured' });
  }

  const { lat, lng, keyword, radius = '1000' } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  const latitude = Number(lat);
  const longitude = Number(lng);
  const searchRadius = Number(radius);
  const kw = keyword ? String(keyword) : '';

  try {
    // 1) Check Supabase cache first
    const cached = await getCachedArea(latitude, longitude, kw, searchRadius);
    if (cached && cached.length > 0) {
      const places: GooglePlaceResult[] = cached.map((c) => ({
        placeId: c.place_id,
        name: c.name,
        rating: c.rating,
        priceLevel: c.price_level,
        location: { latitude: c.latitude, longitude: c.longitude },
        photoRefs: c.photo_refs || [],
        openNow: c.open_now,
        userRatingsTotal: c.user_ratings_total,
        address: c.address,
      }));
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
      return res.status(200).json({ places, source: 'cache' });
    }

    // 2) Cache miss — call Google Places API
    let url: string;
    let body: Record<string, unknown>;
    let fieldMask: string;

    if (kw) {
      url = 'https://places.googleapis.com/v1/places:searchText';
      body = {
        textQuery: kw,
        maxResultCount: 20,
        languageCode: 'zh-TW',
        locationBias: {
          circle: {
            center: { latitude, longitude },
            radius: searchRadius,
          },
        },
      };
      fieldMask = [
        'places.id',
        'places.displayName',
        'places.rating',
        'places.priceLevel',
        'places.location',
        'places.photos',
        'places.currentOpeningHours',
        'places.userRatingCount',
        'places.formattedAddress',
      ].join(',');
    } else {
      url = 'https://places.googleapis.com/v1/places:searchNearby';
      body = {
        includedTypes: ['restaurant'],
        maxResultCount: 20,
        languageCode: 'zh-TW',
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius: searchRadius,
          },
        },
      };
      fieldMask = [
        'places.id',
        'places.displayName',
        'places.rating',
        'places.priceLevel',
        'places.location',
        'places.photos',
        'places.currentOpeningHours',
        'places.userRatingCount',
        'places.formattedAddress',
      ].join(',');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API error:', errorText);
      return res.status(response.status).json({ error: 'Google API error', detail: errorText });
    }

    const data = await response.json();
    const places: GooglePlaceResult[] = (data.places || []).map((place: Record<string, unknown>) => ({
      placeId: place.id,
      name: (place.displayName as Record<string, string>)?.text || '',
      rating: place.rating || 0,
      priceLevel: place.priceLevel || 'PRICE_LEVEL_UNSPECIFIED',
      location: place.location,
      photoRefs: ((place.photos as Array<Record<string, string>>) || [])
        .slice(0, 3)
        .map((p) => p.name),
      openNow: (place.currentOpeningHours as Record<string, unknown>)?.openNow ?? null,
      userRatingsTotal: place.userRatingCount || 0,
      address: place.formattedAddress || '',
    }));

    // 3) Save to Supabase cache (non-blocking)
    const cacheData: CachedPlace[] = places.map((p) => ({
      place_id: p.placeId,
      name: p.name,
      rating: p.rating,
      price_level: p.priceLevel,
      latitude: p.location.latitude,
      longitude: p.location.longitude,
      address: p.address,
      photo_refs: p.photoRefs,
      open_now: p.openNow,
      user_ratings_total: p.userRatingsTotal,
    }));
    saveCachedArea(latitude, longitude, kw, searchRadius, cacheData).catch((err) => {
      console.error('Cache save error:', err);
    });

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ places, source: 'google' });
  } catch (error) {
    console.error('Nearby search error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
