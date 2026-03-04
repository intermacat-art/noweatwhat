import { useState, useEffect } from 'react';
import type { Restaurant, ParkingLot } from '../data/types';
import { fetchNearbyParking } from '../services/tdxService';

/**
 * 取得餐廳附近的停車場資料
 * 優先使用 TDX API，失敗時 fallback 到 mock 資料
 */
export function useParking(restaurant: Restaurant | null | undefined) {
  const [lots, setLots] = useState<ParkingLot[]>(restaurant?.parkingLots ?? []);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'mock' | 'tdx'>('mock');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!restaurant) return;
      setLoading(true);
      try {
        const tdxLots = await fetchNearbyParking(
          restaurant.coordinates.lat,
          restaurant.coordinates.lng,
          500,
          5
        );
        if (!cancelled && tdxLots.length > 0) {
          setLots(tdxLots);
          setSource('tdx');
        }
      } catch {
        // TDX 失敗，保持 mock 資料
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [restaurant?.id, restaurant?.coordinates.lat, restaurant?.coordinates.lng]);

  return { lots, loading, source };
}
