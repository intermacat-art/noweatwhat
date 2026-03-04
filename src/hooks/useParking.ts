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
 * 使用 Vercel Serverless → TDX API，失敗時 fallback 到 mock 資料
 */
export function useParking(target: ParkingTarget | null | undefined) {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'mock' | 'tdx' | 'loading'>('loading');

  const lat = target?.lat;
  const lng = target?.lng;
  const fallbackLots = target?.fallbackLots;

  useEffect(() => {
    if (lat == null || lng == null) return;
    let cancelled = false;

    setLoading(true);
    setSource('loading');

    fetchNearbyParking(lat, lng, 500, 5)
      .then((tdxLots) => {
        if (!cancelled) {
          if (tdxLots.length > 0) {
            setLots(tdxLots);
            setSource('tdx');
          } else if (fallbackLots && fallbackLots.length > 0) {
            setLots(fallbackLots);
            setSource('mock');
          } else {
            setLots([]);
            setSource('mock');
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          if (fallbackLots && fallbackLots.length > 0) {
            setLots(fallbackLots);
            setSource('mock');
          } else {
            setLots([]);
            setSource('mock');
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [lat, lng, fallbackLots]);

  return { lots, loading, source };
}
