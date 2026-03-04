import { useState, useEffect } from 'react';
import type { ParkingLot } from '../data/types';
import { fetchNearbyParking } from '../services/tdxService';

interface ParkingTarget {
  lat: number;
  lng: number;
  fallbackLots?: ParkingLot[];
}

/**
 * 取得座標附近的停車場資料
 * 優先使用 TDX API，失敗時 fallback 到 mock 資料
 */
export function useParking(target: ParkingTarget | null | undefined) {
  const [lots, setLots] = useState<ParkingLot[]>(target?.fallbackLots ?? []);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'mock' | 'tdx'>('mock');

  const lat = target?.lat;
  const lng = target?.lng;

  useEffect(() => {
    if (lat == null || lng == null) return;
    let cancelled = false;

    setLoading(true);
    fetchNearbyParking(lat, lng, 500, 5)
      .then((tdxLots) => {
        if (!cancelled && tdxLots.length > 0) {
          setLots(tdxLots);
          setSource('tdx');
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [lat, lng]);

  return { lots, loading, source };
}
