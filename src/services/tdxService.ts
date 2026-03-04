/**
 * TDX 運輸資料流通服務 - 停車場 API
 *
 * API 端點：
 *   GET /v1/Parking/OffStreet/CarPark/NearBy
 *   https://tdx.transportdata.tw/api/advanced/v1/Parking/OffStreet/CarPark/NearBy
 *
 * 必要參數：
 *   $spatialFilter=nearby({lat},{lng},{distanceInMeters})  (最大 1000m)
 *   $format=JSON
 *
 * 可選參數：
 *   $select  - 欄位篩選
 *   $filter  - 資料過濾
 *   $orderby - 排序
 *   $top     - 取前 N 筆（預設 30）
 *
 * 回傳欄位（CarPark）：
 *   CarParkID, CarParkName (Zh_tw/En), CarParkPosition (lat/lng),
 *   Address, City, TownName, CarParkType, ChargeTypes,
 *   LiveOccuppancyAvailable (0/1), WheelchairAccessible, EVRechargingAvailable
 */

import type { ParkingLot } from '../data/types';

const TDX_BASE = 'https://tdx.transportdata.tw';
const TOKEN_URL = `${TDX_BASE}/auth/realms/TDXConnect/protocol/openid-connect/token`;
const NEARBY_URL = `${TDX_BASE}/api/advanced/v1/Parking/OffStreet/CarPark/NearBy`;

// 從 .env 讀取（VITE_ 前綴的環境變數）
const CLIENT_ID = import.meta.env.VITE_TDX_CLIENT_ID || '';
const CLIENT_SECRET = import.meta.env.VITE_TDX_CLIENT_SECRET || '';

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(CLIENT_ID)}&client_secret=${encodeURIComponent(CLIENT_SECRET)}`,
  });

  if (!res.ok) throw new Error(`TDX auth failed: ${res.status}`);

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken!;
}

interface TDXCarPark {
  CarParkID: string;
  CarParkName: { Zh_tw?: string; En?: string };
  CarParkPosition: {
    PositionLat: number;
    PositionLon: number;
  };
  Address?: string;
  City?: string;
  TownName?: string;
  FareDescription?: string;
  LiveOccuppancyAvailable?: number;
}

/**
 * 取得指定座標附近的停車場
 * @param lat 緯度
 * @param lng 經度
 * @param radiusMeters 搜尋半徑（最大 1000m，預設 500m）
 * @param top 取前 N 筆（預設 5）
 */
export async function fetchNearbyParking(
  lat: number,
  lng: number,
  radiusMeters = 500,
  top = 5
): Promise<ParkingLot[]> {
  // 如果沒有設定 API 金鑰，回傳空陣列（fallback 到 mock 資料）
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.warn('[TDX] 未設定 API 金鑰，使用 mock 資料');
    return [];
  }

  const token = await getToken();

  const params = new URLSearchParams({
    $spatialFilter: `nearby(${lat},${lng},${Math.min(radiusMeters, 1000)})`,
    $top: String(top),
    $format: 'JSON',
  });

  const res = await fetch(`${NEARBY_URL}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`TDX API failed: ${res.status}`);

  const data: TDXCarPark[] = await res.json();

  return data.map((cp, idx) => ({
    name: cp.CarParkName?.Zh_tw || cp.CarParkName?.En || cp.CarParkID,
    status: cp.LiveOccuppancyAvailable === 1 ? '有即時資料' : '未知',
    statusColor: cp.LiveOccuppancyAvailable === 1 ? 'text-green-500' : 'text-slate-400',
    walkTime: `${Math.max(1, Math.round((idx + 1) * 2))} min`,
    price: cp.FareDescription || '洽停車場',
    coordinates: {
      lat: cp.CarParkPosition.PositionLat,
      lng: cp.CarParkPosition.PositionLon,
    },
  }));
}
