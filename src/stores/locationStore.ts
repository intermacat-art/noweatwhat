import { create } from 'zustand';

interface LocationState {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
  ready: boolean; // true once we have a real or cached position
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
    // Cache valid for 24 hours
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
  // On store init: load cached location immediately
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
        set({ lat: DEFAULT_LAT, lng: DEFAULT_LNG, loading: false, error: 'Geolocation not supported', ready: true });
        return;
      }
      set({ loading: true, error: null });

      // Step 1: Fast coarse location (usually <1 sec)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          set({ lat: latitude, lng: longitude, loading: false, ready: true });
          saveCachedLocation(latitude, longitude);

          // Step 2: Background high-accuracy update
          navigator.geolocation.getCurrentPosition(
            (precise) => {
              const { latitude: pLat, longitude: pLng } = precise.coords;
              set({ lat: pLat, lng: pLng });
              saveCachedLocation(pLat, pLng);
            },
            () => { /* coarse is good enough */ },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
          );
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          // Fall back to cache or default
          const fallback = loadCachedLocation();
          set({
            lat: fallback?.lat ?? DEFAULT_LAT,
            lng: fallback?.lng ?? DEFAULT_LNG,
            loading: false,
            error: err.message,
            ready: true,
          });
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
    },
  };
});

// Auto-request location on store creation
useLocationStore.getState().requestLocation();

export function useCoords() {
  const { lat, lng } = useLocationStore();
  return { lat: lat ?? DEFAULT_LAT, lng: lng ?? DEFAULT_LNG };
}
