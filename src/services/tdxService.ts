/**
 * TDX 停車場服務 — 透過 Vercel Serverless Proxy
 * API 金鑰藏在伺服器端，前端只呼叫 /api/parking/nearby
 */

import type { ParkingLot } from '../data/types';

export async function fetchNearbyParking(
  lat: number,
  lng: number,
  radiusMeters = 500,
  top = 5
): Promise<ParkingLot[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radiusMeters),
    top: String(top),
  });

  const res = await fetch(`/api/parking/nearby?${params}`);
  if (!res.ok) throw new Error(`Parking API failed: ${res.status}`);

  const data = await res.json();
  return data.lots || [];
}
