import type { VercelRequest, VercelResponse } from '@vercel/node';

const TDX_BASE = 'https://tdx.transportdata.tw';
const TOKEN_URL = `${TDX_BASE}/auth/realms/TDXConnect/protocol/openid-connect/token`;
const NEARBY_URL = `${TDX_BASE}/api/advanced/v1/Parking/OffStreet/CarPark/NearBy`;

const CLIENT_ID = process.env.TDX_CLIENT_ID || '';
const CLIENT_SECRET = process.env.TDX_CLIENT_SECRET || '';

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
  CarParkPosition: { PositionLat: number; PositionLon: number };
  Address?: string;
  FareDescription?: string;
  LiveOccuppancyAvailable?: number;
}

interface TDXAvailability {
  CarParkID: string;
  NumberOfAvailableSpaces?: number;
  NumberOfSpaces?: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lat, lng, radius = '500', top = '5' } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(200).json({ lots: [], source: 'unavailable' });
  }

  try {
    const token = await getToken();
    const r = Math.min(Number(radius), 1000);

    // Fetch parking lots
    const params = new URLSearchParams({
      $spatialFilter: `nearby(${lat},${lng},${r})`,
      $top: String(top),
      $format: 'JSON',
    });

    const parkRes = await fetch(`${NEARBY_URL}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!parkRes.ok) throw new Error(`TDX API failed: ${parkRes.status}`);
    const parks: TDXCarPark[] = await parkRes.json();

    // Try to fetch live availability
    let availMap: Record<string, TDXAvailability> = {};
    try {
      const availUrl = `${TDX_BASE}/api/advanced/v1/Parking/OffStreet/ParkingAvailability/NearBy`;
      const availRes = await fetch(`${availUrl}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (availRes.ok) {
        const availData: TDXAvailability[] = await availRes.json();
        availMap = Object.fromEntries(availData.map((a) => [a.CarParkID, a]));
      }
    } catch {
      // Availability data is optional
    }

    const lots = parks.map((cp, idx) => {
      const avail = availMap[cp.CarParkID];
      let status = '查詢中';
      let statusColor = 'text-slate-400';

      if (avail && avail.NumberOfAvailableSpaces !== undefined && avail.NumberOfAvailableSpaces >= 0) {
        const spaces = avail.NumberOfAvailableSpaces;
        if (spaces > 20) {
          status = `充裕 (${spaces}位)`;
          statusColor = 'text-green-500';
        } else if (spaces > 5) {
          status = `餘位少 (${spaces}位)`;
          statusColor = 'text-yellow-500';
        } else if (spaces > 0) {
          status = `即將滿 (${spaces}位)`;
          statusColor = 'text-orange-500';
        } else {
          status = '已滿';
          statusColor = 'text-red-500';
        }
      } else if (cp.LiveOccuppancyAvailable === 1) {
        status = '有即時資料';
        statusColor = 'text-green-500';
      } else {
        status = '無即時資料';
        statusColor = 'text-slate-400';
      }

      return {
        name: cp.CarParkName?.Zh_tw || cp.CarParkName?.En || cp.CarParkID,
        status,
        statusColor,
        walkTime: `${Math.max(1, Math.round((idx + 1) * 2))} min`,
        price: cp.FareDescription || '洽停車場',
        coordinates: {
          lat: cp.CarParkPosition.PositionLat,
          lng: cp.CarParkPosition.PositionLon,
        },
      };
    });

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({ lots, source: 'tdx' });
  } catch (error) {
    console.error('TDX parking error:', error);
    return res.status(200).json({ lots: [], source: 'error' });
  }
}
