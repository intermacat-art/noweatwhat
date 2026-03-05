import { create } from 'zustand';

interface LocationState {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
  ready: boolean;
  requestLocation: () => void;
}

// Default fallback: Taipei 101
const DEFAULT_LAT = 25.033;
const DEFAULT_LNG = 121.565;

const STORAGE_KEY = 'noweatwhat_last_location';

function loadCachedLocation(): { lat: number; lng: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { lat, lng, ts } = JSON.parse(raw);
    if (Date.now() - ts > 24 * 60 * 60 * 1000) return null;
    if (typeof lat === 'number' && typeof lng === 'number') return { lat, lng };
  } catch { /* ignore */ }
  return null;
}

function saveCachedLocation(lat: number, lng: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng, ts: Date.now() }));
  } catch { /* ignore */ }
}

export const useLocationStore = create<LocationState>((set, get) => {
  const cached = loadCachedLocation();

  return {
    lat: cached?.lat ?? null,
    lng: cached?.lng ?? null,
    loading: false,
    error: null,
    ready: cached !== null,
    requestLocation: () => {
      if (get().loading) return;
      if (!navigator.geolocation) {
        set({ lat: DEFAULT_LAT, lng: DEFAULT_LNG, loading: false, error: '此裝置不支援定位', ready: true });
        return;
      }
      set({ loading: true, error: null });

      // Try high accuracy first with generous timeout
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          set({ lat: latitude, lng: longitude, loading: false, ready: true, error: null });
          saveCachedLocation(latitude, longitude);
        },
        () => {
          // High accuracy failed — try low accuracy as fallback
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              set({ lat: latitude, lng: longitude, loading: false, ready: true, error: null });
              saveCachedLocation(latitude, longitude);
            },
            (err) => {
              console.warn('Geolocation error:', err.message);
              const fallback = loadCachedLocation();
              set({
                lat: fallback?.lat ?? DEFAULT_LAT,
                lng: fallback?.lng ?? DEFAULT_LNG,
                loading: false,
                error: err.code === 1 ? '請允許定位權限' : '定位失敗，使用預設位置',
                ready: true,
              });
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    },
  };
});

// Auto-request on app start
if (typeof window !== 'undefined') {
  useLocationStore.getState().requestLocation();
}

export function useCoords() {
  const { lat, lng } = useLocationStore();
  return { lat: lat ?? DEFAULT_LAT, lng: lng ?? DEFAULT_LNG };
}
