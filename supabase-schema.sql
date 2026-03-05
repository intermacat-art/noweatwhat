-- Supabase SQL schema for restaurant cache
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

-- Restaurant cache table
create table if not exists restaurant_cache (
  id bigint generated always as identity primary key,
  place_id text not null,
  name text not null,
  rating real default 0,
  price_level text default 'PRICE_LEVEL_UNSPECIFIED',
  latitude double precision not null,
  longitude double precision not null,
  address text default '',
  photo_refs jsonb default '[]'::jsonb,
  open_now boolean,
  user_ratings_total integer default 0,
  cached_at timestamptz default now(),
  unique(place_id)
);

-- Search area cache — tracks which areas have been searched recently
create table if not exists search_area_cache (
  id bigint generated always as identity primary key,
  geohash text not null,        -- geohash of search center (precision 5 ~ 5km grid)
  keyword text default '',       -- search keyword (empty = generic nearby)
  radius integer default 1000,
  cached_at timestamptz default now(),
  unique(geohash, keyword)
);

-- Index for spatial queries
create index if not exists idx_restaurant_cache_coords
  on restaurant_cache (latitude, longitude);

-- Index for geohash lookups
create index if not exists idx_search_area_geohash
  on search_area_cache (geohash, keyword);

-- Index for TTL cleanup
create index if not exists idx_restaurant_cache_cached_at
  on restaurant_cache (cached_at);

create index if not exists idx_search_area_cached_at
  on search_area_cache (cached_at);

-- Auto-cleanup old cache (optional — run as a cron job or Supabase Edge Function)
-- DELETE FROM restaurant_cache WHERE cached_at < now() - interval '7 days';
-- DELETE FROM search_area_cache WHERE cached_at < now() - interval '1 day';
