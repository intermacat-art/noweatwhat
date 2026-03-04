import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

export function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

/**
 * Simple geohash encoder (precision 5 ≈ 5km grid cells)
 */
export function encodeGeohash(lat: number, lng: number, precision = 5): string {
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let minLat = -90, maxLat = 90, minLng = -180, maxLng = 180;
  let isLng = true;
  let bit = 0;
  let ch = 0;
  let hash = '';

  while (hash.length < precision) {
    if (isLng) {
      const mid = (minLng + maxLng) / 2;
      if (lng >= mid) { ch = ch * 2 + 1; minLng = mid; }
      else { ch = ch * 2; maxLng = mid; }
    } else {
      const mid = (minLat + maxLat) / 2;
      if (lat >= mid) { ch = ch * 2 + 1; minLat = mid; }
      else { ch = ch * 2; maxLat = mid; }
    }
    isLng = !isLng;
    bit++;
    if (bit === 5) {
      hash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }
  return hash;
}

/** Cache TTL in hours */
const AREA_TTL_HOURS = 6;

export interface CachedPlace {
  place_id: string;
  name: string;
  rating: number;
  price_level: string;
  latitude: number;
  longitude: number;
  address: string;
  photo_refs: string[];
  open_now: boolean | null;
  user_ratings_total: number;
}

/**
 * Check if an area search is cached and fresh
 */
export async function getCachedArea(
  lat: number, lng: number, keyword: string, radius: number
): Promise<CachedPlace[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const geohash = encodeGeohash(lat, lng);
  const cutoff = new Date(Date.now() - AREA_TTL_HOURS * 60 * 60 * 1000).toISOString();

  // Check if this area was recently searched
  const { data: area } = await supabase
    .from('search_area_cache')
    .select('id, cached_at')
    .eq('geohash', geohash)
    .eq('keyword', keyword || '')
    .gte('cached_at', cutoff)
    .single();

  if (!area) return null;

  // Fetch cached restaurants in this area (within radius * 1.5 for overlap)
  const degDelta = (radius * 1.5) / 111320; // rough meters→degrees
  const { data: places } = await supabase
    .from('restaurant_cache')
    .select('*')
    .gte('latitude', lat - degDelta)
    .lte('latitude', lat + degDelta)
    .gte('longitude', lng - degDelta)
    .lte('longitude', lng + degDelta)
    .gte('cached_at', cutoff)
    .limit(50);

  return (places as CachedPlace[]) || null;
}

/**
 * Save search results to cache
 */
export async function saveCachedArea(
  lat: number, lng: number, keyword: string, radius: number,
  places: CachedPlace[]
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const geohash = encodeGeohash(lat, lng);

  // Upsert area cache
  await supabase
    .from('search_area_cache')
    .upsert(
      { geohash, keyword: keyword || '', radius, cached_at: new Date().toISOString() },
      { onConflict: 'geohash,keyword' }
    );

  // Upsert restaurant records
  if (places.length > 0) {
    await supabase
      .from('restaurant_cache')
      .upsert(
        places.map((p) => ({ ...p, cached_at: new Date().toISOString() })),
        { onConflict: 'place_id' }
      );
  }
}
